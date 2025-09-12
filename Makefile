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

