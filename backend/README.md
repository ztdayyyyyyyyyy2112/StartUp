# 🥗 NutriAI — AI Nutrition Platform

Nền tảng AI tư vấn dinh dưỡng & thực phẩm cá nhân hoá cho người Việt.

## Cấu trúc dự án

```
nutriai/
├── frontend/          ← React + Vite SPA (4 pages hoàn chỉnh)
├── backend/           ← FastAPI REST API
│   ├── app/
│   │   ├── api/v1/    ← Route endpoints (auth, meals, ai, users, tracking...)
│   │   ├── core/      ← Config, security, logging
│   │   ├── db/        ← Database engine, session, migrations
│   │   ├── models/    ← SQLAlchemy ORM models
│   │   ├── schemas/   ← Pydantic request/response schemas
│   │   ├── services/  ← Business logic layer
│   │   ├── ai/        ← AI/ML engine (plug models here)
│   │   └── middleware/← Auth middleware, rate limiting, CORS
│   ├── scripts/       ← DB seed, data import scripts
│   └── tests/         ← Unit & integration tests
├── data/
│   ├── raw/           ← Raw data từ USDA, crawl, partner APIs
│   ├── processed/     ← Cleaned, normalized data
│   ├── food_database/ ← 1000+ món ăn Việt (JSON/CSV)
│   └── user_data/     ← Anonymized user behaviour data (cho ML)
├── ml/
│   ├── notebooks/     ← Jupyter notebooks cho EDA, training
│   ├── experiments/   ← MLflow / W&B experiment logs
│   ├── datasets/      ← Training datasets
│   └── checkpoints/   ← Saved model weights
├── configs/           ← Environment configs
└── docs/              ← API docs, architecture diagrams
```

## Khởi động nhanh

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env   # điền thông tin
alembic upgrade head       # chạy migration
python scripts/seed_food_db.py  # seed dữ liệu mẫu
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

API docs: http://localhost:8000/docs  
Frontend: http://localhost:5173

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6 |
| Backend | FastAPI, Python 3.11+ |
| Database | PostgreSQL (chính) + Redis (cache) |
| ORM | SQLAlchemy 2.0 + Alembic |
| Auth | JWT (access + refresh tokens) |
| AI/ML | PyTorch / scikit-learn (plug-in ready) |
| Task Queue | Celery + Redis |
| Container | Docker + Docker Compose |

## Roadmap kỹ thuật

- **Hiện tại**: Mock AI (rule-based), PostgreSQL, JWT auth
- **MVP 2029**: Integrate trained ML model cho menu recommendation
- **2030**: Fine-tuned LLM chatbot dinh dưỡng
- **2031**: Wearable data pipeline, real-time tracking
- **2032**: Genomics API integration (Genetica)
