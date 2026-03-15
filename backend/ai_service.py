"""
AI Service — Meal recommendation engine.

Architecture:
  - Phase 1 (now):  Rule-based scoring (no ML needed, works immediately)
  - Phase 2 (2029): Plug in trained ML model by setting AI_ENABLED=true
                    and pointing AI_MODEL_PATH to your checkpoint
  - Phase 3 (2030): LLM-powered chatbot (set ANTHROPIC_API_KEY or OPENAI_API_KEY)

To add your own model:
  1. Train model, save to ml/checkpoints/
  2. Implement ModelAdapter in app/ai/models/your_model.py
  3. Set AI_ENABLED=true in .env
  4. The router below will auto-use it
"""
import random
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.logging import setup_logging
from app.models.models import FoodItem, MealLog, UserProfile
from app.schemas.schemas import (
    MealSuggestionRequest, MealSuggestionResponse,
    SuggestionItem, FoodItemResponse,
    ChatRequest, ChatResponse,
    NutritionAnalysisRequest, NutritionAnalysisResponse,
)

logger = setup_logging()

# ── Model adapter interface ─────────────────────────────────────────────────
# When your ML model is ready, create a class here that implements .predict()
# and the AIService will use it automatically.

class BaseModelAdapter:
    """Interface for swapping in different recommendation models."""
    MODEL_VERSION = "rule_based_v1"

    def predict(self, user_profile: dict, candidate_foods: list, meal_type: str) -> List[dict]:
        """
        Returns list of {food_id, score, reason} sorted by score DESC.
        Override this in your trained model subclass.
        """
        raise NotImplementedError


class RuleBasedAdapter(BaseModelAdapter):
    """
    Phase 1: Rule-based scoring.
    Works well for MVP — no training data needed.
    Score is based on:
      - Goal alignment (calorie/macro fit)
      - Meal time match
      - No allergen violations
      - Cuisine preference
    """
    MODEL_VERSION = "rule_based_v1"

    def predict(self, user_profile: dict, candidate_foods: list, meal_type: str) -> List[dict]:
        goal = user_profile.get("health_goal", "maintain")
        allergies = set(user_profile.get("allergies", []))
        calorie_target = user_profile.get("calorie_target", 2000)

        # Rough per-meal calorie budgets
        meal_budgets = {
            "breakfast": calorie_target * 0.25,
            "lunch":     calorie_target * 0.35,
            "dinner":    calorie_target * 0.30,
            "snack":     calorie_target * 0.10,
        }
        budget = meal_budgets.get(meal_type, calorie_target * 0.30)

        results = []
        for food in candidate_foods:
            # Hard filter: allergens
            food_allergens = set(food.get("allergens", []))
            if food_allergens & allergies:
                continue

            # Hard filter: meal_time match
            food_meal_times = food.get("meal_time", [])
            if food_meal_times and meal_type not in food_meal_times:
                continue

            score = 0.5  # base

            # Calorie proximity score (closer to budget = higher score)
            cal_diff = abs(food["calories"] - budget)
            cal_score = max(0, 1 - (cal_diff / budget))
            score += cal_score * 0.3

            # Goal-specific boost
            if goal == "lose_weight" and food["calories"] < budget * 0.9:
                score += 0.15
            elif goal == "gain_muscle" and food.get("protein_g", 0) > 20:
                score += 0.15
            elif goal == "vegetarian" and "meat" not in food.get("allergens", []):
                score += 0.10

            # Vietnamese cuisine preference
            if food.get("cuisine") == "vietnamese":
                score += 0.05

            score = min(round(score, 3), 1.0)

            reason = _build_reason(food, goal, meal_type, score)
            results.append({"food": food, "score": score, "reason": reason})

        return sorted(results, key=lambda x: x["score"], reverse=True)


