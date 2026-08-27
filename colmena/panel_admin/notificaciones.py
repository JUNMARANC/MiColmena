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
        f'Se registró la incidencia "{titulo_incidencia}".'
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
    # MENSAJE
    # ========================================================

    partes = [
        f'Se registró el mantenimiento "{tipo_mantenimiento}".'
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


    url = (
        f"{reverse('agenda_admin')}"
        f"?mes={mes_evento}"
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
            "Tienes un evento programado "
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

        "Tienes un evento programado para hoy."

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
            "Tienes un evento para hoy",

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
    # MENSAJE
    # ========================================================

    mensaje = (
        f'La colmena "{codigo}" '
        f"fue marcada con estado Riesgo."
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

