import base64

from io import BytesIO

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt


COLORES_MI_COLMENA = [
    "#5f9781",
    "#f6de87",
    "#e99b61",
    "#db7169",
    "#7798b8",
    "#a2b879",
    "#a987b5",
    "#6e7e75",
]


def figura_a_base64(figura):

    salida = BytesIO()

    figura.savefig(
        salida,
        format="png",
        dpi=160,
        bbox_inches="tight",
        transparent=False
    )

    plt.close(figura)

    salida.seek(0)

    return base64.b64encode(
        salida.getvalue()
    ).decode("utf-8")


def generar_grafico_dona(
    etiquetas,
    valores,
    titulo
):

    if not valores or sum(valores) == 0:
        return None

    figura, eje = plt.subplots(
        figsize=(6.2, 4.2)
    )

    colores = [
        COLORES_MI_COLMENA[
            indice % len(COLORES_MI_COLMENA)
        ]
        for indice in range(len(valores))
    ]

    eje.pie(
        valores,
        colors=colores,
        startangle=90,
        autopct=lambda porcentaje: (
            f"{porcentaje:.0f}%"
            if porcentaje >= 4
            else ""
        ),
        pctdistance=0.78,
        wedgeprops={
            "width": 0.42,
            "edgecolor": "#ffffff",
            "linewidth": 1.5,
        },
        textprops={
            "fontsize": 8,
            "color": "#243d32",
        }
    )

    eje.legend(
        etiquetas,
        loc="center left",
        bbox_to_anchor=(1, 0.5),
        frameon=False,
        fontsize=8
    )

    eje.set_title(
        titulo,
        fontsize=12,
        fontweight="bold",
        color="#214f3b",
        pad=12
    )

    eje.axis("equal")

    figura.patch.set_facecolor("#ffffff")

    return figura_a_base64(figura)


def generar_grafico_barras(
    etiquetas,
    valores,
    titulo,
    etiqueta_eje_y="Cantidad"
):

    if not valores or sum(valores) == 0:
        return None

    figura, eje = plt.subplots(
        figsize=(7, 4.2)
    )

    posiciones = range(len(etiquetas))

    barras = eje.bar(
        posiciones,
        valores,
        color="#5f9781",
        width=0.65
    )

    eje.set_xticks(
        list(posiciones)
    )

    eje.set_xticklabels(
        etiquetas,
        rotation=30,
        ha="right",
        fontsize=8
    )

    eje.set_ylabel(
        etiqueta_eje_y,
        fontsize=8,
        color="#53675d"
    )

    eje.set_title(
        titulo,
        fontsize=12,
        fontweight="bold",
        color="#214f3b",
        pad=12
    )

    eje.grid(
        axis="y",
        linestyle="--",
        alpha=0.25
    )

    eje.spines["top"].set_visible(False)
    eje.spines["right"].set_visible(False)
    eje.spines["left"].set_color("#d3dfd8")
    eje.spines["bottom"].set_color("#d3dfd8")

    eje.tick_params(
        axis="y",
        labelsize=8,
        colors="#66766d"
    )

    for barra, valor in zip(
        barras,
        valores
    ):

        eje.text(
            barra.get_x() + barra.get_width() / 2,
            barra.get_height(),
            str(valor),
            ha="center",
            va="bottom",
            fontsize=8,
            color="#214f3b"
        )

    figura.tight_layout()
    figura.patch.set_facecolor("#ffffff")

    return figura_a_base64(figura)


def generar_grafico_barras_colores(
    etiquetas,
    valores,
    titulo,
    etiqueta_eje_y="Cantidad"
):
    if not valores or sum(valores) == 0:
        return None

    figura, eje = plt.subplots(
        figsize=(7, 4.2)
    )

    colores = [
        COLORES_MI_COLMENA[
            indice % len(COLORES_MI_COLMENA)
        ]
        for indice in range(len(valores))
    ]

    posiciones = list(range(len(etiquetas)))

    barras = eje.bar(
        posiciones,
        valores,
        color=colores,
        width=0.65
    )

    eje.set_xticks(posiciones)

    eje.set_xticklabels(
        etiquetas,
        rotation=25,
        ha="right",
        fontsize=8
    )

    eje.set_ylabel(
        etiqueta_eje_y,
        fontsize=8,
        color="#53675d"
    )

    eje.set_title(
        titulo,
        fontsize=12,
        fontweight="bold",
        color="#214f3b",
        pad=12
    )

    eje.grid(
        axis="y",
        linestyle="--",
        alpha=0.25
    )

    eje.spines["top"].set_visible(False)
    eje.spines["right"].set_visible(False)
    eje.spines["left"].set_color("#d3dfd8")
    eje.spines["bottom"].set_color("#d3dfd8")

    eje.tick_params(
        axis="y",
        labelsize=8,
        colors="#66766d"
    )

    for barra, valor in zip(barras, valores):
        eje.text(
            barra.get_x() + barra.get_width() / 2,
            barra.get_height(),
            str(valor),
            ha="center",
            va="bottom",
            fontsize=8,
            color="#214f3b"
        )

    figura.tight_layout()
    figura.patch.set_facecolor("#ffffff")

    return figura_a_base64(figura)

def generar_grafico_linea(
    etiquetas,
    valores,
    titulo,
    etiqueta_eje_y="Cantidad"
):
    if not valores or sum(valores) == 0:
        return None

    figura, eje = plt.subplots(
        figsize=(7, 4.1)
    )

    posiciones = list(range(len(etiquetas)))

    eje.plot(
        posiciones,
        valores,
        color="#214f3b",
        linewidth=2.3,
        marker="o",
        markersize=6,
        markerfacecolor="#f6de87",
        markeredgecolor="#214f3b"
    )

    eje.fill_between(
        posiciones,
        valores,
        color="#cfe6d7",
        alpha=0.45
    )

    eje.set_xticks(posiciones)

    eje.set_xticklabels(
        etiquetas,
        fontsize=8
    )

    eje.set_ylabel(
        etiqueta_eje_y,
        fontsize=8,
        color="#53675d"
    )

    eje.set_title(
        titulo,
        fontsize=12,
        fontweight="bold",
        color="#214f3b",
        pad=12
    )

    eje.grid(
        axis="y",
        linestyle="--",
        alpha=0.25
    )

    eje.spines["top"].set_visible(False)
    eje.spines["right"].set_visible(False)
    eje.spines["left"].set_color("#d3dfd8")
    eje.spines["bottom"].set_color("#d3dfd8")

    eje.tick_params(
        axis="y",
        labelsize=8,
        colors="#66766d"
    )

    for posicion, valor in zip(posiciones, valores):
        eje.annotate(
            str(valor),
            (posicion, valor),
            textcoords="offset points",
            xytext=(0, 7),
            ha="center",
            fontsize=8,
            color="#214f3b"
        )

    figura.tight_layout()
    figura.patch.set_facecolor("#ffffff")

    return figura_a_base64(figura)