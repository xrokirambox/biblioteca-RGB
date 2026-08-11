"""
Generador de documentos "materia" (video) para MongoDB
--------------------------------------------------------
Toma una lista de links de YouTube y genera un JSON con documentos
listos para insertar en la colección, con el MISMO esquema que ya usás:

  id, name, subcategory_id, description, icon, url, notebook_url,
  created_by, updated_by, created_at, updated_at, content_type,
  cover, embed_html

- El "cover" se deriva solo del video_id (no hace falta pedirlo).
- El "embed_html" queda limpio: solo el <iframe>, sin texto pegado.
- El "name" se obtiene automáticamente del título del video (oEmbed),
  salvo que se lo indiques manualmente en urls.txt.

USO:
1. pip install requests

2. Completá los valores por defecto de tu proyecto en la sección
   CONFIG más abajo (subcategory_id, created_by, icon, etc.)

3. Cargá tus links en "urls.txt" (uno por línea). Formato simple:

       https://www.youtube.com/watch?v=XXXXXXXXXXX

   Formato avanzado (opcional), separado por "|", para sobreescribir
   nombre, descripción o subcategoría puntualmente por video:

       https://www.youtube.com/watch?v=XXXXXXXXXXX|MCD Y MCM|MCM Y MCD|2bcf4635-5d58-4c07-9c38-9fbd24b6c46c

   Los campos que dejes vacíos ("") usan el valor por defecto de CONFIG.

4. Ejecutar:
       python generar_videos_mongo.py

5. Resultado: "videos.json" con la lista de documentos.
"""

import json
import os
import re
import sys
import uuid
from datetime import datetime, timezone
from urllib.parse import urlparse, parse_qs

try:
    import requests
except ImportError:
    print("Falta instalar la librería 'requests'. Ejecutá: pip install requests")
    sys.exit(1)


# ----------------------------------------------------------------------
# CONFIG: ajustá estos valores por defecto a los de tu proyecto
# ----------------------------------------------------------------------
CONFIG = {
    "subcategory_id": "2bcf4635-5d58-4c07-9c38-9fbd24b6c46c",  # 👈 poné la tuya
    "created_by": "01d32647-3f4c-4eba-9501-95108dbcf437",       # 👈 tu user id
    "updated_by": "01d32647-3f4c-4eba-9501-95108dbcf437",       # 👈 tu user id
    "icon": "BookOpen",
    "notebook_url": "",
}

ARCHIVO_URLS = "urls.txt"
ARCHIVO_SALIDA = "videos.json"


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def extraer_video_id(url: str):
    """Extrae el ID de video de distintos formatos de URL de YouTube."""
    parsed = urlparse(url)

    if parsed.hostname in ("youtu.be",):
        return parsed.path.lstrip("/")

    if parsed.hostname and "youtube.com" in parsed.hostname:
        if parsed.path == "/watch":
            qs = parse_qs(parsed.query)
            if "v" in qs:
                return qs["v"][0]
        if parsed.path.startswith("/embed/"):
            return parsed.path.split("/embed/")[1]
        if parsed.path.startswith("/shorts/"):
            return parsed.path.split("/shorts/")[1]

    match = re.search(r"(?:v=|/)([0-9A-Za-z_-]{11})(?:&|$|/)", url)
    if match:
        return match.group(1)

    return None


def obtener_titulo(url: str) -> str:
    """Consulta oEmbed de YouTube solo para el título (sin pedir nada más)."""
    try:
        resp = requests.get(
            "https://www.youtube.com/oembed",
            params={"url": url, "format": "json"},
            timeout=10,
        )
        resp.raise_for_status()
        return resp.json().get("title", "")
    except requests.RequestException as e:
        print(f"  ⚠ No se pudo obtener el título vía oEmbed ({e})")
        return ""


def cargar_lineas():
    if not os.path.exists(ARCHIVO_URLS):
        print(f"No se encontró '{ARCHIVO_URLS}'. Creá el archivo con un link por línea.")
        sys.exit(1)

    with open(ARCHIVO_URLS, "r", encoding="utf-8") as f:
        lineas = [linea.strip() for linea in f if linea.strip()]

    if not lineas:
        print(f"'{ARCHIVO_URLS}' está vacío.")
        sys.exit(1)

    print(f"Se cargaron {len(lineas)} líneas desde {ARCHIVO_URLS}")
    return lineas


def parsear_linea(linea: str):
    """
    Soporta:
      URL
      URL|nombre|descripcion|subcategory_id
    Los campos vacíos usan el default de CONFIG (o el título automático).
    """
    partes = [p.strip() for p in linea.split("|")]
    url = partes[0]
    nombre = partes[1] if len(partes) > 1 and partes[1] else None
    descripcion = partes[2] if len(partes) > 2 and partes[2] else ""
    subcategory_id = partes[3] if len(partes) > 3 and partes[3] else CONFIG["subcategory_id"]
    return url, nombre, descripcion, subcategory_id


def construir_documento(url, nombre, descripcion, subcategory_id, video_id):
    cover = f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"
    embed_html = (
        f'<iframe width="560" height="315" '
        f'src="https://www.youtube.com/embed/{video_id}" '
        f'frameborder="0" allow="accelerometer; autoplay; clipboard-write; '
        f'encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    )
    timestamp = now_iso()

    return {
        "id": str(uuid.uuid4()),
        "name": nombre,
        "subcategory_id": subcategory_id,
        "description": descripcion,
        "icon": CONFIG["icon"],
        "url": url,
        "notebook_url": CONFIG["notebook_url"],
        "created_by": CONFIG["created_by"],
        "updated_by": CONFIG["updated_by"],
        "created_at": timestamp,
        "updated_at": timestamp,
        "content_type": "video",
        "cover": cover,
        "embed_html": embed_html,
    }


def main():
    lineas = cargar_lineas()
    documentos = []

    for i, linea in enumerate(lineas, start=1):
        url, nombre, descripcion, subcategory_id = parsear_linea(linea)
        print(f"[{i}/{len(lineas)}] Procesando: {url}")

        video_id = extraer_video_id(url)
        if not video_id:
            print("  ✗ No se pudo extraer el video_id, se omite este link.")
            continue

        if not nombre:
            nombre = obtener_titulo(url) or "(sin título)"

        doc = construir_documento(url, nombre, descripcion, subcategory_id, video_id)
        documentos.append(doc)
        print(f"  ✓ {doc['name']}")

    with open(ARCHIVO_SALIDA, "w", encoding="utf-8") as f:
        json.dump(documentos, f, ensure_ascii=False, indent=2)

    print(f"\nListo. Se generaron {len(documentos)} documentos en '{ARCHIVO_SALIDA}'")
    print("Podés insertarlos con: mongoimport --db TU_DB --collection hierarchy_materias --file videos.json --jsonArray")


if __name__ == "__main__":
    main()
