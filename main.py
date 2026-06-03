"""Entrypoint wrapper for Render and local deployment."""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

try:
    from backend.main import app
except Exception:
    import traceback
    import sys as _sys

    print("Failed to import backend.main:app", file=_sys.stderr)
    traceback.print_exc()
    raise
