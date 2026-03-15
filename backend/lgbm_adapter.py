"""
LightGBM Recommendation Model Adapter.

HOW TO ACTIVATE:
1. Train model: run ml/notebooks/03_train_recommendation.py
2. Save to: ml/checkpoints/recommendation_lgbm.txt
3. Set in .env:
     AI_ENABLED=true
     AI_MODEL_PATH=./ml/checkpoints/recommendation_lgbm.txt
4. Update ai_service.py → _get_adapter() to return LGBMAdapter()
5. Restart backend

TRAINING FEATURES (must match what model was trained on):
  - goal_encoded        int  (0=lose_weight, 1=maintain, 2=gain_muscle, 3=vegetarian)
  - meal_encoded        int  (0=breakfast, 1=lunch, 2=dinner, 3=snack)
  - calorie_target      int  (user daily target)
  - cal_score           float (0-1, how close food cals are to meal budget)
  - protein_score       float (0-1, protein adequacy for goal)
  - meal_time_match     int  (0/1, does food match meal time)
  - allergen_safe       int  (0/1, no allergen violations)
"""
from typing import List
from app.services.ai_service import BaseModelAdapter
from app.core.config import settings
from app.core.logging import setup_logging

logger = setup_logging()

FEATURE_COLS = [
    "goal_encoded", "meal_encoded", "calorie_target",
    "cal_score", "protein_score", "meal_time_match", "allergen_safe",
]

GOAL_MAP = {"lose_weight": 0, "maintain": 1, "gain_muscle": 2, "vegetarian": 3}
MEAL_MAP = {"breakfast": 0, "lunch": 1, "dinner": 2, "snack": 3}


class LGBMAdapter(BaseModelAdapter):
    MODEL_VERSION = "lgbm_v1"
    _model = None

    @classmethod
    def load(cls):
        try:
            import lightgbm as lgb
            cls._model = lgb.Booster(model_file=settings.AI_MODEL_PATH)
            logger.info(f"✅ LightGBM model loaded from {settings.AI_MODEL_PATH}")
        except ImportError:
            raise RuntimeError("lightgbm not installed. Run: pip install lightgbm")
        except Exception as e:
            raise RuntimeError(f"Failed to load LGBM model: {e}")

    def predict(self, user_profile: dict, candidate_foods: list, meal_type: str) -> List[dict]:
        if self._model is None:
            raise RuntimeError("LGBMAdapter.load() must be called first")

        import numpy as np

        meal_budget = self._get_meal_budget(user_profile, meal_type)
        allergies = set(user_profile.get("allergies", []))
        goal = user_profile.get("health_goal", "maintain")

        features_list = []
        valid_foods = []

        for food in candidate_foods:
            # Hard filter: allergens
            if set(food.get("allergens", [])) & allergies:
                continue

            features = self._extract_features(food, user_profile, meal_type, meal_budget, goal)
            features_list.append(features)
            valid_foods.append(food)

        if not features_list:
            return []

        import pandas as pd
        X = pd.DataFrame(features_list, columns=FEATURE_COLS)
        scores = self._model.predict(X)

        results = []
        for food, score in zip(valid_foods, scores):
            reason = self._build_reason(food, goal, score)
            results.append({"food": food, "score": float(score), "reason": reason})

        return sorted(results, key=lambda x: x["score"], reverse=True)

    def _extract_features(self, food, user_profile, meal_type, meal_budget, goal):
        cal_diff = abs(food.get("calories", 0) - meal_budget)
        cal_score = max(0, 1 - (cal_diff / max(meal_budget, 1)))
        protein_target = 25 if goal == "gain_muscle" else 15
        protein_score = min(1.0, food.get("protein_g", 0) / protein_target)
        meal_time_match = int(meal_type in food.get("meal_time", []))
        allergen_safe = int(not (set(food.get("allergens", [])) & set(user_profile.get("allergies", []))))

        return [
            GOAL_MAP.get(goal, 1),
            MEAL_MAP.get(meal_type, 1),
            user_profile.get("calorie_target", 2000),
            cal_score,
            protein_score,
            meal_time_match,
            allergen_safe,
        ]

    def _get_meal_budget(self, user_profile, meal_type):
        target = user_profile.get("calorie_target", 2000)
        budgets = {"breakfast": 0.25, "lunch": 0.35, "dinner": 0.30, "snack": 0.10}
        return target * budgets.get(meal_type, 0.30)

    def _build_reason(self, food, goal, score):
        parts = []
        if score > 0.85:
            parts.append("Phù hợp rất cao với hồ sơ của bạn")
        if food.get("cuisine") == "vietnamese":
            parts.append("Món Việt quen thuộc")
        if goal == "gain_muscle" and food.get("protein_g", 0) > 20:
            parts.append(f"Giàu protein ({food.get('protein_g', 0):.0f}g)")
        if goal == "lose_weight" and food.get("calories", 999) < 350:
            parts.append("Ít calo")
        return " · ".join(parts) or "Phù hợp với mục tiêu dinh dưỡng"
