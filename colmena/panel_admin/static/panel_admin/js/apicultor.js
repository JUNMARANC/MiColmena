document.addEventListener("DOMContentLoaded", function () {

    /* =========================================================
       ELEMENTOS DEL FORMULARIO
    ========================================================= */

    const formularioAgregar = document.getElementById(
        "formAgregarApicultor"
    );

    const inputFotoAgregar = document.getElementById(
        "fotoperfilAgregar"
    );

    const imagenPreviewAgregar = document.getElementById(
        "imagenPreviewAgregar"
    );

    const iconoPreviewAgregar = document.getElementById(
        "iconoPreviewAgregar"
    );

    const botonQuitarFoto = document.getElementById(
        "btnQuitarFotoAgregar"
    );

    const passwordAgregar = document.getElementById(
        "passwordAgregar"
    );

    const confirmarPasswordAgregar = document.getElementById(
        "confirmarPasswordAgregar"
    );

    const mensajePasswordNoCoincide = document.getElementById(
        "mensajePasswordNoCoincide"
    );

    const botonGuardarApicultor = document.getElementById(
        "btnGuardarApicultor"
    );

    const modalAgregarElemento = document.getElementById(
        "modalAgregarApicultor"
    );


    /* =========================================================
       MOSTRAR Y OCULTAR CONTRASEÑAS
    ========================================================= */

    const botonesMostrarPassword = document.querySelectorAll(
        ".btn-mostrar-password"
    );

    botonesMostrarPassword.forEach(function (boton) {

        boton.addEventListener("click", function () {

            const idInput = boton.dataset.passwordTarget;
            const inputPassword = document.getElementById(idInput);
            const icono = boton.querySelector("i");

            if (!inputPassword || !icono) {
                return;
            }

            if (inputPassword.type === "password") {

                inputPassword.type = "text";

                icono.classList.remove("bi-eye-fill");
                icono.classList.add("bi-eye-slash-fill");

                boton.setAttribute(
                    "aria-label",
                    "Ocultar contraseña"
                );

                boton.setAttribute(
                    "title",
                    "Ocultar contraseña"
                );

            } else {

                inputPassword.type = "password";

                icono.classList.remove("bi-eye-slash-fill");
                icono.classList.add("bi-eye-fill");

                boton.setAttribute(
                    "aria-label",
                    "Mostrar contraseña"
                );

                boton.setAttribute(
                    "title",
                    "Mostrar contraseña"
                );

            }

        });

    });


    /* =========================================================
       VISTA PREVIA DE FOTO
    ========================================================= */

    if (inputFotoAgregar) {

        inputFotoAgregar.addEventListener("change", function () {

            const archivo = inputFotoAgregar.files[0];

            if (!archivo) {
                limpiarVistaPreviaAgregar();
                return;
            }

            const tiposPermitidos = [
                "image/jpeg",
                "image/png",
                "image/webp"
            ];

            if (!tiposPermitidos.includes(archivo.type)) {

                alert(
                    "Selecciona una imagen en formato JPG, PNG o WEBP."
                );

                inputFotoAgregar.value = "";
                limpiarVistaPreviaAgregar();

                return;
            }

            const tamanoMaximo = 5 * 1024 * 1024;

            if (archivo.size > tamanoMaximo) {

                alert(
                    "La imagen no puede superar los 5 MB."
                );

                inputFotoAgregar.value = "";
                limpiarVistaPreviaAgregar();

                return;
            }

            const lector = new FileReader();

            lector.addEventListener("load", function (evento) {

                if (!imagenPreviewAgregar) {
                    return;
                }

                imagenPreviewAgregar.src = evento.target.result;
                imagenPreviewAgregar.classList.remove("d-none");

                if (iconoPreviewAgregar) {
                    iconoPreviewAgregar.classList.add("d-none");
                }

                if (botonQuitarFoto) {
                    botonQuitarFoto.classList.remove("d-none");
                }

            });

            lector.readAsDataURL(archivo);

        });

    }


    /* =========================================================
       QUITAR FOTO SELECCIONADA
    ========================================================= */

    if (botonQuitarFoto) {

        botonQuitarFoto.addEventListener("click", function () {

            if (inputFotoAgregar) {
                inputFotoAgregar.value = "";
            }

            limpiarVistaPreviaAgregar();

        });

    }


    function limpiarVistaPreviaAgregar() {

        if (imagenPreviewAgregar) {

            imagenPreviewAgregar.src = "";
            imagenPreviewAgregar.classList.add("d-none");

        }

        if (iconoPreviewAgregar) {
            iconoPreviewAgregar.classList.remove("d-none");
        }

        if (botonQuitarFoto) {
            botonQuitarFoto.classList.add("d-none");
        }

    }


    /* =========================================================
       VALIDAR QUE LAS CONTRASEÑAS COINCIDAN
    ========================================================= */

    function validarContrasenas() {

        if (
            !passwordAgregar ||
            !confirmarPasswordAgregar ||
            !mensajePasswordNoCoincide
        ) {
            return true;
        }

        const password = passwordAgregar.value;
        const confirmacion = confirmarPasswordAgregar.value;

        if (!confirmacion) {

            mensajePasswordNoCoincide.classList.add("d-none");
            confirmarPasswordAgregar.classList.remove("is-invalid");

            return true;

        }

        if (password !== confirmacion) {

            mensajePasswordNoCoincide.classList.remove("d-none");
            confirmarPasswordAgregar.classList.add("is-invalid");

            return false;

        }

        mensajePasswordNoCoincide.classList.add("d-none");
        confirmarPasswordAgregar.classList.remove("is-invalid");
        confirmarPasswordAgregar.classList.add("is-valid");

        return true;

    }


    if (passwordAgregar) {

        passwordAgregar.addEventListener(
            "input",
            validarContrasenas
        );

    }

    if (confirmarPasswordAgregar) {

        confirmarPasswordAgregar.addEventListener(
            "input",
            validarContrasenas
        );

    }


    /* =========================================================
       ENVÍO DEL FORMULARIO
    ========================================================= */

    if (formularioAgregar) {

        formularioAgregar.addEventListener(
            "submit",
            function (evento) {

                const contrasenasValidas = validarContrasenas();

                if (!contrasenasValidas) {

                    evento.preventDefault();

                    confirmarPasswordAgregar.focus();

                    return;
                }

                if (!formularioAgregar.checkValidity()) {

                    evento.preventDefault();
                    evento.stopPropagation();

                    formularioAgregar.classList.add(
                        "was-validated"
                    );

                    return;
                }

                if (botonGuardarApicultor) {

                    botonGuardarApicultor.disabled = true;

                    botonGuardarApicultor.innerHTML = `
                        <span
                            class="spinner-border spinner-border-sm me-2"
                            aria-hidden="true"
                        ></span>
                        Registrando...
                    `;

                }

            }
        );

    }


    /* =========================================================
    LIMPIAR FORMULARIO AL CERRAR EL MODAL
    ========================================================= */

    if (modalAgregarElemento) {

        modalAgregarElemento.addEventListener(
            "hidden.bs.modal",
            function () {

                if (formularioAgregar) {

                    formularioAgregar.reset();

                    formularioAgregar.classList.remove(
                        "was-validated"
                    );

                }

                limpiarVistaPreviaAgregar();

                if (mensajePasswordNoCoincide) {

                    mensajePasswordNoCoincide.classList.add(
                        "d-none"
                    );

                }

                if (confirmarPasswordAgregar) {

                    confirmarPasswordAgregar.classList.remove(
                        "is-invalid",
                        "is-valid"
                    );

                }

                if (botonGuardarApicultor) {

                    botonGuardarApicultor.disabled = false;

                    botonGuardarApicultor.innerHTML = `
                        <i class="bi bi-person-check-fill me-2"></i>
                        Registrar apicultor
                    `;

                }

                document
                    .querySelectorAll(".btn-mostrar-password")
                    .forEach(function (boton) {

                        const idInput = boton.dataset.passwordTarget;
                        const input = document.getElementById(idInput);
                        const icono = boton.querySelector("i");

                        if (input) {
                            input.type = "password";
                        }

                        if (icono) {

                            icono.classList.remove(
                                "bi-eye-slash-fill"
                            );

                            icono.classList.add(
                                "bi-eye-fill"
                            );

                        }

                    });

            }
        );

    }


    /* =========================================================
    TOOLTIPS DE BOOTSTRAP
    ========================================================= */

    if (typeof bootstrap !== "undefined") {

        const elementosTooltip = document.querySelectorAll(
            "[title]"
        );

        elementosTooltip.forEach(function (elemento) {

            new bootstrap.Tooltip(elemento);

        });

    }

});

