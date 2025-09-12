# VibeCaaS Development Commands

.PHONY: help
help:
	@echo "VibeCaaS Development Commands"
	@echo "=============================="
	@echo "make setup       - Initial setup"
	@echo "make dev         - Start development environment"
	@echo "make stop        - Stop all services"
	@echo "make clean       - Clean all data"
	@echo "make logs        - View logs"
	@echo "make test        - Run tests"
	@echo "make build       - Build production images"
	@echo "make migrate     - Run database migrations"
	@echo "make shell-api   - Shell into API container"
	@echo "make shell-db    - Database shell"

.PHONY: setup
setup:
	@echo "Setting up VibeCaaS development environment..."
	cp .env.example .env
	cd frontend && npm install
	cd backend && pip install -r requirements.txt
	docker-compose build
	make migrate
	@echo "Setup complete! Run 'make dev' to start."

.PHONY: dev
dev:
	docker-compose up -d
	@echo "VibeCaaS is running!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend API: http://localhost:8000"
	@echo "Adminer: http://localhost:8080"
	@echo "Grafana: http://localhost:3001 (admin/admin)"

.PHONY: stop
stop:
	docker-compose down

.PHONY: clean
clean:
	docker-compose down -v
	rm -rf frontend/node_modules frontend/.next
	rm -rf backend/__pycache__ backend/.pytest_cache

.PHONY: logs
logs:
	docker-compose logs -f

.PHONY: logs-api
logs-api:
	docker-compose logs -f backend

.PHONY: test
test:
	cd backend && pytest
	cd frontend && npm test

.PHONY: build
build:
	docker-compose build --no-cache

.PHONY: migrate
migrate:
	docker-compose run --rm backend alembic upgrade head

.PHONY: shell-api
shell-api:
	docker-compose exec backend /bin/bash

.PHONY: shell-db
shell-db:
	docker-compose exec postgres psql -U vibecaas_user -d vibecaas

.PHONY: format
format:
	cd backend && black .
	cd frontend && npm run format

.PHONY: lint
lint:
	cd backend && flake8 .
	cd frontend && npm run lint