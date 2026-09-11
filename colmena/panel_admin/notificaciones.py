from django.urls import reverse

from dbmicolmena.models import (
    Administrador,
    Mantenimiento,
    EventoAgenda,
    Colmena,
)

from panel_admin.models import (
    ConfiguracionNotificaciones,
    Notificacion,
)


from datetime import timedelta
from django.utils import timezone


# ============================================================
# VERIFICAR SI UN TIPO DE NOTIFICACIÓN ESTÁ ACTIVO
# ============================================================

def notificaciones_activas(tipo):

    configuracion, creado = (
        ConfiguracionNotificaciones.objects.get_or_create(
            pk=1
        )
    )


    # Notificaciones generales desactivadas
    if not configuracion.activar_notificaciones:

        return False


    # ========================================================
    # TIPO: INCIDENCIAS
    # ========================================================

    if tipo == "incidencia":

        return (
            configuracion.alertas_incidencias
        )


    # ========================================================
    # TIPO: MANTENIMIENTOS
    # ========================================================

    if tipo == "mantenimiento":

        return (
            configuracion.alertas_mantenimientos
        )


    # ========================================================
    # TIPO: COLMENAS
    # ========================================================

    if tipo == "colmena":

        return (
            configuracion.alertas_colmenas_riesgo
        )


    # ========================================================
    # TIPO: AGENDA
    # ========================================================

    if tipo == "agenda":

        return (
            configuracion.alertas_agenda
        )


    # ========================================================
    # TIPO: SEGURIDAD
    # ========================================================

    if tipo == "seguridad":

        return (
            configuracion.alertas_seguridad
        )


    return True


# ============================================================
# OBTENER ADMINISTRADORES ACTIVOS
# ============================================================

def obtener_administradores_activos():

    return (
        Administrador.objects
        .filter(
            user__isnull=False,
            user__is_active=True
        )
        .values_list(
            "user_id",
            flat=True
        )
        .distinct()
    )

# ============================================================
# OBTENER RESPONSABLE DE UN TRABAJO
# ============================================================

def obtener_responsable_trabajo(
    registro
):

    responsable = (
        getattr(
            registro,
            "responsable",
            ""
        )
        or ""
    ).strip()


    if (
        not responsable
        or
        responsable.lower()
        ==
        "sin responsable"
    ):

        return "Sin asignar"


    return responsable


# ============================================================
# NOTIFICAR NUEVA INCIDENCIA
# ============================================================

def notificar_incidencia_creada(
    incidencia
):

    # ========================================================
    # REVISAR CONFIGURACIÓN
    # ========================================================

    if not notificaciones_activas(
        "incidencia"
    ):

        return 0


    # ========================================================
    # DATOS DE LA INCIDENCIA
    # ========================================================

    titulo_incidencia = (
        getattr(
            incidencia,
            "titulo",
            ""
        )
        or "Incidencia"
    )


    prioridad = (
        getattr(
            incidencia,
            "prioridad",
            ""
        )
        or "Sin prioridad"
    )


    apiario = getattr(
        incidencia,
        "id_apiario",
        None
    )


    colmena = getattr(
        incidencia,
        "id_colmena",
        None
    )

    # ========================================================
    # RESPONSABLE
    # ========================================================

    responsable = (
        obtener_responsable_trabajo(
            incidencia
        )
    )


    # ========================================================
    # NOMBRE DEL APIARIO
    # ========================================================

    nombre_apiario = ""

    if apiario:

        nombre_apiario = (
            getattr(
                apiario,
                "nombreapiario",
                ""
            )
            or ""
        )


    # ========================================================
    # CÓDIGO DE COLMENA
    # ========================================================

    codigo_colmena = ""

    if colmena:

        codigo_colmena = (
            getattr(
                colmena,
                "codigocolmena",
                ""
            )
            or ""
        )


    # ========================================================
    # CREAR MENSAJE
    # ========================================================

    partes = [

        f'Se registró la incidencia "{titulo_incidencia}".',

        f"Responsable: {responsable}.",

    ]


    if nombre_apiario:

        partes.append(
            f"Apiario: {nombre_apiario}."
        )


    if codigo_colmena:

        partes.append(
            f"Colmena: {codigo_colmena}."
        )


    partes.append(
        f"Prioridad: {prioridad}."
    )


    mensaje = " ".join(
        partes
    )


    # ========================================================
    # URL DEL MÓDULO
    # ========================================================

    url = reverse(
        "incidencias_admin"
    )


    # ========================================================
    # ADMINISTRADORES
    # ========================================================

    usuarios_ids = list(
        obtener_administradores_activos()
    )


    if not usuarios_ids:

        return 0


    # ========================================================
    # GENERAR UNA NOTIFICACIÓN PARA CADA ADMINISTRADOR
    # ========================================================

    notificaciones = [

        Notificacion(

            usuario_id=id_usuario,

            tipo="incidencia",

            titulo="Nueva incidencia registrada",

            mensaje=mensaje,

            url=url,

        )

        for id_usuario
        in usuarios_ids

    ]


    Notificacion.objects.bulk_create(
        notificaciones
    )


    return len(
        notificaciones
    )


# ============================================================
# OBTENER APICULTOR RELACIONADO CON UNA INCIDENCIA
# ============================================================

def obtener_apicultor_incidencia(
    incidencia
):

    # ========================================================
    # 1. INCIDENCIA DIRECTAMENTE SOBRE UN APICULTOR
    # ========================================================

    apicultor = getattr(
        incidencia,
        "id_apicultor",
        None
    )


    if apicultor:

        return apicultor


    # ========================================================
    # 2. INCIDENCIA SOBRE UN APIARIO
    # ========================================================

    apiario = getattr(
        incidencia,
        "id_apiario",
        None
    )


    if apiario:

        apicultor = getattr(
            apiario,
            "id_apicultor",
            None
        )


        if apicultor:

            return apicultor


    # ========================================================
    # 3. INCIDENCIA SOBRE UNA COLMENA
    # ========================================================

    colmena = getattr(
        incidencia,
        "id_colmena",
        None
    )


    if colmena:

        apiario_colmena = getattr(
            colmena,
            "id_apiario",
            None
        )


        if apiario_colmena:

            apicultor = getattr(
                apiario_colmena,
                "id_apicultor",
                None
            )


            if apicultor:

                return apicultor


    # ========================================================
    # SIN APICULTOR RELACIONADO
    # ========================================================

    return None