class MLModelAdapter(BaseModelAdapter):
    """
    Phase 2: Replace rule-based with trained ML model.
    
    HOW TO USE:
    -----------
    1. Train your model (see ml/notebooks/train_recommendation.ipynb)
    2. Save checkpoint to ml/checkpoints/recommendation_model.pt
    3. Set AI_ENABLED=true in .env
    4. Implement load() and predict() below
    5. Restart the backend — it auto-detects AI_ENABLED
    """
    MODEL_VERSION = "ml_model_v1"
    _model = None

    @classmethod
    def load(cls):
        """Load model weights from checkpoint. Called once at startup."""
        import torch
        try:
            cls._model = torch.load(settings.AI_MODEL_PATH, map_location="cpu")
            cls._model.eval()
            logger.info(f"✅ ML model loaded from {settings.AI_MODEL_PATH}")
        except Exception as e:
            logger.error(f"❌ Failed to load ML model: {e}")
            raise

    def predict(self, user_profile: dict, candidate_foods: list, meal_type: str) -> List[dict]:
        if self._model is None:
            raise RuntimeError("Model not loaded. Call MLModelAdapter.load() first.")
        
        # ── TODO: implement your model inference here ──────────────────
        # Example structure:
        #
        # user_tensor = encode_user(user_profile)
        # food_tensors = [encode_food(f) for f in candidate_foods]
        # scores = self._model(user_tensor, food_tensors)
        # return [{"food": f, "score": s.item(), "reason": "..."} for f, s in zip(candidate_foods, scores)]
        #
        # For now, fall back to rule-based
        return RuleBasedAdapter().predict(user_profile, candidate_foods, meal_type)


# ── Active adapter selection ──────────────────────────────────────────────
def _get_adapter() -> BaseModelAdapter:
    if settings.AI_ENABLED:
        adapter = MLModelAdapter()
        if MLModelAdapter._model is None:
            try:
                MLModelAdapter.load()
            except Exception:
                logger.warning("ML model failed to load, falling back to rule-based")
                return RuleBasedAdapter()
        return adapter
    return RuleBasedAdapter()


