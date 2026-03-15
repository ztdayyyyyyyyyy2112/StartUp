# NutriAI API Documentation

Base URL: `http://localhost:8000/api/v1`  
Interactive docs: `http://localhost:8000/docs`

## Authentication

All endpoints (except register/login) require a Bearer token:
```
Authorization: Bearer <access_token>
```

Tokens expire in 30 minutes. Use `/auth/refresh` to get a new one.

---

## Endpoints Quick Reference

### 🔐 Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Đăng ký tài khoản mới |
| POST | `/auth/login` | Đăng nhập, nhận JWT |
| POST | `/auth/refresh` | Làm mới access token |
| GET  | `/auth/me` | Thông tin tài khoản hiện tại |
| POST | `/auth/logout` | Đăng xuất |

### 👤 Users
| Method | Path | Description |
|--------|------|-------------|
| GET  | `/users/me` | Lấy hồ sơ chi tiết |
| PATCH | `/users/me` | Cập nhật thông tin |
| GET  | `/users/me/profile` | Lấy hồ sơ sức khoẻ |

### 🍜 Foods
| Method | Path | Description |
|--------|------|-------------|
| GET  | `/foods/search?q=phở` | Tìm kiếm món ăn |
| GET  | `/foods/popular` | Món ăn phổ biến |
| GET  | `/foods/categories` | Danh sách danh mục |
| GET  | `/foods/{id}` | Chi tiết một món |
| POST | `/foods/` | Thêm món mới |

### 🥗 Meals
| Method | Path | Description |
|--------|------|-------------|
| POST | `/meals/log` | Ghi lại bữa ăn |
| GET  | `/meals/today` | Tóm tắt dinh dưỡng hôm nay |
| GET  | `/meals/day/{YYYY-MM-DD}` | Tóm tắt ngày cụ thể |
| GET  | `/meals/history` | Lịch sử bữa ăn |
| DELETE | `/meals/{id}` | Xoá bữa ăn |

### 🤖 AI
| Method | Path | Description |
|--------|------|-------------|
| POST | `/ai/suggestions` | Gợi ý bữa ăn |
| POST | `/ai/chat` | Chatbot dinh dưỡng |
| POST | `/ai/analyze` | Phân tích dinh dưỡng |

### 📊 Tracking
| Method | Path | Description |
|--------|------|-------------|
| POST | `/tracking/log` | Ghi chỉ số sức khoẻ |
| GET  | `/tracking/weekly` | Dữ liệu 7 ngày |
| POST | `/tracking/wearable/sync` | Đồng bộ wearable |

### 🏆 Challenges
| Method | Path | Description |
|--------|------|-------------|
| GET  | `/challenges/` | Danh sách thử thách |
| POST | `/challenges/{id}/join` | Tham gia thử thách |
| GET  | `/challenges/my` | Thử thách đang tham gia |
| GET  | `/challenges/leaderboard` | Bảng xếp hạng |

### 📈 Analytics
| Method | Path | Description |
|--------|------|-------------|
| GET  | `/analytics/summary?days=30` | Tổng quan sức khoẻ |
| POST | `/analytics/nutrition` | Phân tích dinh dưỡng |

---

## Request/Response Examples

### Register
```json
POST /auth/register
{
  "full_name": "Nguyễn Văn A",
  "email": "user@example.com",
  "password": "mypassword123"
}

→ 201
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

### Log a Meal
```json
POST /meals/log
{
  "meal_type": "lunch",
  "entries": [
    {"food_item_id": "uuid-here", "quantity_g": 400}
  ],
  "notes": "Phở ở quán quen"
}

→ 201
{
  "id": "...",
  "meal_type": "lunch",
  "logged_at": "2029-03-14T12:15:00Z",
  "total_calories": 380,
  "total_protein_g": 22,
  "entries": [...]
}
```

### Get AI Suggestions
```json
POST /ai/suggestions
{
  "meal_type": "dinner",
  "count": 3
}

→ 200
{
  "meal_type": "dinner",
  "suggestions": [
    {
      "food_item": {"name_vi": "Bún bò Huế", ...},
      "match_score": 0.92,
      "match_pct": 92,
      "reason": "Phù hợp cao với mục tiêu · Giàu protein",
      "model_version": "rule_based_v1"
    }
  ],
  "generated_by": "rule_based_v1"
}
```

### Chat with AI
```json
POST /ai/chat
{
  "message": "Tôi đang giảm cân, nên ăn gì cho bữa tối?"
}

→ 200
{
  "reply": "Để giảm cân hiệu quả: tạo thâm hụt calo ...",
  "conversation_id": "uuid",
  "disclaimer": "Thông tin từ AI chỉ mang tính tham khảo..."
}
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad Request — dữ liệu không hợp lệ |
| 401 | Unauthorized — thiếu hoặc sai token |
| 403 | Forbidden — không có quyền |
| 404 | Not Found |
| 409 | Conflict — email đã tồn tại |
| 422 | Validation Error — sai format |
| 429 | Too Many Requests — rate limit |
| 500 | Internal Server Error |
