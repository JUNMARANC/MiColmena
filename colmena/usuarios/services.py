from django.contrib.sessions.models import Session
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model
from usuarios.models import (
    SesionUsuario,
    HistorialAcceso,
    ControlIntentosLogin,
    RecuperacionPassword,
)
from cryptography.fernet import Fernet
from django.conf import settings
import secrets
from django.utils.crypto import salted_hmac
from django.core.mail import send_mail
import math
import hashlib
from django.urls import reverse


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


# ============================================================
# VERIFICAR SI EL HISTORIAL ESTÁ HABILITADO
# ============================================================

def historial_accesos_habilitado():

    try:

        from panel_admin.models import (
            ConfiguracionSeguridad,
        )

        config = (
            ConfiguracionSeguridad.objects
            .filter(pk=1)
            .first()
        )


        if not config:
            return True


        return (
            config.registrar_historial_accesos
        )

    except Exception:

        return True



# ============================================================
# REGISTRAR HISTORIAL DE ACCESO
# ============================================================

def registrar_historial_acceso(
    request,
    usuario,
    actividad,
    detalle="",
    exitoso=True
):

    if not usuario:
        return None


    if not historial_accesos_habilitado():
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


    historial = (
        HistorialAcceso.objects.create(

            usuario=usuario,

            actividad=actividad,

            ip=obtener_ip(
                request
            ),

            navegador=
                datos_dispositivo[
                    "navegador"
                ],

            sistema_operativo=
                datos_dispositivo[
                    "sistema_operativo"
                ],

            dispositivo=
                datos_dispositivo[
                    "dispositivo"
                ],

            user_agent=
                user_agent,

            detalle=
                detalle,

            exitoso=
                exitoso
        )
    )


    return historial



# ============================================================
# SINCRONIZAR SESSION_KEY DESPUÉS DE CAMBIAR CONTRASEÑA
# ============================================================

def sincronizar_session_key(
    request,
    session_key_anterior
):

    if not request.user.is_authenticated:
        return


    nueva_session_key = (
        request.session.session_key
    )


    # Si por alguna razón todavía no existe,
    # hacemos que Django cree la sesión.

    if not nueva_session_key:

        request.session.save()

        nueva_session_key = (
            request.session.session_key
        )


    if not nueva_session_key:
        return


    # ========================================================
    # BUSCAR EL REGISTRO ANTERIOR
    # ========================================================

    sesion = (
        SesionUsuario.objects
        .filter(
            usuario=request.user,
            session_key=session_key_anterior,
            activa=True
        )
        .first()
    )


    # ========================================================
    # SI EXISTE, CAMBIAMOS LA SESSION KEY
    # ========================================================

    if sesion:

        sesion.session_key = (
            nueva_session_key
        )

        sesion.ultima_actividad = (
            timezone.now()
        )

        sesion.save(
            update_fields=[
                "session_key",
                "ultima_actividad",
            ]
        )

        return sesion


    # ========================================================
    # SI NO EXISTÍA, REGISTRAMOS LA SESIÓN
    # ========================================================

    return registrar_sesion_usuario(
        request,
        request.user
    )



# ============================================================
# OBTENER CONFIGURACIÓN DEL BLOQUEO DE LOGIN
# ============================================================

def obtener_configuracion_bloqueo_login():

    from panel_admin.models import ConfiguracionSeguridad

    config, creado = (
        ConfiguracionSeguridad.objects
        .get_or_create(pk=1)
    )

    return config


# ============================================================
# OBTENER CONTROL DE INTENTOS
# ============================================================

def obtener_control_intentos_login(
    identificador
):

    identificador = (
        identificador
        .strip()
        .lower()
    )


    User = get_user_model()


    usuario = (
        User.objects
        .filter(
            username__iexact=identificador
        )
        .first()
    )


    control, creado = (
        ControlIntentosLogin.objects
        .get_or_create(
            identificador=identificador,
            defaults={
                "usuario": usuario
            }
        )
    )


    if (
        usuario
        and
        control.usuario_id is None
    ):

        control.usuario = usuario

        control.save(
            update_fields=[
                "usuario"
            ]
        )


    return control