# ============================================================
# NOTIFICAR NUEVA INCIDENCIA AL APICULTOR
# ============================================================

def notificar_incidencia_apicultor(
    incidencia
):

    # ========================================================
    # 1. CONFIGURACIÓN GLOBAL
    # ========================================================

    if not notificaciones_activas(
        "incidencia"
    ):

        return 0


    # ========================================================
    # 2. APICULTOR RELACIONADO
    # ========================================================

    apicultor = (
        obtener_apicultor_incidencia(
            incidencia
        )
    )


    if not apicultor:

        return 0


    # ========================================================
    # 3. USUARIO
    # ========================================================

    usuario = getattr(
        apicultor,
        "user",
        None
    )


    if (
        not usuario
        or
        not usuario.is_active
    ):

        return 0


    # ========================================================
    # 4. DATOS
    # ========================================================

    titulo_incidencia = (
        incidencia.titulo
        or
        "Incidencia"
    )


    prioridad = (
        incidencia.prioridad
        or
        "Sin prioridad"
    )


    estado = (
        incidencia.estado
        or
        "Pendiente"
    )


    fecha = (
        incidencia.fechadeteccion
    )


    fecha_texto = (
        fecha.strftime(
            "%d/%m/%Y"
        )
        if fecha
        else "Sin fecha"
    )


    # ========================================================
    # 5. APIARIO
    # ========================================================

    apiario = getattr(
        incidencia,
        "id_apiario",
        None
    )


    # Si la incidencia es de una colmena,
    # podemos obtener el apiario desde ella.

    if (
        not apiario
        and
        incidencia.id_colmena
    ):

        apiario = (
            incidencia
            .id_colmena
            .id_apiario
        )


    nombre_apiario = ""


    if apiario:

        nombre_apiario = (
            apiario.nombreapiario
            or
            ""
        )


    # ========================================================
    # 6. COLMENA
    # ========================================================

    codigo_colmena = ""


    if incidencia.id_colmena:

        codigo_colmena = (
            incidencia
            .id_colmena
            .codigocolmena
            or
            ""
        )


    # ========================================================
    # 7. MENSAJE
    # ========================================================

    partes = [

        (
            f'Se registró la incidencia '
            f'"{titulo_incidencia}" '
            f'relacionada contigo o con uno '
            f'de tus apiarios.'
        ),

        (
            f"Fecha: "
            f"{fecha_texto}."
        ),

        (
            f"Prioridad: "
            f"{prioridad}."
        ),

        (
            f"Estado: "
            f"{estado}."
        ),

    ]


    if nombre_apiario:

        partes.append(
            f"Apiario: {nombre_apiario}."
        )


    if codigo_colmena:

        partes.append(
            f"Colmena: {codigo_colmena}."
        )


    mensaje = " ".join(
        partes
    )


    # ========================================================
    # 8. URL DEL PANEL APICULTOR
    # ========================================================

    url = reverse(
        "incidencias_apicultor"
    )


    # ========================================================
    # 9. REFERENCIA
    #
    # Evita duplicar la notificación inicial.
    # ========================================================

    referencia = (

        f"incidencia:"
        f"{incidencia.pk}:"
        f"creada:"
        f"{usuario.pk}"

    )


    # ========================================================
    # 10. CREAR
    # ========================================================

    notificacion, creada = (
        Notificacion.objects.get_or_create(

            usuario=
                usuario,

            referencia=
                referencia,

            defaults={

                "tipo":
                    "incidencia",

                "titulo":
                    "Nueva incidencia registrada",

                "mensaje":
                    mensaje,

                "url":
                    url,

            }

        )
    )


    return (
        1
        if creada
        else 0
    )



# ============================================================
# NOTIFICAR ACTUALIZACIÓN DE INCIDENCIA AL APICULTOR
# ============================================================

def notificar_actualizacion_incidencia_apicultor(
    incidencia,
    estado_anterior,
    apicultor_anterior_id=None
):

    # ========================================================
    # CONFIGURACIÓN
    # ========================================================

    if not notificaciones_activas(
        "incidencia"
    ):

        return 0


    # ========================================================
    # APICULTOR ACTUAL
    # ========================================================

    apicultor_actual = (
        obtener_apicultor_incidencia(
            incidencia
        )
    )


    if not apicultor_actual:

        return 0


    usuario = getattr(
        apicultor_actual,
        "user",
        None
    )


    if (
        not usuario
        or
        not usuario.is_active
    ):

        return 0


    # ========================================================
    # DETECTAR CAMBIOS
    # ========================================================

    estado_actual = (
        incidencia.estado
        or
        ""
    )


    cambio_estado = (
        estado_anterior
        !=
        estado_actual
    )


    cambio_apicultor = (

        apicultor_anterior_id
        !=
        apicultor_actual.pk

    )


    # No hubo ningún cambio importante.
    if (
        not cambio_estado
        and
        not cambio_apicultor
    ):

        return 0


    # ========================================================
    # DATOS
    # ========================================================

    titulo_incidencia = (
        incidencia.titulo
        or
        "Incidencia"
    )


    prioridad = (
        incidencia.prioridad
        or
        "Sin prioridad"
    )


    partes = []


    # ========================================================
    # REASIGNACIÓN
    # ========================================================

    if cambio_apicultor:

        partes.append(
            (
                f'Se te asignó la incidencia '
                f'"{titulo_incidencia}".'
            )
        )


    # ========================================================
    # CAMBIO DE ESTADO
    # ========================================================

    if cambio_estado:

        partes.append(
            (
                f'La incidencia "{titulo_incidencia}" '
                f'cambió de "{estado_anterior}" '
                f'a "{estado_actual}".'
            )
        )


    partes.append(
        f"Prioridad: {prioridad}."
    )


    # ========================================================
    # APIARIO
    # ========================================================

    apiario = getattr(
        incidencia,
        "id_apiario",
        None
    )


    if (
        not apiario
        and
        incidencia.id_colmena
    ):

        apiario = (
            incidencia
            .id_colmena
            .id_apiario
        )


    if apiario:

        partes.append(
            (
                f"Apiario: "
                f"{apiario.nombreapiario}."
            )
        )


    # ========================================================
    # COLMENA
    # ========================================================

    if incidencia.id_colmena:

        partes.append(
            (
                f"Colmena: "
                f"{incidencia.id_colmena.codigocolmena}."
            )
        )


    mensaje = " ".join(
        partes
    )


    # ========================================================
    # TÍTULO
    # ========================================================

    if (
        cambio_apicultor
        and
        cambio_estado
    ):

        titulo_notificacion = (
            "Incidencia asignada y actualizada"
        )


    elif cambio_apicultor:

        titulo_notificacion = (
            "Nueva incidencia asignada"
        )


    else:

        titulo_notificacion = (
            "Estado de incidencia actualizado"
        )


    # ========================================================
    # CREAR NOTIFICACIÓN
    # ========================================================

    Notificacion.objects.create(

        usuario=
            usuario,

        tipo=
            "incidencia",

        titulo=
            titulo_notificacion,

        mensaje=
            mensaje,

        url=
            reverse(
                "incidencias_apicultor"
            ),

        referencia=(
            f"incidencia:"
            f"{incidencia.pk}:"
            f"actualizacion:"
            f"{usuario.pk}:"
            f"{timezone.now().strftime('%Y%m%d%H%M%S%f')}"
        ),

    )


    return 1

