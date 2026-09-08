from django.conf import settings
from django.contrib import messages

from django.contrib.auth import (
    authenticate,
    get_user_model,
    login,
    logout,
)

from django.contrib.auth.decorators import (
    login_required,
)

from django.contrib.auth.password_validation import (
    validate_password,
)

from django.contrib.sessions.models import (
    Session,
)

from django.core.exceptions import (
    ValidationError,
)

from django.shortcuts import (
    get_object_or_404,
    redirect,
    render,
)

from django.utils import timezone

from django.views.decorators.http import (
    require_POST,
)


# ============================================================
# MODELOS
# ============================================================

from dbmicolmena.models import (
    Administrador,
    Apicultor,
)


from usuarios.models import (
    Configuracion2FA,
    RecuperacionPassword,
    SesionUsuario,
)


# ============================================================
# SERVICIOS
# ============================================================

from usuarios.services import (
    cerrar_registro_sesion_actual,
    crear_recuperacion_password,
    crear_y_enviar_codigo_2fa,
    enviar_correo_recuperacion_password,
    limpiar_desafio_2fa,
    login_esta_bloqueado,
    obtener_estado_reenvio_2fa,
    obtener_politica_2fa,
    obtener_recuperacion_password,
    reenviar_codigo_2fa,
    registrar_historial_acceso,
    registrar_intento_login_fallido,
    registrar_sesion_usuario,
    reiniciar_intentos_login,
    verificar_codigo_2fa,
    verificar_codigo_recuperacion,
)


# ============================================================
# ============================================================
#
# FUNCIONES AUXILIARES
#
# ============================================================
# ============================================================


# ============================================================
# DETERMINAR PANEL DEL USUARIO
# ============================================================

def obtener_panel_seguridad(usuario):

    # ========================================================
    # APICULTOR
    # ========================================================

    if Apicultor.objects.filter(
        user=usuario
    ).exists():

        return {

            "base_template":
                "panel_apicultor/base_apicultor.html",

            "ruta_perfil":
                "perfil_apicultor",

            "ruta_dashboard":
                "dashboard_apicultor",

            "tipo_usuario":
                "apicultor",
        }


    # ========================================================
    # ADMINISTRADOR
    # ========================================================

    if Administrador.objects.filter(
        user=usuario
    ).exists():

        return {

            "base_template":
                "admin_panel/base_admin.html",

            "ruta_perfil":
                "mi_perfil",

            "ruta_dashboard":
                "dashboard_admin",

            "tipo_usuario":
                "administrador",
        }


    # ========================================================
    # USUARIO SIN PERFIL
    # ========================================================

    return {

        "base_template":
            None,

        "ruta_perfil":
            "login",

        "ruta_dashboard":
            "login",

        "tipo_usuario":
            "usuario",
    }


# ============================================================
# OCULTAR CORREO
# ============================================================

def ocultar_correo(correo):

    if (
        not correo
        or
        "@" not in correo
    ):

        return "correo registrado"


    nombre, dominio = correo.split(
        "@",
        1
    )


    visibles = nombre[:2]


    ocultos = "*" * max(
        3,
        len(nombre) - 2
    )


    return (
        f"{visibles}"
        f"{ocultos}"
        f"@{dominio}"
    )


# ============================================================
# CONTEXTO COMÚN PARA PANTALLAS DE SEGURIDAD
# ============================================================

def contexto_panel_seguridad(usuario):

    panel = obtener_panel_seguridad(
        usuario
    )


    return {

        "base_template":
            panel["base_template"],

        "ruta_perfil":
            panel["ruta_perfil"],

        "tipo_usuario":
            panel["tipo_usuario"],
    }


# ============================================================
# ============================================================
#
# LOGIN
#
# ============================================================
# ============================================================