/* =========================================================
   VISTA PREVIA DE LA FOTO DEL APICULTOR
========================================================= */

const inputFotoAgregar = document.getElementById(
    "fotoperfilAgregar"
);

const imagenPreviewAgregar = document.getElementById(
    "imagenPreviewAgregar"
);

const iconoPreviewAgregar = document.getElementById(
    "iconoPreviewAgregar"
);

const botonQuitarFotoAgregar = document.getElementById(
    "btnQuitarFotoAgregar"
);


function limpiarFotoAgregar() {

    if (inputFotoAgregar) {
        inputFotoAgregar.value = "";
    }

    if (imagenPreviewAgregar) {
        imagenPreviewAgregar.removeAttribute("src");
        imagenPreviewAgregar.classList.add("d-none");
    }

    if (iconoPreviewAgregar) {
        iconoPreviewAgregar.classList.remove("d-none");
    }

    if (botonQuitarFotoAgregar) {
        botonQuitarFotoAgregar.classList.add("d-none");
    }

}


if (inputFotoAgregar) {

    inputFotoAgregar.addEventListener("change", function () {

        const archivo = this.files && this.files[0];

        if (!archivo) {
            limpiarFotoAgregar();
            return;
        }

        const tiposPermitidos = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!tiposPermitidos.includes(archivo.type)) {

            alert(
                "Selecciona una imagen en formato JPG, PNG o WEBP."
            );

            limpiarFotoAgregar();
            return;
        }

        const tamanoMaximo = 5 * 1024 * 1024;

        if (archivo.size > tamanoMaximo) {

            alert(
                "La imagen no puede superar los 5 MB."
            );

            limpiarFotoAgregar();
            return;
        }

        const lector = new FileReader();

        lector.onload = function (evento) {

            if (!imagenPreviewAgregar) {
                return;
            }

            imagenPreviewAgregar.src = evento.target.result;
            imagenPreviewAgregar.classList.remove("d-none");

            if (iconoPreviewAgregar) {
                iconoPreviewAgregar.classList.add("d-none");
            }

            if (botonQuitarFotoAgregar) {
                botonQuitarFotoAgregar.classList.remove("d-none");
            }

        };

        lector.onerror = function () {

            alert(
                "No fue posible cargar la vista previa de la imagen."
            );

            limpiarFotoAgregar();

        };

        lector.readAsDataURL(archivo);

    });

}