# ============================================================
# VERIFICAR SI EL LOGIN ESTÁ BLOQUEADO
# ============================================================

def login_esta_bloqueado(
    identificador
):

    config = (
        obtener_configuracion_bloqueo_login()
    )


    # Si la protección está desactivada,
    # no bloqueamos.

    if not config.bloquear_intentos_fallidos:

        return False, None


    control = (
        obtener_control_intentos_login(
            identificador
        )
    )


    if not control.bloqueado_hasta:

        return False, control


    ahora = timezone.now()


    # ========================================================
    # EL BLOQUEO YA VENCIÓ
    # ========================================================

    if (
        control.bloqueado_hasta
        <=
        ahora
    ):

        control.intentos_fallidos = 0

        control.bloqueado_hasta = None

        control.save(
            update_fields=[
                "intentos_fallidos",
                "bloqueado_hasta",
            ]
        )


        return False, control


    # ========================================================
    # TODAVÍA ESTÁ BLOQUEADO
    # ========================================================

    return True, control


# ============================================================
# REGISTRAR INTENTO FALLIDO
# ============================================================

def registrar_intento_login_fallido(
    request,
    identificador
):

    config = (
        obtener_configuracion_bloqueo_login()
    )


    if not config.bloquear_intentos_fallidos:

        return {
            "bloqueado": False,
            "intentos": 0,
            "restantes": None,
            "bloqueado_hasta": None,
        }


    control = (
        obtener_control_intentos_login(
            identificador
        )
    )


    ahora = timezone.now()


    control.intentos_fallidos += 1

    control.ultimo_intento = ahora

    control.ultima_ip = obtener_ip(
        request
    )


    # ========================================================
    # LLEGÓ AL LÍMITE
    # ========================================================

    if (
        control.intentos_fallidos
        >=
        config.intentos_maximos_login
    ):

        control.bloqueado_hasta = (
            ahora
            +
            timedelta(
                minutes=
                    config.minutos_bloqueo_login
            )
        )


    control.save()


    restantes = max(
        0,
        config.intentos_maximos_login
        -
        control.intentos_fallidos
    )


    return {
        "bloqueado":
            control.bloqueado_hasta is not None,

        "intentos":
            control.intentos_fallidos,

        "restantes":
            restantes,

        "bloqueado_hasta":
            control.bloqueado_hasta,
    }


# ============================================================
# REINICIAR INTENTOS DESPUÉS DE LOGIN CORRECTO
# ============================================================

def reiniciar_intentos_login(
    identificador
):

    identificador = (
        identificador
        .strip()
        .lower()
    )


    ControlIntentosLogin.objects.filter(
        identificador=identificador
    ).update(
        intentos_fallidos=0,
        bloqueado_hasta=None
    )



# ============================================================
# CIFRADO 2FA
# ============================================================

def obtener_cifrador_2fa():

    clave = (
        settings.TWO_FA_ENCRYPTION_KEY
    )


    if isinstance(
        clave,
        str
    ):

        clave = clave.encode()


    return Fernet(
        clave
    )


# ============================================================
# CIFRAR SECRETO 2FA
# ============================================================

def cifrar_secreto_2fa(
    secreto
):

    cifrador = (
        obtener_cifrador_2fa()
    )


    secreto_cifrado = (
        cifrador.encrypt(
            secreto.encode()
        )
    )


    return (
        secreto_cifrado.decode()
    )


# ============================================================
# DESCIFRAR SECRETO 2FA
# ============================================================

def descifrar_secreto_2fa(
    secreto_cifrado
):

    cifrador = (
        obtener_cifrador_2fa()
    )


    secreto = (
        cifrador.decrypt(
            secreto_cifrado.encode()
        )
    )


    return (
        secreto.decode()
    )


# ============================================================
# CONFIGURACIÓN 2FA
# ============================================================

DURACION_CODIGO_2FA_MINUTOS = 5

MAX_INTENTOS_CODIGO_2FA = 5

TIEMPO_REENVIO_2FA_SEGUNDOS = 60

