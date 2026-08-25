from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from dbmicolmena.models import Administrador, Apicultor
from django.contrib.sessions.models import Session
from django.utils import timezone
from usuarios.models import (SesionUsuario,)
from usuarios.services import (registrar_sesion_usuario,cerrar_registro_sesion_actual,)
from django.contrib.auth.decorators import (
    login_required,
)
from django.contrib.sessions.models import (
    Session,
)
from django.contrib import messages
from django.shortcuts import (
    get_object_or_404,
)
from django.utils import timezone
from django.views.decorators.http import (
    require_POST,
)
from usuarios.models import (
    SesionUsuario,
)



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

        registrar_sesion_usuario(
            request,
            user
        )

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

    cerrar_registro_sesion_actual(
        request,
        motivo="logout"
    )


    logout(
        request
    )


    return redirect(
        "Inicio"
    )

@login_required
@require_POST
def cerrar_sesion_remota(
    request,
    id_sesion
):

    sesion = (
        get_object_or_404(

            SesionUsuario,

            pk=id_sesion,

            usuario=request.user,

            activa=True

        )
    )


    session_key_actual = (
        request.session.session_key
    )


    # ========================================================
    # NO CERRAR LA SESIÓN ACTUAL DESDE AQUÍ
    # ========================================================

    if (
        sesion.session_key
        ==
        session_key_actual
    ):

        messages.warning(
            request,
            "No puedes cerrar tu sesión actual "
            "desde esta opción."
        )

        return redirect(
            "mi_perfil"
        )


    # ========================================================
    # ELIMINAR SESIÓN REAL DE DJANGO
    # ========================================================

    Session.objects.filter(
        session_key=
            sesion.session_key
    ).delete()


    # ========================================================
    # ACTUALIZAR REGISTRO
    # ========================================================

    sesion.activa = False

    sesion.fecha_cierre = (
        timezone.now()
    )

    sesion.motivo_cierre = (
        "cerrada_remotamente"
    )

    sesion.save(
        update_fields=[
            "activa",
            "fecha_cierre",
            "motivo_cierre",
        ]
    )


    messages.success(
        request,
        "La sesión fue cerrada correctamente."
    )


    return redirect(
        "mi_perfil"
    )



@login_required
@require_POST
def cerrar_otras_sesiones(
    request
):

    session_key_actual = (
        request.session.session_key
    )


    sesiones = (
        SesionUsuario.objects
        .filter(
            usuario=request.user,
            activa=True
        )
        .exclude(
            session_key=
                session_key_actual
        )
    )


    claves = list(

        sesiones.values_list(
            "session_key",
            flat=True
        )

    )


    if claves:

        Session.objects.filter(
            session_key__in=
                claves
        ).delete()


    sesiones.update(
        activa=False,
        fecha_cierre=timezone.now(),
        motivo_cierre="cerrada_remotamente"
    )


    messages.success(
        request,
        "Todas las demás sesiones "
        "fueron cerradas."
    )


    return redirect(
        "mi_perfil"
    )