if (botonQuitarFotoAgregar) {

    botonQuitarFotoAgregar.addEventListener(
        "click",
        function () {
            limpiarFotoAgregar();
        }
    );

}


/*MODAL DETALLE APICULTOR*/

document.addEventListener("DOMContentLoaded", function () {

    const modalDetalle = document.getElementById(
        "modalDetalleApicultor"
    );

    if (!modalDetalle) {
        return;
    }

    modalDetalle.addEventListener(
        "show.bs.modal",
        function (evento) {

            const boton = evento.relatedTarget;

            if (!boton) {
                return;
            }

            /* ===============================================
            DATOS RECIBIDOS DESDE EL BOTÓN DE LA TABLA
            =============================================== */

            const id = boton.dataset.id || "—";
            const urlPerfil = boton.dataset.perfilUrl || "#";
            const botonPerfilCompleto = document.getElementById(
                "btnPerfilCompletoApicultor"
            );

            if (botonPerfilCompleto) {
                botonPerfilCompleto.href = urlPerfil;
            }
            cargarApiariosDelApicultor(id);
            const nombre = boton.dataset.nombre || "Sin nombre";
            const nombres = boton.dataset.nombres || "Sin registrar";
            const apellidos = boton.dataset.apellidos || "Sin registrar";
            const username = boton.dataset.username || "Sin usuario";
            const identificacion =
                boton.dataset.identificacion || "Sin registrar";

            const correo = boton.dataset.correo || "";
            const telefono = boton.dataset.telefono || "";
            const zona = boton.dataset.zona || "Sin registrar";
            const experiencia = boton.dataset.experiencia || "";
            const rol = boton.dataset.rol || "Apicultor";
            const apiarios = Number(boton.dataset.apiarios || 0);
            const activo = boton.dataset.activo || "No";
            const foto = boton.dataset.foto || "";


            /* ===============================================
            INFORMACIÓN PRINCIPAL
            =============================================== */

            asignarTexto(
                "detalleIdApicultor",
                id
            );

            asignarTexto(
                "detalleNombreApicultor",
                nombre
            );

            asignarTexto(
                "detalleNombresApicultor",
                nombres
            );

            asignarTexto(
                "detalleApellidosApicultor",
                apellidos
            );

            asignarTexto(
                "detalleUsernameApicultor",
                username
            );

            asignarTexto(
                "detalleIdentificacionApicultor",
                identificacion
            );

            asignarTexto(
                "detalleRolApicultor",
                rol
            );

            asignarTexto(
                "detalleZonaApicultor",
                zona
            );


            /* ===============================================
            EXPERIENCIA
            =============================================== */

            let textoExperiencia = "Sin registrar";

            if (experiencia !== "") {

                const cantidadExperiencia = Number(experiencia);

                textoExperiencia =
                    `${cantidadExperiencia} ${
                        cantidadExperiencia === 1
                            ? "año"
                            : "años"
                    }`;

            }

            asignarTexto(
                "detalleExperienciaApicultor",
                textoExperiencia
            );


            /* ===============================================
            APIARIOS
            =============================================== */

            asignarTexto(
                "detalleCantidadApiarios",
                apiarios
            );

            asignarTexto(
                "detalleTextoApiarios",
                apiarios === 1
                    ? "Apiario"
                    : "Apiarios"
            );


            /* ===============================================
            CORREO Y TELÉFONO
            =============================================== */

            configurarEnlace(
                "detalleCorreoApicultor",
                correo,
                "mailto:",
                "Sin registrar"
            );

            configurarEnlace(
                "detalleTelefonoApicultor",
                telefono,
                "tel:",
                "Sin registrar"
            );


            /* ===============================================
            ESTADO DEL USUARIO
            =============================================== */

            const elementoEstado = document.getElementById(
                "detalleEstadoApicultor"
            );

            const indicadorEstado = document.getElementById(
                "detalleIndicadorEstado"
            );

            const estaActivo = activo.toLowerCase() === "sí";

            if (elementoEstado) {

                elementoEstado.textContent = estaActivo
                    ? "Usuario activo"
                    : "Usuario inactivo";

                elementoEstado.classList.remove(
                    "estado-detalle-activo",
                    "estado-detalle-inactivo"
                );

                elementoEstado.classList.add(
                    estaActivo
                        ? "estado-detalle-activo"
                        : "estado-detalle-inactivo"
                );

            }

            if (indicadorEstado) {

                indicadorEstado.classList.remove(
                    "indicador-detalle-activo",
                    "indicador-detalle-inactivo"
                );

                indicadorEstado.classList.add(
                    estaActivo
                        ? "indicador-detalle-activo"
                        : "indicador-detalle-inactivo"
                );

                indicadorEstado.title = estaActivo
                    ? "Usuario activo"
                    : "Usuario inactivo";

            }


            /* ===============================================
            FOTO
            =============================================== */

            const imagenFoto = document.getElementById(
                "detalleFotoApicultor"
            );

            const fotoSinImagen = document.getElementById(
                "detalleFotoSinImagen"
            );

            if (foto && imagenFoto) {

                imagenFoto.src = foto;
                imagenFoto.alt = `Foto de ${nombre}`;
                imagenFoto.classList.remove("d-none");

                if (fotoSinImagen) {
                    fotoSinImagen.classList.add("d-none");
                }

            } else {

                if (imagenFoto) {
                    imagenFoto.removeAttribute("src");
                    imagenFoto.classList.add("d-none");
                }

                if (fotoSinImagen) {
                    fotoSinImagen.classList.remove("d-none");
                }

            }

        }
    );


    /* =====================================================
    FUNCIÓN PARA ASIGNAR TEXTO
    ====================================================== */

    function asignarTexto(idElemento, valor) {

        const elemento = document.getElementById(idElemento);

        if (elemento) {
            elemento.textContent = valor;
        }

    }


    /* =====================================================
    FUNCIÓN PARA CONFIGURAR ENLACES
    ====================================================== */

    function configurarEnlace(
        idElemento,
        valor,
        prefijo,
        textoVacio
    ) {

        const elemento = document.getElementById(idElemento);

        if (!elemento) {
            return;
        }

        if (valor) {

            elemento.textContent = valor;
            elemento.href = `${prefijo}${valor}`;
            elemento.classList.remove("enlace-dato-vacio");

        } else {

            elemento.textContent = textoVacio;
            elemento.href = "#";
            elemento.classList.add("enlace-dato-vacio");

        }

    }

    /* =========================================================
    CARGAR APIARIOS EN EL MODAL DE DETALLE
    ========================================================= */

    function cargarApiariosDelApicultor(idApicultor) {

        const listaApiarios = document.getElementById(
            "listaApiariosDetalle"
        );

        const contadorPanel = document.getElementById(
            "contadorPanelApiarios"
        );

        const botonApiarios = document.getElementById(
            "btnMostrarApiariosDetalle"
        );

        const panelApiarios = document.getElementById(
            "panelApiariosDetalle"
        );

        const templateApiarios = document.getElementById(
            `templateApiariosApicultor${idApicultor}`
        );

        if (!listaApiarios) {
            return;
        }

        listaApiarios.innerHTML = "";

        if (templateApiarios) {

            const contenido = templateApiarios.content.cloneNode(true);

            listaApiarios.appendChild(contenido);

        } else {

            listaApiarios.innerHTML = `
                <div class="estado-sin-apiarios-detalle">
                    <div class="icono-sin-apiarios-detalle">
                        <i class="bi bi-inboxes-fill"></i>
                    </div>

                    <h6>No fue posible cargar los apiarios</h6>

                    <p>
                        No se encontró la información relacionada con
                        este apicultor.
                    </p>
                </div>
            `;

        }

        const cantidad = listaApiarios.querySelectorAll(
            ".item-apiario-detalle"
        ).length;

        if (contadorPanel) {
            contadorPanel.textContent = cantidad;
        }

        /*
        Cerrar la lista cada vez que se abra el detalle
        de otro apicultor.
        */
        if (panelApiarios) {

            const instanciaCollapse =
                bootstrap.Collapse.getOrCreateInstance(
                    panelApiarios,
                    {
                        toggle: false
                    }
                );

            instanciaCollapse.hide();

        }

        if (botonApiarios) {
            botonApiarios.setAttribute(
                "aria-expanded",
                "false"
            );
        }

    }

});

