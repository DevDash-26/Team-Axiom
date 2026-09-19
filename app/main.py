"""Render entrypoint when Start Command is still `uvicorn app.main:app` at repo root.

Loads the real FastAPI app from ``backend/app`` without requiring Root Directory.
"""

from __future__ import annotations

import importlib.util
import sys
import types
from pathlib import Path

_BACKEND = Path(__file__).resolve().parents[1] / "backend"
_BACKEND_APP = _BACKEND / "app"

if str(_BACKEND) not in sys.path:
    sys.path.insert(0, str(_BACKEND))

# Replace the root shim package with a package rooted at backend/app
# so `from app.config import ...` inside backend code resolves correctly.
_real_app = types.ModuleType("app")
_real_app.__file__ = str(_BACKEND_APP / "__init__.py")
_real_app.__path__ = [str(_BACKEND_APP)]  # type: ignore[attr-defined]
sys.modules["app"] = _real_app

_init_path = _BACKEND_APP / "__init__.py"
if _init_path.exists():
    _init_spec = importlib.util.spec_from_file_location(
        "app",
        _init_path,
        submodule_search_locations=[str(_BACKEND_APP)],
    )
    assert _init_spec is not None and _init_spec.loader is not None
    _init_spec.loader.exec_module(_real_app)

_main_spec = importlib.util.spec_from_file_location(
    "_unihive_backend_main",
    _BACKEND_APP / "main.py",
)
assert _main_spec is not None and _main_spec.loader is not None
_main_mod = importlib.util.module_from_spec(_main_spec)
_main_spec.loader.exec_module(_main_mod)

app = _main_mod.app