MAX_REENVIOS_CODIGO_2FA = 3


# ============================================================
# GENERAR CÓDIGO 2FA DE 6 DÍGITOS
# ============================================================

def generar_codigo_2fa():

    codigo = (
        secrets.randbelow(
            900000
        )
        +
        100000
    )

    return str(
        codigo
    )


# ============================================================
# CREAR HASH DEL CÓDIGO 2FA
# ============================================================

def generar_hash_codigo_2fa(
    codigo,
    nonce
):

    valor = (
        f"{nonce}:{codigo}"
    )


    return (
        salted_hmac(
            "usuarios.codigo_2fa",
            valor
        )
        .hexdigest()
    )


# ============================================================
# CREAR DESAFÍO 2FA
# ============================================================

def crear_desafio_2fa(
    request,
    usuario
):

    # ========================================================
    # GENERAR CÓDIGO
    # ========================================================

    codigo = (
        generar_codigo_2fa()
    )


    # ========================================================
    # IDENTIFICADOR ALEATORIO DEL DESAFÍO
    # ========================================================

    nonce = (
        secrets.token_urlsafe(
            16
        )
    )


    # ========================================================
    # FECHA DE EXPIRACIÓN
    # ========================================================

    ahora = (
        timezone.now()
    )


    expira = (
        ahora
        +
        timedelta(
            minutes=
                DURACION_CODIGO_2FA_MINUTOS
        )
    )


    # ========================================================
    # CREAR HASH
    # ========================================================

    codigo_hash = (
        generar_hash_codigo_2fa(
            codigo,
            nonce
        )
    )


    # ========================================================
    # GUARDAR INFORMACIÓN EN LA SESIÓN
    # ========================================================

    request.session[
        "2fa_usuario_id"
    ] = usuario.pk


    request.session[
        "2fa_codigo_hash"
    ] = codigo_hash


    request.session[
        "2fa_nonce"
    ] = nonce


    request.session[
        "2fa_expira"
    ] = expira.timestamp()


    request.session[
        "2fa_intentos"
    ] = 0


    request.session[
        "2fa_verificado"
    ] = False


    request.session.modified = True


    # ========================================================
    # DEVOLVER EL CÓDIGO
    #
    # Este será enviado por correo en el siguiente paso.
    # No se guarda en la base de datos ni en la sesión.
    # ========================================================

    return codigo



# ============================================================
# VERIFICAR SI EL CÓDIGO 2FA EXPIRÓ
# ============================================================

def codigo_2fa_expirado(
    request
):

    expira = (
        request.session.get(
            "2fa_expira"
        )
    )


    if not expira:

        return True


    ahora = (
        timezone.now()
        .timestamp()
    )


    return (
        ahora
        >
        float(expira)
    )





def limpiar_desafio_2fa(request):

    claves = [

        "2fa_usuario_id",

        "2fa_codigo_hash",

        "2fa_nonce",

        "2fa_expira",

        "2fa_intentos",

        "2fa_proposito",

        "2fa_backend",

        "2fa_reenvios",

        "2fa_ultimo_envio",

        "2fa_forzar_activacion",

    ]


    for clave in claves:

        request.session.pop(
            clave,
            None
        )


    request.session.modified = True


# ============================================================
# ENVIAR CÓDIGO 2FA POR CORREO
# ============================================================

