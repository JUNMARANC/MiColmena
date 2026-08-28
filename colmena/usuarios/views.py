from django.shortcuts import (
    render,
    redirect,
    get_object_or_404,
)
from django.contrib.auth import (
    authenticate,
    get_user_model,
    login,
    logout,
)
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.sessions.models import Session
from django.utils import timezone
from django.views.decorators.http import require_POST
from django.core.exceptions import ValidationError
from dbmicolmena.models import (
    Administrador,
    Apicultor,
)
from usuarios.models import (
    SesionUsuario,
)
from usuarios.services import (
    registrar_sesion_usuario,
    cerrar_registro_sesion_actual,
    registrar_historial_acceso,
    sincronizar_session_key,
    login_esta_bloqueado,
    registrar_intento_login_fallido,
    reiniciar_intentos_login,
    reenviar_codigo_2fa,
    obtener_estado_reenvio_2fa,
    obtener_politica_2fa,
    crear_recuperacion_password,
    enviar_correo_recuperacion_password,
)

from django.contrib.auth import (
    update_session_auth_hash,
)
from django.contrib.auth.password_validation import (
    validate_password,
    
)
from usuarios.models import Configuracion2FA,RecuperacionPassword,SesionUsuario
from usuarios.services import (
    crear_y_enviar_codigo_2fa,
    verificar_codigo_2fa,
    limpiar_desafio_2fa,
    obtener_recuperacion_password,
    verificar_codigo_recuperacion,
    registrar_historial_acceso,
)
from django.conf import settings
from django.contrib.auth.password_validation import (
    validate_password
)
from django.core.exceptions import ValidationError







# ============================================================
# LOGIN
# ============================================================

