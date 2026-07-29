import unicodedata
from collections import Counter
from datetime import date, datetime, timedelta

from django.core.exceptions import FieldDoesNotExist, ImproperlyConfigured
from django.db import models
from django.db.models import Q
from django.template.loader import render_to_string
from django.utils import timezone

from dbmicolmena.models import Incidencia
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
# CONFIGURACIÓN DE CAMPOS DEL MODELO INCIDENCIA
# ============================================================


def resolver_campo(modelo, candidatos, obligatorio=True):
    for nombre in candidatos:
        try:
            modelo._meta.get_field(nombre)
            return nombre
        except FieldDoesNotExist:
            continue

    if obligatorio:
        raise ImproperlyConfigured(
            (
                f"No se encontró ninguno de estos campos en "
                f"{modelo.__name__}: {', '.join(candidatos)}"
            )
        )

    return None


CAMPO_FECHA = resolver_campo(
    Incidencia,
    ["fechadeteccion", "fecha_deteccion", "fecha"],
)

CAMPO_TIPO = resolver_campo(
    Incidencia,
    ["entidadincidencia", "tipo_incidencia", "tipo", "titulo"],
)

CAMPO_TITULO = resolver_campo(
    Incidencia,
    ["titulo", "nombre", "asunto"],
    obligatorio=False,
)

CAMPO_PRIORIDAD = resolver_campo(
    Incidencia,
    ["prioridad", "severidad"],
)

CAMPO_ESTADO = resolver_campo(
    Incidencia,
    ["estado", "estadoincidencia"],
)

CAMPO_DESCRIPCION = resolver_campo(
    Incidencia,
    ["observaciones", "descripcion", "descripción"],
    obligatorio=False,
)


# ============================================================
# FUNCIONES AUXILIARES
# ============================================================


def normalizar_texto(valor):
    texto = str(valor or "").strip().lower()

    return "".join(
        caracter
        for caracter in unicodedata.normalize("NFD", texto)
        if unicodedata.category(caracter) != "Mn"
    )


def obtener_valor(objeto, nombre_campo, defecto=""):
    if not nombre_campo:
        return defecto

    valor = getattr(objeto, nombre_campo, defecto)

    if valor is None:
        return defecto

    return valor


def representar_objeto(valor, defecto="Sin registrar"):
    if valor in (None, ""):
        return defecto

    return str(valor)


def obtener_apiario(incidencia):
    apiario = getattr(incidencia, "id_apiario", None)

    if apiario:
        return apiario

    colmena = getattr(incidencia, "id_colmena", None)

    if colmena:
        return getattr(colmena, "id_apiario", None)

    return None


def obtener_nombre_apiario(incidencia):
    apiario = obtener_apiario(incidencia)

    if not apiario:
        return "Sin apiario"

    return (
        getattr(apiario, "nombreapiario", None)
        or getattr(apiario, "nombre_apiario", None)
        or f"Apiario {apiario.pk}"
    )


def obtener_codigo_colmena(incidencia):
    colmena = getattr(incidencia, "id_colmena", None)

    if not colmena:
        return "Sin colmena"

    return (
        getattr(colmena, "codigocolmena", None)
        or getattr(colmena, "codigo_colmena", None)
        or f"Colmena {colmena.pk}"
    )


def obtener_nombre_persona(persona):
    if not persona:
        return ""

    usuario = getattr(persona, "user", None)

    if usuario:
        nombre = usuario.get_full_name().strip()
        return nombre or usuario.username

    nombre_completo = getattr(persona, "nombre_completo", None)

    if callable(nombre_completo):
        try:
            nombre = nombre_completo()
            if nombre:
                return str(nombre)
        except TypeError:
            pass

    return str(persona).strip()


def obtener_nombre_responsable(incidencia):
    responsable = getattr(incidencia, "responsable", None)

    if responsable not in (None, ""):
        nombre = obtener_nombre_persona(responsable)

        if nombre:
            return nombre

    apicultor = getattr(incidencia, "id_apicultor", None)
    nombre_apicultor = obtener_nombre_persona(apicultor)

    return nombre_apicultor or "Sin responsable"


