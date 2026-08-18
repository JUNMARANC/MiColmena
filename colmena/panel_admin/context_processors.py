from panel_admin.permisos import (
    obtener_permisos_usuario,
)


def permisos_usuario(request):

    if not request.user.is_authenticated:

        return {
            "permisos_usuario": set()
        }

    return {
        "permisos_usuario": (
            obtener_permisos_usuario(
                request.user
            )
        )
    }