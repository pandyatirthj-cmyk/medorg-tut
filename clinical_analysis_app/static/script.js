
// =====================================
// MEDORGANIZE AI - SHARED JAVASCRIPT
// =====================================

// Display a SweetAlert2 notification when available.
function showAlert(message, type = "info", title = "") {
    if (window.Swal) {
        return Swal.fire({
            title: title,
            text: message,
            icon: type,
            confirmButtonColor: "#68459d"
        });
    }

    window.alert(message);
    return Promise.resolve();
}


// Toggle password visibility.

// Add data-password-toggle to a button and data-p
document.querySelectorAll("[data-password-toggle]").forEach(function (button) {
    button.addEventListener("click", function () {
        const inputId = button.getAttribute("data-password-toggle");
        const passwordInput = document.getElementById(inputId);

        if (!passwordInput) return;

        const isHidden = passwordInput.type === "password";

        passwordInput.type = isHidden ? "text" : "password";

        button.innerHTML = isHidden
            ? `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22"
                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 3l18 18"/>
                <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/>
                <path d="M9.9 5.2A11 11 0 0 1 12 5c6.5 0 10 7 10 7
                a14 14 0 0 1-4 4.7"/>
                <path d="M6.6 6.6C3.7 8.4 2 12 2 12s3.5 7 10 7
                a10 10 0 0 0 3.4-.6"/>
            </svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22"
                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/>
                <circle cx="12" cy="12" r="3"/>
            </svg>`;

        button.setAttribute(
            "aria-label",
            isHidden ? "Hide password" : "Show password"
        );

        button.setAttribute(
            "title",
            isHidden ? "Hide password" : "Show password"
        );
    });
});
// containing the ID of its associated password input.
document.addEventListener("click", function (event) {
    const button = event.target.closest("[data-password-toggle]");

    if (!button) return;

    const inputId = button.dataset.passwordTarget;
    const input = document.getElementById(inputId);

    if (!input) return;

    const showPassword = input.type === "password";

    input.type = showPassword ? "text" : "password";
    button.textContent = showPassword ? "Hide" : "Show";
    button.setAttribute("aria-pressed", String(showPassword));
    button.setAttribute(
        "aria-label",
        showPassword ? "Hide password" : "Show password"
    );
});


// Validate email format in the browser.
// The Flask backend must repeat this validation.
function validateEmail(value) {
    const email = value.trim();

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


// Validate password requirements.
function validatePassword(value) {
    const errors = [];

    if (!value) {
        errors.push("Password is required.");
        return errors;
    }

    if (value.length < 8) {
        errors.push("Password must contain at least 8 characters.");
    }

    if (value.length > 128) {
        errors.push("Password must not exceed 128 characters.");
    }

    if (!/[A-Z]/.test(value)) {
        errors.push("Add at least one uppercase letter.");
    }

    if (!/[a-z]/.test(value)) {
        errors.push("Add at least one lowercase letter.");
    }

    if (!/[0-9]/.test(value)) {
        errors.push("Add at least one number.");
    }

    return errors;
}


// Show field-level validation feedback.
// HTML inputs can use data-validate="email" or "password".
// An element with data-error-for="inputId" receives the message.
function setFieldError(input, message) {
    input.setAttribute("aria-invalid", message ? "true" : "false");

    const errorElement = document.querySelector(
        `[data-error-for="${input.id}"]`
    );

    if (errorElement) {
        errorElement.textContent = message || "";
    }
}


function validateField(input) {
    const value = input.value;
    let message = "";

    if (input.required && !value.trim()) {
        message = "This field is required.";
    } else if (input.dataset.validate === "email" && value.trim()) {
        if (!validateEmail(value)) {
            message = "Enter a valid email address containing @.";
        }
    } else if (input.dataset.validate === "password" && value) {
        message = validatePassword(value)[0] || "";
    }

    setFieldError(input, message);
    return !message;
}


// Validate required fields on blur and while correcting an error.
document.addEventListener("blur", function (event) {
    const input = event.target;

    if (input.matches("input[data-validate], input[required]")) {
        validateField(input);
    }
}, true);


document.addEventListener("input", function (event) {
    const input = event.target;

    if (
        input.matches("input[data-validate], input[required]") &&
        input.getAttribute("aria-invalid") === "true"
    ) {
        validateField(input);
    }
});


// Prevent accidental double submission on forms that opt in.
document.addEventListener("submit", function (event) {
    const form = event.target;

    if (!form.matches("[data-prevent-double-submit]")) return;

    if (!form.checkValidity()) {
        event.preventDefault();
        form.reportValidity();
        return;
    }

    const submitButton = form.querySelector('[type="submit"]');

    if (submitButton) {
        submitButton.disabled = true;

        // Re-enable if normal browser submission is prevented elsewhere.
        window.setTimeout(function () {
            if (submitButton.isConnected) {
                submitButton.disabled = false;
            }
        }, 5000);
    }
});