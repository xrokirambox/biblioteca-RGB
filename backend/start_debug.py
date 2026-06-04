
import os
import sys
import traceback
from pprint import pprint

print("=== START DEBUG ===")
print("Working dir:", os.getcwd())
print("Sys.path:")
pprint(sys.path)

CRITICAL = ["MONGO_URL", "DB_NAME", "JWT_SECRET", "CORS_ORIGINS", "SECURE_COOKIES", "PORT"]
print("nEnvironment (presence only, secrets masked):")
for k in CRITICAL:
    v = os.environ.get(k)
    print(f"  {k}:", "SET" if v else "MISSING")

try:
    # Ensure repo root is on path
    root = os.path.dirname(os.path.abspath(__file__))
    if root not in sys.path:
        sys.path.insert(0, root)
    print("nImporting backend.main...")
    from backend.main import app
    print("Imported backend.main -> app OK")
except Exception:
    print("Failed to import backend.main:", file=sys.stderr)
    traceback.print_exc()
    sys.exit(1)

try:
    import uvicorn

    port = int(os.environ.get("PORT", 8000))
    print(f"nStarting uvicorn on 0.0.0.0:{port}... (this will block)")
    uvicorn.run(app, host="0.0.0.0", port=port)
except Exception:
    print("Uvicorn run failed:", file=sys.stderr)
    traceback.print_exc()
    sys.exit(1)