def enviar_codigo_2fa(
    usuario,
    codigo
):

    # ========================================================
    # VERIFICAR CORREO
    # ========================================================

    if not usuario.email:

        return {
            "enviado": False,
            "error": (
                "El usuario no tiene "
                "un correo registrado."
            )
        }


    # ========================================================
    # ASUNTO
    # ========================================================

    asunto = (
        "Código de verificación - Mi Colmena"
    )


    # ========================================================
    # MENSAJE
    # ========================================================

    nombre = (
        usuario.first_name
        or
        usuario.username
    )


    mensaje = f"""
Hola {nombre},

Se solicitó un código de verificación para tu cuenta de Mi Colmena.

Tu código de seguridad es:

{codigo}

Este código tiene una duración de 5 minutos.

Si no solicitaste este código, puedes ignorar este mensaje.

Mi Colmena
"""


    # ========================================================
    # ENVIAR CORREO
    # ========================================================

    try:

        enviados = send_mail(

            subject=asunto,

            message=mensaje,

            from_email=
                settings.DEFAULT_FROM_EMAIL,

            recipient_list=[
                usuario.email
            ],

            fail_silently=False,
        )


        # ====================================================
        # ENVÍO CORRECTO
        # ====================================================

        if enviados == 1:

            return {
                "enviado": True,
                "error": None,
            }


        # ====================================================
        # NO SE ENVIÓ
        # ====================================================

        return {
            "enviado": False,
            "error": (
                "No fue posible enviar "
                "el código de verificación."
            ),
        }


    except Exception as error:

        print(
            "ERROR ENVIANDO CÓDIGO 2FA:",
            error
        )


        return {
            "enviado": False,
            "error": (
                "Ocurrió un error al enviar "
                "el código de verificación."
            ),
        }

def crear_y_enviar_codigo_2fa(
    request,
    usuario,
    proposito="login",
    conservar_reenvios=False
):

    if not usuario.email:

        return {
            "ok": False,
            "error": (
                "Tu cuenta no tiene un "
                "correo electrónico registrado."
            )
        }


    codigo = crear_desafio_2fa(
        request,
        usuario,
        proposito=proposito,
        conservar_reenvios=conservar_reenvios
    )


    resultado = enviar_codigo_2fa(
        usuario,
        codigo
    )


    if not resultado["enviado"]:

        limpiar_desafio_2fa(
            request
        )


        return {
            "ok": False,
            "error":
                resultado["error"],
        }


    return {
        "ok": True,
        "error": None,
    }


# ============================================================
# CREAR DESAFÍO 2FA
# ============================================================

def crear_desafio_2fa(
    request,
    usuario,
    proposito="login",
    conservar_reenvios=False
):

    # ========================================================
    # CONSERVAR CONTADOR SI ES UN REENVÍO
    # ========================================================

    if conservar_reenvios:

        reenvios = int(
            request.session.get(
                "2fa_reenvios",
                0
            )
        )

    else:

        reenvios = 0


    # ========================================================
    # GENERAR CÓDIGO
    # ========================================================

    codigo = generar_codigo_2fa()


    # ========================================================
    # NONCE
    # ========================================================

    nonce = secrets.token_urlsafe(
        16
    )


    # ========================================================
    # TIEMPO
    # ========================================================

    ahora = timezone.now()


    expira = (
        ahora
        +
        timedelta(
            minutes=
                DURACION_CODIGO_2FA_MINUTOS
        )
    )


    # ========================================================
    # HASH
    # ========================================================

    codigo_hash = generar_hash_codigo_2fa(
        codigo,
        nonce
    )


    # ========================================================
    # SESIÓN
    # ========================================================

    request.session[
        "2fa_usuario_id"
    ] = usuario.pk


    request.session[
        "2fa_codigo_hash"
    ] = codigo_hash


    request.session[
        "2fa_nonce"
    ] = nonce


    request.session[
        "2fa_expira"
    ] = expira.timestamp()


    request.session[
        "2fa_intentos"
    ] = 0


    request.session[
        "2fa_proposito"
    ] = proposito


    request.session[
        "2fa_reenvios"
    ] = reenvios


    request.session[
        "2fa_ultimo_envio"
    ] = ahora.timestamp()


    request.session.modified = True


    return codigo


# ============================================================
# VERIFICAR CÓDIGO 2FA
# ============================================================

