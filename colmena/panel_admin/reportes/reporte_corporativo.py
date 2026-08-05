from collections import Counter, defaultdict
from datetime import timedelta
from decimal import Decimal

from django.db.models import Q
from django.template.loader import render_to_string
from django.utils import timezone

from dbmicolmena.models import (
    Apiario,
    Apicultor,
    Colmena,
    EventoAgenda,
    Incidencia,
    Mantenimiento,
    RegistroLaboralMensual,
)

from panel_admin.reportes.graficos import (
    generar_grafico_barras_colores,
    generar_grafico_dona,
    generar_grafico_linea,
)


# ============================================================
# FUNCIONES GENERALES
# ============================================================

def normalizar_texto(valor):
    return str(valor or "").strip().lower()


def abreviar(texto, limite=24):
    texto = str(texto or "").strip()

    if len(texto) <= limite:
        return texto

    return f"{texto[:limite - 3]}..."


def es_estado_completado(estado):
    estado = normalizar_texto(estado)

    palabras_completado = [
        "complet",
        "finaliz",
        "realiz",
        "ejecutad",
        "cerrad",
        "terminad",
        "resuelt",
        "solucion",
    ]

    return any(
        palabra in estado
        for palabra in palabras_completado
    )


def es_incidencia_cerrada(estado):
    estado = normalizar_texto(estado)

    palabras_cerrada = [
        "cerrad",
        "resuelt",
        "finaliz",
        "solucion",
        "complet",
    ]

    return any(
        palabra in estado
        for palabra in palabras_cerrada
    )


def clasificar_estado_colmena(estado):
    estado = normalizar_texto(estado)

    palabras_inactivas = [
        "inactiv",
        "muert",
        "elimin",
        "cerrad",
        "baja",
        "retir",
        "perdid",
    ]

    palabras_seguimiento = [
        "seguim",
        "revisi",
        "riesgo",
        "alert",
        "debil",
        "enferm",
        "pend",
        "observ",
        "recuper",
    ]

    palabras_activas = [
        "activ",
        "producci",
        "estable",
        "saludable",
        "normal",
        "fuerte",
        "bueno",
        "operativ",
    ]

    if any(
        palabra in estado
        for palabra in palabras_inactivas
    ):
        return "inactiva"

    if any(
        palabra in estado
        for palabra in palabras_seguimiento
    ):
        return "seguimiento"

    if any(
        palabra in estado
        for palabra in palabras_activas
    ):
        return "activa"

    return "seguimiento"


def es_apiario_activo(estado):
    estado = normalizar_texto(estado)

    palabras_inactivas = [
        "inactiv",
        "cerrad",
        "baja",
        "elimin",
        "retir",
    ]

    if any(
        palabra in estado
        for palabra in palabras_inactivas
    ):
        return False

    palabras_activas = [
        "activ",
        "operativ",
        "producci",
        "funcion",
        "disponible",
    ]

    return any(
        palabra in estado
        for palabra in palabras_activas
    )


def obtener_nombre_apicultor(apicultor):
    if not apicultor:
        return "Sin responsable"

    usuario = getattr(
        apicultor,
        "user",
        None
    )

    if usuario:
        nombre = usuario.get_full_name().strip()

        if nombre:
            return nombre

        if usuario.username:
            return usuario.username

    return f"Apicultor {apicultor.pk}"


def obtener_apiario_mantenimiento(mantenimiento):
    if mantenimiento.id_apiario:
        return mantenimiento.id_apiario

    if (
        mantenimiento.id_colmena
        and mantenimiento.id_colmena.id_apiario
    ):
        return mantenimiento.id_colmena.id_apiario

    return None


def obtener_apiario_incidencia(incidencia):
    if incidencia.id_apiario:
        return incidencia.id_apiario

    if (
        incidencia.id_colmena
        and incidencia.id_colmena.id_apiario
    ):
        return incidencia.id_colmena.id_apiario

    return None


def obtener_apiario_evento(evento):
    if evento.id_apiario:
        return evento.id_apiario

    if (
        evento.id_colmena
        and evento.id_colmena.id_apiario
    ):
        return evento.id_colmena.id_apiario

    return None