def login_view(request):

    # ========================================================
    # SI YA ESTÁ AUTENTICADO
    # ========================================================

    if request.user.is_authenticated:

        if Administrador.objects.filter(
            user=request.user
        ).exists():

            return redirect(
                "dashboard_admin"
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
                        "Debes ingresar el usuario "
                        "y la contraseña."
                }
            )


        # ====================================================
        # VERIFICAR BLOQUEO TEMPORAL
        # ====================================================

        bloqueado, control = (
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
                        "El acceso está bloqueado "
                        "temporalmente debido a varios "
                        "intentos fallidos. Intenta "
                        "nuevamente más tarde."
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


            if resultado_intento["bloqueado"]:

                error = (
                    "Se alcanzó el número máximo "
                    "de intentos permitidos. "
                    "El acceso fue bloqueado "
                    "temporalmente."
                )

            else:

                restantes = (
                    resultado_intento[
                        "restantes"
                    ]
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
                    "error": error
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
        # CONFIGURACIÓN 2FA DEL USUARIO
        # ====================================================

        config_2fa, creado = (
            Configuracion2FA.objects
            .get_or_create(
                usuario=user
            )
        )


        # ====================================================
        # POLÍTICA GLOBAL 2FA
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

            # ================================================
            # ¿DEBEMOS ACTIVARLO AL VERIFICAR?
            # ================================================

            activar_al_verificar = (
                politica_2fa[
                    "obligatorio"
                ]
                and
                not config_2fa.activo
            )


            # ================================================
            # CREAR Y ENVIAR CÓDIGO
            # ================================================

            resultado_2fa = (
                crear_y_enviar_codigo_2fa(
                    request,
                    user,
                    proposito="login"
                )
            )


            if not resultado_2fa["ok"]:

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


            # ================================================
            # SI ES OBLIGATORIO Y NO LO TENÍA
            # ================================================

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
        # SIN 2FA
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
        # REGISTRAR HISTORIAL
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
        # ADMINISTRADOR
        # ====================================================

        if Administrador.objects.filter(
            user=user
        ).exists():

            return redirect(
                "dashboard_admin"
            )


        # ====================================================
        # APICULTOR
        # ====================================================

        # if Apicultor.objects.filter(
        #     user=user
        # ).exists():
        #
        #     return redirect(
        #         "dashboard_apicultor"
        #     )


        # ====================================================
        # SIN PERFIL
        # ====================================================

        try:

            cerrar_registro_sesion_actual(
                request,
                motivo="sin_perfil"
            )

        except Exception:

            pass


        logout(
            request
        )


        return render(
            request,
            "usuarios/login.html",
            {
                "error":
                    "Tu usuario no tiene "
                    "un perfil asignado."
            }
        )


    # ========================================================
    # GET
    # ========================================================

    return render(
        request,
        "usuarios/login.html"
    )




def logout_view(request):

    if request.user.is_authenticated:

        usuario = request.user


        # ====================================================
        # REGISTRAR HISTORIAL
        # ====================================================

        registrar_historial_acceso(
            request,
            usuario,
            actividad="logout",
            detalle="El usuario cerró la sesión."
        )


        # ====================================================
        # CERRAR REGISTRO SESIÓN
        # ====================================================

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
    # BUSCAR LA SESIÓN
    # SOLO PUEDE SER DEL USUARIO ACTUAL
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
    # NO PERMITIR CERRAR LA SESIÓN ACTUAL
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
    # GUARDAR INFORMACIÓN ANTES DE MODIFICARLA
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
    # ELIMINAR LA SESIÓN REAL DE DJANGO
    # ========================================================

    Session.objects.filter(
        session_key=sesion.session_key
    ).delete()


    # ========================================================
    # MARCAR SesionUsuario COMO CERRADA
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
    # REGISTRAR HISTORIAL
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
            "ERROR REGISTRANDO "
            "CIERRE REMOTO:",
            error
        )


    messages.success(
        request,
        "La sesión fue cerrada correctamente."
    )


    return redirect(
        "mi_perfil"
    )



# ============================================================
# CERRAR TODAS LAS DEMÁS SESIONES
# ============================================================

@login_required
@require_POST
def cerrar_otras_sesiones(
    request
):

    session_key_actual = (
        request.session.session_key
    )


    # ========================================================
    # OBTENER TODAS LAS SESIONES
    # MENOS LA ACTUAL
    # ========================================================

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


    # ========================================================
    # OBTENER LAS CLAVES
    # ========================================================

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
    # SI NO HAY OTRAS SESIONES
    # ========================================================

    if cantidad == 0:

        messages.info(
            request,
            "No tienes otras sesiones activas."
        )

        return redirect(
            "mi_perfil"
        )


    # ========================================================
    # ELIMINAR SESIONES REALES DE DJANGO
    # ========================================================

    Session.objects.filter(
        session_key__in=claves
    ).delete()


    # ========================================================
    # ACTUALIZAR NUESTROS REGISTROS
    # ========================================================

    sesiones.update(
        activa=False,
        fecha_cierre=timezone.now(),
        motivo_cierre="cerrada_remotamente"
    )


    # ========================================================
    # REGISTRAR HISTORIAL
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
            "ERROR REGISTRANDO "
            "CIERRE DE SESIONES:",
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
        "mi_perfil"
    )



# ============================================================
# INICIAR ACTIVACIÓN DE 2FA
# ============================================================

@login_required
@require_POST
def iniciar_activacion_2fa(request):

    # ========================================================
    # OBTENER CONFIGURACIÓN 2FA DEL USUARIO
    # ========================================================

    config_2fa, _ = (
        Configuracion2FA.objects
        .get_or_create(
            usuario=request.user
        )
    )


    # ========================================================
    # CONSULTAR POLÍTICA GLOBAL DE 2FA
    # ========================================================

    politica_2fa = (
        obtener_politica_2fa(
            request.user
        )
    )


    # ========================================================
    # 2FA DESHABILITADO GLOBALMENTE
    # ========================================================

    if not politica_2fa[
        "permitir_2fa"
    ]:

        messages.warning(
            request,
            "La autenticación en dos pasos "
            "está deshabilitada por la "
            "configuración del sistema."
        )

        return redirect(
            "mi_perfil"
        )


    # ========================================================
    # YA ESTÁ ACTIVADO
    # ========================================================

    if config_2fa.activo:

        messages.info(
            request,
            "La autenticación en dos pasos "
            "ya está activada."
        )

        return redirect(
            "mi_perfil"
        )


    # ========================================================
    # VERIFICAR QUE EL USUARIO TENGA CORREO
    # ========================================================

    if not request.user.email:

        messages.error(
            request,
            "Debes tener un correo electrónico "
            "registrado para activar la "
            "autenticación en dos pasos."
        )

        return redirect(
            "mi_perfil"
        )


    # ========================================================
    # CREAR Y ENVIAR CÓDIGO DE VERIFICACIÓN
    # ========================================================

    resultado = (
        crear_y_enviar_codigo_2fa(
            request,
            request.user,
            proposito="activar"
        )
    )


    # ========================================================
    # ERROR AL CREAR O ENVIAR EL CÓDIGO
    # ========================================================

    if not resultado["ok"]:

        messages.error(
            request,
            resultado["error"]
        )

        return redirect(
            "mi_perfil"
        )


    # ========================================================
    # IR A LA PANTALLA DE VERIFICACIÓN
    # ========================================================

    return redirect(
        "verificar_activacion_2fa"
    )


