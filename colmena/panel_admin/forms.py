from calendar import monthrange

from django import forms
from django.utils import timezone

from dbmicolmena.models import (
    VinculacionApicultor,
    RegistroLaboralMensual,
    Apiario,
    Apicultor,
    Colmena,
    EventoAgenda,
)

class VinculacionApicultorForm(forms.ModelForm):

    class Meta:
        model = VinculacionApicultor

        fields = [
            "fecha_ingreso",
            "lunes",
            "martes",
            "miercoles",
            "jueves",
            "viernes",
            "sabado",
            "domingo",
        ]

        widgets = {
            "fecha_ingreso": forms.DateInput(
                attrs={
                    "type": "date",
                    "class": "form-control",
                }
            ),

            "lunes": forms.CheckboxInput(
                attrs={"class": "form-check-input"}
            ),

            "martes": forms.CheckboxInput(
                attrs={"class": "form-check-input"}
            ),

            "miercoles": forms.CheckboxInput(
                attrs={"class": "form-check-input"}
            ),

            "jueves": forms.CheckboxInput(
                attrs={"class": "form-check-input"}
            ),

            "viernes": forms.CheckboxInput(
                attrs={"class": "form-check-input"}
            ),

            "sabado": forms.CheckboxInput(
                attrs={"class": "form-check-input"}
            ),

            "domingo": forms.CheckboxInput(
                attrs={"class": "form-check-input"}
            ),
        }

    def clean_fecha_ingreso(self):

        fecha_ingreso = self.cleaned_data["fecha_ingreso"]

        if fecha_ingreso > timezone.localdate():

            raise forms.ValidationError(
                "La fecha de ingreso no puede estar en el futuro."
            )

        return fecha_ingreso

    def clean(self):

        datos = super().clean()

        dias = [
            datos.get("lunes"),
            datos.get("martes"),
            datos.get("miercoles"),
            datos.get("jueves"),
            datos.get("viernes"),
            datos.get("sabado"),
            datos.get("domingo"),
        ]

        if not any(dias):

            raise forms.ValidationError(
                "Selecciona al menos un día habitual de trabajo."
            )

        return datos


class RegistroLaboralMensualForm(forms.ModelForm):

    mes_reporte = forms.DateField(
        input_formats=["%Y-%m"],
        widget=forms.DateInput(
            format="%Y-%m",
            attrs={
                "type": "month",
                "class": "form-control",
            }
        )
    )

    class Meta:
        model = RegistroLaboralMensual

        fields = [
            "mes_reporte",
            "dias_trabajados_mes",
            "horas_trabajadas_mes",
            "observaciones",
        ]

        widgets = {
            "dias_trabajados_mes": forms.NumberInput(
                attrs={
                    "class": "form-control",
                    "min": "0",
                    "max": "31",
                    "placeholder": "Ejemplo: 22",
                }
            ),

            "horas_trabajadas_mes": forms.NumberInput(
                attrs={
                    "class": "form-control",
                    "min": "0",
                    "step": "0.5",
                    "placeholder": "Ejemplo: 176",
                }
            ),

            "observaciones": forms.Textarea(
                attrs={
                    "class": "form-control",
                    "rows": "3",
                    "maxlength": "1000",
                    "placeholder": (
                        "Observaciones sobre el trabajo realizado "
                        "durante el mes..."
                    ),
                }
            ),
        }

    def clean_mes_reporte(self):

        mes_reporte = self.cleaned_data["mes_reporte"]

        mes_reporte = mes_reporte.replace(day=1)

        mes_actual = timezone.localdate().replace(day=1)

        if mes_reporte > mes_actual:

            raise forms.ValidationError(
                "No puedes registrar un mes futuro."
            )

        return mes_reporte

    def clean(self):

        datos = super().clean()

        mes_reporte = datos.get("mes_reporte")
        dias_trabajados = datos.get("dias_trabajados_mes")
        horas_trabajadas = datos.get("horas_trabajadas_mes")

        if not mes_reporte:
            return datos

        if dias_trabajados is None:
            return datos

        ultimo_dia = monthrange(
            mes_reporte.year,
            mes_reporte.month
        )[1]

        if dias_trabajados > ultimo_dia:

            self.add_error(
                "dias_trabajados_mes",
                (
                    f"El mes seleccionado solamente tiene "
                    f"{ultimo_dia} días."
                )
            )

        if (
            horas_trabajadas is not None
            and horas_trabajadas > dias_trabajados * 24
        ):

            self.add_error(
                "horas_trabajadas_mes",
                (
                    "Las horas no pueden superar 24 horas "
                    "por cada día trabajado."
                )
            )

        return datos