def obtener_apicultor_incidencia(incidencia):
    if incidencia.id_apicultor:
        return incidencia.id_apicultor

    apiario = obtener_apiario_incidencia(
        incidencia
    )

    if apiario:
        return apiario.id_apicultor

    return None


def aplicar_filtro_fecha(
    queryset,
    campo_fecha,
    fecha_desde=None,
    fecha_hasta=None
):
    filtros = {}

    if fecha_desde:
        filtros[
            f"{campo_fecha}__gte"
        ] = fecha_desde

    if fecha_hasta:
        filtros[
            f"{campo_fecha}__lte"
        ] = fecha_hasta

    if filtros:
        queryset = queryset.filter(
            **filtros
        )

    return queryset


def crear_detalle_apicultor(apicultor):
    return {
        "id": apicultor.pk,
        "nombre": obtener_nombre_apicultor(
            apicultor
        ),
        "identificacion": (
            apicultor.identificacion
            or "Sin identificación"
        ),
        "zona_trabajo": (
            apicultor.zona_trabajo
            or "Sin zona registrada"
        ),
        "mantenimientos": 0,
        "incidencias": 0,
        "eventos": 0,
        "dias_trabajados": 0,
        "horas_trabajadas": Decimal("0"),
    }


# ============================================================
# ACTIVIDAD DEL PERIODO ANTERIOR
# ============================================================

def contar_actividad_periodo(
    fecha_desde,
    fecha_hasta,
    apiario_id=None
):
    mantenimientos = (
        Mantenimiento.objects
        .filter(
            fechaejecucion__range=(
                fecha_desde,
                fecha_hasta
            )
        )
    )

    incidencias = (
        Incidencia.objects
        .filter(
            fechadeteccion__range=(
                fecha_desde,
                fecha_hasta
            )
        )
    )

    eventos = (
        EventoAgenda.objects
        .filter(
            fecha__range=(
                fecha_desde,
                fecha_hasta
            )
        )
    )

    if apiario_id:
        mantenimientos = (
            mantenimientos
            .filter(
                Q(id_apiario_id=apiario_id)
                | Q(
                    id_colmena__id_apiario_id=(
                        apiario_id
                    )
                )
            )
            .distinct()
        )

        incidencias = (
            incidencias
            .filter(
                Q(id_apiario_id=apiario_id)
                | Q(
                    id_colmena__id_apiario_id=(
                        apiario_id
                    )
                )
            )
            .distinct()
        )

        eventos = (
            eventos
            .filter(
                Q(id_apiario_id=apiario_id)
                | Q(
                    id_colmena__id_apiario_id=(
                        apiario_id
                    )
                )
            )
            .distinct()
        )

    return (
        mantenimientos.count()
        + incidencias.count()
        + eventos.count()
    )


# ============================================================
# CONCLUSIONES Y RECOMENDACIONES
# ============================================================