# ============================================================
# NOTIFICAR MANTENIMIENTO CREADO
# ============================================================

def notificar_mantenimiento_creado(
    mantenimiento
):

    if not notificaciones_activas(
        "mantenimiento"
    ):

        return 0


    # ========================================================
    # DATOS
    # ========================================================

    tipo_mantenimiento = (
        getattr(
            mantenimiento,
            "tipo",
            ""
        )
        or "Mantenimiento"
    )


    fecha = getattr(
        mantenimiento,
        "fechaejecucion",
        None
    )


    prioridad = (
        getattr(
            mantenimiento,
            "prioridad",
            ""
        )
        or "Sin prioridad"
    )


    apiario = getattr(
        mantenimiento,
        "id_apiario",
        None
    )


    colmena = getattr(
        mantenimiento,
        "id_colmena",
        None
    )

    # ========================================================
    # RESPONSABLE
    # ========================================================

    responsable = (
        obtener_responsable_trabajo(
            mantenimiento
        )
    )


    # ========================================================
    # MENSAJE
    # ========================================================

    partes = [

        f'Se registró el mantenimiento "{tipo_mantenimiento}".',

        f"Responsable: {responsable}.",

    ]


    if apiario:

        nombre_apiario = (
            getattr(
                apiario,
                "nombreapiario",
                ""
            )
            or ""
        )

        if nombre_apiario:

            partes.append(
                f"Apiario: {nombre_apiario}."
            )


    if colmena:

        codigo_colmena = (
            getattr(
                colmena,
                "codigocolmena",
                ""
            )
            or ""
        )

        if codigo_colmena:

            partes.append(
                f"Colmena: {codigo_colmena}."
            )


    if fecha:

        try:

            fecha_texto = (
                fecha.strftime(
                    "%d/%m/%Y"
                )
            )

        except AttributeError:

            fecha_texto = str(
                fecha
            )


        partes.append(
            f"Fecha programada: {fecha_texto}."
        )


    partes.append(
        f"Prioridad: {prioridad}."
    )


    mensaje = " ".join(
        partes
    )


    url = reverse(
        "mantenimientos_admin"
    )


    referencia = (
        f"mantenimiento:"
        f"{mantenimiento.pk}:"
        f"vencido:"
        f"{fecha.isoformat()}"
    )


    # ========================================================
    # ADMINISTRADORES
    # ========================================================

    usuarios_ids = list(
        obtener_administradores_activos()
    )


    creadas = 0


    for id_usuario in usuarios_ids:

        notificacion, creada = (
            Notificacion.objects.get_or_create(

                usuario_id=id_usuario,

                referencia=referencia,

                defaults={

                    "tipo":
                        "mantenimiento",

                    "titulo":
                        "Nuevo mantenimiento programado",

                    "mensaje":
                        mensaje,

                    "url":
                        url,

                }

            )
        )


        if creada:

            creadas += 1


    return creadas



# ============================================================
# NOTIFICAR MANTENIMIENTO ASIGNADO A APICULTOR
# ============================================================

