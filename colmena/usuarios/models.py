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