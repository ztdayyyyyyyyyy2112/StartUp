"""
LLM Chatbot Adapter — Phase 3 upgrade.

Replaces keyword-based chatbot with a real AI model.
Supports Anthropic Claude and OpenAI GPT.

HOW TO ACTIVATE:
1. Set ANTHROPIC_API_KEY or OPENAI_API_KEY in .env
2. Import LLMChatAdapter in ai_service.py
3. Call: reply = await LLMChatAdapter.chat(message, user_context)
"""
from app.core.config import settings
from app.core.logging import setup_logging

logger = setup_logging()

SYSTEM_PROMPT = """Bạn là chuyên gia dinh dưỡng AI của NutriAI — nền tảng sức khoẻ hàng đầu Việt Nam.

Phong cách: thân thiện, ngắn gọn, thực tiễn. Trả lời bằng tiếng Việt.
Luôn dựa trên khoa học dinh dưỡng, không đưa ra lời khuyên y tế.
Khi nhắc đến món ăn, ưu tiên gợi ý món ăn Việt Nam.

Thông tin người dùng:
{user_context}
"""


class LLMChatAdapter:

    @staticmethod
    async def chat(message: str, user_context: dict = {}) -> str:
        """
        Send message to LLM and return response.
        Tries Anthropic first, falls back to OpenAI, then rule-based.
        """
        context_str = _format_context(user_context)
        system = SYSTEM_PROMPT.format(user_context=context_str)

        # Try Anthropic Claude
        if settings.ANTHROPIC_API_KEY:
            try:
                return await _claude_chat(message, system)
            except Exception as e:
                logger.warning(f"Anthropic API failed: {e}")

        # Try OpenAI
        if settings.OPENAI_API_KEY:
            try:
                return await _openai_chat(message, system)
            except Exception as e:
                logger.warning(f"OpenAI API failed: {e}")

        # Fallback
        logger.warning("No LLM API available, using rule-based fallback")
        from app.services.ai_service import _chatbot_reply
        return await _chatbot_reply(message, user_context)


async def _claude_chat(message: str, system: str) -> str:
    """Call Anthropic Claude API."""
    import anthropic
    client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
    response = await client.messages.create(
        model="claude-opus-4-5",
        max_tokens=512,
        system=system,
        messages=[{"role": "user", "content": message}],
    )
    return response.content[0].text


async def _openai_chat(message: str, system: str) -> str:
    """Call OpenAI ChatGPT API."""
    from openai import AsyncOpenAI
    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        max_tokens=512,
        messages=[
            {"role": "system", "content": system},
            {"role": "user",   "content": message},
        ],
    )
    return response.choices[0].message.content


def _format_context(ctx: dict) -> str:
    if not ctx:
        return "Chưa có thông tin hồ sơ."
    parts = []
    if ctx.get("health_goal"):
        parts.append(f"Mục tiêu: {ctx['health_goal']}")
    if ctx.get("calorie_target"):
        parts.append(f"Mục tiêu calo: {ctx['calorie_target']} kcal/ngày")
    if ctx.get("calories_eaten_today"):
        parts.append(f"Đã ăn hôm nay: {ctx['calories_eaten_today']} kcal")
    if ctx.get("allergies"):
        parts.append(f"Dị ứng: {', '.join(ctx['allergies'])}")
    return " | ".join(parts) if parts else "Người dùng mới."
