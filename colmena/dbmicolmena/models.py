from django.db import models
from django.conf import settings
from django.contrib.auth.models import User
from calendar import monthrange
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator

class Rol(models.Model):
    id_rol = models.AutoField(db_column='Id_Rol', primary_key=True)  # Field name made lowercase.
    nombrerol = models.CharField(db_column='NombreRol', max_length=50)  # Field name made lowercase.
    descripcion = models.CharField(db_column='Descripcion', max_length=255, blank=True, null=True)  # Field name made lowercase.
    nivelacceso = models.CharField(db_column='NivelAcceso', max_length=50, blank=True, null=True)  # Field name made lowercase.
    permisos = models.CharField(db_column='Permisos', max_length=255, blank=True, null=True)  # Field name made lowercase.
    estadoactivo = models.IntegerField(db_column='EstadoActivo', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'rol'

class Administrador(models.Model):

    id_administrador = models.AutoField(db_column='Id_Administrador',primary_key=True)
    user = models.OneToOneField(User,models.CASCADE,db_column='user_id',blank=True,null=True)
    id_rol = models.ForeignKey(Rol,models.DO_NOTHING,db_column='Id_Rol',blank=True,null=True)
    celular = models.CharField(db_column='Celular',max_length=20,blank=True,null=True)
    fecharegistro = models.DateField(db_column='FechaRegistro',blank=True,null=True)
    nivelacceso = models.CharField(db_column='NivelAcceso',max_length=50,blank=True,null=True)
    fotoperfil = models.ImageField(db_column='FotoPerfil',upload_to='usuarios/administradores/',blank=True,null=True)

    class Meta:
        managed = False
        db_table = "administrador"
    
    def nombre_completo(self):
        if self.user:
            return f"{self.user.first_name} {self.user.last_name}".strip()
        return "Sin nombre"

    def correo(self):
        if self.user:
            return self.user.email
        return "Sin correo"

    def __str__(self):
        return self.nombre_completo()

class Apiario(models.Model):
    id_apiario = models.AutoField(db_column='Id_Apiario', primary_key=True)  # Field name made lowercase.
    id_apicultor = models.ForeignKey('Apicultor',models.DO_NOTHING,db_column='Id_Apicultor',related_name='apiarios')  # Field name made lowercase.
    nombreapiario = models.CharField(db_column='NombreApiario', max_length=100, blank=True, null=True)  # Field name made lowercase.
    cantidadcolmenas = models.IntegerField(db_column='CantidadColmenas', blank=True, null=True)  # Field name made lowercase.
    estadoapiario = models.CharField(db_column='EstadoApiario', max_length=50, blank=True, null=True)  # Field name made lowercase.
    fechaeclosionapiario = models.DateField(db_column='FechaEclosionApiario', blank=True, null=True)  # Field name made lowercase.
    ubicacion = models.CharField(db_column='Ubicacion', max_length=150, blank=True, null=True)  # Field name made lowercase.
    descripcion = models.TextField(db_column='Descripcion', blank=True, null=True)
    imagen = models.ImageField(db_column='Imagen', upload_to='apiarios/', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'apiario'


class Apicultor(models.Model):
    id_apicultor = models.AutoField(db_column='Id_Apicultor',primary_key=True)
    user = models.OneToOneField(User,models.CASCADE,db_column='user_id',blank=True,null=True)
    id_rol = models.ForeignKey('Rol',models.DO_NOTHING,db_column='Id_Rol',blank=True,null=True)
    identificacion = models.CharField(db_column="Identificacion",max_length=30,unique=True)
    telefono = models.CharField(db_column='Telefono',max_length=20,blank=True,null=True)
    zona_trabajo = models.CharField(db_column='Zona_Trabajo',max_length=100,blank=True,null=True)
    experienciaanios = models.IntegerField(db_column='ExperienciaAnios',blank=True,null=True)
    fotoperfil = models.ImageField(db_column='FotoPerfil',upload_to='usuarios/apicultores/',blank=True,null=True)

    class Meta:
        managed = False
        db_table = 'apicultor'

    def correo(self):
        if self.user:
            return self.user.email
        return "Sin correo"

    def __str__(self):
        return self.nombre_completo()
    
    def nombre_completo(self):
        if self.user:
            nombre = f"{self.user.first_name} {self.user.last_name}".strip()

            if nombre:
                return nombre

            return self.user.username

        return "Sin nombre"

class Colmena(models.Model):
    id_colmena = models.AutoField(db_column='Id_Colmena', primary_key=True)  # Field name made lowercase.
    id_apiario = models.ForeignKey(Apiario, models.DO_NOTHING, db_column='Id_Apiario')  # Field name made lowercase.
    codigocolmena = models.CharField(db_column='CodigoColmena', max_length=50, blank=True, null=True)  # Field name made lowercase.
    estadocolmena = models.CharField(db_column='EstadoColmena', max_length=50, blank=True, null=True)  # Field name made lowercase.
    fecharegistro = models.DateField(db_column='FechaRegistro', blank=True, null=True)  # Field name made lowercase.
    descripcion = models.TextField(db_column='Descripcion', blank=True, null=True)
    imagen = models.ImageField(db_column='Imagen', upload_to='colmenas/', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'colmena'


class Exportacion(models.Model):
    id_exportacion = models.AutoField(db_column='Id_Exportacion', primary_key=True)  # Field name made lowercase.
    id_administrador = models.ForeignKey(Administrador, models.DO_NOTHING, db_column='Id_Administrador')  # Field name made lowercase.
    tipoexportacion = models.CharField(db_column='TipoExportacion', max_length=100, blank=True, null=True)  # Field name made lowercase.
    fechaexportacion = models.DateField(db_column='FechaExportacion', blank=True, null=True)  # Field name made lowercase.
    formato = models.CharField(db_column='Formato', max_length=50, blank=True, null=True)  # Field name made lowercase.
    archivogenerado = models.CharField(db_column='ArchivoGenerado', max_length=255, blank=True, null=True)  # Field name made lowercase.
    estado = models.CharField(db_column='Estado', max_length=50, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'exportacion'


class Incidencia(models.Model):

    id_incidencia = models.AutoField(db_column='Id_Incidencia',primary_key=True)
    id_apicultor = models.ForeignKey(Apicultor,models.DO_NOTHING,db_column='Id_Apicultor',blank=True,null=True)
    id_apiario = models.ForeignKey(Apiario,models.DO_NOTHING,db_column='Id_Apiario',blank=True,null=True)
    id_colmena = models.ForeignKey(Colmena,models.DO_NOTHING,db_column='Id_Colmena',blank=True,null=True)
    entidadincidencia = models.CharField(db_column='EntidadIncidencia',max_length=30)
    titulo = models.CharField(db_column='Titulo',max_length=100)
    prioridad = models.CharField(db_column='Prioridad',max_length=50)
    fechadeteccion = models.DateField(db_column='FechaDeteccion')
    estado = models.CharField(db_column='Estado',max_length=50)
    observaciones = models.CharField(db_column='Observaciones',max_length=255,blank=True,null=True)
    imagen = models.ImageField(db_column='Imagen',upload_to='incidencias/',blank=True,null=True)
    responsable = models.CharField(db_column='Responsable',max_length=150,blank=True,null=True)

    class Meta:
        managed = False
        db_table = 'incidencia'

class Mantenimiento(models.Model):
    id_mantenimiento = models.AutoField(db_column='Id_Mantenimiento', primary_key=True)
    id_colmena = models.ForeignKey(Colmena,models.DO_NOTHING,db_column='Id_Colmena',blank=True,null=True)
    id_apiario = models.ForeignKey(Apiario,models.DO_NOTHING,db_column='Id_Apiario',blank=True,null=True)
    entidadmantenimiento = models.CharField(db_column='EntidadMantenimiento',max_length=50,blank=True,null=True)
    tipo = models.CharField(db_column='Tipo', max_length=100, blank=True, null=True)
    fechaejecucion = models.DateField(db_column='FechaEjecucion', blank=True, null=True)
    estado = models.CharField(db_column='Estado', max_length=50, blank=True, null=True)
    prioridad = models.CharField(db_column='Prioridad', max_length=50, blank=True, null=True)
    observaciones = models.CharField(db_column='Observaciones', max_length=255, blank=True, null=True)
    responsable = models.CharField(db_column='Responsable', max_length=100, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'mantenimiento'


class Reporte(models.Model):
    id_reporte = models.AutoField(db_column='Id_Reporte', primary_key=True)  # Field name made lowercase.
    id_apicultor = models.ForeignKey(Apicultor, models.DO_NOTHING, db_column='Id_Apicultor')  # Field name made lowercase.
    fechageneracion = models.DateField(db_column='FechaGeneracion', blank=True, null=True)  # Field name made lowercase.
    tiporeporte = models.CharField(db_column='TipoReporte', max_length=100, blank=True, null=True)  # Field name made lowercase.
    contenido = models.CharField(db_column='Contenido', max_length=255, blank=True, null=True)  # Field name made lowercase.
    formato = models.CharField(db_column='Formato', max_length=50, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'reporte'

class Seguimientoapicola(models.Model):
    id_seguimiento = models.AutoField(db_column='Id_Seguimiento', primary_key=True)  # Field name made lowercase.
    entidadseguida = models.CharField(db_column='EntidadSeguida', max_length=50, blank=True, null=True)  # Field name made lowercase.
    id_apicultor = models.ForeignKey(Apicultor, models.DO_NOTHING, db_column='Id_Apicultor', blank=True, null=True)  # Field name made lowercase.
    id_apiario = models.ForeignKey(Apiario, models.DO_NOTHING, db_column='Id_Apiario', blank=True, null=True)  # Field name made lowercase.
    id_colmena = models.ForeignKey(Colmena, models.DO_NOTHING, db_column='Id_Colmena', blank=True, null=True)  # Field name made lowercase.
    fecharegistro = models.DateField(db_column='FechaRegistro', blank=True, null=True)  # Field name made lowercase.
    tiposeguimiento = models.CharField(db_column='TipoSeguimiento', max_length=100, blank=True, null=True)  # Field name made lowercase.
    descripcion = models.CharField(db_column='Descripcion', max_length=255, blank=True, null=True)  # Field name made lowercase.
    responsable = models.CharField(db_column='Responsable', max_length=100, blank=True, null=True)  # Field name made lowercase.
    estado = models.CharField(db_column='Estado', max_length=50, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'seguimientoapicola'


class VinculacionApicultor(models.Model):

    id_vinculacion = models.AutoField(
        db_column="Id_Vinculacion",
        primary_key=True
    )

    apicultor = models.OneToOneField(
        "Apicultor",
        on_delete=models.CASCADE,
        db_column="Id_Apicultor",
        related_name="vinculacion_laboral"
    )

    fecha_ingreso = models.DateField(
        db_column="FechaIngreso"
    )

    lunes = models.BooleanField(
        db_column="Lunes",
        default=False
    )

    martes = models.BooleanField(
        db_column="Martes",
        default=False
    )

    miercoles = models.BooleanField(
        db_column="Miercoles",
        default=False
    )

    jueves = models.BooleanField(
        db_column="Jueves",
        default=False
    )

    viernes = models.BooleanField(
        db_column="Viernes",
        default=False
    )

    sabado = models.BooleanField(
        db_column="Sabado",
        default=False
    )

    domingo = models.BooleanField(
        db_column="Domingo",
        default=False
    )

    fecha_actualizacion = models.DateTimeField(
        db_column="FechaActualizacion",
        auto_now=True
    )

    class Meta:
        db_table = "vinculacion_apicultor"
        verbose_name = "Vinculación del apicultor"
        verbose_name_plural = "Vinculaciones de apicultores"

    def __str__(self):
        return f"Vinculación de {self.apicultor.nombre_completo()}"

    def dias_semana_lista(self):

        dias = [
            ("lunes", "Lunes"),
            ("martes", "Martes"),
            ("miercoles", "Miércoles"),
            ("jueves", "Jueves"),
            ("viernes", "Viernes"),
            ("sabado", "Sábado"),
            ("domingo", "Domingo"),
        ]

        return [
            nombre
            for campo, nombre in dias
            if getattr(self, campo)
        ]

    def dias_semana_texto(self):

        dias = self.dias_semana_lista()

        if not dias:
            return "Sin días registrados"

        if len(dias) == 1:
            return dias[0]

        return ", ".join(dias[:-1]) + " y " + dias[-1]

class RegistroLaboralMensual(models.Model):

    id_registro_laboral = models.AutoField(
        db_column="Id_RegistroLaboral",
        primary_key=True
    )

    apicultor = models.ForeignKey(
        "Apicultor",
        on_delete=models.CASCADE,
        db_column="Id_Apicultor",
        related_name="registros_laborales"
    )

    mes_reporte = models.DateField(
        db_column="MesReporte",
        help_text="Se almacenará el primer día del mes."
    )

    dias_trabajados_mes = models.PositiveSmallIntegerField(
        db_column="DiasTrabajadosMes",
        default=0,
        validators=[
            MaxValueValidator(31)
        ]
    )

    horas_trabajadas_mes = models.DecimalField(
        db_column="HorasTrabajadasMes",
        max_digits=7,
        decimal_places=2,
        default=0
    )

    observaciones = models.TextField(
        db_column="Observaciones",
        blank=True
    )

    fecha_registro = models.DateTimeField(
        db_column="FechaRegistro",
        auto_now_add=True
    )

    fecha_actualizacion = models.DateTimeField(
        db_column="FechaActualizacion",
        auto_now=True
    )

    class Meta:
        db_table = "registro_laboral_mensual"

        ordering = [
            "-mes_reporte"
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "apicultor",
                    "mes_reporte"
                ],
                name="uq_apicultor_mes_laboral"
            )
        ]

        verbose_name = "Registro laboral mensual"
        verbose_name_plural = "Registros laborales mensuales"

    def __str__(self):

        return (
            f"{self.apicultor.nombre_completo()} - "
            f"{self.mes_reporte:%m/%Y}"
        )

    def clean(self):

        super().clean()

        if not self.mes_reporte:
            return

        ultimo_dia_mes = monthrange(
            self.mes_reporte.year,
            self.mes_reporte.month
        )[1]

        if self.dias_trabajados_mes > ultimo_dia_mes:

            raise ValidationError({
                "dias_trabajados_mes": (
                    f"El mes seleccionado solamente tiene "
                    f"{ultimo_dia_mes} días."
                )
            })

        horas_maximas = self.dias_trabajados_mes * 24

        if self.horas_trabajadas_mes > horas_maximas:

            raise ValidationError({
                "horas_trabajadas_mes": (
                    "Las horas trabajadas no pueden superar "
                    "24 horas por cada día trabajado."
                )
            })

    def save(self, *args, **kwargs):

        if self.mes_reporte:

            self.mes_reporte = (
                self.mes_reporte.replace(day=1)
            )

        self.full_clean()

        super().save(*args, **kwargs)


class EventoAgenda(models.Model):

    class TipoEvento(models.TextChoices):
        MANTENIMIENTO = "mantenimiento", "Mantenimiento"
        REVISION = "revision", "Revisión"
        INCIDENCIA = "incidencia", "Incidencia"
        EVENTO = "evento", "Evento general"

    class EstadoEvento(models.TextChoices):
        PROGRAMADO = "programado", "Programado"
        COMPLETADO = "completado", "Completado"
        CANCELADO = "cancelado", "Cancelado"

    id_evento = models.AutoField(
        db_column="Id_Evento",
        primary_key=True
    )

    titulo = models.CharField(
        db_column="Titulo",
        max_length=150
    )

    tipo_evento = models.CharField(
        db_column="TipoEvento",
        max_length=20,
        choices=TipoEvento.choices,
        default=TipoEvento.EVENTO
    )

    id_apiario = models.ForeignKey(
        "Apiario",
        on_delete=models.PROTECT,
        db_column="Id_Apiario",
        related_name="eventos_agenda"
    )

    id_colmena = models.ForeignKey(
        "Colmena",
        on_delete=models.PROTECT,
        db_column="Id_Colmena",
        related_name="eventos_agenda",
        null=True,
        blank=True
    )

    responsable = models.ForeignKey(
        "Apicultor",
        on_delete=models.PROTECT,
        db_column="Id_Responsable",
        related_name="eventos_asignados",
        null=True,
        blank=True
    )

    fecha = models.DateField(
        db_column="Fecha"
    )

    hora = models.TimeField(
        db_column="Hora"
    )

    descripcion = models.TextField(
        db_column="Descripcion",
        max_length=500,
        blank=True
    )

    estado = models.CharField(
        db_column="Estado",
        max_length=20,
        choices=EstadoEvento.choices,
        default=EstadoEvento.PROGRAMADO
    )

    creado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        db_column="CreadoPor",
        related_name="eventos_agenda_creados",
        null=True,
        blank=True
    )

    fecha_creacion = models.DateTimeField(
        db_column="FechaCreacion",
        auto_now_add=True
    )

    fecha_actualizacion = models.DateTimeField(
        db_column="FechaActualizacion",
        auto_now=True
    )

    class Meta:
        db_table = "evento_agenda"
        ordering = ["fecha", "hora"]
        verbose_name = "Evento de agenda"
        verbose_name_plural = "Eventos de agenda"

    def __str__(self):
        return f"{self.titulo} - {self.fecha:%d/%m/%Y}"

    def clean(self):

        super().clean()

        if (
            self.id_colmena_id
            and self.id_apiario_id
            and self.id_colmena.id_apiario_id != self.id_apiario_id
        ):
            raise ValidationError({
                "id_colmena": (
                    "La colmena seleccionada no pertenece "
                    "al apiario indicado."
                )
            })

    def save(self, *args, **kwargs):

        self.full_clean()

        super().save(*args, **kwargs)


class HistorialReporte(models.Model):

    class TipoReporte(models.TextChoices):
        ESTADO_COLMENAS = (
            "estado_colmenas",
            "Estado de colmenas"
        )

        INCIDENCIAS = (
            "incidencias",
            "Incidencias"
        )

        MANTENIMIENTOS = (
            "mantenimientos",
            "Mantenimientos"
        )

        ACTIVIDAD_APICULTORES = (
            "actividad_apicultores",
            "Actividad de apicultores"
        )

        ACTIVIDAD_MENSUAL = (
            "actividad_mensual",
            "Actividad mensual"
        )

        COMPARATIVO = (
            "comparativo",
            "Reporte comparativo"
        )

    class FormatoReporte(models.TextChoices):
        PDF = "pdf", "PDF"
        EXCEL = "xlsx", "Excel"

    id_reporte = models.AutoField(
        db_column="Id_Reporte",
        primary_key=True
    )

    usuario = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        db_column="UsuarioId",
        null=True,
        blank=True,
        related_name="reportes_generados"
    )

    tipo_reporte = models.CharField(
        db_column="TipoReporte",
        max_length=50,
        choices=TipoReporte.choices
    )

    titulo = models.CharField(
        db_column="Titulo",
        max_length=150
    )

    formato = models.CharField(
        db_column="Formato",
        max_length=10,
        choices=FormatoReporte.choices,
        default=FormatoReporte.PDF
    )

    fecha_desde = models.DateField(
        db_column="FechaDesde",
        null=True,
        blank=True
    )

    fecha_hasta = models.DateField(
        db_column="FechaHasta",
        null=True,
        blank=True
    )

    filtros_aplicados = models.TextField(
        db_column="FiltrosAplicados",
        blank=True
    )

    total_registros = models.PositiveIntegerField(
        db_column="TotalRegistros",
        default=0
    )

    nombre_archivo = models.CharField(
        db_column="NombreArchivo",
        max_length=255
    )

    archivo = models.FileField(
        db_column="Archivo",
        upload_to="reportes/%Y/%m/"
    )

    tamano_bytes = models.PositiveBigIntegerField(
        db_column="TamanoBytes",
        default=0
    )

    fecha_generacion = models.DateTimeField(
        db_column="FechaGeneracion",
        auto_now_add=True
    )

    class Meta:
        db_table = "historial_reporte"
        ordering = ["-fecha_generacion"]
        verbose_name = "Historial de reporte"
        verbose_name_plural = "Historial de reportes"

    def __str__(self):

        return (
            f"{self.get_tipo_reporte_display()} - "
            f"{self.fecha_generacion:%d/%m/%Y}"
        )

    @property
    def tamano_legible(self):

        tamano = self.tamano_bytes

        if tamano < 1024:
            return f"{tamano} B"

        if tamano < 1024 * 1024:
            return f"{tamano / 1024:.1f} KB"

        return f"{tamano / (1024 * 1024):.1f} MB"