def notificar_mantenimiento_asignado_apicultor(
    mantenimiento,
    apicultor,
    reasignacion=False
):

    # ========================================================
    # CONFIGURACIÓN
    # ========================================================

    if not notificaciones_activas(
        "mantenimiento"
    ):

        return 0


    # ========================================================
    # VALIDAR APICULTOR
    # ========================================================

    if not apicultor:

        return 0


    usuario = getattr(
        apicultor,
        "user",
        None
    )


    if (
        not usuario
        or
        not usuario.is_active
    ):

        return 0


    # ========================================================
    # DATOS
    # ========================================================

    tipo = (
        mantenimiento.tipo
        or
        "Mantenimiento"
    )


    prioridad = (
        mantenimiento.prioridad
        or
        "Sin prioridad"
    )


    fecha = (
        mantenimiento.fechaejecucion
    )


    fecha_texto = (
        fecha.strftime(
            "%d/%m/%Y"
        )
        if fecha
        else "Sin fecha"
    )


    # ========================================================
    # APIARIO
    # ========================================================

    nombre_apiario = ""


    if mantenimiento.id_apiario:

        nombre_apiario = (
            mantenimiento
            .id_apiario
            .nombreapiario
            or
            ""
        )


    # ========================================================
    # COLMENA
    # ========================================================

    codigo_colmena = ""


    if mantenimiento.id_colmena:

        codigo_colmena = (
            mantenimiento
            .id_colmena
            .codigocolmena
            or
            ""
        )


    # ========================================================
    # MENSAJE
    # ========================================================

    if reasignacion:

        encabezado = (
            f'Se te reasignó el mantenimiento '
            f'"{tipo}".'
        )

        titulo_notificacion = (
            "Mantenimiento reasignado"
        )

    else:

        encabezado = (
            f'Se te asignó el mantenimiento '
            f'"{tipo}".'
        )

        titulo_notificacion = (
            "Nuevo mantenimiento asignado"
        )


    partes = [

        encabezado,

        (
            f"Fecha programada: "
            f"{fecha_texto}."
        ),

        (
            f"Prioridad: "
            f"{prioridad}."
        ),

    ]


    if nombre_apiario:

        partes.append(
            f"Apiario: {nombre_apiario}."
        )


    if codigo_colmena:

        partes.append(
            f"Colmena: {codigo_colmena}."
        )


    mensaje = " ".join(
        partes
    )


    # ========================================================
    # URL
    # ========================================================

    url = reverse(
        "mantenimientos_apicultor"
    )


    # ========================================================
    # REFERENCIA
    # ========================================================

    if reasignacion:

        # Cada reasignación real debe poder generar
        # una nueva notificación.

        momento = (
            timezone.now()
            .strftime(
                "%Y%m%d%H%M%S%f"
            )
        )


        referencia = (

            f"mantenimiento:"
            f"{mantenimiento.pk}:"
            f"reasignacion:"
            f"{usuario.pk}:"
            f"{momento}"

        )


    else:

        # La notificación inicial sí debe ser única.

        referencia = (

            f"mantenimiento:"
            f"{mantenimiento.pk}:"
            f"asignacion:"
            f"{usuario.pk}"

        )


    # ========================================================
    # CREAR
    # ========================================================

    notificacion, creada = (
        Notificacion.objects.get_or_create(

            usuario=
                usuario,

            referencia=
                referencia,

            defaults={

                "tipo":
                    "mantenimiento",

                "titulo":
                    titulo_notificacion,

                "mensaje":
                    mensaje,

                "url":
                    url,

            }

        )
    )


    return (
        1
        if creada
        else 0
    )



# ============================================================
# VERIFICAR SI EL MANTENIMIENTO YA ESTÁ CERRADO
# ============================================================

def mantenimiento_esta_cerrado(
    mantenimiento
):

    estado = (
        getattr(
            mantenimiento,
            "estado",
            ""
        )
        or ""
    )


    estado = (
        estado
        .strip()
        .lower()
    )


    # ========================================================
    # ESTADOS QUE YA NO DEBEN GENERAR RECORDATORIOS
    # ========================================================

    estados_cerrados = {
        "completado",
        "cancelado",
    }


    return (
        estado in estados_cerrados
    )


# ============================================================
# REVISAR ALERTAS DE MANTENIMIENTOS
# ============================================================

def revisar_alertas_mantenimientos():

    if not notificaciones_activas(
        "mantenimiento"
    ):

        return {
            "proximos": 0,
            "vencidos": 0,
        }


    hoy = timezone.localdate()

    manana = (
        hoy +
        timedelta(days=1)
    )


    mantenimientos = (
        Mantenimiento.objects
        .select_related(
            "id_apiario",
            "id_colmena"
        )
        .exclude(
            fechaejecucion__isnull=True
        )
    )


    total_proximos = 0

    total_vencidos = 0


    for mantenimiento in mantenimientos:

        # ----------------------------------------------------
        # NO AVISAR SI YA TERMINÓ
        # ----------------------------------------------------

        if mantenimiento_esta_cerrado(
            mantenimiento
        ):

            continue


        fecha = (
            mantenimiento.fechaejecucion
        )


        # Por seguridad, si llega como datetime
        if hasattr(
            fecha,
            "date"
        ):

            fecha = fecha.date()


        # ====================================================
        # MANTENIMIENTO PARA MAÑANA
        # ====================================================

        if fecha == manana:

            creadas = (
                crear_alerta_mantenimiento_proximo(
                    mantenimiento
                )
            )


            total_proximos += creadas


        # ====================================================
        # MANTENIMIENTO VENCIDO
        # ====================================================

        elif fecha < hoy:

            creadas = (
                crear_alerta_mantenimiento_vencido(
                    mantenimiento
                )
            )


            total_vencidos += creadas


    return {

        "proximos":
            total_proximos,

        "vencidos":
            total_vencidos,

    }


# ============================================================
# MANTENIMIENTO PRÓXIMO
# ============================================================

def crear_alerta_mantenimiento_proximo(
    mantenimiento
):

    fecha = mantenimiento.fechaejecucion


    if hasattr(
        fecha,
        "date"
    ):

        fecha = fecha.date()


    fecha_texto = fecha.strftime(
        "%d/%m/%Y"
    )


    tipo_mantenimiento = (
        mantenimiento.tipo
        or "Mantenimiento"
    )


    mensaje = (
        f'El mantenimiento "{tipo_mantenimiento}" '
        f"está programado para mañana, "
        f"{fecha_texto}."
    )

    responsable = (
        obtener_responsable_trabajo(
            mantenimiento
        )
    )


    mensaje += (
        f" Responsable: "
        f"{responsable}."
    )


    if mantenimiento.id_apiario:

        nombre_apiario = (
            mantenimiento
            .id_apiario
            .nombreapiario
        )


        if nombre_apiario:

            mensaje += (
                f" Apiario: "
                f"{nombre_apiario}."
            )


    if mantenimiento.id_colmena:

        codigo = (
            mantenimiento
            .id_colmena
            .codigocolmena
        )


        if codigo:

            mensaje += (
                f" Colmena: "
                f"{codigo}."
            )


    referencia = (
        f"mantenimiento:"
        f"{mantenimiento.pk}:"
        f"proximo:"
        f"{fecha.isoformat()}"
    )


    return crear_notificacion_mantenimiento_admins(

        titulo=
            "Mantenimiento programado para mañana",

        mensaje=
            mensaje,

        referencia=
            referencia,

    )


