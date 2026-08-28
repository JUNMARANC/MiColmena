from django.db import models
from django.contrib.auth.models import User
from django.conf import settings
from django.core.validators import (
    MinValueValidator,
    MaxValueValidator,
)




class ConfiguracionSistema(models.Model):

    nombre_sistema = models.CharField(
        max_length=100,
        default="Mi Colmena"
    )

    nombre_entidad = models.CharField(
        max_length=150,
        blank=True
    )

    descripcion = models.TextField(
        max_length=500,
        blank=True
    )

    correo_contacto = models.EmailField(
        blank=True
    )

    telefono_contacto = models.CharField(
        max_length=20,
        blank=True
    )

    actualizado_en = models.DateTimeField(
        auto_now=True
    )


    def __str__(self):

        return self.nombre_sistema


    class Meta:

        verbose_name = "Configuración del sistema"
        verbose_name_plural = "Configuración del sistema"



# ============================================================
# CONFIGURACIÓN DE NOTIFICACIONES
# ============================================================

class ConfiguracionNotificaciones(models.Model):

    activar_notificaciones = models.BooleanField(
        default=True
    )

    alertas_colmenas_riesgo = models.BooleanField(
        default=True
    )

    alertas_incidencias = models.BooleanField(
        default=True
    )

    alertas_mantenimientos = models.BooleanField(
        default=True
    )

    alertas_agenda = models.BooleanField(
        default=True
    )

    alertas_seguridad = models.BooleanField(
        default=True
    )

    actualizado_en = models.DateTimeField(
        auto_now=True
    )



    def __str__(self):

        return "Configuración de notificaciones"


    class Meta:

        verbose_name = "Configuración de notificaciones"
        verbose_name_plural = "Configuración de notificaciones"



# ============================================================
# NOTIFICACIONES DEL SISTEMA
# ============================================================

class Notificacion(models.Model):

    TIPOS = [

        (
            "incidencia",
            "Incidencia"
        ),

        (
            "mantenimiento",
            "Mantenimiento"
        ),

        (
            "colmena",
            "Colmena"
        ),

        (
            "agenda",
            "Agenda"
        ),

        (
            "seguridad",
            "Seguridad"
        ),

        (
            "sistema",
            "Sistema"
        ),

    ]


    usuario = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notificaciones"
    )


    tipo = models.CharField(
        max_length=30,
        choices=TIPOS,
        default="sistema"
    )


    titulo = models.CharField(
        max_length=150
    )


    mensaje = models.TextField(
        max_length=1000
    )


    url = models.CharField(
        max_length=255,
        blank=True
    )


    # ========================================================
    # REFERENCIA INTERNA
    # EVITA CREAR NOTIFICACIONES DUPLICADAS
    # ========================================================

    referencia = models.CharField(
        max_length=180,
        blank=True,
        default="",
        db_index=True
    )


    leida = models.BooleanField(
        default=False
    )


    fecha_creacion = models.DateTimeField(
        auto_now_add=True
    )


    fecha_lectura = models.DateTimeField(
        blank=True,
        null=True
    )


    def __str__(self):

        return self.titulo


    class Meta:

        ordering = [
            "-fecha_creacion"
        ]

        verbose_name = "Notificación"
        verbose_name_plural = "Notificaciones"





class ConfiguracionSeguridad(models.Model):

    # ========================================================
    # CIERRE POR INACTIVIDAD
    # ========================================================

    cerrar_sesion_inactividad = models.BooleanField(
        default=True
    )

    minutos_inactividad = models.PositiveSmallIntegerField(
        default=30,
        validators=[
            MinValueValidator(5),
            MaxValueValidator(480),
        ]
    )


    # ========================================================
    # HISTORIAL DE ACCESOS
    # ========================================================

    registrar_historial_accesos = models.BooleanField(
        default=True
    )


    # ========================================================
    # BLOQUEO POR INTENTOS FALLIDOS
    # ========================================================

    bloquear_intentos_fallidos = models.BooleanField(
        default=True
    )

    intentos_maximos_login = models.PositiveSmallIntegerField(
        default=5,
        validators=[
            MinValueValidator(3),
            MaxValueValidator(10),
        ]
    )

    minutos_bloqueo_login = models.PositiveSmallIntegerField(
        default=15,
        validators=[
            MinValueValidator(5),
            MaxValueValidator(1440),
        ]
    )


    # ========================================================
    # AUTENTICACIÓN EN DOS PASOS
    # ========================================================

    permitir_2fa = models.BooleanField(
        default=True
    )

    obligar_2fa_administradores = models.BooleanField(
        default=False
    )

    obligar_2fa_todos = models.BooleanField(
        default=False
    )


    # ========================================================
    # ACTUALIZACIÓN
    # ========================================================

    actualizado_en = models.DateTimeField(
        auto_now=True
    )


    def __str__(self):

        return (
            "Configuración de seguridad"
        )


    class Meta:

        verbose_name = (
            "Configuración de seguridad"
        )

        verbose_name_plural = (
            "Configuración de seguridad"
        )