def login_view(request):

    # ========================================================
    # SI YA ESTÁ AUTENTICADO
    # ========================================================

    if request.user.is_authenticated:

        panel = obtener_panel_seguridad(
            request.user
        )


        if panel["tipo_usuario"] in (
            "administrador",
            "apicultor",
        ):

            return redirect(
                panel["ruta_dashboard"]
            )


        messages.error(
            request,
            (
                "Tu usuario no tiene "
                "un perfil asignado."
            )
        )


        logout(
            request
        )


        return redirect(
            "login"
        )


    # ========================================================
    # POST
    # ========================================================

    if request.method == "POST":

        usuario_input = (
            request.POST.get(
                "username",
                ""
            )
            .strip()
        )


        password = request.POST.get(
            "password",
            ""
        )


        # ====================================================
        # VALIDAR CAMPOS
        # ====================================================

        if not usuario_input or not password:

            return render(
                request,
                "usuarios/login.html",
                {
                    "error":
                        (
                            "Debes ingresar el usuario "
                            "y la contraseña."
                        )
                }
            )


        # ====================================================
        # VERIFICAR BLOQUEO TEMPORAL
        # ====================================================

        bloqueado, _ = (
            login_esta_bloqueado(
                usuario_input
            )
        )


        if bloqueado:

            return render(
                request,
                "usuarios/login.html",
                {
                    "error":
                        (
                            "El acceso está bloqueado "
                            "temporalmente debido a varios "
                            "intentos fallidos. Intenta "
                            "nuevamente más tarde."
                        )
                }
            )


        # ====================================================
        # AUTENTICAR
        # ====================================================

        user = authenticate(
            request,
            username=usuario_input,
            password=password
        )


        # ====================================================
        # CREDENCIALES INCORRECTAS
        # ====================================================

        if user is None:

            resultado_intento = (
                registrar_intento_login_fallido(
                    request,
                    usuario_input
                )
            )


            if resultado_intento[
                "bloqueado"
            ]:

                error = (
                    "Se alcanzó el número máximo "
                    "de intentos permitidos. "
                    "El acceso fue bloqueado "
                    "temporalmente."
                )

            else:

                restantes = (
                    resultado_intento.get(
                        "restantes"
                    )
                )


                error = (
                    "Usuario o contraseña incorrectos."
                )


                if restantes is not None:

                    error += (
                        f" Intentos restantes: "
                        f"{restantes}."
                    )


            return render(
                request,
                "usuarios/login.html",
                {
                    "error":
                        error
                }
            )


        # ====================================================
        # USUARIO INACTIVO
        # ====================================================

        if not user.is_active:

            return render(
                request,
                "usuarios/login.html",
                {
                    "error":
                        "Este usuario está inactivo."
                }
            )


        # ====================================================
        # PASSWORD CORRECTA
        # ====================================================

        reiniciar_intentos_login(
            usuario_input
        )


        # ====================================================
        # DETERMINAR PERFIL
        # ====================================================

        panel = obtener_panel_seguridad(
            user
        )


        if panel[
            "tipo_usuario"
        ] not in (
            "administrador",
            "apicultor",
        ):

            return render(
                request,
                "usuarios/login.html",
                {
                    "error":
                        (
                            "Tu usuario no tiene "
                            "un perfil asignado."
                        )
                }
            )


        # ====================================================
        # CONFIGURACIÓN 2FA
        # ====================================================

        config_2fa, _ = (
            Configuracion2FA.objects
            .get_or_create(
                usuario=user
            )
        )


        # ====================================================
        # POLÍTICA GLOBAL
        # ====================================================

        politica_2fa = (
            obtener_politica_2fa(
                user
            )
        )


        # ====================================================
        # DETERMINAR SI DEBE UTILIZAR 2FA
        # ====================================================

        usar_2fa = (

            politica_2fa[
                "permitir_2fa"
            ]

            and

            (
                config_2fa.activo

                or

                politica_2fa[
                    "obligatorio"
                ]
            )
        )


        # ====================================================
        # 2FA NECESARIO
        # ====================================================

        if usar_2fa:

            activar_al_verificar = (

                politica_2fa[
                    "obligatorio"
                ]

                and

                not config_2fa.activo
            )


            resultado_2fa = (
                crear_y_enviar_codigo_2fa(
                    request,
                    user,
                    proposito="login"
                )
            )


            if not resultado_2fa[
                "ok"
            ]:

                return render(
                    request,
                    "usuarios/login.html",
                    {
                        "error":
                            resultado_2fa[
                                "error"
                            ]
                    }
                )


            # ================================================
            # BACKEND DE AUTENTICACIÓN
            # ================================================

            backend = getattr(
                user,
                "backend",
                None
            )


            if not backend:

                backend = (
                    settings
                    .AUTHENTICATION_BACKENDS[0]
                )


            request.session[
                "2fa_backend"
            ] = backend


            request.session[
                "2fa_forzar_activacion"
            ] = activar_al_verificar


            request.session.modified = True


            # ================================================
            # TODAVÍA NO HACEMOS LOGIN
            # ================================================

            return redirect(
                "verificar_login_2fa"
            )


        # ====================================================
        # LOGIN SIN 2FA
        # ====================================================

        login(
            request,
            user
        )


        # ====================================================
        # REGISTRAR SESIÓN
        # ====================================================

        try:

            registrar_sesion_usuario(
                request,
                user
            )

        except Exception as error:

            print(
                "ERROR REGISTRANDO SESIÓN:",
                error
            )


        # ====================================================
        # HISTORIAL
        # ====================================================

        try:

            registrar_historial_acceso(
                request,
                user,
                actividad="login",
                detalle=(
                    "Inicio de sesión exitoso."
                )
            )

        except Exception as error:

            print(
                "ERROR REGISTRANDO HISTORIAL:",
                error
            )


        # ====================================================
        # IR AL DASHBOARD CORRECTO
        # ====================================================

        return redirect(
            panel[
                "ruta_dashboard"
            ]
        )


    # ========================================================
    # GET
    # ========================================================

    return render(
        request,
        "usuarios/login.html"
    )


# ============================================================
# ============================================================
#
# LOGOUT
#
# ============================================================
# ============================================================


def logout_view(request):

    if request.user.is_authenticated:

        usuario = request.user


        # ====================================================
        # HISTORIAL
        # ====================================================

        try:

            registrar_historial_acceso(
                request,
                usuario,
                actividad="logout",
                detalle=(
                    "El usuario cerró la sesión."
                )
            )

        except Exception as error:

            print(
                "ERROR REGISTRANDO HISTORIAL LOGOUT:",
                error
            )


        # ====================================================
        # CERRAR REGISTRO DE SESIÓN
        # ====================================================

        try:

            cerrar_registro_sesion_actual(
                request,
                motivo="logout"
            )

        except Exception as error:

            print(
                "ERROR CERRANDO REGISTRO DE SESIÓN:",
                error
            )


    logout(
        request
    )


    return redirect(
        "Inicio"
    )