# ============================================================
# MANTENIMIENTO VENCIDO
# ============================================================

def crear_alerta_mantenimiento_vencido(
    mantenimiento
):

    fecha = mantenimiento.fechaejecucion


    if hasattr(
        fecha,
        "date"
    ):

        fecha = fecha.date()


    fecha_texto = fecha.strftime(
        "%d/%m/%Y"
    )


    tipo_mantenimiento = (
        mantenimiento.tipo
        or "Mantenimiento"
    )


    mensaje = (
        f'El mantenimiento "{tipo_mantenimiento}" '
        f"estaba programado para el "
        f"{fecha_texto} y continúa pendiente."
    )

    responsable = (
        obtener_responsable_trabajo(
            mantenimiento
        )
    )


    mensaje += (
        f" Responsable: "
        f"{responsable}."
    )


    if mantenimiento.id_apiario:

        nombre_apiario = (
            mantenimiento
            .id_apiario
            .nombreapiario
        )


        if nombre_apiario:

            mensaje += (
                f" Apiario: "
                f"{nombre_apiario}."
            )


    if mantenimiento.id_colmena:

        codigo = (
            mantenimiento
            .id_colmena
            .codigocolmena
        )


        if codigo:

            mensaje += (
                f" Colmena: "
                f"{codigo}."
            )


    referencia = (
        f"mantenimiento:"
        f"{mantenimiento.pk}:"
        f"vencido"
    )


    return crear_notificacion_mantenimiento_admins(

        titulo=
            "Mantenimiento vencido",

        mensaje=
            mensaje,

        referencia=
            referencia,

    )


# ============================================================
# CREAR NOTIFICACIÓN DE MANTENIMIENTO PARA ADMINISTRADORES
# ============================================================

def crear_notificacion_mantenimiento_admins(
    titulo,
    mensaje,
    referencia
):

    if not notificaciones_activas(
        "mantenimiento"
    ):

        return 0


    url = reverse(
        "mantenimientos_admin"
    )


    usuarios_ids = list(
        obtener_administradores_activos()
    )


    creadas = 0


    for id_usuario in usuarios_ids:

        notificacion, creada = (
            Notificacion.objects.get_or_create(

                usuario_id=
                    id_usuario,

                referencia=
                    referencia,

                defaults={

                    "tipo":
                        "mantenimiento",

                    "titulo":
                        titulo,

                    "mensaje":
                        mensaje,

                    "url":
                        url,

                }

            )
        )


        if creada:

            creadas += 1


    return creadas


# ============================================================
# REVISAR ALERTAS DE MANTENIMIENTOS
# ============================================================

def revisar_alertas_mantenimientos():

    # ========================================================
    # VERIFICAR CONFIGURACIÓN
    # ========================================================

    if not notificaciones_activas(
        "mantenimiento"
    ):

        return {
            "proximos": 0,
            "vencidos": 0,
        }


    # ========================================================
    # FECHAS
    # ========================================================

    hoy = timezone.localdate()

    manana = (
        hoy +
        timedelta(days=1)
    )


    # ========================================================
    # MANTENIMIENTOS
    # ========================================================

    mantenimientos = (
        Mantenimiento.objects
        .select_related(
            "id_apiario",
            "id_colmena"
        )
        .exclude(
            fechaejecucion__isnull=True
        )
    )


    total_proximos = 0
    total_vencidos = 0


    # ========================================================
    # REVISAR UNO POR UNO
    # ========================================================

    for mantenimiento in mantenimientos:

        # ----------------------------------------------------
        # IGNORAR MANTENIMIENTOS TERMINADOS
        # ----------------------------------------------------

        if not mantenimiento_requiere_alerta(
            mantenimiento
        ):
            continue


        fecha = (
            mantenimiento.fechaejecucion
        )


        # Si por alguna razón llega como datetime
        # lo convertimos a date.

        if hasattr(
            fecha,
            "date"
        ):

            fecha = fecha.date()


        # ====================================================
        # PROGRAMADO PARA MAÑANA
        # ====================================================

        if fecha == manana:

            creadas = (
                crear_alerta_mantenimiento_proximo(
                    mantenimiento
                )
            )


            total_proximos += (
                creadas
            )


        # ====================================================
        # VENCIDO
        # ====================================================

        elif fecha < hoy:

            creadas = (
                crear_alerta_mantenimiento_vencido(
                    mantenimiento
                )
            )


            total_vencidos += (
                creadas
            )


    return {

        "proximos":
            total_proximos,

        "vencidos":
            total_vencidos,

    }


def mantenimiento_requiere_alerta(
    mantenimiento
):

    estado = (
        mantenimiento.estado
        or ""
    ).strip().lower()


    return estado == "pendiente"

# ============================================================
# VERIFICAR SI UN EVENTO DE AGENDA REQUIERE RECORDATORIO
# ============================================================

def evento_agenda_requiere_alerta(
    evento
):

    return (
        evento.estado
        ==
        EventoAgenda.EstadoEvento.PROGRAMADO
    )


# ============================================================
# OBTENER DESTINATARIOS DE UN EVENTO
# ============================================================

def obtener_destinatarios_evento(
    evento
):

    usuarios_ids = set(
        obtener_administradores_activos()
    )


    # ========================================================
    # RESPONSABLE DEL EVENTO
    # ========================================================

    responsable = getattr(
        evento,
        "responsable",
        None
    )


    if responsable:

        usuario_responsable = getattr(
            responsable,
            "user",
            None
        )


        if (
            usuario_responsable
            and usuario_responsable.is_active
        ):

            usuarios_ids.add(
                usuario_responsable.id
            )


    return usuarios_ids


# ============================================================
# CREAR NOTIFICACIÓN DE AGENDA
# ============================================================

