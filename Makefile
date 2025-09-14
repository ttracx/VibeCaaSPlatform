.PHONY: setup dev stop clean logs test migrate build seed fmt

setup:
	@echo "Setting up project..."
	@mkdir -p backend/app api frontend monitoring kubernetes/production terraform
	@cp -n .env.example .env || true
	@echo "Done. Edit .env as needed."

dev:
	@docker compose up -d --build

stop:
	@docker compose down

clean:
	@docker compose down -v --remove-orphans
	@docker system prune -f

logs:
	@docker compose logs -f --tail=200 | cat

test:
	@echo "Running backend tests..."
	@docker compose exec -T backend pytest -q || true

migrate:
	@docker compose exec -T backend alembic upgrade head || true

build:
	@docker compose build --no-cache

fmt:
	@docker compose exec -T backend bash -lc "black app && ruff check --fix app" || true
.PHONY: up down logs rebuild clean

up:
	docker compose up -d --build
	@echo "UI: http://localhost:3000  API: http://localhost:8000"

down:
	docker compose down

logs:
	docker compose logs -f --tail=200

rebuild:
	docker compose build --no-cache

clean:
	docker compose down -v
	rm -rf frontend/node_modules frontend/.next

