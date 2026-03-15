"""
SQLAlchemy ORM Models — User, Food, Meal, Tracking, Challenge.
Each model maps to a PostgreSQL table.
"""
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Boolean, Column, DateTime, Enum, Float, ForeignKey,
    Integer, String, Text, JSON, func
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.session import Base


# ── Helpers ────────────────────────────────────────────────────────────────
def uuid_pk():
    return Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

def now_col():
    return Column(DateTime(timezone=True), server_default=func.now())

def updated_col():
    return Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


# ══════════════════════════════════════════════════════════════════════════
# USER
# ══════════════════════════════════════════════════════════════════════════
class User(Base):
    """Core user account."""
    __tablename__ = "users"

    id            = uuid_pk()
    email         = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name     = Column(String(200), nullable=False)
    is_active     = Column(Boolean, default=True)
    is_verified   = Column(Boolean, default=False)
    avatar_url    = Column(String(500), nullable=True)
    created_at    = now_col()
    updated_at    = updated_col()

    # Relations
    profile       = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    meals         = relationship("MealLog", back_populates="user", cascade="all, delete-orphan")
    tracking      = relationship("DailyTracking", back_populates="user", cascade="all, delete-orphan")
    challenge_progress = relationship("UserChallenge", back_populates="user")
    points        = relationship("UserPoints", back_populates="user", uselist=False)

    def __repr__(self):
        return f"<User {self.email}>"


class UserProfile(Base):
    """Extended health profile for personalization."""
    __tablename__ = "user_profiles"

    id            = uuid_pk()
    user_id       = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    age           = Column(Integer, nullable=True)
    gender        = Column(Enum("male", "female", "other", name="gender_enum"), nullable=True)
    weight_kg     = Column(Float, nullable=True)
    height_cm     = Column(Float, nullable=True)

    # Health goal: lose_weight | gain_muscle | maintain | vegetarian | diabetic | ...
    health_goal   = Column(String(100), default="maintain")

    # Daily targets (auto-calculated or user-set)
    calorie_target   = Column(Integer, default=2000)
    protein_target_g = Column(Float, default=100.0)
    carb_target_g    = Column(Float, default=250.0)
    fat_target_g     = Column(Float, default=65.0)

    # Allergies & restrictions (JSON list: ["gluten", "lactose", "shellfish"])
    allergies        = Column(JSON, default=list)
    dietary_restrictions = Column(JSON, default=list)

    # Wearable integration
    wearable_type    = Column(String(50), nullable=True)  # apple_watch | galaxy_watch | nutriai_band
    wearable_linked  = Column(Boolean, default=False)

    # Plan tier
    plan             = Column(Enum("free", "vip", "band", name="plan_enum"), default="free")

    created_at    = now_col()
    updated_at    = updated_col()

    user          = relationship("User", back_populates="profile")


class UserPoints(Base):
    """Gamification points."""
    __tablename__ = "user_points"

    id            = uuid_pk()
    user_id       = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True)
    total_points  = Column(Integer, default=0)
    streak_days   = Column(Integer, default=0)
    last_active   = Column(DateTime(timezone=True), nullable=True)
    updated_at    = updated_col()

    user          = relationship("User", back_populates="points")


# ══════════════════════════════════════════════════════════════════════════
# FOOD DATABASE
# ══════════════════════════════════════════════════════════════════════════
class FoodItem(Base):
    """
    Core food/dish database — 1000+ Vietnamese dishes.
    Nutrition values per 100g unless noted.
    """
    __tablename__ = "food_items"

    id              = uuid_pk()
    name_vi         = Column(String(300), nullable=False, index=True)
    name_en         = Column(String(300), nullable=True)
    slug            = Column(String(300), unique=True, index=True)

    # Category: main | side | soup | snack | drink | dessert
    category        = Column(String(50), index=True)

    # Origin / cuisine type
    cuisine         = Column(String(100), default="vietnamese")
    region          = Column(String(100), nullable=True)  # north | central | south

    # ── Nutrition per serving (not 100g) ──────────────────────────────
    serving_size_g  = Column(Float, default=100.0)
    calories        = Column(Float, nullable=False)
    protein_g       = Column(Float, default=0.0)
    carb_g          = Column(Float, default=0.0)
    fat_g           = Column(Float, default=0.0)
    fiber_g         = Column(Float, default=0.0)
    sugar_g         = Column(Float, default=0.0)
    sodium_mg       = Column(Float, default=0.0)

    # Micronutrients (optional, fill when data available)
    vitamins        = Column(JSON, default=dict)   # {"A": 50, "C": 12, ...} in μg/mg
    minerals        = Column(JSON, default=dict)   # {"Ca": 30, "Fe": 2.1, ...}

    # Allergens (JSON list)
    allergens       = Column(JSON, default=list)   # ["gluten", "shellfish", ...]

    # AI features (for recommendation model)
    flavor_profile  = Column(JSON, default=dict)   # {"sweet": 0.3, "savory": 0.8, ...}
    meal_time       = Column(JSON, default=list)   # ["breakfast", "lunch", "dinner"]
    prep_time_min   = Column(Integer, nullable=True)

    # Meta
    image_url       = Column(String(500), nullable=True)
    description     = Column(Text, nullable=True)
    is_active       = Column(Boolean, default=True)
    source          = Column(String(100), default="manual")  # manual | usda | crawled
    created_at      = now_col()
    updated_at      = updated_col()

    # Relations
    meal_entries    = relationship("MealEntry", back_populates="food_item")

    def __repr__(self):
        return f"<FoodItem {self.name_vi}>"