def crear_notificacion_agenda(
    evento,
    titulo,
    mensaje,
    referencia
):

    if not notificaciones_activas(
        "agenda"
    ):

        return 0


    # ========================================================
    # URL DIRECTA AL MES DEL EVENTO
    # ========================================================

    mes_evento = (
        evento.fecha.strftime(
            "%Y-%m"
        )
    )



    # ========================================================
    # DESTINATARIOS
    # ========================================================

    usuarios_ids = (
        obtener_destinatarios_evento(
            evento
        )
    )


    creadas = 0


    for id_usuario in usuarios_ids:


        # ====================================================
        # URL SEGÚN EL TIPO DE DESTINATARIO
        # ====================================================

        responsable_user_id = None


        if (
            evento.responsable
            and
            evento.responsable.user
        ):

            responsable_user_id = (
                evento.responsable.user_id
            )


        # APICULTOR

        if (
            responsable_user_id
            and
            id_usuario == responsable_user_id
        ):

            url = (
                f"{reverse('agenda_apicultor')}"
                f"?mes={mes_evento}"
            )


        # ADMINISTRADOR

        else:

            url = (
                f"{reverse('agenda_admin')}"
                f"?mes={mes_evento}"
            )

        notificacion, creada = (
            Notificacion.objects.get_or_create(

                usuario_id=
                    id_usuario,

                referencia=
                    referencia,

                defaults={

                    "tipo":
                        "agenda",

                    "titulo":
                        titulo,

                    "mensaje":
                        mensaje,

                    "url":
                        url,

                }

            )
        )


        if creada:

            creadas += 1


    return creadas


# ============================================================
# CONSTRUIR MENSAJE DE EVENTO
# ============================================================

def construir_mensaje_evento(
    evento,
    encabezado
):

    partes = [
        encabezado
    ]


    # ========================================================
    # TÍTULO
    # ========================================================

    partes.append(
        f'Evento: "{evento.titulo}".'
    )


    # ========================================================
    # TIPO
    # ========================================================

    partes.append(
        f"Tipo: "
        f"{evento.get_tipo_evento_display()}."
    )


    # ========================================================
    # RESPONSABLE
    # ========================================================

    if evento.responsable:

        usuario_responsable = getattr(
            evento.responsable,
            "user",
            None
        )


        if usuario_responsable:

            nombre_responsable = (
                usuario_responsable
                .get_full_name()
                .strip()

                or

                usuario_responsable.username
            )


            partes.append(
                f"Responsable: "
                f"{nombre_responsable}."
            )

    else:

        partes.append(
            "Responsable: Sin asignar."
        )


    # ========================================================
    # APIARIO
    # ========================================================

    if evento.id_apiario:

        nombre_apiario = (
            evento.id_apiario.nombreapiario
            or ""
        )


        if nombre_apiario:

            partes.append(
                f"Apiario: "
                f"{nombre_apiario}."
            )


    # ========================================================
    # COLMENA
    # ========================================================

    if evento.id_colmena:

        codigo_colmena = (
            evento.id_colmena.codigocolmena
            or ""
        )


        if codigo_colmena:

            partes.append(
                f"Colmena: "
                f"{codigo_colmena}."
            )


    # ========================================================
    # HORA
    # ========================================================

    if evento.hora:

        hora_texto = (
            evento.hora.strftime(
                "%I:%M %p"
            )
        )


        partes.append(
            f"Hora: {hora_texto}."
        )


    # ========================================================
    # MENSAJE FINAL
    # ========================================================

    return " ".join(
        partes
    )





# ============================================================
# EVENTO PROGRAMADO PARA MAÑANA
# ============================================================

def crear_alerta_evento_manana(
    evento
):

    fecha_texto = (
        evento.fecha.strftime(
            "%d/%m/%Y"
        )
    )


    mensaje = construir_mensaje_evento(

        evento,

        (
            "Hay un evento programado "
            f"para mañana, {fecha_texto}."
        )

    )


    referencia = (
        f"agenda:"
        f"{evento.pk}:"
        f"manana:"
        f"{evento.fecha.isoformat()}"
    )


    return crear_notificacion_agenda(

        evento=
            evento,

        titulo=
            "Evento programado para mañana",

        mensaje=
            mensaje,

        referencia=
            referencia,

    )


# ============================================================
# EVENTO PROGRAMADO PARA HOY
# ============================================================

def crear_alerta_evento_hoy(
    evento
):

    mensaje = construir_mensaje_evento(

        evento,

            "Hay un evento programado para hoy."

    )


    referencia = (
        f"agenda:"
        f"{evento.pk}:"
        f"hoy:"
        f"{evento.fecha.isoformat()}"
    )


    return crear_notificacion_agenda(

        evento=
            evento,

        titulo=
            "Evento programado para hoy",

        mensaje=
            mensaje,

        referencia=
            referencia,

    )


# ============================================================
# REVISAR ALERTAS AUTOMÁTICAS DE AGENDA
# ============================================================

def revisar_alertas_agenda():

    # ========================================================
    # CONFIGURACIÓN
    # ========================================================

    if not notificaciones_activas(
        "agenda"
    ):

        return {
            "hoy": 0,
            "manana": 0,
        }


    # ========================================================
    # FECHAS
    # ========================================================

    hoy = timezone.localdate()

    manana = (
        hoy +
        timedelta(days=1)
    )


    # ========================================================
    # EVENTOS PROGRAMADOS
    # ========================================================

    eventos = (
        EventoAgenda.objects
        .select_related(
            "id_apiario",
            "id_colmena",
            "responsable",
            "responsable__user",
        )
        .filter(
            estado=
                EventoAgenda
                .EstadoEvento
                .PROGRAMADO,

            fecha__in=[
                hoy,
                manana,
            ]
        )
    )


    total_hoy = 0
    total_manana = 0


    # ========================================================
    # REVISAR EVENTOS
    # ========================================================

    for evento in eventos:

        if not evento_agenda_requiere_alerta(
            evento
        ):

            continue


        # ====================================================
        # HOY
        # ====================================================

        if evento.fecha == hoy:

            creadas = (
                crear_alerta_evento_hoy(
                    evento
                )
            )


            total_hoy += (
                creadas
            )


        # ====================================================
        # MAÑANA
        # ====================================================

        elif evento.fecha == manana:

            creadas = (
                crear_alerta_evento_manana(
                    evento
                )
            )


            total_manana += (
                creadas
            )


    return {

        "hoy":
            total_hoy,

        "manana":
            total_manana,

    }


