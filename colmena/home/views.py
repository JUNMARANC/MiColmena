from django.shortcuts import render
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

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
        mensaje = request.POST.get("mensaje")

        texto = f"""
        Nombre: {nombre}
        Correo: {correo}
        Mensaje: {mensaje}
        """

        html = render_to_string("correos/contacto_correo.html", {
            "nombre": nombre,
            "correo": correo,
            "mensaje": mensaje,
        })

        email = EmailMultiAlternatives(
            subject = f"{nombre.title()} te quiere contactar",
            body = texto,
            from_email = None,
            to = ["micolmena690@gmail.com"],
        )

        email.attach_alternative(html, "text/html")
        email.send()

        return render(request, "enviado.html")

    return render(request, "contactanos.html")