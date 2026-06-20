from django.shortcuts import render
from django.core.mail import send_mail

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

        texto = f""" Nombre: {nombre} Correo: {correo} Mensaje: {mensaje} """

        send_mail(
            subject="Nuevo mensaje desde Mi Colmena",
            message=texto,
            from_email=None,
            recipient_list=["micolmena690@gmail.com"],
        )

        return render(request,"enviado.html")

    return render(request,"contactanos.html")