# ============================================================
# ============================================================
#
# SESIONES ACTIVAS
#
# ============================================================
# ============================================================


# ============================================================
# CERRAR UNA SESIÓN REMOTA
# ============================================================

@login_required
@require_POST
def cerrar_sesion_remota(
    request,
    id_sesion
):

    # ========================================================
    # PANEL CORRECTO
    # ========================================================

    panel = obtener_panel_seguridad(
        request.user
    )


    ruta_perfil = panel[
        "ruta_perfil"
    ]


    # ========================================================
    # BUSCAR SESIÓN
    # ========================================================

    sesion = get_object_or_404(
        SesionUsuario,
        pk=id_sesion,
        usuario=request.user,
        activa=True
    )


    session_key_actual = (
        request.session.session_key
    )


    # ========================================================
    # NO CERRAR LA SESIÓN ACTUAL
    # ========================================================

    if (
        sesion.session_key
        ==
        session_key_actual
    ):

        messages.warning(
            request,
            (
                "No puedes cerrar tu sesión actual "
                "desde esta opción."
            )
        )


        return redirect(
            ruta_perfil
        )


    # ========================================================
    # INFORMACIÓN PARA HISTORIAL
    # ========================================================

    navegador = (
        sesion.navegador
        or
        "Navegador desconocido"
    )


    sistema = (
        sesion.sistema_operativo
        or
        "Sistema desconocido"
    )


    dispositivo = (
        sesion.dispositivo
        or
        "Dispositivo desconocido"
    )


    # ========================================================
    # ELIMINAR SESIÓN REAL DE DJANGO
    # ========================================================

    Session.objects.filter(
        session_key=sesion.session_key
    ).delete()


    # ========================================================
    # CERRAR REGISTRO PROPIO
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


    # ========================================================
    # HISTORIAL
    # ========================================================

    try:

        registrar_historial_acceso(
            request,
            request.user,
            actividad="cierre_remoto",
            detalle=(
                f"Se cerró una sesión remota de "
                f"{navegador} en {sistema} "
                f"({dispositivo})."
            )
        )

    except Exception as error:

        print(
            "ERROR REGISTRANDO CIERRE REMOTO:",
            error
        )


    messages.success(
        request,
        "La sesión fue cerrada correctamente."
    )


    return redirect(
        ruta_perfil
    )


# ============================================================
# CERRAR TODAS LAS DEMÁS SESIONES
# ============================================================

@login_required
@require_POST
def cerrar_otras_sesiones(request):

    panel = obtener_panel_seguridad(
        request.user
    )


    ruta_perfil = panel[
        "ruta_perfil"
    ]


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
            session_key=session_key_actual
        )
    )


    claves = list(
        sesiones.values_list(
            "session_key",
            flat=True
        )
    )


    cantidad = len(
        claves
    )


    # ========================================================
    # NO HAY OTRAS SESIONES
    # ========================================================

    if cantidad == 0:

        messages.info(
            request,
            "No tienes otras sesiones activas."
        )


        return redirect(
            ruta_perfil
        )


    # ========================================================
    # ELIMINAR SESIONES DJANGO
    # ========================================================

    Session.objects.filter(
        session_key__in=claves
    ).delete()


    # ========================================================
    # ACTUALIZAR REGISTROS PROPIOS
    # ========================================================

    sesiones.update(

        activa=False,

        fecha_cierre=
            timezone.now(),

        motivo_cierre=
            "cerrada_remotamente",
    )


    # ========================================================
    # HISTORIAL
    # ========================================================

    try:

        registrar_historial_acceso(
            request,
            request.user,
            actividad="cierre_remoto",
            detalle=(
                f"Se cerraron {cantidad} "
                f"sesiones remotas."
            )
        )

    except Exception as error:

        print(
            "ERROR REGISTRANDO CIERRE DE SESIONES:",
            error
        )


    # ========================================================
    # MENSAJE
    # ========================================================

    if cantidad == 1:

        mensaje = (
            "Se cerró 1 sesión adicional "
            "correctamente."
        )

    else:

        mensaje = (
            f"Se cerraron {cantidad} "
            f"sesiones adicionales correctamente."
        )


    messages.success(
        request,
        mensaje
    )


    return redirect(
        ruta_perfil
    )


# ============================================================
# ============================================================
#
# ACTIVACIÓN 2FA
#
# ============================================================
# ============================================================


# ============================================================
# INICIAR ACTIVACIÓN
# ============================================================

