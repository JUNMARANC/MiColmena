from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.core.paginator import Paginator
from django.db.models import Q

from dbmicolmena.models import (
    Apicultor,
    Apiario,
    Colmena,
    Mantenimiento,
    Incidencia,
    EventoAgenda,
)


# ============================================================
# DASHBOARD APICULTOR
# ============================================================

@login_required
def dashboard_apicultor(request):

    # ========================================================
    # OBTENER PERFIL DEL APICULTOR
    # ========================================================

    apicultor = (
        Apicultor.objects
        .filter(
            user=request.user
        )
        .first()
    )


    # ========================================================
    # EL USUARIO NO ES APICULTOR
    # ========================================================

    if not apicultor:

        messages.error(
            request,
            "Tu usuario no tiene un perfil "
            "de apicultor asignado."
        )

        return redirect(
            "login"
        )


    # ========================================================
    # APIARIOS DEL APICULTOR
    # ========================================================

    apiarios = (
        Apiario.objects
        .filter(
            id_apicultor=apicultor
        )
    )


    # ========================================================
    # COLMENAS DE SUS APIARIOS
    # ========================================================

    colmenas = (
        Colmena.objects
        .filter(
            id_apiario__in=apiarios
        )
    )


    # ========================================================
    # MANTENIMIENTOS
    # ========================================================

    mantenimientos_pendientes = (
        Mantenimiento.objects
        .filter(
            id_apiario__in=apiarios,
            estado="Pendiente"
        )
        .count()
    )


    # ========================================================
    # INCIDENCIAS
    # ========================================================

    incidencias_abiertas = (
        Incidencia.objects
        .filter(
            id_apiario__in=apiarios
        )
        .exclude(
            estado__iexact="Cerrada"
        )
        .count()
    )


    # ========================================================
    # PRÓXIMOS EVENTOS
    # ========================================================

    proximos_eventos = (
        EventoAgenda.objects
        .filter(
            responsable=apicultor,
            estado="programado"
        )
        .order_by(
            "fecha",
            "hora"
        )[:5]
    )


    # ========================================================
    # CONTEXTO
    # ========================================================

    contexto = {

        "apicultor":
            apicultor,

        "total_apiarios":
            apiarios.count(),

        "total_colmenas":
            colmenas.count(),

        "mantenimientos_pendientes":
            mantenimientos_pendientes,

        "incidencias_abiertas":
            incidencias_abiertas,

        "proximos_eventos":
            proximos_eventos,
    }


    return render(request,"panel_apicultor/dashboard.html",contexto)




# ============================================================
# MIS APIARIOS
# ============================================================

@login_required
def mis_apiarios(request):

    # ========================================================
    # OBTENER APICULTOR AUTENTICADO
    # ========================================================

    apicultor = (
        Apicultor.objects
        .filter(
            user=request.user
        )
        .first()
    )


    # ========================================================
    # VALIDAR PERFIL
    # ========================================================

    if not apicultor:

        messages.error(
            request,
            "Tu usuario no tiene un perfil "
            "de apicultor asignado."
        )

        return redirect(
            "login"
        )


    # ========================================================
    # APIARIOS DEL APICULTOR
    # ========================================================

    apiarios = (
        Apiario.objects
        .filter(
            id_apicultor=apicultor
        )
        .order_by(
            "nombreapiario"
        )
    )


    # ========================================================
    # BUSCADOR
    # ========================================================

    busqueda = (
        request.GET.get(
            "q",
            ""
        )
        .strip()
    )


    if busqueda:

        apiarios = apiarios.filter(

            Q(
                nombreapiario__icontains=
                    busqueda
            )

            |

            Q(
                ubicacion__icontains=
                    busqueda
            )

        )


    # ========================================================
    # FILTRO POR ESTADO
    # ========================================================

    estado = (
        request.GET.get(
            "estado",
            ""
        )
        .strip()
    )


    if estado:

        apiarios = apiarios.filter(
            estadoapiario__iexact=
                estado
        )


    # ========================================================
    # PAGINACIÓN
    # ========================================================

    paginator = Paginator(
        apiarios,
        6
    )


    pagina = request.GET.get(
        "page"
    )


    apiarios_pagina = (
        paginator.get_page(
            pagina
        )
    )


    # ========================================================
    # CONTEXTO
    # ========================================================

    contexto = {

        "apicultor":
            apicultor,

        "apiarios":
            apiarios_pagina,

        "busqueda":
            busqueda,

        "estado_seleccionado":
            estado,

        "total_resultados":
            paginator.count,
    }


    return render(
        request,
        "panel_apicultor/apiarios.html",
        contexto
    )