"""
generate_resources.py
----------------------
Lee drive_export.csv (generado por Apps Script) + subcategories.json
y genera resources.json listo para importar a MongoDB.

Maneja un problema del CSV original: como se generó con join(","), los
nombres de archivo que contienen comas (ej. "Guías docente 9°, anexos.pdf")
rompen el parseo normal por columnas. Aquí se reconstruye cada fila con
una expresión regular que ancla el id de Drive y la URL, sin importar
cuántas comas tenga el nombre del archivo.
"""

import json
import re
import unicodedata
import uuid
from datetime import datetime, timezone

CREATED_BY = "01d32647-3f4c-4eba-9501-95108dbcf437"
UPDATED_BY = CREATED_BY

CSV_PATH = "drive_export.csv"
SUBCATS_PATH = "subcategories.json"
OUTPUT_PATH = "resources.json"
REPORT_PATH = "reporte_no_encontrados.json"

# Carpetas que sabemos que NO son subcategorías de contenido
# (se excluyen automáticamente, no generan error)
IGNORAR = {"destacados", "fotos img", "fotos", "img"}

ROW_PATTERN = re.compile(
    r'^(.*),([a-zA-Z0-9_-]{15,}),'
    r'(https://drive\.google\.com/file/d/[a-zA-Z0-9_-]+/view\?usp=drivesdk),'
    r'([^,]*),(.*)$'
)


def iso_now():
    return datetime.now(timezone.utc).isoformat()


def normalizar(texto):
    """Quita emojis/símbolos, tildes-insensible en mayúsculas, y espacios extra."""
    texto = texto.strip()
    # Quita cualquier caracter que no sea letra/número/espacio (emojis, ZWJ, etc.)
    texto = "".join(
        ch for ch in texto
        if unicodedata.category(ch)[0] in ("L", "N") or ch.isspace()
    )
    texto = " ".join(texto.split())  # colapsa espacios múltiples
    return texto.strip().upper()


def parse_csv(path):
    filas = []
    malas = []
    with open(path, encoding="utf8") as f:
        lineas = f.read().splitlines()

    for i, linea in enumerate(lineas[1:], start=2):  # salta encabezado
        if not linea.strip():
            continue
        m = ROW_PATTERN.match(linea)
        if not m:
            malas.append((i, linea))
            continue
        nombre, file_id, url, subcat, ruta = m.groups()
        filas.append({
            "nombre_archivo": nombre.strip(),
            "id_archivo": file_id.strip(),
            "url": url.strip(),
            "subcategoria": subcat.strip(),
            "ruta": ruta.strip(),
        })
    return filas, malas


# Alias: nombre de carpeta en Drive -> nombre real en subcategories.json
# (variaciones de redacción que se refieren a la misma subcategoría)
ALIASES = {
    "GUIAS DOCENTE": "GUIA DOCENTE",
    "EDUC ARTISTICA": "EDUCACION ARTISTICA",
}


def sin_tildes(texto):
    nfkd = unicodedata.normalize("NFKD", texto)
    return "".join(c for c in nfkd if not unicodedata.combining(c))


def construir_indice(subcats):
    indice = {}
    for s in subcats:
        clave = sin_tildes(normalizar(s["name"]))
        indice[clave] = {"id": s["id"], "icon": s.get("icon", "BookOpen")}
    return indice


def main():
    with open(SUBCATS_PATH, encoding="utf8") as f:
        subcats = json.load(f)

    indice = construir_indice(subcats)

    filas, malas = parse_csv(CSV_PATH)

    resources = []
    sin_match = {}

    for row in filas:
        clave_original = row["subcategoria"]
        clave = sin_tildes(normalizar(clave_original))

        if clave.lower() in IGNORAR:
            continue

        clave = ALIASES.get(clave, clave)

        if clave not in indice:
            sin_match.setdefault(clave_original, []).append(row["nombre_archivo"])
            continue

        info = indice[clave]

        resource = {
            "id": str(uuid.uuid4()),
            "name": row["nombre_archivo"],
            "subcategory_id": info["id"],
            "description": row["nombre_archivo"].rsplit(".", 1)[0],
            "icon": info["icon"],
            "url": row["url"],
            "created_by": CREATED_BY,
            "updated_by": UPDATED_BY,
            "created_at": iso_now(),
            "updated_at": iso_now(),
            "notebook_url": "",
        }
        resources.append(resource)

    with open(OUTPUT_PATH, "w", encoding="utf8") as f:
        json.dump(resources, f, ensure_ascii=False, indent=2)

    reporte = {
        "filas_csv_totales": len(filas),
        "filas_csv_con_error_de_formato": len(malas),
        "recursos_generados": len(resources),
        "subcategorias_sin_match": {k: len(v) for k, v in sin_match.items()},
        "ejemplos_por_subcategoria_sin_match": {k: v[:3] for k, v in sin_match.items()},
        "lineas_con_error_de_formato": [l for l, _ in malas],
    }
    with open(REPORT_PATH, "w", encoding="utf8") as f:
        json.dump(reporte, f, ensure_ascii=False, indent=2)

    print("=" * 50)
    print("Filas leídas del CSV:      ", len(filas))
    print("Filas con error de formato:", len(malas))
    print("Recursos generados:        ", len(resources))
    print("Subcategorías sin match:   ", len(sin_match))
    if sin_match:
        print("\n  ->", ", ".join(sin_match.keys()))
    print("=" * 50)
    print(f"Generado: {OUTPUT_PATH}")
    print(f"Reporte:  {REPORT_PATH}")


if __name__ == "__main__":
    main()