def es_incidencia_cerrada(estado):
    estado_normalizado = normalizar_texto(estado)

    palabras_cerradas = [
        "cerrad",
        "resuelt",
        "complet",
        "finaliz",
        "solucion",
        "atendid",
    ]

    return any(
        palabra in estado_normalizado
        for palabra in palabras_cerradas
    )


def es_prioridad_alta(prioridad):
    prioridad_normalizada = normalizar_texto(prioridad)

    palabras_altas = [
        "alta",
        "critica",
        "urgente",
        "severa",
        "grave",
    ]

    return any(
        palabra in prioridad_normalizada
        for palabra in palabras_altas
    )


def nombre_mes(fecha):
    return f"{MESES_CORTOS[fecha.month]} {str(fecha.year)[-2:]}"


def campo_fecha_es_datetime():
    campo = Incidencia._meta.get_field(CAMPO_FECHA)
    return isinstance(campo, models.DateTimeField)


def obtener_relaciones_select_related():
    relaciones = []

    for nombre in (
        "id_apiario",
        "id_colmena",
        "id_apicultor",
        "responsable",
    ):
        try:
            campo = Incidencia._meta.get_field(nombre)
        except FieldDoesNotExist:
            continue

        if campo.is_relation and (campo.many_to_one or campo.one_to_one):
            relaciones.append(nombre)

            modelo_relacionado = campo.related_model

            if nombre == "id_apicultor" and modelo_relacionado:
                try:
                    campo_user = modelo_relacionado._meta.get_field("user")
                except FieldDoesNotExist:
                    campo_user = None

                if (
                    campo_user
                    and campo_user.is_relation
                    and (campo_user.many_to_one or campo_user.one_to_one)
                ):
                    relaciones.append("id_apicultor__user")

    return relaciones


def sumar_meses(fecha, cantidad):
    numero_mes = fecha.month - 1 + cantidad
    anio = fecha.year + numero_mes // 12
    mes = numero_mes % 12 + 1

    return date(anio, mes, 1)


def construir_tendencia_mensual(
    conteo_meses,
    fecha_desde=None,
    fecha_hasta=None,
    limite=8,
):
    fin = (fecha_hasta or timezone.localdate()).replace(day=1)

    if fecha_desde:
        inicio = fecha_desde.replace(day=1)
    elif conteo_meses:
        primer_anio, primer_mes = min(conteo_meses.keys())
        inicio = date(primer_anio, primer_mes, 1)
    else:
        inicio = sumar_meses(fin, -(limite - 1))

    inicio_minimo = sumar_meses(fin, -(limite - 1))

    if inicio < inicio_minimo:
        inicio = inicio_minimo

    periodos = []
    periodo = inicio

    while periodo <= fin:
        periodos.append(periodo)
        periodo = sumar_meses(periodo, 1)

    return [
        {
            "fecha": periodo,
            "etiqueta": nombre_mes(periodo),
            "total": conteo_meses.get(
                (periodo.year, periodo.month),
                0,
            ),
        }
        for periodo in periodos
    ]


# ============================================================
# FILTROS
# ============================================================


