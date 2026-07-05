from django.db import models


class Administrador(models.Model):
    id_administrador = models.AutoField(db_column='Id_Administrador', primary_key=True)  # Field name made lowercase.
    id_rol = models.ForeignKey('Rol', models.DO_NOTHING, db_column='Id_Rol', blank=True, null=True)  # Field name made lowercase.
    nombre = models.CharField(db_column='Nombre', max_length=100)  # Field name made lowercase.
    email = models.CharField(db_column='Email', max_length=100)  # Field name made lowercase.
    celular = models.CharField(db_column='Celular', max_length=20, blank=True, null=True)  # Field name made lowercase.
    fecharegistro = models.DateField(db_column='FechaRegistro', blank=True, null=True)  # Field name made lowercase.
    nivelacceso = models.CharField(db_column='NivelAcceso', max_length=50, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'administrador'


class Apiario(models.Model):
    id_apiario = models.AutoField(db_column='Id_Apiario', primary_key=True)  # Field name made lowercase.
    id_apicultor = models.ForeignKey('Apicultor', models.DO_NOTHING, db_column='Id_Apicultor')  # Field name made lowercase.
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
    id_apicultor = models.AutoField(db_column='Id_Apicultor', primary_key=True)  # Field name made lowercase.
    id_rol = models.ForeignKey('Rol', models.DO_NOTHING, db_column='Id_Rol', blank=True, null=True)  # Field name made lowercase.
    nombre = models.CharField(db_column='Nombre', max_length=100)  # Field name made lowercase.
    telefono = models.CharField(db_column='Telefono', max_length=20, blank=True, null=True)  # Field name made lowercase.
    email = models.CharField(db_column='Email', max_length=100)  # Field name made lowercase.
    zona_trabajo = models.CharField(db_column='Zona_Trabajo', max_length=100, blank=True, null=True)  # Field name made lowercase.
    experienciaanios = models.IntegerField(db_column='ExperienciaAnios', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'apicultor'


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


class Costos(models.Model):
    id_costo = models.AutoField(db_column='Id_Costo', primary_key=True)  # Field name made lowercase.
    id_mantenimiento = models.ForeignKey('Mantenimiento', models.DO_NOTHING, db_column='Id_Mantenimiento')  # Field name made lowercase.
    costoestimado = models.DecimalField(db_column='CostoEstimado', max_digits=10, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    costoreal = models.DecimalField(db_column='CostoReal', max_digits=10, decimal_places=2, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'costos'


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
    id_incidencia = models.AutoField(db_column='Id_Incidencia', primary_key=True)  # Field name made lowercase.
    id_colmena = models.ForeignKey(Colmena, models.DO_NOTHING, db_column='Id_Colmena')  # Field name made lowercase.
    titulo = models.CharField(db_column='Titulo', max_length=100, blank=True, null=True)  # Field name made lowercase.
    prioridad = models.CharField(db_column='Prioridad', max_length=50, blank=True, null=True)  # Field name made lowercase.
    fechadeteccion = models.DateField(db_column='FechaDeteccion', blank=True, null=True)  # Field name made lowercase.
    estado = models.CharField(db_column='Estado', max_length=50, blank=True, null=True)  # Field name made lowercase.
    observaciones = models.CharField(db_column='Observaciones', max_length=255, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'incidencia'


class Mantenimiento(models.Model):
    id_mantenimiento = models.AutoField(db_column='Id_Mantenimiento', primary_key=True)

    id_colmena = models.ForeignKey(
        Colmena,
        models.DO_NOTHING,
        db_column='Id_Colmena',
        blank=True,
        null=True
    )

    id_apiario = models.ForeignKey(
        Apiario,
        models.DO_NOTHING,
        db_column='Id_Apiario',
        blank=True,
        null=True
    )

    entidadmantenimiento = models.CharField(
        db_column='EntidadMantenimiento',
        max_length=50,
        blank=True,
        null=True
    )

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