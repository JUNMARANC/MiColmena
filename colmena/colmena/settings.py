"""
Django settings for colmena project.

Proyecto:
Mi Colmena

Django:
6.0.x
"""

# ============================================================
# IMPORTACIONES
# ============================================================

from pathlib import Path
import os

from dotenv import load_dotenv
from django.core.exceptions import ImproperlyConfigured


# ============================================================
# RUTAS DEL PROYECTO
# ============================================================

# C:\Users\VICTUS\Desktop\MiColmena\colmena
BASE_DIR = Path(__file__).resolve().parent.parent

# C:\Users\VICTUS\Desktop\MiColmena
PROJECT_ROOT = BASE_DIR.parent


# ============================================================
# CARGAR VARIABLES DE ENTORNO
# ============================================================

ENV_FILE = PROJECT_ROOT / ".env"

load_dotenv(ENV_FILE)


# ============================================================
# FUNCIONES AUXILIARES PARA VARIABLES DE ENTORNO
# ============================================================

def required_env(name):
    """
    Obtiene una variable de entorno obligatoria.

    Si no existe o está vacía, Django no inicia.
    """

    value = os.environ.get(name)

    if value is None or not value.strip():

        raise ImproperlyConfigured(
            f"Configure {name} en el entorno o en el archivo .env"
        )

    return value.strip()


def env_bool(name, default=False):
    """
    Convierte una variable de entorno a booleano.

    Valores considerados True:
    1, true, yes, on
    """

    value = os.environ.get(
        name,
        str(default)
    )

    return value.strip().lower() in {
        "1",
        "true",
        "yes",
        "on",
    }


def env_list(name, default=""):
    """
    Convierte:

    valor1,valor2,valor3

    en:

    ["valor1", "valor2", "valor3"]
    """

    value = os.environ.get(
        name,
        default
    )

    return [
        item.strip()
        for item in value.split(",")
        if item.strip()
    ]


# ============================================================
# CONFIGURACIÓN GENERAL
# ============================================================

DEBUG = env_bool(
    "MICOLMENA_DEBUG",
    False
)


# ============================================================
# SECRET KEY
# ============================================================

SECRET_KEY = required_env(
    "MICOLMENA_SECRET_KEY"
)


# ============================================================
# URL PRINCIPAL DEL SITIO
# ============================================================

SITE_URL = os.environ.get(
    "MICOLMENA_SITE_URL",
    "http://127.0.0.1:8000"
).rstrip("/")


# ============================================================
# HOSTS PERMITIDOS
# ============================================================

ALLOWED_HOSTS = env_list(
    "MICOLMENA_ALLOWED_HOSTS",
    "127.0.0.1,localhost"
)


# ============================================================
# ORÍGENES CSRF
# ============================================================

CSRF_TRUSTED_ORIGINS = env_list(
    "MICOLMENA_CSRF_TRUSTED_ORIGINS",
    ""
)


# ============================================================
# WEASYPRINT - WINDOWS
# ============================================================

WEASYPRINT_DLL_HANDLE = None


if os.name == "nt":

    ruta_dll_weasyprint = Path(
        r"C:\msys64\ucrt64\bin"
    )

    if ruta_dll_weasyprint.exists():

        WEASYPRINT_DLL_HANDLE = (
            os.add_dll_directory(
                str(
                    ruta_dll_weasyprint
                )
            )
        )


# ============================================================
# APLICACIONES
# ============================================================

INSTALLED_APPS = [

    # Django
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Mi Colmena
    "home",
    "panel_admin",
    "dbmicolmena",
    "usuarios",
    "panel_apicultor",
]


# ============================================================
# MIDDLEWARE
# ============================================================