# ============================================================
# OCULTAR CORREO
# ============================================================

def ocultar_correo(
    correo
):

    if (
        not correo
        or
        "@" not in correo
    ):

        return "correo registrado"


    nombre, dominio = (
        correo.split(
            "@",
            1
        )
    )


    visibles = (
        nombre[:2]
    )


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
# VERIFICAR ACTIVACIÓN 2FA
# ============================================================

@login_required
def verificar_activacion_2fa(
    request
):

    # ========================================================
    # VERIFICAR QUE EL DESAFÍO SEA DEL USUARIO ACTUAL
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
        usuario_id != request.user.pk
        or
        proposito != "activar"
    ):

        messages.warning(
            request,
            "No existe una verificación "
            "2FA pendiente."
        )

        return redirect(
            "mi_perfil"
        )


    error = None


    # ========================================================
    # POST
    # ========================================================

    if request.method == "POST":

        codigo = (
            request.POST.get(
                "codigo",
                ""
            )
        )


        resultado = (
            verificar_codigo_2fa(
                request,
                codigo,
                proposito_esperado="activar"
            )
        )


        # ====================================================
        # CÓDIGO CORRECTO
        # ====================================================

        if resultado["ok"]:

            config_2fa, creado = (
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


            limpiar_desafio_2fa(
                request
            )


            messages.success(
                request,
                "La autenticación en dos pasos "
                "se activó correctamente."
            )


            return redirect(
                "mi_perfil"
            )


        error = (
            resultado["error"]
        )


        # Si expiró o se bloquearon los intentos,
        # ya no existe desafío activo.

        if resultado["tipo"] in [
            "expirado",
            "bloqueado",
            "sin_desafio",
            "invalido",
        ]:

            return render(
                request,
                "usuarios/verificar_activacion_2fa.html",
                {
                    "error": error,
                    "puede_verificar": False,
                    "correo_oculto":
                        ocultar_correo(
                            request.user.email
                        ),
                }
            )


    # ========================================================
    # MOSTRAR PANTALLA
    # ========================================================

    return render(
        request,
        "usuarios/verificar_activacion_2fa.html",
        {
            "error": error,

            "puede_verificar": True,

            "correo_oculto":
                ocultar_correo(
                    request.user.email
                ),
        }
    )


@login_required
@require_POST
def iniciar_desactivacion_2fa(request):

    config_2fa, creado = (
        Configuracion2FA.objects
        .get_or_create(
            usuario=request.user
        )
    )


    # ========================================================
    # POLÍTICA GLOBAL 2FA
    # ========================================================

    politica_2fa = obtener_politica_2fa(
        request.user
    )


    # ========================================================
    # SI ES OBLIGATORIO, NO SE PUEDE DESACTIVAR
    # ========================================================

    if politica_2fa["obligatorio"]:

        messages.warning(
            request,
            "No puedes desactivar la autenticación "
            "en dos pasos porque es obligatoria "
            "según la política de seguridad del sistema."
        )

        return redirect(
            "mi_perfil"
        )


    # ========================================================
    # YA ESTÁ DESACTIVADO
    # ========================================================

    if not config_2fa.activo:

        messages.info(
            request,
            "La autenticación en dos pasos "
            "ya está desactivada."
        )

        return redirect(
            "mi_perfil"
        )


    if not request.user.email:

        messages.error(
            request,
            "Tu cuenta no tiene un correo "
            "electrónico registrado."
        )

        return redirect(
            "mi_perfil"
        )


    resultado = crear_y_enviar_codigo_2fa(
        request,
        request.user,
        proposito="desactivar"
    )


    if not resultado["ok"]:

        messages.error(
            request,
            resultado["error"]
        )

        return redirect(
            "mi_perfil"
        )


    return redirect(
        "verificar_desactivacion_2fa"
    )


# ============================================================
# VERIFICAR DESACTIVACIÓN 2FA
# ============================================================

@login_required
def verificar_desactivacion_2fa(request):

    # ========================================================
    # COMPROBAR POLÍTICA GLOBAL
    # ========================================================

    politica_2fa = obtener_politica_2fa(
        request.user
    )


    # ========================================================
    # 2FA OBLIGATORIO
    # ========================================================

    if politica_2fa["obligatorio"]:

        # Eliminar cualquier proceso de desactivación
        # que hubiera quedado pendiente anteriormente.

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
            "No puedes desactivar la autenticación "
            "en dos pasos porque es obligatoria "
            "para tu cuenta."
        )


        return redirect(
            "mi_perfil"
        )


    # ========================================================
    # A PARTIR DE AQUÍ CONTINÚA TU CÓDIGO ACTUAL
    # ========================================================

    usuario_id = request.session.get(
        "2fa_usuario_id"
    )

    proposito = request.session.get(
        "2fa_proposito"
    )

    # ...


