from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from dbmicolmena.models import Administrador, Apicultor


def login_view(request):
    if request.method == "POST":
        usuario = request.POST.get("username")
        password = request.POST.get("password")

        user = authenticate(
            request,
            username=usuario,
            password=password
        )

        if user is None:
            return render(request, "usuarios/login.html", {
                "error": "Usuario o contraseña incorrectos."
            })

        if not user.is_active:
            return render(request, "usuarios/login.html", {
                "error": "Este usuario está inactivo."
            })

        login(request, user)

        if Administrador.objects.filter(user=user).exists():
            return redirect("dashboard_admin")

        # if Apicultor.objects.filter(user=user).exists():
        #     return redirect("dashboard_apicultor")

        logout(request)

        return render(request, "usuarios/login.html", {
            "error": "Tu usuario no tiene un perfil asignado."
        })

    return render(request, "usuarios/login.html")


def logout_view(request):
    logout(request)
    return redirect("Inicio")