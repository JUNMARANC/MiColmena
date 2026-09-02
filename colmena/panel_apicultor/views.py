from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect,get_object_or_404
from django.core.paginator import Paginator
from django.db.models import Q
from datetime import datetime
from django.utils import timezone
from django.views.decorators.http import require_POST
from django.urls import reverse


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

# ============================================================
# DETALLE DE APIARIO - APICULTOR
# ============================================================

@login_required
def detalle_apiario_apicultor(
    request,
    id_apiario
):

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
    # OBTENER APIARIO
    #
    # IMPORTANTE:
    # Solo puede consultar apiarios que le pertenezcan.
    # ========================================================

    apiario = get_object_or_404(
        Apiario,
        id_apiario=id_apiario,
        id_apicultor=apicultor
    )


    # ========================================================
    # COLMENAS DEL APIARIO
    # ========================================================

    colmenas = (
        Colmena.objects
        .filter(
            id_apiario=apiario
        )
        .order_by(
            "codigocolmena"
        )
    )


    # ========================================================
    # CONTEO POR ESTADO
    # ========================================================

    colmenas_activas = (
        colmenas
        .filter(
            estadocolmena__iexact="Activa"
        )
        .count()
    )


    colmenas_riesgo = (
        colmenas
        .filter(
            estadocolmena__iexact="Riesgo"
        )
        .count()
    )


    colmenas_revision = (
        colmenas
        .filter(
            estadocolmena__iexact="Revisión"
        )
        .count()
    )


    colmenas_inactivas = (
        colmenas
        .filter(
            estadocolmena__iexact="Inactiva"
        )
        .count()
    )


    # ========================================================
    # PREPARAR INFORMACIÓN DE CADA COLMENA
    # ========================================================

    colmenas_detalle = []


    for colmena in colmenas:

        # ====================================================
        # ÚLTIMO MANTENIMIENTO COMPLETADO
        # ====================================================

        ultimo_mantenimiento = (
            Mantenimiento.objects
            .filter(
                id_colmena=colmena,
                estado="Completado"
            )
            .order_by(
                "-fechaejecucion"
            )
            .first()
        )


        # ====================================================
        # INCIDENCIAS DE LA COLMENA
        #
        # Por ahora contamos las registradas.
        # Después ajustamos aquí cuáles estados
        # consideramos "activas".
        # ====================================================

        total_incidencias = (
            Incidencia.objects
            .filter(
                id_colmena=colmena
            )
            .count()
        )


        colmenas_detalle.append(
            {
                "colmena":
                    colmena,

                "ultimo_mantenimiento":
                    ultimo_mantenimiento,

                "total_incidencias":
                    total_incidencias,
            }
        )


    # ========================================================
    # ÚLTIMA ACTIVIDAD / REVISIÓN DEL APIARIO
    # ========================================================

    ultimo_mantenimiento_apiario = (
        Mantenimiento.objects
        .filter(
            id_apiario=apiario,
            estado="Completado"
        )
        .order_by(
            "-fechaejecucion"
        )
        .first()
    )


    # ========================================================
    # CONTEXTO
    # ========================================================

    contexto = {

        "apicultor":
            apicultor,

        "apiario":
            apiario,

        "colmenas_detalle":
            colmenas_detalle,

        "total_colmenas":
            colmenas.count(),

        "colmenas_activas":
            colmenas_activas,

        "colmenas_riesgo":
            colmenas_riesgo,

        "colmenas_revision":
            colmenas_revision,

        "colmenas_inactivas":
            colmenas_inactivas,

        "ultimo_mantenimiento_apiario":
            ultimo_mantenimiento_apiario,
    }


    return render(
        request,
        "panel_apicultor/detalle_apiario.html",
        contexto
    )


# ============================================================
# MIS COLMENAS - APICULTOR
# ============================================================

