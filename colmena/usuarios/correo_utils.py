"""
Utilidades para los correos de Mi Colmena.

Incrusta el logo dentro del mensaje (CID) en lugar de enlazarlo desde
una URL, para que se vea sin que el usuario tenga que dar
"mostrar imágenes" y sin depender de que el servidor esté arriba.

Compatible con Django 6.0. La forma antigua que circula en internet
(`correo.mixed_subtype = "related"` junto con `MIMEImage`) ya no
sirve: Django 6 eliminó ese atributo y dejó `MIMEBase` como obsoleto
de cara a Django 7.
"""

from pathlib import Path

from django.conf import settings
from django.core.mail import EmailMultiAlternatives


# Identificador que usan las plantillas en src="cid:logo_micolmena"
CID_LOGO = "logo_micolmena"

RUTA_LOGO = (
    Path(settings.BASE_DIR)
    / "usuarios"
    / "static"
    / "usuarios"
    / "img"
    / "logo_correo.png"
)

# El PNG se lee del disco una sola vez y queda en memoria.
_logo_cache = None
_logo_fallido = False


def leer_logo():
    """
    Devuelve los bytes del logo, o None si el archivo no está.

    Si falla una vez no reintenta en cada correo: deja el aviso en
    consola y sigue devolviendo None.
    """
    global _logo_cache, _logo_fallido

    if _logo_cache is not None:
        return _logo_cache

    if _logo_fallido:
        return None

    try:
        _logo_cache = RUTA_LOGO.read_bytes()
        return _logo_cache

    except OSError as error:
        _logo_fallido = True
        print(f"AVISO: no se pudo leer el logo del correo ({RUTA_LOGO}): {error}")
        return None


class CorreoConLogo(EmailMultiAlternatives):
    """
    Igual que EmailMultiAlternatives, pero incrusta el logo de Mi
    Colmena como parte "related" del HTML.

    Se usa exactamente igual que la clase de Django:

        correo = CorreoConLogo(
            subject=asunto,
            body=mensaje_texto,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[usuario.email],
        )
        correo.attach_alternative(mensaje_html, "text/html")
        correo.send(fail_silently=False)

    El logo se agrega solo al construir el mensaje. Si el archivo no
    está, el correo sale igual y el cliente muestra el texto
    alternativo "Mi Colmena": nunca vale la pena perder un código de
    verificación por una imagen.

    Estructura que produce:

        multipart/alternative
        |-- text/plain
        `-- multipart/related
            |-- text/html
            `-- image/png   <logo_micolmena>   inline

    Ese "related" es lo que le dice al cliente que la imagen pertenece
    al HTML. Sin eso, Gmail la muestra como archivo adjunto con un clip
    al final del correo.
    """

    incrustar_logo = True

    def message(self, **kwargs):
        msg = super().message(**kwargs)

        if not self.incrustar_logo:
            return msg

        logo = leer_logo()
        if logo is None:
            return msg

        # Localizar la parte text/html que Django ya construyo.
        # Se toma la ultima por si hubiera mas de una alternativa HTML.
        parte_html = None
        for parte in msg.walk():
            if parte.get_content_type() == "text/html":
                parte_html = parte

        if parte_html is None:
            # El correo salio sin HTML (solo texto): no hay donde poner
            # la imagen, y adjuntarla suelta solo agregaria un clip.
            return msg

        parte_html.add_related(
            logo,
            maintype="image",
            subtype="png",
            cid=f"<{CID_LOGO}>",
            disposition="inline",
            filename="logo_micolmena.png",
        )

        return msg