/*MODAL DE EDITAR APICULTOR */
document.addEventListener("DOMContentLoaded", function () {

    const modalEditar = document.getElementById(
        "modalEditarApicultor"
    );

    const formularioEditar = document.getElementById(
        "formEditarApicultor"
    );

    if (!modalEditar || !formularioEditar) {
        return;
    }


    /* =========================================================
       CAMPOS
    ========================================================= */

    const nombresEditar = document.getElementById(
        "nombresEditar"
    );

    const apellidosEditar = document.getElementById(
        "apellidosEditar"
    );

    const identificacionEditar = document.getElementById(
        "identificacionEditar"
    );

    const telefonoEditar = document.getElementById(
        "telefonoEditar"
    );

    const correoEditar = document.getElementById(
        "correoEditar"
    );

    const zonaTrabajoEditar = document.getElementById(
        "zonaTrabajoEditar"
    );

    const experienciaEditar = document.getElementById(
        "experienciaEditar"
    );

    const usernameEditar = document.getElementById(
        "usernameEditar"
    );

    const passwordEditar = document.getElementById(
        "passwordEditar"
    );

    const confirmarPasswordEditar = document.getElementById(
        "confirmarPasswordEditar"
    );

    const mensajePassword = document.getElementById(
        "mensajePasswordEditarNoCoincide"
    );

    const usuarioActivoEditar = document.getElementById(
        "usuarioActivoEditar"
    );

    const textoEstadoUsuario = document.getElementById(
        "textoEstadoUsuarioEditar"
    );

    const inputFotoEditar = document.getElementById(
        "fotoperfilEditar"
    );

    const imagenPreviewEditar = document.getElementById(
        "imagenPreviewEditar"
    );

    const iconoPreviewEditar = document.getElementById(
        "iconoPreviewEditar"
    );

    const botonQuitarFotoEditar = document.getElementById(
        "btnQuitarFotoEditar"
    );

    const eliminarFotoEditar = document.getElementById(
        "eliminarFotoEditar"
    );

    const botonGuardar = document.getElementById(
        "btnGuardarEdicionApicultor"
    );

    let fotoOriginalEditar = "";


    /* =========================================================
       ABRIR MODAL Y CARGAR DATOS
    ========================================================= */

    modalEditar.addEventListener(
        "show.bs.modal",
        function (evento) {

            const boton = evento.relatedTarget;

            if (!boton) {
                return;
            }

            formularioEditar.action = boton.dataset.url || "";

            asignarValor(
                nombresEditar,
                boton.dataset.nombres
            );

            asignarValor(
                apellidosEditar,
                boton.dataset.apellidos
            );

            asignarValor(
                identificacionEditar,
                boton.dataset.identificacion
            );

            asignarValor(
                telefonoEditar,
                boton.dataset.telefono
            );

            asignarValor(
                correoEditar,
                boton.dataset.correo
            );

            asignarValor(
                zonaTrabajoEditar,
                boton.dataset.zona
            );

            asignarValor(
                experienciaEditar,
                boton.dataset.experiencia
            );

            asignarValor(
                usernameEditar,
                boton.dataset.username
            );

            if (passwordEditar) {
                passwordEditar.value = "";
            }

            if (confirmarPasswordEditar) {
                confirmarPasswordEditar.value = "";
            }

            if (mensajePassword) {
                mensajePassword.classList.add("d-none");
            }

            if (eliminarFotoEditar) {
                eliminarFotoEditar.value = "0";
            }

            fotoOriginalEditar = boton.dataset.foto || "";

            mostrarFotoEditar(
                fotoOriginalEditar
            );

            const usuarioActivo =
                boton.dataset.activo === "1";

            if (usuarioActivoEditar) {
                usuarioActivoEditar.checked = usuarioActivo;
            }

            actualizarTextoEstado();

        }
    );


    /* =========================================================
       ESTADO ACTIVO O INACTIVO
    ========================================================= */

    function actualizarTextoEstado() {

        if (!usuarioActivoEditar || !textoEstadoUsuario) {
            return;
        }

        textoEstadoUsuario.textContent =
            usuarioActivoEditar.checked
                ? "Usuario activo"
                : "Usuario inactivo";

        textoEstadoUsuario.classList.toggle(
            "texto-usuario-inactivo",
            !usuarioActivoEditar.checked
        );

    }


    if (usuarioActivoEditar) {

        usuarioActivoEditar.addEventListener(
            "change",
            actualizarTextoEstado
        );

    }


    /* =========================================================
       VISTA PREVIA DE FOTO
    ========================================================= */

    function mostrarFotoEditar(urlFoto) {

        if (urlFoto) {

            if (imagenPreviewEditar) {

                imagenPreviewEditar.src = urlFoto;
                imagenPreviewEditar.classList.remove("d-none");

            }

            if (iconoPreviewEditar) {
                iconoPreviewEditar.classList.add("d-none");
            }

            if (botonQuitarFotoEditar) {
                botonQuitarFotoEditar.classList.remove("d-none");
            }

        } else {

            if (imagenPreviewEditar) {

                imagenPreviewEditar.removeAttribute("src");
                imagenPreviewEditar.classList.add("d-none");

            }

            if (iconoPreviewEditar) {
                iconoPreviewEditar.classList.remove("d-none");
            }

            if (botonQuitarFotoEditar) {
                botonQuitarFotoEditar.classList.add("d-none");
            }

        }

    }


    if (inputFotoEditar) {

        inputFotoEditar.addEventListener(
            "change",
            function () {

                const archivo = inputFotoEditar.files[0];

                if (!archivo) {
                    mostrarFotoEditar(fotoOriginalEditar);
                    return;
                }

                const tiposPermitidos = [
                    "image/jpeg",
                    "image/png",
                    "image/webp"
                ];

                if (!tiposPermitidos.includes(archivo.type)) {

                    alert(
                        "La imagen debe estar en formato JPG, PNG o WEBP."
                    );

                    inputFotoEditar.value = "";

                    mostrarFotoEditar(
                        fotoOriginalEditar
                    );

                    return;
                }

                const tamanoMaximo = 5 * 1024 * 1024;

                if (archivo.size > tamanoMaximo) {

                    alert(
                        "La imagen no puede superar los 5 MB."
                    );

                    inputFotoEditar.value = "";

                    mostrarFotoEditar(
                        fotoOriginalEditar
                    );

                    return;
                }

                const lector = new FileReader();

                lector.onload = function (eventoLectura) {

                    mostrarFotoEditar(
                        eventoLectura.target.result
                    );

                    if (eliminarFotoEditar) {
                        eliminarFotoEditar.value = "0";
                    }

                };

                lector.onerror = function () {

                    alert(
                        "No fue posible cargar la vista previa."
                    );

                    inputFotoEditar.value = "";

                    mostrarFotoEditar(
                        fotoOriginalEditar
                    );

                };

                lector.readAsDataURL(archivo);

            }
        );

    }


    /* =========================================================
       QUITAR FOTO
    ========================================================= */

    if (botonQuitarFotoEditar) {

        botonQuitarFotoEditar.addEventListener(
            "click",
            function () {

                if (inputFotoEditar) {
                    inputFotoEditar.value = "";
                }

                if (eliminarFotoEditar) {
                    eliminarFotoEditar.value = "1";
                }

                mostrarFotoEditar("");

            }
        );

    }


    /* =========================================================
       VALIDAR CONTRASEÑAS
    ========================================================= */

    function validarPasswordEditar() {

        if (
            !passwordEditar ||
            !confirmarPasswordEditar
        ) {
            return true;
        }

        const password = passwordEditar.value;
        const confirmacion =
            confirmarPasswordEditar.value;

        passwordEditar.setCustomValidity("");
        confirmarPasswordEditar.setCustomValidity("");

        confirmarPasswordEditar.classList.remove(
            "is-invalid",
            "is-valid"
        );

        if (!password && !confirmacion) {

            if (mensajePassword) {
                mensajePassword.classList.add("d-none");
            }

            return true;
        }

        if (password.length < 8) {

            passwordEditar.setCustomValidity(
                "La contraseña debe tener mínimo 8 caracteres."
            );

            return false;
        }

        if (!confirmacion || password !== confirmacion) {

            confirmarPasswordEditar.setCustomValidity(
                "Las contraseñas no coinciden."
            );

            confirmarPasswordEditar.classList.add(
                "is-invalid"
            );

            if (mensajePassword) {
                mensajePassword.classList.remove("d-none");
            }

            return false;
        }

        confirmarPasswordEditar.classList.add(
            "is-valid"
        );

        if (mensajePassword) {
            mensajePassword.classList.add("d-none");
        }

        return true;

    }


    if (passwordEditar) {

        passwordEditar.addEventListener(
            "input",
            validarPasswordEditar
        );

    }

    if (confirmarPasswordEditar) {

        confirmarPasswordEditar.addEventListener(
            "input",
            validarPasswordEditar
        );

    }


    /* =========================================================
       ENVÍO DEL FORMULARIO
    ========================================================= */

    formularioEditar.addEventListener(
        "submit",
        function (evento) {

            const passwordValido =
                validarPasswordEditar();

            if (
                !passwordValido ||
                !formularioEditar.checkValidity()
            ) {

                evento.preventDefault();
                evento.stopPropagation();

                formularioEditar.classList.add(
                    "was-validated"
                );

                return;
            }

            if (botonGuardar) {

                botonGuardar.disabled = true;

                botonGuardar.innerHTML = `
                    <span
                        class="spinner-border spinner-border-sm me-2"
                        aria-hidden="true"
                    ></span>
                    Guardando...
                `;

            }

        }
    );


    /* =========================================================
       LIMPIAR AL CERRAR
    ========================================================= */

    modalEditar.addEventListener(
        "hidden.bs.modal",
        function () {

            formularioEditar.reset();

            formularioEditar.classList.remove(
                "was-validated"
            );

            formularioEditar.action = "";

            fotoOriginalEditar = "";

            if (inputFotoEditar) {
                inputFotoEditar.value = "";
            }

            if (eliminarFotoEditar) {
                eliminarFotoEditar.value = "0";
            }

            if (passwordEditar) {

                passwordEditar.value = "";
                passwordEditar.type = "password";
                passwordEditar.setCustomValidity("");

            }

            if (confirmarPasswordEditar) {

                confirmarPasswordEditar.value = "";
                confirmarPasswordEditar.type = "password";
                confirmarPasswordEditar.setCustomValidity("");

                confirmarPasswordEditar.classList.remove(
                    "is-invalid",
                    "is-valid"
                );

            }

            if (mensajePassword) {
                mensajePassword.classList.add("d-none");
            }

            mostrarFotoEditar("");

            if (botonGuardar) {

                botonGuardar.disabled = false;

                botonGuardar.innerHTML = `
                    <i class="bi bi-floppy-fill me-2"></i>
                    Guardar cambios
                `;

            }

        }
    );


    /* =========================================================
       FUNCIÓN AUXILIAR
    ========================================================= */

    function asignarValor(elemento, valor) {

        if (elemento) {
            elemento.value = valor || "";
        }

    }

});


