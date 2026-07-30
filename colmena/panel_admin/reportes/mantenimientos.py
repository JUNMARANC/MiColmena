from collections import Counter
from datetime import date, timedelta

from django.db.models import Q
from django.template.loader import render_to_string
from django.utils import timezone

from dbmicolmena.models import Mantenimiento

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
# FUNCIONES AUXILIARES
# ============================================================

def normalizar_texto(valor):
    return str(valor or "").strip().lower()


def es_mantenimiento_completado(estado):

    estado = normalizar_texto(estado)

    palabras_completado = [
        "complet",
        "finaliz",
        "realiz",
        "ejecutad",
        "cerrad",
        "terminad",
    ]

    return any(
        palabra in estado
        for palabra in palabras_completado
    )


def es_mantenimiento_en_proceso(estado):

    estado = normalizar_texto(estado)

    palabras_proceso = [
        "proceso",
        "curso",
        "ejecución",
        "ejecucion",
        "iniciado",
    ]

    return any(
        palabra in estado
        for palabra in palabras_proceso
    )


def es_prioridad_alta(prioridad):

    prioridad = normalizar_texto(prioridad)

    palabras_altas = [
        "alta",
        "crítica",
        "critica",
        "urgente",
        "severa",
        "grave",
    ]

    return any(
        palabra in prioridad
        for palabra in palabras_altas
    )


def nombre_mes(fecha):

    return (
        f"{MESES_CORTOS[fecha.month]} "
        f"{str(fecha.year)[-2:]}"
    )


def obtener_apiario(mantenimiento):

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


def obtener_nombre_apiario(mantenimiento):

    apiario = obtener_apiario(
        mantenimiento
    )

    if not apiario:
        return "Sin apiario"

    return (
        getattr(
            apiario,
            "nombreapiario",
            None
        )
        or f"Apiario {apiario.pk}"
    )


def obtener_codigo_colmena(mantenimiento):

    colmena = getattr(
        mantenimiento,
        "id_colmena",
        None
    )

    if not colmena:
        return "No aplica"

    return (
        getattr(
            colmena,
            "codigocolmena",
            None
        )
        or f"Colmena {colmena.pk}"
    )


# ============================================================
# FILTROS
# ============================================================