@login_required
def mis_colmenas(request):

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
    # COLMENAS
    #
    # IMPORTANTE:
    # Solo pertenecientes a los apiarios del apicultor.
    # ========================================================

    colmenas = (
        Colmena.objects
        .filter(
            id_apiario__in=apiarios
        )
        .select_related(
            "id_apiario"
        )
        .order_by(
            "codigocolmena"
        )
    )


    # ========================================================
    # DATOS GENERALES ANTES DE FILTRAR
    # ========================================================

    total_colmenas = (
        colmenas.count()
    )


    total_activas = (
        colmenas
        .filter(
            estadocolmena__iexact="Activa"
        )
        .count()
    )


    total_revision = (
        colmenas
        .filter(
            estadocolmena__iexact="Revisión"
        )
        .count()
    )


    total_riesgo = (
        colmenas
        .filter(
            estadocolmena__iexact="Riesgo"
        )
        .count()
    )


    total_inactivas = (
        colmenas
        .filter(
            estadocolmena__iexact="Inactiva"
        )
        .count()
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

        colmenas = (
            colmenas.filter(

                Q(
                    codigocolmena__icontains=
                        busqueda
                )

                |

                Q(
                    descripcion__icontains=
                        busqueda
                )

                |

                Q(
                    id_apiario__nombreapiario__icontains=
                        busqueda
                )

            )
        )


    # ========================================================
    # FILTRO POR APIARIO
    # ========================================================

    apiario_seleccionado = (
        request.GET.get(
            "apiario",
            ""
        )
        .strip()
    )


    if apiario_seleccionado.isdigit():

        colmenas = (
            colmenas.filter(
                id_apiario__id_apiario=
                    int(apiario_seleccionado)
            )
        )


    # ========================================================
    # FILTRO POR ESTADO
    # ========================================================

    estado_seleccionado = (
        request.GET.get(
            "estado",
            ""
        )
        .strip()
    )


    estados_permitidos = [
        "Activa",
        "Riesgo",
        "Revisión",
        "Inactiva",
    ]


    if estado_seleccionado in estados_permitidos:

        colmenas = (
            colmenas.filter(
                estadocolmena__iexact=
                    estado_seleccionado
            )
        )


    # ========================================================
    # PAGINACIÓN
    # ========================================================

    paginator = Paginator(
        colmenas,
        8
    )


    numero_pagina = (
        request.GET.get(
            "page"
        )
    )


    colmenas_pagina = (
        paginator.get_page(
            numero_pagina
        )
    )


    # ========================================================
    # DATOS ADICIONALES DE CADA COLMENA
    # ========================================================

    for colmena in colmenas_pagina:

        # Último mantenimiento completado
        colmena.ultimo_mantenimiento = (
            Mantenimiento.objects
            .filter(
                id_colmena=colmena,
                estado="Completado"
            )
            .order_by(
                "-fechaejecucion"
            )
            .first()
        )


        # Incidencias registradas
        colmena.total_incidencias = (
            Incidencia.objects
            .filter(
                id_colmena=colmena
            )
            .count()
        )


    # ========================================================
    # CONTEXTO
    # ========================================================

    contexto = {

        "apicultor":
            apicultor,

        "apiarios":
            apiarios,

        "colmenas":
            colmenas_pagina,

        "total_resultados":
            paginator.count,

        "total_colmenas":
            total_colmenas,

        "total_activas":
            total_activas,

        "total_revision":
            total_revision,

        "total_riesgo":
            total_riesgo,

        "total_inactivas":
            total_inactivas,

        "busqueda":
            busqueda,

        "apiario_seleccionado":
            apiario_seleccionado,

        "estado_seleccionado":
            estado_seleccionado,
    }


    return render(
        request,
        "panel_apicultor/colmenas.html",
        contexto
    )


# ============================================================
# REGISTRAR MANTENIMIENTO - APICULTOR
# ============================================================

@login_required
def registrar_mantenimiento_apicultor(
    request,
    id_colmena
):

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
            "Tu usuario no tiene un perfil de apicultor asignado."
        )

        return redirect(
            "login"
        )


    # ========================================================
    # OBTENER COLMENA
    #
    # SEGURIDAD:
    # solamente puede registrar mantenimientos
    # sobre colmenas pertenecientes a sus apiarios.
    # ========================================================

    colmena = get_object_or_404(
        Colmena,
        id_colmena=id_colmena,
        id_apiario__id_apicultor=apicultor
    )


    # ========================================================
    # APIARIO AUTOMÁTICO
    # ========================================================

    apiario = colmena.id_apiario


    # ========================================================
    # PROCESAR FORMULARIO
    # ========================================================

    if request.method == "POST":

        tipo = (
            request.POST.get(
                "tipo",
                ""
            )
            .strip()
        )


        fecha_ejecucion = (
            request.POST.get(
                "fecha_ejecucion",
                ""
            )
            .strip()
        )


        estado = (
            request.POST.get(
                "estado",
                ""
            )
            .strip()
        )


        prioridad = (
            request.POST.get(
                "prioridad",
                ""
            )
            .strip()
        )


        observaciones = (
            request.POST.get(
                "observaciones",
                ""
            )
            .strip()
        )


        # ====================================================
        # VALIDACIONES
        # ====================================================

        errores = []


        if not tipo:

            errores.append(
                "Debes ingresar el tipo de mantenimiento."
            )


        if len(tipo) > 100:

            errores.append(
                "El tipo de mantenimiento no puede superar los 100 caracteres."
            )


        # ====================================================
        # VALIDAR FECHA
        # ====================================================

        fecha_convertida = None


        if not fecha_ejecucion:

            errores.append(
                "Debes seleccionar la fecha del mantenimiento."
            )

        else:

            try:

                fecha_convertida = (
                    datetime.strptime(
                        fecha_ejecucion,
                        "%Y-%m-%d"
                    )
                    .date()
                )

            except ValueError:

                errores.append(
                    "La fecha del mantenimiento no es válida."
                )


        # ====================================================
        # VALIDAR ESTADO
        # ====================================================

        estados_validos = [
            "Pendiente",
            "Completado",
            "Cancelado",
        ]


        if estado not in estados_validos:

            errores.append(
                "Selecciona un estado válido."
            )


        # ====================================================
        # VALIDAR PRIORIDAD
        # ====================================================

        prioridades_validas = [
            "Baja",
            "Media",
            "Alta",
            "Crítica",
        ]


        if prioridad not in prioridades_validas:

            errores.append(
                "Selecciona una prioridad válida."
            )


        # ====================================================
        # OBSERVACIONES
        # ====================================================

        if len(observaciones) > 1000:

            errores.append(
                "Las observaciones son demasiado extensas."
            )


        # ====================================================
        # MOSTRAR ERRORES
        # ====================================================

        if errores:

            for error in errores:

                messages.error(
                    request,
                    error
                )


        else:

            # =================================================
            # RESPONSABLE
            # =================================================

            responsable = (
                request.user.get_full_name()
                or
                request.user.username
            )


            # =================================================
            # CREAR MANTENIMIENTO
            # =================================================

            Mantenimiento.objects.create(

                id_apiario=
                    apiario,

                id_colmena=
                    colmena,

                entidadmantenimiento=
                    "Colmena",

                tipo=
                    tipo,

                fechaejecucion=
                    fecha_convertida,

                estado=
                    estado,

                prioridad=
                    prioridad,

                observaciones=
                    observaciones,

                responsable=
                    responsable,

            )


            messages.success(
                request,
                "El mantenimiento fue registrado correctamente."
            )


            return redirect(
                "colmenas_apicultor"
            )


    # ========================================================
    # CONTEXTO
    # ========================================================

    contexto = {

        "apicultor":
            apicultor,

        "apiario":
            apiario,

        "colmena":
            colmena,

        "fecha_hoy":
            timezone.localdate().isoformat(),

    }


    return render(
        request,
        "panel_apicultor/registrar_mantenimiento.html",
        contexto
    )