# ══════════════════════════════════════════════════════════════════════════
# MEALS
# ══════════════════════════════════════════════════════════════════════════
class MealLog(Base):
    """A logged meal session (e.g. 'Lunch on 2029-03-14')."""
    __tablename__ = "meal_logs"

    id          = uuid_pk()
    user_id     = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    logged_at   = Column(DateTime(timezone=True), nullable=False)
    meal_type   = Column(Enum("breakfast", "lunch", "dinner", "snack", name="meal_type_enum"))

    # Aggregated nutrition (sum of all entries)
    total_calories  = Column(Float, default=0.0)
    total_protein_g = Column(Float, default=0.0)
    total_carb_g    = Column(Float, default=0.0)
    total_fat_g     = Column(Float, default=0.0)

    notes           = Column(Text, nullable=True)
    created_at      = now_col()

    user            = relationship("User", back_populates="meals")
    entries         = relationship("MealEntry", back_populates="meal_log", cascade="all, delete-orphan")


class MealEntry(Base):
    """Individual food item within a MealLog."""
    __tablename__ = "meal_entries"

    id              = uuid_pk()
    meal_log_id     = Column(UUID(as_uuid=True), ForeignKey("meal_logs.id"), nullable=False)
    food_item_id    = Column(UUID(as_uuid=True), ForeignKey("food_items.id"), nullable=False)
    quantity_g      = Column(Float, nullable=False)

    # Calculated at insert time
    calories        = Column(Float, default=0.0)
    protein_g       = Column(Float, default=0.0)
    carb_g          = Column(Float, default=0.0)
    fat_g           = Column(Float, default=0.0)

    created_at      = now_col()

    meal_log        = relationship("MealLog", back_populates="entries")
    food_item       = relationship("FoodItem", back_populates="meal_entries")


class AIMealSuggestion(Base):
    """
    AI-generated meal suggestion for a user on a given date.
    Saved so we can track acceptance rate and improve model.
    """
    __tablename__ = "ai_meal_suggestions"

    id              = uuid_pk()
    user_id         = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    suggested_at    = Column(DateTime(timezone=True), server_default=func.now())
    meal_type       = Column(String(20))
    food_item_id    = Column(UUID(as_uuid=True), ForeignKey("food_items.id"), nullable=False)

    # AI metadata
    match_score     = Column(Float)           # 0-1 confidence
    model_version   = Column(String(50), default="rule_based_v1")
    reason          = Column(Text, nullable=True)  # Why AI suggested this

    # User interaction
    accepted        = Column(Boolean, nullable=True)  # null = not yet acted on
    logged_at       = Column(DateTime(timezone=True), nullable=True)  # when user actually logged it


# ══════════════════════════════════════════════════════════════════════════
# DAILY TRACKING
# ══════════════════════════════════════════════════════════════════════════
class DailyTracking(Base):
    """
    Aggregated daily health metrics per user.
    Populated from wearable sync, manual input, or calculated from meal logs.
    """
    __tablename__ = "daily_tracking"

    id              = uuid_pk()
    user_id         = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    date            = Column(DateTime(timezone=True), nullable=False)  # date only (store as datetime)

    # Activity
    steps           = Column(Integer, default=0)
    calories_burned = Column(Float, default=0.0)
    active_minutes  = Column(Integer, default=0)
    distance_km     = Column(Float, default=0.0)

    # Sleep
    sleep_hours     = Column(Float, nullable=True)
    sleep_quality   = Column(Integer, nullable=True)  # 1-10

    # Vitals (from wearable)
    avg_heart_rate  = Column(Integer, nullable=True)
    resting_hr      = Column(Integer, nullable=True)
    water_ml        = Column(Integer, default=0)

    # Nutrition totals (from MealLogs)
    calories_eaten  = Column(Float, default=0.0)
    protein_eaten_g = Column(Float, default=0.0)
    carb_eaten_g    = Column(Float, default=0.0)
    fat_eaten_g     = Column(Float, default=0.0)

    # Daily score (0-100)
    health_score    = Column(Integer, nullable=True)

    data_source     = Column(String(50), default="manual")  # manual | apple_health | google_fit | nutriai_band
    created_at      = now_col()
    updated_at      = updated_col()

    user            = relationship("User", back_populates="tracking")


# ══════════════════════════════════════════════════════════════════════════
# CHALLENGES
# ══════════════════════════════════════════════════════════════════════════
class Challenge(Base):
    """Community health challenges."""
    __tablename__ = "challenges"

    id              = uuid_pk()
    title           = Column(String(300), nullable=False)
    description     = Column(Text)
    challenge_type  = Column(String(50))  # steps | nutrition | sleep | hydration | streak
    target_value    = Column(Float)        # e.g. 10000 steps, 7 days
    duration_days   = Column(Integer, default=7)
    reward_points   = Column(Integer, default=100)
    reward_desc     = Column(String(300), nullable=True)
    is_active       = Column(Boolean, default=True)
    starts_at       = Column(DateTime(timezone=True), nullable=True)
    ends_at         = Column(DateTime(timezone=True), nullable=True)
    sponsored_by    = Column(String(200), nullable=True)  # partner brand
    created_at      = now_col()

    participants    = relationship("UserChallenge", back_populates="challenge")


class UserChallenge(Base):
    """User's participation & progress in a challenge."""
    __tablename__ = "user_challenges"

    id              = uuid_pk()
    user_id         = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    challenge_id    = Column(UUID(as_uuid=True), ForeignKey("challenges.id"), nullable=False)
    joined_at       = now_col()
    progress        = Column(Float, default=0.0)
    completed       = Column(Boolean, default=False)
    completed_at    = Column(DateTime(timezone=True), nullable=True)
    points_earned   = Column(Integer, default=0)

    user            = relationship("User", back_populates="challenge_progress")
    challenge       = relationship("Challenge", back_populates="participants")
