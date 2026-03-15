# NutriAI — Developer Makefile
# Usage: make <command>

.PHONY: help dev-backend dev-frontend dev seed migrate test lint docker-up docker-down clean

help:
	@echo ""
	@echo "  NutriAI Development Commands"
	@echo "  ─────────────────────────────"
	@echo "  make dev          Start both frontend and backend"
	@echo "  make dev-backend  Start FastAPI backend only"
	@echo "  make dev-frontend Start React frontend only"
	@echo "  make seed         Seed database with food data"
	@echo "  make migrate      Run Alembic migrations"
	@echo "  make test         Run all tests"
	@echo "  make lint         Run linter"
	@echo "  make docker-up    Start all services via Docker"
	@echo "  make docker-down  Stop all Docker services"
	@echo "  make clean        Remove cache and temp files"
	@echo ""

## ── Development ─────────────────────────────────────────────────────────
dev: dev-backend dev-frontend

dev-backend:
	@echo "🚀 Starting FastAPI backend on :8000"
	cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend:
	@echo "🎨 Starting React frontend on :5173"
	cd frontend && npm run dev

## ── Database ─────────────────────────────────────────────────────────────
migrate:
	@echo "🗄️  Running Alembic migrations..."
	cd backend && alembic upgrade head

migrate-create:
	@echo "📝 Creating new migration..."
	cd backend && alembic revision --autogenerate -m "$(name)"

seed:
	@echo "🌱 Seeding database..."
	cd backend && python scripts/seed_food_db.py

## ── Testing ──────────────────────────────────────────────────────────────
test:
	@echo "🧪 Running all tests..."
	cd backend && pytest

test-unit:
	cd backend && pytest tests/unit/ -v

test-integration:
	cd backend && pytest tests/integration/ -v

test-cov:
	cd backend && pytest --cov=app --cov-report=html
	@echo "Coverage report: backend/htmlcov/index.html"

## ── Code Quality ─────────────────────────────────────────────────────────
lint:
	cd backend && black . && isort . && flake8 app/

## ── ML ───────────────────────────────────────────────────────────────────
eda:
	@echo "📊 Running EDA notebook..."
	cd . && python ml/notebooks/01_eda_food_database.py

export-data:
	@echo "📦 Exporting training data..."
	cd backend && python scripts/export_training_data.py --output ../ml/datasets/interactions.csv

train:
	@echo "🤖 Training recommendation model..."
	python ml/notebooks/03_train_recommendation.py

## ── Docker ───────────────────────────────────────────────────────────────
docker-up:
	@echo "🐳 Starting all services..."
	docker-compose up -d postgres redis
	sleep 3
	docker-compose up backend frontend

docker-dev:
	docker-compose --profile dev up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f backend

## ── Celery ───────────────────────────────────────────────────────────────
celery-worker:
	cd backend && celery -A app.core.celery_app worker --loglevel=info

celery-beat:
	cd backend && celery -A app.core.celery_app beat --loglevel=info

celery-flower:
	cd backend && celery -A app.core.celery_app flower --port=5555

## ── Utils ────────────────────────────────────────────────────────────────
install-backend:
	cd backend && pip install -r requirements.txt

install-frontend:
	cd frontend && npm install

install: install-backend install-frontend

clean:
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null; true
	find . -name "*.pyc" -delete 2>/dev/null; true
	find . -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null; true
	find . -name "test.db" -delete 2>/dev/null; true
	@echo "✅ Cleaned"

setup: install migrate seed
	@echo ""
	@echo "✅ NutriAI setup complete!"
	@echo "   Backend: uvicorn app.main:app --reload"
	@echo "   Frontend: cd frontend && npm run dev"
	@echo "   Demo login: demo@nutriai.vn / demo1234"
