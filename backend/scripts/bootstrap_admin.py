"""Create the first administrator without putting a password in code or .env.

Run from backend:
python scripts/bootstrap_admin.py --email admin@colegio.edu --name "Nombre"
"""
import argparse
import asyncio
import getpass
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.core.security import hash_password  # noqa: E402
from app.db.client import close_db, db, ensure_indexes  # noqa: E402


async def main(email: str, name: str) -> None:
    password = getpass.getpass("Contraseña (mínimo 12 caracteres): ")
    confirmation = getpass.getpass("Repite la contraseña: ")
    if password != confirmation:
        raise SystemExit("Las contraseñas no coinciden.")
    if len(password) < 12:
        raise SystemExit("La contraseña debe tener al menos 12 caracteres.")
    normalized_email = email.lower().strip()
    await ensure_indexes()
    if await db.users.find_one({"email": normalized_email}):
        raise SystemExit("Ese correo ya está registrado. Cambia la contraseña desde el panel.")
    await db.users.insert_one({
        "id": str(uuid.uuid4()), "email": normalized_email,
        "name": name.strip() or "Administrador", "role": "admin",
        "password_hash": hash_password(password),
        "created_at": datetime.now(timezone.utc).isoformat(), "created_by": "bootstrap",
    })
    print("Administrador creado. La contraseña se guardó únicamente como hash bcrypt en MongoDB.")
    await close_db()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--email", required=True)
    parser.add_argument("--name", default="Administrador")
    args = parser.parse_args()
    asyncio.run(main(args.email, args.name))