def generar_analisis_corporativo(
    *,
    total_apiarios,
    total_colmenas,
    colmenas_activas,
    colmenas_seguimiento,
    total_actividad,
    total_mantenimientos,
    total_incidencias,
    total_eventos,
    total_pendientes,
    incidencias_abiertas,
    total_horas,
    porcentaje_colmenas_activas,
    variacion_periodo
):
    conclusion = (
        f"El sistema registra {total_apiarios} apiarios "
        f"y {total_colmenas} colmenas dentro de los filtros "
        f"seleccionados. Durante el periodo se identificaron "
        f"{total_actividad} actividades operativas, compuestas "
        f"por {total_mantenimientos} mantenimientos, "
        f"{total_incidencias} incidencias y "
        f"{total_eventos} eventos."
    )

    if total_colmenas > 0:
        conclusion += (
            f" El {porcentaje_colmenas_activas}% de las "
            f"colmenas se encuentra clasificado como activo."
        )

    if total_pendientes > 0:
        conclusion += (
            f" Al cierre del periodo permanecen "
            f"{total_pendientes} actividades pendientes."
        )

    if variacion_periodo is not None:
        if variacion_periodo > 0:
            conclusion += (
                f" La actividad aumentó un "
                f"{abs(variacion_periodo)}% frente al "
                f"periodo anterior."
            )

        elif variacion_periodo < 0:
            conclusion += (
                f" La actividad disminuyó un "
                f"{abs(variacion_periodo)}% frente al "
                f"periodo anterior."
            )

        else:
            conclusion += (
                " La actividad se mantuvo igual frente "
                "al periodo anterior."
            )

    recomendaciones = []

    if total_colmenas == 0:
        recomendaciones.append(
            "Registrar colmenas para iniciar el seguimiento "
            "productivo y sanitario del sistema."
        )

    if (
        total_colmenas > 0
        and porcentaje_colmenas_activas < 60
    ):
        recomendaciones.append(
            "Revisar las colmenas inactivas o en seguimiento, "
            "debido a que el porcentaje de colmenas activas "
            "se encuentra por debajo del 60%."
        )

    if colmenas_seguimiento > 0:
        recomendaciones.append(
            f"Priorizar la revisión de las "
            f"{colmenas_seguimiento} colmenas clasificadas "
            f"en seguimiento."
        )

    if incidencias_abiertas > 0:
        recomendaciones.append(
            f"Dar tratamiento a las "
            f"{incidencias_abiertas} incidencias que "
            f"continúan abiertas."
        )

    if total_pendientes > 0:
        recomendaciones.append(
            f"Programar responsables y fechas de cierre "
            f"para las {total_pendientes} actividades "
            f"pendientes."
        )

    if total_horas == 0:
        recomendaciones.append(
            "Completar los registros laborales de días y "
            "horas trabajadas por los apicultores."
        )

    if (
        total_mantenimientos == 0
        and total_colmenas > 0
    ):
        recomendaciones.append(
            "Programar mantenimientos preventivos para las "
            "colmenas registradas."
        )

    if not recomendaciones:
        recomendaciones.append(
            "Mantener el seguimiento periódico de apiarios, "
            "colmenas, incidencias y actividades operativas."
        )

    return {
        "conclusion": conclusion,
        "recomendaciones": recomendaciones,
    }


# ============================================================
# GENERADOR PRINCIPAL
# ============================================================

