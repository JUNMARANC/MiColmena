from datetime import date

from django.db.models import Count, Q
from django.template.loader import render_to_string
from django.utils import timezone

from weasyprint import HTML

from dbmicolmena.models import Colmena

from panel_admin.reportes.graficos import (
    generar_grafico_barras,
    generar_grafico_dona,
)


def generar_conclusion(
    total_colmenas,
    distribucion,
    colmenas_atencion
):

    if total_colmenas == 0:

        return (
            "No se encontraron colmenas con los filtros "
            "seleccionados."
        )

    estado_principal = distribucion[0]

    conclusion = (
        f"Se analizaron {total_colmenas} colmenas. "
        f"El estado con mayor presencia es "
        f"“{estado_principal['estado']}”, con "
        f"{estado_principal['total']} registros."
    )

    if colmenas_atencion > 0:

        conclusion += (
            f" Se identificaron {colmenas_atencion} "
            f"colmenas que requieren revisión o seguimiento."
        )

    else:

        conclusion += (
            " No se identificaron estados críticos "
            "dentro de la información consultada."
        )

    return conclusion


def generar_reporte_estado_colmenas_pdf(
    *,
    request,
    fecha_desde=None,
    fecha_hasta=None,
    apiario_id=None,
    incluir_graficos=True,
    incluir_tabla=True,
    incluir_resumen=True,
    incluir_conclusiones=True,
    solo_activas=False
):

    queryset = (
        Colmena.objects
        .select_related("id_apiario")
        .all()
    )

    if fecha_desde:

        queryset = queryset.filter(
            fecharegistro__gte=fecha_desde
        )

    if fecha_hasta:

        queryset = queryset.filter(
            fecharegistro__lte=fecha_hasta
        )

    if apiario_id:

        queryset = queryset.filter(
            id_apiario_id=apiario_id
        )

    if solo_activas:

        queryset = (
            queryset
            .exclude(
                estadocolmena__icontains="muert"
            )
            .exclude(
                estadocolmena__icontains="inactiv"
            )
            .exclude(
                estadocolmena__icontains="baja"
            )
        )

    queryset = queryset.order_by(
        "id_apiario__nombreapiario",
        "codigocolmena"
    )

    total_colmenas = queryset.count()

    distribucion_consulta = (
        queryset
        .values("estadocolmena")
        .annotate(
            total=Count("id_colmena")
        )
        .order_by("-total")
    )

    distribucion = [
        {
            "estado": (
                fila["estadocolmena"]
                or "Sin estado"
            ),
            "total": fila["total"],
        }
        for fila in distribucion_consulta
    ]

    por_apiario_consulta = (
        queryset
        .values(
            "id_apiario__nombreapiario"
        )
        .annotate(
            total=Count("id_colmena")
        )
        .order_by("-total")[:10]
    )

    por_apiario = [
        {
            "apiario": (
                fila[
                    "id_apiario__nombreapiario"
                ]
                or "Sin nombre"
            ),
            "total": fila["total"],
        }
        for fila in por_apiario_consulta
    ]

    filtro_atencion = (
        Q(estadocolmena__icontains="riesgo")
        | Q(estadocolmena__icontains="precauc")
        | Q(estadocolmena__icontains="deficiente")
        | Q(estadocolmena__icontains="muert")
        | Q(estadocolmena__icontains="enferm")
    )

    colmenas_atencion = (
        queryset.filter(
            filtro_atencion
        ).count()
    )

    colmenas_saludables = (
        queryset.filter(
            Q(estadocolmena__icontains="salud")
            | Q(estadocolmena__iexact="bueno")
            | Q(estadocolmena__iexact="activa")
        ).count()
    )

    colmenas_sin_estado = (
        queryset.filter(
            Q(estadocolmena__isnull=True)
            | Q(estadocolmena="")
        ).count()
    )

    grafico_estados = None
    grafico_apiarios = None

    if incluir_graficos:

        grafico_estados = generar_grafico_dona(
            etiquetas=[
                item["estado"]
                for item in distribucion
            ],
            valores=[
                item["total"]
                for item in distribucion
            ],
            titulo="Distribución por estado"
        )

        grafico_apiarios = generar_grafico_barras(
            etiquetas=[
                item["apiario"]
                for item in por_apiario
            ],
            valores=[
                item["total"]
                for item in por_apiario
            ],
            titulo="Colmenas registradas por apiario",
            etiqueta_eje_y="Colmenas"
        )

    conclusion = generar_conclusion(
        total_colmenas,
        distribucion,
        colmenas_atencion
    )

    nombre_responsable = (
        request.user.get_full_name().strip()
        or request.user.username
    )

    contexto = {
        "titulo_reporte": "Reporte de estado de colmenas",
        "fecha_generacion": timezone.localtime(),
        "generado_por": nombre_responsable,

        "fecha_desde": fecha_desde,
        "fecha_hasta": fecha_hasta,

        "total_colmenas": total_colmenas,
        "colmenas_saludables": colmenas_saludables,
        "colmenas_atencion": colmenas_atencion,
        "colmenas_sin_estado": colmenas_sin_estado,

        "distribucion": distribucion,
        "por_apiario": por_apiario,
        "colmenas": queryset,

        "grafico_estados": grafico_estados,
        "grafico_apiarios": grafico_apiarios,

        "incluir_graficos": incluir_graficos,
        "incluir_tabla": incluir_tabla,
        "incluir_resumen": incluir_resumen,
        "incluir_conclusiones": incluir_conclusiones,

        "conclusion": conclusion,
    }

    html = render_to_string(
        "admin_panel/reportes/pdf/estado_colmenas.html",
        contexto
    )

    pdf = HTML(
        string=html,
        base_url=request.build_absolute_uri("/")
    ).write_pdf()

    return {
        "pdf": pdf,
        "total_registros": total_colmenas,
        "titulo": "Reporte de estado de colmenas",
    }