VibeCaaS (Local MVP)

A minimal, runnable MVP of VibeCaaS: a Replit/Lovable-like platform that provisions isolated app containers per user. This repo runs locally with Docker Compose and includes:

- FastAPI backend (auth, app CRUD, container lifecycle via Docker SDK)
- Next.js frontend (login/signup, apps dashboard, create/start/stop/restart/delete)
- PostgreSQL and Redis (for future use)

Quick start

1) Prereqs: Docker, Docker Compose, Node.js 18+
2) Setup env
   cp .env.example .env
3) Start services
   docker compose up -d --build
4) Open UI
   http://localhost:3000

Default API

- API base: http://localhost:8000
- Docs: http://localhost:8000/docs

Workflow

- Sign up → Login → Create App → Backend starts an isolated container (python http.server) → View app URL (localhost:random_port) → Start/Stop/Restart/Delete

Notes

- Containers are launched via Docker socket from the backend container; ensure /var/run/docker.sock is mounted.
- This MVP returns localhost URLs using dynamic host ports rather than wildcard subdomains. NGINX + wildcard routing and NVIDIA Cloud K8s manifests can be layered later.

Next steps (cloud)

- Replace local Docker with Kubernetes on NVIDIA Cloud (GPU Operator, DCGM, Ingress, NGC registry)
- Implement image builds (Kaniko/BuildKit) and push to NGC
- Add metrics, billing, GPU scheduling, and policies per the architecture doc

License

MIT

# VibeCaaSPlatform