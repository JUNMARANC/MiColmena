from collections import Counter
from datetime import date, timedelta
from decimal import Decimal

from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q
from django.template.loader import render_to_string
from django.utils import timezone

from dbmicolmena.models import (
    Apicultor,
    Apiario,
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


MESES_CORTOS = [
    "",
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
]


# ============================================================
# FUNCIONES GENERALES
# ============================================================

def normalizar_texto(valor):
    return str(valor or "").strip().lower()


def nombre_mes(fecha):
    return (
        f"{MESES_CORTOS[fecha.month]} "
        f"{str(fecha.year)[-2:]}"
    )


def abreviar_texto(texto, limite=22):
    texto = str(texto or "").strip()

    if len(texto) <= limite:
        return texto

    return f"{texto[:limite - 3]}..."


def obtener_nombre_apicultor(apicultor):
    usuario = getattr(
        apicultor,
        "user",
        None
    )

    if usuario:
        nombre = usuario.get_full_name().strip()

        if nombre:
            return nombre

        return usuario.username

    return f"Apicultor {apicultor.pk}"


def obtener_correo_apicultor(apicultor):
    usuario = getattr(
        apicultor,
        "user",
        None
    )

    if not usuario:
        return "Sin correo"

    return usuario.email or "Sin correo"


def obtener_apiario_mantenimiento(mantenimiento):
    apiario = getattr(
        mantenimiento,
        "id_apiario",
        None
    )

    if apiario:
        return apiario

    colmena = getattr(
        mantenimiento,
        "id_colmena",
        None
    )

    if colmena:
        return getattr(
            colmena,
            "id_apiario",
            None
        )

    return None


def obtener_apicultor_incidencia(incidencia):
    apicultor = getattr(
        incidencia,
        "id_apicultor",
        None
    )

    if apicultor:
        return apicultor

    apiario = getattr(
        incidencia,
        "id_apiario",
        None
    )

    if apiario:
        return getattr(
            apiario,
            "id_apicultor",
            None
        )

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
            return getattr(
                apiario_colmena,
                "id_apicultor",
                None
            )

    return None


# ============================================================
# CLASIFICACIÓN DE ESTADOS
# ============================================================

def es_estado_completado(estado):
    estado = normalizar_texto(estado)

    palabras = [
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
        for palabra in palabras
    )


def es_incidencia_cerrada(estado):
    estado = normalizar_texto(estado)

    palabras = [
        "cerrad",
        "resuelt",
        "finaliz",
        "solucion",
        "complet",
    ]

    return any(
        palabra in estado
        for palabra in palabras
    )


# ============================================================
# INFORMACIÓN LABORAL
# ============================================================

def obtener_vinculacion(apicultor):
    try:
        return apicultor.vinculacion_laboral
    except ObjectDoesNotExist:
        return None


def obtener_dias_laborales(vinculacion):
    if not vinculacion:
        return "Sin registro"

    dias = []

    campos_dias = [
        ("lunes", "Lun"),
        ("martes", "Mar"),
        ("miercoles", "Mié"),
        ("jueves", "Jue"),
        ("viernes", "Vie"),
        ("sabado", "Sáb"),
        ("domingo", "Dom"),
    ]

    for campo, etiqueta in campos_dias:
        if getattr(vinculacion, campo, False):
            dias.append(etiqueta)

    if not dias:
        return "Sin días asignados"

    return ", ".join(dias)


# ============================================================
# FILTROS DE CONSULTAS
# ============================================================

def filtrar_mantenimientos(
    queryset,
    fecha_desde=None,
    fecha_hasta=None,
    apiario_id=None
):
    if fecha_desde:
        queryset = queryset.filter(
            fechaejecucion__gte=fecha_desde
        )

    if fecha_hasta:
        queryset = queryset.filter(
            fechaejecucion__lte=fecha_hasta
        )

    if apiario_id:
        queryset = queryset.filter(
            Q(id_apiario_id=apiario_id)
            | Q(
                id_colmena__id_apiario_id=apiario_id
            )
        )

    return queryset.distinct()


def filtrar_incidencias(
    queryset,
    fecha_desde=None,
    fecha_hasta=None,
    apiario_id=None
):
    if fecha_desde:
        queryset = queryset.filter(
            fechadeteccion__gte=fecha_desde
        )

    if fecha_hasta:
        queryset = queryset.filter(
            fechadeteccion__lte=fecha_hasta
        )

    if apiario_id:
        queryset = queryset.filter(
            Q(id_apiario_id=apiario_id)
            | Q(
                id_colmena__id_apiario_id=apiario_id
            )
        )

    return queryset.distinct()


def filtrar_eventos(
    queryset,
    fecha_desde=None,
    fecha_hasta=None,
    apiario_id=None
):
    if fecha_desde:
        queryset = queryset.filter(
            fecha__gte=fecha_desde
        )

    if fecha_hasta:
        queryset = queryset.filter(
            fecha__lte=fecha_hasta
        )

    if apiario_id:
        queryset = queryset.filter(
            Q(id_apiario_id=apiario_id)
            | Q(
                id_colmena__id_apiario_id=apiario_id
            )
        )

    return queryset.distinct()


def filtrar_registros_laborales(
    queryset,
    fecha_desde=None,
    fecha_hasta=None
):
    if fecha_desde:
        queryset = queryset.filter(
            mes_reporte__gte=fecha_desde
        )

    if fecha_hasta:
        queryset = queryset.filter(
            mes_reporte__lte=fecha_hasta
        )

    return queryset


# ============================================================
# COMPARACIÓN CON PERIODO ANTERIOR
# ============================================================

def contar_actividad_periodo(
    ids_apicultores,
    fecha_desde,
    fecha_hasta,
    apiario_id=None
):
    mantenimientos = (
        Mantenimiento.objects
        .filter(
            Q(
                id_apiario__id_apicultor_id__in=(
                    ids_apicultores
                )
            )
            | Q(
                id_colmena__id_apiario__id_apicultor_id__in=(
                    ids_apicultores
                )
            )
        )
    )

    mantenimientos = filtrar_mantenimientos(
        mantenimientos,
        fecha_desde=fecha_desde,
        fecha_hasta=fecha_hasta,
        apiario_id=apiario_id
    )

    incidencias = (
        Incidencia.objects
        .filter(
            Q(
                id_apicultor_id__in=ids_apicultores
            )
            | Q(
                id_apiario__id_apicultor_id__in=(
                    ids_apicultores
                )
            )
            | Q(
                id_colmena__id_apiario__id_apicultor_id__in=(
                    ids_apicultores
                )
            )
        )
    )

    incidencias = filtrar_incidencias(
        incidencias,
        fecha_desde=fecha_desde,
        fecha_hasta=fecha_hasta,
        apiario_id=apiario_id
    )

    eventos = (
        EventoAgenda.objects
        .filter(
            responsable_id__in=ids_apicultores
        )
    )

    eventos = filtrar_eventos(
        eventos,
        fecha_desde=fecha_desde,
        fecha_hasta=fecha_hasta,
        apiario_id=apiario_id
    )

    return (
        mantenimientos.count()
        + incidencias.count()
        + eventos.count()
    )


# ============================================================
# ANÁLISIS AUTOMÁTICO
# ============================================================

def generar_analisis(
    detalles,
    total_actividad,
    total_horas,
    total_dias,
    total_pendientes,
    variacion_periodo=None
):
    if not detalles:
        return {
            "conclusion": (
                "No se encontraron apicultores para los "
                "filtros seleccionados."
            ),
            "recomendaciones": [
                (
                    "Verifica el apicultor, el apiario "
                    "y el periodo seleccionado."
                )
            ],
        }

    ordenados = sorted(
        detalles,
        key=lambda item: (
            item["actividad_total"],
            item["horas_trabajadas"]
        ),
        reverse=True
    )

    apicultor_mas_activo = ordenados[0]

    sin_actividad = sum(
        1
        for item in detalles
        if item["actividad_total"] == 0
    )

    sin_registro_laboral = sum(
        1
        for item in detalles
        if item["registros_laborales"] == 0
    )

    conclusion = (
        f"Se analizaron {len(detalles)} apicultores, "
        f"con un total de {total_actividad} actividades "
        f"operativas registradas. "
        f"El apicultor con mayor actividad fue "
        f"“{apicultor_mas_activo['nombre']}”, con "
        f"{apicultor_mas_activo['actividad_total']} registros. "
        f"En los reportes laborales se acumularon "
        f"{total_dias} días y {total_horas} horas trabajadas."
    )

    if total_pendientes > 0:
        conclusion += (
            f" Actualmente existen {total_pendientes} "
            f"actividades o novedades pendientes de cierre."
        )

    if variacion_periodo is not None:
        if variacion_periodo > 0:
            conclusion += (
                f" Frente al periodo anterior, la actividad "
                f"aumentó un {abs(variacion_periodo)}%."
            )

        elif variacion_periodo < 0:
            conclusion += (
                f" Frente al periodo anterior, la actividad "
                f"disminuyó un {abs(variacion_periodo)}%."
            )

        else:
            conclusion += (
                " La actividad no presentó variaciones "
                "frente al periodo anterior."
            )

    recomendaciones = []

    if total_pendientes > 0:
        recomendaciones.append(
            (
                f"Realizar seguimiento a las "
                f"{total_pendientes} actividades, incidencias "
                f"o eventos que continúan pendientes."
            )
        )

    if sin_actividad > 0:
        recomendaciones.append(
            (
                f"Revisar la asignación de funciones de los "
                f"{sin_actividad} apicultores que no registraron "
                f"actividad durante el periodo."
            )
        )

    if sin_registro_laboral > 0:
        recomendaciones.append(
            (
                f"Completar el registro laboral mensual de los "
                f"{sin_registro_laboral} apicultores que no tienen "
                f"días ni horas reportadas."
            )
        )

    if total_horas == 0:
        recomendaciones.append(
            (
                "Registrar las horas trabajadas mensualmente "
                "para facilitar el análisis de carga laboral."
            )
        )

    if not recomendaciones:
        recomendaciones.append(
            (
                "Mantener la distribución actual de actividades "
                "y continuar registrando oportunamente las labores."
            )
        )

    return {
        "conclusion": conclusion,
        "recomendaciones": recomendaciones,
    }


# ============================================================
# GENERADOR PRINCIPAL
# ============================================================

def generar_reporte_actividad_apicultores_pdf(
    *,
    request,
    fecha_desde=None,
    fecha_hasta=None,
    apiario_id=None,
    apicultor_id=None,
    incluir_graficos=True,
    incluir_tabla=True,
    incluir_resumen=True,
    incluir_conclusiones=True,
    comparar_periodo_anterior=False
):
    apicultores_queryset = (
        Apicultor.objects
        .select_related(
            "user",
            "id_rol",
        )
        .all()
    )

    if apicultor_id:
        apicultores_queryset = (
            apicultores_queryset.filter(
                pk=apicultor_id
            )
        )

    if apiario_id:
        apicultores_queryset = (
            apicultores_queryset.filter(
                apiarios__id_apiario=apiario_id
            )
            .distinct()
        )

    apicultores_queryset = (
        apicultores_queryset.order_by(
            "user__first_name",
            "user__last_name",
            "id_apicultor",
        )
    )

    apicultores = list(
        apicultores_queryset
    )

    ids_apicultores = [
        apicultor.pk
        for apicultor in apicultores
    ]

    # ========================================================
    # ESTRUCTURA INICIAL POR APICULTOR
    # ========================================================

    datos = {}

    for apicultor in apicultores:
        vinculacion = obtener_vinculacion(
            apicultor
        )

        datos[apicultor.pk] = {
            "objeto": apicultor,
            "nombre": obtener_nombre_apicultor(
                apicultor
            ),
            "correo": obtener_correo_apicultor(
                apicultor
            ),
            "identificacion": (
                apicultor.identificacion
                or "Sin identificación"
            ),
            "telefono": (
                apicultor.telefono
                or "Sin teléfono"
            ),
            "zona_trabajo": (
                apicultor.zona_trabajo
                or "Sin zona"
            ),
            "experiencia": (
                apicultor.experienciaanios
                or 0
            ),

            "apiarios_ids": set(),
            "colmenas_ids": set(),

            "mantenimientos_total": 0,
            "mantenimientos_completados": 0,
            "mantenimientos_pendientes": 0,

            "incidencias_total": 0,
            "incidencias_cerradas": 0,
            "incidencias_abiertas": 0,

            "eventos_total": 0,
            "eventos_completados": 0,
            "eventos_pendientes": 0,

            "dias_trabajados": 0,
            "horas_trabajadas": Decimal("0"),
            "registros_laborales": 0,

            "fecha_ingreso": (
                vinculacion.fecha_ingreso
                if vinculacion
                else None
            ),
            "dias_laborales": obtener_dias_laborales(
                vinculacion
            ),
            "estado_vinculacion": (
                "Con vinculación"
                if vinculacion
                else "Sin vinculación"
            ),
        }

    if not ids_apicultores:
        return generar_pdf_sin_apicultores(
            request=request,
            fecha_desde=fecha_desde,
            fecha_hasta=fecha_hasta,
            incluir_resumen=incluir_resumen,
            incluir_graficos=incluir_graficos,
            incluir_tabla=incluir_tabla,
            incluir_conclusiones=incluir_conclusiones
        )

    # ========================================================
    # APIARIOS
    # ========================================================

    apiarios_queryset = (
        Apiario.objects
        .filter(
            id_apicultor_id__in=ids_apicultores
        )
    )

    if apiario_id:
        apiarios_queryset = (
            apiarios_queryset.filter(
                pk=apiario_id
            )
        )

    for apiario in apiarios_queryset:
        apicultor_pk = apiario.id_apicultor_id

        if apicultor_pk in datos:
            datos[apicultor_pk][
                "apiarios_ids"
            ].add(apiario.pk)

    # ========================================================
    # COLMENAS
    # ========================================================

    colmenas_queryset = (
        Colmena.objects
        .select_related(
            "id_apiario",
            "id_apiario__id_apicultor",
        )
        .filter(
            id_apiario__id_apicultor_id__in=(
                ids_apicultores
            )
        )
    )

    if apiario_id:
        colmenas_queryset = (
            colmenas_queryset.filter(
                id_apiario_id=apiario_id
            )
        )

    for colmena in colmenas_queryset:
        apicultor_pk = (
            colmena.id_apiario.id_apicultor_id
        )

        if apicultor_pk in datos:
            datos[apicultor_pk][
                "colmenas_ids"
            ].add(colmena.pk)

    # ========================================================
    # MANTENIMIENTOS
    # ========================================================

    mantenimientos_queryset = (
        Mantenimiento.objects
        .select_related(
            "id_apiario",
            "id_apiario__id_apicultor",
            "id_colmena",
            "id_colmena__id_apiario",
            "id_colmena__id_apiario__id_apicultor",
        )
        .filter(
            Q(
                id_apiario__id_apicultor_id__in=(
                    ids_apicultores
                )
            )
            | Q(
                id_colmena__id_apiario__id_apicultor_id__in=(
                    ids_apicultores
                )
            )
        )
    )

    mantenimientos_queryset = filtrar_mantenimientos(
        mantenimientos_queryset,
        fecha_desde=fecha_desde,
        fecha_hasta=fecha_hasta,
        apiario_id=apiario_id
    )

    conteo_meses_actividad = Counter()

    for mantenimiento in mantenimientos_queryset:
        apiario = obtener_apiario_mantenimiento(
            mantenimiento
        )

        if not apiario:
            continue

        apicultor_pk = apiario.id_apicultor_id

        if apicultor_pk not in datos:
            continue

        datos[apicultor_pk][
            "mantenimientos_total"
        ] += 1

        if es_estado_completado(
            mantenimiento.estado
        ):
            datos[apicultor_pk][
                "mantenimientos_completados"
            ] += 1
        else:
            datos[apicultor_pk][
                "mantenimientos_pendientes"
            ] += 1

        if mantenimiento.fechaejecucion:
            conteo_meses_actividad[
                (
                    mantenimiento.fechaejecucion.year,
                    mantenimiento.fechaejecucion.month
                )
            ] += 1

    # ========================================================
    # INCIDENCIAS
    # ========================================================

    incidencias_queryset = (
        Incidencia.objects
        .select_related(
            "id_apicultor",
            "id_apiario",
            "id_apiario__id_apicultor",
            "id_colmena",
            "id_colmena__id_apiario",
            "id_colmena__id_apiario__id_apicultor",
        )
        .filter(
            Q(
                id_apicultor_id__in=ids_apicultores
            )
            | Q(
                id_apiario__id_apicultor_id__in=(
                    ids_apicultores
                )
            )
            | Q(
                id_colmena__id_apiario__id_apicultor_id__in=(
                    ids_apicultores
                )
            )
        )
    )

    incidencias_queryset = filtrar_incidencias(
        incidencias_queryset,
        fecha_desde=fecha_desde,
        fecha_hasta=fecha_hasta,
        apiario_id=apiario_id
    )

    for incidencia in incidencias_queryset:
        apicultor = obtener_apicultor_incidencia(
            incidencia
        )

        if not apicultor:
            continue

        apicultor_pk = apicultor.pk

        if apicultor_pk not in datos:
            continue

        datos[apicultor_pk][
            "incidencias_total"
        ] += 1

        if es_incidencia_cerrada(
            incidencia.estado
        ):
            datos[apicultor_pk][
                "incidencias_cerradas"
            ] += 1
        else:
            datos[apicultor_pk][
                "incidencias_abiertas"
            ] += 1

        if incidencia.fechadeteccion:
            conteo_meses_actividad[
                (
                    incidencia.fechadeteccion.year,
                    incidencia.fechadeteccion.month
                )
            ] += 1

    # ========================================================
    # EVENTOS DE AGENDA
    # ========================================================

    eventos_queryset = (
        EventoAgenda.objects
        .select_related(
            "responsable",
            "id_apiario",
            "id_colmena",
            "id_colmena__id_apiario",
        )
        .filter(
            responsable_id__in=ids_apicultores
        )
    )

    eventos_queryset = filtrar_eventos(
        eventos_queryset,
        fecha_desde=fecha_desde,
        fecha_hasta=fecha_hasta,
        apiario_id=apiario_id
    )

    for evento in eventos_queryset:
        apicultor_pk = evento.responsable_id

        if apicultor_pk not in datos:
            continue

        datos[apicultor_pk][
            "eventos_total"
        ] += 1

        if es_estado_completado(
            evento.estado
        ):
            datos[apicultor_pk][
                "eventos_completados"
            ] += 1
        else:
            datos[apicultor_pk][
                "eventos_pendientes"
            ] += 1

        if evento.fecha:
            conteo_meses_actividad[
                (
                    evento.fecha.year,
                    evento.fecha.month
                )
            ] += 1

    # ========================================================
    # REGISTROS LABORALES
    # ========================================================

    registros_queryset = (
        RegistroLaboralMensual.objects
        .filter(
            apicultor_id__in=ids_apicultores
        )
    )

    registros_queryset = filtrar_registros_laborales(
        registros_queryset,
        fecha_desde=fecha_desde,
        fecha_hasta=fecha_hasta
    )

    for registro in registros_queryset:
        apicultor_pk = registro.apicultor_id

        if apicultor_pk not in datos:
            continue

        datos[apicultor_pk][
            "dias_trabajados"
        ] += (
            registro.dias_trabajados_mes
            or 0
        )

        datos[apicultor_pk][
            "horas_trabajadas"
        ] += (
            registro.horas_trabajadas_mes
            or Decimal("0")
        )

        datos[apicultor_pk][
            "registros_laborales"
        ] += 1

    # ========================================================
    # CONSOLIDAR RESULTADOS
    # ========================================================

    detalles = []

    for apicultor_pk, detalle in datos.items():
        detalle["apiarios_total"] = len(
            detalle["apiarios_ids"]
        )

        detalle["colmenas_total"] = len(
            detalle["colmenas_ids"]
        )

        detalle["actividad_total"] = (
            detalle["mantenimientos_total"]
            + detalle["incidencias_total"]
            + detalle["eventos_total"]
        )

        detalle["pendientes_total"] = (
            detalle["mantenimientos_pendientes"]
            + detalle["incidencias_abiertas"]
            + detalle["eventos_pendientes"]
        )

        detalle["horas_trabajadas"] = round(
            detalle["horas_trabajadas"],
            1
        )

        detalles.append(detalle)

    detalles.sort(
        key=lambda item: (
            -item["actividad_total"],
            item["nombre"].lower()
        )
    )

    # ========================================================
    # TOTALES GENERALES
    # ========================================================

    total_apiarios = sum(
        detalle["apiarios_total"]
        for detalle in detalles
    )

    total_colmenas = sum(
        detalle["colmenas_total"]
        for detalle in detalles
    )

    total_mantenimientos = sum(
        detalle["mantenimientos_total"]
        for detalle in detalles
    )

    total_incidencias = sum(
        detalle["incidencias_total"]
        for detalle in detalles
    )

    total_eventos = sum(
        detalle["eventos_total"]
        for detalle in detalles
    )

    total_dias = sum(
        detalle["dias_trabajados"]
        for detalle in detalles
    )

    total_horas = sum(
        detalle["horas_trabajadas"]
        for detalle in detalles
    )

    total_pendientes = sum(
        detalle["pendientes_total"]
        for detalle in detalles
    )

    total_actividad = (
        total_mantenimientos
        + total_incidencias
        + total_eventos
    )

    # ========================================================
    # COMPARACIÓN CON PERIODO ANTERIOR
    # ========================================================

    total_periodo_anterior = None
    variacion_periodo = None
    periodo_anterior_desde = None
    periodo_anterior_hasta = None

    if (
        comparar_periodo_anterior
        and fecha_desde
        and fecha_hasta
    ):
        cantidad_dias = (
            fecha_hasta - fecha_desde
        ).days + 1

        periodo_anterior_hasta = (
            fecha_desde - timedelta(days=1)
        )

        periodo_anterior_desde = (
            periodo_anterior_hasta
            - timedelta(
                days=cantidad_dias - 1
            )
        )

        total_periodo_anterior = (
            contar_actividad_periodo(
                ids_apicultores=ids_apicultores,
                fecha_desde=periodo_anterior_desde,
                fecha_hasta=periodo_anterior_hasta,
                apiario_id=apiario_id
            )
        )

        if total_periodo_anterior > 0:
            variacion_periodo = round(
                (
                    (
                        total_actividad
                        - total_periodo_anterior
                    )
                    / total_periodo_anterior
                )
                * 100,
                1
            )

        elif total_actividad > 0:
            variacion_periodo = 100

        else:
            variacion_periodo = 0

    # ========================================================
    # GRÁFICOS
    # ========================================================

    grafico_ranking = None
    grafico_distribucion = None
    grafico_horas = None
    grafico_tendencia = None

    if incluir_graficos:
        ranking = detalles[:10]

        grafico_ranking = (
            generar_grafico_barras_colores(
                etiquetas=[
                    abreviar_texto(
                        item["nombre"]
                    )
                    for item in ranking
                ],
                valores=[
                    item["actividad_total"]
                    for item in ranking
                ],
                titulo="Actividad por apicultor",
                etiqueta_eje_y="Registros"
            )
        )

        grafico_distribucion = generar_grafico_dona(
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
            titulo="Distribución de la actividad"
        )

        ranking_horas = sorted(
            detalles,
            key=lambda item: (
                item["horas_trabajadas"]
            ),
            reverse=True
        )[:10]

        grafico_horas = (
            generar_grafico_barras_colores(
                etiquetas=[
                    abreviar_texto(
                        item["nombre"]
                    )
                    for item in ranking_horas
                ],
                valores=[
                    float(
                        item["horas_trabajadas"]
                    )
                    for item in ranking_horas
                ],
                titulo="Horas trabajadas por apicultor",
                etiqueta_eje_y="Horas"
            )
        )

        meses_ordenados = sorted(
            conteo_meses_actividad.items()
        )[-10:]

        grafico_tendencia = generar_grafico_linea(
            etiquetas=[
                nombre_mes(
                    date(anio, mes, 1)
                )
                for (anio, mes), cantidad
                in meses_ordenados
            ],
            valores=[
                cantidad
                for periodo, cantidad
                in meses_ordenados
            ],
            titulo="Tendencia mensual de actividad",
            etiqueta_eje_y="Registros"
        )

    # ========================================================
    # CONCLUSIÓN
    # ========================================================

    analisis = generar_analisis(
        detalles=detalles,
        total_actividad=total_actividad,
        total_horas=round(total_horas, 1),
        total_dias=total_dias,
        total_pendientes=total_pendientes,
        variacion_periodo=variacion_periodo
    )

    generado_por = (
        request.user.get_full_name().strip()
        or request.user.username
    )

    contexto = {
        "titulo_reporte": (
            "Reporte de actividad de apicultores"
        ),
        "fecha_generacion": timezone.localtime(),
        "generado_por": generado_por,

        "fecha_desde": fecha_desde,
        "fecha_hasta": fecha_hasta,

        "total_apicultores": len(detalles),
        "total_apiarios": total_apiarios,
        "total_colmenas": total_colmenas,
        "total_mantenimientos": total_mantenimientos,
        "total_incidencias": total_incidencias,
        "total_eventos": total_eventos,
        "total_dias": total_dias,
        "total_horas": round(total_horas, 1),
        "total_actividad": total_actividad,
        "total_pendientes": total_pendientes,

        "detalles": detalles,

        "grafico_ranking": grafico_ranking,
        "grafico_distribucion": grafico_distribucion,
        "grafico_horas": grafico_horas,
        "grafico_tendencia": grafico_tendencia,

        "incluir_graficos": incluir_graficos,
        "incluir_tabla": incluir_tabla,
        "incluir_resumen": incluir_resumen,
        "incluir_conclusiones": incluir_conclusiones,

        "comparar_periodo_anterior": (
            comparar_periodo_anterior
        ),
        "total_periodo_anterior": (
            total_periodo_anterior
        ),
        "variacion_periodo": variacion_periodo,
        "variacion_periodo_absoluta": (
            abs(variacion_periodo)
            if variacion_periodo is not None
            else None
        ),
        "periodo_anterior_desde": (
            periodo_anterior_desde
        ),
        "periodo_anterior_hasta": (
            periodo_anterior_hasta
        ),

        "conclusion": analisis["conclusion"],
        "recomendaciones": (
            analisis["recomendaciones"]
        ),
    }

    return renderizar_pdf(
        request=request,
        contexto=contexto,
        total_registros=len(detalles)
    )


# ============================================================
# RENDERIZADO
# ============================================================

def renderizar_pdf(
    *,
    request,
    contexto,
    total_registros
):
    html = render_to_string(
        (
            "admin_panel/reportes/pdf/"
            "actividad_apicultores.html"
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
        "total_registros": total_registros,
        "titulo": (
            "Reporte de actividad de apicultores"
        ),
    }


def generar_pdf_sin_apicultores(
    *,
    request,
    fecha_desde,
    fecha_hasta,
    incluir_resumen,
    incluir_graficos,
    incluir_tabla,
    incluir_conclusiones
):
    generado_por = (
        request.user.get_full_name().strip()
        or request.user.username
    )

    contexto = {
        "titulo_reporte": (
            "Reporte de actividad de apicultores"
        ),
        "fecha_generacion": timezone.localtime(),
        "generado_por": generado_por,
        "fecha_desde": fecha_desde,
        "fecha_hasta": fecha_hasta,

        "total_apicultores": 0,
        "total_apiarios": 0,
        "total_colmenas": 0,
        "total_mantenimientos": 0,
        "total_incidencias": 0,
        "total_eventos": 0,
        "total_dias": 0,
        "total_horas": 0,
        "total_actividad": 0,
        "total_pendientes": 0,

        "detalles": [],

        "grafico_ranking": None,
        "grafico_distribucion": None,
        "grafico_horas": None,
        "grafico_tendencia": None,

        "incluir_graficos": incluir_graficos,
        "incluir_tabla": incluir_tabla,
        "incluir_resumen": incluir_resumen,
        "incluir_conclusiones": incluir_conclusiones,

        "comparar_periodo_anterior": False,
        "total_periodo_anterior": None,
        "variacion_periodo": None,
        "variacion_periodo_absoluta": None,

        "conclusion": (
            "No se encontraron apicultores para los "
            "filtros seleccionados."
        ),
        "recomendaciones": [
            (
                "Verifica el apicultor, el apiario "
                "y el periodo seleccionado."
            )
        ],
    }

    return renderizar_pdf(
        request=request,
        contexto=contexto,
        total_registros=0
    )
