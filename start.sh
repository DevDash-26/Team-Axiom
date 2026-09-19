#!/usr/bin/env bash
# Render / production entrypoint for the monorepo.
# Always run from repo root (works with or without Root Directory = backend).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
export PYTHONPATH="${ROOT}/backend${PYTHONPATH:+:${PYTHONPATH}}"
cd "$ROOT/backend"
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
