"""
Marca de Mi Colmena para los reportes en PDF.

El logo se incrusta como data URI en base64, igual que ya se hace
con las gráficas de matplotlib. Ver el LEEME para el porqué.
"""

import base64
from pathlib import Path

from django.conf import settings


RUTA_LOGO = (
    Path(settings.BASE_DIR)
    / "panel_admin"
    / "static"
    / "panel_admin"
    / "img"
    / "logo_reporte.png"
)

_cache = None
_fallido = False


def logo_reporte():
    """
    Devuelve el logo como data URI listo para un src, o None si el
    archivo no está.

    Se lee del disco una sola vez. Si falla no reintenta en cada
    reporte: deja el aviso en consola y sigue devolviendo None, y
    las plantillas muestran el texto de respaldo.
    """
    global _cache, _fallido

    if _cache is not None:
        return _cache

    if _fallido:
        return None

    try:
        datos = base64.b64encode(RUTA_LOGO.read_bytes()).decode("ascii")
        _cache = f"data:image/png;base64,{datos}"
        return _cache

    except OSError as error:
        _fallido = True
        print(f"AVISO: no se pudo leer el logo del reporte ({RUTA_LOGO}): {error}")
        return None


def contexto_marca():
    """
    Atajo para agregar la marca al contexto de cualquier reporte:

        contexto = {
            ...,
            **contexto_marca(),
        }
    """
    return {
        "logo_reporte": logo_reporte(),
        "nombre_sistema": "Mi Colmena",
    }