@login_required
@require_POST
def iniciar_activacion_2fa(request):

    # ========================================================
    # PANEL
    # ========================================================

    panel = obtener_panel_seguridad(
        request.user
    )


    ruta_perfil = panel[
        "ruta_perfil"
    ]


    # ========================================================
    # PERFIL VÁLIDO
    # ========================================================

    if panel[
        "tipo_usuario"
    ] not in (
        "administrador",
        "apicultor",
    ):

        messages.error(
            request,
            (
                "No fue posible identificar "
                "el perfil asociado a tu cuenta."
            )
        )


        return redirect(
            "login"
        )


    # ========================================================
    # CONFIGURACIÓN
    # ========================================================

    config_2fa, _ = (
        Configuracion2FA.objects
        .get_or_create(
            usuario=request.user
        )
    )


    # ========================================================
    # POLÍTICA
    # ========================================================

    politica_2fa = (
        obtener_politica_2fa(
            request.user
        )
    )


    # ========================================================
    # DESHABILITADO GLOBALMENTE
    # ========================================================

    if not politica_2fa[
        "permitir_2fa"
    ]:

        messages.warning(
            request,
            (
                "La autenticación en dos pasos "
                "está deshabilitada por la "
                "configuración del sistema."
            )
        )


        return redirect(
            ruta_perfil
        )


    # ========================================================
    # YA ACTIVO
    # ========================================================

    if config_2fa.activo:

        messages.info(
            request,
            (
                "La autenticación en dos pasos "
                "ya está activada."
            )
        )


        return redirect(
            ruta_perfil
        )


    # ========================================================
    # CORREO
    # ========================================================

    if not request.user.email:

        messages.error(
            request,
            (
                "Debes tener un correo electrónico "
                "registrado para activar la "
                "autenticación en dos pasos."
            )
        )


        return redirect(
            ruta_perfil
        )


    # ========================================================
    # CREAR Y ENVIAR CÓDIGO
    # ========================================================

    resultado = (
        crear_y_enviar_codigo_2fa(
            request,
            request.user,
            proposito="activar"
        )
    )


    if not resultado[
        "ok"
    ]:

        messages.error(
            request,
            resultado[
                "error"
            ]
        )


        return redirect(
            ruta_perfil
        )


    # ========================================================
    # IR A VERIFICACIÓN
    # ========================================================

    return redirect(
        "verificar_activacion_2fa"
    )


# ============================================================
# VERIFICAR ACTIVACIÓN
# ============================================================

@login_required
def verificar_activacion_2fa(request):

    # ========================================================
    # PANEL
    # ========================================================

    panel = obtener_panel_seguridad(
        request.user
    )


    ruta_perfil = panel[
        "ruta_perfil"
    ]


    # ========================================================
    # PERFIL VÁLIDO
    # ========================================================

    if panel[
        "tipo_usuario"
    ] not in (
        "administrador",
        "apicultor",
    ):

        messages.error(
            request,
            (
                "No fue posible identificar "
                "el perfil asociado a tu cuenta."
            )
        )


        return redirect(
            "login"
        )


    # ========================================================
    # DESAFÍO
    # ========================================================

    usuario_id = (
        request.session.get(
            "2fa_usuario_id"
        )
    )


    proposito = (
        request.session.get(
            "2fa_proposito"
        )
    )


    # ========================================================
    # VALIDAR DESAFÍO
    # ========================================================

    if (
        usuario_id
        !=
        request.user.pk

        or

        proposito
        !=
        "activar"
    ):

        messages.warning(
            request,
            (
                "No existe una verificación "
                "2FA pendiente."
            )
        )


        return redirect(
            ruta_perfil
        )


    error = None

    puede_verificar = True


    # ========================================================
    # POST
    # ========================================================

    if request.method == "POST":

        codigo = (
            request.POST.get(
                "codigo",
                ""
            )
            .strip()
        )


        resultado = (
            verificar_codigo_2fa(
                request,
                codigo,
                proposito_esperado=
                    "activar"
            )
        )


        # ====================================================
        # CORRECTO
        # ====================================================

        if resultado[
            "ok"
        ]:

            config_2fa, _ = (
                Configuracion2FA.objects
                .get_or_create(
                    usuario=request.user
                )
            )


            config_2fa.activo = True


            config_2fa.fecha_activacion = (
                timezone.now()
            )


            config_2fa.save(
                update_fields=[
                    "activo",
                    "fecha_activacion",
                    "fecha_actualizacion",
                ]
            )


            # ================================================
            # HISTORIAL
            # ================================================

            try:

                registrar_historial_acceso(
                    request,
                    request.user,
                    actividad="sistema",
                    detalle=(
                        "El usuario activó la "
                        "autenticación en dos pasos."
                    )
                )

            except Exception as error_historial:

                print(
                    "ERROR REGISTRANDO ACTIVACIÓN 2FA:",
                    error_historial
                )


            # ================================================
            # LIMPIAR DESAFÍO
            # ================================================

            limpiar_desafio_2fa(
                request
            )


            messages.success(
                request,
                (
                    "La autenticación en dos pasos "
                    "se activó correctamente."
                )
            )


            return redirect(
                ruta_perfil
            )


        # ====================================================
        # INCORRECTO
        # ====================================================

        error = resultado.get(
            "error",
            "No fue posible verificar el código."
        )


        if resultado.get(
            "tipo"
        ) in [
            "expirado",
            "bloqueado",
            "sin_desafio",
            "invalido",
        ]:

            puede_verificar = False


    # ========================================================
    # CONTEXTO
    # ========================================================

    contexto = {

        "error":
            error,

        "puede_verificar":
            puede_verificar,

        "correo_oculto":
            ocultar_correo(
                request.user.email
            ),

        **contexto_panel_seguridad(
            request.user
        ),
    }


    # ========================================================
    # RENDER
    # ========================================================

    return render(
        request,
        "usuarios/verificar_activacion_2fa.html",
        contexto
    )


# ============================================================
# ============================================================
#
# DESACTIVACIÓN 2FA
#
# ============================================================
# ============================================================