def verificar_codigo_2fa(
    request,
    codigo,
    proposito_esperado=None
):

    # ========================================================
    # COMPROBAR QUE EXISTA UN DESAFÍO
    # ========================================================

    codigo_hash_guardado = (
        request.session.get(
            "2fa_codigo_hash"
        )
    )

    nonce = (
        request.session.get(
            "2fa_nonce"
        )
    )

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
        not codigo_hash_guardado
        or
        not nonce
        or
        not usuario_id
    ):

        return {
            "ok": False,
            "tipo": "sin_desafio",
            "error": (
                "No existe un código de "
                "verificación activo."
            ),
        }


    # ========================================================
    # VERIFICAR PROPÓSITO
    # ========================================================

    if (
        proposito_esperado
        and
        proposito
        !=
        proposito_esperado
    ):

        limpiar_desafio_2fa(
            request
        )

        return {
            "ok": False,
            "tipo": "invalido",
            "error": (
                "La solicitud de verificación "
                "no es válida."
            ),
        }


    # ========================================================
    # VERIFICAR EXPIRACIÓN
    # ========================================================

    if codigo_2fa_expirado(
        request
    ):

        limpiar_desafio_2fa(
            request
        )

        return {
            "ok": False,
            "tipo": "expirado",
            "error": (
                "El código de verificación "
                "ha expirado. Solicita uno nuevo."
            ),
        }


    # ========================================================
    # VALIDAR FORMATO
    # ========================================================

    codigo = str(
        codigo
        or
        ""
    ).strip()


    if (
        len(codigo) != 6
        or
        not codigo.isdigit()
    ):

        return {
            "ok": False,
            "tipo": "formato",
            "error": (
                "El código debe contener "
                "exactamente 6 dígitos."
            ),
        }


    # ========================================================
    # CONTROL DE INTENTOS
    # ========================================================

    intentos = int(
        request.session.get(
            "2fa_intentos",
            0
        )
    )


    if (
        intentos
        >=
        MAX_INTENTOS_CODIGO_2FA
    ):

        limpiar_desafio_2fa(
            request
        )

        return {
            "ok": False,
            "tipo": "bloqueado",
            "error": (
                "Superaste el número máximo "
                "de intentos. Solicita un "
                "nuevo código."
            ),
        }


    # ========================================================
    # CALCULAR HASH DEL CÓDIGO INGRESADO
    # ========================================================

    codigo_hash_ingresado = (
        generar_hash_codigo_2fa(
            codigo,
            nonce
        )
    )


    # ========================================================
    # COMPARACIÓN SEGURA
    # ========================================================

    codigo_correcto = (
        secrets.compare_digest(
            codigo_hash_ingresado,
            codigo_hash_guardado
        )
    )


    # ========================================================
    # CÓDIGO INCORRECTO
    # ========================================================

    if not codigo_correcto:

        intentos += 1


        request.session[
            "2fa_intentos"
        ] = intentos


        request.session.modified = True


        restantes = max(
            0,
            MAX_INTENTOS_CODIGO_2FA
            -
            intentos
        )


        if restantes == 0:

            limpiar_desafio_2fa(
                request
            )

            return {
                "ok": False,
                "tipo": "bloqueado",
                "error": (
                    "Superaste el número máximo "
                    "de intentos. Solicita un "
                    "nuevo código."
                ),
            }


        return {
            "ok": False,
            "tipo": "incorrecto",
            "restantes": restantes,
            "error": (
                "El código ingresado es incorrecto. "
                f"Intentos restantes: {restantes}."
            ),
        }


    # ========================================================
    # CÓDIGO CORRECTO
    # ========================================================

    return {
        "ok": True,
        "tipo": "correcto",
        "usuario_id": usuario_id,
        "error": None,
    }


# ============================================================
# ESTADO DEL REENVÍO 2FA
# ============================================================

def obtener_estado_reenvio_2fa(request):

    reenvios = int(
        request.session.get(
            "2fa_reenvios",
            0
        )
    )


    # ========================================================
    # MÁXIMO ALCANZADO
    # ========================================================

    if (
        reenvios
        >=
        MAX_REENVIOS_CODIGO_2FA
    ):

        return {
            "puede_reenviar": False,
            "segundos_restantes": 0,
            "reenvios_restantes": 0,
            "limite_alcanzado": True,
        }


    ultimo_envio = (
        request.session.get(
            "2fa_ultimo_envio"
        )
    )


    if not ultimo_envio:

        return {
            "puede_reenviar": True,
            "segundos_restantes": 0,
            "reenvios_restantes":
                MAX_REENVIOS_CODIGO_2FA
                -
                reenvios,
            "limite_alcanzado": False,
        }


    ahora = timezone.now().timestamp()


    transcurrido = (
        ahora
        -
        float(ultimo_envio)
    )


    faltan = max(
        0,
        math.ceil(
            TIEMPO_REENVIO_2FA_SEGUNDOS
            -
            transcurrido
        )
    )


    return {
        "puede_reenviar":
            faltan == 0,

        "segundos_restantes":
            faltan,

        "reenvios_restantes":
            MAX_REENVIOS_CODIGO_2FA
            -
            reenvios,

        "limite_alcanzado":
            False,
    }