MIDDLEWARE = [

    "django.middleware.security.SecurityMiddleware",

    "django.contrib.sessions.middleware.SessionMiddleware",

    "django.middleware.common.CommonMiddleware",

    "django.middleware.csrf.CsrfViewMiddleware",

    "django.contrib.auth.middleware.AuthenticationMiddleware",

    "django.contrib.messages.middleware.MessageMiddleware",

    # Cierre por inactividad
    "usuarios.middleware.InactividadSesionMiddleware",

    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


# ============================================================
# URLS
# ============================================================

ROOT_URLCONF = "colmena.urls"


# ============================================================
# TEMPLATES
# ============================================================

TEMPLATES = [

    {

        "BACKEND":
            "django.template.backends.django.DjangoTemplates",

        "DIRS": [],

        "APP_DIRS": True,

        "OPTIONS": {

            "context_processors": [

                "django.template.context_processors.request",

                "django.contrib.auth.context_processors.auth",

                "django.contrib.messages.context_processors.messages",

                # Perfil actual
                "usuarios.context_processors.perfil_usuario",

                # Permisos administrativos
                "panel_admin.context_processors.permisos_usuario",
            ],

        },

    },

]


# ============================================================
# WSGI
# ============================================================

WSGI_APPLICATION = "colmena.wsgi.application"


# ============================================================
# BASE DE DATOS
# MYSQL
# ============================================================

DATABASES = {

    "default": {

        "ENGINE":
            "django.db.backends.mysql",

        "NAME":
            os.environ.get(
                "MICOLMENA_DB_NAME",
                "dbmicolmena"
            ),

        "USER":
            required_env(
                "MICOLMENA_DB_USER"
            ),

        "PASSWORD":
            required_env(
                "MICOLMENA_DB_PASSWORD"
            ),

        "HOST":
            os.environ.get(
                "MICOLMENA_DB_HOST",
                "localhost"
            ),

        "PORT":
            os.environ.get(
                "MICOLMENA_DB_PORT",
                "3306"
            ),

    }

}


# ============================================================
# VALIDACIÓN DE CONTRASEÑAS
# ============================================================

AUTH_PASSWORD_VALIDATORS = [

    {
        "NAME":
            "django.contrib.auth.password_validation."
            "UserAttributeSimilarityValidator",
    },

    {
        "NAME":
            "django.contrib.auth.password_validation."
            "MinimumLengthValidator",
    },

    {
        "NAME":
            "django.contrib.auth.password_validation."
            "CommonPasswordValidator",
    },

    {
        "NAME":
            "django.contrib.auth.password_validation."
            "NumericPasswordValidator",
    },

]


# ============================================================
# INTERNACIONALIZACIÓN
# ============================================================

LANGUAGE_CODE = "es-co"

TIME_ZONE = "America/Bogota"

USE_I18N = True

USE_TZ = True


# ============================================================
# ARCHIVOS ESTÁTICOS
# ============================================================

STATIC_URL = "/static/"

STATIC_ROOT = BASE_DIR / "staticfiles"


# ============================================================
# ARCHIVOS MEDIA
# ============================================================

MEDIA_URL = "/media/"

MEDIA_ROOT = BASE_DIR / "media"


# ============================================================
# CONFIGURACIÓN DE CORREO
# ============================================================
#
# MICOLMENA_EMAIL_MODE puede ser:
#
# console
# smtp
#
# console:
#   El correo aparece en la terminal.
#
# smtp:
#   El correo se envía realmente mediante Gmail.
#
# IMPORTANTE:
# DEBUG ya NO controla el sistema de correo.
# ============================================================

EMAIL_MODE = os.environ.get(
    "MICOLMENA_EMAIL_MODE",
    "console"
).strip().lower()


# ============================================================
# VALIDAR MODO DE CORREO
# ============================================================

if EMAIL_MODE not in {
    "console",
    "smtp",
}:

    raise ImproperlyConfigured(
        (
            "MICOLMENA_EMAIL_MODE debe ser "
            "'console' o 'smtp'."
        )
    )


# ============================================================
# SMTP
# CORREOS REALES
# ============================================================

if EMAIL_MODE == "smtp":

    EMAIL_BACKEND = (
        "django.core.mail.backends.smtp.EmailBackend"
    )

    EMAIL_HOST = "smtp.gmail.com"

    EMAIL_PORT = 587

    EMAIL_USE_TLS = True

    EMAIL_USE_SSL = False

    EMAIL_HOST_USER = required_env(
        "MICOLMENA_EMAIL_USER"
    )

    EMAIL_HOST_PASSWORD = required_env(
        "MICOLMENA_EMAIL_PASSWORD"
    )

    DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

    SERVER_EMAIL = EMAIL_HOST_USER

    EMAIL_TIMEOUT = 10


# ============================================================
# CONSOLA
# DESARROLLO SIN CORREOS REALES
# ============================================================

else:

    EMAIL_BACKEND = (
        "django.core.mail.backends.console.EmailBackend"
    )

    EMAIL_HOST_USER = os.environ.get(
        "MICOLMENA_EMAIL_USER",
        ""
    )

    EMAIL_HOST_PASSWORD = ""

    DEFAULT_FROM_EMAIL = (
        EMAIL_HOST_USER
        or
        "micolmena@localhost"
    )

    SERVER_EMAIL = DEFAULT_FROM_EMAIL

    EMAIL_TIMEOUT = 10


# ============================================================
# AUTENTICACIÓN
# ============================================================

LOGIN_URL = "login"

LOGIN_REDIRECT_URL = "dashboard_admin"

LOGOUT_REDIRECT_URL = "login"


# ============================================================
# AUTENTICACIÓN EN DOS PASOS
# ============================================================
#
# Esta configuración se conserva temporalmente porque existe
# código histórico de cifrado Fernet en usuarios/services.py.
#
# Después podemos eliminarla si confirmamos que:
#
# 0005_remove_configuracion2fa_secreto
#
# está aplicada y las funciones antiguas ya no son utilizadas.
# ============================================================

TWO_FA_ENCRYPTION_KEY = required_env(
    "MICOLMENA_TWO_FA_ENCRYPTION_KEY"
)


# ============================================================
# SESIONES
# ============================================================

SESSION_ENGINE = (
    "django.contrib.sessions.backends.db"
)


# Cerrar sesión cuando se cierre el navegador
SESSION_EXPIRE_AT_BROWSER_CLOSE = True


# 12 horas
SESSION_COOKIE_AGE = 60 * 60 * 12


# Actualizar expiración en cada petición
SESSION_SAVE_EVERY_REQUEST = True


# ============================================================
# SEGURIDAD DE COOKIES
# ============================================================
#
# En local:
#
# DEBUG=True
# COOKIE_SECURE=False
#
# En producción:
#
# DEBUG=False
# COOKIE_SECURE=True
# ============================================================

SESSION_COOKIE_HTTPONLY = True

CSRF_COOKIE_HTTPONLY = False

SESSION_COOKIE_SAMESITE = "Lax"

CSRF_COOKIE_SAMESITE = "Lax"

SESSION_COOKIE_SECURE = not DEBUG

CSRF_COOKIE_SECURE = not DEBUG


# ============================================================
# SEGURIDAD DEL NAVEGADOR
# ============================================================

X_FRAME_OPTIONS = "DENY"

SECURE_CONTENT_TYPE_NOSNIFF = True


# ============================================================
# HTTPS
# ============================================================
#
# No forzamos HTTPS automáticamente desde settings durante
# desarrollo porque utilizas localhost y en ocasiones ngrok.
#
# Cuando hagamos despliegue configuraremos:
#
# SECURE_SSL_REDIRECT
# SECURE_HSTS_SECONDS
# SECURE_HSTS_INCLUDE_SUBDOMAINS
# SECURE_HSTS_PRELOAD
#
# según el servidor utilizado.
# ============================================================


# ============================================================
# PRIMARY KEY POR DEFECTO
# ============================================================

DEFAULT_AUTO_FIELD = (
    "django.db.models.BigAutoField"
)