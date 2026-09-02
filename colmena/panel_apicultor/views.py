from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect,get_object_or_404
from django.core.paginator import Paginator
from django.db.models import Q
from datetime import datetime
from django.utils import timezone
from django.views.decorators.http import require_POST


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
# REPORTAR INCIDENCIA - APICULTOR
# ============================================================

@login_required
def reportar_incidencia_apicultor(
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
    # Solo puede reportar sobre sus propias colmenas.
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

        titulo = (
            request.POST.get(
                "titulo",
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


        fecha_deteccion = (
            request.POST.get(
                "fecha_deteccion",
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


        imagen = (
            request.FILES.get(
                "imagen"
            )
        )


        # ====================================================
        # VALIDACIONES
        # ====================================================

        errores = []


        if not titulo:

            errores.append(
                "Debes ingresar un título para la incidencia."
            )


        if len(titulo) > 150:

            errores.append(
                "El título no puede superar los 150 caracteres."
            )


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


        if not fecha_deteccion:

            errores.append(
                "Debes seleccionar la fecha de detección."
            )


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
            # CREAR INCIDENCIA
            # =================================================

            incidencia = Incidencia(

                id_apicultor=
                    apicultor,

                id_apiario=
                    apiario,

                id_colmena=
                    colmena,

                entidadincidencia=
                    "Colmena",

                titulo=
                    titulo,

                prioridad=
                    prioridad,

                fechadeteccion=
                    fecha_deteccion,

                estado=
                    "Abierta",

                observaciones=
                    observaciones,

                responsable=(
                    request.user.get_full_name()
                    or
                    request.user.username
                ),

            )


            if imagen:

                incidencia.imagen = (
                    imagen
                )


            incidencia.save()


            messages.success(
                request,
                "La incidencia fue reportada correctamente."
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

    }


    return render(
        request,
        "panel_apicultor/reportar_incidencia.html",
        contexto
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
# INCIDENCIAS - PANEL APICULTOR
# ============================================================

@login_required
def incidencias_apicultor(request):

    # ========================================================
    # APICULTOR AUTENTICADO
    # ========================================================

    apicultor = Apicultor.objects.filter(
        user=request.user
    ).first()


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
        .filter(
            id_apicultor=apicultor
        )
        .order_by(
            "nombreapiario"
        )
    )


    # ========================================================
    # INCIDENCIAS DEL APICULTOR
    #
    # Puede incluir:
    #
    # - incidencia directa del apiario
    # - incidencia de una colmena
    #
    # Nunca mostramos incidencias de otro apicultor.
    # ========================================================

    incidencias_base = (
        Incidencia.objects
        .filter(
            Q(id_apicultor=apicultor)
            |
            Q(id_apiario__in=apiarios)
        )
        .select_related(
            "id_apicultor",
            "id_apiario",
            "id_colmena"
        )
        .distinct()
    )


    # ========================================================
    # CONTADORES GENERALES
    # ========================================================

    total_incidencias = (
        incidencias_base.count()
    )


    total_abiertas = (
        incidencias_base
        .filter(
            estado__iexact="Abierta"
        )
        .count()
    )


    # ========================================================
    # ESTADOS QUE REALMENTE EXISTEN EN LA BD
    #
    # Así no inventamos estados.
    # ========================================================

    estados_disponibles = list(
        incidencias_base
        .exclude(
            estado__isnull=True
        )
        .exclude(
            estado=""
        )
        .values_list(
            "estado",
            flat=True
        )
        .distinct()
        .order_by(
            "estado"
        )
    )


    # ========================================================
    # PRIORIDADES QUE REALMENTE EXISTEN
    # ========================================================

    prioridades_disponibles = list(
        incidencias_base
        .exclude(
            prioridad__isnull=True
        )
        .exclude(
            prioridad=""
        )
        .values_list(
            "prioridad",
            flat=True
        )
        .distinct()
        .order_by(
            "prioridad"
        )
    )


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
    # QUERY PRINCIPAL
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

        incidencias = incidencias.filter(
            id_apiario__id_apiario=int(
                apiario_seleccionado
            )
        )


    # ========================================================
    # FILTRO ESTADO
    # ========================================================

    if (
        estado_seleccionado
        and
        estado_seleccionado
        in
        estados_disponibles
    ):

        incidencias = incidencias.filter(
            estado__iexact=estado_seleccionado
        )


    # ========================================================
    # FILTRO PRIORIDAD
    # ========================================================

    if (
        prioridad_seleccionada
        and
        prioridad_seleccionada
        in
        prioridades_disponibles
    ):

        incidencias = incidencias.filter(
            prioridad__iexact=prioridad_seleccionada
        )


    # ========================================================
    # ORDEN
    #
    # Las más recientes primero.
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


    numero_pagina = request.GET.get(
        "page"
    )


    incidencias_pagina = paginator.get_page(
        numero_pagina
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

        "total_incidencias":
            total_incidencias,

        "total_abiertas":
            total_abiertas,

        "total_resultados":
            paginator.count,

        "estados_disponibles":
            estados_disponibles,

        "prioridades_disponibles":
            prioridades_disponibles,

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