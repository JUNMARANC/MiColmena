from django.contrib.sessions.models import Session
from django.utils import timezone

from usuarios.models import (
    SesionUsuario,
)


# ============================================================
# OBTENER IP
# ============================================================

def obtener_ip(request):

    return request.META.get(
        "REMOTE_ADDR"
    )


# ============================================================
# ANALIZAR USER AGENT
# ============================================================

def analizar_user_agent(
    user_agent
):

    texto = (
        user_agent
        or ""
    )

    ua = texto.lower()


    # ========================================================
    # NAVEGADOR
    # ========================================================

    if "edg/" in ua:

        navegador = "Microsoft Edge"

    elif "chrome/" in ua:

        navegador = "Google Chrome"

    elif "firefox/" in ua:

        navegador = "Mozilla Firefox"

    elif (
        "safari/" in ua
        and
        "chrome/" not in ua
    ):

        navegador = "Safari"

    else:

        navegador = "Navegador desconocido"


    # ========================================================
    # SISTEMA OPERATIVO
    # ========================================================

    if "windows" in ua:

        sistema = "Windows"

    elif "android" in ua:

        sistema = "Android"

    elif (
        "iphone" in ua
        or
        "ipad" in ua
    ):

        sistema = "iOS"

    elif "mac os" in ua:

        sistema = "macOS"

    elif "linux" in ua:

        sistema = "Linux"

    else:

        sistema = (
            "Sistema desconocido"
        )


    # ========================================================
    # DISPOSITIVO
    # ========================================================

    if "ipad" in ua:

        dispositivo = "Tablet"

    elif (
        "mobile" in ua
        or
        "android" in ua
        or
        "iphone" in ua
    ):

        dispositivo = "Móvil"

    else:

        dispositivo = "Computador"


    return {
        "navegador":
            navegador,

        "sistema_operativo":
            sistema,

        "dispositivo":
            dispositivo,
    }


# ============================================================
# REGISTRAR SESIÓN
# ============================================================

def registrar_sesion_usuario(
    request,
    usuario
):

    if not usuario:

        return None


    # Necesitamos que Django tenga
    # una session_key real.

    if not request.session.session_key:

        request.session.save()


    session_key = (
        request.session.session_key
    )


    if not session_key:

        return None


    user_agent = (
        request.META.get(
            "HTTP_USER_AGENT",
            ""
        )
    )


    datos_dispositivo = (
        analizar_user_agent(
            user_agent
        )
    )


    sesion, creada = (
        SesionUsuario.objects
        .update_or_create(

            session_key=
                session_key,

            defaults={

                "usuario":
                    usuario,

                "ip":
                    obtener_ip(
                        request
                    ),

                "navegador":
                    datos_dispositivo[
                        "navegador"
                    ],

                "sistema_operativo":
                    datos_dispositivo[
                        "sistema_operativo"
                    ],

                "dispositivo":
                    datos_dispositivo[
                        "dispositivo"
                    ],

                "user_agent":
                    user_agent,

                "activa":
                    True,

                "fecha_cierre":
                    None,

                "motivo_cierre":
                    "",

            }

        )
    )


    return sesion


# ============================================================
# ACTUALIZAR SESIÓN ACTUAL
# ============================================================

def actualizar_sesion_actual(
    request
):

    if not request.user.is_authenticated:

        return


    session_key = (
        request.session.session_key
    )


    if not session_key:

        return


    sesion = (
        SesionUsuario.objects
        .filter(
            usuario=request.user,
            session_key=session_key,
            activa=True
        )
        .first()
    )


    # Si todavía no está registrada,
    # la creamos.

    if not sesion:

        registrar_sesion_usuario(
            request,
            request.user
        )

        return


    sesion.ultima_actividad = (
        timezone.now()
    )

    sesion.save(
        update_fields=[
            "ultima_actividad"
        ]
    )


# ============================================================
# MARCAR SESIÓN ACTUAL COMO CERRADA
# ============================================================

def cerrar_registro_sesion_actual(
    request,
    motivo="logout"
):

    session_key = (
        request.session.session_key
    )


    if not session_key:

        return


    (
        SesionUsuario.objects
        .filter(
            session_key=session_key,
            activa=True
        )
        .update(
            activa=False,
            fecha_cierre=timezone.now(),
            motivo_cierre=motivo
        )
    )


# ============================================================
# SINCRONIZAR SESIONES
# ============================================================

def obtener_sesiones_activas_usuario(
    usuario,
    session_key_actual=None
):

    sesiones = list(

        SesionUsuario.objects
        .filter(
            usuario=usuario,
            activa=True
        )
        .order_by(
            "-ultima_actividad"
        )

    )


    if not sesiones:

        return []


    claves = [
        sesion.session_key
        for sesion
        in sesiones
    ]


    ahora = timezone.now()


    claves_validas = set(

        Session.objects
        .filter(
            session_key__in=claves,
            expire_date__gt=ahora
        )
        .values_list(
            "session_key",
            flat=True
        )

    )


    sesiones_validas = []


    for sesion in sesiones:

        if (
            sesion.session_key
            not in claves_validas
        ):

            sesion.activa = False

            sesion.fecha_cierre = (
                ahora
            )

            sesion.motivo_cierre = (
                "expirada"
            )

            sesion.save(
                update_fields=[
                    "activa",
                    "fecha_cierre",
                    "motivo_cierre",
                ]
            )

            continue


        sesion.es_actual = (
            sesion.session_key
            ==
            session_key_actual
        )


        sesiones_validas.append(
            sesion
        )


    return sesiones_validas