# ============================================================
# INICIAR DESACTIVACIÓN
# ============================================================

@login_required
@require_POST
def iniciar_desactivacion_2fa(request):

    # ========================================================
    # PANEL
    # ========================================================

    panel = obtener_panel_seguridad(
        request.user
    )


    ruta_perfil = panel[
        "ruta_perfil"
    ]


    # ========================================================
    # PERFIL VÁLIDO
    # ========================================================

    if panel[
        "tipo_usuario"
    ] not in (
        "administrador",
        "apicultor",
    ):

        messages.error(
            request,
            (
                "No fue posible identificar "
                "el perfil asociado a tu cuenta."
            )
        )


        return redirect(
            "login"
        )


    # ========================================================
    # CONFIGURACIÓN 2FA
    # ========================================================

    config_2fa, _ = (
        Configuracion2FA.objects
        .get_or_create(
            usuario=request.user
        )
    )


    # ========================================================
    # POLÍTICA
    # ========================================================

    politica_2fa = (
        obtener_politica_2fa(
            request.user
        )
    )


    # ========================================================
    # 2FA OBLIGATORIO
    # ========================================================

    if politica_2fa[
        "obligatorio"
    ]:

        messages.warning(
            request,
            (
                "No puedes desactivar la autenticación "
                "en dos pasos porque es obligatoria "
                "según la política de seguridad."
            )
        )


        return redirect(
            ruta_perfil
        )


    # ========================================================
    # YA DESACTIVADO
    # ========================================================

    if not config_2fa.activo:

        messages.info(
            request,
            (
                "La autenticación en dos pasos "
                "ya está desactivada."
            )
        )


        return redirect(
            ruta_perfil
        )


    # ========================================================
    # CORREO
    # ========================================================

    if not request.user.email:

        messages.error(
            request,
            (
                "Tu cuenta no tiene un correo "
                "electrónico registrado."
            )
        )


        return redirect(
            ruta_perfil
        )


    # ========================================================
    # ENVIAR CÓDIGO
    # ========================================================

    resultado = (
        crear_y_enviar_codigo_2fa(
            request,
            request.user,
            proposito="desactivar"
        )
    )


    if not resultado[
        "ok"
    ]:

        messages.error(
            request,
            resultado[
                "error"
            ]
        )


        return redirect(
            ruta_perfil
        )


    return redirect(
        "verificar_desactivacion_2fa"
    )


# ============================================================
# VERIFICAR DESACTIVACIÓN
# ============================================================

@login_required
def verificar_desactivacion_2fa(request):

    # ========================================================
    # PANEL
    # ========================================================

    panel = obtener_panel_seguridad(
        request.user
    )


    ruta_perfil = panel[
        "ruta_perfil"
    ]


    # ========================================================
    # PERFIL VÁLIDO
    # ========================================================

    if panel[
        "tipo_usuario"
    ] not in (
        "administrador",
        "apicultor",
    ):

        messages.error(
            request,
            (
                "No fue posible identificar "
                "el perfil asociado a tu cuenta."
            )
        )


        return redirect(
            "login"
        )


    # ========================================================
    # POLÍTICA
    # ========================================================

    politica_2fa = (
        obtener_politica_2fa(
            request.user
        )
    )


    # ========================================================
    # NO PERMITIR SI ES OBLIGATORIO
    # ========================================================

    if politica_2fa[
        "obligatorio"
    ]:

        if (
            request.session.get(
                "2fa_proposito"
            )
            ==
            "desactivar"
        ):

            limpiar_desafio_2fa(
                request
            )


        messages.warning(
            request,
            (
                "No puedes desactivar la autenticación "
                "en dos pasos porque es obligatoria "
                "para tu cuenta."
            )
        )


        return redirect(
            ruta_perfil
        )


    # ========================================================
    # DESAFÍO
    # ========================================================

    usuario_id = (
        request.session.get(
            "2fa_usuario_id"
        )
    )


    proposito = (
        request.session.get(
            "2fa_proposito"
        )
    )


    # ========================================================
    # VALIDAR
    # ========================================================

    if (
        usuario_id
        !=
        request.user.pk

        or

        proposito
        !=
        "desactivar"
    ):

        messages.warning(
            request,
            (
                "No existe una verificación "
                "2FA pendiente."
            )
        )


        return redirect(
            ruta_perfil
        )


    error = None

    puede_verificar = True


    # ========================================================
    # POST
    # ========================================================

    if request.method == "POST":

        codigo = (
            request.POST.get(
                "codigo",
                ""
            )
            .strip()
        )


        resultado = (
            verificar_codigo_2fa(
                request,
                codigo,
                proposito_esperado=
                    "desactivar"
            )
        )


        # ====================================================
        # CORRECTO
        # ====================================================

        if resultado[
            "ok"
        ]:

            config_2fa, _ = (
                Configuracion2FA.objects
                .get_or_create(
                    usuario=request.user
                )
            )


            config_2fa.activo = False

            config_2fa.fecha_activacion = None


            config_2fa.save(
                update_fields=[
                    "activo",
                    "fecha_activacion",
                    "fecha_actualizacion",
                ]
            )


            # ================================================
            # HISTORIAL
            # ================================================

            try:

                registrar_historial_acceso(
                    request,
                    request.user,
                    actividad="sistema",
                    detalle=(
                        "El usuario desactivó la "
                        "autenticación en dos pasos."
                    )
                )

            except Exception as error_historial:

                print(
                    "ERROR REGISTRANDO DESACTIVACIÓN 2FA:",
                    error_historial
                )


            # ================================================
            # LIMPIAR
            # ================================================

            limpiar_desafio_2fa(
                request
            )


            messages.success(
                request,
                (
                    "La autenticación en dos pasos "
                    "se desactivó correctamente."
                )
            )


            return redirect(
                ruta_perfil
            )


        # ====================================================
        # INCORRECTO
        # ====================================================

        error = resultado.get(
            "error",
            "No fue posible verificar el código."
        )


        if resultado.get(
            "tipo"
        ) in [
            "expirado",
            "bloqueado",
            "sin_desafio",
            "invalido",
        ]:

            puede_verificar = False


    # ========================================================
    # CONTEXTO
    # ========================================================

    contexto = {

        "error":
            error,

        "puede_verificar":
            puede_verificar,

        "correo_oculto":
            ocultar_correo(
                request.user.email
            ),

        **contexto_panel_seguridad(
            request.user
        ),
    }


    return render(
        request,
        "usuarios/verificar_desactivacion_2fa.html",
        contexto
    )