# ============================================================
# ACCESO RÁPIDO
# REPORTAR INCIDENCIA DESDE UNA COLMENA
# ============================================================

@login_required
def reportar_incidencia_apicultor(
    request,
    id_colmena
):

    # ========================================================
    # APICULTOR
    # ========================================================

    apicultor = get_object_or_404(
        Apicultor,
        user=request.user
    )


    # ========================================================
    # VALIDAR QUE LA COLMENA SEA SUYA
    # ========================================================

    colmena = get_object_or_404(

        Colmena,

        id_colmena=id_colmena,

        id_apiario__id_apicultor=apicultor

    )


    # ========================================================
    # REDIRIGIR AL NUEVO FORMULARIO
    #
    # Quedará preseleccionada la colmena.
    # ========================================================

    url = reverse(
        "crear_incidencia_apicultor"
    )


    return redirect(
        f"{url}?colmena={colmena.id_colmena}"
    )



# ============================================================
# MANTENIMIENTOS - PANEL APICULTOR
# ============================================================

@login_required
def mantenimientos_apicultor(request):

    # ========================================================
    # APICULTOR AUTENTICADO
    # ========================================================

    apicultor = (
        Apicultor.objects
        .filter(user=request.user)
        .first()
    )

    if not apicultor:

        messages.error(
            request,
            "Tu usuario no tiene un perfil de apicultor asignado."
        )

        return redirect("login")


    # ========================================================
    # APIARIOS DEL APICULTOR
    # ========================================================

    apiarios = (
        Apiario.objects
        .filter(id_apicultor=apicultor)
        .order_by("nombreapiario")
    )


    # ========================================================
    # CONSULTA BASE
    #
    # Nunca consultamos mantenimientos de otros apicultores.
    # ========================================================

    mantenimientos_base = (
        Mantenimiento.objects
        .filter(
            id_apiario__in=apiarios
        )
        .select_related(
            "id_apiario",
            "id_colmena"
        )
    )


    # ========================================================
    # CONTADORES GENERALES
    #
    # Estos cuentan TODOS, incluso los completados.
    # ========================================================

    total_mantenimientos = (
        mantenimientos_base.count()
    )


    total_pendientes = (
        mantenimientos_base
        .filter(
            estado__iexact="Pendiente"
        )
        .count()
    )


    total_completados = (
        mantenimientos_base
        .filter(
            estado__iexact="Completado"
        )
        .count()
    )


    total_cancelados = (
        mantenimientos_base
        .filter(
            estado__iexact="Cancelado"
        )
        .count()
    )


    # ========================================================
    # FILTROS
    # ========================================================

    busqueda = (
        request.GET.get("q", "")
        .strip()
    )


    apiario_seleccionado = (
        request.GET.get("apiario", "")
        .strip()
    )


    estado_seleccionado = (
        request.GET.get("estado", "")
        .strip()
    )


    prioridad_seleccionada = (
        request.GET.get("prioridad", "")
        .strip()
    )


    # ========================================================
    # CONSULTA QUE SE MOSTRARÁ
    # ========================================================

    mantenimientos = mantenimientos_base


    # ========================================================
    # REGLA PRINCIPAL
    #
    # Si NO hay filtro de estado:
    # ocultamos los completados.
    #
    # Si sí hay filtro:
    # mostramos exactamente el estado solicitado.
    # ========================================================

    estados_validos = [
        "Pendiente",
        "Completado",
        "Cancelado",
    ]


    if estado_seleccionado in estados_validos:

        mantenimientos = (
            mantenimientos
            .filter(
                estado__iexact=
                    estado_seleccionado
            )
        )

    else:

        mantenimientos = (
            mantenimientos
            .exclude(
                estado__iexact="Completado"
            )
        )


    # ========================================================
    # BÚSQUEDA
    # ========================================================

    if busqueda:

        mantenimientos = (
            mantenimientos
            .filter(

                Q(
                    tipo__icontains=
                        busqueda
                )

                |

                Q(
                    responsable__icontains=
                        busqueda
                )

                |

                Q(
                    id_apiario__nombreapiario__icontains=
                        busqueda
                )

                |

                Q(
                    id_colmena__codigocolmena__icontains=
                        busqueda
                )

            )
        )


    # ========================================================
    # FILTRO APIARIO
    # ========================================================

    if apiario_seleccionado.isdigit():

        mantenimientos = (
            mantenimientos
            .filter(
                id_apiario__id_apiario=
                    int(apiario_seleccionado)
            )
        )


    # ========================================================
    # FILTRO PRIORIDAD
    # ========================================================

    prioridades_validas = [
        "Baja",
        "Media",
        "Alta",
        "Crítica",
    ]


    if prioridad_seleccionada in prioridades_validas:

        mantenimientos = (
            mantenimientos
            .filter(
                prioridad__iexact=
                    prioridad_seleccionada
            )
        )


    # ========================================================
    # ORDEN
    # ========================================================

    mantenimientos = (
        mantenimientos
        .order_by(
            "fechaejecucion",
            "-id_mantenimiento"
        )
    )


    # ========================================================
    # PAGINACIÓN
    # ========================================================

    paginator = Paginator(
        mantenimientos,
        10
    )


    numero_pagina = (
        request.GET.get("page")
    )


    mantenimientos_pagina = (
        paginator.get_page(
            numero_pagina
        )
    )


    # ========================================================
    # CONTEXTO
    # ========================================================

    contexto = {

        "apicultor":
            apicultor,

        "apiarios":
            apiarios,

        "mantenimientos":
            mantenimientos_pagina,

        "total_mantenimientos":
            total_mantenimientos,

        "total_pendientes":
            total_pendientes,

        "total_completados":
            total_completados,

        "total_cancelados":
            total_cancelados,

        "total_resultados":
            paginator.count,

        "busqueda":
            busqueda,

        "apiario_seleccionado":
            apiario_seleccionado,

        "estado_seleccionado":
            estado_seleccionado,

        "prioridad_seleccionada":
            prioridad_seleccionada,

        # Para avisar en HTML que estamos
        # viendo la bandeja principal
        "modo_bandeja":
            not bool(estado_seleccionado),

    }


    return render(
        request,
        "panel_apicultor/mantenimientos.html",
        contexto
    )