# ── AI Service ────────────────────────────────────────────────────────────
class AIService:

    @staticmethod
    async def get_meal_suggestions(
        db: AsyncSession,
        user_id: UUID,
        req: MealSuggestionRequest,
    ) -> MealSuggestionResponse:
        # Load user profile
        profile_result = await db.execute(
            select(UserProfile).where(UserProfile.user_id == user_id)
        )
        profile = profile_result.scalar_one_or_none()
        user_dict = {}
        if profile:
            user_dict = {
                "health_goal": profile.health_goal,
                "calorie_target": profile.calorie_target,
                "allergies": profile.allergies or [],
                "dietary_restrictions": profile.dietary_restrictions or [],
            }

        # Load candidate foods
        food_result = await db.execute(
            select(FoodItem).where(FoodItem.is_active == True).limit(200)
        )
        foods_raw = food_result.scalars().all()
        candidates = [
            {
                "id": str(f.id),
                "name_vi": f.name_vi,
                "calories": f.calories,
                "protein_g": f.protein_g,
                "carb_g": f.carb_g,
                "fat_g": f.fat_g,
                "allergens": f.allergens or [],
                "meal_time": f.meal_time or [],
                "cuisine": f.cuisine,
                "_obj": f,
            }
            for f in foods_raw
            if str(f.id) not in [str(x) for x in req.exclude_food_ids]
        ]

        # Run adapter
        adapter = _get_adapter()
        ranked = adapter.predict(user_dict, candidates, req.meal_type)

        # Build response
        suggestions = []
        for item in ranked[:req.count]:
            food_obj = item["food"]["_obj"]
            score = item["score"]
            suggestions.append(
                SuggestionItem(
                    food_item=FoodItemResponse.model_validate(food_obj),
                    match_score=score,
                    match_pct=int(score * 100),
                    reason=item["reason"],
                    model_version=adapter.MODEL_VERSION,
                )
            )

        return MealSuggestionResponse(
            meal_type=req.meal_type,
            suggestions=suggestions,
            generated_by=adapter.MODEL_VERSION,
        )

    @staticmethod
    async def chat(
        db: AsyncSession,
        user_id: UUID,
        req: ChatRequest,
    ) -> ChatResponse:
        """
        Nutrition chatbot.
        Phase 1: Pattern matching + canned responses.
        Phase 2: Replace with LLM (Claude/GPT) when API key available.
        """
        reply = await _chatbot_reply(req.message, req.context or {})
        return ChatResponse(
            reply=reply,
            conversation_id=req.conversation_id or str(uuid.uuid4()),
            disclaimer="Thông tin từ AI chỉ mang tính tham khảo. Hãy tham khảo chuyên gia dinh dưỡng cho tư vấn y tế.",
        )

    @staticmethod
    async def analyze_nutrition(
        db: AsyncSession,
        user_id: UUID,
        req: NutritionAnalysisRequest,
    ) -> NutritionAnalysisResponse:
        """
        Analyze user's nutrition over a date range.
        Phase 1: Aggregate from meal logs + rule-based insights.
        Phase 2: ML-powered pattern detection.
        """
        from sqlalchemy import and_, func
        from app.models.models import MealLog
        from datetime import datetime, timezone

        start = datetime.strptime(req.start_date, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        end   = datetime.strptime(req.end_date,   "%Y-%m-%d").replace(hour=23, minute=59, second=59, tzinfo=timezone.utc)

        result = await db.execute(
            select(
                func.avg(MealLog.total_calories).label("avg_cal"),
                func.avg(MealLog.total_protein_g).label("avg_prot"),
                func.avg(MealLog.total_carb_g).label("avg_carb"),
                func.avg(MealLog.total_fat_g).label("avg_fat"),
            ).where(
                and_(MealLog.user_id == user_id, MealLog.logged_at.between(start, end))
            )
        )
        row = result.one()

        avg_cal  = float(row.avg_cal  or 0)
        avg_prot = float(row.avg_prot or 0)
        avg_carb = float(row.avg_carb or 0)
        avg_fat  = float(row.avg_fat  or 0)

        # Load user targets
        profile_res = await db.execute(select(UserProfile).where(UserProfile.user_id == user_id))
        profile = profile_res.scalar_one_or_none()
        cal_target  = profile.calorie_target  if profile else 2000
        prot_target = profile.protein_target_g if profile else 100.0

        adherence_cal  = min(100, round(avg_cal  / cal_target  * 100, 1)) if cal_target  else 0
        adherence_prot = min(100, round(avg_prot / prot_target * 100, 1)) if prot_target else 0

        deficiencies = []
        if avg_prot < prot_target * 0.8:
            deficiencies.append("Protein")
        if avg_cal < cal_target * 0.85:
            deficiencies.append("Calo tổng thể")

        recommendations = _build_recommendations(avg_cal, avg_prot, cal_target, prot_target)

        return NutritionAnalysisResponse(
            period=f"{req.start_date} → {req.end_date}",
            avg_daily_calories=round(avg_cal, 1),
            avg_protein_g=round(avg_prot, 1),
            avg_carb_g=round(avg_carb, 1),
            avg_fat_g=round(avg_fat, 1),
            calorie_goal_adherence_pct=adherence_cal,
            top_foods=[],   # TODO: aggregate from meal entries
            deficiencies=deficiencies,
            recommendations=recommendations,
            generated_by=_get_adapter().MODEL_VERSION,
        )


# ── Helpers ───────────────────────────────────────────────────────────────
def _build_reason(food: dict, goal: str, meal_type: str, score: float) -> str:
    reasons = []
    if score > 0.85:
        reasons.append("Phù hợp cao với mục tiêu của bạn")
    if food.get("cuisine") == "vietnamese":
        reasons.append("Món Việt quen thuộc")
    if goal == "lose_weight" and food["calories"] < 400:
        reasons.append("Ít calo, phù hợp giảm cân")
    if goal == "gain_muscle" and food.get("protein_g", 0) > 20:
        reasons.append(f"Giàu protein ({food.get('protein_g', 0):.0f}g)")
    if not reasons:
        reasons.append("Cân bằng dinh dưỡng cho bữa " + meal_type)
    return " · ".join(reasons)


def _build_recommendations(avg_cal, avg_prot, cal_target, prot_target) -> list:
    recs = []
    if avg_prot < prot_target * 0.8:
        recs.append(f"Tăng lượng protein: thêm trứng, thịt nạc, hoặc đậu phụ vào bữa ăn.")
    if avg_cal < cal_target * 0.85:
        recs.append(f"Bạn đang ăn ít hơn mục tiêu — thêm một bữa snack lành mạnh vào buổi chiều.")
    if avg_cal > cal_target * 1.15:
        recs.append(f"Calo trung bình vượt mục tiêu — giảm khẩu phần hoặc chọn món ít dầu mỡ hơn.")
    if not recs:
        recs.append("Chế độ ăn của bạn đang cân bằng tốt! Duy trì thói quen hiện tại.")
    return recs


async def _chatbot_reply(message: str, context: dict, use_llm: bool = True) -> str:
    """
    Phase 1: Keyword-based chatbot.
    Phase 2: Replace body with LLM API call.
    """
    # Nếu đã cấu hình API Key, dùng AI thật
    if use_llm and settings.OPENAI_API_KEY:
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            
            # Tạo ngữ cảnh hệ thống (System Prompt) dựa trên dữ liệu user
            user_info = f"""
            Thông tin người dùng:
            - Tên: {context.get('user_name', 'Bạn')}
            - Mục tiêu: {context.get('goal', 'Sống khoẻ')}
            - Dị ứng: {', '.join(context.get('allergies', []))}
            - Calo đã nạp hôm nay: {context.get('calories_in', 0)} kcal
            """
            
            response = await client.chat.completions.create(
                model="gpt-4o", # Hoặc gpt-3.5-turbo cho rẻ
                messages=[
                    {"role": "system", "content": f"Bạn là Bác sĩ AI của NutriAI. Hãy tư vấn ngắn gọn, thân thiện, dựa trên dữ liệu sau:\n{user_info}"},
                    {"role": "user", "content": message}
                ],
                temperature=0.7,
                max_tokens=300
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"LLM Error: {e}")
            # Fallback về rule-based nếu lỗi
            pass

    msg = message.lower()

    if any(w in msg for w in ["protein", "đạm", "cơ"]):
        return "Protein rất quan trọng cho cơ bắp và phục hồi. Nguồn protein tốt: thịt gà, cá, trứng, đậu phụ, sữa chua Hy Lạp. Mục tiêu: 1.6–2.2g/kg cân nặng nếu tập gym."
    if any(w in msg for w in ["giảm cân", "béo", "calo"]):
        return "Để giảm cân hiệu quả: tạo thâm hụt calo 300–500kcal/ngày, ăn nhiều protein và rau xanh, hạn chế đường và thức ăn chế biến. Đừng bỏ bữa sáng!"
    if any(w in msg for w in ["dị ứng", "gluten", "lactose"]):
        return "Tôi đã ghi nhận dị ứng của bạn và sẽ loại các thực phẩm liên quan ra khỏi gợi ý. Hãy cập nhật hồ sơ sức khoẻ để tôi gợi ý chính xác hơn."
    if any(w in msg for w in ["sáng", "bữa sáng", "breakfast"]):
        return "Bữa sáng lý tưởng: kết hợp protein (trứng, sữa) + carb phức (yến mạch, bánh mì nguyên cám) + rau/trái cây. Tránh bữa sáng quá nhiều đường."
    if any(w in msg for w in ["tập gym", "thể dục", "exercise"]):
        return "Trước tập: carb + protein nhẹ (chuối + sữa chua). Sau tập trong 30 phút: protein + carb (cơm + thịt gà). Uống đủ nước trước, trong và sau tập."
    if any(w in msg for w in ["nước", "uống", "hydration"]):
        return "Mục tiêu 2L nước/ngày. Uống 1 ly nước khi thức dậy, trước mỗi bữa ăn, và sau khi tập. Nước dừa, trà xanh không đường đều tốt."

    return "Tôi là trợ lý dinh dưỡng AI của NutriAI 🥗 Hãy hỏi tôi về thực đơn, calo, protein, dị ứng thực phẩm, hoặc bất kỳ câu hỏi dinh dưỡng nào!"
