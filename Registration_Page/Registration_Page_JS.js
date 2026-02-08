

const form = document.getElementById("regForm");
const msg = document.getElementById("log-msg");



(function addDemoUser() {
    if (!localStorage.getItem("usersCSV")) {
        const demoCSV =
            `name,email,password,isPaid
Demo ,demo@gmail.com,123456,false
Alex ,Alex@gmail.com,Alex123,true
Saniya ,Saniya@gmail.com,Saniya123,true
Ravi ,Ravi@gmail.com,Ravi123,true
`;
        localStorage.setItem("usersCSV", demoCSV);
    }
})();



form.addEventListener("submit", function (e) {
    e.preventDefault();

    const fullName = form.elements[0].value.trim();
    const email = form.elements[1].value.trim();
    const password = form.elements[2].value.trim();
    const confirmPassword = form.elements[3].value.trim();

    // Reset message
    msg.style.display = "block";
    msg.textContent = "";
    msg.classList.remove("login-success", "login-error");

    if (password !== confirmPassword) {
        // window.alert("Passwords do not match! Please re-enter.");
        msg.textContent = "Passwords do not match ❌";
        msg.classList.add("login-error", "show");
        return;
    }

    let csv = localStorage.getItem("usersCSV") || "name,email,password,isPaid\n";
    let rows = csv.split("\n").slice(1);

    for (let row of rows) {
        if (!row) continue;
        let parts = row.split(",");
        if (parts[1] === email) {
            // window.alert("Email already registered! Please use a different email.");
            msg.classList.add("login-error", "show");
            msg.textContent = "Already registered / Have an account 🚫";
            setTimeout(() => {
                window.location.href = "../Welcome_Page/Welcome_Page_Index.html"; // change path if needed
            }, 2000);
            return;
        }
    }

    // Success
    csv += `${fullName},${email},${password},false\n`;
    localStorage.setItem("usersCSV", csv);
    // window.alert("Registration successful! You can now log in.");
    msg.textContent = "Registration successful! 🎉";
    msg.classList.add("login-success", "show");
    setTimeout(() => {
        window.location.href = "../Welcome_Page/Welcome_Page_Index.html"; // change path if needed
    }, 2000);

    form.reset();
});

document.querySelectorAll(".toggle-password").forEach(icon => {
    icon.addEventListener("click", () => {
        const input = document.getElementById(icon.dataset.target);

        if (input.type === "password") {
            input.type = "text";
            icon.classList.replace("fa-eye", "fa-eye-slash");
        } else {
            input.type = "password";
            icon.classList.replace("fa-eye-slash", "fa-eye");
        }
    });
});
const passwordInput = document.getElementById("password");
const strengthText = document.getElementById("password-strength");

passwordInput.addEventListener("input", () => {
    const pwd = passwordInput.value;
    let strength = 0;


    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (pwd.length >= 8) strength++;
    if (strength <= 1) {
        strengthText.textContent = "❌ Weak password";
        strengthText.className = "weak";
    } else if (strength === 2 || strength === 3) {
        strengthText.textContent = "⚠ Medium password";
        strengthText.className = "medium";
    } else if (strength === 4) {
        strengthText.textContent = " ✅ Strong password";
        strengthText.className = "strong";
    } else {
        strengthText.textContent = " 🔒Very Secure password";
        strengthText.className = "stronger";
    }
});

