"""
Unit tests for Auth endpoints.
Run: pytest tests/unit/test_auth.py -v
"""
import pytest


@pytest.mark.asyncio
async def test_register_success(client):
    resp = await client.post("/api/v1/auth/register", json={
        "full_name": "Nguyễn Test",
        "email": "newuser@test.vn",
        "password": "password123"
    })
    assert resp.status_code == 201
    data = resp.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_register_duplicate_email(client, test_user):
    resp = await client.post("/api/v1/auth/register", json={
        "full_name": "Dupe User",
        "email": "test@nutriai.vn",   # same as test_user
        "password": "password123"
    })
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_login_success(client, test_user):
    resp = await client.post("/api/v1/auth/login", json={
        "email": "test@nutriai.vn",
        "password": "testpassword"
    })
    assert resp.status_code == 200
    assert "access_token" in resp.json()


@pytest.mark.asyncio
async def test_login_wrong_password(client, test_user):
    resp = await client.post("/api/v1/auth/login", json={
        "email": "test@nutriai.vn",
        "password": "wrongpassword"
    })
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_get_me(client, auth_headers):
    resp = await client.get("/api/v1/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == "test@nutriai.vn"
    assert data["full_name"] == "Test User"


@pytest.mark.asyncio
async def test_get_me_no_token(client):
    resp = await client.get("/api/v1/auth/me")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_refresh_token(client, test_user):
    # First login to get tokens
    login = await client.post("/api/v1/auth/login", json={
        "email": "test@nutriai.vn", "password": "testpassword"
    })
    refresh_token = login.json()["refresh_token"]

    # Refresh
    resp = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert resp.status_code == 200
    assert "access_token" in resp.json()


@pytest.mark.asyncio
async def test_health_check(client):
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"