# ============================================================
# MARCAR MANTENIMIENTO COMO COMPLETADO
# ============================================================

@login_required
@require_POST
def completar_mantenimiento_apicultor(
    request,
    id_mantenimiento
):

    # ========================================================
    # APICULTOR AUTENTICADO
    # ========================================================

    apicultor = get_object_or_404(
        Apicultor,
        user=request.user
    )


    # ========================================================
    # OBTENER MANTENIMIENTO
    #
    # SEGURIDAD:
    # solamente puede modificar mantenimientos pertenecientes
    # a sus propios apiarios.
    # ========================================================

    mantenimiento = get_object_or_404(
        Mantenimiento,
        id_mantenimiento=id_mantenimiento,
        id_apiario__id_apicultor=apicultor
    )


    # ========================================================
    # EVITAR CAMBIOS INNECESARIOS
    # ========================================================

    if mantenimiento.estado == "Completado":

        messages.info(
            request,
            "Este mantenimiento ya estaba completado."
        )

        return redirect(
            "mantenimientos_apicultor"
        )


    # ========================================================
    # MARCAR COMO COMPLETADO
    # ========================================================

    mantenimiento.estado = "Completado"

    mantenimiento.save(
        update_fields=[
            "estado"
        ]
    )


    messages.success(
        request,
        "El mantenimiento fue marcado como completado."
    )


    # ========================================================
    # VOLVER A BANDEJA PRINCIPAL
    #
    # Como la bandeja excluye Completados,
    # desaparecerá automáticamente.
    # ========================================================

    return redirect(
        "mantenimientos_apicultor"
    )


# ============================================================
# ACTUALIZAR OBSERVACIÓN DE MANTENIMIENTO
# ============================================================

@login_required
@require_POST
def actualizar_observacion_mantenimiento_apicultor(
    request,
    id_mantenimiento
):

    # ========================================================
    # APICULTOR AUTENTICADO
    # ========================================================

    apicultor = get_object_or_404(
        Apicultor,
        user=request.user
    )


    # ========================================================
    # MANTENIMIENTO
    #
    # SEGURIDAD:
    # Solo puede modificar mantenimientos de sus apiarios.
    # ========================================================

    mantenimiento = get_object_or_404(
        Mantenimiento,
        id_mantenimiento=id_mantenimiento,
        id_apiario__id_apicultor=apicultor
    )


    # ========================================================
    # OBTENER OBSERVACIÓN
    # ========================================================

    observaciones = (
        request.POST
        .get(
            "observaciones",
            ""
        )
        .strip()
    )


    # ========================================================
    # VALIDAR
    # ========================================================

    if len(observaciones) > 1000:

        messages.error(
            request,
            "La observación no puede superar los 1000 caracteres."
        )

        return redirect(
            "mantenimientos_apicultor"
        )


    # ========================================================
    # GUARDAR
    # ========================================================

    mantenimiento.observaciones = observaciones

    mantenimiento.save(
        update_fields=[
            "observaciones"
        ]
    )


    messages.success(
        request,
        "La observación del mantenimiento fue actualizada correctamente."
    )


    # ========================================================
    # REGRESAR
    # ========================================================

    return redirect(
        "mantenimientos_apicultor"
    )



# ============================================================
# INCIDENCIAS
# PANEL APICULTOR
# ============================================================

