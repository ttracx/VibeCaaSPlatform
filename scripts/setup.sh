#!/usr/bin/env bash
set -euo pipefail

echo "VibeCaaS setup"

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env"
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker not found. Please install Docker and Docker Compose."
  exit 1
fi

docker compose up -d --build
echo "UI: http://localhost:3000  API: http://localhost:8000"