# ============================================================
# REENVIAR CÓDIGO 2FA
# ============================================================

def reenviar_codigo_2fa(
    request,
    usuario,
    proposito_esperado="login"
):

    # ========================================================
    # VALIDAR DESAFÍO
    # ========================================================

    usuario_id = request.session.get(
        "2fa_usuario_id"
    )

    proposito = request.session.get(
        "2fa_proposito"
    )


    if (
        usuario_id != usuario.pk
        or
        proposito != proposito_esperado
    ):

        return {
            "ok": False,
            "error":
                "No existe una verificación "
                "válida para reenviar.",
        }


    # ========================================================
    # ESTADO ACTUAL
    # ========================================================

    estado = obtener_estado_reenvio_2fa(
        request
    )


    # ========================================================
    # LÍMITE
    # ========================================================

    if estado["limite_alcanzado"]:

        return {
            "ok": False,
            "error":
                "Alcanzaste el número máximo "
                "de reenvíos permitidos.",
        }


    # ========================================================
    # COOLDOWN
    # ========================================================

    if not estado["puede_reenviar"]:

        segundos = estado[
            "segundos_restantes"
        ]


        return {
            "ok": False,
            "error":
                f"Debes esperar {segundos} "
                "segundos antes de solicitar "
                "otro código.",
        }


    # ========================================================
    # GUARDAR DESAFÍO ANTERIOR
    #
    # Si Gmail falla, podemos restaurarlo.
    # ========================================================

    claves = [

        "2fa_usuario_id",
        "2fa_codigo_hash",
        "2fa_nonce",
        "2fa_expira",
        "2fa_intentos",
        "2fa_proposito",
        "2fa_backend",
        "2fa_reenvios",
        "2fa_ultimo_envio",
        "2fa_forzar_activacion",

    ]


    desafio_anterior = {
        clave: request.session.get(clave)
        for clave in claves
    }


    # ========================================================
    # CREAR NUEVO CÓDIGO
    # ========================================================

    resultado = crear_y_enviar_codigo_2fa(
        request,
        usuario,
        proposito=proposito_esperado,
        conservar_reenvios=True
    )


    # ========================================================
    # SI FALLA EL CORREO
    #
    # Restauramos el código anterior.
    # ========================================================

    if not resultado["ok"]:

        for clave, valor in (
            desafio_anterior.items()
        ):

            if valor is None:

                request.session.pop(
                    clave,
                    None
                )

            else:

                request.session[
                    clave
                ] = valor


        request.session.modified = True


        return resultado


    # ========================================================
    # AUMENTAR CONTADOR
    # ========================================================

    reenvios_actuales = int(
        request.session.get(
            "2fa_reenvios",
            0
        )
    )


    request.session[
        "2fa_reenvios"
    ] = (
        reenvios_actuales
        +
        1
    )


    request.session.modified = True


    restantes = max(
        0,
        MAX_REENVIOS_CODIGO_2FA
        -
        request.session[
            "2fa_reenvios"
        ]
    )


    return {
        "ok": True,
        "error": None,
        "reenvios_restantes":
            restantes,
    }

# ============================================================
# POLÍTICA GLOBAL DE 2FA
# ============================================================