@login_required
def incidencias_apicultor(request):

    # ========================================================
    # APICULTOR AUTENTICADO
    # ========================================================

    apicultor = get_object_or_404(
        Apicultor,
        user=request.user
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
    # INCIDENCIAS ASIGNADAS AL APICULTOR
    #
    # id_apicultor representa al apicultor encargado
    # de gestionar la incidencia.
    #
    # Aquí aparecerán:
    #
    # - Las incidencias creadas por él mismo.
    # - Las incidencias asignadas por un administrador.
    # ========================================================

    incidencias_base = (
        Incidencia.objects
        .filter(
            id_apicultor=apicultor
        )
        .select_related(
            "id_apicultor",
            "id_apiario",
            "id_colmena"
        )
    )


    # ========================================================
    # CONTADORES GENERALES
    # ========================================================

    total_incidencias = (
        incidencias_base.count()
    )


    total_pendientes = (
        incidencias_base
        .filter(
            estado__iexact="Pendiente"
        )
        .count()
    )


    total_en_proceso = (
        incidencias_base
        .filter(
            estado__iexact="En proceso"
        )
        .count()
    )


    total_resueltas = (
        incidencias_base
        .filter(
            estado__iexact="Resuelta"
        )
        .count()
    )


    # ========================================================
    # ESTADOS OFICIALES
    # ========================================================

    estados_disponibles = [
        "Pendiente",
        "En proceso",
        "Resuelta",
    ]


    # ========================================================
    # PRIORIDADES OFICIALES
    # ========================================================

    prioridades_disponibles = [
        "Baja",
        "Media",
        "Alta",
        "Crítica",
    ]


    # ========================================================
    # FILTROS GET
    # ========================================================

    busqueda = request.GET.get(
        "q",
        ""
    ).strip()


    apiario_seleccionado = request.GET.get(
        "apiario",
        ""
    ).strip()


    estado_seleccionado = request.GET.get(
        "estado",
        ""
    ).strip()


    prioridad_seleccionada = request.GET.get(
        "prioridad",
        ""
    ).strip()


    # ========================================================
    # CONSULTA PARA FILTRAR
    # ========================================================

    incidencias = incidencias_base


    # ========================================================
    # BUSCADOR
    # ========================================================

    if busqueda:

        incidencias = incidencias.filter(

            Q(
                titulo__icontains=busqueda
            )

            |

            Q(
                observaciones__icontains=busqueda
            )

            |

            Q(
                responsable__icontains=busqueda
            )

            |

            Q(
                entidadincidencia__icontains=busqueda
            )

            |

            Q(
                id_apiario__nombreapiario__icontains=busqueda
            )

            |

            Q(
                id_colmena__codigocolmena__icontains=busqueda
            )

        )


    # ========================================================
    # FILTRO POR APIARIO
    # ========================================================

    if apiario_seleccionado.isdigit():

        incidencias = incidencias.filter(
            id_apiario__id_apiario=int(
                apiario_seleccionado
            )
        )


    # ========================================================
    # FILTRO POR ESTADO
    # ========================================================

    if (
        estado_seleccionado
        and
        estado_seleccionado in estados_disponibles
    ):

        incidencias = incidencias.filter(
            estado__iexact=estado_seleccionado
        )


    # ========================================================
    # FILTRO POR PRIORIDAD
    # ========================================================

    if (
        prioridad_seleccionada
        and
        prioridad_seleccionada in prioridades_disponibles
    ):

        incidencias = incidencias.filter(
            prioridad__iexact=prioridad_seleccionada
        )


    # ========================================================
    # ORDEN
    # ========================================================

    incidencias = incidencias.order_by(
        "-fechadeteccion",
        "-id_incidencia"
    )


    # ========================================================
    # PAGINACIÓN
    # ========================================================

    paginator = Paginator(
        incidencias,
        10
    )


    pagina = request.GET.get(
        "page"
    )


    incidencias_pagina = paginator.get_page(
        pagina
    )


    # ========================================================
    # CONTEXTO
    # ========================================================

    contexto = {

        "apicultor":
            apicultor,

        "apiarios":
            apiarios,

        "incidencias":
            incidencias_pagina,


        # CONTADORES

        "total_incidencias":
            total_incidencias,

        "total_pendientes":
            total_pendientes,

        "total_en_proceso":
            total_en_proceso,

        "total_resueltas":
            total_resueltas,

        "total_resultados":
            paginator.count,


        # OPCIONES

        "estados_disponibles":
            estados_disponibles,

        "prioridades_disponibles":
            prioridades_disponibles,


        # FILTROS

        "busqueda":
            busqueda,

        "apiario_seleccionado":
            apiario_seleccionado,

        "estado_seleccionado":
            estado_seleccionado,

        "prioridad_seleccionada":
            prioridad_seleccionada,

    }


    return render(
        request,
        "panel_apicultor/incidencias.html",
        contexto
    )



# ============================================================
# CREAR INCIDENCIA
# PANEL APICULTOR
# ============================================================

@login_required
def crear_incidencia_apicultor(request):

    # ========================================================
    # APICULTOR AUTENTICADO
    # ========================================================

    apicultor = get_object_or_404(
        Apicultor,
        user=request.user
    )


    # ========================================================
    # SOLO SUS APIARIOS
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
    # SOLO COLMENAS DE SUS APIARIOS
    # ========================================================

    colmenas = (
        Colmena.objects
        .filter(
            id_apiario__id_apicultor=apicultor
        )
        .select_related(
            "id_apiario"
        )
        .order_by(
            "id_apiario__nombreapiario",
            "codigocolmena"
        )
    )


    prioridades_validas = [
        "Baja",
        "Media",
        "Alta",
        "Crítica",
    ]


    # ========================================================
    # VALORES INICIALES
    #
    # Esto nos servirá después para:
    #
    # /incidencias/crear/?apiario=2
    #
    # o:
    #
    # /incidencias/crear/?colmena=8
    # ========================================================

    tipo_inicial = "Apiario"

    apiario_preseleccionado = request.GET.get(
        "apiario",
        ""
    ).strip()

    colmena_preseleccionada = request.GET.get(
        "colmena",
        ""
    ).strip()


    # ========================================================
    # SI VENIMOS DESDE UNA COLMENA
    # ========================================================

    if colmena_preseleccionada.isdigit():

        colmena_inicial = (
            colmenas
            .filter(
                id_colmena=int(
                    colmena_preseleccionada
                )
            )
            .first()
        )


        if colmena_inicial:

            tipo_inicial = "Colmena"

            apiario_preseleccionado = str(
                colmena_inicial.id_apiario_id
            )

            colmena_preseleccionada = str(
                colmena_inicial.id_colmena
            )


    # ========================================================
    # POST
    # ========================================================

    if request.method == "POST":

        tipo_entidad = request.POST.get(
            "tipo_entidad",
            ""
        ).strip()


        id_apiario = request.POST.get(
            "apiario",
            ""
        ).strip()


        id_colmena = request.POST.get(
            "colmena",
            ""
        ).strip()


        titulo = request.POST.get(
            "titulo",
            ""
        ).strip()


        prioridad = request.POST.get(
            "prioridad",
            ""
        ).strip()


        fecha = request.POST.get(
            "fecha",
            ""
        ).strip()


        observaciones = request.POST.get(
            "observaciones",
            ""
        ).strip()


        imagen = request.FILES.get(
            "imagen"
        )


        # ====================================================
        # GUARDAR DATOS ESCRITOS PARA NO PERDERLOS SI HAY ERROR
        # ====================================================

        valores_formulario = {

            "tipo_entidad":
                tipo_entidad,

            "apiario":
                id_apiario,

            "colmena":
                id_colmena,

            "titulo":
                titulo,

            "prioridad":
                prioridad,

            "fecha":
                fecha,

            "observaciones":
                observaciones,

        }


        # ====================================================
        # VALIDACIONES
        # ====================================================

        errores = []


        # ----------------------------------------------------
        # TIPO
        # ----------------------------------------------------

        if tipo_entidad not in [
            "Apiario",
            "Colmena"
        ]:

            errores.append(
                "Selecciona si la incidencia corresponde "
                "a un apiario o a una colmena."
            )


        # ----------------------------------------------------
        # TÍTULO
        # ----------------------------------------------------

        if not titulo:

            errores.append(
                "Debes ingresar un título para la incidencia."
            )


        # ----------------------------------------------------
        # PRIORIDAD
        # ----------------------------------------------------

        if prioridad not in prioridades_validas:

            errores.append(
                "Selecciona una prioridad válida."
            )


        # ----------------------------------------------------
        # FECHA
        # ----------------------------------------------------

        fecha_deteccion = None


        if fecha:

            try:

                fecha_deteccion = datetime.strptime(
                    fecha,
                    "%Y-%m-%d"
                ).date()

            except ValueError:

                errores.append(
                    "La fecha de detección no es válida."
                )

        else:

            fecha_deteccion = timezone.localdate()


        # ====================================================
        # VALIDAR APIARIO
        #
        # IMPORTANTE:
        # buscamos únicamente dentro de SUS apiarios.
        # ====================================================

        apiario = None


        if not id_apiario.isdigit():

            errores.append(
                "Debes seleccionar un apiario."
            )

        else:

            apiario = (
                apiarios
                .filter(
                    id_apiario=int(
                        id_apiario
                    )
                )
                .first()
            )


            if not apiario:

                errores.append(
                    "El apiario seleccionado no pertenece "
                    "a tus apiarios asignados."
                )


        # ====================================================
        # VALIDAR COLMENA
        # ====================================================

        colmena = None


        if (
            tipo_entidad == "Colmena"
            and
            apiario
        ):

            if not id_colmena.isdigit():

                errores.append(
                    "Debes seleccionar una colmena."
                )

            else:

                colmena = (
                    Colmena.objects
                    .filter(
                        id_colmena=int(
                            id_colmena
                        ),

                        id_apiario=apiario,

                        id_apiario__id_apicultor=apicultor
                    )
                    .first()
                )


                if not colmena:

                    errores.append(
                        "La colmena seleccionada no pertenece "
                        "al apiario indicado."
                    )


        # ====================================================
        # VALIDAR IMAGEN
        # ====================================================

        if imagen:

            tipo_archivo = getattr(
                imagen,
                "content_type",
                ""
            )


            if (
                tipo_archivo
                and
                not tipo_archivo.startswith("image/")
            ):

                errores.append(
                    "El archivo de evidencia debe ser una imagen."
                )


            limite_imagen = (
                5 * 1024 * 1024
            )


            if imagen.size > limite_imagen:

                errores.append(
                    "La imagen no puede superar los 5 MB."
                )


        # ====================================================
        # SI HAY ERRORES
        # ====================================================

        if errores:

            for error in errores:

                messages.error(
                    request,
                    error
                )


            contexto = {

                "apicultor":
                    apicultor,

                "apiarios":
                    apiarios,

                "colmenas":
                    colmenas,

                "prioridades":
                    prioridades_validas,

                "tipo_inicial":
                    tipo_entidad,

                "apiario_preseleccionado":
                    id_apiario,

                "colmena_preseleccionada":
                    id_colmena,

                "valores_formulario":
                    valores_formulario,

                "fecha_hoy":
                    timezone.localdate(),

            }


            return render(
                request,
                "panel_apicultor/crear_incidencia.html",
                contexto
            )


        # ====================================================
        # NOMBRE DE QUIEN LA REPORTÓ
        # ====================================================

        nombre_reportante = (
            request.user
            .get_full_name()
            .strip()
        )


        if not nombre_reportante:

            nombre_reportante = (
                request.user.username
            )


        # ====================================================
        # CREAR INCIDENCIA
        # ====================================================

        Incidencia.objects.create(

            # Apicultor encargado
            id_apicultor=apicultor,

            # Lugar
            id_apiario=apiario,

            # NULL cuando es incidencia general del apiario
            id_colmena=colmena,

            # Apiario / Colmena
            entidadincidencia=tipo_entidad,

            titulo=titulo,

            prioridad=prioridad,

            fechadeteccion=fecha_deteccion,

            # Toda incidencia creada empieza abierta
            estado="Pendiente",

            observaciones=observaciones,

            imagen=imagen,

            # Persona que hizo el reporte
            responsable=nombre_reportante

        )


        messages.success(
            request,
            "La incidencia fue reportada correctamente."
        )


        return redirect(
            "incidencias_apicultor"
        )


    # ========================================================
    # GET
    # ========================================================

    contexto = {

        "apicultor":
            apicultor,

        "apiarios":
            apiarios,

        "colmenas":
            colmenas,

        "prioridades":
            prioridades_validas,

        "tipo_inicial":
            tipo_inicial,

        "apiario_preseleccionado":
            apiario_preseleccionado,

        "colmena_preseleccionada":
            colmena_preseleccionada,

        "fecha_hoy":
            timezone.localdate(),

        "valores_formulario":
            {},

    }


    return render(
        request,
        "panel_apicultor/crear_incidencia.html",
        contexto
    )



# ============================================================
# EDITAR / GESTIONAR INCIDENCIA
# PANEL APICULTOR
# ============================================================

@login_required
def editar_incidencia_apicultor(
    request,
    id_incidencia
):

    # ========================================================
    # APICULTOR AUTENTICADO
    # ========================================================

    apicultor = get_object_or_404(
        Apicultor,
        user=request.user
    )


    # ========================================================
    # INCIDENCIA ASIGNADA AL APICULTOR
    # ========================================================

    incidencia = get_object_or_404(

        Incidencia.objects.select_related(
            "id_apicultor",
            "id_apiario",
            "id_colmena"
        ),

        id_incidencia=id_incidencia,

        id_apicultor=apicultor
    )


    # ========================================================
    # ESTADOS PERMITIDOS
    # ========================================================

    estados_disponibles = [
        "Pendiente",
        "En proceso",
        "Resuelta",
    ]


    # ========================================================
    # POST
    # ========================================================

    if request.method == "POST":

        estado = request.POST.get(
            "estado",
            ""
        ).strip()


        observaciones = request.POST.get(
            "observaciones",
            ""
        ).strip()


        nueva_imagen = request.FILES.get(
            "imagen"
        )


        errores = []


        # ====================================================
        # VALIDAR ESTADO
        # ====================================================

        if estado not in estados_disponibles:

            errores.append(
                "Selecciona un estado válido."
            )


        # ====================================================
        # OBSERVACIONES
        # ====================================================

        if len(observaciones) > 1000:

            errores.append(
                "Las observaciones no pueden superar "
                "los 1000 caracteres."
            )


        # ====================================================
        # IMAGEN
        # ====================================================

        if nueva_imagen:

            tipo_archivo = getattr(
                nueva_imagen,
                "content_type",
                ""
            )


            if (
                tipo_archivo
                and
                not tipo_archivo.startswith("image/")
            ):

                errores.append(
                    "La evidencia debe ser una imagen."
                )


            if nueva_imagen.size > 5 * 1024 * 1024:

                errores.append(
                    "La imagen no puede superar los 5 MB."
                )


        # ====================================================
        # ERRORES
        # ====================================================

        if errores:

            for error in errores:

                messages.error(
                    request,
                    error
                )


            return render(
                request,
                "panel_apicultor/editar_incidencia.html",
                {
                    "apicultor": apicultor,
                    "incidencia": incidencia,
                    "estados_disponibles": estados_disponibles,
                }
            )


        # ====================================================
        # ACTUALIZAR
        # ========================================================

        incidencia.estado = estado

        incidencia.observaciones = observaciones


        if nueva_imagen:

            incidencia.imagen = nueva_imagen


        incidencia.save()


        messages.success(
            request,
            "La incidencia fue actualizada correctamente."
        )


        return redirect(
            "incidencias_apicultor"
        )


    # ========================================================
    # GET
    # ========================================================

    return render(
        request,
        "panel_apicultor/editar_incidencia.html",
        {
            "apicultor": apicultor,
            "incidencia": incidencia,
            "estados_disponibles": estados_disponibles,
        }
    )


# ============================================================
# AGENDA
# PANEL APICULTOR
# ============================================================

@login_required
def agenda_apicultor(request):

    # ========================================================
    # APICULTOR AUTENTICADO
    # ========================================================

    apicultor = get_object_or_404(
        Apicultor,
        user=request.user
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
    # FECHA ACTUAL
    # ========================================================

    hoy = timezone.localdate()


    # ========================================================
    # EVENTOS DEL APICULTOR
    #
    # Puede ver:
    #
    # 1. Eventos asignados directamente a él.
    #
    # 2. Eventos correspondientes a sus apiarios.
    #
    # Esto nos permite que un administrador cree un evento
    # para un apiario y el apicultor encargado pueda verlo.
    # ========================================================

    eventos_base = (
        EventoAgenda.objects
        .filter(
            Q(
                responsable=apicultor
            )
            |
            Q(
                id_apiario__in=apiarios
            )
        )
        .select_related(
            "id_apiario",
            "id_colmena",
            "responsable",
            "creado_por"
        )
        .distinct()
    )


    # ========================================================
    # CONTADORES GENERALES
    # ========================================================

    total_eventos = (
        eventos_base.count()
    )


    total_programados = (
        eventos_base
        .filter(
            estado=EventoAgenda.EstadoEvento.PROGRAMADO
        )
        .count()
    )


    total_completados = (
        eventos_base
        .filter(
            estado=EventoAgenda.EstadoEvento.COMPLETADO
        )
        .count()
    )


    total_cancelados = (
        eventos_base
        .filter(
            estado=EventoAgenda.EstadoEvento.CANCELADO
        )
        .count()
    )


    # ========================================================
    # EVENTOS PARA HOY
    # ========================================================

    eventos_hoy = (
        eventos_base
        .filter(
            fecha=hoy
        )
        .order_by(
            "hora"
        )
    )


    total_hoy = eventos_hoy.count()


    # ========================================================
    # PRÓXIMOS EVENTOS
    #
    # No mostramos aquí eventos ya completados/cancelados.
    # ========================================================

    proximos_eventos = (
        eventos_base
        .filter(
            fecha__gte=hoy,
            estado=EventoAgenda.EstadoEvento.PROGRAMADO
        )
        .order_by(
            "fecha",
            "hora"
        )[:5]
    )


    # ========================================================
    # TIPOS DISPONIBLES
    # ========================================================

    tipos_disponibles = [
        {
            "valor": EventoAgenda.TipoEvento.MANTENIMIENTO,
            "nombre": "Mantenimiento",
        },
        {
            "valor": EventoAgenda.TipoEvento.REVISION,
            "nombre": "Revisión",
        },
        {
            "valor": EventoAgenda.TipoEvento.INCIDENCIA,
            "nombre": "Incidencia",
        },
        {
            "valor": EventoAgenda.TipoEvento.EVENTO,
            "nombre": "Evento general",
        },
    ]


    # ========================================================
    # ESTADOS DISPONIBLES
    # ========================================================

    estados_disponibles = [
        {
            "valor": EventoAgenda.EstadoEvento.PROGRAMADO,
            "nombre": "Programado",
        },
        {
            "valor": EventoAgenda.EstadoEvento.COMPLETADO,
            "nombre": "Completado",
        },
        {
            "valor": EventoAgenda.EstadoEvento.CANCELADO,
            "nombre": "Cancelado",
        },
    ]


    # ========================================================
    # FILTROS GET
    # ========================================================

    busqueda = request.GET.get(
        "q",
        ""
    ).strip()


    apiario_seleccionado = request.GET.get(
        "apiario",
        ""
    ).strip()


    tipo_seleccionado = request.GET.get(
        "tipo",
        ""
    ).strip()


    estado_seleccionado = request.GET.get(
        "estado",
        ""
    ).strip()


    fecha_seleccionada = request.GET.get(
        "fecha",
        ""
    ).strip()


    # ========================================================
    # CONSULTA DE RESULTADOS
    # ========================================================

    eventos = eventos_base


    # ========================================================
    # BUSCADOR
    # ========================================================

    if busqueda:

        eventos = eventos.filter(

            Q(
                titulo__icontains=busqueda
            )

            |

            Q(
                descripcion__icontains=busqueda
            )

            |

            Q(
                id_apiario__nombreapiario__icontains=busqueda
            )

            |

            Q(
                id_colmena__codigocolmena__icontains=busqueda
            )

        )


    # ========================================================
    # FILTRO APIARIO
    # ========================================================

    if apiario_seleccionado.isdigit():

        eventos = eventos.filter(
            id_apiario__id_apiario=int(
                apiario_seleccionado
            )
        )


    # ========================================================
    # FILTRO TIPO
    # ========================================================

    tipos_validos = [
        EventoAgenda.TipoEvento.MANTENIMIENTO,
        EventoAgenda.TipoEvento.REVISION,
        EventoAgenda.TipoEvento.INCIDENCIA,
        EventoAgenda.TipoEvento.EVENTO,
    ]


    if (
        tipo_seleccionado
        and
        tipo_seleccionado in tipos_validos
    ):

        eventos = eventos.filter(
            tipo_evento=tipo_seleccionado
        )


    # ========================================================
    # FILTRO ESTADO
    # ========================================================

    estados_validos = [
        EventoAgenda.EstadoEvento.PROGRAMADO,
        EventoAgenda.EstadoEvento.COMPLETADO,
        EventoAgenda.EstadoEvento.CANCELADO,
    ]


    if (
        estado_seleccionado
        and
        estado_seleccionado in estados_validos
    ):

        eventos = eventos.filter(
            estado=estado_seleccionado
        )


    # ========================================================
    # FILTRO POR FECHA
    # ========================================================

    if fecha_seleccionada:

        eventos = eventos.filter(
            fecha=fecha_seleccionada
        )


    # ========================================================
    # ORDEN
    # ========================================================

    eventos = eventos.order_by(
        "fecha",
        "hora"
    )


    # ========================================================
    # PAGINACIÓN
    # ========================================================

    paginator = Paginator(
        eventos,
        10
    )


    pagina = request.GET.get(
        "page"
    )


    eventos_pagina = paginator.get_page(
        pagina
    )


    # ========================================================
    # EVENTOS PARA EL CALENDARIO
    #
    # Estos no están paginados porque el calendario necesita
    # conocer todos los eventos disponibles.
    # ========================================================

    eventos_calendario = []


    for evento in eventos_base.order_by(
        "fecha",
        "hora"
    ):

        eventos_calendario.append({

            "id":
                evento.id_evento,

            "titulo":
                evento.titulo,

            "tipo":
                evento.tipo_evento,

            "estado":
                evento.estado,

            "fecha":
                evento.fecha.strftime(
                    "%Y-%m-%d"
                ),

            "hora":
                evento.hora.strftime(
                    "%H:%M"
                ),

            "apiario":
                evento.id_apiario.nombreapiario
                if evento.id_apiario
                else "",

            "colmena":
                evento.id_colmena.codigocolmena
                if evento.id_colmena
                else "",

            "descripcion":
                evento.descripcion or "",

        })


    # ========================================================
    # CONTEXTO
    # ========================================================

    contexto = {

        "apicultor":
            apicultor,

        "apiarios":
            apiarios,


        # EVENTOS

        "eventos":
            eventos_pagina,

        "eventos_hoy":
            eventos_hoy,

        "proximos_eventos":
            proximos_eventos,

        "eventos_calendario":
            eventos_calendario,


        # CONTADORES

        "total_eventos":
            total_eventos,

        "total_programados":
            total_programados,

        "total_completados":
            total_completados,

        "total_cancelados":
            total_cancelados,

        "total_hoy":
            total_hoy,

        "total_resultados":
            paginator.count,


        # OPCIONES

        "tipos_disponibles":
            tipos_disponibles,

        "estados_disponibles":
            estados_disponibles,


        # FILTROS

        "busqueda":
            busqueda,

        "apiario_seleccionado":
            apiario_seleccionado,

        "tipo_seleccionado":
            tipo_seleccionado,

        "estado_seleccionado":
            estado_seleccionado,

        "fecha_seleccionada":
            fecha_seleccionada,


        # FECHA

        "hoy":
            hoy,

    }


    return render(
        request,
        "panel_apicultor/agenda.html",
        contexto
    )