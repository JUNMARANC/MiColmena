from django.contrib import messages
from django.shortcuts import render
from django.template.loader import render_to_string
from django.utils import timezone

from usuarios.correo_utils import CorreoConLogo


# ============================================================
# CONFIGURACIÓN DEL FORMULARIO DE CONTACTO
#
# A quién le llegan los mensajes del sitio y qué enlace se
# muestra en el pie del correo.
#
# Están aquí arriba y no repartidos por el archivo para que se
# cambien en un solo sitio. Si más adelante quieren moverlos a
# settings.py, es pasar estas dos líneas allá y leerlas con
# settings.CORREO_CONTACTO.
# ============================================================

CORREO_CONTACTO = "micolmena690@gmail.com"

SITIO_URL = ""   # vacío = el pie no muestra el enlace al sitio

def inicio(request):
    return render(request,'inicio.html')

def quienes(request):
    return render(request,'quienes.html')

def servicios(request):
    return render(request,'servicios.html')

def contactanos(request):
    return render(request,'contactanos.html')

def correo(request):

    if request.method == "POST":

        nombre = request.POST.get("nombre")
        correo = request.POST.get("correo")
        telefono = request.POST.get("telefono")
        asunto = request.POST.get("asunto")
        mensaje = request.POST.get("mensaje")
        fecha = timezone.now().strftime("%d %b %Y, %I:%M %p")

        texto = f"""
        Nombre: {nombre}
        Correo: {correo}
        Teléfono: {telefono or '-'}
        Interesado en: {asunto or '-'}
        Fecha: {fecha}

        Mensaje:
        {mensaje}
        """

        html = render_to_string("correos/contacto_correo.html", {
            "nombre": nombre,
            "correo": correo,
            "telefono": telefono,
            "asunto": asunto,
            "mensaje": mensaje,
            "fecha": fecha,
            "sitio_url": SITIO_URL,
        })

        # CorreoConLogo = EmailMultiAlternatives + el logo de Mi
        # Colmena incrustado en el mensaje. Ver usuarios/correo_utils.py
        email = CorreoConLogo(
            subject = f"{nombre.title()} te quiere contactar",
            body = texto,
            # from_email = None hace que Django use el
            # DEFAULT_FROM_EMAIL del settings, así que no hace falta
            # nombrarlo aquí.
            from_email = None,
            to = [CORREO_CONTACTO],

            # Al responder desde el gestor de correo, la respuesta va
            # directo al visitante en vez de a la propia cuenta.
            reply_to = [correo] if correo else None,
        )

        email.attach_alternative(html, "text/html")

        # Antes era email.send() a secas. Si el envío fallaba, la
        # excepción subía sin control o se perdía, y el visitante
        # veía la pantalla de "enviado" igual: creía que su mensaje
        # había llegado cuando no era así.
        try:
            email.send(fail_silently=False)

        except Exception as error:
            print("ERROR CORREO DE CONTACTO:", error)

            messages.error(
                request,
                "No fue posible enviar tu mensaje en este momento. "
                "Int\u00e9ntalo de nuevo en unos minutos."
            )

            return render(request, "contactanos.html")

        return render(request, "enviado.html")

    return render(request, "contactanos.html")