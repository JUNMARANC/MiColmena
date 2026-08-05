from collections import defaultdict
from datetime import timedelta
from decimal import Decimal

from django.db.models import Q
from django.template.loader import render_to_string
from django.utils import timezone

from dbmicolmena.models import (
    Apiario,
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


MESES = {
    1: "Enero",
    2: "Febrero",
    3: "Marzo",
    4: "Abril",
    5: "Mayo",
    6: "Junio",
    7: "Julio",
    8: "Agosto",
    9: "Septiembre",
    10: "Octubre",
    11: "Noviembre",
    12: "Diciembre",
}


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


def obtener_apicultor_incidencia(incidencia):
    if incidencia.id_apicultor:
        return incidencia.id_apicultor

    if incidencia.id_apiario:
        return incidencia.id_apiario.id_apicultor

    if (
        incidencia.id_colmena
        and incidencia.id_colmena.id_apiario
    ):
        return (
            incidencia.id_colmena
            .id_apiario
            .id_apicultor
        )

    return None


def crear_registro_apicultor(apicultor):
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
            or "Sin zona"
        ),

        "mantenimientos": 0,
        "mantenimientos_completados": 0,
        "mantenimientos_pendientes": 0,

        "incidencias": 0,
        "incidencias_cerradas": 0,
        "incidencias_abiertas": 0,

        "eventos": 0,
        "eventos_completados": 0,
        "eventos_pendientes": 0,

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
# CONCLUSIONES AUTOMÁTICAS
# ============================================================

def generar_analisis(
    *,
    mes_nombre,
    total_actividad,
    total_mantenimientos,
    total_incidencias,
    total_eventos,
    total_pendientes,
    total_horas,
    detalles_apicultores,
    variacion_periodo
):
    if total_actividad == 0 and total_horas == 0:
        return {
            "conclusion": (
                f"Durante {mes_nombre} no se encontraron "
                "actividades operativas ni registros de horas "
                "para los filtros seleccionados."
            ),
            "recomendaciones": [
                (
                    "Verificar que las actividades realizadas "
                    "durante el mes hayan sido registradas."
                ),
                (
                    "Revisar el apiario seleccionado y los "
                    "registros laborales mensuales."
                ),
            ],
        }

    conclusion = (
        f"Durante {mes_nombre} se registraron "
        f"{total_actividad} actividades: "
        f"{total_mantenimientos} mantenimientos, "
        f"{total_incidencias} incidencias y "
        f"{total_eventos} eventos. "
        f"Los registros laborales acumularon "
        f"{total_horas} horas trabajadas."
    )

    apicultores_con_actividad = [
        detalle
        for detalle in detalles_apicultores
        if detalle["actividad_total"] > 0
    ]

    if apicultores_con_actividad:
        apicultor_mas_activo = (
            apicultores_con_actividad[0]
        )

        conclusion += (
            " El apicultor con mayor actividad fue "
            f"“{apicultor_mas_activo['nombre']}”, con "
            f"{apicultor_mas_activo['actividad_total']} "
            "registros."
        )

    if total_pendientes > 0:
        conclusion += (
            f" Al cierre del periodo quedaron "
            f"{total_pendientes} registros pendientes."
        )

    if variacion_periodo is not None:
        if variacion_periodo > 0:
            conclusion += (
                " La actividad aumentó un "
                f"{abs(variacion_periodo)}% frente al "
                "mes anterior."
            )

        elif variacion_periodo < 0:
            conclusion += (
                " La actividad disminuyó un "
                f"{abs(variacion_periodo)}% frente al "
                "mes anterior."
            )

        else:
            conclusion += (
                " La actividad se mantuvo igual frente "
                "al mes anterior."
            )

    recomendaciones = []

    if total_pendientes > 0:
        recomendaciones.append(
            (
                f"Dar seguimiento a los "
                f"{total_pendientes} registros que "
                f"continúan pendientes."
            )
        )

    if total_incidencias > total_mantenimientos:
        recomendaciones.append(
            (
                "Reforzar las acciones preventivas, ya que "
                "las incidencias superaron a los "
                "mantenimientos realizados durante el mes."
            )
        )

    if total_horas == 0:
        recomendaciones.append(
            (
                "Completar los registros mensuales de días "
                "y horas trabajadas."
            )
        )

    apicultores_sin_horas = sum(
        1
        for detalle in detalles_apicultores
        if (
            detalle["actividad_total"] > 0
            and detalle["horas_trabajadas"] == 0
        )
    )

    if apicultores_sin_horas > 0:
        recomendaciones.append(
            (
                f"Registrar las horas de los "
                f"{apicultores_sin_horas} apicultores que "
                f"presentan actividad, pero no tienen horas "
                f"reportadas."
            )
        )

    if not recomendaciones:
        recomendaciones.append(
            (
                "Mantener el registro oportuno de las "
                "actividades y continuar con el seguimiento "
                "mensual."
            )
        )

    return {
        "conclusion": conclusion,
        "recomendaciones": recomendaciones,
    }