def generar_reporte_corporativo_pdf(
    *,
    request,
    fecha_desde=None,
    fecha_hasta=None,
    apiario_id=None,
    incluir_graficos=True,
    incluir_tabla=True,
    incluir_resumen=True,
    incluir_conclusiones=True,
    comparar_periodo_anterior=False
):
    if (
        fecha_desde
        and fecha_hasta
        and fecha_desde > fecha_hasta
    ):
        raise ValueError(
            "La fecha inicial no puede ser posterior "
            "a la fecha final."
        )

    # ========================================================
    # APIARIO SELECCIONADO
    # ========================================================

    apiario_seleccionado = None

    if apiario_id:
        apiario_seleccionado = (
            Apiario.objects
            .select_related(
                "id_apicultor",
                "id_apicultor__user"
            )
            .filter(pk=apiario_id)
            .first()
        )

        if not apiario_seleccionado:
            raise ValueError(
                "El apiario seleccionado no existe."
            )

    # ========================================================
    # APIARIOS
    # ========================================================

    apiarios_queryset = (
        Apiario.objects
        .select_related(
            "id_apicultor",
            "id_apicultor__user"
        )
        .all()
    )

    if apiario_id:
        apiarios_queryset = (
            apiarios_queryset.filter(
                pk=apiario_id
            )
        )

    apiarios = list(
        apiarios_queryset.order_by(
            "nombreapiario"
        )
    )

    ids_apiarios = [
        apiario.pk
        for apiario in apiarios
    ]

    # ========================================================
    # COLMENAS
    # ========================================================

    colmenas_queryset = (
        Colmena.objects
        .select_related(
            "id_apiario"
        )
        .all()
    )

    if apiario_id:
        colmenas_queryset = (
            colmenas_queryset.filter(
                id_apiario_id=apiario_id
            )
        )

    colmenas = list(
        colmenas_queryset.order_by(
            "codigocolmena"
        )
    )

    # ========================================================
    # MANTENIMIENTOS
    # ========================================================

    mantenimientos_queryset = (
        Mantenimiento.objects
        .select_related(
            "id_apiario",
            "id_apiario__id_apicultor",
            "id_apiario__id_apicultor__user",
            "id_colmena",
            "id_colmena__id_apiario",
            "id_colmena__id_apiario__id_apicultor",
            "id_colmena__id_apiario__id_apicultor__user",
        )
        .all()
    )

    mantenimientos_queryset = aplicar_filtro_fecha(
        mantenimientos_queryset,
        "fechaejecucion",
        fecha_desde,
        fecha_hasta
    )

    if apiario_id:
        mantenimientos_queryset = (
            mantenimientos_queryset
            .filter(
                Q(id_apiario_id=apiario_id)
                | Q(
                    id_colmena__id_apiario_id=(
                        apiario_id
                    )
                )
            )
            .distinct()
        )

    mantenimientos = list(
        mantenimientos_queryset
        .order_by("-fechaejecucion")
    )

    # ========================================================
    # INCIDENCIAS
    # ========================================================

    incidencias_queryset = (
        Incidencia.objects
        .select_related(
            "id_apicultor",
            "id_apicultor__user",
            "id_apiario",
            "id_apiario__id_apicultor",
            "id_apiario__id_apicultor__user",
            "id_colmena",
            "id_colmena__id_apiario",
            "id_colmena__id_apiario__id_apicultor",
            "id_colmena__id_apiario__id_apicultor__user",
        )
        .all()
    )

    incidencias_queryset = aplicar_filtro_fecha(
        incidencias_queryset,
        "fechadeteccion",
        fecha_desde,
        fecha_hasta
    )

    if apiario_id:
        incidencias_queryset = (
            incidencias_queryset
            .filter(
                Q(id_apiario_id=apiario_id)
                | Q(
                    id_colmena__id_apiario_id=(
                        apiario_id
                    )
                )
            )
            .distinct()
        )

    incidencias = list(
        incidencias_queryset
        .order_by("-fechadeteccion")
    )

    # ========================================================
    # EVENTOS
    # ========================================================

    eventos_queryset = (
        EventoAgenda.objects
        .select_related(
            "responsable",
            "responsable__user",
            "id_apiario",
            "id_colmena",
            "id_colmena__id_apiario",
        )
        .all()
    )

    eventos_queryset = aplicar_filtro_fecha(
        eventos_queryset,
        "fecha",
        fecha_desde,
        fecha_hasta
    )

    if apiario_id:
        eventos_queryset = (
            eventos_queryset
            .filter(
                Q(id_apiario_id=apiario_id)
                | Q(
                    id_colmena__id_apiario_id=(
                        apiario_id
                    )
                )
            )
            .distinct()
        )

    eventos = list(
        eventos_queryset.order_by(
            "-fecha"
        )
    )

    # ========================================================
    # REGISTROS LABORALES
    # ========================================================

    registros_laborales_queryset = (
        RegistroLaboralMensual.objects
        .select_related(
            "apicultor",
            "apicultor__user"
        )
        .all()
    )

    if fecha_desde:
        primer_mes = fecha_desde.replace(
            day=1
        )

        registros_laborales_queryset = (
            registros_laborales_queryset
            .filter(
                mes_reporte__gte=primer_mes
            )
        )

    if fecha_hasta:
        ultimo_mes = fecha_hasta.replace(
            day=1
        )

        registros_laborales_queryset = (
            registros_laborales_queryset
            .filter(
                mes_reporte__lte=ultimo_mes
            )
        )

    if (
        apiario_seleccionado
        and apiario_seleccionado.id_apicultor_id
    ):
        registros_laborales_queryset = (
            registros_laborales_queryset
            .filter(
                apicultor_id=(
                    apiario_seleccionado
                    .id_apicultor_id
                )
            )
        )

    registros_laborales = list(
        registros_laborales_queryset
    )

    # ========================================================
    # ESTADO DE APIARIOS
    # ========================================================

    total_apiarios = len(apiarios)

    apiarios_activos = sum(
        1
        for apiario in apiarios
        if es_apiario_activo(
            apiario.estadoapiario
        )
    )

    apiarios_inactivos = (
        total_apiarios
        - apiarios_activos
    )

    # ========================================================
    # ESTADO DE COLMENAS
    # ========================================================

    estados_colmenas = Counter()

    colmenas_activas = 0
    colmenas_inactivas = 0
    colmenas_seguimiento = 0

    for colmena in colmenas:
        estado_original = (
            str(
                colmena.estadocolmena
                or "Sin estado"
            ).strip()
        )

        estados_colmenas[
            estado_original
        ] += 1

        clasificacion = (
            clasificar_estado_colmena(
                colmena.estadocolmena
            )
        )

        if clasificacion == "activa":
            colmenas_activas += 1

        elif clasificacion == "inactiva":
            colmenas_inactivas += 1

        else:
            colmenas_seguimiento += 1

    total_colmenas = len(colmenas)

    porcentaje_colmenas_activas = (
        round(
            colmenas_activas
            * 100
            / total_colmenas,
            1
        )
        if total_colmenas
        else 0
    )

    # ========================================================
    # ESTADO DE ACTIVIDADES
    # ========================================================

    mantenimientos_completados = sum(
        1
        for mantenimiento in mantenimientos
        if es_estado_completado(
            mantenimiento.estado
        )
    )

    mantenimientos_pendientes = (
        len(mantenimientos)
        - mantenimientos_completados
    )

    incidencias_cerradas = sum(
        1
        for incidencia in incidencias
        if es_incidencia_cerrada(
            incidencia.estado
        )
    )

    incidencias_abiertas = (
        len(incidencias)
        - incidencias_cerradas
    )

    eventos_completados = sum(
        1
        for evento in eventos
        if es_estado_completado(
            evento.estado
        )
    )

    eventos_pendientes = (
        len(eventos)
        - eventos_completados
    )

    total_mantenimientos = len(
        mantenimientos
    )

    total_incidencias = len(
        incidencias
    )

    total_eventos = len(
        eventos
    )

    total_actividad = (
        total_mantenimientos
        + total_incidencias
        + total_eventos
    )

    actividades_completadas = (
        mantenimientos_completados
        + incidencias_cerradas
        + eventos_completados
    )

    total_pendientes = (
        mantenimientos_pendientes
        + incidencias_abiertas
        + eventos_pendientes
    )

    porcentaje_cumplimiento = (
        round(
            actividades_completadas
            * 100
            / total_actividad,
            1
        )
        if total_actividad
        else 0
    )

    # ========================================================
    # ACTIVIDAD POR APIARIO
    # ========================================================

    actividad_apiarios = {}

    for apiario in apiarios:
        actividad_apiarios[
            apiario.pk
        ] = {
            "id": apiario.pk,
            "nombre": apiario.nombreapiario,
            "estado": (
                apiario.estadoapiario
                or "Sin estado"
            ),
            "ubicacion": (
                apiario.ubicacion
                or "Sin ubicación"
            ),
            "colmenas": 0,
            "mantenimientos": 0,
            "incidencias": 0,
            "eventos": 0,
            "actividad_total": 0,
        }

    for colmena in colmenas:
        apiario_id_colmena = (
            colmena.id_apiario_id
        )

        if apiario_id_colmena in actividad_apiarios:
            actividad_apiarios[
                apiario_id_colmena
            ]["colmenas"] += 1

    for mantenimiento in mantenimientos:
        apiario = obtener_apiario_mantenimiento(
            mantenimiento
        )

        if (
            apiario
            and apiario.pk in actividad_apiarios
        ):
            actividad_apiarios[
                apiario.pk
            ]["mantenimientos"] += 1

    for incidencia in incidencias:
        apiario = obtener_apiario_incidencia(
            incidencia
        )

        if (
            apiario
            and apiario.pk in actividad_apiarios
        ):
            actividad_apiarios[
                apiario.pk
            ]["incidencias"] += 1

    for evento in eventos:
        apiario = obtener_apiario_evento(
            evento
        )

        if (
            apiario
            and apiario.pk in actividad_apiarios
        ):
            actividad_apiarios[
                apiario.pk
            ]["eventos"] += 1

    detalle_apiarios = []

    for detalle in actividad_apiarios.values():
        detalle["actividad_total"] = (
            detalle["mantenimientos"]
            + detalle["incidencias"]
            + detalle["eventos"]
        )

        detalle_apiarios.append(
            detalle
        )

    detalle_apiarios.sort(
        key=lambda elemento: (
            -elemento["actividad_total"],
            elemento["nombre"].lower()
        )
    )

    # ========================================================
    # ACTIVIDAD POR APICULTOR
    # ========================================================

    datos_apicultores = {}

    def asegurar_apicultor(apicultor):
        if not apicultor:
            return None

        if apicultor.pk not in datos_apicultores:
            datos_apicultores[
                apicultor.pk
            ] = crear_detalle_apicultor(
                apicultor
            )

        return datos_apicultores[
            apicultor.pk
        ]

    for mantenimiento in mantenimientos:
        apiario = obtener_apiario_mantenimiento(
            mantenimiento
        )

        apicultor = (
            apiario.id_apicultor
            if apiario
            else None
        )

        detalle = asegurar_apicultor(
            apicultor
        )

        if detalle:
            detalle["mantenimientos"] += 1

    for incidencia in incidencias:
        apicultor = obtener_apicultor_incidencia(
            incidencia
        )

        detalle = asegurar_apicultor(
            apicultor
        )

        if detalle:
            detalle["incidencias"] += 1

    for evento in eventos:
        detalle = asegurar_apicultor(
            evento.responsable
        )

        if detalle:
            detalle["eventos"] += 1

    for registro in registros_laborales:
        detalle = asegurar_apicultor(
            registro.apicultor
        )

        if not detalle:
            continue

        detalle["dias_trabajados"] += (
            registro.dias_trabajados_mes
            or 0
        )

        detalle["horas_trabajadas"] += (
            registro.horas_trabajadas_mes
            or Decimal("0")
        )

    detalle_apicultores = []

    for detalle in datos_apicultores.values():
        detalle["actividad_total"] = (
            detalle["mantenimientos"]
            + detalle["incidencias"]
            + detalle["eventos"]
        )

        detalle["horas_trabajadas"] = round(
            detalle["horas_trabajadas"],
            1
        )

        detalle_apicultores.append(
            detalle
        )

    detalle_apicultores.sort(
        key=lambda elemento: (
            -elemento["actividad_total"],
            -float(elemento["horas_trabajadas"]),
            elemento["nombre"].lower()
        )
    )

    total_apicultores = len(
        detalle_apicultores
    )

    total_dias = sum(
        detalle["dias_trabajados"]
        for detalle in detalle_apicultores
    )

    total_horas = round(
        sum(
            (
                detalle["horas_trabajadas"]
                for detalle
                in detalle_apicultores
            ),
            Decimal("0")
        ),
        1
    )

    # ========================================================
    # TENDENCIA DE ACTIVIDAD
    # ========================================================

    actividad_por_fecha = defaultdict(
        int
    )

    for mantenimiento in mantenimientos:
        if mantenimiento.fechaejecucion:
            actividad_por_fecha[
                mantenimiento.fechaejecucion
            ] += 1

    for incidencia in incidencias:
        if incidencia.fechadeteccion:
            actividad_por_fecha[
                incidencia.fechadeteccion
            ] += 1

    for evento in eventos:
        if evento.fecha:
            actividad_por_fecha[
                evento.fecha
            ] += 1

    etiquetas_tendencia = []
    valores_tendencia = []

    if (
        fecha_desde
        and fecha_hasta
        and (
            fecha_hasta - fecha_desde
        ).days <= 45
    ):
        fecha_actual = fecha_desde

        while fecha_actual <= fecha_hasta:
            etiquetas_tendencia.append(
                fecha_actual.strftime(
                    "%d/%m"
                )
            )

            valores_tendencia.append(
                actividad_por_fecha[
                    fecha_actual
                ]
            )

            fecha_actual += timedelta(
                days=1
            )

    else:
        actividad_por_mes = defaultdict(
            int
        )

        for fecha, cantidad in (
            actividad_por_fecha.items()
        ):
            clave_mes = fecha.strftime(
                "%Y-%m"
            )

            actividad_por_mes[
                clave_mes
            ] += cantidad

        for clave_mes in sorted(
            actividad_por_mes.keys()
        ):
            anio, mes = clave_mes.split("-")

            etiquetas_tendencia.append(
                f"{mes}/{anio}"
            )

            valores_tendencia.append(
                actividad_por_mes[
                    clave_mes
                ]
            )

    # ========================================================
    # COMPARACIÓN CON PERIODO ANTERIOR
    # ========================================================

    periodo_anterior_desde = None
    periodo_anterior_hasta = None
    total_periodo_anterior = None
    variacion_periodo = None

    if (
        comparar_periodo_anterior
        and fecha_desde
        and fecha_hasta
    ):
        duracion_periodo = (
            fecha_hasta - fecha_desde
        ).days + 1

        periodo_anterior_hasta = (
            fecha_desde
            - timedelta(days=1)
        )

        periodo_anterior_desde = (
            periodo_anterior_hasta
            - timedelta(
                days=duracion_periodo - 1
            )
        )

        total_periodo_anterior = (
            contar_actividad_periodo(
                fecha_desde=(
                    periodo_anterior_desde
                ),
                fecha_hasta=(
                    periodo_anterior_hasta
                ),
                apiario_id=apiario_id
            )
        )

        if total_periodo_anterior > 0:
            variacion_periodo = round(
                (
                    total_actividad
                    - total_periodo_anterior
                )
                * 100
                / total_periodo_anterior,
                1
            )

        elif total_actividad > 0:
            variacion_periodo = 100

        else:
            variacion_periodo = 0

    # ========================================================
    # GRÁFICOS
    # ========================================================

    grafico_estado_colmenas = None
    grafico_actividad = None
    grafico_apiarios = None
    grafico_tendencia = None
    grafico_horas = None

    if incluir_graficos:
        if total_colmenas > 0:
            grafico_estado_colmenas = (
                generar_grafico_dona(
                    etiquetas=[
                        "Activas",
                        "En seguimiento",
                        "Inactivas",
                    ],
                    valores=[
                        colmenas_activas,
                        colmenas_seguimiento,
                        colmenas_inactivas,
                    ],
                    titulo=(
                        "Estado general de las colmenas"
                    )
                )
            )

        if total_actividad > 0:
            grafico_actividad = (
                generar_grafico_dona(
                    etiquetas=[
                        "Mantenimientos",
                        "Incidencias",
                        "Eventos",
                    ],
                    valores=[
                        total_mantenimientos,
                        total_incidencias,
                        total_eventos,
                    ],
                    titulo=(
                        "Distribución de actividades"
                    )
                )
            )

        ranking_apiarios = [
            detalle
            for detalle in detalle_apiarios
            if detalle["actividad_total"] > 0
        ][:10]

        if ranking_apiarios:
            grafico_apiarios = (
                generar_grafico_barras_colores(
                    etiquetas=[
                        abreviar(
                            detalle["nombre"]
                        )
                        for detalle
                        in ranking_apiarios
                    ],
                    valores=[
                        detalle["actividad_total"]
                        for detalle
                        in ranking_apiarios
                    ],
                    titulo=(
                        "Actividad por apiario"
                    ),
                    etiqueta_eje_y="Registros"
                )
            )

        if (
            etiquetas_tendencia
            and sum(valores_tendencia) > 0
        ):
            grafico_tendencia = (
                generar_grafico_linea(
                    etiquetas=(
                        etiquetas_tendencia
                    ),
                    valores=(
                        valores_tendencia
                    ),
                    titulo=(
                        "Tendencia de actividad"
                    ),
                    etiqueta_eje_y="Registros"
                )
            )

        ranking_horas = sorted(
            [
                detalle
                for detalle
                in detalle_apicultores
                if (
                    detalle["horas_trabajadas"]
                    > 0
                )
            ],
            key=lambda elemento: (
                elemento["horas_trabajadas"]
            ),
            reverse=True
        )[:10]

        if ranking_horas:
            grafico_horas = (
                generar_grafico_barras_colores(
                    etiquetas=[
                        abreviar(
                            detalle["nombre"]
                        )
                        for detalle
                        in ranking_horas
                    ],
                    valores=[
                        float(
                            detalle[
                                "horas_trabajadas"
                            ]
                        )
                        for detalle
                        in ranking_horas
                    ],
                    titulo=(
                        "Horas trabajadas por apicultor"
                    ),
                    etiqueta_eje_y="Horas"
                )
            )

    # ========================================================
    # ANÁLISIS
    # ========================================================

    analisis = generar_analisis_corporativo(
        total_apiarios=total_apiarios,
        total_colmenas=total_colmenas,
        colmenas_activas=colmenas_activas,
        colmenas_seguimiento=(
            colmenas_seguimiento
        ),
        total_actividad=total_actividad,
        total_mantenimientos=(
            total_mantenimientos
        ),
        total_incidencias=total_incidencias,
        total_eventos=total_eventos,
        total_pendientes=total_pendientes,
        incidencias_abiertas=(
            incidencias_abiertas
        ),
        total_horas=total_horas,
        porcentaje_colmenas_activas=(
            porcentaje_colmenas_activas
        ),
        variacion_periodo=variacion_periodo,
    )

    generado_por = (
        request.user.get_full_name().strip()
        or request.user.username
    )

    # ========================================================
    # CONTEXTO DEL PDF
    # ========================================================

    contexto = {
        "titulo_reporte": (
            "Reporte corporativo"
        ),
        "fecha_generacion": (
            timezone.localtime()
        ),
        "generado_por": generado_por,

        "fecha_desde": fecha_desde,
        "fecha_hasta": fecha_hasta,

        "apiario_nombre": (
            apiario_seleccionado.nombreapiario
            if apiario_seleccionado
            else "Todos los apiarios"
        ),

        "total_apiarios": total_apiarios,
        "apiarios_activos": apiarios_activos,
        "apiarios_inactivos": (
            apiarios_inactivos
        ),

        "total_colmenas": total_colmenas,
        "colmenas_activas": colmenas_activas,
        "colmenas_inactivas": (
            colmenas_inactivas
        ),
        "colmenas_seguimiento": (
            colmenas_seguimiento
        ),
        "porcentaje_colmenas_activas": (
            porcentaje_colmenas_activas
        ),

        "total_actividad": total_actividad,
        "actividades_completadas": (
            actividades_completadas
        ),
        "total_pendientes": total_pendientes,
        "porcentaje_cumplimiento": (
            porcentaje_cumplimiento
        ),

        "total_mantenimientos": (
            total_mantenimientos
        ),
        "mantenimientos_completados": (
            mantenimientos_completados
        ),
        "mantenimientos_pendientes": (
            mantenimientos_pendientes
        ),

        "total_incidencias": (
            total_incidencias
        ),
        "incidencias_cerradas": (
            incidencias_cerradas
        ),
        "incidencias_abiertas": (
            incidencias_abiertas
        ),

        "total_eventos": total_eventos,
        "eventos_completados": (
            eventos_completados
        ),
        "eventos_pendientes": (
            eventos_pendientes
        ),

        "total_apicultores": (
            total_apicultores
        ),
        "total_dias": total_dias,
        "total_horas": total_horas,

        "estados_colmenas": (
            estados_colmenas.items()
        ),
        "detalle_apiarios": (
            detalle_apiarios
        ),
        "detalle_apicultores": (
            detalle_apicultores
        ),

        "mantenimientos": (
            mantenimientos[:25]
        ),
        "incidencias": incidencias[:25],
        "eventos": eventos[:25],

        "grafico_estado_colmenas": (
            grafico_estado_colmenas
        ),
        "grafico_actividad": (
            grafico_actividad
        ),
        "grafico_apiarios": (
            grafico_apiarios
        ),
        "grafico_tendencia": (
            grafico_tendencia
        ),
        "grafico_horas": grafico_horas,

        "incluir_graficos": (
            incluir_graficos
        ),
        "incluir_tabla": incluir_tabla,
        "incluir_resumen": incluir_resumen,
        "incluir_conclusiones": (
            incluir_conclusiones
        ),

        "comparar_periodo_anterior": (
            comparar_periodo_anterior
        ),
        "periodo_anterior_desde": (
            periodo_anterior_desde
        ),
        "periodo_anterior_hasta": (
            periodo_anterior_hasta
        ),
        "total_periodo_anterior": (
            total_periodo_anterior
        ),
        "variacion_periodo": (
            variacion_periodo
        ),
        "variacion_periodo_absoluta": (
            abs(variacion_periodo)
            if variacion_periodo is not None
            else None
        ),

        "conclusion": (
            analisis["conclusion"]
        ),
        "recomendaciones": (
            analisis["recomendaciones"]
        ),
    }

    # ========================================================
    # GENERAR PDF
    # ========================================================

    html = render_to_string(
        (
            "admin_panel/reportes/pdf/"
            "reporte_corporativo.html"
        ),
        contexto
    )

    from weasyprint import HTML

    pdf = HTML(
        string=html,
        base_url=request.build_absolute_uri("/")
    ).write_pdf()

    return {
        "pdf": pdf,
        "total_registros": total_actividad,
        "titulo": "Reporte corporativo",
    }