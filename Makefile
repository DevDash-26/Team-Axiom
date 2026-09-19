# UCL Campus Hub — local commands. Run from the repo root.

.PHONY: install dev backend frontend seed test

PYTHON ?= $(shell command -v python3.11 || command -v python3)

install:
	$(PYTHON) -m venv backend/.venv
	backend/.venv/bin/pip install -r backend/requirements.txt
	cd frontend && npm install

backend:
	cd backend && env -u DATABASE_URL .venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

frontend:
	cd frontend && npm run dev -- --port 3000

dev:
	$(MAKE) -j2 backend frontend

seed:
	cd backend && env -u DATABASE_URL .venv/bin/python -m app.seed

test:
	cd backend && env -u DATABASE_URL .venv/bin/pytest -q
