const logMsg = document.getElementById("log-msg");

// === REPLACE THIS WITH YOUR ACTUAL GOOGLE CLIENT ID ===
const GOOGLE_CLIENT_ID = "371449131620-e9cariaa9juvonu4lisv9if7g8medepj.apps.googleusercontent.com";
// =======================================================

// Keep your existing email/password demo login
function login(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (email === "" || password === "") {
        showMessage("Please enter email and password!", false);
    } else if (email === "demo@kid.com" && password === "1234") {
        showMessage("Login successful! Redirecting to stories... 🎉", true);
        setTimeout(() => {
            window.location.href = "http://172.203.138.104";  // Or better: your Azure domain
        }, 2000);
    } else {
        showMessage("Oops! Wrong email or password", false);
    }
}

// === REAL GOOGLE SIGN-IN (replaces the old loginGoogle demo) ===
function handleGoogleCredentialResponse(response) {
    // Google sends a secure JWT token
    const jwtToken = response.credential;

    // Decode JWT to get user info (safe client-side)
    function parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    }

    const userInfo = parseJwt(jwtToken);

    if (userInfo) {
        // Google has already verified the token — you can trust this data
        const userName = userInfo.name || "friend";
        const userEmail = userInfo.email;

        console.log("Google user logged in:", userInfo); // For debugging

        showMessage(`Yay ${userName}! Welcome back! Redirecting... ✨`, true);

        setTimeout(() => {
            window.location.href = "http://172.203.138.104";  // Update to your Azure domain later
        }, 2000);
    } else {
        showMessage("Oops! Google login failed. Try again.", false);
    }
}

// Load Google Identity Services and render the button
window.onload = function () {
    // Dynamically load the Google script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = function () {
        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCredentialResponse,
            auto_select: false  // Set true if you want auto-login for returning users
        });

        // Render the official Google button inside your .google-btn element
        // Make sure your HTML has: <div class="google-btn"></div>
        google.accounts.id.renderButton(
            document.querySelector(".google-btn"),
            {
                type: "standard",
                theme: "outline",
                size: "large",
                text: "signin_with",
                shape: "rect",
                width: "100%"  // Matches your container
            }
        );

        // Optional: Show One Tap prompt for returning users
        google.accounts.id.prompt();
    };
    document.head.appendChild(script);
};

// Keep your showMessage function unchanged
function showMessage(message, success) {
    logMsg.style.display = "block";
    logMsg.textContent = message;
    logMsg.classList.remove("login-success", "login-error");
    logMsg.classList.add(success ? "login-success" : "login-error");
}