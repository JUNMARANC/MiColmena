from datetime import timedelta

from django.contrib.auth import get_user_model
from django.contrib.auth.signals import (
    user_login_failed,
    user_logged_in,
)
from django.db.models import Q
from django.dispatch import receiver
from django.utils import timezone

from panel_admin.models import (
    ControlIntentosLogin,
)

from panel_admin.notificaciones import (
    notificar_intentos_login_fallidos,
)


User = get_user_model()


# ============================================================
# CONFIGURACIÓN
# ============================================================

MAX_INTENTOS_ALERTA = 3

VENTANA_INTENTOS_MINUTOS = 15


# ============================================================
# BUSCAR USUARIO SEGÚN LAS CREDENCIALES
# ============================================================

def obtener_usuario_desde_credenciales(
    credentials
):

    identificador = (
        credentials.get("username")
        or
        credentials.get("email")
        or
        ""
    )


    identificador = (
        str(
            identificador
        )
        .strip()
    )


    if not identificador:

        return None


    return (
        User.objects
        .filter(
            Q(
                username__iexact=
                    identificador
            )
            |
            Q(
                email__iexact=
                    identificador
            )
        )
        .first()
    )


# ============================================================
# LOGIN FALLIDO
# ============================================================

@receiver(
    user_login_failed
)
def registrar_login_fallido(
    sender,
    credentials,
    request,
    **kwargs
):

    usuario = (
        obtener_usuario_desde_credenciales(
            credentials
        )
    )


    # Si el usuario escrito no existe,
    # no registramos nada.
    if not usuario:

        return


    ahora = timezone.now()


    control, creado = (
        ControlIntentosLogin.objects
        .get_or_create(
            usuario=usuario
        )
    )


    # ========================================================
    # PRIMER INTENTO
    # ========================================================

    if not control.primer_intento:

        control.intentos_fallidos = 1

        control.primer_intento = (
            ahora
        )

        control.ultimo_intento = (
            ahora
        )

        control.alerta_enviada = (
            False
        )


    else:

        limite = (
            control.primer_intento
            +
            timedelta(
                minutes=
                    VENTANA_INTENTOS_MINUTOS
            )
        )


        # ====================================================
        # LA VENTANA DE 15 MINUTOS YA VENCIÓ
        # ====================================================

        if ahora > limite:

            control.intentos_fallidos = (
                1
            )

            control.primer_intento = (
                ahora
            )

            control.ultimo_intento = (
                ahora
            )

            control.alerta_enviada = (
                False
            )


        # ====================================================
        # SIGUE DENTRO DE LOS 15 MINUTOS
        # ====================================================

        else:

            control.intentos_fallidos += (
                1
            )

            control.ultimo_intento = (
                ahora
            )


    # ========================================================
    # GUARDAR CONTROL
    # ========================================================

    control.save()


    # ========================================================
    # GENERAR ALERTA AL LLEGAR AL LÍMITE
    # ========================================================

    if (
        control.intentos_fallidos
        >= MAX_INTENTOS_ALERTA
        and
        not control.alerta_enviada
    ):

        try:

            creada = (
                notificar_intentos_login_fallidos(
                    usuario,
                    control.intentos_fallidos
                )
            )


            if creada:

                control.alerta_enviada = (
                    True
                )

                control.save(
                    update_fields=[
                        "alerta_enviada",
                        "actualizado_en",
                    ]
                )


        except Exception as error:

            print(
                "ERROR GENERANDO ALERTA "
                "DE LOGIN FALLIDO:",
                error
            )


# ============================================================
# LOGIN CORRECTO
# ============================================================

@receiver(
    user_logged_in
)
def reiniciar_intentos_login(
    sender,
    request,
    user,
    **kwargs
):

    control = (
        ControlIntentosLogin.objects
        .filter(
            usuario=user
        )
        .first()
    )


    if not control:

        return


    control.intentos_fallidos = 0

    control.primer_intento = None

    control.ultimo_intento = None

    control.alerta_enviada = False


    control.save(
        update_fields=[
            "intentos_fallidos",
            "primer_intento",
            "ultimo_intento",
            "alerta_enviada",
            "actualizado_en",
        ]
    )