def aplicar_filtros(
    queryset,
    fecha_desde=None,
    fecha_hasta=None,
    apiario_id=None,
    solo_abiertas=False,
):
    if fecha_desde:
        lookup = (
            f"{CAMPO_FECHA}__date__gte"
            if campo_fecha_es_datetime()
            else f"{CAMPO_FECHA}__gte"
        )

        queryset = queryset.filter(**{lookup: fecha_desde})

    if fecha_hasta:
        lookup = (
            f"{CAMPO_FECHA}__date__lte"
            if campo_fecha_es_datetime()
            else f"{CAMPO_FECHA}__lte"
        )

        queryset = queryset.filter(**{lookup: fecha_hasta})

    if apiario_id:
        try:
            campo_apiario = Incidencia._meta.get_field("id_apiario")
        except FieldDoesNotExist:
            campo_apiario = None

        if campo_apiario and campo_apiario.is_relation:
            queryset = queryset.filter(id_apiario_id=apiario_id)
        else:
            queryset = queryset.filter(
                id_colmena__id_apiario_id=apiario_id
            )

    if solo_abiertas:
        estados_cerrados = Q()

        for palabra in (
            "cerr",
            "resuelt",
            "complet",
            "finaliz",
            "solucion",
            "atendid",
        ):
            estados_cerrados |= Q(
                **{
                    f"{CAMPO_ESTADO}__icontains": palabra,
                }
            )

        queryset = queryset.exclude(estados_cerrados)

    return queryset


# ============================================================
# CONCLUSIÓN Y RECOMENDACIONES
# ============================================================


def generar_analisis(
    total,
    abiertas,
    cerradas,
    altas,
    tipos,
    prioridades,
    variacion=None,
):
    if total == 0:
        return {
            "conclusion": (
                "No se encontraron incidencias para los "
                "filtros seleccionados."
            ),
            "recomendaciones": [
                "Verifica el periodo y los filtros seleccionados."
            ],
        }

    tipo_principal = (
        tipos.most_common(1)[0]
        if tipos
        else ("Sin tipo", 0)
    )

    prioridad_principal = (
        prioridades.most_common(1)[0]
        if prioridades
        else ("Sin prioridad", 0)
    )

    porcentaje_abiertas = round(abiertas * 100 / total, 1)

    conclusion = (
        f"Se analizaron {total} incidencias. "
        f"El tipo más frecuente fue “{tipo_principal[0]}”, "
        f"con {tipo_principal[1]} registros. "
        f"La prioridad predominante fue "
        f"“{prioridad_principal[0]}”. "
        f"El {porcentaje_abiertas}% de las incidencias "
        f"permanece abierto."
    )

    if variacion is not None:
        if variacion > 0:
            conclusion += (
                f" Frente al periodo anterior se presentó "
                f"un aumento del {abs(variacion)}%."
            )
        elif variacion < 0:
            conclusion += (
                f" Frente al periodo anterior se presentó "
                f"una reducción del {abs(variacion)}%."
            )
        else:
            conclusion += (
                " No hubo variación frente al periodo anterior."
            )

    recomendaciones = []

    if altas > 0:
        recomendaciones.append(
            (
                f"Priorizar la atención de las {altas} "
                f"incidencias clasificadas como altas, "
                f"críticas, severas o urgentes."
            )
        )

    if abiertas > cerradas:
        recomendaciones.append(
            (
                "Revisar la carga de incidencias pendientes "
                "y asignar responsables y fechas de cierre."
            )
        )

    if porcentaje_abiertas >= 60:
        recomendaciones.append(
            (
                "Implementar seguimiento semanal porque más "
                "del 60% de las incidencias continúa abierto."
            )
        )

    if not recomendaciones:
        recomendaciones.append(
            (
                "Mantener el seguimiento actual y documentar "
                "las medidas correctivas aplicadas."
            )
        )

    return {
        "conclusion": conclusion,
        "recomendaciones": recomendaciones,
    }


# ============================================================
# GENERADOR PRINCIPAL
# ============================================================