def aplicar_filtros(
    queryset,
    fecha_desde=None,
    fecha_hasta=None,
    apiario_id=None,
    solo_pendientes=False
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

    if solo_pendientes:

        estados_completados = (
            Q(estado__icontains="complet")
            | Q(estado__icontains="finaliz")
            | Q(estado__icontains="realiz")
            | Q(estado__icontains="ejecutad")
            | Q(estado__icontains="cerrad")
            | Q(estado__icontains="terminad")
        )

        queryset = queryset.exclude(
            estados_completados
        )

    return queryset


# ============================================================
# CONCLUSIONES
# ============================================================

def generar_analisis(
    total,
    completados,
    pendientes,
    en_proceso,
    prioridades_altas,
    atrasados,
    tipos,
    variacion_periodo=None
):

    if total == 0:

        return {
            "conclusion": (
                "No se encontraron mantenimientos para "
                "los filtros seleccionados."
            ),
            "recomendaciones": [
                (
                    "Verifica las fechas y el apiario "
                    "seleccionado."
                )
            ],
        }

    porcentaje_completados = round(
        completados * 100 / total,
        1
    )

    tipo_principal = (
        tipos.most_common(1)[0]
        if tipos
        else ("Sin tipo", 0)
    )

    conclusion = (
        f"Se analizaron {total} mantenimientos. "
        f"El {porcentaje_completados}% se encuentra completado. "
        f"El tipo más frecuente fue “{tipo_principal[0]}”, "
        f"con {tipo_principal[1]} registros. "
        f"Actualmente existen {pendientes} pendientes "
        f"y {en_proceso} en proceso."
    )

    if atrasados > 0:
        conclusion += (
            f" Se identificaron {atrasados} mantenimientos "
            f"pendientes cuya fecha programada ya pasó."
        )

    if variacion_periodo is not None:

        if variacion_periodo > 0:
            conclusion += (
                f" Frente al periodo anterior se presentó "
                f"un aumento del {abs(variacion_periodo)}%."
            )

        elif variacion_periodo < 0:
            conclusion += (
                f" Frente al periodo anterior se presentó "
                f"una reducción del {abs(variacion_periodo)}%."
            )

        else:
            conclusion += (
                " No hubo variación frente al periodo anterior."
            )

    recomendaciones = []

    if atrasados > 0:
        recomendaciones.append(
            (
                f"Reprogramar o ejecutar los {atrasados} "
                f"mantenimientos que presentan atraso."
            )
        )

    if prioridades_altas > 0:
        recomendaciones.append(
            (
                f"Atender primero los {prioridades_altas} "
                f"mantenimientos de prioridad alta o crítica."
            )
        )

    if pendientes > completados:
        recomendaciones.append(
            (
                "Revisar la capacidad operativa porque los "
                "mantenimientos pendientes superan a los completados."
            )
        )

    if porcentaje_completados < 50:
        recomendaciones.append(
            (
                "Implementar seguimiento semanal para mejorar "
                "el porcentaje de ejecución."
            )
        )

    if not recomendaciones:
        recomendaciones.append(
            (
                "Mantener el seguimiento actual y documentar "
                "las actividades realizadas."
            )
        )

    return {
        "conclusion": conclusion,
        "recomendaciones": recomendaciones,
    }


# ============================================================
# GENERADOR PRINCIPAL
# ============================================================

def generar_reporte_mantenimientos_pdf(
    *,
    request,
    fecha_desde=None,
    fecha_hasta=None,
    apiario_id=None,
    incluir_graficos=True,
    incluir_tabla=True,
    incluir_resumen=True,
    incluir_conclusiones=True,
    solo_pendientes=False,
    comparar_periodo_anterior=False
):

    queryset = (
        Mantenimiento.objects
        .select_related(
            "id_apiario",
            "id_colmena",
            "id_colmena__id_apiario",
        )
        .all()
    )

    queryset = aplicar_filtros(
        queryset,
        fecha_desde=fecha_desde,
        fecha_hasta=fecha_hasta,
        apiario_id=apiario_id,
        solo_pendientes=solo_pendientes
    )

    queryset = queryset.order_by(
        "fechaejecucion",
        "pk"
    )

    mantenimientos = []

    conteo_tipos = Counter()
    conteo_estados = Counter()
    conteo_prioridades = Counter()
    conteo_meses = Counter()

    apiarios_atendidos = set()
    colmenas_atendidas = set()

    completados = 0
    pendientes = 0
    en_proceso = 0
    prioridades_altas = 0
    atrasados = 0

    fecha_actual = timezone.localdate()

    for mantenimiento in queryset:

        fecha = mantenimiento.fechaejecucion

        entidad = (
            mantenimiento.entidadmantenimiento
            or "Sin entidad"
        )

        tipo = (
            mantenimiento.tipo
            or "Sin tipo"
        )

        estado = (
            mantenimiento.estado
            or "Sin estado"
        )

        prioridad = (
            mantenimiento.prioridad
            or "Sin prioridad"
        )

        observaciones = (
            mantenimiento.observaciones
            or "Sin observaciones"
        )

        responsable = (
            mantenimiento.responsable
            or "Sin responsable"
        )

        completado = es_mantenimiento_completado(
            estado
        )

        proceso = (
            not completado
            and es_mantenimiento_en_proceso(
                estado
            )
        )

        pendiente = (
            not completado
            and not proceso
        )

        prioridad_alta = es_prioridad_alta(
            prioridad
        )

        atrasado = bool(
            not completado
            and fecha
            and fecha < fecha_actual
        )

        if completado:
            completados += 1
        elif proceso:
            en_proceso += 1
        else:
            pendientes += 1

        if prioridad_alta:
            prioridades_altas += 1

        if atrasado:
            atrasados += 1

        conteo_tipos[tipo] += 1
        conteo_estados[estado] += 1
        conteo_prioridades[prioridad] += 1

        if fecha:
            conteo_meses[
                (
                    fecha.year,
                    fecha.month
                )
            ] += 1

        apiario = obtener_apiario(
            mantenimiento
        )

        colmena = getattr(
            mantenimiento,
            "id_colmena",
            None
        )

        if apiario:
            apiarios_atendidos.add(
                apiario.pk
            )

        if colmena:
            colmenas_atendidas.add(
                colmena.pk
            )

        mantenimientos.append({
            "id": mantenimiento.pk,
            "fecha": fecha,
            "apiario": obtener_nombre_apiario(
                mantenimiento
            ),
            "colmena": obtener_codigo_colmena(
                mantenimiento
            ),
            "entidad": entidad,
            "tipo": tipo,
            "estado": estado,
            "prioridad": prioridad,
            "observaciones": observaciones,
            "responsable": responsable,
            "completado": completado,
            "en_proceso": proceso,
            "pendiente": pendiente,
            "prioridad_alta": prioridad_alta,
            "atrasado": atrasado,
        })

    total_mantenimientos = len(
        mantenimientos
    )

    # ========================================================
    # COMPARACIÓN CON EL PERIODO ANTERIOR
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

        queryset_anterior = (
            Mantenimiento.objects.all()
        )

        queryset_anterior = aplicar_filtros(
            queryset_anterior,
            fecha_desde=periodo_anterior_desde,
            fecha_hasta=periodo_anterior_hasta,
            apiario_id=apiario_id,
            solo_pendientes=solo_pendientes
        )

        total_periodo_anterior = (
            queryset_anterior.count()
        )

        if total_periodo_anterior > 0:

            variacion_periodo = round(
                (
                    (
                        total_mantenimientos
                        - total_periodo_anterior
                    )
                    / total_periodo_anterior
                )
                * 100,
                1
            )

        elif total_mantenimientos > 0:
            variacion_periodo = 100

        else:
            variacion_periodo = 0

    # ========================================================
    # GRÁFICOS
    # ========================================================

    tipos_principales = (
        conteo_tipos.most_common(7)
    )

    estados_ordenados = (
        conteo_estados.most_common()
    )

    meses_ordenados = sorted(
        conteo_meses.items()
    )[-10:]

    grafico_tipos = None
    grafico_estados = None
    grafico_tendencia = None

    if incluir_graficos:

        grafico_tipos = (
            generar_grafico_barras_colores(
                etiquetas=[
                    nombre
                    for nombre, cantidad
                    in tipos_principales
                ],
                valores=[
                    cantidad
                    for nombre, cantidad
                    in tipos_principales
                ],
                titulo="Mantenimientos por tipo",
                etiqueta_eje_y="Mantenimientos"
            )
        )

        grafico_estados = generar_grafico_dona(
            etiquetas=[
                nombre
                for nombre, cantidad
                in estados_ordenados
            ],
            valores=[
                cantidad
                for nombre, cantidad
                in estados_ordenados
            ],
            titulo="Distribución por estado"
        )

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
            titulo="Tendencia de mantenimientos",
            etiqueta_eje_y="Mantenimientos"
        )

    analisis = generar_analisis(
        total=total_mantenimientos,
        completados=completados,
        pendientes=pendientes,
        en_proceso=en_proceso,
        prioridades_altas=prioridades_altas,
        atrasados=atrasados,
        tipos=conteo_tipos,
        variacion_periodo=variacion_periodo
    )

    generado_por = (
        request.user.get_full_name().strip()
        or request.user.username
    )

    contexto = {
        "titulo_reporte": "Reporte de mantenimientos",
        "fecha_generacion": timezone.localtime(),
        "generado_por": generado_por,

        "fecha_desde": fecha_desde,
        "fecha_hasta": fecha_hasta,
        "solo_pendientes": solo_pendientes,

        "total_mantenimientos": total_mantenimientos,
        "mantenimientos_completados": completados,
        "mantenimientos_pendientes": pendientes,
        "mantenimientos_en_proceso": en_proceso,
        "prioridades_altas": prioridades_altas,
        "mantenimientos_atrasados": atrasados,
        "apiarios_atendidos": len(
            apiarios_atendidos
        ),
        "colmenas_atendidas": len(
            colmenas_atendidas
        ),

        "mantenimientos": mantenimientos,
        "conteo_tipos": tipos_principales,
        "conteo_estados": estados_ordenados,
        "conteo_prioridades": (
            conteo_prioridades.most_common()
        ),

        "grafico_tipos": grafico_tipos,
        "grafico_estados": grafico_estados,
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

    html = render_to_string(
        "admin_panel/reportes/pdf/mantenimientos.html",
        contexto
    )

    from weasyprint import HTML

    pdf = HTML(
        string=html,
        base_url=request.build_absolute_uri("/")
    ).write_pdf()

    return {
        "pdf": pdf,
        "total_registros": total_mantenimientos,
        "titulo": "Reporte de mantenimientos",
    }