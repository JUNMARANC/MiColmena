/*login*/

const btnPassword = document.getElementById("btnPassword");
const passwordInput = document.getElementById("passwordInput");

if (btnPassword && passwordInput) {
    btnPassword.addEventListener("click", function () {
        const icon = this.querySelector("i");
        const mostrando = passwordInput.type === "text";

        if (!mostrando) {
            passwordInput.type = "text";
            icon.classList.remove("bi-eye");
            icon.classList.add("bi-eye-slash");
            btnPassword.setAttribute("aria-label", "Ocultar contraseña");
            btnPassword.setAttribute("aria-pressed", "true");
        } else {
            passwordInput.type = "password";
            icon.classList.remove("bi-eye-slash");
            icon.classList.add("bi-eye");
            btnPassword.setAttribute("aria-label", "Mostrar contraseña");
            btnPassword.setAttribute("aria-pressed", "false");
        }
    });
}

/* Estado "Ingresando..." en el botón mientras se procesa el login */
const formLogin = document.querySelector(".form-login");

if (formLogin) {
    formLogin.addEventListener("submit", function () {
        const boton = formLogin.querySelector(".btn-login");
        if (!boton || boton.disabled) return;

        boton.dataset.textoOriginal = boton.innerHTML;
        boton.innerHTML = '<i class="bi bi-arrow-repeat"></i> Ingresando...';
        boton.disabled = true;
    });
}