# ============================================================
# NOTIFICAR EVENTO ASIGNADO A UN APICULTOR
# ============================================================

def notificar_evento_asignado_apicultor(
    evento
):

    # ========================================================
    # 1. VERIFICAR CONFIGURACIÓN GLOBAL
    # ========================================================

    if not notificaciones_activas(
        "agenda"
    ):

        return 0


    # ========================================================
    # 2. RESPONSABLE
    # ========================================================

    responsable = getattr(
        evento,
        "responsable",
        None
    )


    if not responsable:

        return 0


    # ========================================================
    # 3. USUARIO DEL APICULTOR
    # ========================================================

    usuario = getattr(
        responsable,
        "user",
        None
    )


    if (
        not usuario
        or
        not usuario.is_active
    ):

        return 0


    # ========================================================
    # 4. FECHA DEL EVENTO
    # ========================================================

    if not evento.fecha:

        return 0


    fecha_texto = (
        evento.fecha.strftime(
            "%d/%m/%Y"
        )
    )


    mes_evento = (
        evento.fecha.strftime(
            "%Y-%m"
        )
    )


    # ========================================================
    # 5. HORA
    # ========================================================

    hora_texto = ""


    if evento.hora:

        hora_texto = (
            evento.hora.strftime(
                "%I:%M %p"
            )
        )


    # ========================================================
    # 6. APIARIO
    # ========================================================

    nombre_apiario = (
        evento.id_apiario.nombreapiario
        if evento.id_apiario
        else ""
    )


    # ========================================================
    # 7. COLMENA
    # ========================================================

    codigo_colmena = (
        evento.id_colmena.codigocolmena
        if evento.id_colmena
        else ""
    )


    # ========================================================
    # 8. CONSTRUIR MENSAJE
    # ========================================================

    partes = [

        (
            f'Se te asignó el evento '
            f'"{evento.titulo}".'
        ),

        (
            f"Fecha: "
            f"{fecha_texto}."
        ),

    ]


    if hora_texto:

        partes.append(
            f"Hora: {hora_texto}."
        )


    if nombre_apiario:

        partes.append(
            (
                f"Apiario: "
                f"{nombre_apiario}."
            )
        )


    if codigo_colmena:

        partes.append(
            (
                f"Colmena: "
                f"{codigo_colmena}."
            )
        )


    mensaje = " ".join(
        partes
    )


    # ========================================================
    # 9. URL DEL PANEL APICULTOR
    # ========================================================

    url = (
        f"{reverse('agenda_apicultor')}"
        f"?mes={mes_evento}"
    )


    # ========================================================
    # 10. REFERENCIA ÚNICA
    #
    # fecha_actualizacion permite distinguir una asignación
    # nueva de otra realizada posteriormente.
    # ========================================================

    fecha_actualizacion = (
        evento.fecha_actualizacion
    )


    referencia = (

        f"agenda:"
        f"{evento.pk}:"
        f"asignacion:"
        f"{usuario.pk}:"
        f"{fecha_actualizacion.isoformat()}"

    )


    # ========================================================
    # 11. CREAR NOTIFICACIÓN
    # ========================================================

    notificacion, creada = (
        Notificacion.objects.get_or_create(

            usuario=
                usuario,

            referencia=
                referencia,

            defaults={

                "tipo":
                    "agenda",

                "titulo":
                    "Nueva actividad asignada",

                "mensaje":
                    mensaje,

                "url":
                    url,

            }

        )
    )


    # ========================================================
    # 12. RESULTADO
    # ========================================================

    return (
        1
        if creada
        else 0
    )


# ============================================================
# REVISAR UN EVENTO RECIÉN CREADO
# ============================================================

def revisar_evento_agenda(
    evento
):

    if not notificaciones_activas(
        "agenda"
    ):

        return 0


    if not evento_agenda_requiere_alerta(
        evento
    ):

        return 0


    hoy = timezone.localdate()

    manana = (
        hoy +
        timedelta(days=1)
    )


    if evento.fecha == hoy:

        return crear_alerta_evento_hoy(
            evento
        )


    if evento.fecha == manana:

        return crear_alerta_evento_manana(
            evento
        )


    return 0



# ============================================================
# OBTENER DESTINATARIOS DE UNA COLMENA EN RIESGO
# ============================================================

def obtener_destinatarios_colmena(
    colmena
):

    # Todos los administradores activos
    usuarios_ids = set(
        obtener_administradores_activos()
    )


    # ========================================================
    # APICULTOR RESPONSABLE DEL APIARIO
    # ========================================================

    apiario = getattr(
        colmena,
        "id_apiario",
        None
    )


    if apiario:

        apicultor = getattr(
            apiario,
            "id_apicultor",
            None
        )


        if apicultor:

            usuario_apicultor = getattr(
                apicultor,
                "user",
                None
            )


            if (
                usuario_apicultor
                and usuario_apicultor.is_active
            ):

                usuarios_ids.add(
                    usuario_apicultor.id
                )


    return usuarios_ids


# ============================================================
# NOTIFICAR COLMENA EN RIESGO
# ============================================================