# ============================================================
# GENERADOR PRINCIPAL
# ============================================================

def generar_reporte_actividad_mensual_pdf(
    *,
    request,
    fecha_desde,
    fecha_hasta,
    apiario_id=None,
    incluir_graficos=True,
    incluir_tabla=True,
    incluir_resumen=True,
    incluir_conclusiones=True,
    comparar_periodo_anterior=False
):
    if not fecha_desde or not fecha_hasta:
        raise ValueError(
            "El reporte mensual requiere una fecha "
            "inicial y una fecha final."
        )

    mes_nombre = (
        f"{MESES[fecha_desde.month]} "
        f"de {fecha_desde.year}"
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

    # ========================================================
    # MANTENIMIENTOS
    # ========================================================

    mantenimientos = (
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
        .filter(
            fechaejecucion__range=(
                fecha_desde,
                fecha_hasta
            )
        )
    )

    # ========================================================
    # INCIDENCIAS
    # ========================================================

    incidencias = (
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
        .filter(
            fechadeteccion__range=(
                fecha_desde,
                fecha_hasta
            )
        )
    )

    # ========================================================
    # EVENTOS
    # ========================================================

    eventos = (
        EventoAgenda.objects
        .select_related(
            "responsable",
            "responsable__user",
            "id_apiario",
            "id_colmena",
            "id_colmena__id_apiario",
        )
        .filter(
            fecha__range=(
                fecha_desde,
                fecha_hasta
            )
        )
    )

    # ========================================================
    # FILTRO POR APIARIO
    # ========================================================

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

    # ========================================================
    # REGISTROS LABORALES
    # ========================================================

    registros_laborales = (
        RegistroLaboralMensual.objects
        .select_related(
            "apicultor",
            "apicultor__user",
        )
        .filter(
            mes_reporte__year=fecha_desde.year,
            mes_reporte__month=fecha_desde.month,
        )
    )

    if apiario_seleccionado:
        registros_laborales = (
            registros_laborales.filter(
                apicultor_id=(
                    apiario_seleccionado
                    .id_apicultor_id
                )
            )
        )

    # ========================================================
    # CONTADORES
    # ========================================================

    actividad_diaria = defaultdict(
        lambda: {
            "mantenimientos": 0,
            "incidencias": 0,
            "eventos": 0,
        }
    )

    datos_apicultores = {}

    apiarios_atendidos = set()
    colmenas_atendidas = set()

    mantenimientos_completados = 0
    mantenimientos_pendientes = 0

    incidencias_cerradas = 0
    incidencias_abiertas = 0

    eventos_completados = 0
    eventos_pendientes = 0

    def asegurar_apicultor(apicultor):
        if not apicultor:
            return None

        if apicultor.pk not in datos_apicultores:
            datos_apicultores[apicultor.pk] = (
                crear_registro_apicultor(
                    apicultor
                )
            )

        return datos_apicultores[
            apicultor.pk
        ]

    # ========================================================
    # PROCESAR MANTENIMIENTOS
    # ========================================================

    for mantenimiento in mantenimientos:
        if mantenimiento.fechaejecucion:
            actividad_diaria[
                mantenimiento.fechaejecucion
            ]["mantenimientos"] += 1

        completado = es_estado_completado(
            mantenimiento.estado
        )

        if completado:
            mantenimientos_completados += 1
        else:
            mantenimientos_pendientes += 1

        apiario = obtener_apiario_mantenimiento(
            mantenimiento
        )

        if not apiario:
            continue

        apiarios_atendidos.add(
            apiario.pk
        )

        if mantenimiento.id_colmena:
            colmenas_atendidas.add(
                mantenimiento.id_colmena_id
            )

        detalle = asegurar_apicultor(
            apiario.id_apicultor
        )

        if not detalle:
            continue

        detalle["mantenimientos"] += 1

        if completado:
            detalle[
                "mantenimientos_completados"
            ] += 1
        else:
            detalle[
                "mantenimientos_pendientes"
            ] += 1

    # ========================================================
    # PROCESAR INCIDENCIAS
    # ========================================================

    for incidencia in incidencias:
        if incidencia.fechadeteccion:
            actividad_diaria[
                incidencia.fechadeteccion
            ]["incidencias"] += 1

        cerrada = es_incidencia_cerrada(
            incidencia.estado
        )

        if cerrada:
            incidencias_cerradas += 1
        else:
            incidencias_abiertas += 1

        if incidencia.id_apiario:
            apiarios_atendidos.add(
                incidencia.id_apiario_id
            )

        if incidencia.id_colmena:
            colmenas_atendidas.add(
                incidencia.id_colmena_id
            )

            if incidencia.id_colmena.id_apiario:
                apiarios_atendidos.add(
                    incidencia
                    .id_colmena
                    .id_apiario_id
                )

        apicultor = obtener_apicultor_incidencia(
            incidencia
        )

        detalle = asegurar_apicultor(
            apicultor
        )

        if not detalle:
            continue

        detalle["incidencias"] += 1

        if cerrada:
            detalle[
                "incidencias_cerradas"
            ] += 1
        else:
            detalle[
                "incidencias_abiertas"
            ] += 1

    # ========================================================
    # PROCESAR EVENTOS
    # ========================================================

    for evento in eventos:
        if evento.fecha:
            actividad_diaria[
                evento.fecha
            ]["eventos"] += 1

        completado = es_estado_completado(
            evento.estado
        )

        if completado:
            eventos_completados += 1
        else:
            eventos_pendientes += 1

        if evento.id_apiario:
            apiarios_atendidos.add(
                evento.id_apiario_id
            )

        if evento.id_colmena:
            colmenas_atendidas.add(
                evento.id_colmena_id
            )

            if evento.id_colmena.id_apiario:
                apiarios_atendidos.add(
                    evento
                    .id_colmena
                    .id_apiario_id
                )

        detalle = asegurar_apicultor(
            evento.responsable
        )

        if not detalle:
            continue

        detalle["eventos"] += 1

        if completado:
            detalle[
                "eventos_completados"
            ] += 1
        else:
            detalle[
                "eventos_pendientes"
            ] += 1

    # ========================================================
    # PROCESAR REGISTROS LABORALES
    # ========================================================

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

    # ========================================================
    # CONSOLIDAR APICULTORES
    # ========================================================

    detalles_apicultores = []

    for detalle in datos_apicultores.values():
        detalle["actividad_total"] = (
            detalle["mantenimientos"]
            + detalle["incidencias"]
            + detalle["eventos"]
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

        detalles_apicultores.append(
            detalle
        )

    detalles_apicultores.sort(
        key=lambda elemento: (
            -elemento["actividad_total"],
            elemento["nombre"].lower()
        )
    )

    # ========================================================
    # ACTIVIDAD DIARIA
    # ========================================================

    dias_mes = []

    fecha_actual = fecha_desde

    while fecha_actual <= fecha_hasta:
        conteos = actividad_diaria[
            fecha_actual
        ]

        dias_mes.append({
            "fecha": fecha_actual,
            "mantenimientos": (
                conteos["mantenimientos"]
            ),
            "incidencias": (
                conteos["incidencias"]
            ),
            "eventos": conteos["eventos"],
            "total": (
                conteos["mantenimientos"]
                + conteos["incidencias"]
                + conteos["eventos"]
            ),
        })

        fecha_actual += timedelta(
            days=1
        )

    # ========================================================
    # TOTALES
    # ========================================================

    total_mantenimientos = (
        mantenimientos.count()
    )

    total_incidencias = (
        incidencias.count()
    )

    total_eventos = (
        eventos.count()
    )

    total_actividad = (
        total_mantenimientos
        + total_incidencias
        + total_eventos
    )

    total_pendientes = (
        mantenimientos_pendientes
        + incidencias_abiertas
        + eventos_pendientes
    )

    total_dias = sum(
        detalle["dias_trabajados"]
        for detalle in detalles_apicultores
    )

    total_horas = round(
        sum(
            detalle["horas_trabajadas"]
            for detalle in detalles_apicultores
        ),
        1
    )

    actividades_completadas = (
        mantenimientos_completados
        + incidencias_cerradas
        + eventos_completados
    )

    porcentaje_cierre = (
        round(
            actividades_completadas
            * 100
            / total_actividad,
            1
        )
        if total_actividad
        else 0
    )

    total_apicultores_activos = sum(
        1
        for detalle in detalles_apicultores
        if detalle["actividad_total"] > 0
    )

    # ========================================================
    # COMPARACIÓN CON EL MES ANTERIOR
    # ========================================================

    total_periodo_anterior = None
    variacion_periodo = None
    periodo_anterior_desde = None
    periodo_anterior_hasta = None

    if comparar_periodo_anterior:
        periodo_anterior_hasta = (
            fecha_desde
            - timedelta(days=1)
        )

        periodo_anterior_desde = (
            periodo_anterior_hasta.replace(
                day=1
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

    grafico_distribucion = None
    grafico_tendencia = None
    grafico_apicultores = None
    grafico_horas = None

    if incluir_graficos:
        if total_actividad > 0:
            grafico_distribucion = (
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
                        "Distribución de la "
                        "actividad mensual"
                    )
                )
            )

            grafico_tendencia = (
                generar_grafico_linea(
                    etiquetas=[
                        str(dia["fecha"].day)
                        for dia in dias_mes
                    ],
                    valores=[
                        dia["total"]
                        for dia in dias_mes
                    ],
                    titulo=(
                        "Actividad diaria del mes"
                    ),
                    etiqueta_eje_y="Registros"
                )
            )

        ranking_actividad = [
            detalle
            for detalle in detalles_apicultores
            if detalle["actividad_total"] > 0
        ][:10]

        if ranking_actividad:
            grafico_apicultores = (
                generar_grafico_barras_colores(
                    etiquetas=[
                        abreviar(
                            detalle["nombre"]
                        )
                        for detalle
                        in ranking_actividad
                    ],
                    valores=[
                        detalle["actividad_total"]
                        for detalle
                        in ranking_actividad
                    ],
                    titulo=(
                        "Actividad por apicultor"
                    ),
                    etiqueta_eje_y="Registros"
                )
            )

        ranking_horas = sorted(
            [
                detalle
                for detalle
                in detalles_apicultores
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
                        "Horas trabajadas por "
                        "apicultor"
                    ),
                    etiqueta_eje_y="Horas"
                )
            )

    # ========================================================
    # ANÁLISIS
    # ========================================================

    analisis = generar_analisis(
        mes_nombre=mes_nombre,
        total_actividad=total_actividad,
        total_mantenimientos=(
            total_mantenimientos
        ),
        total_incidencias=(
            total_incidencias
        ),
        total_eventos=total_eventos,
        total_pendientes=total_pendientes,
        total_horas=total_horas,
        detalles_apicultores=(
            detalles_apicultores
        ),
        variacion_periodo=(
            variacion_periodo
        ),
    )

    generado_por = (
        request.user.get_full_name().strip()
        or request.user.username
    )

    # ========================================================
    # CONTEXTO
    # ========================================================

    contexto = {
        "titulo_reporte": (
            "Reporte de actividad mensual"
        ),
        "mes_nombre": mes_nombre,
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

        "total_actividad": total_actividad,
        "total_mantenimientos": (
            total_mantenimientos
        ),
        "total_incidencias": (
            total_incidencias
        ),
        "total_eventos": total_eventos,
        "total_pendientes": total_pendientes,

        "mantenimientos_completados": (
            mantenimientos_completados
        ),
        "mantenimientos_pendientes": (
            mantenimientos_pendientes
        ),

        "incidencias_cerradas": (
            incidencias_cerradas
        ),
        "incidencias_abiertas": (
            incidencias_abiertas
        ),

        "eventos_completados": (
            eventos_completados
        ),
        "eventos_pendientes": (
            eventos_pendientes
        ),

        "actividades_completadas": (
            actividades_completadas
        ),
        "porcentaje_cierre": (
            porcentaje_cierre
        ),

        "total_apicultores": (
            total_apicultores_activos
        ),
        "total_apiarios": len(
            apiarios_atendidos
        ),
        "total_colmenas": len(
            colmenas_atendidas
        ),

        "total_dias": total_dias,
        "total_horas": total_horas,

        "dias_mes": dias_mes,
        "detalles_apicultores": (
            detalles_apicultores
        ),

        "grafico_distribucion": (
            grafico_distribucion
        ),
        "grafico_tendencia": (
            grafico_tendencia
        ),
        "grafico_apicultores": (
            grafico_apicultores
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
        "periodo_anterior_desde": (
            periodo_anterior_desde
        ),
        "periodo_anterior_hasta": (
            periodo_anterior_hasta
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
            "actividad_mensual.html"
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
        "titulo": (
            "Reporte de actividad mensual - "
            f"{mes_nombre}"
        ),
    }