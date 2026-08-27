from django.db import models
from django.conf import settings
from django.db import models


class SesionUsuario(models.Model):

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sesiones_usuario"
    )

    session_key = models.CharField(
        max_length=40,
        unique=True,
        db_index=True
    )

    ip = models.GenericIPAddressField(
        null=True,
        blank=True
    )

    navegador = models.CharField(
        max_length=100,
        blank=True
    )

    sistema_operativo = models.CharField(
        max_length=100,
        blank=True
    )

    dispositivo = models.CharField(
        max_length=50,
        blank=True
    )

    user_agent = models.TextField(
        blank=True
    )

    fecha_inicio = models.DateTimeField(
        auto_now_add=True
    )

    ultima_actividad = models.DateTimeField(
        auto_now=True
    )

    activa = models.BooleanField(
        default=True
    )

    fecha_cierre = models.DateTimeField(
        null=True,
        blank=True
    )

    motivo_cierre = models.CharField(
        max_length=50,
        blank=True
    )


    def __str__(self):

        return (
            f"{self.usuario.username} - "
            f"{self.navegador} - "
            f"{self.dispositivo}"
        )


    class Meta:

        ordering = [
            "-ultima_actividad"
        ]

        verbose_name = "Sesión de usuario"

        verbose_name_plural = (
            "Sesiones de usuarios"
        )


class HistorialAcceso(models.Model):

    class TipoActividad(models.TextChoices):

        LOGIN = "login", "Inicio de sesión"

        LOGOUT = "logout", "Cierre de sesión"

        INACTIVIDAD = (
            "inactividad",
            "Cierre por inactividad"
        )

        CAMBIO_PASSWORD = (
            "cambio_password",
            "Cambio de contraseña"
        )

        CIERRE_REMOTO = (
            "cierre_remoto",
            "Cierre remoto de sesión"
        )

        SISTEMA = (
            "sistema",
            "Actividad del sistema"
        )


    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="historial_accesos"
    )


    actividad = models.CharField(
        max_length=30,
        choices=TipoActividad.choices
    )


    ip = models.GenericIPAddressField(
        null=True,
        blank=True
    )


    navegador = models.CharField(
        max_length=100,
        blank=True
    )


    sistema_operativo = models.CharField(
        max_length=100,
        blank=True
    )


    dispositivo = models.CharField(
        max_length=50,
        blank=True
    )


    user_agent = models.TextField(
        blank=True
    )


    detalle = models.CharField(
        max_length=255,
        blank=True
    )


    exitoso = models.BooleanField(
        default=True
    )


    fecha = models.DateTimeField(
        auto_now_add=True
    )


    def __str__(self):

        return (
            f"{self.usuario.username} - "
            f"{self.get_actividad_display()} - "
            f"{self.fecha}"
        )


    class Meta:

        ordering = [
            "-fecha"
        ]

        verbose_name = (
            "Historial de acceso"
        )

        verbose_name_plural = (
            "Historial de accesos"
        )



class ControlIntentosLogin(models.Model):

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="control_intentos_login"
    )

    identificador = models.CharField(
        max_length=150,
        unique=True,
        db_index=True
    )

    intentos_fallidos = models.PositiveIntegerField(
        default=0
    )

    bloqueado_hasta = models.DateTimeField(
        null=True,
        blank=True
    )

    ultimo_intento = models.DateTimeField(
        null=True,
        blank=True
    )

    ultima_ip = models.GenericIPAddressField(
        null=True,
        blank=True
    )


    def __str__(self):

        return (
            f"{self.identificador} - "
            f"{self.intentos_fallidos} intentos"
        )


    class Meta:

        verbose_name = "Control de intentos de login"

        verbose_name_plural = (
            "Control de intentos de login"
        )


class Configuracion2FA(models.Model):

    usuario = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="configuracion_2fa"
    )

    activo = models.BooleanField(
        default=False
    )

    fecha_activacion = models.DateTimeField(
        null=True,
        blank=True
    )

    fecha_actualizacion = models.DateTimeField(
        auto_now=True
    )


    def __str__(self):

        estado = (
            "Activo"
            if self.activo
            else "Inactivo"
        )

        return (
            f"{self.usuario.username} - "
            f"2FA {estado}"
        )


    class Meta:

        verbose_name = (
            "Configuración 2FA"
        )

        verbose_name_plural = (
            "Configuraciones 2FA"
        )



# ============================================================
# RECUPERACIÓN DE CONTRASEÑA
# ============================================================

class RecuperacionPassword(models.Model):

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="recuperaciones_password"
    )

    token_hash = models.CharField(
        max_length=64,
        unique=True,
        db_index=True
    )

    codigo_hash = models.CharField(
        max_length=64
    )

    expira_en = models.DateTimeField()

    intentos = models.PositiveSmallIntegerField(
        default=0
    )

    usado = models.BooleanField(
        default=False
    )

    fecha_creacion = models.DateTimeField(
        auto_now_add=True
    )

    fecha_uso = models.DateTimeField(
        null=True,
        blank=True
    )

    ip_solicitud = models.GenericIPAddressField(
        null=True,
        blank=True
    )


    def __str__(self):

        return (
            f"Recuperación - "
            f"{self.usuario.username}"
        )


    class Meta:

        ordering = [
            "-fecha_creacion"
        ]

        verbose_name = (
            "Recuperación de contraseña"
        )

        verbose_name_plural = (
            "Recuperaciones de contraseña"
        )