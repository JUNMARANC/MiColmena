/*login*/

const btnPassword = document.getElementById("btnPassword");
const passwordInput = document.getElementById("passwordInput");

if (btnPassword && passwordInput) {
    btnPassword.addEventListener("click", function () {
        const icon = this.querySelector("i");

        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            icon.classList.remove("bi-eye");
            icon.classList.add("bi-eye-slash");
        } else {
            passwordInput.type = "password";
            icon.classList.remove("bi-eye-slash");
            icon.classList.add("bi-eye");
        }
    });
}
