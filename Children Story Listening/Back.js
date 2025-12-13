const logMsg = document.getElementById("log-msg");
// alert("LOGGED IN")
function login(event) {

    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (email == "" || password == "") {
        showMessage("Please enter email and password!", false);
    } else if (email === "demo@kid.com" && password === "1234") {
        showMessage("Login successful! Redirecting...", true);
        setTimeout(function () {
            window.location.href = "dashboard.html";
        }, 1500);
    } else {
        showMessage("Oops! Invalid credentials ", false);
    }
}


// //Just to check
// function login() {
//     alert("Login clicked");
// }
// // Just to check


function loginGoogle() {
    showMessage("Google login successful! Redirecting...", true);
    setTimeout(function () {
        window.location.href = "dashboard.html";
    }, 1500);
}

function showMessage(message, success) {
    logMsg.style.display = "block";
    logMsg.textContent = message;

    if (success) {
        logMsg.classList.remove("login-error");
        logMsg.classList.add("login-success");
    } else {
        logMsg.classList.remove("login-success");
        logMsg.classList.add("login-error");
    }
}