document.addEventListener("DOMContentLoaded", function () {

    const modalElemento = document.getElementById(
        "modalEliminarApicultor"
    );

    const formularioEliminar = document.getElementById(
        "formEliminarApicultor"
    );

    const nombreApicultorEliminar = document.getElementById(
        "nombreApicultorEliminar"
    );

    const alertaPermitida = document.getElementById(
        "alertaEliminacionPermitida"
    );

    const alertaBloqueada = document.getElementById(
        "alertaEliminacionBloqueada"
    );

    const mensajeApiarios = document.getElementById(
        "mensajeApiariosEliminar"
    );

    const botonConfirmar = document.getElementById(
        "btnConfirmarEliminarApicultor"
    );

    /*
    Si alguno de estos elementos no existe, el modal
    no está incluido correctamente en la plantilla.
    */
    if (
        !modalElemento ||
        !formularioEliminar ||
        !botonConfirmar
    ) {
        console.error(
            "No se encontraron los elementos del modal de eliminación."
        );

        return;
    }

    const modalEliminar = bootstrap.Modal.getOrCreateInstance(
        modalElemento
    );

    const botonesEliminar = document.querySelectorAll(
        ".btn-eliminar-apicultor"
    );

    botonesEliminar.forEach(function (boton) {

        boton.addEventListener("click", function () {

            const nombre =
                boton.dataset.nombre || "Apicultor";

            const url =
                boton.dataset.url || "";

            const cantidadApiarios = Number(
                boton.dataset.apiarios || 0
            );

            formularioEliminar.action = url;

            if (nombreApicultorEliminar) {
                nombreApicultorEliminar.textContent = nombre;
            }

            if (cantidadApiarios > 0) {

                if (alertaPermitida) {
                    alertaPermitida.classList.add("d-none");
                }

                if (alertaBloqueada) {
                    alertaBloqueada.classList.remove("d-none");
                }

                if (mensajeApiarios) {

                    if (cantidadApiarios === 1) {

                        mensajeApiarios.textContent =
                            "Este apicultor tiene 1 apiario vinculado. " +
                            "Debes reasignarlo antes de eliminar al apicultor.";

                    } else {

                        mensajeApiarios.textContent =
                            `Este apicultor tiene ${cantidadApiarios} ` +
                            "apiarios vinculados. Debes reasignarlos " +
                            "antes de eliminar al apicultor.";

                    }

                }

                botonConfirmar.disabled = true;

                botonConfirmar.innerHTML = `
                    <i class="bi bi-lock-fill me-2"></i>
                    Eliminación bloqueada
                `;

            } else {

                if (alertaPermitida) {
                    alertaPermitida.classList.remove("d-none");
                }

                if (alertaBloqueada) {
                    alertaBloqueada.classList.add("d-none");
                }

                botonConfirmar.disabled = false;

                botonConfirmar.innerHTML = `
                    <i class="bi bi-trash3-fill me-2"></i>
                    Eliminar definitivamente
                `;

            }

            modalEliminar.show();

        });

    });

    formularioEliminar.addEventListener(
        "submit",
        function () {

            if (botonConfirmar.disabled) {
                return;
            }

            botonConfirmar.disabled = true;

            botonConfirmar.innerHTML = `
                <span
                    class="spinner-border spinner-border-sm me-2"
                    aria-hidden="true"
                ></span>
                Eliminando...
            `;

        }
    );

    modalElemento.addEventListener(
        "hidden.bs.modal",
        function () {

            formularioEliminar.action = "";

            if (nombreApicultorEliminar) {
                nombreApicultorEliminar.textContent = "Apicultor";
            }

        }
    );

});