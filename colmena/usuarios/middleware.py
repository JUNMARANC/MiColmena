from django.contrib import messages
from django.contrib.auth import logout
from django.shortcuts import redirect
from django.urls import reverse
from django.utils import timezone

from panel_admin.models import ConfiguracionSeguridad

from usuarios.services import (
    actualizar_sesion_actual,
    cerrar_registro_sesion_actual,
    registrar_historial_acceso,
)


class InactividadSesionMiddleware:

    def __init__(self, get_response):
        self.get_response = get_response


    def __call__(self, request):

        # ====================================================
        # SOLO USUARIOS AUTENTICADOS
        # ====================================================

        if request.user.is_authenticated:

            # =================================================
            # OBTENER CONFIGURACIÓN DE SEGURIDAD
            # =================================================

            config = (
                ConfiguracionSeguridad.objects
                .filter(pk=1)
                .first()
            )

            ahora = timezone.now().timestamp()


            # =================================================
            # VERIFICAR CIERRE POR INACTIVIDAD
            # =================================================

            if (
                config
                and
                config.cerrar_sesion_inactividad
            ):

                ultima_actividad = (
                    request.session.get(
                        "_ultima_actividad"
                    )
                )

                limite_segundos = (
                    config.minutos_inactividad
                    * 60
                )


                # =============================================
                # SESIÓN VENCIDA POR INACTIVIDAD
                # =============================================

                if (
                    ultima_actividad
                    and
                    (
                        ahora - ultima_actividad
                    ) > limite_segundos
                ):

                    # =========================================
                    # REGISTRAR HISTORIAL
                    # =========================================

                    try:

                        registrar_historial_acceso(
                            request,
                            request.user,
                            actividad="inactividad",
                            detalle=(
                                "La sesión fue cerrada "
                                "automáticamente por inactividad."
                            )
                        )

                    except Exception as error:

                        print(
                            "ERROR REGISTRANDO HISTORIAL "
                            "DE INACTIVIDAD:",
                            error
                        )


                    # =========================================
                    # MARCAR SesionUsuario COMO CERRADA
                    # =========================================

                    try:

                        cerrar_registro_sesion_actual(
                            request,
                            motivo="inactividad"
                        )

                    except Exception as error:

                        print(
                            "ERROR CERRANDO REGISTRO "
                            "DE SESIÓN:",
                            error
                        )


                    # =========================================
                    # CERRAR SESIÓN REAL DE DJANGO
                    # =========================================

                    logout(request)


                    messages.warning(
                        request,
                        "Tu sesión se cerró por inactividad."
                    )


                    return redirect(
                        f"{reverse('login')}"
                        "?motivo=inactividad"
                    )


            # =================================================
            # LA SESIÓN TODAVÍA ES VÁLIDA
            # =================================================

            request.session[
                "_ultima_actividad"
            ] = ahora


            # =================================================
            # ACTUALIZAR SesionUsuario.ultima_actividad
            # =================================================

            try:

                actualizar_sesion_actual(
                    request
                )

            except Exception as error:

                print(
                    "ERROR ACTUALIZANDO "
                    "SESIÓN ACTIVA:",
                    error
                )


        return self.get_response(
            request
        )