# ============================================================
# ============================================================
#
# 2FA DURANTE EL LOGIN
#
# ============================================================
# ============================================================


def verificar_login_2fa(request):

    # ========================================================
    # YA AUTENTICADO
    # ========================================================

    if request.user.is_authenticated:

        panel = obtener_panel_seguridad(
            request.user
        )


        return redirect(
            panel[
                "ruta_dashboard"
            ]
        )


    # ========================================================
    # DATOS DEL DESAFÍO
    # ========================================================

    usuario_id = (
        request.session.get(
            "2fa_usuario_id"
        )
    )


    proposito = (
        request.session.get(
            "2fa_proposito"
        )
    )


    backend = (
        request.session.get(
            "2fa_backend"
        )
    )


    # ========================================================
    # DESAFÍO INEXISTENTE
    # ========================================================

    if (
        not usuario_id
        or
        proposito != "login"
    ):

        limpiar_desafio_2fa(
            request
        )


        messages.warning(
            request,
            (
                "No existe una verificación "
                "de inicio de sesión pendiente."
            )
        )


        return redirect(
            "login"
        )


    # ========================================================
    # USUARIO
    # ========================================================

    User = get_user_model()


    user = (
        User.objects
        .filter(
            pk=usuario_id,
            is_active=True
        )
        .first()
    )


    if not user:

        limpiar_desafio_2fa(
            request
        )


        messages.error(
            request,
            (
                "No fue posible completar "
                "la autenticación."
            )
        )


        return redirect(
            "login"
        )


    # ========================================================
    # PERFIL
    # ========================================================

    panel = obtener_panel_seguridad(
        user
    )


    if panel[
        "tipo_usuario"
    ] not in (
        "administrador",
        "apicultor",
    ):

        limpiar_desafio_2fa(
            request
        )


        messages.error(
            request,
            (
                "Tu usuario no tiene "
                "un perfil asignado."
            )
        )


        return redirect(
            "login"
        )


    # ========================================================
    # POLÍTICA GLOBAL
    # ========================================================

    politica_2fa = (
        obtener_politica_2fa(
            user
        )
    )


    if not politica_2fa[
        "permitir_2fa"
    ]:

        limpiar_desafio_2fa(
            request
        )


        messages.warning(
            request,
            (
                "La autenticación en dos pasos "
                "fue deshabilitada por la "
                "configuración del sistema. "
                "Inicia sesión nuevamente."
            )
        )


        return redirect(
            "login"
        )


    # ========================================================
    # CONFIGURACIÓN
    # ========================================================

    config_2fa, _ = (
        Configuracion2FA.objects
        .get_or_create(
            usuario=user
        )
    )


    # ========================================================
    # ACTIVACIÓN FORZADA
    # ========================================================

    forzar_activacion = bool(
        request.session.get(
            "2fa_forzar_activacion",
            False
        )
    )


    if (
        not config_2fa.activo
        and
        not forzar_activacion
    ):

        limpiar_desafio_2fa(
            request
        )


        messages.warning(
            request,
            (
                "La verificación en dos pasos "
                "ya no está disponible. "
                "Inicia sesión nuevamente."
            )
        )


        return redirect(
            "login"
        )


    error = None

    puede_verificar = True


    # ========================================================
    # POST
    # ========================================================

    if request.method == "POST":

        codigo = (
            request.POST.get(
                "codigo",
                ""
            )
            .strip()
        )


        resultado = (
            verificar_codigo_2fa(
                request,
                codigo,
                proposito_esperado=
                    "login"
            )
        )


        # ====================================================
        # CORRECTO
        # ====================================================

        if resultado[
            "ok"
        ]:

            # ================================================
            # ACTIVACIÓN OBLIGATORIA
            # ================================================

            if forzar_activacion:

                config_2fa.activo = True


                config_2fa.fecha_activacion = (
                    timezone.now()
                )


                config_2fa.save(
                    update_fields=[
                        "activo",
                        "fecha_activacion",
                        "fecha_actualizacion",
                    ]
                )


                try:

                    registrar_historial_acceso(
                        request,
                        user,
                        actividad="sistema",
                        detalle=(
                            "La autenticación en dos pasos "
                            "fue activada debido a la "
                            "política de seguridad del sistema."
                        )
                    )

                except Exception as error_historial_2fa:

                    print(
                        "ERROR HISTORIAL ACTIVACIÓN 2FA:",
                        error_historial_2fa
                    )


            # ================================================
            # GUARDAR BACKEND
            # ================================================

            backend_login = backend


            if not backend_login:

                backend_login = (
                    settings
                    .AUTHENTICATION_BACKENDS[0]
                )


            # ================================================
            # LIMPIAR DESAFÍO
            # ================================================

            limpiar_desafio_2fa(
                request
            )


            # ================================================
            # HACER LOGIN
            # ================================================

            login(
                request,
                user,
                backend=backend_login
            )


            # ================================================
            # REGISTRAR SESIÓN
            # ================================================

            try:

                registrar_sesion_usuario(
                    request,
                    user
                )

            except Exception as error_sesion:

                print(
                    "ERROR REGISTRANDO SESIÓN 2FA:",
                    error_sesion
                )


            # ================================================
            # HISTORIAL
            # ================================================

            try:

                registrar_historial_acceso(
                    request,
                    user,
                    actividad="login",
                    detalle=(
                        "Inicio de sesión exitoso "
                        "con verificación en dos pasos."
                    )
                )

            except Exception as error_historial:

                print(
                    "ERROR REGISTRANDO HISTORIAL 2FA:",
                    error_historial
                )


            # ================================================
            # DASHBOARD SEGÚN ROL
            # ================================================

            return redirect(
                panel[
                    "ruta_dashboard"
                ]
            )


        # ====================================================
        # INCORRECTO
        # ====================================================

        error = resultado.get(
            "error",
            "No fue posible verificar el código."
        )


        if resultado.get(
            "tipo"
        ) in [
            "expirado",
            "bloqueado",
            "sin_desafio",
            "invalido",
        ]:

            puede_verificar = False


    # ========================================================
    # ESTADO DE REENVÍO
    # ========================================================

    estado_reenvio = (
        obtener_estado_reenvio_2fa(
            request
        )
    )


    # ========================================================
    # RENDER
    # ========================================================

    return render(
        request,
        "usuarios/verificar_login_2fa.html",
        {

            "error":
                error,

            "puede_verificar":
                puede_verificar,

            "correo_oculto":
                ocultar_correo(
                    user.email
                ),

            "puede_reenviar":
                estado_reenvio[
                    "puede_reenviar"
                ],

            "segundos_reenvio":
                estado_reenvio[
                    "segundos_restantes"
                ],

            "reenvios_restantes":
                estado_reenvio[
                    "reenvios_restantes"
                ],

            "limite_reenvios":
                estado_reenvio[
                    "limite_alcanzado"
                ],
        }
    )


