"""
Entrypoint for hosting providers that expect `main:app` at the repository root.
This forwards to `backend.main:app` so Deploys (Render/Vercel/Heroku) that run
`uvicorn main:app` will find the FastAPI `app` instance.

We wrap the import in a try/except and print the full traceback so that
startup import errors (missing env vars, DB connection issues, module import
errors) are captured clearly in the platform logs.
"""
import sys
import traceback
from pathlib import Path

# Ensure repository root is on sys.path (Render sometimes runs modules so
# that package imports fail if the root isn't present). This makes importing
# the `backend` package robust when Uvicorn runs `main:app`.
ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

try:
    from backend.main import app  # re-export app
except Exception:
    print("Failed to import backend.main:app during startup", file=sys.stderr)
    traceback.print_exc()
    raise