def notificar_colmena_en_riesgo(
    colmena
):

    # ========================================================
    # REVISAR CONFIGURACIÓN
    # ========================================================

    if not notificaciones_activas(
        "colmena"
    ):

        return 0


    # ========================================================
    # SOLO ESTADO RIESGO
    # ========================================================

    estado = (
        getattr(
            colmena,
            "estadocolmena",
            ""
        )
        or ""
    ).strip()


    if estado != "Riesgo":

        return 0


    # ========================================================
    # DATOS
    # ========================================================

    codigo = (
        getattr(
            colmena,
            "codigocolmena",
            ""
        )
        or "Sin código"
    )


    apiario = getattr(
        colmena,
        "id_apiario",
        None
    )


    nombre_apiario = ""


    if apiario:

        nombre_apiario = (
            getattr(
                apiario,
                "nombreapiario",
                ""
            )
            or ""
        )

    # ========================================================
    # APICULTOR RESPONSABLE DEL APIARIO
    # ========================================================

    nombre_responsable = (
        "Sin asignar"
    )


    if apiario:

        apicultor = getattr(
            apiario,
            "id_apicultor",
            None
        )


        if apicultor:

            usuario_apicultor = getattr(
                apicultor,
                "user",
                None
            )


            if usuario_apicultor:

                nombre_responsable = (
                    usuario_apicultor
                    .get_full_name()
                    .strip()

                    or

                    usuario_apicultor.username
                )


    # ========================================================
    # MENSAJE
    # ========================================================

    mensaje = (
        f'La colmena "{codigo}" '
        f"fue marcada con estado Riesgo."
    )


    mensaje += (
        f" Responsable del apiario: "
        f"{nombre_responsable}."
    )


    if nombre_apiario:

        mensaje += (
            f" Apiario: {nombre_apiario}."
        )


    mensaje += (
        " Se recomienda revisar su estado "
        "y realizar el seguimiento correspondiente."
    )


    # ========================================================
    # URL
    # ========================================================

    url = reverse(
        "colmenas_admin"
    )


    # ========================================================
    # REFERENCIA DEL EVENTO
    # ========================================================

    momento = (
        timezone.now()
        .strftime(
            "%Y%m%d%H%M%S%f"
        )
    )


    referencia = (
        f"colmena:"
        f"{colmena.pk}:"
        f"riesgo:"
        f"{momento}"
    )


    # ========================================================
    # DESTINATARIOS
    # ========================================================

    usuarios_ids = (
        obtener_destinatarios_colmena(
            colmena
        )
    )


    creadas = 0


    # ========================================================
    # CREAR NOTIFICACIONES
    # ========================================================

    for id_usuario in usuarios_ids:

        Notificacion.objects.create(

            usuario_id=
                id_usuario,

            tipo=
                "colmena",

            titulo=
                "Colmena en riesgo",

            mensaje=
                mensaje,

            url=
                url,

            referencia=
                referencia,

        )


        creadas += 1


    return creadas


# ============================================================
# REVISAR CAMBIO DE ESTADO DE COLMENA
# ============================================================

def revisar_cambio_estado_colmena(
    colmena,
    estado_anterior
):

    estado_anterior = (
        estado_anterior
        or ""
    ).strip()


    estado_nuevo = (
        colmena.estadocolmena
        or ""
    ).strip()


    # ========================================================
    # ENTRÓ A ESTADO RIESGO
    # ========================================================

    if (
        estado_nuevo == "Riesgo"
        and
        estado_anterior != "Riesgo"
    ):

        return notificar_colmena_en_riesgo(
            colmena
        )


    return 0


# ============================================================
# NOTIFICAR CAMBIO DE CONTRASEÑA
# ============================================================

def notificar_cambio_password(
    usuario
):

    # ========================================================
    # VERIFICAR CONFIGURACIÓN
    # ========================================================

    if not notificaciones_activas(
        "seguridad"
    ):

        return 0


    if not usuario:

        return 0


    # ========================================================
    # NOMBRE DEL USUARIO
    # ========================================================

    nombre_usuario = (
        usuario.get_full_name().strip()
        or
        usuario.username
    )


    # ========================================================
    # MENSAJE
    # ========================================================

    mensaje = (
        f"Hola {nombre_usuario}. "
        "La contraseña de tu cuenta fue actualizada correctamente. "
        "Si no realizaste este cambio, informa inmediatamente "
        "al administrador del sistema."
    )


    # ========================================================
    # URL
    # ========================================================

    url = reverse(
        "mi_perfil"
    )


    # ========================================================
    # REFERENCIA
    # ========================================================

    momento = (
        timezone.now()
        .strftime(
            "%Y%m%d%H%M%S%f"
        )
    )


    referencia = (
        f"seguridad:"
        f"password:"
        f"{usuario.pk}:"
        f"{momento}"
    )


    # ========================================================
    # CREAR NOTIFICACIÓN
    # ========================================================

    Notificacion.objects.create(

        usuario=usuario,

        tipo="seguridad",

        titulo="Contraseña actualizada",

        mensaje=mensaje,

        url=url,

        referencia=referencia,

    )


    return 1


# ============================================================
# NOTIFICAR INTENTOS FALLIDOS DE INICIO DE SESIÓN
# ============================================================

def notificar_intentos_login_fallidos(
    usuario,
    cantidad_intentos
):

    # ========================================================
    # CONFIGURACIÓN
    # ========================================================

    if not notificaciones_activas(
        "seguridad"
    ):

        return 0


    if not usuario:

        return 0


    # ========================================================
    # NOMBRE
    # ========================================================

    nombre_usuario = (
        usuario.get_full_name().strip()
        or
        usuario.username
    )


    # ========================================================
    # MENSAJE
    # ========================================================

    mensaje = (
        f"Hola {nombre_usuario}. "
        f"Se detectaron {cantidad_intentos} intentos fallidos "
        "de inicio de sesión en tu cuenta durante un periodo "
        "corto de tiempo. "
        "Si no reconoces estos intentos, se recomienda "
        "cambiar tu contraseña."
    )


    # ========================================================
    # REFERENCIA
    # ========================================================

    momento = (
        timezone.now()
        .strftime(
            "%Y%m%d%H%M%S%f"
        )
    )


    referencia = (
        f"seguridad:"
        f"login-fallido:"
        f"{usuario.pk}:"
        f"{momento}"
    )


    # ========================================================
    # CREAR NOTIFICACIÓN
    # ========================================================

    Notificacion.objects.create(

        usuario=usuario,

        tipo="seguridad",

        titulo="Intentos fallidos de inicio de sesión",

        mensaje=mensaje,

        url=reverse(
            "mi_perfil"
        ),

        referencia=referencia,

    )


    return 1

