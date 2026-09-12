from django.contrib import messages
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.shortcuts import render, redirect,get_object_or_404
from django.core.paginator import Paginator
from django.db.models import Q, Prefetch, Count, Exists, OuterRef, Subquery
from datetime import datetime, timedelta
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.http import require_POST, require_GET
from django.urls import reverse
from PIL import Image, UnidentifiedImageError
from django.db import transaction
from usuarios.models import Configuracion2FA,HistorialAcceso
from usuarios.services import (obtener_politica_2fa,obtener_sesiones_activas_usuario,registrar_historial_acceso,sincronizar_session_key,)
from django.core.validators import validate_email
from django.contrib.auth import get_user_model
import re
from panel_admin.models import Notificacion

from dbmicolmena.models import (
    Apicultor,
    Apiario,
    Colmena,
    Mantenimiento,
    Incidencia,
    EventoAgenda,
    EvidenciaIncidencia,
    EvidenciaMantenimiento,
    Seguimientoapicola,
)

from panel_admin.notificaciones import (
    notificar_incidencia_creada,
    notificar_mantenimiento_creado,
)

from panel_admin.permisos import (
    permiso_requerido,
    obtener_permisos_usuario,
)


# ============================================================
# DATOS DE ACTIVIDAD DEL DASHBOARD
# ============================================================

def obtener_actividad_dashboard_apicultor(
    apicultor,
    apiarios
):

    # ========================================================
    # FECHA ACTUAL
    # ========================================================

    hoy = timezone.localdate()


    # ========================================================
    # INICIO DE LA SEMANA ACTUAL
    # LUNES
    # ========================================================

    inicio_semana_actual = (
        hoy
        -
        timedelta(
            days=hoy.weekday()
        )
    )


    # ========================================================
    # SERIES
    # ========================================================

    labels = []

    revisiones = []

    mantenimientos = []

    incidencias = []


    # ========================================================
    # ÚLTIMAS 4 SEMANAS
    # ========================================================

    for semanas_atras in range(
        3,
        -1,
        -1
    ):

        inicio = (
            inicio_semana_actual
            -
            timedelta(
                weeks=semanas_atras
            )
        )


        fin = (
            inicio
            +
            timedelta(
                days=6
            )
        )


        # ====================================================
        # ETIQUETA
        # ====================================================

        labels.append(
            (
                f"{inicio.strftime('%d/%m')}"
                f" - "
                f"{fin.strftime('%d/%m')}"
            )
        )


        # ====================================================
        # REVISIONES
        # ====================================================

        total_revisiones = (
            EventoAgenda.objects
            .filter(
                responsable=
                    apicultor,

                tipo_evento=
                    EventoAgenda
                    .TipoEvento
                    .REVISION,

                estado=
                    EventoAgenda
                    .EstadoEvento
                    .COMPLETADO,

                fecha__range=(
                    inicio,
                    fin
                ),
            )
            .count()
        )


        revisiones.append(
            total_revisiones
        )


        # ====================================================
        # MANTENIMIENTOS
        # ====================================================

        total_mantenimientos = (
            Mantenimiento.objects
            .filter(
                id_apiario__in=
                    apiarios,

                fechaejecucion__range=(
                    inicio,
                    fin
                )
            )
            .count()
        )


        mantenimientos.append(
            total_mantenimientos
        )


        # ====================================================
        # INCIDENCIAS REPORTADAS POR EL APICULTOR
        # ====================================================

        total_incidencias = (
            Incidencia.objects
            .filter(
                id_apicultor=
                    apicultor,

                fechadeteccion__range=(
                    inicio,
                    fin
                )
            )
            .count()
        )


        incidencias.append(
            total_incidencias
        )


    # ========================================================
    # RESULTADO
    # ========================================================

    return {

        "labels":
            labels,

        "revisiones":
            revisiones,

        "mantenimientos":
            mantenimientos,

        "incidencias":
            incidencias,

    }

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
    # PERMISOS DEL ROL
    # ========================================================

    permisos_usuario = (
        obtener_permisos_usuario(
            request.user
        )
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
    # COLMENAS POR ESTADO
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
        .filter(
            Q(
                estado__iexact="Pendiente"
            )
            |
            Q(
                estado__iexact="En proceso"
            )
        )
        .count()
    )

    # ========================================================
    # ÚLTIMAS 3 INCIDENCIAS REPORTADAS
    # ========================================================

    ultimas_incidencias = (
        Incidencia.objects
        .filter(
            id_apicultor=
                apicultor
        )
        .select_related(
            "id_apiario",
            "id_colmena"
        )
        .order_by(
            "-fechadeteccion",
            "-id_incidencia"
        )[:3]
    )


    # ========================================================
    # PRÓXIMOS EVENTOS
    # ========================================================

    proximos_eventos = (
        EventoAgenda.objects
        .filter(
            responsable=
                apicultor,

            estado=
                "programado",

            fecha__gte=
                timezone.localdate()
        )
        .order_by(
            "fecha",
            "hora"
        )[:5]
    )

    # ========================================================
    # ACTIVIDAD DE LAS ÚLTIMAS 4 SEMANAS
    # ========================================================

    actividad = (
        obtener_actividad_dashboard_apicultor(
            apicultor,
            apiarios
        )
    )


    # ========================================================
    # REVISIONES DEL MES
    # ========================================================

    hoy = timezone.localdate()


    revisiones_mes = (
        EventoAgenda.objects
        .filter(
            responsable=
                apicultor,

            tipo_evento=
                EventoAgenda
                .TipoEvento
                .REVISION,

            estado=
                EventoAgenda
                .EstadoEvento
                .COMPLETADO,

            fecha__year=
                hoy.year,

            fecha__month=
                hoy.month,
        )
        .count()
    )


    # ========================================================
    # CONTEXTO
    # ========================================================

    tiene_actividad_visible = (
        "agenda" in permisos_usuario
        or
        "mr" in permisos_usuario
        or
        "ir" in permisos_usuario
    )


    contexto = {

        "apicultor":
            apicultor,

        "total_apiarios":
            (
                apiarios.count()
                if "av" in permisos_usuario
                else 0
            ),

        "total_colmenas":
            (
                colmenas.count()
                if "cv" in permisos_usuario
                else 0
            ),

        "colmenas_activas":
            (
                colmenas_activas
                if "cv" in permisos_usuario
                else 0
            ),

        "colmenas_riesgo":
            (
                colmenas_riesgo
                if "cv" in permisos_usuario
                else 0
            ),

        "colmenas_revision":
            (
                colmenas_revision
                if "cv" in permisos_usuario
                else 0
            ),

        "colmenas_inactivas":
            (
                colmenas_inactivas
                if "cv" in permisos_usuario
                else 0
            ),

        "mantenimientos_pendientes":
            (
                mantenimientos_pendientes
                if "mr" in permisos_usuario
                else 0
            ),

        "incidencias_abiertas":
            (
                incidencias_abiertas
                if "ir" in permisos_usuario
                else 0
            ),

        "proximos_eventos":
            (
                proximos_eventos
                if "agenda" in permisos_usuario
                else []
            ),

        "ultimas_incidencias":
            (
                ultimas_incidencias
                if "ir" in permisos_usuario
                else []
            ),

        "actividad_labels":
            (
                actividad["labels"]
                if tiene_actividad_visible
                else []
            ),

        "actividad_revisiones":
            (
                actividad["revisiones"]
                if "agenda" in permisos_usuario
                else []
            ),

        "actividad_mantenimientos":
            (
                actividad["mantenimientos"]
                if "mr" in permisos_usuario
                else []
            ),

        "actividad_incidencias":
            (
                actividad["incidencias"]
                if "ir" in permisos_usuario
                else []
            ),

        "revisiones_mes":
            (
                revisiones_mes
                if "agenda" in permisos_usuario
                else 0
            ),
    }


    return render(request,"panel_apicultor/dashboard.html",contexto)


# ============================================================
# DATOS DINÁMICOS DEL DASHBOARD
# ============================================================

@login_required
def datos_dashboard_apicultor(
    request
):

    # ========================================================
    # APICULTOR
    # ========================================================

    apicultor = (
        Apicultor.objects
        .filter(
            user=request.user
        )
        .first()
    )


    if not apicultor:

        return JsonResponse(
            {
                "ok": False,
                "error": (
                    "El usuario no tiene un "
                    "perfil de apicultor."
                ),
            },
            status=403
        )


    # ========================================================
    # PERMISOS DEL ROL
    # ========================================================

    permisos_usuario = (
        obtener_permisos_usuario(
            request.user
        )
    )


    # ========================================================
    # APIARIOS
    # ========================================================

    apiarios = (
        Apiario.objects
        .filter(
            id_apicultor=
                apicultor
        )
    )

    # ========================================================
    # COLMENAS
    # ========================================================

    colmenas = (
        Colmena.objects
        .filter(
            id_apiario__in=
                apiarios
        )
    )


    # ========================================================
    # TARJETAS DEL DASHBOARD
    # ========================================================

    total_apiarios = (
        apiarios.count()
    )


    colmenas_activas = (
        colmenas
        .filter(
            estadocolmena__iexact=
                "Activa"
        )
        .count()
    )

    colmenas_riesgo = (
        colmenas
        .filter(
            estadocolmena__iexact=
                "Riesgo"
        )
        .count()
    )


    colmenas_revision = (
        colmenas
        .filter(
            estadocolmena__iexact=
                "Revisión"
        )
        .count()
    )


    colmenas_inactivas = (
        colmenas
        .filter(
            estadocolmena__iexact=
                "Inactiva"
        )
        .count()
    )


    mantenimientos_pendientes = (
        Mantenimiento.objects
        .filter(
            id_apiario__in=
                apiarios,
            estado__iexact=
                "Pendiente"
        )
        .count()
    )


    incidencias_abiertas = (
        Incidencia.objects
        .filter(
            id_apiario__in=
                apiarios
        )
        .filter(
            Q(
                estado__iexact=
                    "Pendiente"
            )
            |
            Q(
                estado__iexact=
                    "En proceso"
            )
        )
        .count()
    )


    hoy = (
        timezone.localdate()
    )


    revisiones_mes = (
        EventoAgenda.objects
        .filter(
            responsable=
                apicultor,

            tipo_evento=
                EventoAgenda
                .TipoEvento
                .REVISION,

            estado=
                EventoAgenda
                .EstadoEvento
                .COMPLETADO,

            fecha__year=
                hoy.year,

            fecha__month=
                hoy.month,
        )
        .count()
    )

    # ========================================================
    # PRÓXIMAS 5 ACTIVIDADES
    # ========================================================

    proximos_eventos = (
        EventoAgenda.objects
        .filter(
            responsable=
                apicultor,

            estado=
                "programado",

            fecha__gte=
                hoy
        )
        .select_related(
            "id_apiario"
        )
        .order_by(
            "fecha",
            "hora"
        )[:5]
    )


    proximos_eventos_json = []


    for evento in proximos_eventos:

        proximos_eventos_json.append(
            {

                "id":
                    evento.pk,

                "titulo":
                    evento.titulo
                    or "",

                "fecha":
                    (
                        evento.fecha.isoformat()
                        if evento.fecha
                        else ""
                    ),

                "hora":
                    (
                        evento.hora.strftime(
                            "%I:%M %p"
                        )
                        if evento.hora
                        else ""
                    ),

                "apiario":
                    (
                        evento
                        .id_apiario
                        .nombreapiario

                        if evento.id_apiario

                        else ""
                    ),

            }
        )


    # ========================================================
    # ACTIVIDAD
    # ========================================================

    actividad = (
        obtener_actividad_dashboard_apicultor(
            apicultor,
            apiarios
        )
    )


    # ========================================================
    # ÚLTIMAS 3 INCIDENCIAS
    # ========================================================

    incidencias = (
        Incidencia.objects
        .filter(
            id_apicultor=
                apicultor
        )
        .select_related(
            "id_apiario",
            "id_colmena"
        )
        .order_by(
            "-fechadeteccion",
            "-id_incidencia"
        )[:3]
    )


    incidencias_json = []


    for incidencia in incidencias:

        incidencias_json.append(
            {

                "id":
                    incidencia.id_incidencia,

                "titulo":
                    incidencia.titulo or "",

                "apiario":
                    (
                        incidencia
                        .id_apiario
                        .nombreapiario
                        if incidencia.id_apiario
                        else "—"
                    ),

                "colmena":
                    (
                        incidencia
                        .id_colmena
                        .codigocolmena
                        if incidencia.id_colmena
                        else "—"
                    ),

                "fecha":
                    (
                        incidencia
                        .fechadeteccion
                        .strftime(
                            "%d/%m/%Y"
                        )
                        if incidencia.fechadeteccion
                        else "—"
                    ),

                "prioridad":
                    incidencia.prioridad
                    or "Sin definir",

                "estado":
                    incidencia.estado
                    or "Sin definir",

            }
        )


    # ========================================================
    # RESPUESTA
    # ========================================================

    tiene_actividad_visible = (
        "agenda" in permisos_usuario
        or
        "mr" in permisos_usuario
        or
        "ir" in permisos_usuario
    )


    actividad_filtrada = {

        "labels":
            (
                actividad["labels"]
                if tiene_actividad_visible
                else []
            ),

        "revisiones":
            (
                actividad["revisiones"]
                if "agenda" in permisos_usuario
                else []
            ),

        "mantenimientos":
            (
                actividad["mantenimientos"]
                if "mr" in permisos_usuario
                else []
            ),

        "incidencias":
            (
                actividad["incidencias"]
                if "ir" in permisos_usuario
                else []
            ),

    }


    return JsonResponse(
        {

            "ok":
                True,

            "resumen": {

                "total_apiarios":
                    (
                        total_apiarios
                        if "av" in permisos_usuario
                        else 0
                    ),

                "colmenas_activas":
                    (
                        colmenas_activas
                        if "cv" in permisos_usuario
                        else 0
                    ),

                "colmenas_riesgo":
                    (
                        colmenas_riesgo
                        if "cv" in permisos_usuario
                        else 0
                    ),

                "colmenas_revision":
                    (
                        colmenas_revision
                        if "cv" in permisos_usuario
                        else 0
                    ),

                "colmenas_inactivas":
                    (
                        colmenas_inactivas
                        if "cv" in permisos_usuario
                        else 0
                    ),

                "mantenimientos_pendientes":
                    (
                        mantenimientos_pendientes
                        if "mr" in permisos_usuario
                        else 0
                    ),

                "incidencias_abiertas":
                    (
                        incidencias_abiertas
                        if "ir" in permisos_usuario
                        else 0
                    ),

                "revisiones_mes":
                    (
                        revisiones_mes
                        if "agenda" in permisos_usuario
                        else 0
                    ),

            },

            "actividad":
                actividad_filtrada,

            "proximos_eventos":
                (
                    proximos_eventos_json
                    if "agenda" in permisos_usuario
                    else []
                ),

            "incidencias":
                (
                    incidencias_json
                    if "ir" in permisos_usuario
                    else []
                ),

        }
    )


# ============================================================
# MIS APIARIOS
# ============================================================