# ============================================================
# REENVIAR CÓDIGO DEL LOGIN
# ============================================================

@require_POST
def reenviar_login_2fa(request):

    # ========================================================
    # YA AUTENTICADO
    # ========================================================

    if request.user.is_authenticated:

        panel = obtener_panel_seguridad(
            request.user
        )


        return redirect(
            panel[
                "ruta_dashboard"
            ]
        )


    # ========================================================
    # DESAFÍO
    # ========================================================

    usuario_id = (
        request.session.get(
            "2fa_usuario_id"
        )
    )


    proposito = (
        request.session.get(
            "2fa_proposito"
        )
    )


    if (
        not usuario_id
        or
        proposito != "login"
    ):

        messages.error(
            request,
            (
                "No existe una verificación "
                "de inicio de sesión pendiente."
            )
        )


        return redirect(
            "login"
        )


    # ========================================================
    # USUARIO
    # ========================================================

    User = get_user_model()


    user = (
        User.objects
        .filter(
            pk=usuario_id,
            is_active=True
        )
        .first()
    )


    if not user:

        limpiar_desafio_2fa(
            request
        )


        messages.error(
            request,
            (
                "No fue posible completar "
                "la verificación."
            )
        )


        return redirect(
            "login"
        )


    # ========================================================
    # REENVIAR
    # ========================================================

    resultado = (
        reenviar_codigo_2fa(
            request,
            user,
            proposito_esperado=
                "login"
        )
    )


    if resultado[
        "ok"
    ]:

        messages.success(
            request,
            (
                "Enviamos un nuevo código "
                "de verificación a tu correo."
            )
        )

    else:

        messages.error(
            request,
            resultado[
                "error"
            ]
        )


    return redirect(
        "verificar_login_2fa"
    )


# ============================================================
# ============================================================
#
# RECUPERACIÓN DE CONTRASEÑA
#
# ============================================================
# ============================================================


# ============================================================
# SOLICITAR RECUPERACIÓN
# ============================================================