class EventoAgendaForm(forms.ModelForm):

    # ============================================================
    # TIPOS DE EVENTO PERMITIDOS EN AGENDA
    # ============================================================
    #
    # Incidencia permanece en el modelo para conservar posibles
    # registros históricos, pero no puede seleccionarse al crear
    # o editar eventos desde la Agenda.
    # ============================================================

    TIPOS_EVENTO_PERMITIDOS = tuple(
        (valor, nombre)
        for valor, nombre in EventoAgenda.TipoEvento.choices
        if valor != EventoAgenda.TipoEvento.INCIDENCIA
    )


    # ============================================================
    # CONFIGURACIÓN DEL FORMULARIO
    # ============================================================

    class Meta:

        model = EventoAgenda

        fields = [
            "titulo",
            "tipo_evento",
            "id_apiario",
            "id_colmena",
            "responsable",
            "fecha",
            "hora",
            "descripcion",
            "estado",
        ]

        widgets = {

            "titulo": forms.TextInput(
                attrs={
                    "class": "form-control",
                    "maxlength": "150",
                    "placeholder": "Título del evento",
                }
            ),

            "tipo_evento": forms.Select(
                attrs={
                    "class": "form-select",
                }
            ),

            "id_apiario": forms.Select(
                attrs={
                    "class": "form-select",
                }
            ),

            "id_colmena": forms.Select(
                attrs={
                    "class": "form-select",
                }
            ),

            "responsable": forms.Select(
                attrs={
                    "class": "form-select",
                }
            ),

            "fecha": forms.DateInput(
                attrs={
                    "class": "form-control",
                    "type": "date",
                }
            ),

            "hora": forms.TimeInput(
                attrs={
                    "class": "form-control",
                    "type": "time",
                }
            ),

            "descripcion": forms.Textarea(
                attrs={
                    "class": "form-control",
                    "rows": 4,
                    "maxlength": "500",
                    "placeholder": "Descripción del evento",
                }
            ),

            "estado": forms.Select(
                attrs={
                    "class": "form-select",
                }
            ),
        }


    # ============================================================
    # INICIALIZACIÓN
    # ============================================================

    def __init__(
        self,
        *args,
        **kwargs
    ):

        super().__init__(
            *args,
            **kwargs
        )


        # ========================================================
        # TIPOS DE EVENTO
        # ========================================================

        self.fields[
            "tipo_evento"
        ].choices = (
            self.TIPOS_EVENTO_PERMITIDOS
        )


        # ========================================================
        # APIARIOS
        # ========================================================

        self.fields[
            "id_apiario"
        ].queryset = (
            Apiario.objects
            .all()
            .order_by(
                "nombreapiario"
            )
        )


        # ========================================================
        # COLMENAS
        # ========================================================

        self.fields[
            "id_colmena"
        ].queryset = (
            Colmena.objects
            .select_related(
                "id_apiario"
            )
            .all()
            .order_by(
                "codigocolmena"
            )
        )


        # ========================================================
        # RESPONSABLES
        # ========================================================

        self.fields[
            "responsable"
        ].queryset = (
            Apicultor.objects
            .select_related(
                "user"
            )
            .all()
            .order_by(
                "user__first_name",
                "user__last_name"
            )
        )


        # ========================================================
        # CAMPOS OPCIONALES
        # ========================================================

        self.fields[
            "id_colmena"
        ].required = False

        self.fields[
            "responsable"
        ].required = False

        self.fields[
            "descripcion"
        ].required = False


        # ========================================================
        # ETIQUETAS VACÍAS
        # ========================================================

        self.fields[
            "id_apiario"
        ].empty_label = (
            "Selecciona un apiario"
        )

        self.fields[
            "id_colmena"
        ].empty_label = (
            "Sin colmena específica"
        )

        self.fields[
            "responsable"
        ].empty_label = (
            "Sin responsable"
        )


    # ============================================================
    # VALIDAR TIPO DE EVENTO
    # ============================================================

    def clean_tipo_evento(self):

        tipo_evento = (
            self.cleaned_data.get(
                "tipo_evento"
            )
        )

        tipos_permitidos = {
            valor
            for valor, _
            in self.TIPOS_EVENTO_PERMITIDOS
        }


        if (
            tipo_evento
            not in
            tipos_permitidos
        ):

            raise forms.ValidationError(
                (
                    "El tipo de evento seleccionado "
                    "no está permitido en la Agenda."
                )
            )


        return tipo_evento


    # ============================================================
    # VALIDACIONES GENERALES
    # ============================================================

    def clean(self):

        datos = super().clean()

        apiario = datos.get(
            "id_apiario"
        )

        colmena = datos.get(
            "id_colmena"
        )


        # ========================================================
        # VALIDAR RELACIÓN APIARIO / COLMENA
        # ========================================================

        if (
            apiario
            and
            colmena
            and
            colmena.id_apiario_id
            !=
            apiario.id_apiario
        ):

            self.add_error(
                "id_colmena",
                (
                    "La colmena seleccionada no pertenece "
                    "al apiario indicado."
                )
            )


        return datos