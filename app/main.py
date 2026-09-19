"""Shim: import the FastAPI app from backend/ when cwd is the repo root.

Render's dashboard Start Command is often
`uvicorn app.main:app --host 0.0.0.0 --port $PORT` with Root Directory empty.
That looks for `app` next to this file, not under `backend/`. Put `backend` on
sys.path first, then load the real package.
"""

from __future__ import annotations

import sys
from pathlib import Path

_backend = str(Path(__file__).resolve().parent.parent / "backend")
if _backend not in sys.path:
    sys.path.insert(0, _backend)

for _name in [key for key in list(sys.modules) if key == "app" or key.startswith("app.")]:
    del sys.modules[_name]

from app.main import app as app  # noqa: E402
