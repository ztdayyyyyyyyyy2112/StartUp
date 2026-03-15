#!/usr/bin/env python3
"""
Seed script — populate the database with:
  - 60+ Vietnamese food items
  - Sample challenges
  - Demo user (for testing)

Run: python scripts/seed_food_db.py
"""
import asyncio
import json
import os
import sys
from pathlib import Path

# Add backend root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from app.core.config import settings
from app.core.security import hash_password
from app.db.session import Base
from app.models.models import (
    Challenge, FoodItem, User, UserPoints, UserProfile
)
from python_slugify import slugify


DATA_FILE = Path(__file__).parent.parent.parent / "data" / "food_database" / "vietnamese_foods.json"

SAMPLE_CHALLENGES = [
    {
        "title": "Uống 2L nước mỗi ngày",
        "description": "Hydration là nền tảng sức khoẻ. Uống đủ 2L nước mỗi ngày trong 7 ngày liên tiếp.",
        "challenge_type": "hydration",
        "target_value": 7.0,
        "duration_days": 7,
        "reward_points": 70,
        "reward_desc": "🏆 70 điểm + Huy hiệu Hydration Pro",
        "is_active": True,
    },
    {
        "title": "Ăn đủ protein 7 ngày",
        "description": "Đạt mục tiêu protein cá nhân trong 7 ngày liên tiếp.",
        "challenge_type": "nutrition",
        "target_value": 7.0,
        "duration_days": 7,
        "reward_points": 100,
        "reward_desc": "🎁 Voucher mua thực phẩm chức năng 20k",
        "is_active": True,
    },
    {
        "title": "Không bỏ bữa sáng 7 ngày",
        "description": "Bữa sáng là bữa quan trọng nhất — ghi lại bữa sáng mỗi ngày trong 7 ngày.",
        "challenge_type": "streak",
        "target_value": 7.0,
        "duration_days": 7,
        "reward_points": 50,
        "reward_desc": "✅ 50 điểm + Huy hiệu Morning Champion",
        "is_active": True,
    },
    {
        "title": "Đi bộ 10.000 bước/ngày",
        "description": "Mục tiêu WHO: 10.000 bước mỗi ngày trong 14 ngày.",
        "challenge_type": "steps",
        "target_value": 14.0,
        "duration_days": 14,
        "reward_points": 200,
        "reward_desc": "🏃 200 điểm + Voucher phòng gym 50k",
        "is_active": True,
        "sponsored_by": "California Fitness & Yoga",
    },
    {
        "title": "Ngủ 7-9 tiếng/đêm",
        "description": "Giấc ngủ đủ giấc giúp phục hồi cơ thể và kiểm soát cân nặng.",
        "challenge_type": "sleep",
        "target_value": 7.0,
        "duration_days": 7,
        "reward_points": 80,
        "reward_desc": "😴 80 điểm + Huy hiệu Sleep Master",
        "is_active": True,
    },
    {
        "title": "Ăn rau xanh mỗi bữa trong 5 ngày",
        "description": "Bổ sung chất xơ và vi chất: ăn ít nhất 1 món rau xanh mỗi bữa chính trong 5 ngày.",
        "challenge_type": "nutrition",
        "target_value": 5.0,
        "duration_days": 5,
        "reward_points": 60,
        "reward_desc": "🥗 60 điểm + Huy hiệu Green Warrior",
        "is_active": True,
    },
]

DEMO_USER = {
    "full_name": "Nguyễn Demo",
    "email": "demo@nutriai.vn",
    "password": "demo1234",
    "profile": {
        "age": 25,
        "gender": "male",
        "weight_kg": 68.0,
        "height_cm": 172.0,
        "health_goal": "gain_muscle",
        "calorie_target": 2400,
        "protein_target_g": 136.0,
        "carb_target_g": 300.0,
        "fat_target_g": 80.0,
        "allergies": [],
        "plan": "free",
    }
}


async def seed():
    print("🌱 Starting database seed...")

    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    AsyncSession = async_sessionmaker(engine, expire_on_commit=False)

    async with AsyncSession() as db:
        # ── Food items ────────────────────────────────────────────────────
        print("🍜 Seeding food items...")
        if not DATA_FILE.exists():
            print(f"  ⚠️  Food data file not found: {DATA_FILE}")
        else:
            with open(DATA_FILE, encoding="utf-8") as f:
                foods = json.load(f)

            inserted = 0
            for food_data in foods:
                from sqlalchemy import select
                existing = await db.execute(
                    select(FoodItem).where(FoodItem.slug == food_data["slug"])
                )
                if existing.scalar_one_or_none():
                    continue

                item = FoodItem(**{k: v for k, v in food_data.items()})
                db.add(item)
                inserted += 1

            await db.commit()
            print(f"  ✅ Inserted {inserted} food items (skipped duplicates)")

        # ── Challenges ────────────────────────────────────────────────────
        print("🏆 Seeding challenges...")
        from sqlalchemy import select
        chall_count = 0
        for c in SAMPLE_CHALLENGES:
            existing = await db.execute(
                select(Challenge).where(Challenge.title == c["title"])
            )
            if not existing.scalar_one_or_none():
                db.add(Challenge(**c))
                chall_count += 1
        await db.commit()
        print(f"  ✅ Inserted {chall_count} challenges")

        # ── Demo user ─────────────────────────────────────────────────────
        print("👤 Seeding demo user...")
        existing = await db.execute(
            select(User).where(User.email == DEMO_USER["email"])
        )
        if not existing.scalar_one_or_none():
            user = User(
                email=DEMO_USER["email"],
                full_name=DEMO_USER["full_name"],
                hashed_password=hash_password(DEMO_USER["password"]),
                is_active=True,
                is_verified=True,
            )
            db.add(user)
            await db.flush()

            profile_data = DEMO_USER["profile"]
            db.add(UserProfile(user_id=user.id, **profile_data))
            db.add(UserPoints(user_id=user.id, total_points=1240, streak_days=12))
            await db.commit()
            print(f"  ✅ Demo user: {DEMO_USER['email']} / {DEMO_USER['password']}")
        else:
            print(f"  ℹ️  Demo user already exists")

    await engine.dispose()
    print("\n✅ Seed complete!")
    print("   • 60+ món ăn Việt")
    print("   • 6 thử thách cộng đồng")
    print(f"   • Demo: {DEMO_USER['email']} / {DEMO_USER['password']}")


if __name__ == "__main__":
    asyncio.run(seed())
