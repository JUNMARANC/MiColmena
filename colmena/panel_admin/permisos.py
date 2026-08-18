from functools import wraps

from django.contrib import messages
from django.shortcuts import redirect

from dbmicolmena.models import (
    Administrador,
    Apicultor,
)


# ============================================================
# OBTENER ROL DEL USUARIO
# ============================================================

def obtener_rol_usuario(user):

    if not user or not user.is_authenticated:
        return None

    administrador = (
        Administrador.objects
        .select_related("id_rol")
        .filter(user=user)
        .first()
    )

    if (
        administrador
        and administrador.id_rol
    ):
        return administrador.id_rol

    apicultor = (
        Apicultor.objects
        .select_related("id_rol")
        .filter(user=user)
        .first()
    )

    if (
        apicultor
        and apicultor.id_rol
    ):
        return apicultor.id_rol

    return None


# ============================================================
# OBTENER PERMISOS
# ============================================================

def obtener_permisos_usuario(user):

    rol = obtener_rol_usuario(user)

    if not rol:
        return set()

    return {
        permiso.strip()
        for permiso in (
            rol.permisos or ""
        ).split(",")
        if permiso.strip()
    }


# ============================================================
# VERIFICAR PERMISO
# ============================================================

def usuario_tiene_permiso(
    user,
    codigo_permiso
):

    permisos = obtener_permisos_usuario(
        user
    )

    return codigo_permiso in permisos


# ============================================================
# DECORADOR
# ============================================================

def permiso_requerido(
    codigo_permiso,
    redireccion="dashboard_admin"
):

    def decorador(vista):

        @wraps(vista)
        def envoltura(
            request,
            *args,
            **kwargs
        ):

            if not request.user.is_authenticated:

                return redirect("login")

            if not usuario_tiene_permiso(
                request.user,
                codigo_permiso
            ):

                messages.error(
                    request,
                    (
                        "No tienes permisos para "
                        "realizar esta acción."
                    )
                )

                return redirect(
                    redireccion
                )

            return vista(
                request,
                *args,
                **kwargs
            )

        return envoltura

    return decorador

def alguno_permiso_requerido(
    *codigos_permisos,
    redireccion="dashboard_admin"
):

    def decorador(vista):

        @wraps(vista)
        def envoltura(
            request,
            *args,
            **kwargs
        ):

            if not request.user.is_authenticated:

                return redirect("login")

            permisos = obtener_permisos_usuario(
                request.user
            )

            tiene_alguno = any(
                codigo in permisos
                for codigo
                in codigos_permisos
            )

            if not tiene_alguno:

                messages.error(
                    request,
                    (
                        "No tienes permisos para "
                        "acceder a este módulo."
                    )
                )

                return redirect(
                    redireccion
                )

            return vista(
                request,
                *args,
                **kwargs
            )

        return envoltura

    return decorador