# ============================================================
# VERIFICAR DESACTIVACIÓN 2FA
# ============================================================

@login_required
def verificar_desactivacion_2fa(request):

    usuario_id = request.session.get(
        "2fa_usuario_id"
    )

    proposito = request.session.get(
        "2fa_proposito"
    )


    # ========================================================
    # VERIFICAR DESAFÍO
    # ========================================================

    if (
        usuario_id != request.user.pk
        or
        proposito != "desactivar"
    ):

        messages.warning(
            request,
            "No existe una verificación "
            "2FA pendiente."
        )

        return redirect(
            "mi_perfil"
        )


    error = None


    # ========================================================
    # POST
    # ========================================================

    if request.method == "POST":

        codigo = request.POST.get(
            "codigo",
            ""
        )


        resultado = verificar_codigo_2fa(
            request,
            codigo,
            proposito_esperado="desactivar"
        )


        # ====================================================
        # CÓDIGO CORRECTO
        # ====================================================

        if resultado["ok"]:

            config_2fa, creado = (
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


            limpiar_desafio_2fa(
                request
            )


            messages.success(
                request,
                "La autenticación en dos pasos "
                "se desactivó correctamente."
            )


            return redirect(
                "mi_perfil"
            )


        # ====================================================
        # ERROR
        # ====================================================

        error = resultado["error"]


        if resultado["tipo"] in [
            "expirado",
            "bloqueado",
            "sin_desafio",
            "invalido",
        ]:

            return render(
                request,
                "usuarios/verificar_desactivacion_2fa.html",
                {
                    "error": error,

                    "puede_verificar": False,

                    "correo_oculto":
                        ocultar_correo(
                            request.user.email
                        ),
                }
            )


    return render(
        request,
        "usuarios/verificar_desactivacion_2fa.html",
        {
            "error": error,

            "puede_verificar": True,

            "correo_oculto":
                ocultar_correo(
                    request.user.email
                ),
        }
    )



# ============================================================
# VERIFICAR 2FA DURANTE EL LOGIN
# ============================================================

def verificar_login_2fa(request):

    # ========================================================
    # SI YA ESTÁ AUTENTICADO
    # ========================================================

    if request.user.is_authenticated:

        if Administrador.objects.filter(
            user=request.user
        ).exists():

            return redirect(
                "dashboard_admin"
            )


    # ========================================================
    # DATOS DEL DESAFÍO
    # ========================================================

    usuario_id = request.session.get(
        "2fa_usuario_id"
    )

    proposito = request.session.get(
        "2fa_proposito"
    )

    backend = request.session.get(
        "2fa_backend"
    )


    # ========================================================
    # NO EXISTE LOGIN 2FA PENDIENTE
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
            "No existe una verificación "
            "de inicio de sesión pendiente."
        )

        return redirect(
            "login"
        )


    # ========================================================
    # OBTENER USUARIO
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
            "No fue posible completar "
            "la autenticación."
        )

        return redirect(
            "login"
        )


    # ========================================================
    # POLÍTICA GLOBAL 2FA
    # ========================================================

    politica_2fa = (
        obtener_politica_2fa(
            user
        )
    )


    # ========================================================
    # 2FA DESHABILITADO GLOBALMENTE
    # ========================================================

    if not politica_2fa[
        "permitir_2fa"
    ]:

        limpiar_desafio_2fa(
            request
        )

        messages.warning(
            request,
            "La autenticación en dos pasos "
            "fue deshabilitada por la "
            "configuración del sistema. "
            "Inicia sesión nuevamente."
        )

        return redirect(
            "login"
        )


    # ========================================================
    # CONFIGURACIÓN 2FA DEL USUARIO
    # ========================================================

    config_2fa, creado = (
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


    # ========================================================
    # VALIDAR QUE EL DESAFÍO SIGA SIENDO VÁLIDO
    #
    # Permitimos continuar si:
    #
    # 1. El usuario ya tiene 2FA activo.
    # 2. El sistema está obligándolo a activarlo.
    # ========================================================

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
            "La verificación en dos pasos "
            "ya no está disponible. "
            "Inicia sesión nuevamente."
        )

        return redirect(
            "login"
        )


    # ========================================================
    # VARIABLES DE LA PANTALLA
    # ========================================================

    error = None

    puede_verificar = True


    # ========================================================
    # POST
    # ========================================================

    if request.method == "POST":

        codigo = request.POST.get(
            "codigo",
            ""
        )


        resultado = verificar_codigo_2fa(
            request,
            codigo,
            proposito_esperado="login"
        )


        # ====================================================
        # CÓDIGO CORRECTO
        # ====================================================

        if resultado["ok"]:

            # ================================================
            # ACTIVACIÓN OBLIGATORIA DE 2FA
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


                # ============================================
                # HISTORIAL DE ACTIVACIÓN OBLIGATORIA
                # ============================================

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
            # GUARDAR BACKEND ANTES DE LIMPIAR
            # ================================================

            backend_login = backend


            if not backend_login:

                backend_login = (
                    settings
                    .AUTHENTICATION_BACKENDS[0]
                )


            # ================================================
            # LIMPIAR DESAFÍO
            #
            # Aquí se elimina:
            #
            # 2fa_usuario_id
            # 2fa_codigo_hash
            # 2fa_nonce
            # 2fa_expira
            # 2fa_intentos
            # 2fa_proposito
            # 2fa_backend
            # 2fa_reenvios
            # 2fa_ultimo_envio
            # 2fa_forzar_activacion
            # ================================================

            limpiar_desafio_2fa(
                request
            )


            # ================================================
            # AHORA SÍ INICIAMOS SESIÓN
            # ================================================

            login(
                request,
                user,
                backend=backend_login
            )


            # ================================================
            # REGISTRAR SESIÓN ACTIVA
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
            # REGISTRAR HISTORIAL DEL LOGIN
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
            # ADMINISTRADOR
            # ================================================

            if Administrador.objects.filter(
                user=user
            ).exists():

                return redirect(
                    "dashboard_admin"
                )


            # ================================================
            # APICULTOR
            # ================================================

            # Cuando tengas listo el dashboard
            # del apicultor puedes activar esto.

            # if Apicultor.objects.filter(
            #     user=user
            # ).exists():
            #
            #     return redirect(
            #         "dashboard_apicultor"
            #     )


            # ================================================
            # SIN PERFIL
            # ================================================

            try:

                cerrar_registro_sesion_actual(
                    request,
                    motivo="sin_perfil"
                )

            except Exception:

                pass


            logout(
                request
            )


            messages.error(
                request,
                "Tu usuario no tiene "
                "un perfil asignado."
            )


            return redirect(
                "login"
            )


        # ====================================================
        # CÓDIGO INCORRECTO
        # ====================================================

        error = resultado[
            "error"
        ]


        # ====================================================
        # EXPIRADO / BLOQUEADO / INVÁLIDO
        # ====================================================

        if resultado["tipo"] in [
            "expirado",
            "bloqueado",
            "sin_desafio",
            "invalido",
        ]:

            puede_verificar = False


    # ========================================================
    # ESTADO DEL REENVÍO
    #
    # IMPORTANTE:
    # Esto va fuera del if request.method == "POST"
    # para que también funcione cuando la página carga por GET.
    # ========================================================

    estado_reenvio = (
        obtener_estado_reenvio_2fa(
            request
        )
    )


    # ========================================================
    # MOSTRAR PANTALLA
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
# REENVIAR CÓDIGO 2FA DEL LOGIN
# ============================================================