def obtener_politica_2fa(
    usuario
):

    from panel_admin.models import (
        ConfiguracionSeguridad
    )

    from dbmicolmena.models import (
        Administrador
    )


    config, creado = (
        ConfiguracionSeguridad.objects
        .get_or_create(
            pk=1
        )
    )


    # ========================================================
    # 2FA DESHABILITADO GLOBALMENTE
    # ========================================================

    if not config.permitir_2fa:

        return {
            "permitir_2fa": False,
            "obligatorio": False,
            "es_administrador": False,
        }


    # ========================================================
    # VERIFICAR ROL ADMIN
    # ========================================================

    es_administrador = (
        Administrador.objects
        .filter(
            user=usuario
        )
        .exists()
    )


    # ========================================================
    # OBLIGATORIO
    # ========================================================

    obligatorio = False


    if config.obligar_2fa_todos:

        obligatorio = True


    elif (
        config.obligar_2fa_administradores
        and
        es_administrador
    ):

        obligatorio = True


    return {
        "permitir_2fa": True,

        "obligatorio":
            obligatorio,

        "es_administrador":
            es_administrador,
    }





# ============================================================
# CONFIGURACIÓN RECUPERACIÓN PASSWORD
# ============================================================

DURACION_RECUPERACION_MINUTOS = 10

MAX_INTENTOS_RECUPERACION = 5


# ============================================================
# GENERAR CÓDIGO RECUPERACIÓN
# ============================================================

def generar_codigo_recuperacion():

    codigo = (
        secrets.randbelow(
            900000
        )
        +
        100000
    )

    return str(
        codigo
    )


# ============================================================
# GENERAR TOKEN RECUPERACIÓN
# ============================================================

def generar_token_recuperacion():

    return secrets.token_urlsafe(
        32
    )

# ============================================================
# HASH DEL TOKEN
# ============================================================

def generar_hash_token_recuperacion(
    token
):

    return hashlib.sha256(
        token.encode()
    ).hexdigest()


# ============================================================
# HASH DEL CÓDIGO
# ============================================================

def generar_hash_codigo_recuperacion(
    codigo,
    token
):

    valor = (
        f"{token}:{codigo}"
    )


    return (
        salted_hmac(
            "usuarios.recuperacion_password",
            valor,
            algorithm="sha256"
        )
        .hexdigest()
    )


# ============================================================
# CREAR RECUPERACIÓN DE CONTRASEÑA
# ============================================================

def crear_recuperacion_password(
    request,
    usuario
):

    # ========================================================
    # INVALIDAR SOLICITUDES ANTERIORES
    # ========================================================

    RecuperacionPassword.objects.filter(
        usuario=usuario,
        usado=False
    ).update(
        usado=True
    )


    # ========================================================
    # GENERAR CÓDIGO Y TOKEN
    # ========================================================

    codigo = (
        generar_codigo_recuperacion()
    )


    token = (
        generar_token_recuperacion()
    )


    # ========================================================
    # HASHES
    # ========================================================

    token_hash = (
        generar_hash_token_recuperacion(
            token
        )
    )


    codigo_hash = (
        generar_hash_codigo_recuperacion(
            codigo,
            token
        )
    )


    # ========================================================
    # EXPIRACIÓN
    # ========================================================

    expira = (
        timezone.now()
        +
        timedelta(
            minutes=
                DURACION_RECUPERACION_MINUTOS
        )
    )


    # ========================================================
    # GUARDAR SOLICITUD
    # ========================================================

    recuperacion = (
        RecuperacionPassword.objects.create(

            usuario=usuario,

            token_hash=token_hash,

            codigo_hash=codigo_hash,

            expira_en=expira,

            ip_solicitud=
                obtener_ip(
                    request
                ),
        )
    )


    return {
        "recuperacion": recuperacion,
        "codigo": codigo,
        "token": token,
    }


# ============================================================
# ENVIAR CORREO RECUPERACIÓN PASSWORD
# ============================================================