@require_POST
def solicitar_recuperacion_password(request):

    correo = (
        request.POST.get(
            "correo",
            ""
        )
        .strip()
        .lower()
    )


    # ========================================================
    # MENSAJE GENÉRICO
    # ========================================================

    mensaje_generico = (
        "Si el correo está asociado a una cuenta, "
        "recibirás las instrucciones para recuperar "
        "tu contraseña."
    )


    if not correo:

        messages.info(
            request,
            mensaje_generico
        )


        return redirect(
            "login"
        )


    # ========================================================
    # BUSCAR USUARIO
    # ========================================================

    User = get_user_model()


    usuario = (
        User.objects
        .filter(
            email__iexact=correo,
            is_active=True
        )
        .first()
    )


    # ========================================================
    # NO EXISTE
    # ========================================================

    if not usuario:

        messages.info(
            request,
            mensaje_generico
        )


        return redirect(
            "login"
        )


    # ========================================================
    # CREAR RECUPERACIÓN
    # ========================================================

    datos = (
        crear_recuperacion_password(
            request,
            usuario
        )
    )


    # ========================================================
    # ENVIAR CORREO
    # ========================================================

    enviado = (
        enviar_correo_recuperacion_password(

            request,

            usuario,

            datos[
                "codigo"
            ],

            datos[
                "token"
            ],
        )
    )


    if not enviado:

        datos[
            "recuperacion"
        ].delete()


        messages.error(
            request,
            (
                "No fue posible enviar el correo "
                "de recuperación. Intenta nuevamente."
            )
        )


        return redirect(
            "login"
        )


    messages.success(
        request,
        mensaje_generico
    )


    return redirect(
        "login"
    )


# ============================================================
# RECUPERAR CONTRASEÑA MEDIANTE LINK
# ============================================================

def recuperar_password(
    request,
    token
):

    # ========================================================
    # BUSCAR RECUPERACIÓN
    # ========================================================

    recuperacion = (
        obtener_recuperacion_password(
            token
        )
    )


    # ========================================================
    # INVÁLIDA / EXPIRADA
    # ========================================================

    if not recuperacion:

        messages.error(
            request,
            (
                "El enlace de recuperación es inválido "
                "o ha expirado. Solicita uno nuevo."
            )
        )


        return redirect(
            "login"
        )


    usuario = recuperacion.usuario


    error_recuperacion = None


    # ========================================================
    # POST
    # ========================================================

    if request.method == "POST":

        codigo = request.POST.get(
            "codigo",
            ""
        )


        password_nueva = (
            request.POST.get(
                "password_nueva",
                ""
            )
        )


        password_confirmacion = (
            request.POST.get(
                "password_confirmacion",
                ""
            )
        )


        # ====================================================
        # VERIFICAR CÓDIGO
        # ====================================================

        resultado_codigo = (
            verificar_codigo_recuperacion(
                recuperacion,
                codigo,
                token
            )
        )


        if not resultado_codigo[
            "ok"
        ]:

            error_recuperacion = (
                resultado_codigo[
                    "error"
                ]
            )


        # ====================================================
        # CONTRASEÑA VACÍA
        # ====================================================

        elif not password_nueva:

            error_recuperacion = (
                "Debes ingresar una nueva contraseña."
            )


        # ====================================================
        # NO COINCIDEN
        # ====================================================

        elif (
            password_nueva
            !=
            password_confirmacion
        ):

            error_recuperacion = (
                "Las contraseñas no coinciden."
            )


        # ====================================================
        # VALIDADORES DJANGO
        # ====================================================

        else:

            try:

                validate_password(
                    password_nueva,
                    user=usuario
                )

            except ValidationError as error:

                error_recuperacion = (
                    " ".join(
                        error.messages
                    )
                )


        # ====================================================
        # CAMBIO CORRECTO
        # ====================================================

        if not error_recuperacion:

            usuario.set_password(
                password_nueva
            )


            usuario.save(
                update_fields=[
                    "password"
                ]
            )


            ahora = (
                timezone.now()
            )


            # ================================================
            # INVALIDAR RECUPERACIONES
            # ================================================

            RecuperacionPassword.objects.filter(
                usuario=usuario,
                usado=False
            ).update(

                usado=True,

                fecha_uso=
                    ahora,
            )


            # ================================================
            # CERRAR TODAS LAS SESIONES ACTIVAS
            # ================================================

            sesiones_usuario = (
                SesionUsuario.objects
                .filter(
                    usuario=usuario,
                    activa=True
                )
            )


            session_keys = list(

                sesiones_usuario
                .values_list(
                    "session_key",
                    flat=True
                )
            )


            if session_keys:

                Session.objects.filter(
                    session_key__in=
                        session_keys
                ).delete()


            sesiones_usuario.update(

                activa=False,

                fecha_cierre=
                    ahora,

                motivo_cierre=
                    "recuperacion_password",
            )


            # ================================================
            # HISTORIAL
            # ================================================

            try:

                registrar_historial_acceso(
                    request,
                    usuario,
                    actividad=
                        "cambio_password",
                    detalle=(
                        "Contraseña restablecida mediante "
                        "recuperación por correo."
                    )
                )

            except Exception as error:

                print(
                    "ERROR HISTORIAL RECUPERACIÓN:",
                    error
                )


            messages.success(
                request,
                (
                    "Tu contraseña fue restablecida "
                    "correctamente. Ya puedes iniciar sesión."
                )
            )


            return redirect(
                "login"
            )


    # ========================================================
    # MOSTRAR MODAL
    # ========================================================

    return render(
        request,
        "usuarios/login.html",
        {

            "abrir_modal_password":
                True,

            "token_recuperacion":
                token,

            "error_recuperacion":
                error_recuperacion,

            "correo_recuperacion":
                usuario.email,
        }
    )