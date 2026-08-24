from panel_admin.permisos import (
    obtener_permisos_usuario,
)

from panel_admin.models import (
    ConfiguracionSistema,
    ConfiguracionNotificaciones,
    Notificacion,
)


def permisos_usuario(request):

    # ========================================================
    # VALORES POR DEFECTO
    # ========================================================

    permisos = set()

    configuracion = None

    config_notificaciones = None

    nombre_sistema = "Mi Colmena"

    notificaciones_recientes = []

    notificaciones_no_leidas = 0


    # ========================================================
    # PERMISOS DEL USUARIO
    # ========================================================

    if request.user.is_authenticated:

        permisos = obtener_permisos_usuario(
            request.user
        )


    # ========================================================
    # CONFIGURACIÓN GENERAL
    # ========================================================

    configuracion = (
        ConfiguracionSistema.objects
        .filter(pk=1)
        .first()
    )


    if (
        configuracion
        and configuracion.nombre_sistema
    ):

        nombre_sistema = (
            configuracion.nombre_sistema.strip()
        )


    # ========================================================
    # CONFIGURACIÓN DE NOTIFICACIONES
    # ========================================================

    config_notificaciones = (
        ConfiguracionNotificaciones.objects
        .filter(pk=1)
        .first()
    )


    # ========================================================
    # NOTIFICACIONES DEL USUARIO
    # ========================================================

    if request.user.is_authenticated:

        notificaciones_usuario = (
            Notificacion.objects
            .filter(
                usuario=request.user
            )
            .order_by(
                "-fecha_creacion"
            )
        )


        # Solo mostramos las 5 más recientes
        # en la previsualización de la campana.

        notificaciones_recientes = (
            notificaciones_usuario[:5]
        )


        # Contador del badge de la campana.

        notificaciones_no_leidas = (
            notificaciones_usuario
            .filter(
                leida=False
            )
            .count()
        )


    # ========================================================
    # CONTEXTO GLOBAL
    # ========================================================

    return {

        "permisos_usuario":
            permisos,

        "configuracion_sistema":
            configuracion,

        "nombre_sistema":
            nombre_sistema,

        "config_notificaciones_global":
            config_notificaciones,

        "notificaciones_recientes":
            notificaciones_recientes,

        "notificaciones_no_leidas":
            notificaciones_no_leidas,

    }