@login_required
@permiso_requerido(
    "av",
    redireccion="dashboard_apicultor"
)
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
    #
    # colmenas_registradas:
    # cantidad REAL de colmenas que existen actualmente
    # dentro de cada apiario.
    # ========================================================

    apiarios = (
        Apiario.objects
        .filter(
            id_apicultor=
                apicultor
        )
        .annotate(
            colmenas_registradas=
                Count(
                    "colmena"
                )
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


    estados_permitidos = [
        "Bueno",
        "Precaución",
        "Deficiente",
    ]


    if estado in estados_permitidos:

        apiarios = apiarios.filter(
            estadoapiario__iexact=
                estado
        )


    else:

        estado = ""


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
# VALIDAR FOTOGRAFÍA DE APIARIO
# PANEL APICULTOR
# ============================================================

def validar_imagen_apiario(archivo):
    """
    Valida una fotografía nueva del apiario.

    Reglas:
    - Archivo no vacío.
    - Máximo 5 MB.
    - Debe ser una imagen real.
    - Formatos permitidos: JPG/JPEG, PNG y WEBP.
    """

    LIMITE_MB = 5

    LIMITE_BYTES = (
        LIMITE_MB
        * 1024
        * 1024
    )

    FORMATOS_VALIDOS = {
        "JPEG",
        "PNG",
        "WEBP",
    }


    # ========================================================
    # ARCHIVO
    # ========================================================

    if not archivo:

        return (
            "No se pudo leer la fotografía seleccionada."
        )


    if archivo.size <= 0:

        return (
            f'La imagen "{archivo.name}" está vacía.'
        )


    # ========================================================
    # TAMAÑO
    # ========================================================

    if archivo.size > LIMITE_BYTES:

        return (
            f'La imagen "{archivo.name}" supera '
            f"el límite de {LIMITE_MB} MB."
        )


    # ========================================================
    # TIPO MIME
    # ========================================================

    tipo_archivo = getattr(
        archivo,
        "content_type",
        ""
    )


    tipos_mime_validos = {
        "image/jpeg",
        "image/png",
        "image/webp",
    }


    if (
        tipo_archivo
        and
        tipo_archivo not in tipos_mime_validos
    ):

        return (
            f'El archivo "{archivo.name}" '
            "no tiene un formato permitido. "
            "Utiliza JPG, PNG o WEBP."
        )


    # ========================================================
    # CONTENIDO REAL
    #
    # No confiamos solamente en la extensión o en el MIME.
    # Pillow verifica que realmente sea una imagen válida.
    # ========================================================

    try:

        archivo.seek(0)

        imagen = Image.open(
            archivo
        )

        formato = (
            imagen.format
            or ""
        ).upper()

        imagen.verify()


        if formato not in FORMATOS_VALIDOS:

            return (
                f'La imagen "{archivo.name}" tiene un '
                "formato no permitido. "
                "Utiliza JPG, PNG o WEBP."
            )


    except (
        UnidentifiedImageError,
        OSError,
        ValueError,
    ):

        return (
            f'El archivo "{archivo.name}" '
            "no contiene una imagen válida."
        )


    finally:

        try:

            archivo.seek(0)

        except Exception:

            pass


    return None




# ============================================================
# EDITAR / GESTIONAR APIARIO
# PANEL APICULTOR
# ============================================================

@login_required
@permiso_requerido(
    "av",
    redireccion="dashboard_apicultor"
)
@require_POST
def editar_apiario_apicultor(
    request,
    id_apiario
):

    # ========================================================
    # 1. APICULTOR AUTENTICADO
    # ========================================================

    apicultor = get_object_or_404(
        Apicultor,
        user=request.user
    )


    # ========================================================
    # 2. OBTENER APIARIO
    #
    # SEGURIDAD:
    # Solo se puede modificar un apiario perteneciente
    # al apicultor autenticado.
    # ========================================================

    apiario = get_object_or_404(
        Apiario,
        id_apiario=id_apiario,
        id_apicultor=apicultor
    )


    # ========================================================
    # ESTADO Y OBSERVACIÓN ORIGINALES
    #
    # Se utilizan para detectar si el apicultor está
    # cambiando realmente la condición del apiario.
    # ========================================================

    estado_original = (
        apiario.estadoapiario
        or ""
    ).strip()


    descripcion_original = (
        apiario.descripcion
        or ""
    ).strip()


    # ========================================================
    # 3. ORIGEN DEL FORMULARIO
    #
    # Esto nos permite saber si el usuario realizó
    # la edición desde:
    #
    # - Mis Apiarios
    # - Detalle del Apiario
    # ========================================================

    origen = (
        request.POST
        .get(
            "origen",
            ""
        )
        .strip()
    )


    # ========================================================
    # FUNCIÓN DE REDIRECCIÓN
    # ========================================================

    def redireccionar():

        if origen == "detalle_apiario":

            return redirect(
                "detalle_apiario_apicultor",
                id_apiario=apiario.id_apiario
            )

        return redirect(
            "apiarios_apicultor"
        )


    # ========================================================
    # 4. DATOS EDITABLES
    # ========================================================

    estado = (
        request.POST
        .get(
            "estado",
            ""
        )
        .strip()
    )


    descripcion = (
        request.POST
        .get(
            "descripcion",
            ""
        )
        .strip()
    )


    nueva_imagen = (
        request.FILES
        .get(
            "imagen"
        )
    )


    # ========================================================
    # 5. ESTADOS PERMITIDOS
    # ========================================================

    estados_validos = [
        "Bueno",
        "Precaución",
        "Deficiente",
    ]


    # ========================================================
    # 6. VALIDAR ESTADO
    # ========================================================

    if estado not in estados_validos:

        messages.error(
            request,
            "Selecciona un estado válido para el apiario."
        )

        return redireccionar()


    # ========================================================
    # 7. VALIDAR OBSERVACIONES
    # ========================================================

    if len(descripcion) > 1000:

        messages.error(
            request,
            "Las observaciones no pueden superar "
            "los 1000 caracteres."
        )

        return redireccionar()


    if (
        estado in {
            "Precaución",
            "Deficiente",
        }
        and
        not descripcion
    ):

        messages.error(
            request,
            (
                "Debes indicar en las observaciones "
                f'el motivo por el que el apiario está '
                f'en estado "{estado}".'
            )
        )

        return redireccionar()


    # ========================================================
    # SI CAMBIA A UN ESTADO DE ATENCIÓN,
    # DEBE ACTUALIZAR TAMBIÉN LA OBSERVACIÓN
    # ========================================================

    if (
        estado in {
            "Precaución",
            "Deficiente",
        }
        and
        estado != estado_original
        and
        descripcion == descripcion_original
    ):

        messages.error(
            request,
            (
                f'Al cambiar el apiario de "{estado_original}" '
                f'a "{estado}", debes actualizar las '
                "observaciones indicando el motivo del cambio."
            )
        )

        return redireccionar()


    # ========================================================
    # 8. VALIDAR FOTOGRAFÍA
    # ========================================================

    if nueva_imagen:

        error_imagen = validar_imagen_apiario(
            nueva_imagen
        )

        if error_imagen:

            messages.error(
                request,
                error_imagen
            )

            return redireccionar()


    # ========================================================
    # 9. ACTUALIZAR ESTADO
    # ========================================================

    apiario.estadoapiario = (
        estado
    )


    # ========================================================
    # 10. ACTUALIZAR OBSERVACIONES
    # ========================================================

    apiario.descripcion = (
        descripcion
        or
        None
    )


    campos_actualizados = [
        "estadoapiario",
        "descripcion",
    ]


    # ========================================================
    # 11. ACTUALIZAR FOTOGRAFÍA
    #
    # Si no selecciona una nueva,
    # se conserva la actual.
    # ========================================================

    if nueva_imagen:

        try:

            nueva_imagen.seek(0)

        except Exception:

            pass


        apiario.imagen = nueva_imagen


        campos_actualizados.append(
            "imagen"
        )


    # ========================================================
    # 12. GUARDAR
    # ========================================================

    try:

        apiario.save(
            update_fields=
                campos_actualizados
        )

    except Exception:

        messages.error(
            request,
            "No fue posible actualizar el apiario. "
            "Inténtalo nuevamente."
        )

        return redireccionar()


    # ========================================================
    # 13. MENSAJE
    # ========================================================

    messages.success(
        request,
        (
            f'El apiario "{apiario.nombreapiario}" '
            "fue actualizado correctamente."
        )
    )


    # ========================================================
    # 14. REGRESAR AL LUGAR DE ORIGEN
    # ========================================================

    return redireccionar()



# ============================================================
# DETALLE DE APIARIO - APICULTOR
# ============================================================

@login_required
@permiso_requerido(
    "av",
    redireccion="dashboard_apicultor"
)
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
    # REGISTROS ABIERTOS DE CADA COLMENA
    # ========================================================

    mantenimientos_pendientes_colmena = (
        Mantenimiento.objects
        .filter(
            id_colmena=OuterRef("pk"),
            estado__iexact="Pendiente"
        )
    )


    incidencias_abiertas_colmena = (
        Incidencia.objects
        .filter(
            id_colmena=OuterRef("pk")
        )
        .filter(
            Q(
                estado__iexact="Pendiente"
            )
            |
            Q(
                estado__iexact="En proceso"
            )
        )
    )


    # ========================================================
    # ÚLTIMO MANTENIMIENTO COMPLETADO
    # ========================================================

    ultimo_mantenimiento_colmena = (
        Mantenimiento.objects
        .filter(
            id_colmena=OuterRef("pk"),
            estado__iexact="Completado"
        )
        .order_by(
            "-fechaejecucion",
            "-pk"
        )
    )


    # ========================================================
    # TOTAL DE INCIDENCIAS POR COLMENA
    # ========================================================

    total_incidencias_colmena = (
        Incidencia.objects
        .filter(
            id_colmena=OuterRef("pk")
        )
        .values(
            "id_colmena"
        )
        .annotate(
            total=Count("pk")
        )
        .values(
            "total"
        )
    )


    # ========================================================
    # COLMENAS DEL APIARIO
    # ========================================================

    colmenas = (
        Colmena.objects
        .filter(
            id_apiario=apiario
        )
        .annotate(

            # -----------------------------------------------
            # TRABAJOS ABIERTOS
            # -----------------------------------------------

            tiene_mantenimiento_pendiente=Exists(
                mantenimientos_pendientes_colmena
            ),

            tiene_incidencia_abierta=Exists(
                incidencias_abiertas_colmena
            ),


            # -----------------------------------------------
            # ÚLTIMO MANTENIMIENTO
            # -----------------------------------------------

            ultimo_mantenimiento_fecha=Subquery(
                ultimo_mantenimiento_colmena
                .values(
                    "fechaejecucion"
                )[:1]
            ),


            # -----------------------------------------------
            # TOTAL DE INCIDENCIAS
            # -----------------------------------------------

            total_incidencias=Subquery(
                total_incidencias_colmena[:1]
            ),

        )
        .order_by(
            "codigocolmena"
        )
    )


    # ========================================================
    # RESUMEN DE ESTADOS
    # UNA SOLA CONSULTA
    # ========================================================

    resumen_colmenas = (
        colmenas.aggregate(

            total=Count(
                "id_colmena"
            ),

            activas=Count(
                "id_colmena",
                filter=Q(
                    estadocolmena__iexact="Activa"
                )
            ),

            revision=Count(
                "id_colmena",
                filter=Q(
                    estadocolmena__iexact="Revisión"
                )
            ),

            riesgo=Count(
                "id_colmena",
                filter=Q(
                    estadocolmena__iexact="Riesgo"
                )
            ),

            inactivas=Count(
                "id_colmena",
                filter=Q(
                    estadocolmena__iexact="Inactiva"
                )
            ),

        )
    )


    # ========================================================
    # PREPARAR INFORMACIÓN DE CADA COLMENA
    # ========================================================

    colmenas_detalle = []


    for colmena in colmenas:

        colmena.permite_nuevas_actividades = (
            colmena_esta_operativa(
                colmena
            )
        )


        colmena.total_incidencias = (
            colmena.total_incidencias
            or
            0
        )


        colmenas_detalle.append(
            {
                "colmena":
                    colmena,

                "ultimo_mantenimiento_fecha":
                    colmena.ultimo_mantenimiento_fecha,

                "total_incidencias":
                    colmena.total_incidencias,
            }
        )


    # ========================================================
    # CONTADORES
    # ========================================================

    total_colmenas = (
        resumen_colmenas["total"]
    )

    colmenas_activas = (
        resumen_colmenas["activas"]
    )

    colmenas_revision = (
        resumen_colmenas["revision"]
    )

    colmenas_riesgo = (
        resumen_colmenas["riesgo"]
    )

    colmenas_inactivas = (
        resumen_colmenas["inactivas"]
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
            total_colmenas,

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
# DATOS DINÁMICOS DEL DETALLE DE APIARIO
# ============================================================

@login_required
@permiso_requerido(
    "av",
    redireccion="dashboard_apicultor"
)
@require_GET
def datos_detalle_apiario_apicultor(
    request,
    id_apiario
):

    # ========================================================
    # APICULTOR AUTENTICADO
    # ========================================================

    apicultor = (
        Apicultor.objects
        .filter(
            user=request.user
        )
        .first()
    )


    if not apicultor:

        return JsonResponse(
            {
                "ok": False,
                "error": (
                    "El usuario no tiene un "
                    "perfil de apicultor."
                ),
            },
            status=403
        )


    # ========================================================
    # APIARIO DEL APICULTOR
    # ========================================================

    apiario = get_object_or_404(
        Apiario,
        id_apiario=id_apiario,
        id_apicultor=apicultor
    )


    # ========================================================
    # RESUMEN DE COLMENAS
    #
    # Se calcula todo en una sola consulta.
    # ========================================================

    resumen = (
        Colmena.objects
        .filter(
            id_apiario=apiario
        )
        .aggregate(

            total=
                Count(
                    "id_colmena"
                ),

            activas=
                Count(
                    "id_colmena",
                    filter=Q(
                        estadocolmena__iexact=
                            "Activa"
                    )
                ),

            revision=
                Count(
                    "id_colmena",
                    filter=Q(
                        estadocolmena__iexact=
                            "Revisión"
                    )
                ),

            riesgo=
                Count(
                    "id_colmena",
                    filter=Q(
                        estadocolmena__iexact=
                            "Riesgo"
                    )
                ),

            inactivas=
                Count(
                    "id_colmena",
                    filter=Q(
                        estadocolmena__iexact=
                            "Inactiva"
                    )
                ),

        )
    )


    # ========================================================
    # RESPUESTA
    # ========================================================

    return JsonResponse(
        {
            "ok": True,

            "resumen": {

                "total":
                    resumen["total"],

                "activas":
                    resumen["activas"],

                "revision":
                    resumen["revision"],

                "riesgo":
                    resumen["riesgo"],

                "inactivas":
                    resumen["inactivas"],

            },
        }
    )

# ============================================================
# VALIDAR SI UNA COLMENA ADMITE NUEVAS ACTIVIDADES
# ============================================================

def colmena_esta_operativa(colmena):
    """
    Indica si una colmena puede recibir nuevas actividades.

    Una colmena Inactiva conserva su historial, pero no puede recibir
    nuevos mantenimientos, incidencias ni eventos.
    """

    if not colmena:
        return False

    estado = (
        colmena.estadocolmena
        or ""
    ).strip().casefold()

    return estado != "inactiva"




# ============================================================
# RESUMEN GENERAL DE COLMENAS
# PANEL APICULTOR
# ============================================================

def obtener_resumen_colmenas_apicultor(
    apicultor
):

    # ========================================================
    # UNA SOLA CONSULTA PARA TODOS LOS CONTADORES
    # ========================================================

    return (
        Colmena.objects
        .filter(
            id_apiario__id_apicultor=
                apicultor
        )
        .aggregate(

            total=Count(
                "id_colmena"
            ),

            activas=Count(
                "id_colmena",
                filter=Q(
                    estadocolmena__iexact=
                        "Activa"
                )
            ),

            revision=Count(
                "id_colmena",
                filter=Q(
                    estadocolmena__iexact=
                        "Revisión"
                )
            ),

            riesgo=Count(
                "id_colmena",
                filter=Q(
                    estadocolmena__iexact=
                        "Riesgo"
                )
            ),

            inactivas=Count(
                "id_colmena",
                filter=Q(
                    estadocolmena__iexact=
                        "Inactiva"
                )
            ),

        )
    )


# ============================================================
# MIS COLMENAS - APICULTOR
# ============================================================

@login_required
@permiso_requerido(
    "cv",
    redireccion="dashboard_apicultor"
)
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
    # REGISTROS ABIERTOS DE CADA COLMENA
    # ========================================================

    mantenimientos_pendientes_colmena = (
        Mantenimiento.objects
        .filter(
            id_colmena=OuterRef("pk"),
            estado__iexact="Pendiente"
        )
    )


    incidencias_abiertas_colmena = (
        Incidencia.objects
        .filter(
            id_colmena=OuterRef("pk")
        )
        .filter(
            Q(
                estado__iexact="Pendiente"
            )
            |
            Q(
                estado__iexact="En proceso"
            )
        )
    )

    # ========================================================
    # ÚLTIMO MANTENIMIENTO COMPLETADO
    # ========================================================

    ultimo_mantenimiento_colmena = (
        Mantenimiento.objects
        .filter(
            id_colmena=OuterRef("pk"),
            estado__iexact="Completado"
        )
        .order_by(
            "-fechaejecucion",
            "-pk"
        )
    )


    # ========================================================
    # TOTAL DE INCIDENCIAS POR COLMENA
    # ========================================================

    total_incidencias_colmena = (
        Incidencia.objects
        .filter(
            id_colmena=OuterRef("pk")
        )
        .values(
            "id_colmena"
        )
        .annotate(
            total=Count(
                "pk"
            )
        )
        .values(
            "total"
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
        .annotate(

            # --------------------------------------------
            # TRABAJOS ABIERTOS
            # --------------------------------------------

            tiene_mantenimiento_pendiente=Exists(
                mantenimientos_pendientes_colmena
            ),

            tiene_incidencia_abierta=Exists(
                incidencias_abiertas_colmena
            ),


            # --------------------------------------------
            # ÚLTIMO MANTENIMIENTO
            # --------------------------------------------

            ultimo_mantenimiento_fecha=Subquery(
                ultimo_mantenimiento_colmena
                .values(
                    "fechaejecucion"
                )[:1]
            ),


            # --------------------------------------------
            # TOTAL DE INCIDENCIAS
            # --------------------------------------------

            total_incidencias=Subquery(
                total_incidencias_colmena[:1]
            ),

        )
        .order_by(
            "codigocolmena"
        )
    )


    # ========================================================
    # DATOS GENERALES ANTES DE FILTRAR
    #
    # Todos los contadores se obtienen mediante una única
    # consulta aggregate().
    # ========================================================

    resumen_colmenas = (
        obtener_resumen_colmenas_apicultor(
            apicultor
        )
    )


    total_colmenas = (
        resumen_colmenas["total"]
    )


    total_activas = (
        resumen_colmenas["activas"]
    )


    total_revision = (
        resumen_colmenas["revision"]
    )


    total_riesgo = (
        resumen_colmenas["riesgo"]
    )


    total_inactivas = (
        resumen_colmenas["inactivas"]
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

        # ====================================================
        # DISPONIBILIDAD PARA NUEVAS ACTIVIDADES
        # ====================================================

        colmena.permite_nuevas_actividades = (
            colmena_esta_operativa(
                colmena
            )
        )


        # ====================================================
        # NORMALIZAR TOTAL DE INCIDENCIAS
        #
        # Subquery devuelve None cuando no existe ninguna.
        # ====================================================

        colmena.total_incidencias = (
            colmena.total_incidencias
            or
            0
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
# DATOS DINÁMICOS DE MIS COLMENAS
# PANEL APICULTOR
# ============================================================

@login_required
@permiso_requerido(
    "cv",
    redireccion="dashboard_apicultor"
)
@require_GET
def datos_colmenas_apicultor(
    request
):

    # ========================================================
    # APICULTOR
    # ========================================================

    apicultor = (
        Apicultor.objects
        .filter(
            user=request.user
        )
        .first()
    )


    if not apicultor:

        return JsonResponse(
            {
                "ok": False,
                "error": (
                    "El usuario no tiene un "
                    "perfil de apicultor."
                ),
            },
            status=403
        )


    # ========================================================
    # RESUMEN
    # ========================================================

    resumen = (
        obtener_resumen_colmenas_apicultor(
            apicultor
        )
    )


    # ========================================================
    # RESPUESTA
    # ========================================================

    return JsonResponse(
        {
            "ok": True,

            "resumen": {
                "total":
                    resumen["total"],

                "activas":
                    resumen["activas"],

                "revision":
                    resumen["revision"],

                "riesgo":
                    resumen["riesgo"],

                "inactivas":
                    resumen["inactivas"],
            },
        }
    )

# ============================================================
# VALIDAR FOTOGRAFÍA DE COLMENA
# PANEL APICULTOR
# ============================================================

def validar_imagen_colmena(archivo):

    LIMITE_MB = 5

    LIMITE_BYTES = (
        LIMITE_MB
        * 1024
        * 1024
    )

    FORMATOS_VALIDOS = {
        "JPEG",
        "PNG",
        "WEBP",
    }


    # ========================================================
    # ARCHIVO
    # ========================================================

    if not archivo:

        return (
            "No se pudo leer la fotografía seleccionada."
        )


    if archivo.size <= 0:

        return (
            f'La imagen "{archivo.name}" está vacía.'
        )


    # ========================================================
    # TAMAÑO
    # ========================================================

    if archivo.size > LIMITE_BYTES:

        return (
            f'La imagen "{archivo.name}" supera '
            f"el límite de {LIMITE_MB} MB."
        )


    # ========================================================
    # TIPO MIME
    # ========================================================

    tipo_archivo = getattr(
        archivo,
        "content_type",
        ""
    )


    if (
        tipo_archivo
        and
        not tipo_archivo.startswith("image/")
    ):

        return (
            f'El archivo "{archivo.name}" '
            "no es una imagen válida."
        )


    # ========================================================
    # CONTENIDO REAL
    # ========================================================

    try:

        archivo.seek(0)

        imagen = Image.open(
            archivo
        )

        formato = (
            imagen.format
            or ""
        ).upper()

        imagen.verify()


        if formato not in FORMATOS_VALIDOS:

            return (
                f'La imagen "{archivo.name}" tiene un '
                "formato no permitido. "
                "Utiliza JPG, PNG o WEBP."
            )


    except (
        UnidentifiedImageError,
        OSError,
        ValueError,
    ):

        return (
            f'El archivo "{archivo.name}" '
            "no contiene una imagen válida."
        )


    finally:

        try:

            archivo.seek(0)

        except Exception:

            pass


    return None





# ============================================================
# EDITAR / GESTIONAR COLMENA
# PANEL APICULTOR
# ============================================================

@login_required
@permiso_requerido(
    "cv",
    redireccion="dashboard_apicultor"
)
@require_POST
def editar_colmena_apicultor(
    request,
    id_colmena
):

    # ========================================================
    # APICULTOR AUTENTICADO
    # ========================================================

    apicultor = get_object_or_404(
        Apicultor,
        user=request.user
    )


    # ========================================================
    # COLMENA
    # ========================================================

    colmena = get_object_or_404(

        Colmena.objects
        .select_related(
            "id_apiario"
        ),

        id_colmena=id_colmena,

        id_apiario__id_apicultor=
            apicultor,

    )


    # ========================================================
    # PETICIÓN AJAX
    # ========================================================

    es_ajax = (
        request.headers.get(
            "X-Requested-With"
        )
        ==
        "XMLHttpRequest"
    )


    # ========================================================
    # ESTADO ORIGINAL
    # ========================================================

    estado_original = (
        colmena.estadocolmena
        or
        ""
    ).strip()


    # ========================================================
    # ORIGEN
    # ========================================================

    origen = (
        request.POST
        .get(
            "origen",
            ""
        )
        .strip()
    )


    # ========================================================
    # REDIRECCIÓN NORMAL
    # ========================================================

    def redireccionar():

        if origen == "detalle_apiario":

            return redirect(
                "detalle_apiario_apicultor",
                id_apiario=
                    colmena.id_apiario_id
            )

        return redirect(
            "colmenas_apicultor"
        )


    # ========================================================
    # RESPONDER ERROR
    # ========================================================

    def responder_error(
        mensaje,
        status=400
    ):

        if es_ajax:

            return JsonResponse(
                {
                    "ok": False,
                    "error": mensaje,
                },
                status=status
            )


        messages.error(
            request,
            mensaje
        )


        return redireccionar()


    # ========================================================
    # DATOS
    # ========================================================

    estado = (
        request.POST
        .get(
            "estado",
            ""
        )
        .strip()
    )


    descripcion = (
        request.POST
        .get(
            "descripcion",
            ""
        )
        .strip()
    )


    nueva_imagen = (
        request.FILES
        .get(
            "imagen"
        )
    )


    # ========================================================
    # ESTADOS PERMITIDOS
    # ========================================================

    estados_validos = [

        "Activa",
        "Revisión",
        "Riesgo",
        "Inactiva",

    ]


    # ========================================================
    # VALIDAR ESTADO
    # ========================================================

    if estado not in estados_validos:

        return responder_error(
            "Selecciona un estado válido para la colmena."
        )


    # ========================================================
    # VALIDAR TRANSICIÓN A INACTIVA
    # ========================================================

    if (
        estado == "Inactiva"
        and
        estado_original != "Inactiva"
    ):

        tiene_mantenimiento_pendiente = (
            Mantenimiento.objects
            .filter(
                id_colmena=colmena,
                estado__iexact="Pendiente"
            )
            .exists()
        )


        tiene_incidencia_abierta = (
            Incidencia.objects
            .filter(
                id_colmena=colmena
            )
            .filter(
                Q(
                    estado__iexact="Pendiente"
                )
                |
                Q(
                    estado__iexact="En proceso"
                )
            )
            .exists()
        )


        if (
            tiene_mantenimiento_pendiente
            or
            tiene_incidencia_abierta
        ):

            motivos = []


            if tiene_mantenimiento_pendiente:

                motivos.append(
                    "mantenimientos pendientes"
                )


            if tiene_incidencia_abierta:

                motivos.append(
                    "incidencias pendientes o en proceso"
                )


            return responder_error(
                (
                    f'La colmena "{colmena.codigocolmena}" '
                    "no puede cambiar a Inactiva porque tiene "
                    +
                    " e ".join(
                        motivos
                    )
                    +
                    ". Finaliza esos registros antes de "
                    "inactivar la colmena."
                )
            )


    # ========================================================
    # VALIDAR DESCRIPCIÓN
    # ========================================================

    if not descripcion:

        return responder_error(
            "La descripción de la colmena no puede quedar vacía."
        )


    # ========================================================
    # VALIDAR FOTOGRAFÍA
    # ========================================================

    if nueva_imagen:

        error_imagen = (
            validar_imagen_colmena(
                nueva_imagen
            )
        )


        if error_imagen:

            return responder_error(
                error_imagen
            )


    # ========================================================
    # ACTUALIZAR DATOS
    # ========================================================

    colmena.estadocolmena = (
        estado
    )


    colmena.descripcion = (
        descripcion
    )


    campos_actualizados = [

        "estadocolmena",
        "descripcion",

    ]


    # ========================================================
    # FOTOGRAFÍA
    # ========================================================

    if nueva_imagen:

        try:

            nueva_imagen.seek(0)

        except Exception:

            pass


        colmena.imagen = (
            nueva_imagen
        )


        campos_actualizados.append(
            "imagen"
        )


    # ========================================================
    # GUARDAR
    # ========================================================

    try:

        colmena.save(
            update_fields=
                campos_actualizados
        )

    except Exception:

        return responder_error(
            "No fue posible actualizar la colmena. "
            "Inténtalo nuevamente.",
            status=500
        )


    # ========================================================
    # RESPUESTA AJAX
    # ========================================================

    if es_ajax:

        resumen = (
            obtener_resumen_colmenas_apicultor(
                apicultor
            )
        )


        imagen_url = ""

        if colmena.imagen:

            try:

                imagen_url = (
                    colmena.imagen.url
                )

            except ValueError:

                imagen_url = ""


        return JsonResponse(
            {
                "ok": True,

                "mensaje": (
                    f'La colmena "{colmena.codigocolmena}" '
                    "fue actualizada correctamente."
                ),

                "colmena": {

                    "id":
                        colmena.id_colmena,

                    "codigo":
                        colmena.codigocolmena,

                    "estado":
                        colmena.estadocolmena,

                    "descripcion":
                        colmena.descripcion,

                    "imagen_url":
                        imagen_url,

                    "permite_nuevas_actividades":
                        colmena_esta_operativa(
                            colmena
                        ),

                    "url_mantenimiento":
                        reverse(
                            "registrar_mantenimiento_apicultor",
                            args=[
                                colmena.id_colmena
                            ]
                        ),

                    "url_incidencia":
                        reverse(
                            "reportar_incidencia_apicultor",
                            args=[
                                colmena.id_colmena
                            ]
                        ),
                },

                "resumen": {

                    "total":
                        resumen["total"],

                    "activas":
                        resumen["activas"],

                    "revision":
                        resumen["revision"],

                    "riesgo":
                        resumen["riesgo"],

                    "inactivas":
                        resumen["inactivas"],
                },
            }
        )


    # ========================================================
    # RESPUESTA NORMAL
    # ========================================================

    messages.success(
        request,
        (
            f'La colmena "{colmena.codigocolmena}" '
            "fue actualizada correctamente."
        )
    )


    return redireccionar()



# ============================================================
# VALIDAR IMAGEN DE EVIDENCIA
# MANTENIMIENTOS
# ============================================================

def validar_imagen_mantenimiento(archivo):

    LIMITE_MB = 5

    LIMITE_BYTES = (
        LIMITE_MB
        * 1024
        * 1024
    )

    FORMATOS_VALIDOS = {
        "JPEG",
        "PNG",
        "WEBP",
    }


    # ========================================================
    # ARCHIVO
    # ========================================================

    if not archivo:

        return (
            "No se pudo leer una de las fotografías "
            "seleccionadas."
        )


    if archivo.size <= 0:

        return (
            f'La imagen "{archivo.name}" está vacía.'
        )


    # ========================================================
    # TAMAÑO
    # ========================================================

    if archivo.size > LIMITE_BYTES:

        return (
            f'La imagen "{archivo.name}" supera '
            f"el límite de {LIMITE_MB} MB."
        )


    # ========================================================
    # MIME
    # ========================================================

    tipo_archivo = getattr(
        archivo,
        "content_type",
        ""
    )


    if (
        tipo_archivo
        and
        not tipo_archivo.startswith("image/")
    ):

        return (
            f'El archivo "{archivo.name}" '
            "no es una imagen válida."
        )


    # ========================================================
    # VALIDAR CONTENIDO REAL
    # ========================================================

    try:

        archivo.seek(0)

        imagen = Image.open(
            archivo
        )

        formato = (
            imagen.format
            or ""
        ).upper()

        imagen.verify()


        if formato not in FORMATOS_VALIDOS:

            return (
                f'La imagen "{archivo.name}" tiene un '
                "formato no permitido. "
                "Utiliza JPG, PNG o WEBP."
            )


    except (
        UnidentifiedImageError,
        OSError,
        ValueError,
    ):

        return (
            f'El archivo "{archivo.name}" '
            "no contiene una imagen válida."
        )


    finally:

        try:
            archivo.seek(0)

        except Exception:
            pass


    return None

# ============================================================
# GUARDAR FORMULARIO DE MANTENIMIENTO CON ERROR
# ============================================================

def guardar_formulario_mantenimiento_error(
    request,
    *,
    modo,
    entidad,
    id_apiario,
    id_colmena,
    tipo,
    fecha_texto,
    prioridad,
    observaciones,
    origen="",
    id_apiario_origen="",
    id_mantenimiento=None,
):

    request.session[
        "mantenimiento_formulario_error"
    ] = {

        "modo":
            modo,

        "id_mantenimiento":
            id_mantenimiento,

        "entidad":
            entidad,

        "id_apiario":
            id_apiario,

        "id_colmena":
            id_colmena,

        "tipo":
            tipo,

        "fecha_ejecucion":
            fecha_texto,

        "prioridad":
            prioridad,

        "observaciones":
            observaciones,

        "origen":
            origen,

        "id_apiario_origen":
            id_apiario_origen,

    }

# ============================================================
# ACCESO RÁPIDO A MANTENIMIENTO
# DESDE MIS COLMENAS
# ============================================================

@login_required
@permiso_requerido(
    "mr",
    redireccion="dashboard_apicultor"
)
def registrar_mantenimiento_apicultor(
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
    # VALIDAR COLMENA Y PROPIEDAD
    # ========================================================

    colmena = get_object_or_404(

        Colmena,

        id_colmena=
            id_colmena,

        id_apiario__id_apicultor=
            apicultor,

    )


    # ========================================================
    # COLMENA INACTIVA
    # ========================================================

    if not colmena_esta_operativa(
        colmena
    ):

        messages.error(
            request,
            (
                f'La colmena "{colmena.codigocolmena}" '
                "se encuentra inactiva y no puede recibir "
                "nuevos mantenimientos."
            )
        )

        return redirect(
            "colmenas_apicultor"
        )


    # ========================================================
    # ABRIR FORMULARIO PRINCIPAL DE MANTENIMIENTOS
    # ========================================================

    url = reverse(
        "mantenimientos_apicultor"
    )


    return redirect(
        f"{url}"
        f"?nuevo=1"
        f"&apiario_nuevo={colmena.id_apiario_id}"
        f"&colmena_nueva={colmena.id_colmena}"
        f"&origen=colmenas"
    )


# ============================================================
# ACCESO RÁPIDO
# REPORTAR INCIDENCIA DESDE UNA COLMENA
# ============================================================

@login_required
@permiso_requerido(
    "ir",
    redireccion="dashboard_apicultor"
)
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
    # COLMENA INACTIVA
    # ========================================================

    if not colmena_esta_operativa(
        colmena
    ):

        messages.error(
            request,
            (
                f'La colmena "{colmena.codigocolmena}" '
                "se encuentra inactiva y no puede recibir "
                "nuevas incidencias."
            )
        )

        return redirect(
            "colmenas_apicultor"
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
        f"{url}"
        f"?colmena={colmena.id_colmena}"
        f"&origen=colmenas"
    )



# ============================================================
# MANTENIMIENTOS
# PANEL APICULTOR
# ============================================================

@login_required
@permiso_requerido(
    "mr",
    redireccion="dashboard_apicultor"
)
def mantenimientos_apicultor(request):


    # ========================================================
    # APICULTOR AUTENTICADO
    # ========================================================

    apicultor = get_object_or_404(
        Apicultor,
        user=request.user
    )

    # ========================================================
    # FORMULARIO QUE REGRESA CON ERROR
    # ========================================================

    formulario_mantenimiento_error = (
        request.session.pop(
            "mantenimiento_formulario_error",
            None
        )
    )


    if not isinstance(
        formulario_mantenimiento_error,
        dict
    ):

        formulario_mantenimiento_error = None


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
    # ORIGEN DEL REGISTRO DE MANTENIMIENTO
    # ========================================================

    origen_guardado = ""

    id_apiario_origen_guardado = ""


    if (
        formulario_mantenimiento_error
        and
        formulario_mantenimiento_error.get(
            "modo"
        )
        ==
        "crear"
    ):

        origen_guardado = (
            formulario_mantenimiento_error
            .get(
                "origen",
                ""
            )
            or
            ""
        )


        id_apiario_origen_guardado = (
            formulario_mantenimiento_error
            .get(
                "id_apiario_origen",
                ""
            )
            or
            ""
        )


    origen = (
        request.GET
        .get(
            "origen",
            origen_guardado
        )
        .strip()
    )


    id_apiario_origen = (
        request.GET
        .get(
            "id_apiario_origen",
            id_apiario_origen_guardado
        )
        .strip()
    )


    # ========================================================
    # VALIDAR PÁGINA DE ORIGEN
    # ========================================================

    if (
        origen == "detalle_apiario"
        and
        id_apiario_origen.isdigit()
    ):

        apiario_origen = (
            apiarios
            .filter(
                id_apiario=int(
                    id_apiario_origen
                )
            )
            .first()
        )


        if apiario_origen:

            url_cancelar_mantenimiento = reverse(
                "detalle_apiario_apicultor",
                kwargs={
                    "id_apiario":
                        apiario_origen.id_apiario
                }
            )

        else:

            origen = ""
            id_apiario_origen = ""


    elif origen == "colmenas":

        url_cancelar_mantenimiento = reverse(
            "colmenas_apicultor"
        )

        id_apiario_origen = ""


    else:

        origen = ""
        id_apiario_origen = ""


    # ========================================================
    # COLMENAS DEL APICULTOR
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


    # ========================================================
    # COLMENAS DISPONIBLES PARA NUEVOS MANTENIMIENTOS
    #
    # Conservamos "colmenas" completo para historial/edición.
    # El formulario de creación debe usar "colmenas_operativas".
    # ========================================================

    colmenas_operativas = (
        colmenas
        .exclude(
            estadocolmena__iexact="Inactiva"
        )
    )


    # ========================================================
    # REGLA DE ACCESO
    #
    # Un mantenimiento pertenece al apicultor cuando:
    #
    # 1. Está directamente asociado a uno de sus apiarios.
    #
    # O
    #
    # 2. Está asociado a una colmena perteneciente
    #    a uno de sus apiarios.
    # ========================================================

    acceso_mantenimiento = (

        Q(
            id_apiario__id_apicultor=apicultor
        )

        |

        Q(
            id_colmena__id_apiario__id_apicultor=apicultor
        )

    )


    # ========================================================
    # EVIDENCIAS
    # ========================================================

    evidencias_antes = Prefetch(

        "evidencias",

        queryset=(
            EvidenciaMantenimiento.objects
            .filter(
                tipo=
                EvidenciaMantenimiento
                .TipoEvidencia
                .ANTES
            )
            .select_related(
                "subido_por"
            )
        ),

        to_attr=
            "evidencias_antes_apicultor"
    )


    evidencias_durante = Prefetch(

        "evidencias",

        queryset=(
            EvidenciaMantenimiento.objects
            .filter(
                tipo=
                EvidenciaMantenimiento
                .TipoEvidencia
                .DURANTE
            )
            .select_related(
                "subido_por"
            )
        ),

        to_attr=
            "evidencias_durante_apicultor"
    )


    evidencias_despues = Prefetch(

        "evidencias",

        queryset=(
            EvidenciaMantenimiento.objects
            .filter(
                tipo=
                EvidenciaMantenimiento
                .TipoEvidencia
                .DESPUES
            )
            .select_related(
                "subido_por"
            )
        ),

        to_attr=
            "evidencias_despues_apicultor"
    )


    # ========================================================
    # TODOS LOS MANTENIMIENTOS DEL APICULTOR
    # ========================================================

    mantenimientos_base = (

        Mantenimiento.objects

        .select_related(
            "id_apiario",
            "id_colmena",
            "id_colmena__id_apiario"
        )

        .filter(
            acceso_mantenimiento
        )

        .distinct()

        .prefetch_related(
            evidencias_antes,
            evidencias_durante,
            evidencias_despues,
        )

    )


    # ========================================================
    # CONTADORES
    # ANTES DE APLICAR FILTROS
    # ========================================================

    total_mantenimientos = (
        mantenimientos_base.count()
    )


    total_pendientes = (
        mantenimientos_base
        .filter(
            estado="Pendiente"
        )
        .count()
    )


    total_completados = (
        mantenimientos_base
        .filter(
            estado="Completado"
        )
        .count()
    )


    total_cancelados = (
        mantenimientos_base
        .filter(
            estado="Cancelado"
        )
        .count()
    )


    # ========================================================
    # FILTROS
    # ========================================================

    busqueda = (
        request.GET
        .get(
            "q",
            ""
        )
        .strip()
    )


    apiario_seleccionado = (
        request.GET
        .get(
            "apiario",
            ""
        )
        .strip()
    )


    estado_seleccionado = (
        request.GET
        .get(
            "estado",
            ""
        )
        .strip()
    )


    prioridad_seleccionada = (
        request.GET
        .get(
            "prioridad",
            ""
        )
        .strip()
    )


    estados_disponibles = [
        "Pendiente",
        "Completado",
        "Cancelado",
    ]


    prioridades_disponibles = [
        "Baja",
        "Media",
        "Alta",
        "Crítica",
    ]


    mantenimientos = (
        mantenimientos_base
    )


    # ========================================================
    # TRABAJOS ACTIVOS POR DEFECTO
    # ========================================================

    if not estado_seleccionado:

        mantenimientos = (
            mantenimientos.exclude(
                estado__in=[
                    "Completado",
                    "Cancelado",
                ]
            )
        )


    # ========================================================
    # BÚSQUEDA
    # ========================================================

    if busqueda:

        mantenimientos = (
            mantenimientos.filter(

                Q(
                    tipo__icontains=busqueda
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
        )


    # ========================================================
    # FILTRO POR APIARIO
    # ========================================================

    if apiario_seleccionado.isdigit():

        id_apiario_filtro = int(
            apiario_seleccionado
        )


        # Verificar que sea suyo.

        if apiarios.filter(
            id_apiario=id_apiario_filtro
        ).exists():

            mantenimientos = (
                mantenimientos.filter(

                    Q(
                        id_apiario_id=
                        id_apiario_filtro
                    )

                    |

                    Q(
                        id_colmena__id_apiario_id=
                        id_apiario_filtro
                    )

                )
                .distinct()
            )


    # ========================================================
    # FILTRO POR ESTADO
    # ========================================================

    if (
        estado_seleccionado
        and
        estado_seleccionado
        in estados_disponibles
    ):

        mantenimientos = (
            mantenimientos.filter(
                estado=
                estado_seleccionado
            )
        )


    # ========================================================
    # FILTRO POR PRIORIDAD
    # ========================================================

    if (
        prioridad_seleccionada
        and
        prioridad_seleccionada
        in prioridades_disponibles
    ):

        mantenimientos = (
            mantenimientos.filter(
                prioridad=
                prioridad_seleccionada
            )
        )


    # ========================================================
    # ORDEN
    # ========================================================

    mantenimientos = (
        mantenimientos
        .order_by(
            "-fechaejecucion",
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


    pagina = request.GET.get(
        "page"
    )


    # ========================================================
    # SI UNA EDICIÓN REGRESA CON ERROR,
    # BUSCAR LA PÁGINA DONDE ESTÁ ESE MANTENIMIENTO
    # ========================================================

    if (
        not pagina
        and
        formulario_mantenimiento_error
        and
        formulario_mantenimiento_error.get(
            "modo"
        )
        ==
        "editar"
    ):

        id_mantenimiento_error = (
            formulario_mantenimiento_error
            .get(
                "id_mantenimiento"
            )
        )


        if str(
            id_mantenimiento_error
            or
            ""
        ).isdigit():

            ids_mantenimientos = list(

                mantenimientos
                .values_list(
                    "id_mantenimiento",
                    flat=True
                )

            )


            try:

                indice_mantenimiento = (
                    ids_mantenimientos.index(
                        int(
                            id_mantenimiento_error
                        )
                    )
                )


                pagina = (
                    indice_mantenimiento
                    //
                    10
                ) + 1


            except ValueError:

                pass


    mantenimientos_pagina = (
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
            apiarios,

        "origen":
            origen,

        "id_apiario_origen":
            id_apiario_origen,

        "url_cancelar_mantenimiento":
            url_cancelar_mantenimiento,

        "colmenas":
            colmenas,

        "colmenas_operativas":
            colmenas_operativas,

        "mantenimientos":
            mantenimientos_pagina,

        "formulario_mantenimiento_error":
            formulario_mantenimiento_error,


        # ----------------------------------------------------
        # CONTADORES
        # ----------------------------------------------------

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


        # ----------------------------------------------------
        # FILTROS
        # ----------------------------------------------------

        "busqueda":
            busqueda,

        "apiario_seleccionado":
            apiario_seleccionado,

        "estado_seleccionado":
            estado_seleccionado,

        "prioridad_seleccionada":
            prioridad_seleccionada,


        # ----------------------------------------------------
        # OPCIONES
        # ----------------------------------------------------

        "estados_disponibles":
            estados_disponibles,

        "prioridades_disponibles":
            prioridades_disponibles,


        # ----------------------------------------------------
        # EVIDENCIAS
        # ----------------------------------------------------

        "max_evidencias_mantenimiento":
            6,

        "max_tamano_imagen_mb":
            5,

        "fecha_hoy":
            timezone.localdate(),

    }


    return render(
        request,
        "panel_apicultor/mantenimientos.html",
        contexto
    )



# ============================================================
# CREAR MANTENIMIENTO
# PANEL APICULTOR
# ============================================================

@login_required
@permiso_requerido(
    "mr",
    redireccion="dashboard_apicultor"
)
@require_POST
def crear_mantenimiento_apicultor(request):

    # ========================================================
    # 1. CONFIGURACIÓN
    # ========================================================

    MAX_EVIDENCIAS = 6


    # ========================================================
    # 2. APICULTOR AUTENTICADO
    # ========================================================

    apicultor = get_object_or_404(
        Apicultor,
        user=request.user
    )

    # ========================================================
    # PÁGINA DE ORIGEN
    # ========================================================

    origen = (
        request.POST
        .get(
            "origen",
            ""
        )
        .strip()
    )


    id_apiario_origen = (
        request.POST
        .get(
            "id_apiario_origen",
            ""
        )
        .strip()
    )


    apiario_origen = None


    if (
        origen == "detalle_apiario"
        and
        id_apiario_origen.isdigit()
    ):

        apiario_origen = (
            Apiario.objects
            .filter(
                id_apiario=int(
                    id_apiario_origen
                ),
                id_apicultor=apicultor
            )
            .first()
        )


    # ========================================================
    # 3. DATOS DEL FORMULARIO
    # ========================================================

    entidad = (
        request.POST
        .get(
            "entidad_mantenimiento",
            ""
        )
        .strip()
    )


    id_apiario = (
        request.POST
        .get(
            "id_apiario",
            ""
        )
        .strip()
    )


    id_colmena = (
        request.POST
        .get(
            "id_colmena",
            ""
        )
        .strip()
    )


    tipo = (
        request.POST
        .get(
            "tipo",
            ""
        )
        .strip()
    )


    fecha_texto = (
        request.POST
        .get(
            "fecha_ejecucion",
            ""
        )
        .strip()
    )


    prioridad = (
        request.POST
        .get(
            "prioridad",
            ""
        )
        .strip()
    )


    observaciones = (
        request.POST
        .get(
            "observaciones",
            ""
        )
        .strip()
    )


    # ========================================================
    # 4. EVIDENCIAS FOTOGRÁFICAS
    # ========================================================

    evidencias_antes = (
        request.FILES.getlist(
            "evidencias_antes"
        )
    )


    evidencias_durante = (
        request.FILES.getlist(
            "evidencias_durante"
        )
    )


    evidencias_despues = (
        request.FILES.getlist(
            "evidencias_despues"
        )
    )


    todas_evidencias = (
        evidencias_antes
        +
        evidencias_durante
        +
        evidencias_despues
    )


    # ========================================================
    # 5. VALIDACIONES GENERALES
    # ========================================================

    errores = []


    # ========================================================
    # 5.1 ENTIDAD
    # ========================================================

    entidades_validas = [
        "Apiario",
        "Colmena",
    ]


    if entidad not in entidades_validas:

        errores.append(
            (
                "Debes indicar si el mantenimiento "
                "corresponde a un apiario o una colmena."
            )
        )


    # ========================================================
    # 5.2 TIPO DE MANTENIMIENTO
    # ========================================================

    if not tipo:

        errores.append(
            "Debes indicar la tarea de mantenimiento."
        )


    elif len(tipo) > 100:

        errores.append(
            (
                "La tarea no puede superar "
                "los 100 caracteres."
            )
        )


    # ========================================================
    # 5.3 PRIORIDAD
    # ========================================================

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


    # ========================================================
    # 5.4 OBSERVACIONES
    # ========================================================

    if len(observaciones) > 255:

        errores.append(
            (
                "Las observaciones no pueden superar "
                "los 255 caracteres."
            )
        )


    # ========================================================
    # 6. VALIDAR FECHA
    # ========================================================

    fecha_ejecucion = None


    try:

        fecha_ejecucion = (
            datetime.strptime(
                fecha_texto,
                "%Y-%m-%d"
            )
            .date()
        )


    except (
        TypeError,
        ValueError,
    ):

        errores.append(
            "Selecciona una fecha válida."
        )


    # ========================================================
    # NO PERMITIR FECHAS ANTERIORES A HOY
    # ========================================================

    if (
        fecha_ejecucion
        and
        fecha_ejecucion < timezone.localdate()
    ):

        errores.append(
            (
                "La fecha programada no puede "
                "ser anterior a hoy."
            )
        )


    # ========================================================
    # 7. VALIDAR APIARIO
    #
    # El apicultor solo puede seleccionar
    # apiarios que le pertenecen.
    # ========================================================

    apiario = None


    if id_apiario.isdigit():

        apiario = (
            Apiario.objects
            .filter(
                id_apiario=int(
                    id_apiario
                ),
                id_apicultor=apicultor
            )
            .first()
        )


    if not apiario:

        errores.append(
            (
                "El apiario seleccionado no pertenece "
                "a tus apiarios asignados."
            )
        )


    # ========================================================
    # 8. VALIDAR COLMENA
    #
    # Solamente es obligatoria cuando el mantenimiento
    # corresponde específicamente a una colmena.
    # ========================================================

    colmena = None


    if (
        entidad == "Colmena"
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

                    id_apiario__id_apicultor=
                        apicultor,

                )
                .first()
            )


            # =================================================
            # LA COLMENA NO EXISTE O NO LE PERTENECE
            # =================================================

            if not colmena:

                errores.append(
                    (
                        "La colmena seleccionada no pertenece "
                        "al apiario indicado."
                    )
                )


            # =================================================
            # COLMENA INACTIVA
            # =================================================

            elif not colmena_esta_operativa(
                colmena
            ):

                errores.append(
                    (
                        f'La colmena "{colmena.codigocolmena}" '
                        "se encuentra inactiva y no puede recibir "
                        "nuevos mantenimientos."
                    )
                )


    # ========================================================
    # 9. VALIDAR CANTIDAD DE EVIDENCIAS
    # ========================================================

    cantidad_evidencias = len(
        todas_evidencias
    )


    if cantidad_evidencias > MAX_EVIDENCIAS:

        errores.append(
            (
                "Puedes agregar un máximo de "
                f"{MAX_EVIDENCIAS} fotografías "
                "por mantenimiento."
            )
        )


    # ========================================================
    # 10. VALIDAR CADA IMAGEN
    # ========================================================

    if cantidad_evidencias <= MAX_EVIDENCIAS:

        for imagen in todas_evidencias:

            error_imagen = (
                validar_imagen_mantenimiento(
                    imagen
                )
            )


            if error_imagen:

                errores.append(
                    error_imagen
                )


    # ========================================================
    # 11. SI EXISTEN ERRORES
    # ========================================================

    if errores:

        guardar_formulario_mantenimiento_error(

            request,

            modo="crear",

            entidad=
                entidad,

            id_apiario=
                id_apiario,

            id_colmena=
                id_colmena,

            tipo=
                tipo,

            fecha_texto=
                fecha_texto,

            prioridad=
                prioridad,

            observaciones=
                observaciones,

            origen=
                origen,

            id_apiario_origen=
                id_apiario_origen,

        )


        for error in errores:

            messages.error(
                request,
                error
            )


        if todas_evidencias:

            messages.info(
                request,
                (
                    "Por seguridad del navegador, "
                    "debes seleccionar nuevamente "
                    "las fotografías."
                )
            )


        return redirect(
            "mantenimientos_apicultor"
        )


    # ========================================================
    # 12. RESPONSABLE
    # ========================================================

    responsable = (
        request.user
        .get_full_name()
        .strip()
    )


    if not responsable:

        responsable = (
            request.user.username
        )


    # ========================================================
    # 13. CREAR MANTENIMIENTO + EVIDENCIAS
    #
    # Se utiliza transaction.atomic() para que, si ocurre
    # un error al guardar una evidencia, tampoco quede
    # creado un mantenimiento incompleto.
    # ========================================================

    try:

        with transaction.atomic():

            # =================================================
            # CREAR MANTENIMIENTO
            # =================================================

            mantenimiento = (
                Mantenimiento.objects.create(

                    # -----------------------------------------
                    # UBICACIÓN
                    # -----------------------------------------

                    id_apiario=
                        apiario,

                    id_colmena=
                        colmena,


                    # -----------------------------------------
                    # ENTIDAD
                    # -----------------------------------------

                    entidadmantenimiento=
                        entidad,


                    # -----------------------------------------
                    # INFORMACIÓN
                    # -----------------------------------------

                    tipo=
                        tipo,

                    fechaejecucion=
                        fecha_ejecucion,

                    estado=
                        "Pendiente",

                    prioridad=
                        prioridad,

                    observaciones=
                        observaciones,


                    # -----------------------------------------
                    # RESPONSABLE
                    # -----------------------------------------

                    responsable=
                        responsable,

                )
            )


            # =================================================
            # 14. EVIDENCIAS - ANTES
            # =================================================

            for imagen in evidencias_antes:

                try:

                    imagen.seek(0)

                except Exception:

                    pass


                EvidenciaMantenimiento.objects.create(

                    id_mantenimiento=
                        mantenimiento,

                    tipo=(
                        EvidenciaMantenimiento
                        .TipoEvidencia
                        .ANTES
                    ),

                    imagen=
                        imagen,

                    subido_por=
                        request.user,

                )


            # =================================================
            # 15. EVIDENCIAS - DURANTE
            # =================================================

            for imagen in evidencias_durante:

                try:

                    imagen.seek(0)

                except Exception:

                    pass


                EvidenciaMantenimiento.objects.create(

                    id_mantenimiento=
                        mantenimiento,

                    tipo=(
                        EvidenciaMantenimiento
                        .TipoEvidencia
                        .DURANTE
                    ),

                    imagen=
                        imagen,

                    subido_por=
                        request.user,

                )


            # =================================================
            # 16. EVIDENCIAS - DESPUÉS
            # =================================================

            for imagen in evidencias_despues:

                try:

                    imagen.seek(0)

                except Exception:

                    pass


                EvidenciaMantenimiento.objects.create(

                    id_mantenimiento=
                        mantenimiento,

                    tipo=(
                        EvidenciaMantenimiento
                        .TipoEvidencia
                        .DESPUES
                    ),

                    imagen=
                        imagen,

                    subido_por=
                        request.user,

                )


    # ========================================================
    # ERROR AL CREAR EL MANTENIMIENTO
    # ========================================================

    except Exception as error:

        print(
            "ERROR CREANDO MANTENIMIENTO APICULTOR:",
            type(error).__name__,
            error
        )

        guardar_formulario_mantenimiento_error(

            request,

            modo="crear",

            entidad=
                entidad,

            id_apiario=
                id_apiario,

            id_colmena=
                id_colmena,

            tipo=
                tipo,

            fecha_texto=
                fecha_texto,

            prioridad=
                prioridad,

            observaciones=
                observaciones,

            origen=
                origen,

            id_apiario_origen=
                id_apiario_origen,

        )

        messages.error(
            request,
            (
                "No fue posible registrar el mantenimiento. "
                "Inténtalo nuevamente."
            )
        )

        if todas_evidencias:

            messages.info(
                request,
                (
                    "Por seguridad del navegador, "
                    "debes seleccionar nuevamente "
                    "las fotografías."
                )
            )


        return redirect(
            "mantenimientos_apicultor"
        )


    # ========================================================
    # 17. NOTIFICAR A LOS ADMINISTRADORES
    #
    # Esta parte ocurre DESPUÉS de que el mantenimiento
    # quedó guardado correctamente.
    #
    # Si falla solamente la notificación, NO se elimina
    # el mantenimiento.
    # ========================================================

    try:

        resultado_notificaciones = (
            notificar_mantenimiento_creado(
                mantenimiento
            )
        )


        print(
            "NOTIFICACIONES MANTENIMIENTO A ADMIN:",
            resultado_notificaciones
        )


    except Exception as error:

        print(
            "ERROR NOTIFICANDO MANTENIMIENTO A ADMIN:",
            type(error).__name__,
            error
        )


    # ========================================================
    # 18. MENSAJE DE ÉXITO
    # ========================================================

    messages.success(
        request,
        "El mantenimiento fue registrado correctamente."
    )


    # ========================================================
    # 19. REGRESAR A DETALLE DE APIARIO
    # ========================================================

    if (
        apiario_origen
        and
        apiario
        and
        apiario_origen.id_apiario
        ==
        apiario.id_apiario
    ):

        return redirect(
            "detalle_apiario_apicultor",
            id_apiario=
                apiario_origen.id_apiario
        )


    # ========================================================
    # REGRESAR A MIS COLMENAS
    # ========================================================

    if origen == "colmenas":

        return redirect(
            "colmenas_apicultor"
        )


    # ========================================================
    # REGRESAR A MANTENIMIENTOS
    # ========================================================

    return redirect(
        "mantenimientos_apicultor"
    )



# ============================================================
# EDITAR MANTENIMIENTO
# PANEL APICULTOR
# ============================================================

@login_required
@permiso_requerido(
    "mr",
    redireccion="dashboard_apicultor"
)
@require_POST
def editar_mantenimiento_apicultor(
    request,
    id_mantenimiento
):

    MAX_EVIDENCIAS = 6


    # ========================================================
    # APICULTOR
    # ========================================================

    apicultor = get_object_or_404(
        Apicultor,
        user=request.user
    )


    # ========================================================
    # ACCESO
    # ========================================================

    acceso_mantenimiento = (

        Q(
            id_apiario__id_apicultor=apicultor
        )

        |

        Q(
            id_colmena__id_apiario__id_apicultor=apicultor
        )

    )


    mantenimiento = get_object_or_404(

        Mantenimiento.objects
        .filter(
            acceso_mantenimiento
        )
        .distinct(),

        id_mantenimiento=
            id_mantenimiento
    )

    # ========================================================
    # SOLO LOS PENDIENTES PUEDEN EDITARSE
    # ========================================================

    if mantenimiento.estado != "Pendiente":

        messages.error(
            request,
            (
                "Este mantenimiento ya está cerrado "
                "y no puede modificarse."
            )
        )

        return redirect(
            "mantenimientos_apicultor"
        )


    # ========================================================
    # DATOS
    # ========================================================

    entidad = (
        request.POST
        .get(
            "entidad_mantenimiento",
            ""
        )
        .strip()
    )


    id_apiario = (
        request.POST
        .get(
            "id_apiario",
            ""
        )
        .strip()
    )


    id_colmena = (
        request.POST
        .get(
            "id_colmena",
            ""
        )
        .strip()
    )


    tipo = (
        request.POST
        .get(
            "tipo",
            ""
        )
        .strip()
    )


    fecha_texto = (
        request.POST
        .get(
            "fecha_ejecucion",
            ""
        )
        .strip()
    )

    prioridad = (
        request.POST
        .get(
            "prioridad",
            ""
        )
        .strip()
    )


    observaciones = (
        request.POST
        .get(
            "observaciones",
            ""
        )
        .strip()
    )


    # ========================================================
    # FOTOS NUEVAS
    # ========================================================

    evidencias_antes = (
        request.FILES.getlist(
            "evidencias_antes"
        )
    )


    evidencias_durante = (
        request.FILES.getlist(
            "evidencias_durante"
        )
    )


    evidencias_despues = (
        request.FILES.getlist(
            "evidencias_despues"
        )
    )


    nuevas_evidencias = (
        evidencias_antes
        +
        evidencias_durante
        +
        evidencias_despues
    )


    # ========================================================
    # VALIDACIONES
    # ========================================================

    errores = []


    if entidad not in [
        "Apiario",
        "Colmena",
    ]:

        errores.append(
            "Selecciona un alcance válido."
        )


    if not tipo:

        errores.append(
            "La tarea del mantenimiento es obligatoria."
        )


    elif len(tipo) > 100:

        errores.append(
            "La tarea no puede superar los 100 caracteres."
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


    if len(observaciones) > 255:

        errores.append(
            "Las observaciones no pueden superar "
            "los 255 caracteres."
        )


    # ========================================================
    # APIARIO
    # ========================================================

    apiario = None


    if id_apiario.isdigit():

        apiario = (
            Apiario.objects
            .filter(
                id_apiario=int(
                    id_apiario
                ),
                id_apicultor=apicultor
            )
            .first()
        )


    if not apiario:

        errores.append(
            "El apiario seleccionado no pertenece "
            "a tus apiarios asignados."
        )


    # ========================================================
    # COLMENA
    # ========================================================

    colmena = None


    if (
        entidad == "Colmena"
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

            elif not colmena_esta_operativa(
                colmena
            ):

                misma_colmena_historica = (
                    mantenimiento.id_colmena_id
                    ==
                    colmena.id_colmena
                )

                if not misma_colmena_historica:

                    errores.append(
                        f'La colmena "{colmena.codigocolmena}" '
                        "se encuentra inactiva y no puede recibir "
                        "nuevos mantenimientos."
                    )


    # ========================================================
    # FECHA
    # ========================================================

    fecha_ejecucion = None


    try:

        fecha_ejecucion = datetime.strptime(
            fecha_texto,
            "%Y-%m-%d"
        ).date()


    except (
        TypeError,
        ValueError,
    ):

        errores.append(
            "Selecciona una fecha válida."
        )


    hoy = timezone.localdate()


    if fecha_ejecucion:

        fecha_original = (
            mantenimiento.fechaejecucion
        )


        # Si la fecha original ya venció,
        # solamente permitimos conservarla.

        if (
            fecha_original
            and
            fecha_original < hoy
        ):

            if fecha_ejecucion != fecha_original:

                errores.append(
                    "La fecha de este mantenimiento ya venció "
                    "y no puede modificarse."
                )


        elif fecha_ejecucion < hoy:

            errores.append(
                "La fecha programada no puede ser anterior a hoy."
            )


    # ========================================================
    # FOTOS
    # ========================================================

    cantidad_existente = (
        mantenimiento
        .evidencias
        .count()
    )


    cantidad_total = (
        cantidad_existente
        +
        len(
            nuevas_evidencias
        )
    )


    if cantidad_total > MAX_EVIDENCIAS:

        disponibles = max(
            0,
            MAX_EVIDENCIAS
            -
            cantidad_existente
        )


        errores.append(
            "Este mantenimiento puede tener máximo "
            "6 fotografías en total. "
            f"Actualmente puedes agregar {disponibles} más."
        )


    if cantidad_total <= MAX_EVIDENCIAS:

        for imagen in nuevas_evidencias:

            error_imagen = (
                validar_imagen_mantenimiento(
                    imagen
                )
            )


            if error_imagen:

                errores.append(
                    error_imagen
                )


    # ========================================================
    # ERRORES
    # ========================================================

    if errores:

        guardar_formulario_mantenimiento_error(

            request,

            modo="editar",

            id_mantenimiento=
                mantenimiento.id_mantenimiento,

            entidad=
                entidad,

            id_apiario=
                id_apiario,

            id_colmena=
                id_colmena,

            tipo=
                tipo,

            fecha_texto=
                fecha_texto,

            prioridad=
                prioridad,

            observaciones=
                observaciones,

        )


        for error in errores:

            messages.error(
                request,
                error
            )


        if nuevas_evidencias:

            messages.info(
                request,
                (
                    "Por seguridad del navegador, "
                    "debes seleccionar nuevamente "
                    "las fotografías nuevas."
                )
            )


        return redirect(
            "mantenimientos_apicultor"
        )


    # ========================================================
    # ACTUALIZAR
    # ========================================================

    try:

        with transaction.atomic():


            mantenimiento.id_apiario = (
                apiario
            )


            mantenimiento.id_colmena = (
                colmena
            )


            mantenimiento.entidadmantenimiento = (
                entidad
            )


            mantenimiento.tipo = (
                tipo
            )


            mantenimiento.fechaejecucion = (
                fecha_ejecucion
            )

            mantenimiento.prioridad = (
                prioridad
            )


            mantenimiento.observaciones = (
                observaciones
            )


            # IMPORTANTE:
            # no modificamos responsable.
            #
            # Si el Admin creó el mantenimiento,
            # conservamos el dato original.

            mantenimiento.save()


            # ==================================================
            # EVIDENCIAS ANTES
            # ==================================================

            for imagen in evidencias_antes:

                imagen.seek(0)

                EvidenciaMantenimiento.objects.create(

                    id_mantenimiento=
                        mantenimiento,

                    tipo=
                        EvidenciaMantenimiento
                        .TipoEvidencia
                        .ANTES,

                    imagen=
                        imagen,

                    subido_por=
                        request.user,
                )


            # ==================================================
            # EVIDENCIAS DURANTE
            # ==================================================

            for imagen in evidencias_durante:

                imagen.seek(0)

                EvidenciaMantenimiento.objects.create(

                    id_mantenimiento=
                        mantenimiento,

                    tipo=
                        EvidenciaMantenimiento
                        .TipoEvidencia
                        .DURANTE,

                    imagen=
                        imagen,

                    subido_por=
                        request.user,
                )


            # ==================================================
            # EVIDENCIAS DESPUÉS
            # ==================================================

            for imagen in evidencias_despues:

                imagen.seek(0)

                EvidenciaMantenimiento.objects.create(

                    id_mantenimiento=
                        mantenimiento,

                    tipo=
                        EvidenciaMantenimiento
                        .TipoEvidencia
                        .DESPUES,

                    imagen=
                        imagen,

                    subido_por=
                        request.user,
                )


    except Exception:

        guardar_formulario_mantenimiento_error(

            request,

            modo="editar",

            id_mantenimiento=
                mantenimiento.id_mantenimiento,

            entidad=
                entidad,

            id_apiario=
                id_apiario,

            id_colmena=
                id_colmena,

            tipo=
                tipo,

            fecha_texto=
                fecha_texto,

            prioridad=
                prioridad,

            observaciones=
                observaciones,

        )


        messages.error(
            request,
            "No fue posible actualizar el mantenimiento."
        )


        if nuevas_evidencias:

            messages.info(
                request,
                (
                    "Por seguridad del navegador, "
                    "debes seleccionar nuevamente "
                    "las fotografías nuevas."
                )
            )


        return redirect(
            "mantenimientos_apicultor"
        )


    messages.success(
        request,
        "El mantenimiento fue actualizado correctamente."
    )


    return redirect(
        "mantenimientos_apicultor"
    )



# ============================================================
# COMPLETAR MANTENIMIENTO
# PANEL APICULTOR
# ============================================================

@login_required
@permiso_requerido(
    "mr",
    redireccion="dashboard_apicultor"
)
@require_POST
def completar_mantenimiento_apicultor(
    request,
    id_mantenimiento
):

    apicultor = get_object_or_404(
        Apicultor,
        user=request.user
    )


    acceso_mantenimiento = (

        Q(
            id_apiario__id_apicultor=apicultor
        )

        |

        Q(
            id_colmena__id_apiario__id_apicultor=apicultor
        )

    )


    mantenimiento = get_object_or_404(

        Mantenimiento.objects
        .filter(
            acceso_mantenimiento
        )
        .distinct(),

        id_mantenimiento=
            id_mantenimiento
    )


    if mantenimiento.estado == "Cancelado":

        messages.error(
            request,
            "Un mantenimiento cancelado no puede "
            "marcarse como completado."
        )


        return redirect(
            "mantenimientos_apicultor"
        )


    if mantenimiento.estado == "Completado":

        messages.info(
            request,
            "Este mantenimiento ya estaba completado."
        )


        return redirect(
            "mantenimientos_apicultor"
        )

    # ========================================================
    # SOLO UN PENDIENTE PUEDE COMPLETARSE
    # ========================================================

    if mantenimiento.estado != "Pendiente":

        messages.error(
            request,
            (
                "El estado actual del mantenimiento "
                "no permite marcarlo como completado."
            )
        )

        return redirect(
            "mantenimientos_apicultor"
        )


    mantenimiento.estado = (
        "Completado"
    )


    mantenimiento.save(
        update_fields=[
            "estado"
        ]
    )


    messages.success(
        request,
        "Mantenimiento marcado como completado."
    )


    return redirect(
        "mantenimientos_apicultor"
    )

# ============================================================
# CANCELAR MANTENIMIENTO
# PANEL APICULTOR
# ============================================================

@login_required
@permiso_requerido(
    "mr",
    redireccion="dashboard_apicultor"
)
@require_POST
def cancelar_mantenimiento_apicultor(
    request,
    id_mantenimiento
):

    # ========================================================
    # APICULTOR
    # ========================================================

    apicultor = get_object_or_404(
        Apicultor,
        user=request.user
    )


    # ========================================================
    # ACCESO
    # ========================================================

    acceso_mantenimiento = (

        Q(
            id_apiario__id_apicultor=apicultor
        )

        |

        Q(
            id_colmena__id_apiario__id_apicultor=apicultor
        )

    )


    mantenimiento = get_object_or_404(

        Mantenimiento.objects
        .filter(
            acceso_mantenimiento
        )
        .distinct(),

        id_mantenimiento=
            id_mantenimiento
    )


    # ========================================================
    # VALIDAR ESTADO
    # ========================================================

    if mantenimiento.estado == "Completado":

        messages.error(
            request,
            (
                "Un mantenimiento completado "
                "no puede cancelarse."
            )
        )

        return redirect(
            "mantenimientos_apicultor"
        )


    if mantenimiento.estado == "Cancelado":

        messages.info(
            request,
            "Este mantenimiento ya estaba cancelado."
        )

        return redirect(
            "mantenimientos_apicultor"
        )


    if mantenimiento.estado != "Pendiente":

        messages.error(
            request,
            "El estado actual del mantenimiento no permite cancelarlo."
        )

        return redirect(
            "mantenimientos_apicultor"
        )


    # ========================================================
    # CANCELAR
    # ========================================================

    mantenimiento.estado = (
        "Cancelado"
    )


    mantenimiento.save(
        update_fields=[
            "estado"
        ]
    )


    messages.success(
        request,
        "Mantenimiento cancelado correctamente."
    )


    return redirect(
        "mantenimientos_apicultor"
    )

# ============================================================
# ACTUALIZAR OBSERVACIÓN
# PANEL APICULTOR
# ============================================================

@login_required
@permiso_requerido(
    "mr",
    redireccion="dashboard_apicultor"
)
@require_POST
def actualizar_observacion_mantenimiento_apicultor(
    request,
    id_mantenimiento
):

    apicultor = get_object_or_404(
        Apicultor,
        user=request.user
    )


    acceso_mantenimiento = (

        Q(
            id_apiario__id_apicultor=apicultor
        )

        |

        Q(
            id_colmena__id_apiario__id_apicultor=apicultor
        )

    )


    mantenimiento = get_object_or_404(

        Mantenimiento.objects
        .filter(
            acceso_mantenimiento
        )
        .distinct(),

        id_mantenimiento=
            id_mantenimiento
    )

    # ========================================================
    # SOLO LOS PENDIENTES PUEDEN MODIFICARSE
    # ========================================================

    if mantenimiento.estado != "Pendiente":

        messages.error(
            request,
            (
                "Las observaciones de un mantenimiento "
                "completado o cancelado no pueden modificarse."
            )
        )

        return redirect(
            "mantenimientos_apicultor"
        )

    observaciones = (
        request.POST
        .get(
            "observaciones",
            ""
        )
        .strip()
    )


    if len(observaciones) > 255:

        messages.error(
            request,
            "Las observaciones no pueden superar "
            "los 255 caracteres."
        )


        return redirect(
            "mantenimientos_apicultor"
        )


    mantenimiento.observaciones = (
        observaciones
    )


    mantenimiento.save(
        update_fields=[
            "observaciones"
        ]
    )


    messages.success(
        request,
        "Las observaciones fueron actualizadas."
    )


    return redirect(
        "mantenimientos_apicultor"
    )



# ============================================================
# INCIDENCIAS
# PANEL APICULTOR
# ============================================================

@login_required
@permiso_requerido(
    "ir",
    redireccion="dashboard_apicultor"
)
def incidencias_apicultor(request):

    # ========================================================
    # 1. APICULTOR AUTENTICADO
    # ========================================================

    apicultor = get_object_or_404(
        Apicultor.objects.select_related(
            "user"
        ),
        user=request.user
    )


    # ========================================================
    # 2. APIARIOS DEL APICULTOR
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
    # 3. REGLA DE ACCESO A INCIDENCIAS
    #
    # El apicultor puede ver una incidencia cuando:
    #
    # - Está asignada directamente a él.
    # - Pertenece a uno de sus apiarios.
    # - Pertenece a una colmena de uno de sus apiarios.
    #
    # Esto permite que también aparezcan incidencias
    # registradas por el administrador.
    # ========================================================

    acceso_incidencias = (

        Q(
            id_apicultor=apicultor
        )

        |

        Q(
            id_apiario__id_apicultor=apicultor
        )

        |

        Q(
            id_colmena__id_apiario__id_apicultor=apicultor
        )

    )


    # ========================================================
    # 4. CONSULTA BASE
    # ========================================================

    incidencias_base = (
        Incidencia.objects

        .filter(
            acceso_incidencias
        )

        .distinct()

        .select_related(
            "id_apicultor",
            "id_apicultor__user",
            "id_apiario",
            "id_apiario__id_apicultor",
            "id_colmena",
            "id_colmena__id_apiario",
        )

        .prefetch_related(

            # =================================================
            # EVIDENCIAS DEL PROBLEMA
            # =================================================

            Prefetch(
                "evidencias",

                queryset=(
                    EvidenciaIncidencia.objects

                    .filter(
                        tipo=(
                            EvidenciaIncidencia
                            .TipoEvidencia
                            .PROBLEMA
                        )
                    )

                    .select_related(
                        "subido_por"
                    )

                    .order_by(
                        "fecha_registro",
                        "id_evidencia"
                    )
                ),

                to_attr="evidencias_problema_modal"
            ),


            # =================================================
            # EVIDENCIAS DE LA SOLUCIÓN
            # =================================================

            Prefetch(
                "evidencias",

                queryset=(
                    EvidenciaIncidencia.objects

                    .filter(
                        tipo=(
                            EvidenciaIncidencia
                            .TipoEvidencia
                            .SOLUCION
                        )
                    )

                    .select_related(
                        "subido_por"
                    )

                    .order_by(
                        "fecha_registro",
                        "id_evidencia"
                    )
                ),

                to_attr="evidencias_solucion_modal"
            ),

        )
    )


    # ========================================================
    # 5. ESTADOS OFICIALES
    # ========================================================

    estados_disponibles = [
        "Pendiente",
        "En proceso",
        "Resuelta",
    ]


    # ========================================================
    # 6. PRIORIDADES OFICIALES
    # ========================================================

    prioridades_disponibles = [
        "Baja",
        "Media",
        "Alta",
        "Crítica",
    ]


    # ========================================================
    # 7. CONTADORES GENERALES
    #
    # Estos contadores representan todas las incidencias
    # disponibles para el apicultor, independientemente
    # de los filtros seleccionados.
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
    # 8. FILTROS GET
    # ========================================================

    busqueda = (
        request.GET.get(
            "q",
            ""
        )
        .strip()
    )


    apiario_seleccionado = (
        request.GET.get(
            "apiario",
            ""
        )
        .strip()
    )


    estado_seleccionado = (
        request.GET.get(
            "estado",
            ""
        )
        .strip()
    )


    prioridad_seleccionada = (
        request.GET.get(
            "prioridad",
            ""
        )
        .strip()
    )


    # ========================================================
    # 9. CONSULTA FILTRABLE
    # ========================================================

    incidencias = incidencias_base


    # ========================================================
    # 10. BUSCADOR
    #
    # Busca por:
    #
    # - Título
    # - Observaciones
    # - Responsable
    # - Tipo de entidad
    # - Nombre del apiario
    # - Código de colmena
    # ========================================================

    if busqueda:

        incidencias = (
            incidencias.filter(

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

                |

                Q(
                    id_colmena__id_apiario__nombreapiario__icontains=busqueda
                )

            )
            .distinct()
        )


    # ========================================================
    # 11. FILTRO POR APIARIO
    #
    # Incluye:
    #
    # - Incidencias directamente asociadas al apiario.
    # - Incidencias asociadas a colmenas de ese apiario.
    # ========================================================

    if apiario_seleccionado.isdigit():

        id_apiario_filtro = int(
            apiario_seleccionado
        )


        incidencias = (
            incidencias.filter(

                Q(
                    id_apiario_id=id_apiario_filtro
                )

                |

                Q(
                    id_colmena__id_apiario_id=id_apiario_filtro
                )

            )
            .distinct()
        )


    # ========================================================
    # 12. FILTRO POR ESTADO
    # ========================================================

    if (
        estado_seleccionado
        and
        estado_seleccionado in estados_disponibles
    ):

        incidencias = (
            incidencias.filter(
                estado__iexact=estado_seleccionado
            )
        )


    # ========================================================
    # 13. FILTRO POR PRIORIDAD
    # ========================================================

    if (
        prioridad_seleccionada
        and
        prioridad_seleccionada in prioridades_disponibles
    ):

        incidencias = (
            incidencias.filter(
                prioridad__iexact=prioridad_seleccionada
            )
        )


    # ========================================================
    # 14. ORDENAMIENTO
    #
    # Primero las incidencias más recientes.
    # ========================================================

    incidencias = (
        incidencias
        .order_by(
            "-fechadeteccion",
            "-id_incidencia"
        )
    )


    # ========================================================
    # 15. PAGINACIÓN
    # ========================================================

    paginator = Paginator(
        incidencias,
        10
    )


    numero_pagina = (
        request.GET.get(
            "page"
        )
    )


    incidencias_pagina = (
        paginator.get_page(
            numero_pagina
        )
    )


    # ========================================================
    # 16. CONTEXTO
    # ========================================================

    contexto = {

        # ====================================================
        # USUARIO
        # ====================================================

        "apicultor":
            apicultor,


        # ====================================================
        # APIARIOS
        # ====================================================

        "apiarios":
            apiarios,


        # ====================================================
        # INCIDENCIAS
        # ====================================================

        "incidencias":
            incidencias_pagina,


        # ====================================================
        # CONTADORES GENERALES
        # ====================================================

        "total_incidencias":
            total_incidencias,

        "total_pendientes":
            total_pendientes,

        "total_en_proceso":
            total_en_proceso,

        "total_resueltas":
            total_resueltas,


        # ====================================================
        # RESULTADOS DESPUÉS DE FILTROS
        # ====================================================

        "total_resultados":
            paginator.count,


        # ====================================================
        # OPCIONES
        # ====================================================

        "estados_disponibles":
            estados_disponibles,

        "prioridades_disponibles":
            prioridades_disponibles,


        # ====================================================
        # FILTROS ACTUALES
        # ====================================================

        "busqueda":
            busqueda,

        "apiario_seleccionado":
            apiario_seleccionado,

        "estado_seleccionado":
            estado_seleccionado,

        "prioridad_seleccionada":
            prioridad_seleccionada,

    }


    # ========================================================
    # 17. RENDER
    # ========================================================

    return render(
        request,
        "panel_apicultor/incidencias.html",
        contexto
    )

# ============================================================
# VALIDAR IMAGEN DE EVIDENCIA
# INCIDENCIAS
# ============================================================

def validar_imagen_evidencia(archivo):

    # ========================================================
    # CONFIGURACIÓN
    # ========================================================

    LIMITE_MB = 5

    LIMITE_BYTES = (
        LIMITE_MB
        * 1024
        * 1024
    )

    FORMATOS_VALIDOS = {
        "JPEG",
        "PNG",
        "WEBP",
    }


    # ========================================================
    # ARCHIVO VACÍO
    # ========================================================

    if not archivo:

        return (
            "No se pudo leer una de las imágenes seleccionadas."
        )


    if archivo.size <= 0:

        return (
            f'La imagen "{archivo.name}" está vacía.'
        )


    # ========================================================
    # TAMAÑO
    # ========================================================

    if archivo.size > LIMITE_BYTES:

        return (
            f'La imagen "{archivo.name}" supera '
            f"el límite de {LIMITE_MB} MB."
        )


    # ========================================================
    # MIME
    # ========================================================

    tipo_archivo = getattr(
        archivo,
        "content_type",
        ""
    )


    if (
        tipo_archivo
        and
        not tipo_archivo.startswith("image/")
    ):

        return (
            f'El archivo "{archivo.name}" '
            "no es una imagen válida."
        )


    # ========================================================
    # VALIDAR CONTENIDO REAL DE LA IMAGEN
    #
    # No confiamos únicamente en la extensión.
    # ========================================================

    try:

        archivo.seek(0)

        imagen = Image.open(
            archivo
        )

        formato = (
            imagen.format or ""
        ).upper()

        imagen.verify()


        if formato not in FORMATOS_VALIDOS:

            return (
                f'La imagen "{archivo.name}" tiene un formato '
                "no permitido. Utiliza JPG, PNG o WEBP."
            )


    except (
        UnidentifiedImageError,
        OSError,
        ValueError,
    ):

        return (
            f'El archivo "{archivo.name}" '
            "no contiene una imagen válida."
        )


    finally:

        try:

            archivo.seek(0)

        except Exception:

            pass


    # ========================================================
    # TODO CORRECTO
    # ========================================================

    return None



# ============================================================
# CREAR INCIDENCIA
# PANEL APICULTOR
# ============================================================

@login_required
@permiso_requerido(
    "ir",
    redireccion="dashboard_apicultor"
)
def crear_incidencia_apicultor(request):

    # ========================================================
    # 1. APICULTOR AUTENTICADO
    # ========================================================

    apicultor = get_object_or_404(
        Apicultor,
        user=request.user
    )


    # ========================================================
    # 2. APIARIOS ASIGNADOS AL APICULTOR
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
    # PÁGINA DE ORIGEN
    # ========================================================

    origen = (
        request.POST.get("origen")
        or
        request.GET.get("origen")
        or
        ""
    ).strip()


    id_apiario_origen = (
        request.POST.get("id_apiario_origen")
        or
        request.GET.get("id_apiario_origen")
        or
        ""
    ).strip()

    # ========================================================
    # APIARIO DE ORIGEN
    # ========================================================

    apiario_origen = None


    if (
        origen == "detalle_apiario"
        and
        id_apiario_origen.isdigit()
    ):

        apiario_origen = (
            apiarios
            .filter(
                id_apiario=int(
                    id_apiario_origen
                )
            )
            .first()
        )

    # ========================================================
    # URL PARA CANCELAR
    # ========================================================

    if origen == "colmenas":

        url_cancelar = reverse(
            "colmenas_apicultor"
        )


    elif (
        origen == "detalle_apiario"
        and
        apiario_origen
    ):

        url_cancelar = reverse(
            "detalle_apiario_apicultor",
            kwargs={
                "id_apiario":
                    apiario_origen.id_apiario
            }
        )


    else:

        url_cancelar = reverse(
            "incidencias_apicultor"
        )


    # ========================================================
    # 3. TODAS LAS COLMENAS DEL APICULTOR
    # ========================================================

    colmenas_todas = (
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


    # ========================================================
    # 4. COLMENAS DISPONIBLES
    #
    # Las colmenas inactivas no pueden recibir
    # nuevas incidencias.
    # ========================================================

    colmenas = (
        colmenas_todas
        .exclude(
            estadocolmena__iexact="Inactiva"
        )
    )


    # ========================================================
    # 5. CONFIGURACIÓN
    # ========================================================

    prioridades_validas = [
        "Baja",
        "Media",
        "Alta",
        "Crítica",
    ]

    MAX_EVIDENCIAS_PROBLEMA = 6
    MAX_TAMANO_IMAGEN_MB = 5


    # ========================================================
    # 6. VALORES INICIALES
    # ========================================================

    tipo_inicial = "Apiario"

    apiario_preseleccionado = (
        request.GET.get(
            "apiario",
            ""
        )
        .strip()
    )

    colmena_preseleccionada = (
        request.GET.get(
            "colmena",
            ""
        )
        .strip()
    )


    # ========================================================
    # 7. PRESELECCIÓN DESDE UNA COLMENA
    # ========================================================

    if colmena_preseleccionada.isdigit():

        colmena_inicial = (
            colmenas_todas
            .filter(
                id_colmena=int(
                    colmena_preseleccionada
                )
            )
            .first()
        )

        if (
            colmena_inicial
            and
            not colmena_esta_operativa(
                colmena_inicial
            )
        ):

            messages.error(
                request,
                (
                    f'La colmena "{colmena_inicial.codigocolmena}" '
                    "se encuentra inactiva y no puede recibir "
                    "nuevas incidencias."
                )
            )

            colmena_preseleccionada = ""

        elif colmena_inicial:

            tipo_inicial = "Colmena"

            apiario_preseleccionado = str(
                colmena_inicial.id_apiario_id
            )

            colmena_preseleccionada = str(
                colmena_inicial.id_colmena
            )


    # ========================================================
    # FUNCIÓN PARA CONSTRUIR EL CONTEXTO
    # ========================================================

    def construir_contexto(
        tipo,
        apiario_id,
        colmena_id,
        valores=None
    ):

        return {

            "apicultor":
                apicultor,

            "apiarios":
                apiarios,

            "colmenas":
                colmenas,

            "prioridades":
                prioridades_validas,

            "tipo_inicial":
                tipo,

            "apiario_preseleccionado":
                apiario_id,

            "colmena_preseleccionada":
                colmena_id,

            "valores_formulario":
                valores or {},

            "fecha_hoy":
                timezone.localdate(),

            "max_evidencias_problema":
                MAX_EVIDENCIAS_PROBLEMA,

            "max_tamano_imagen_mb":
                MAX_TAMANO_IMAGEN_MB,

            "origen":
                origen,

            "id_apiario_origen":
                id_apiario_origen,

            "url_cancelar":
                url_cancelar,

        }


    # ========================================================
    # 8. POST
    # ========================================================

    if request.method == "POST":

        # ====================================================
        # 8.1 DATOS DEL FORMULARIO
        # ====================================================

        tipo_entidad = (
            request.POST.get(
                "tipo_entidad",
                ""
            )
            .strip()
        )

        id_apiario = (
            request.POST.get(
                "apiario",
                ""
            )
            .strip()
        )

        id_colmena = (
            request.POST.get(
                "colmena",
                ""
            )
            .strip()
        )

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

        fecha = (
            request.POST.get(
                "fecha",
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
        # 8.2 EVIDENCIAS DEL PROBLEMA
        # ====================================================

        imagenes_problema = (
            request.FILES.getlist(
                "evidencias_problema"
            )
        )


        # ====================================================
        # COMPATIBILIDAD CON INPUT ANTIGUO
        #
        # name="imagen"
        # ====================================================

        if not imagenes_problema:

            imagen_antigua = (
                request.FILES.get(
                    "imagen"
                )
            )

            if imagen_antigua:

                imagenes_problema = [
                    imagen_antigua
                ]


        # ====================================================
        # 8.3 CONSERVAR FORMULARIO SI HAY ERROR
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
        # 9. VALIDACIONES
        # ====================================================

        errores = []


        # ====================================================
        # TIPO DE ENTIDAD
        # ====================================================

        if tipo_entidad not in [
            "Apiario",
            "Colmena",
        ]:

            errores.append(
                (
                    "Selecciona si la incidencia corresponde "
                    "a un apiario o a una colmena."
                )
            )


        # ====================================================
        # TÍTULO
        # ====================================================

        if not titulo:

            errores.append(
                "Debes ingresar un título para la incidencia."
            )

        elif len(titulo) < 3:

            errores.append(
                "El título debe tener al menos 3 caracteres."
            )

        elif len(titulo) > 100:

            errores.append(
                "El título no puede superar los 100 caracteres."
            )


        # ====================================================
        # PRIORIDAD
        # ====================================================

        if prioridad not in prioridades_validas:

            errores.append(
                "Selecciona una prioridad válida."
            )

        # ====================================================
        # OBSERVACIONES
        # ====================================================

        if len(observaciones) > 255:

            errores.append(
                (
                    "Las observaciones no pueden superar "
                    "los 255 caracteres."
                )
            )


        # ====================================================
        # 10. FECHA
        # ====================================================

        fecha_deteccion = None

        if fecha:

            try:

                fecha_deteccion = (
                    datetime.strptime(
                        fecha,
                        "%Y-%m-%d"
                    )
                    .date()
                )

            except ValueError:

                errores.append(
                    "La fecha de detección no es válida."
                )

        else:

            errores.append(
                "Debes seleccionar la fecha de detección."
            )

        # ====================================================
        # NO PERMITIR FECHA FUTURA
        # ====================================================

        if (
            fecha_deteccion
            and
            fecha_deteccion > timezone.localdate()
        ):

            errores.append(
                (
                    "La fecha de detección "
                    "no puede ser futura."
                )
            )


        # ====================================================
        # 11. VALIDAR APIARIO
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
                    (
                        "El apiario seleccionado no pertenece "
                        "a tus apiarios asignados."
                    )
                )


        # ====================================================
        # 12. VALIDAR COLMENA
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
                    colmenas_todas
                    .filter(

                        id_colmena=int(
                            id_colmena
                        ),

                        id_apiario=apiario,

                        id_apiario__id_apicultor=
                            apicultor,

                    )
                    .first()
                )

                if not colmena:

                    errores.append(
                        (
                            "La colmena seleccionada no pertenece "
                            "al apiario indicado."
                        )
                    )

                elif not colmena_esta_operativa(
                    colmena
                ):

                    errores.append(
                        (
                            f'La colmena "{colmena.codigocolmena}" '
                            "se encuentra inactiva y no puede recibir "
                            "nuevas incidencias."
                        )
                    )


        # ====================================================
        # 13. CANTIDAD DE EVIDENCIAS
        # ====================================================

        cantidad_imagenes = len(
            imagenes_problema
        )

        if (
            cantidad_imagenes
            >
            MAX_EVIDENCIAS_PROBLEMA
        ):

            errores.append(
                (
                    "Puedes subir un máximo de "
                    f"{MAX_EVIDENCIAS_PROBLEMA} fotografías "
                    "por incidencia."
                )
            )


        # ====================================================
        # 14. VALIDAR CADA IMAGEN
        # ====================================================

        if (
            cantidad_imagenes
            <=
            MAX_EVIDENCIAS_PROBLEMA
        ):

            for imagen in imagenes_problema:

                error_imagen = (
                    validar_imagen_evidencia(
                        imagen
                    )
                )

                if error_imagen:

                    errores.append(
                        error_imagen
                    )


        # ====================================================
        # 15. MOSTRAR ERRORES
        # ====================================================

        if errores:

            for error in errores:

                messages.error(
                    request,
                    error
                )

            return render(

                request,

                "panel_apicultor/crear_incidencia.html",

                construir_contexto(
                    tipo_entidad,
                    id_apiario,
                    id_colmena,
                    valores_formulario
                )

            )


        # ====================================================
        # 16. NOMBRE DEL APICULTOR QUE REPORTÓ
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
        # 17. CREAR INCIDENCIA Y EVIDENCIAS
        # ====================================================

        try:

            with transaction.atomic():

                # ============================================
                # INCIDENCIA
                # ============================================

                incidencia = (
                    Incidencia.objects.create(

                        id_apicultor=
                            apicultor,

                        id_apiario=
                            apiario,

                        id_colmena=
                            colmena,

                        entidadincidencia=
                            tipo_entidad,

                        titulo=
                            titulo,

                        prioridad=
                            prioridad,

                        fechadeteccion=
                            fecha_deteccion,

                        estado=
                            "Pendiente",

                        observaciones=
                            observaciones,

                        imagen=
                            None,

                        responsable=
                            nombre_reportante,

                    )
                )


                # ============================================
                # EVIDENCIAS DEL PROBLEMA
                # ============================================

                primera_evidencia = None

                for imagen in imagenes_problema:

                    try:

                        imagen.seek(0)

                    except Exception:

                        pass


                    evidencia = (
                        EvidenciaIncidencia.objects.create(

                            id_incidencia=
                                incidencia,

                            tipo=(
                                EvidenciaIncidencia
                                .TipoEvidencia
                                .PROBLEMA
                            ),

                            imagen=
                                imagen,

                            descripcion=
                                None,

                            subido_por=
                                request.user,

                        )
                    )


                    if primera_evidencia is None:

                        primera_evidencia = (
                            evidencia
                        )


                # ============================================
                # COMPATIBILIDAD CON Incidencia.imagen
                #
                # El campo antiguo apunta a la primera
                # evidencia sin duplicar el archivo.
                # ============================================

                if primera_evidencia:

                    incidencia.imagen.name = (
                        primera_evidencia
                        .imagen
                        .name
                    )

                    incidencia.save(
                        update_fields=[
                            "imagen"
                        ]
                    )


        except Exception as error:

            print(
                "ERROR CREANDO INCIDENCIA APICULTOR:",
                type(error).__name__,
                error
            )

            messages.error(
                request,
                (
                    "Ocurrió un error al guardar la incidencia "
                    "y sus evidencias. Intenta nuevamente."
                )
            )

            return render(

                request,

                "panel_apicultor/crear_incidencia.html",

                construir_contexto(
                    tipo_entidad,
                    id_apiario,
                    id_colmena,
                    valores_formulario
                )

            )


        # ====================================================
        # 18. NOTIFICAR A LOS ADMINISTRADORES
        #
        # La incidencia ya fue guardada correctamente.
        #
        # Si la notificación falla, NO eliminamos la
        # incidencia.
        # ====================================================

        try:

            resultado_notificaciones = (
                notificar_incidencia_creada(
                    incidencia
                )
            )

            print(
                "NOTIFICACIONES INCIDENCIA A ADMIN:",
                resultado_notificaciones
            )

        except Exception as error:

            print(
                (
                    "ERROR NOTIFICANDO INCIDENCIA "
                    "A ADMINISTRADORES:"
                ),
                type(error).__name__,
                error
            )


        # ====================================================
        # 19. MENSAJE DE ÉXITO
        # ====================================================

        if cantidad_imagenes == 1:

            messages.success(
                request,
                (
                    "La incidencia fue reportada correctamente "
                    "con 1 evidencia fotográfica."
                )
            )

        elif cantidad_imagenes > 1:

            messages.success(
                request,
                (
                    "La incidencia fue reportada correctamente "
                    f"con {cantidad_imagenes} evidencias "
                    "fotográficas."
                )
            )

        else:

            messages.success(
                request,
                "La incidencia fue reportada correctamente."
            )


        # ========================================================
        # 20. REGRESAR A LA PÁGINA DE ORIGEN
        # ========================================================

        if origen == "colmenas":

            return redirect(
                "colmenas_apicultor"
            )


        if (
            apiario_origen
            and
            apiario
            and
            apiario_origen.id_apiario
            ==
            apiario.id_apiario
        ):

            return redirect(
                "detalle_apiario_apicultor",
                id_apiario=
                    apiario_origen.id_apiario
            )


        return redirect(
            "incidencias_apicultor"
        )


    # ========================================================
    # 21. GET
    # ========================================================

    return render(

        request,

        "panel_apicultor/crear_incidencia.html",

        construir_contexto(
            tipo_inicial,
            apiario_preseleccionado,
            colmena_preseleccionada
        )

    )



# ============================================================
# EDITAR / GESTIONAR INCIDENCIA
# PANEL APICULTOR
# ============================================================

@login_required
@permiso_requerido(
    "ir",
    redireccion="dashboard_apicultor"
)
def editar_incidencia_apicultor(
    request,
    id_incidencia
):

    # ========================================================
    # 1. APICULTOR AUTENTICADO
    # ========================================================

    apicultor = get_object_or_404(
        Apicultor.objects.select_related(
            "user"
        ),
        user=request.user
    )


    # ========================================================
    # 2. REGLA DE ACCESO A LA INCIDENCIA
    #
    # El apicultor puede gestionar una incidencia cuando:
    #
    # - Está asignada directamente a él.
    # - Pertenece a uno de sus apiarios.
    # - Pertenece a una colmena de uno de sus apiarios.
    #
    # Esto permite gestionar también incidencias creadas
    # por el administrador.
    # ========================================================

    acceso_incidencia = (

        Q(
            id_apicultor=apicultor
        )

        |

        Q(
            id_apiario__id_apicultor=apicultor
        )

        |

        Q(
            id_colmena__id_apiario__id_apicultor=apicultor
        )

    )


    # ========================================================
    # 3. OBTENER INCIDENCIA
    #
    # IMPORTANTE:
    # No usamos solamente id_apicultor=apicultor porque una
    # incidencia creada por el administrador puede estar
    # relacionada al apiario o a una de sus colmenas.
    # ========================================================

    incidencia = get_object_or_404(

        Incidencia.objects

        .filter(
            acceso_incidencia
        )

        .distinct()

        .select_related(
            "id_apicultor",
            "id_apicultor__user",
            "id_apiario",
            "id_apiario__id_apicultor",
            "id_colmena",
            "id_colmena__id_apiario",
        ),

        id_incidencia=id_incidencia

    )


    # ========================================================
    # 4. ESTADOS DISPONIBLES
    # ========================================================

    estados_disponibles = [
        "Pendiente",
        "En proceso",
        "Resuelta",
    ]


    # ========================================================
    # 5. CONFIGURACIÓN DE EVIDENCIAS
    # ========================================================

    MAX_EVIDENCIAS_PROBLEMA = 6

    MAX_EVIDENCIAS_SOLUCION = 6

    MAX_TAMANO_IMAGEN_MB = 5


    # ========================================================
    # 6. EVIDENCIAS EXISTENTES DEL PROBLEMA
    # ========================================================

    evidencias_problema = (
        incidencia.evidencias

        .filter(
            tipo=(
                EvidenciaIncidencia
                .TipoEvidencia
                .PROBLEMA
            )
        )

        .select_related(
            "subido_por"
        )

        .order_by(
            "fecha_registro",
            "id_evidencia"
        )
    )


    # ========================================================
    # 7. EVIDENCIAS EXISTENTES DE SOLUCIÓN
    # ========================================================

    evidencias_solucion = (
        incidencia.evidencias

        .filter(
            tipo=(
                EvidenciaIncidencia
                .TipoEvidencia
                .SOLUCION
            )
        )

        .select_related(
            "subido_por"
        )

        .order_by(
            "fecha_registro",
            "id_evidencia"
        )
    )


    # ========================================================
    # 8. CANTIDADES EXISTENTES
    # ========================================================

    cantidad_problema_actual = (
        evidencias_problema.count()
    )


    cantidad_solucion_actual = (
        evidencias_solucion.count()
    )


    # ========================================================
    # 9. COMPATIBILIDAD CON INCIDENCIA.IMAGEN
    #
    # Una incidencia antigua puede tener:
    #
    # incidencia.imagen
    #
    # pero todavía no tener un registro en
    # EvidenciaIncidencia.
    #
    # La consideramos una evidencia del problema para
    # efectos del límite máximo.
    # ========================================================

    tiene_imagen_legacy = (
        bool(incidencia.imagen)
        and
        cantidad_problema_actual == 0
    )


    cantidad_problema_para_limite = (
        cantidad_problema_actual
        +
        (
            1
            if tiene_imagen_legacy
            else 0
        )
    )


    # ========================================================
    # 10. FUNCIÓN LOCAL PARA CONSTRUIR CONTEXTO
    #
    # Evita repetir el mismo diccionario varias veces.
    # ========================================================

    def construir_contexto():

        return {

            "apicultor":
                apicultor,

            "incidencia":
                incidencia,

            "estados_disponibles":
                estados_disponibles,

            "evidencias_problema":
                evidencias_problema,

            "evidencias_solucion":
                evidencias_solucion,

            "cantidad_problema_actual":
                cantidad_problema_para_limite,

            "cantidad_solucion_actual":
                cantidad_solucion_actual,

            "max_evidencias_problema":
                MAX_EVIDENCIAS_PROBLEMA,

            "max_evidencias_solucion":
                MAX_EVIDENCIAS_SOLUCION,

            "max_tamano_imagen_mb":
                MAX_TAMANO_IMAGEN_MB,

        }


    # ========================================================
    # 11. GET
    # ========================================================

    if request.method != "POST":

        return render(
            request,
            "panel_apicultor/editar_incidencia.html",
            construir_contexto()
        )


    # ========================================================
    # 12. ESTADO
    # ========================================================

    estado = (
        request.POST.get(
            "estado",
            ""
        )
        .strip()
    )


    # ========================================================
    # 13. OBSERVACIONES
    # ========================================================

    observaciones = (
        request.POST.get(
            "observaciones",
            ""
        )
        .strip()
    )


    # ========================================================
    # 14. NUEVAS EVIDENCIAS DEL PROBLEMA
    # ========================================================

    nuevas_evidencias_problema = (
        request.FILES.getlist(
            "evidencias_problema"
        )
    )


    # ========================================================
    # 15. NUEVAS EVIDENCIAS DE SOLUCIÓN
    # ========================================================

    nuevas_evidencias_solucion = (
        request.FILES.getlist(
            "evidencias_solucion"
        )
    )


    # ========================================================
    # 16. COMPATIBILIDAD TEMPORAL CON FORMULARIO ANTIGUO
    #
    # Si todavía existe algún formulario que envíe:
    #
    # name="imagen"
    #
    # la tratamos automáticamente como:
    #
    # - Problema si no está resuelta.
    # - Solución si pasa a Resuelta.
    # ========================================================

    imagen_antigua_formulario = (
        request.FILES.get(
            "imagen"
        )
    )


    if (
        imagen_antigua_formulario
        and
        not nuevas_evidencias_problema
        and
        not nuevas_evidencias_solucion
    ):

        if estado == "Resuelta":

            nuevas_evidencias_solucion = [
                imagen_antigua_formulario
            ]

        else:

            nuevas_evidencias_problema = [
                imagen_antigua_formulario
            ]


    # ========================================================
    # 17. ERRORES
    # ========================================================

    errores = []


    # ========================================================
    # 18. VALIDAR ESTADO
    # ========================================================

    if estado not in estados_disponibles:

        errores.append(
            "Selecciona un estado válido."
        )


    # ========================================================
    # 19. VALIDAR OBSERVACIONES
    # ========================================================

    if len(observaciones) > 1000:

        errores.append(
            "Las observaciones no pueden superar "
            "los 1000 caracteres."
        )


    # ========================================================
    # 20. CANTIDAD DE NUEVAS EVIDENCIAS
    # ========================================================

    cantidad_nueva_problema = len(
        nuevas_evidencias_problema
    )


    cantidad_nueva_solucion = len(
        nuevas_evidencias_solucion
    )


    # ========================================================
    # 21. TOTAL DEL PROBLEMA DESPUÉS DEL GUARDADO
    # ========================================================

    total_problema = (
        cantidad_problema_para_limite
        +
        cantidad_nueva_problema
    )


    # ========================================================
    # 22. TOTAL DE SOLUCIÓN DESPUÉS DEL GUARDADO
    # ========================================================

    total_solucion = (
        cantidad_solucion_actual
        +
        cantidad_nueva_solucion
    )


    # ========================================================
    # 23. VALIDAR LÍMITE DEL PROBLEMA
    # ========================================================

    if (
        total_problema
        >
        MAX_EVIDENCIAS_PROBLEMA
    ):

        disponibles = max(
            0,
            MAX_EVIDENCIAS_PROBLEMA
            -
            cantidad_problema_para_limite
        )


        errores.append(
            "La incidencia puede tener un máximo de "
            f"{MAX_EVIDENCIAS_PROBLEMA} fotografías "
            "del problema. "
            f"Actualmente puedes agregar {disponibles} más."
        )


    # ========================================================
    # 24. VALIDAR LÍMITE DE SOLUCIÓN
    # ========================================================

    if (
        total_solucion
        >
        MAX_EVIDENCIAS_SOLUCION
    ):

        disponibles = max(
            0,
            MAX_EVIDENCIAS_SOLUCION
            -
            cantidad_solucion_actual
        )


        errores.append(
            "La incidencia puede tener un máximo de "
            f"{MAX_EVIDENCIAS_SOLUCION} fotografías "
            "de solución. "
            f"Actualmente puedes agregar {disponibles} más."
        )


    # ========================================================
    # 25. VALIDAR FOTOGRAFÍAS DEL PROBLEMA
    # ========================================================

    if (
        total_problema
        <=
        MAX_EVIDENCIAS_PROBLEMA
    ):

        for imagen in nuevas_evidencias_problema:

            error_imagen = (
                validar_imagen_evidencia(
                    imagen
                )
            )


            if error_imagen:

                errores.append(
                    error_imagen
                )


    # ========================================================
    # 26. VALIDAR FOTOGRAFÍAS DE SOLUCIÓN
    # ========================================================

    if (
        total_solucion
        <=
        MAX_EVIDENCIAS_SOLUCION
    ):

        for imagen in nuevas_evidencias_solucion:

            error_imagen = (
                validar_imagen_evidencia(
                    imagen
                )
            )


            if error_imagen:

                errores.append(
                    error_imagen
                )


    # ========================================================
    # 27. REGLA PARA MARCAR COMO RESUELTA
    #
    # Una incidencia solamente puede pasar a Resuelta cuando
    # exista por lo menos una fotografía de solución.
    # ========================================================

    if (
        estado == "Resuelta"
        and
        total_solucion <= 0
    ):

        errores.append(
            "Para marcar la incidencia como Resuelta "
            "debes agregar al menos una fotografía "
            "que evidencie la solución."
        )


    # ========================================================
    # 28. MOSTRAR ERRORES
    # ========================================================

    if errores:

        for error in errores:

            messages.error(
                request,
                error
            )


        return render(
            request,
            "panel_apicultor/editar_incidencia.html",
            construir_contexto()
        )


    # ========================================================
    # 29. GUARDAR
    # ========================================================

    try:

        with transaction.atomic():


            # =================================================
            # 29.1 ACTUALIZAR INCIDENCIA
            # =================================================

            incidencia.estado = (
                estado
            )


            incidencia.observaciones = (
                observaciones
                or
                None
            )


            incidencia.save(
                update_fields=[
                    "estado",
                    "observaciones",
                ]
            )


            # =================================================
            # 29.2 MIGRAR IMAGEN LEGACY
            #
            # Si existe una imagen antigua y ahora el usuario
            # agrega nuevas evidencias del problema, registramos
            # la antigua también en EvidenciaIncidencia.
            #
            # No copiamos el archivo físicamente.
            # =================================================

            if (
                tiene_imagen_legacy
                and
                nuevas_evidencias_problema
            ):

                evidencia_legacy = (
                    EvidenciaIncidencia(
                        id_incidencia=incidencia,

                        tipo=(
                            EvidenciaIncidencia
                            .TipoEvidencia
                            .PROBLEMA
                        ),

                        descripcion=None,

                        subido_por=None,
                    )
                )


                evidencia_legacy.imagen.name = (
                    incidencia.imagen.name
                )


                evidencia_legacy.save()


            # =================================================
            # 29.3 PRIMERA EVIDENCIA NUEVA DEL PROBLEMA
            # =================================================

            primera_evidencia_problema = None


            # =================================================
            # 29.4 GUARDAR EVIDENCIAS DEL PROBLEMA
            # =================================================

            for imagen in nuevas_evidencias_problema:


                try:

                    imagen.seek(0)

                except Exception:

                    pass


                evidencia = (
                    EvidenciaIncidencia.objects.create(

                        id_incidencia=
                            incidencia,

                        tipo=(
                            EvidenciaIncidencia
                            .TipoEvidencia
                            .PROBLEMA
                        ),

                        imagen=
                            imagen,

                        descripcion=
                            None,

                        subido_por=
                            request.user,

                    )
                )


                if (
                    primera_evidencia_problema
                    is None
                ):

                    primera_evidencia_problema = (
                        evidencia
                    )


            # =================================================
            # 29.5 GUARDAR EVIDENCIAS DE SOLUCIÓN
            # =================================================

            for imagen in nuevas_evidencias_solucion:


                try:

                    imagen.seek(0)

                except Exception:

                    pass


                EvidenciaIncidencia.objects.create(

                    id_incidencia=
                        incidencia,

                    tipo=(
                        EvidenciaIncidencia
                        .TipoEvidencia
                        .SOLUCION
                    ),

                    imagen=
                        imagen,

                    descripcion=
                        None,

                    subido_por=
                        request.user,

                )


            # =================================================
            # 29.6 COMPATIBILIDAD CON INCIDENCIA.IMAGEN
            #
            # Si la incidencia nunca tuvo imagen antigua,
            # apuntamos el campo legacy a la primera nueva
            # evidencia del problema.
            #
            # No duplicamos el archivo.
            # =================================================

            if (
                not incidencia.imagen
                and
                primera_evidencia_problema
            ):

                incidencia.imagen.name = (
                    primera_evidencia_problema
                    .imagen
                    .name
                )


                incidencia.save(
                    update_fields=[
                        "imagen"
                    ]
                )


    # ========================================================
    # 30. ERROR DE GUARDADO
    # ========================================================

    except Exception:

        messages.error(
            request,
            "Ocurrió un error al actualizar la incidencia "
            "o guardar las evidencias fotográficas."
        )


        return render(
            request,
            "panel_apicultor/editar_incidencia.html",
            construir_contexto()
        )


    # ========================================================
    # 31. MENSAJE FINAL
    # ========================================================

    total_nuevas_evidencias = (
        cantidad_nueva_problema
        +
        cantidad_nueva_solucion
    )


    if estado == "Resuelta":

        messages.success(
            request,
            "La incidencia fue marcada como Resuelta "
            "y las evidencias de solución fueron guardadas."
        )


    elif total_nuevas_evidencias > 0:

        messages.success(
            request,
            "La incidencia fue actualizada correctamente. "
            f"Se agregaron {total_nuevas_evidencias} "
            "evidencia(s) fotográfica(s)."
        )


    else:

        messages.success(
            request,
            "La incidencia fue actualizada correctamente."
        )


    # ========================================================
    # 32. VOLVER AL LISTADO
    # ========================================================

    return redirect(
        "incidencias_apicultor"
    )


# ============================================================
# AGENDA
# PANEL APICULTOR
# ============================================================

@login_required
@permiso_requerido(
    "agenda",
    redireccion="dashboard_apicultor"
)
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



# ============================================================
# CREAR EVENTO
# PANEL APICULTOR
# ============================================================

@login_required
@permiso_requerido(
    "agenda",
    redireccion="dashboard_apicultor"
)
def crear_evento_apicultor(request):

    # ========================================================
    # 1. APICULTOR AUTENTICADO
    # ========================================================

    apicultor = get_object_or_404(
        Apicultor,
        user=request.user
    )


    # ========================================================
    # 2. APIARIOS ASIGNADOS AL APICULTOR
    #
    # El apicultor únicamente puede crear eventos
    # relacionados con sus propios apiarios.
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
    # 3. COLMENAS DE LOS APIARIOS ASIGNADOS
    # ========================================================

    colmenas_todas = (
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


    # ========================================================
    # COLMENAS DISPONIBLES PARA NUEVOS EVENTOS
    # ========================================================

    colmenas = (
        colmenas_todas
        .exclude(
            estadocolmena__iexact="Inactiva"
        )
    )


    # ========================================================
    # 4. TIPOS DE EVENTO DISPONIBLES
    #
    # Estos deben coincidir con EventoAgenda.TipoEvento
    # y con crear_evento.html / crear_evento.js.
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
    # 5. TIPOS VÁLIDOS PARA EL BACKEND
    #
    # No confiamos solamente en el HTML.
    # Si alguien modifica manualmente el POST,
    # solo permitimos estos valores.
    # ========================================================

    tipos_validos = [

        EventoAgenda.TipoEvento.MANTENIMIENTO,

        EventoAgenda.TipoEvento.REVISION,

        EventoAgenda.TipoEvento.INCIDENCIA,

        EventoAgenda.TipoEvento.EVENTO,

    ]


    # ========================================================
    # 6. FECHA ACTUAL
    # ========================================================

    fecha_hoy = timezone.localdate()


    # ========================================================
    # 7. PROCESAR FORMULARIO
    # ========================================================

    if request.method == "POST":


        # ====================================================
        # 7.1. RECIBIR DATOS
        # ====================================================

        titulo = request.POST.get(
            "titulo",
            ""
        ).strip()


        tipo_evento = request.POST.get(
            "tipo_evento",
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


        fecha = request.POST.get(
            "fecha",
            ""
        ).strip()


        hora = request.POST.get(
            "hora",
            ""
        ).strip()


        descripcion = request.POST.get(
            "descripcion",
            ""
        ).strip()


        # ====================================================
        # 7.2. CONSERVAR DATOS DEL FORMULARIO
        #
        # Si existe un error, Django vuelve a renderizar
        # el formulario sin borrar lo que escribió el usuario.
        # ====================================================

        valores_formulario = {

            "titulo":
                titulo,

            "tipo_evento":
                tipo_evento,

            "apiario":
                id_apiario,

            "colmena":
                id_colmena,

            "fecha":
                fecha,

            "hora":
                hora,

            "descripcion":
                descripcion,

        }


        # ====================================================
        # 7.3. LISTA DE ERRORES
        # ====================================================

        errores = []


        # ====================================================
        # 8. VALIDAR TÍTULO
        # ====================================================

        if not titulo:

            errores.append(
                "Debes ingresar un título para el evento."
            )


        elif len(titulo) < 3:

            errores.append(
                "El título debe tener al menos 3 caracteres."
            )


        elif len(titulo) > 150:

            errores.append(
                "El título no puede superar los 150 caracteres."
            )


        # ====================================================
        # 9. VALIDAR TIPO DE EVENTO
        # ====================================================

        if tipo_evento not in tipos_validos:

            errores.append(
                "Selecciona un tipo de evento válido."
            )


        # ====================================================
        # 10. VALIDAR APIARIO
        #
        # La búsqueda se hace únicamente dentro de los
        # apiarios asignados al apicultor autenticado.
        # ====================================================

        apiario = None


        if not id_apiario:

            errores.append(
                "Debes seleccionar un apiario."
            )


        elif not id_apiario.isdigit():

            errores.append(
                "El apiario seleccionado no es válido."
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
        # 11. VALIDAR COLMENA
        #
        # La colmena es opcional.
        #
        # Si queda vacía:
        #     id_colmena = None
        #
        # y el evento se considera general del apiario.
        # ====================================================

        colmena = None


        if id_colmena:


            # ------------------------------------------------
            # ID válido
            # ------------------------------------------------

            if not id_colmena.isdigit():

                errores.append(
                    "La colmena seleccionada no es válida."
                )


            # ------------------------------------------------
            # Solo validamos la colmena si ya encontramos
            # correctamente el apiario.
            # ------------------------------------------------

            elif apiario:

                colmena = (
                    colmenas_todas
                    .filter(

                        id_colmena=int(
                            id_colmena
                        ),

                        id_apiario=apiario,

                        id_apiario__id_apicultor=apicultor,

                    )
                    .first()
                )


                if not colmena:

                    errores.append(
                        "La colmena seleccionada no pertenece "
                        "al apiario indicado."
                    )

                elif not colmena_esta_operativa(
                    colmena
                ):

                    errores.append(
                        f'La colmena "{colmena.codigocolmena}" '
                        "se encuentra inactiva y no puede utilizarse "
                        "para programar nuevos eventos."
                    )


        # ====================================================
        # 12. VALIDAR FECHA
        # ====================================================

        fecha_evento = None


        if not fecha:

            errores.append(
                "Debes seleccionar la fecha del evento."
            )


        else:

            try:

                fecha_evento = datetime.strptime(
                    fecha,
                    "%Y-%m-%d"
                ).date()


            except ValueError:

                errores.append(
                    "La fecha seleccionada no es válida."
                )


        # ====================================================
        # 13. NO PERMITIR FECHAS PASADAS
        # ====================================================

        if (
            fecha_evento
            and
            fecha_evento < fecha_hoy
        ):

            errores.append(
                "No puedes programar un evento "
                "en una fecha pasada."
            )


        # ====================================================
        # 14. VALIDAR HORA
        # ====================================================

        hora_evento = None


        if not hora:

            errores.append(
                "Debes seleccionar la hora del evento."
            )


        else:

            try:

                hora_evento = datetime.strptime(
                    hora,
                    "%H:%M"
                ).time()


            except ValueError:

                errores.append(
                    "La hora seleccionada no es válida."
                )


        # ====================================================
        # 15. SI EL EVENTO ES HOY
        #
        # No permitimos crear un evento para una hora
        # que ya pasó.
        # ====================================================

        if (
            fecha_evento
            and
            hora_evento
            and
            fecha_evento == fecha_hoy
        ):

            hora_actual = (
                timezone.localtime()
                .replace(
                    second=0,
                    microsecond=0
                )
                .time()
            )


            if hora_evento <= hora_actual:

                errores.append(
                    "Si el evento es para hoy, debes seleccionar "
                    "una hora posterior a la actual."
                )


        # ====================================================
        # 16. VALIDAR DESCRIPCIÓN
        # ====================================================

        if len(descripcion) > 500:

            errores.append(
                "La descripción no puede superar "
                "los 500 caracteres."
            )


        # ====================================================
        # 17. SI HAY ERRORES
        #
        # No guardamos nada y devolvemos el formulario
        # conservando todos los campos.
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

                "tipos_disponibles":
                    tipos_disponibles,

                "fecha_hoy":
                    fecha_hoy,

                "valores_formulario":
                    valores_formulario,

            }


            return render(
                request,
                "panel_apicultor/crear_evento.html",
                contexto
            )


        # ====================================================
        # 18. CREAR EVENTO
        # ====================================================

        EventoAgenda.objects.create(


            # ------------------------------------------------
            # INFORMACIÓN DEL EVENTO
            # ------------------------------------------------

            titulo=
                titulo,

            tipo_evento=
                tipo_evento,


            # ------------------------------------------------
            # UBICACIÓN
            # ------------------------------------------------

            id_apiario=
                apiario,

            id_colmena=
                colmena,


            # ------------------------------------------------
            # RESPONSABLE
            #
            # Si el apicultor crea el evento,
            # el mismo queda como responsable.
            # ------------------------------------------------

            responsable=
                apicultor,


            # ------------------------------------------------
            # PROGRAMACIÓN
            # ------------------------------------------------

            fecha=
                fecha_evento,

            hora=
                hora_evento,


            # ------------------------------------------------
            # DESCRIPCIÓN
            # ------------------------------------------------

            descripcion=
                descripcion,


            # ------------------------------------------------
            # ESTADO INICIAL
            # ------------------------------------------------

            estado=
                EventoAgenda.EstadoEvento.PROGRAMADO,


            # ------------------------------------------------
            # USUARIO QUE CREÓ EL EVENTO
            # ------------------------------------------------

            creado_por=
                request.user,

        )


        # ====================================================
        # 19. MENSAJE DE ÉXITO
        # ====================================================

        messages.success(
            request,
            "El evento fue agregado a tu agenda correctamente."
        )


        # ====================================================
        # 20. REGRESAR A LA AGENDA
        # ====================================================

        return redirect(
            "agenda_apicultor"
        )


    # ========================================================
    # 21. GET
    #
    # Primera vez que el usuario abre Crear evento.
    # ========================================================

    contexto = {

        "apicultor":
            apicultor,

        "apiarios":
            apiarios,

        "colmenas":
            colmenas,

        "tipos_disponibles":
            tipos_disponibles,

        "fecha_hoy":
            fecha_hoy,

        "valores_formulario":
            {},

    }


    return render(
        request,
        "panel_apicultor/crear_evento.html",
        contexto
    )




# ============================================================
# ACTUALIZAR ESTADO DE EVENTO
# PANEL APICULTOR
# ============================================================

@login_required
@permiso_requerido(
    "agenda",
    redireccion="dashboard_apicultor"
)
@require_POST
def actualizar_estado_evento_apicultor(
    request,
    id_evento
):


    # ========================================================
    # APICULTOR AUTENTICADO
    # ========================================================

    apicultor = get_object_or_404(
        Apicultor,
        user=request.user
    )


    # ========================================================
    # BUSCAR EVENTO
    #
    # SEGURIDAD:
    # El evento debe pertenecer a uno de los apiarios
    # asignados al apicultor autenticado.
    #
    # NO utilizamos el campo "responsable" como regla
    # de acceso.
    # ========================================================

    evento = get_object_or_404(

        EventoAgenda.objects
        .select_related(
            "id_apiario",
            "id_colmena",
            "responsable",
            "creado_por",
        ),

        id_evento=id_evento,

        id_apiario__id_apicultor=apicultor,

    )


    # ========================================================
    # FECHA ACTUAL
    # ========================================================

    hoy = timezone.localdate()


    # ========================================================
    # VALIDAR FECHA DEL EVENTO
    #
    # EVENTO FUTURO:
    # NO se puede modificar.
    #
    # EVENTO HOY:
    # SÍ.
    #
    # EVENTO PASADO:
    # SÍ.
    # ========================================================

    if evento.fecha > hoy:

        messages.error(
            request,
            (
                "Todavía no puedes actualizar este evento. "
                "Podrás cambiar su estado a partir del "
                f"{evento.fecha.strftime('%d/%m/%Y')}."
            )
        )


        return redirect(
            "agenda_apicultor"
        )


    # ========================================================
    # SOLO SE PUEDE MODIFICAR SI ESTÁ PROGRAMADO
    # ========================================================

    if (
        evento.estado
        !=
        EventoAgenda.EstadoEvento.PROGRAMADO
    ):

        messages.info(
            request,
            (
                "Este evento ya tiene un estado final "
                f"({evento.get_estado_display()}) "
                "y no puede modificarse nuevamente "
                "desde tu panel."
            )
        )


        return redirect(
            "agenda_apicultor"
        )


    # ========================================================
    # NUEVO ESTADO
    # ========================================================

    nuevo_estado = (
        request.POST
        .get(
            "estado",
            ""
        )
        .strip()
        .lower()
    )


    # ========================================================
    # ESTADOS QUE PUEDE SELECCIONAR EL APICULTOR
    #
    # El apicultor NO puede devolverlo a Programado.
    #
    # Solamente:
    #
    # - Completado
    # - Cancelado
    # ========================================================

    estados_permitidos = {

        EventoAgenda
        .EstadoEvento
        .COMPLETADO,

        EventoAgenda
        .EstadoEvento
        .CANCELADO,

    }


    if (
        nuevo_estado
        not in
        estados_permitidos
    ):

        messages.error(
            request,
            "Selecciona un estado válido para el evento."
        )


        return redirect(
            "agenda_apicultor"
        )


    # ========================================================
    # ACTUALIZAR ÚNICAMENTE EL ESTADO
    # ========================================================

    evento.estado = (
        nuevo_estado
    )


    evento.save(
        update_fields=[
            "estado"
        ]
    )


    # ========================================================
    # MENSAJE
    # ========================================================

    if (
        nuevo_estado
        ==
        EventoAgenda.EstadoEvento.COMPLETADO
    ):

        messages.success(
            request,
            (
                f'El evento "{evento.titulo}" '
                "fue marcado como completado."
            )
        )


    else:

        messages.success(
            request,
            (
                f'El evento "{evento.titulo}" '
                "fue marcado como cancelado."
            )
        )


    # ========================================================
    # REGRESAR A AGENDA
    # ========================================================

    return redirect(
        "agenda_apicultor"
    )


# ============================================================
# PERFIL DEL APICULTOR
# ============================================================

@login_required
@permiso_requerido(
    "perfil",
    redireccion="dashboard_apicultor"
)
def perfil_apicultor(request):

    # ========================================================
    # 1. USUARIO AUTENTICADO
    # ========================================================

    usuario = request.user


    # ========================================================
    # 2. OBTENER PERFIL DEL APICULTOR
    #
    # SEGURIDAD:
    # El perfil siempre se obtiene desde request.user.
    #
    # No recibimos el ID del apicultor desde la URL ni
    # desde el formulario.
    #
    # Esto evita que un apicultor pueda intentar editar
    # el perfil de otro usuario.
    # ========================================================

    apicultor = get_object_or_404(
        Apicultor.objects.select_related(
            "id_rol"
        ),
        user=usuario
    )


    # ========================================================
    # 3. ACTUALIZAR PERFIL
    # ========================================================

    if request.method == "POST":

        # ====================================================
        # 3.1 OBTENER DATOS DEL FORMULARIO
        # ====================================================

        nombres = (
            request.POST
            .get(
                "nombres",
                ""
            )
            .strip()
        )


        apellidos = (
            request.POST
            .get(
                "apellidos",
                ""
            )
            .strip()
        )


        correo = (
            request.POST
            .get(
                "correo",
                ""
            )
            .strip()
            .lower()
        )


        telefono = (
            request.POST
            .get(
                "telefono",
                ""
            )
            .strip()
        )


        zona_trabajo = (
            request.POST
            .get(
                "zona_trabajo",
                ""
            )
            .strip()
        )


        experiencia_texto = (
            request.POST
            .get(
                "experiencia",
                ""
            )
            .strip()
        )


        eliminar_foto = (
            request.POST
            .get(
                "eliminar_foto",
                "0"
            )
            ==
            "1"
        )


        nueva_foto = (
            request.FILES.get(
                "fotoperfil"
            )
        )


        # ====================================================
        # 3.2 LISTA DE ERRORES
        # ====================================================

        errores = []


        # ====================================================
        # 3.3 VALIDAR NOMBRES
        # ====================================================

        if not nombres:

            errores.append(
                "Debes ingresar tus nombres."
            )

        elif len(nombres) > 150:

            errores.append(
                "Los nombres no pueden superar "
                "los 150 caracteres."
            )

        elif not re.fullmatch(
            r"[A-Za-zÁÉÍÓÚÜÑáéíóúüñÀ-ÿ' -]+",
            nombres
        ):

            errores.append(
                "Los nombres solo pueden contener "
                "letras, espacios, apóstrofes y guiones."
            )


        # ====================================================
        # 3.4 VALIDAR APELLIDOS
        # ====================================================

        if not apellidos:

            errores.append(
                "Debes ingresar tus apellidos."
            )

        elif len(apellidos) > 150:

            errores.append(
                "Los apellidos no pueden superar "
                "los 150 caracteres."
            )

        elif not re.fullmatch(
            r"[A-Za-zÁÉÍÓÚÜÑáéíóúüñÀ-ÿ' -]+",
            apellidos
        ):

            errores.append(
                "Los apellidos solo pueden contener "
                "letras, espacios, apóstrofes y guiones."
            )


        # ====================================================
        # 3.5 VALIDAR CORREO
        # ====================================================

        if not correo:

            errores.append(
                "Debes ingresar un correo electrónico."
            )

        else:

            try:

                validate_email(
                    correo
                )

            except ValidationError:

                errores.append(
                    "Ingresa un correo electrónico válido."
                )


        # ====================================================
        # 3.6 CORREO ÚNICO
        # ====================================================

        if correo:

            User = get_user_model()


            correo_ocupado = (
                User.objects
                .filter(
                    email__iexact=correo
                )
                .exclude(
                    pk=usuario.pk
                )
                .exists()
            )


            if correo_ocupado:

                errores.append(
                    "Este correo electrónico ya está "
                    "registrado por otro usuario."
                )


        # ====================================================
        # 3.7 VALIDAR TELÉFONO
        #
        # Opcional.
        #
        # Si existe:
        # - Solo números
        # - Exactamente 10 dígitos
        # - Debe iniciar por 3
        # ====================================================

        if telefono:

            if not telefono.isdigit():

                errores.append(
                    "El teléfono solo puede contener números."
                )

            elif len(telefono) != 10:

                errores.append(
                    "El teléfono debe contener exactamente "
                    "10 números."
                )

            elif not telefono.startswith("3"):

                errores.append(
                    "Ingresa un número de celular válido. "
                    "Debe comenzar por 3."
                )


        # ====================================================
        # 3.8 VALIDAR ZONA DE TRABAJO
        # ====================================================

        if len(zona_trabajo) > 100:

            errores.append(
                "La zona de trabajo no puede superar "
                "los 100 caracteres."
            )


        # ====================================================
        # 3.9 VALIDAR EXPERIENCIA
        # ====================================================

        experiencia = None


        if experiencia_texto:

            try:

                experiencia = int(
                    experiencia_texto
                )


                if (
                    experiencia < 0
                    or
                    experiencia > 80
                ):

                    errores.append(
                        "Los años de experiencia deben "
                        "estar entre 0 y 80."
                    )


            except ValueError:

                errores.append(
                    "Los años de experiencia deben "
                    "ser un número entero."
                )


        # ====================================================
        # 3.10 VALIDAR FOTOGRAFÍA
        # ====================================================

        if nueva_foto:

            tipos_permitidos = {
                "image/jpeg",
                "image/png",
                "image/webp",
            }


            # ------------------------------------------------
            # TIPO MIME
            # ------------------------------------------------

            if (
                nueva_foto.content_type
                not in tipos_permitidos
            ):

                errores.append(
                    "La fotografía debe ser JPG, PNG o WEBP."
                )


            # ------------------------------------------------
            # TAMAÑO MÁXIMO 5 MB
            # ------------------------------------------------

            if (
                nueva_foto.size
                >
                5 * 1024 * 1024
            ):

                errores.append(
                    "La fotografía no puede superar los 5 MB."
                )


            # ------------------------------------------------
            # VALIDAR CONTENIDO REAL DE LA IMAGEN
            # ------------------------------------------------

            if not errores:

                try:

                    nueva_foto.seek(
                        0
                    )


                    imagen = Image.open(
                        nueva_foto
                    )


                    imagen.verify()


                    nueva_foto.seek(
                        0
                    )


                except (
                    UnidentifiedImageError,
                    OSError,
                    ValueError,
                ):

                    errores.append(
                        "El archivo seleccionado no es "
                        "una imagen válida."
                    )


        # ====================================================
        # 3.11 MOSTRAR ERRORES
        # ====================================================

        if errores:

            for error in errores:

                messages.error(
                    request,
                    error
                )


            return redirect(
                "perfil_apicultor"
            )


        # ====================================================
        # 3.12 GUARDAR CAMBIOS
        # ====================================================

        else:

            try:

                with transaction.atomic():

                    # =========================================
                    # ACTUALIZAR USUARIO DJANGO
                    # =========================================

                    usuario.first_name = (
                        nombres
                    )

                    usuario.last_name = (
                        apellidos
                    )

                    usuario.email = (
                        correo
                    )


                    usuario.save(
                        update_fields=[
                            "first_name",
                            "last_name",
                            "email",
                        ]
                    )


                    # =========================================
                    # ACTUALIZAR APICULTOR
                    # =========================================

                    apicultor.telefono = (
                        telefono
                        or
                        None
                    )


                    apicultor.zona_trabajo = (
                        zona_trabajo
                        or
                        None
                    )


                    apicultor.experienciaanios = (
                        experiencia
                    )


                    # =========================================
                    # REEMPLAZAR FOTOGRAFÍA
                    # =========================================

                    if nueva_foto:

                        if apicultor.fotoperfil:

                            try:

                                apicultor.fotoperfil.delete(
                                    save=False
                                )

                            except Exception as error:

                                print(
                                    "ERROR ELIMINANDO "
                                    "FOTOGRAFÍA ANTERIOR:",
                                    error
                                )


                        apicultor.fotoperfil = (
                            nueva_foto
                        )


                    # =========================================
                    # ELIMINAR FOTOGRAFÍA
                    # =========================================

                    elif eliminar_foto:

                        if apicultor.fotoperfil:

                            try:

                                apicultor.fotoperfil.delete(
                                    save=False
                                )

                            except Exception as error:

                                print(
                                    "ERROR ELIMINANDO "
                                    "FOTOGRAFÍA:",
                                    error
                                )


                        apicultor.fotoperfil = None


                    # =========================================
                    # GUARDAR APICULTOR
                    # =========================================

                    apicultor.save()


                # =============================================
                # RESPUESTA EXITOSA
                # =============================================

                messages.success(
                    request,
                    "Tu perfil fue actualizado correctamente."
                )


                # =============================================
                # POST / REDIRECT / GET
                # =============================================

                return redirect(
                    "perfil_apicultor"
                )


            except Exception as error:

                print(
                    "ERROR ACTUALIZANDO PERFIL "
                    "DEL APICULTOR:",
                    error
                )


                messages.error(
                    request,
                    (
                        "Ocurrió un error al actualizar "
                        "la información de tu perfil."
                    )
                )


                return redirect(
                    "perfil_apicultor"
                )


    # ========================================================
    # 4. FOTOGRAFÍA DEL PERFIL
    # ========================================================

    foto = None


    if apicultor.fotoperfil:

        try:

            foto = (
                apicultor
                .fotoperfil
                .url
            )

        except ValueError:

            foto = None


    # ========================================================
    # 5. CONFIGURACIÓN 2FA
    # ========================================================

    configuracion_2fa, _ = (
        Configuracion2FA.objects
        .get_or_create(
            usuario=usuario
        )
    )


    # ========================================================
    # 6. POLÍTICA GLOBAL 2FA
    # ========================================================

    politica_2fa = (
        obtener_politica_2fa(
            usuario
        )
    )


    permitir_2fa = (
        politica_2fa.get(
            "permitir_2fa",
            False
        )
    )


    segundo_factor_obligatorio = (
        politica_2fa.get(
            "obligatorio",
            False
        )
    )


    # ========================================================
    # 7. ESTADO 2FA
    # ========================================================

    dos_factores_activo = (
        configuracion_2fa.activo
    )


    tiene_correo_2fa = bool(
        usuario.email
        and
        usuario.email.strip()
    )


    # ========================================================
    # 8. SESIÓN ACTUAL
    # ========================================================

    session_key_actual = (
        request.session.session_key
    )


    # ========================================================
    # 9. SESIONES ACTIVAS
    #
    # El servicio se encarga de:
    #
    # - consultar sesiones registradas
    # - comprobar que sigan existiendo en Django
    # - descartar sesiones expiradas
    # - identificar la sesión actual
    # ========================================================

    sesiones_activas = (
        obtener_sesiones_activas_usuario(
            usuario,
            session_key_actual=session_key_actual
        )
    )


    # ========================================================
    # 10. OTRAS SESIONES ACTIVAS
    # ========================================================

    otras_sesiones_activas = [

        sesion

        for sesion
        in sesiones_activas

        if not getattr(
            sesion,
            "es_actual",
            False
        )

    ]


    # ========================================================
    # 11. HISTORIAL DE ACCESOS
    #
    # SEGURIDAD:
    #
    # Solo se consulta el historial asociado al usuario
    # actualmente autenticado.
    #
    # Mostramos máximo los últimos 15 eventos.
    # ========================================================

    historial_accesos = list(

        HistorialAcceso.objects

        .filter(
            usuario=usuario
        )

        .order_by(
            "-fecha"
        )[:15]

    )


    # ========================================================
    # 12. PREPARAR HISTORIAL PARA LA INTERFAZ
    #
    # Estos atributos son temporales.
    #
    # No se guardan nuevamente en MySQL.
    # Solo facilitan la presentación en el template.
    # ========================================================

    for registro in historial_accesos:

        detalle_normalizado = (
            registro.detalle
            or
            ""
        ).lower()


        # ====================================================
        # LOGIN
        # ====================================================

        if registro.actividad == "login":

            registro.titulo_ui = (
                "Inicio de sesión"
            )

            registro.icono_ui = (
                "bi-box-arrow-in-right"
            )

            registro.clase_ui = (
                "inicio"
            )


        # ====================================================
        # LOGOUT
        # ====================================================

        elif registro.actividad == "logout":

            registro.titulo_ui = (
                "Cierre de sesión"
            )

            registro.icono_ui = (
                "bi-box-arrow-right"
            )

            registro.clase_ui = (
                "salida"
            )


        # ====================================================
        # INACTIVIDAD
        # ====================================================

        elif registro.actividad == "inactividad":

            registro.titulo_ui = (
                "Sesión cerrada por inactividad"
            )

            registro.icono_ui = (
                "bi-clock-history"
            )

            registro.clase_ui = (
                "inactividad"
            )


        # ====================================================
        # CAMBIO DE CONTRASEÑA
        # ====================================================

        elif registro.actividad == "cambio_password":

            registro.titulo_ui = (
                "Contraseña actualizada"
            )

            registro.icono_ui = (
                "bi-key-fill"
            )

            registro.clase_ui = (
                "password"
            )


        # ====================================================
        # CIERRE REMOTO
        # ====================================================

        elif registro.actividad == "cierre_remoto":

            registro.titulo_ui = (
                "Sesión cerrada remotamente"
            )

            registro.icono_ui = (
                "bi-shield-x"
            )

            registro.clase_ui = (
                "remoto"
            )


        # ====================================================
        # DESACTIVACIÓN 2FA
        #
        # Actualmente el backend registra eventos de 2FA
        # utilizando actividad="sistema".
        #
        # Por eso identificamos el tipo mediante el detalle.
        # ====================================================

        elif (
            registro.actividad == "sistema"
            and
            "autenticación en dos pasos"
            in detalle_normalizado
            and
            "desactiv"
            in detalle_normalizado
        ):

            registro.titulo_ui = (
                "Verificación en dos pasos desactivada"
            )

            registro.icono_ui = (
                "bi-shield-exclamation"
            )

            registro.clase_ui = (
                "advertencia"
            )


        # ====================================================
        # ACTIVACIÓN 2FA
        # ====================================================

        elif (
            registro.actividad == "sistema"
            and
            "autenticación en dos pasos"
            in detalle_normalizado
            and
            "desactiv"
            not in detalle_normalizado
        ):

            registro.titulo_ui = (
                "Verificación en dos pasos activada"
            )

            registro.icono_ui = (
                "bi-shield-check"
            )

            registro.clase_ui = (
                "seguridad"
            )


        # ====================================================
        # OTRA ACTIVIDAD DEL SISTEMA
        # ====================================================

        else:

            registro.titulo_ui = (
                registro.get_actividad_display()
            )

            registro.icono_ui = (
                "bi-shield-fill-check"
            )

            registro.clase_ui = (
                "sistema"
            )


    # ========================================================
    # 13. CONTEXTO
    # ========================================================

    contexto = {

        # ====================================================
        # USUARIO
        # ====================================================

        "usuario":
            usuario,


        # ====================================================
        # APICULTOR
        # ====================================================

        "apicultor":
            apicultor,

        "foto":
            foto,

        "rol":
            (
                str(apicultor.id_rol)
                if apicultor.id_rol
                else
                "Apicultor"
            ),

        "telefono":
            apicultor.telefono
            or
            "",

        "identificacion":
            apicultor.identificacion
            or
            "",

        "zona_trabajo":
            apicultor.zona_trabajo
            or
            "",

        "experiencia":
            apicultor.experienciaanios,


        # ====================================================
        # SEGURIDAD - 2FA
        # ====================================================

        "configuracion_2fa":
            configuracion_2fa,

        "permitir_2fa":
            permitir_2fa,

        "segundo_factor_obligatorio":
            segundo_factor_obligatorio,

        "dos_factores_activo":
            dos_factores_activo,

        "tiene_correo_2fa":
            tiene_correo_2fa,


        # ====================================================
        # SEGURIDAD - SESIONES
        # ====================================================

        "sesiones_activas":
            sesiones_activas,

        "otras_sesiones_activas":
            otras_sesiones_activas,

        "total_sesiones_activas":
            len(
                sesiones_activas
            ),

        "total_otras_sesiones":
            len(
                otras_sesiones_activas
            ),


        # ====================================================
        # SEGURIDAD - HISTORIAL
        # ====================================================

        "historial_accesos":
            historial_accesos,

        "total_historial":
            len(
                historial_accesos
            ),

    }


    # ========================================================
    # 14. RENDERIZAR PERFIL
    # ========================================================

    return render(
        request,
        "panel_apicultor/perfil.html",
        contexto
    )



# ============================================================
# CAMBIAR CONTRASEÑA
# PERFIL APICULTOR
# ============================================================

@login_required
@permiso_requerido(
    "perfil",
    redireccion="dashboard_apicultor"
)
@require_POST
def cambiar_password_apicultor(request):

    # ========================================================
    # 1. VERIFICAR QUE EL USUARIO SEA APICULTOR
    #
    # Evita que un usuario autenticado de otro rol pueda
    # utilizar directamente esta vista.
    # ========================================================

    get_object_or_404(
        Apicultor,
        user=request.user
    )


    # ========================================================
    # 2. OBTENER DATOS
    #
    # No utilizamos .strip() en contraseñas porque los
    # espacios pueden formar parte legítimamente de ellas.
    # ========================================================

    password_actual = (
        request.POST.get(
            "password_actual",
            ""
        )
    )


    password_nueva = (
        request.POST.get(
            "password_nueva",
            ""
        )
    )


    password_confirmacion = (
        request.POST.get(
            "password_confirmacion",
            ""
        )
    )


    # ========================================================
    # 3. VALIDAR CAMPOS OBLIGATORIOS
    # ========================================================

    if (
        not password_actual
        or
        not password_nueva
        or
        not password_confirmacion
    ):

        messages.error(
            request,
            (
                "Debes completar todos los "
                "campos de contraseña."
            )
        )

        return redirect(
            "perfil_apicultor"
        )


    # ========================================================
    # 4. VALIDAR CONTRASEÑA ACTUAL
    # ========================================================

    if not request.user.check_password(
        password_actual
    ):

        messages.error(
            request,
            "La contraseña actual no es correcta."
        )

        return redirect(
            "perfil_apicultor"
        )


    # ========================================================
    # 5. VALIDAR QUE LAS CONTRASEÑAS NUEVAS COINCIDAN
    # ========================================================

    if (
        password_nueva
        !=
        password_confirmacion
    ):

        messages.error(
            request,
            "Las contraseñas nuevas no coinciden."
        )

        return redirect(
            "perfil_apicultor"
        )


    # ========================================================
    # 6. NO PERMITIR REUTILIZAR LA CONTRASEÑA ACTUAL
    # ========================================================

    if request.user.check_password(
        password_nueva
    ):

        messages.warning(
            request,
            (
                "La nueva contraseña debe ser "
                "diferente a la contraseña actual."
            )
        )

        return redirect(
            "perfil_apicultor"
        )


    # ========================================================
    # 7. VALIDADORES DE CONTRASEÑA DE DJANGO
    #
    # Aquí se aplican las reglas configuradas en:
    #
    # AUTH_PASSWORD_VALIDATORS
    #
    # Por ejemplo:
    # - longitud mínima
    # - contraseña demasiado común
    # - contraseña completamente numérica
    # - similitud con datos del usuario
    # ========================================================

    try:

        validate_password(
            password_nueva,
            user=request.user
        )


    except ValidationError as errores:

        for error in errores.messages:

            messages.error(
                request,
                error
            )


        return redirect(
            "perfil_apicultor"
        )


    # ========================================================
    # 8. GUARDAR SESSION KEY ACTUAL
    #
    # update_session_auth_hash() puede rotar la session_key
    # de Django después de cambiar la contraseña.
    #
    # Necesitamos conservar la anterior para actualizar
    # también nuestro modelo SesionUsuario.
    # ========================================================

    session_key_anterior = (
        request.session.session_key
    )


    # ========================================================
    # 9. CAMBIAR CONTRASEÑA
    # ========================================================

    try:

        request.user.set_password(
            password_nueva
        )


        request.user.save(
            update_fields=[
                "password"
            ]
        )


        # ====================================================
        # 10. MANTENER AUTENTICADA LA SESIÓN ACTUAL
        #
        # Sin esta función Django cerraría la sesión actual
        # después del cambio de contraseña.
        # ====================================================

        update_session_auth_hash(
            request,
            request.user
        )


    except Exception as error:

        print(
            "ERROR CAMBIANDO CONTRASEÑA "
            "DEL APICULTOR:",
            error
        )


        messages.error(
            request,
            (
                "No fue posible actualizar tu contraseña. "
                "Inténtalo nuevamente."
            )
        )


        return redirect(
            "perfil_apicultor"
        )


    # ========================================================
    # 11. SINCRONIZAR LA SESSION KEY
    #
    # Nuestro modelo SesionUsuario guarda la session_key.
    #
    # Si Django cambió la clave después de actualizar la
    # contraseña, debemos actualizar también ese registro
    # para que Sesiones activas continúe funcionando.
    # ========================================================

    try:

        sincronizar_session_key(
            request,
            session_key_anterior
        )


    except Exception as error:

        print(
            "ERROR SINCRONIZANDO SESIÓN "
            "DESPUÉS DEL CAMBIO DE CONTRASEÑA:",
            error
        )


    # ========================================================
    # 12. REGISTRAR EN HISTORIAL DE ACCESOS
    # ========================================================

    try:

        registrar_historial_acceso(
            request,
            request.user,
            actividad="cambio_password",
            detalle=(
                "El usuario actualizó su contraseña "
                "desde el perfil del apicultor."
            ),
            exitoso=True
        )


    except Exception as error:

        print(
            "ERROR REGISTRANDO CAMBIO "
            "DE CONTRASEÑA EN HISTORIAL:",
            error
        )


    # ========================================================
    # 13. MENSAJE DE ÉXITO
    # ========================================================

    messages.success(
        request,
        "Tu contraseña fue actualizada correctamente."
    )


    # ========================================================
    # 14. REGRESAR AL PERFIL
    # ========================================================

    return redirect(
        "perfil_apicultor"
    )



# ============================================================
# CENTRO DE NOTIFICACIONES
# PANEL APICULTOR
# ============================================================

@login_required
def notificaciones_apicultor(request):

    # ========================================================
    # 1. VALIDAR QUE EL USUARIO SEA APICULTOR
    # ========================================================

    get_object_or_404(
        Apicultor,
        user=request.user
    )


    # ========================================================
    # 2. NOTIFICACIONES DEL USUARIO ACTUAL
    #
    # SEGURIDAD:
    # Nunca recibimos un usuario por URL o formulario.
    # ========================================================

    notificaciones = (
        Notificacion.objects
        .filter(
            usuario=request.user
        )
        .order_by(
            "-fecha_creacion"
        )
    )


    # ========================================================
    # 3. FILTRO DE ESTADO
    # ========================================================

    estado = (
        request.GET
        .get(
            "estado",
            "todas"
        )
        .strip()
        .lower()
    )


    if estado == "no_leidas":

        notificaciones = (
            notificaciones.filter(
                leida=False
            )
        )

    elif estado == "leidas":

        notificaciones = (
            notificaciones.filter(
                leida=True
            )
        )

    elif estado != "todas":

        estado = "todas"


    # ========================================================
    # 4. FILTRO POR TIPO
    # ========================================================

    tipo = (
        request.GET
        .get(
            "tipo",
            ""
        )
        .strip()
        .lower()
    )


    tipos_validos = {
        "incidencia",
        "mantenimiento",
        "colmena",
        "agenda",
        "seguridad",
        "sistema",
    }


    if tipo in tipos_validos:

        notificaciones = (
            notificaciones.filter(
                tipo=tipo
            )
        )

    else:

        tipo = ""


    # ========================================================
    # 5. CONTADORES GENERALES
    # ========================================================

    notificaciones_usuario = (
        Notificacion.objects
        .filter(
            usuario=request.user
        )
    )


    total_notificaciones = (
        notificaciones_usuario.count()
    )


    total_no_leidas = (
        notificaciones_usuario
        .filter(
            leida=False
        )
        .count()
    )


    total_leidas = (
        notificaciones_usuario
        .filter(
            leida=True
        )
        .count()
    )


    # ========================================================
    # 6. PAGINACIÓN
    # ========================================================

    paginator = Paginator(
        notificaciones,
        10
    )


    pagina = (
        request.GET.get(
            "page"
        )
    )


    notificaciones_pagina = (
        paginator.get_page(
            pagina
        )
    )


    # ========================================================
    # 7. CONTEXTO
    # ========================================================

    contexto = {

        "notificaciones":
            notificaciones_pagina,

        "estado_seleccionado":
            estado,

        "tipo_seleccionado":
            tipo,

        "total_notificaciones":
            total_notificaciones,

        "total_no_leidas":
            total_no_leidas,

        "total_leidas":
            total_leidas,

    }


    # ========================================================
    # 8. RENDER
    # ========================================================

    return render(
        request,
        "panel_apicultor/notificaciones.html",
        contexto
    )


# ============================================================
# MARCAR UNA NOTIFICACIÓN COMO LEÍDA
# PANEL APICULTOR
# ============================================================

@login_required
@require_POST
def marcar_notificacion_leida_apicultor(
    request,
    id_notificacion
):

    # ========================================================
    # 1. VALIDAR APICULTOR
    # ========================================================

    get_object_or_404(
        Apicultor,
        user=request.user
    )


    # ========================================================
    # 2. BUSCAR ÚNICAMENTE UNA NOTIFICACIÓN PROPIA
    #
    # Esto evita que modificando el ID se pueda marcar
    # la notificación de otro usuario.
    # ========================================================

    notificacion = get_object_or_404(
        Notificacion,
        pk=id_notificacion,
        usuario=request.user
    )


    # ========================================================
    # 3. MARCAR COMO LEÍDA
    # ========================================================

    if not notificacion.leida:

        notificacion.leida = True

        notificacion.fecha_lectura = (
            timezone.now()
        )


        notificacion.save(
            update_fields=[
                "leida",
                "fecha_lectura",
            ]
        )


    # ========================================================
    # 4. DESTINO
    #
    # Utilizamos únicamente la URL almacenada en nuestra
    # propia notificación.
    # ========================================================

    if notificacion.url:

        return redirect(
            notificacion.url
        )


    return redirect(
        "notificaciones_apicultor"
    )


# ============================================================
# MARCAR TODAS LAS NOTIFICACIONES COMO LEÍDAS
# PANEL APICULTOR
# ============================================================

@login_required
@require_POST
def marcar_todas_notificaciones_leidas_apicultor(
    request
):

    # ========================================================
    # VALIDAR APICULTOR
    # ========================================================

    get_object_or_404(
        Apicultor,
        user=request.user
    )


    # ========================================================
    # ACTUALIZAR SOLAMENTE NOTIFICACIONES DEL USUARIO
    # ========================================================

    ahora = timezone.now()


    cantidad = (
        Notificacion.objects
        .filter(
            usuario=request.user,
            leida=False
        )
        .update(
            leida=True,
            fecha_lectura=ahora
        )
    )


    # ========================================================
    # MENSAJE
    # ========================================================

    if cantidad > 0:

        messages.success(
            request,
            (
                f"{cantidad} notificación"
                f"{'es' if cantidad != 1 else ''} "
                "marcada"
                f"{'s' if cantidad != 1 else ''} "
                "como leída"
                f"{'s' if cantidad != 1 else ''}."
            )
        )

    else:

        messages.info(
            request,
            "No tienes notificaciones pendientes."
        )


    return redirect(
        "notificaciones_apicultor"
    )