def enviar_correo_recuperacion_password(
    request,
    usuario,
    codigo,
    token
):

    # ========================================================
    # CREAR URL
    # ========================================================

    ruta = reverse(
        "recuperar_password",
        kwargs={
            "token": token
        }
    )


    enlace = (
        request.build_absolute_uri(
            ruta
        )
    )


    # ========================================================
    # DATOS
    # ========================================================

    nombre = (
        usuario.first_name
        or
        usuario.username
    )


    asunto = (
        "Recuperación de contraseña - Mi Colmena"
    )


    mensaje = f"""
Hola {nombre},

Recibimos una solicitud para recuperar la contraseña de tu cuenta de Mi Colmena.

Tu código de recuperación es:

{codigo}

Para crear una nueva contraseña, abre el siguiente enlace:

{enlace}

El código y el enlace tienen una duración de 10 minutos.

Si no solicitaste cambiar tu contraseña, ignora este correo.

Mi Colmena
"""


    # ========================================================
    # ENVIAR
    # ========================================================

    try:

        enviados = send_mail(

            subject=asunto,

            message=mensaje,

            from_email=
                settings.DEFAULT_FROM_EMAIL,

            recipient_list=[
                usuario.email
            ],

            fail_silently=False,
        )


        return enviados == 1


    except Exception as error:

        print(
            "ERROR RECUPERACIÓN PASSWORD:",
            error
        )

        return False


# ============================================================
# OBTENER RECUPERACIÓN MEDIANTE TOKEN
# ============================================================

def obtener_recuperacion_password(
    token
):

    if not token:
        return None


    token_hash = generar_hash_token_recuperacion(
        token
    )


    recuperacion = (
        RecuperacionPassword.objects
        .select_related(
            "usuario"
        )
        .filter(
            token_hash=token_hash,
            usado=False
        )
        .first()
    )


    if not recuperacion:
        return None


    # ========================================================
    # VERIFICAR EXPIRACIÓN
    # ========================================================

    if (
        recuperacion.expira_en
        <=
        timezone.now()
    ):

        recuperacion.usado = True

        recuperacion.fecha_uso = (
            timezone.now()
        )

        recuperacion.save(
            update_fields=[
                "usado",
                "fecha_uso",
            ]
        )

        return None


    return recuperacion


# ============================================================
# VERIFICAR CÓDIGO DE RECUPERACIÓN
# ============================================================

def verificar_codigo_recuperacion(
    recuperacion,
    codigo,
    token
):

    codigo = str(
        codigo
        or
        ""
    ).strip()


    # ========================================================
    # FORMATO
    # ========================================================

    if (
        len(codigo) != 6
        or
        not codigo.isdigit()
    ):

        return {
            "ok": False,
            "error":
                "El código debe contener "
                "exactamente 6 dígitos."
        }


    # ========================================================
    # MÁXIMO DE INTENTOS
    # ========================================================

    if (
        recuperacion.intentos
        >=
        MAX_INTENTOS_RECUPERACION
    ):

        return {
            "ok": False,
            "error":
                "Esta solicitud de recuperación "
                "ya no es válida."
        }


    # ========================================================
    # HASH DEL CÓDIGO INGRESADO
    # ========================================================

    codigo_hash = (
        generar_hash_codigo_recuperacion(
            codigo,
            token
        )
    )


    # ========================================================
    # COMPARACIÓN SEGURA
    # ========================================================

    correcto = secrets.compare_digest(
        codigo_hash,
        recuperacion.codigo_hash
    )


    if correcto:

        return {
            "ok": True,
            "error": None,
        }


    # ========================================================
    # CÓDIGO INCORRECTO
    # ========================================================

    recuperacion.intentos += 1


    campos = [
        "intentos"
    ]


    if (
        recuperacion.intentos
        >=
        MAX_INTENTOS_RECUPERACION
    ):

        recuperacion.usado = True

        recuperacion.fecha_uso = (
            timezone.now()
        )

        campos.extend([
            "usado",
            "fecha_uso",
        ])


    recuperacion.save(
        update_fields=campos
    )


    restantes = max(
        0,
        MAX_INTENTOS_RECUPERACION
        -
        recuperacion.intentos
    )


    if restantes == 0:

        return {
            "ok": False,
            "error":
                "Superaste el número máximo "
                "de intentos. Solicita un "
                "nuevo código."
        }


    return {
        "ok": False,
        "error":
            "El código ingresado es incorrecto. "
            f"Intentos restantes: {restantes}."
    }