def generar_reporte_incidencias_pdf(
    *,
    request,
    fecha_desde=None,
    fecha_hasta=None,
    apiario_id=None,
    incluir_graficos=True,
    incluir_tabla=True,
    incluir_resumen=True,
    incluir_conclusiones=True,
    solo_abiertas=False,
    comparar_periodo_anterior=False,
):
    relaciones = obtener_relaciones_select_related()

    queryset = Incidencia.objects.all()

    if relaciones:
        queryset = queryset.select_related(*relaciones)

    queryset = aplicar_filtros(
        queryset,
        fecha_desde=fecha_desde,
        fecha_hasta=fecha_hasta,
        apiario_id=apiario_id,
        solo_abiertas=solo_abiertas,
    )

    queryset = queryset.order_by(
        f"-{CAMPO_FECHA}",
        "-pk",
    )

    incidencias = []
    conteo_tipos = Counter()
    conteo_prioridades = Counter()
    conteo_estados = Counter()
    conteo_meses = Counter()
    apiarios_afectados = set()

    abiertas = 0
    cerradas = 0
    prioridades_altas = 0

    for incidencia in queryset:
        fecha = obtener_valor(
            incidencia,
            CAMPO_FECHA,
            None,
        )

        if isinstance(fecha, datetime):
            if timezone.is_aware(fecha):
                fecha = timezone.localtime(fecha)

            fecha = fecha.date()

        tipo = representar_objeto(
            obtener_valor(
                incidencia,
                CAMPO_TIPO,
                "Sin tipo",
            ),
            "Sin tipo",
        )

        titulo = representar_objeto(
            obtener_valor(
                incidencia,
                CAMPO_TITULO,
                "Sin título",
            ),
            "Sin título",
        )

        prioridad = representar_objeto(
            obtener_valor(
                incidencia,
                CAMPO_PRIORIDAD,
                "Sin prioridad",
            ),
            "Sin prioridad",
        )

        estado = representar_objeto(
            obtener_valor(
                incidencia,
                CAMPO_ESTADO,
                "Sin estado",
            ),
            "Sin estado",
        )

        descripcion = representar_objeto(
            obtener_valor(
                incidencia,
                CAMPO_DESCRIPCION,
                "Sin observaciones",
            ),
            "Sin observaciones",
        )

        apiario_objeto = obtener_apiario(incidencia)
        apiario_nombre = obtener_nombre_apiario(incidencia)
        responsable = obtener_nombre_responsable(incidencia)

        cerrada = es_incidencia_cerrada(estado)
        prioridad_alta = es_prioridad_alta(prioridad)

        if cerrada:
            cerradas += 1
        else:
            abiertas += 1

        if prioridad_alta:
            prioridades_altas += 1

        conteo_tipos[tipo] += 1
        conteo_prioridades[prioridad] += 1
        conteo_estados[estado] += 1

        if fecha:
            conteo_meses[(fecha.year, fecha.month)] += 1

        if apiario_objeto:
            apiarios_afectados.add(apiario_objeto.pk)

        incidencias.append(
            {
                "id": incidencia.pk,
                "fecha": fecha,
                "apiario": apiario_nombre,
                "colmena": obtener_codigo_colmena(incidencia),
                "titulo": titulo,
                "tipo": tipo,
                "prioridad": prioridad,
                "estado": estado,
                "descripcion": descripcion,
                "responsable": responsable,
                "es_prioridad_alta": prioridad_alta,
                "esta_cerrada": cerrada,
            }
        )

    total_incidencias = len(incidencias)

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
        cantidad_dias = (fecha_hasta - fecha_desde).days + 1

        periodo_anterior_hasta = fecha_desde - timedelta(days=1)
        periodo_anterior_desde = (
            periodo_anterior_hasta
            - timedelta(days=cantidad_dias - 1)
        )

        queryset_anterior = aplicar_filtros(
            Incidencia.objects.all(),
            fecha_desde=periodo_anterior_desde,
            fecha_hasta=periodo_anterior_hasta,
            apiario_id=apiario_id,
            solo_abiertas=solo_abiertas,
        )

        total_periodo_anterior = queryset_anterior.count()

        if total_periodo_anterior > 0:
            variacion_periodo = round(
                (
                    (
                        total_incidencias
                        - total_periodo_anterior
                    )
                    / total_periodo_anterior
                )
                * 100,
                1,
            )
        elif total_incidencias > 0:
            variacion_periodo = 100.0
        else:
            variacion_periodo = 0.0

    # ========================================================
    # PREPARAR GRÁFICOS
    # ========================================================

    tipos_principales = conteo_tipos.most_common(6)
    prioridades_ordenadas = conteo_prioridades.most_common()
    tendencia_mensual = construir_tendencia_mensual(
        conteo_meses=conteo_meses,
        fecha_desde=fecha_desde,
        fecha_hasta=fecha_hasta,
        limite=8,
    )

    grafico_tipos = None
    grafico_prioridades = None
    grafico_tendencia = None

    if incluir_graficos:
        grafico_tipos = generar_grafico_barras_colores(
            etiquetas=[
                nombre
                for nombre, cantidad in tipos_principales
            ],
            valores=[
                cantidad
                for nombre, cantidad in tipos_principales
            ],
            titulo="Incidencias por tipo",
            etiqueta_eje_y="Incidencias",
        )

        grafico_prioridades = generar_grafico_dona(
            etiquetas=[
                nombre
                for nombre, cantidad in prioridades_ordenadas
            ],
            valores=[
                cantidad
                for nombre, cantidad in prioridades_ordenadas
            ],
            titulo="Distribución por prioridad",
        )

        grafico_tendencia = generar_grafico_linea(
            etiquetas=[
                periodo["etiqueta"]
                for periodo in tendencia_mensual
            ],
            valores=[
                periodo["total"]
                for periodo in tendencia_mensual
            ],
            titulo="Tendencia de incidencias",
            etiqueta_eje_y="Incidencias",
        )

    analisis = generar_analisis(
        total=total_incidencias,
        abiertas=abiertas,
        cerradas=cerradas,
        altas=prioridades_altas,
        tipos=conteo_tipos,
        prioridades=conteo_prioridades,
        variacion=variacion_periodo,
    )

    generado_por = (
        request.user.get_full_name().strip()
        or request.user.username
    )

    contexto = {
        "titulo_reporte": "Reporte de incidencias",
        "fecha_generacion": timezone.localtime(),
        "generado_por": generado_por,
        "fecha_desde": fecha_desde,
        "fecha_hasta": fecha_hasta,
        "total_incidencias": total_incidencias,
        "incidencias_abiertas": abiertas,
        "incidencias_cerradas": cerradas,
        "prioridades_altas": prioridades_altas,
        "apiarios_afectados": len(apiarios_afectados),
        "incidencias": incidencias,
        "conteo_tipos": tipos_principales,
        "conteo_prioridades": prioridades_ordenadas,
        "conteo_estados": conteo_estados.most_common(),
        "tendencia_mensual": tendencia_mensual,
        "grafico_tipos": grafico_tipos,
        "grafico_prioridades": grafico_prioridades,
        "grafico_tendencia": grafico_tendencia,
        "incluir_graficos": incluir_graficos,
        "incluir_tabla": incluir_tabla,
        "incluir_resumen": incluir_resumen,
        "incluir_conclusiones": incluir_conclusiones,
        "solo_abiertas": solo_abiertas,
        "comparar_periodo_anterior": comparar_periodo_anterior,
        "total_periodo_anterior": total_periodo_anterior,
        "variacion_periodo": variacion_periodo,
        "variacion_periodo_absoluta": (
            abs(variacion_periodo)
            if variacion_periodo is not None
            else None
        ),
        "periodo_anterior_desde": periodo_anterior_desde,
        "periodo_anterior_hasta": periodo_anterior_hasta,
        "conclusion": analisis["conclusion"],
        "recomendaciones": analisis["recomendaciones"],
    }

    html = render_to_string(
        "admin_panel/reportes/pdf/incidencias.html",
        contexto,
    )

    from weasyprint import HTML

    pdf = HTML(
        string=html,
        base_url=request.build_absolute_uri("/"),
    ).write_pdf()

    return {
        "pdf": pdf,
        "total_registros": total_incidencias,
        "titulo": "Reporte de incidencias",
    }