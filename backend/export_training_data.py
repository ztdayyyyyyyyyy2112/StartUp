#!/usr/bin/env python3
"""
Export anonymized training data from production DB → CSV for ML training.

Usage:
    python scripts/export_training_data.py --output ml/datasets/interactions.csv
    python scripts/export_training_data.py --output ml/datasets/interactions.csv --days 90
"""
import argparse
import asyncio
import hashlib
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))


async def export(output_path: str, days: int = 30):
    from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
    from sqlalchemy import select, and_, text
    from datetime import datetime, timedelta, timezone
    import csv

    from app.core.config import settings
    from app.models.models import (
        AIMealSuggestion, FoodItem, MealLog, MealEntry,
        UserProfile, User,
    )

    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    AsyncSession = async_sessionmaker(engine, expire_on_commit=False)

    print(f"Exporting {days} days of interaction data...")
    since = datetime.now(timezone.utc) - timedelta(days=days)

    async with AsyncSession() as db:
        # Query AI suggestions with user context
        result = await db.execute(
            select(
                AIMealSuggestion,
                FoodItem,
                UserProfile,
            )
            .join(FoodItem, FoodItem.id == AIMealSuggestion.food_item_id)
            .join(UserProfile, UserProfile.user_id == AIMealSuggestion.user_id)
            .where(AIMealSuggestion.suggested_at >= since)
        )
        rows = result.all()

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)

    fieldnames = [
        "user_id_hash", "food_id_hash", "food_name",
        "health_goal", "calorie_target", "meal_type",
        "calories", "protein_g", "carb_g", "fat_g",
        "match_score", "accepted",
        "suggested_date", "model_version",
    ]

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()

        for suggestion, food, profile in rows:
            # Anonymize user_id and food_id
            user_hash = hashlib.sha256(str(suggestion.user_id).encode()).hexdigest()[:16]
            food_hash  = hashlib.sha256(str(suggestion.food_item_id).encode()).hexdigest()[:16]

            writer.writerow({
                "user_id_hash":    user_hash,
                "food_id_hash":    food_hash,
                "food_name":       food.name_vi,
                "health_goal":     profile.health_goal,
                "calorie_target":  profile.calorie_target,
                "meal_type":       suggestion.meal_type,
                "calories":        food.calories,
                "protein_g":       food.protein_g,
                "carb_g":          food.carb_g,
                "fat_g":           food.fat_g,
                "match_score":     suggestion.match_score,
                "accepted":        int(suggestion.accepted) if suggestion.accepted is not None else "",
                "suggested_date":  suggestion.suggested_at.date().isoformat() if suggestion.suggested_at else "",
                "model_version":   suggestion.model_version,
            })

    print(f"✅ Exported {len(rows)} interactions → {output_path}")
    accepted = sum(1 for s, _, __ in rows if s.accepted is True)
    rejected = sum(1 for s, _, __ in rows if s.accepted is False)
    print(f"   Accepted: {accepted} | Rejected: {rejected} | Pending: {len(rows)-accepted-rejected}")
    await engine.dispose()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="ml/datasets/interactions.csv")
    parser.add_argument("--days", type=int, default=30)
    args = parser.parse_args()
    asyncio.run(export(args.output, args.days))
