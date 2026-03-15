"""
Integration test — full meal logging workflow:
  Register → Login → Create food → Log meal → Get daily summary → Check analytics
"""
import pytest


@pytest.mark.asyncio
async def test_full_meal_workflow(client):
    """
    Full integration test:
    1. Register new user
    2. Login
    3. Update profile with health goal
    4. Create a food item
    5. Log a meal with that food
    6. Get today's summary
    7. Log tracking data
    8. Get weekly tracking
    9. Request AI suggestions
    10. Get analytics summary
    """

    # 1. Register
    reg = await client.post("/api/v1/auth/register", json={
        "full_name": "Integration Test User",
        "email": "integration@test.vn",
        "password": "inttest123"
    })
    assert reg.status_code == 201
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Verify login works
    login = await client.post("/api/v1/auth/login", json={
        "email": "integration@test.vn",
        "password": "inttest123"
    })
    assert login.status_code == 200

    # 3. Update profile
    profile = await client.patch("/api/v1/users/me", json={
        "full_name": "Integration Test Updated",
        "age": 26,
        "gender": "male",
        "weight_kg": 70.0,
        "height_cm": 175.0,
        "health_goal": "lose_weight",
        "calorie_target": 1800,
    }, headers=headers)
    assert profile.status_code == 200

    # 4. Create a food
    food = await client.post("/api/v1/foods/", json={
        "name_vi": "Ức gà integration test",
        "category": "main",
        "cuisine": "vietnamese",
        "calories": 165,
        "protein_g": 31,
        "carb_g": 0,
        "fat_g": 3.6,
        "serving_size_g": 150,
        "meal_time": ["lunch", "dinner"],
        "allergens": [],
    }, headers=headers)
    assert food.status_code == 201
    food_id = food.json()["id"]

    # 5. Log a meal
    meal = await client.post("/api/v1/meals/log", json={
        "meal_type": "lunch",
        "entries": [{"food_item_id": food_id, "quantity_g": 150}],
        "notes": "Integration test meal"
    }, headers=headers)
    assert meal.status_code == 201
    meal_data = meal.json()
    assert meal_data["meal_type"] == "lunch"
    assert meal_data["total_calories"] == pytest.approx(165.0, abs=1)
    assert meal_data["total_protein_g"] == pytest.approx(31.0, abs=1)
    assert len(meal_data["entries"]) == 1

    # 6. Daily summary
    from datetime import datetime, timezone
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    summary = await client.get("/api/v1/meals/today", headers=headers)
    assert summary.status_code == 200
    data = summary.json()
    assert data["total_calories"] >= 165  # at least our logged meal
    assert len(data["meals"]) >= 1

    # 7. Log tracking
    track = await client.post("/api/v1/tracking/log", json={
        "steps": 7500,
        "sleep_hours": 8.0,
        "water_ml": 2000,
        "avg_heart_rate": 68,
        "active_minutes": 45,
    }, headers=headers)
    assert track.status_code == 200
    assert track.json()["steps"] == 7500
    assert track.json()["health_score"] is not None

    # 8. Weekly tracking
    weekly = await client.get("/api/v1/tracking/weekly", headers=headers)
    assert weekly.status_code == 200
    assert "days" in weekly.json()

    # 9. AI suggestions
    ai = await client.post("/api/v1/ai/suggestions", json={
        "meal_type": "dinner",
        "count": 3,
    }, headers=headers)
    assert ai.status_code == 200
    assert len(ai.json()["suggestions"]) <= 3

    # 10. Analytics
    analytics = await client.get("/api/v1/analytics/summary?days=7", headers=headers)
    assert analytics.status_code == 200
    data = analytics.json()
    assert "avg_health_score" in data
    assert "insights" in data
    assert isinstance(data["insights"], list)

    print("\n✅ Full integration test PASSED")