@require_POST
def reenviar_login_2fa(request):

    # ========================================================
    # SI YA ESTÁ AUTENTICADO
    # ========================================================

    if request.user.is_authenticated:

        return redirect(
            "dashboard_admin"
        )


    # ========================================================
    # DATOS PENDIENTES
    # ========================================================

    usuario_id = request.session.get(
        "2fa_usuario_id"
    )

    proposito = request.session.get(
        "2fa_proposito"
    )


    if (
        not usuario_id
        or
        proposito != "login"
    ):

        messages.error(
            request,
            "No existe una verificación "
            "de inicio de sesión pendiente."
        )

        return redirect(
            "login"
        )


    # ========================================================
    # OBTENER USUARIO
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
            "No fue posible completar "
            "la verificación."
        )

        return redirect(
            "login"
        )


    # ========================================================
    # REENVIAR
    # ========================================================

    resultado = reenviar_codigo_2fa(
        request,
        user,
        proposito_esperado="login"
    )


    if resultado["ok"]:

        messages.success(
            request,
            "Enviamos un nuevo código "
            "de verificación a tu correo."
        )

    else:

        messages.error(
            request,
            resultado["error"]
        )


    return redirect(
        "verificar_login_2fa"
    )




# ============================================================
# SOLICITAR RECUPERACIÓN DE CONTRASEÑA
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
    #
    # No debemos revelar si un correo existe o no.
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

            datos["codigo"],

            datos["token"],
        )
    )


    if not enviado:

        datos[
            "recuperacion"
        ].delete()


        messages.error(
            request,
            "No fue posible enviar el correo "
            "de recuperación. Intenta nuevamente."
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
    # BUSCAR SOLICITUD
    # ========================================================

    recuperacion = (
        obtener_recuperacion_password(
            token
        )
    )


    # ========================================================
    # TOKEN INVÁLIDO O EXPIRADO
    # ========================================================

    if not recuperacion:

        messages.error(
            request,
            "El enlace de recuperación es inválido "
            "o ha expirado. Solicita uno nuevo."
        )

        return redirect(
            "login"
        )


    usuario = recuperacion.usuario

    error_recuperacion = None


    # ========================================================
    # POST - CAMBIAR CONTRASEÑA
    # ========================================================

    if request.method == "POST":

        codigo = request.POST.get(
            "codigo",
            ""
        )

        password_nueva = request.POST.get(
            "password_nueva",
            ""
        )

        password_confirmacion = request.POST.get(
            "password_confirmacion",
            ""
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


        if not resultado_codigo["ok"]:

            error_recuperacion = (
                resultado_codigo["error"]
            )


        # ====================================================
        # CONTRASEÑAS
        # ====================================================

        elif not password_nueva:

            error_recuperacion = (
                "Debes ingresar una nueva contraseña."
            )


        elif (
            password_nueva
            !=
            password_confirmacion
        ):

            error_recuperacion = (
                "Las contraseñas no coinciden."
            )


        else:

            # ================================================
            # VALIDADORES OFICIALES DE DJANGO
            # ================================================

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


            ahora = timezone.now()


            # ================================================
            # INVALIDAR SOLICITUDES DE RECUPERACIÓN
            # ================================================

            RecuperacionPassword.objects.filter(
                usuario=usuario,
                usado=False
            ).update(
                usado=True,
                fecha_uso=ahora
            )


            # ================================================
            # CERRAR SESIONES ACTIVAS DEL USUARIO
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
                    session_key__in=session_keys
                ).delete()


            sesiones_usuario.update(
                activa=False,
                fecha_cierre=ahora,
                motivo_cierre="recuperacion_password"
            )


            # ================================================
            # HISTORIAL
            # ================================================

            try:

                registrar_historial_acceso(
                    request,
                    usuario,
                    actividad="cambio_password",
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
                "Tu contraseña fue restablecida "
                "correctamente. Ya puedes iniciar sesión."
            )


            return redirect(
                "login"
            )


    # ========================================================
    # ABRIR LOGIN CON MODAL
    # ========================================================

    return render(
        request,
        "usuarios/login.html",
        {
            "abrir_modal_password": True,

            "token_recuperacion":
                token,

            "error_recuperacion":
                error_recuperacion,

            "correo_recuperacion":
                usuario.email,
        }
    )