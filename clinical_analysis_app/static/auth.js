/* ============================================================
   MediScript — Authentication (Login / Register)

   ============================================================ */

const EYE_SHOW =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
const EYE_HIDE =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.9 17.9A10.6 10.6 0 0 1 12 20C5 20 1 12 1 12a19.7 19.7 0 0 1 5.1-5.9M9.9 4.2A10.9 10.9 0 0 1 12 4c7 0 11 8 11 8a19.6 19.6 0 0 1-2.2 3.2M1 1l22 22M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>';

// ---------- Helpers ----------
const $ = (sel) => document.querySelector(sel);
const users = () => JSON.parse(localStorage.getItem("ms_users") || "[]");

function saveUsers(list) {
  localStorage.setItem("ms_users", JSON.stringify(list));
}

function showFieldError(name, msg) {
  const input = document.querySelector(`[name="${name}"]`) || document.getElementById(name);
  const box = document.querySelector(`.err-msg[data-for="${name}"]`);
  if (input && input.classList) input.classList.add("error");
  if (box) {
    box.classList.add("show");
    const span = box.querySelector("span");
    if (span) span.textContent = msg;
  }
}

function clearFieldError(name) {
  const input = document.querySelector(`[name="${name}"]`) || document.getElementById(name);
  const box = document.querySelector(`.err-msg[data-for="${name}"]`);
  if (input && input.classList) input.classList.remove("error");
  if (box) box.classList.remove("show");
}

function showAlert(type, msg) {
  const alert = $("#authAlert");
  if (!alert) return;
  const icon =
    type === "success"
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>';
  alert.className = `auth-alert show ${type}`;
  alert.innerHTML = `${icon}<span>${msg}</span>`;
}

function setLoading(btn, loading) {
  if (!btn) return;
  btn.classList.toggle("loading", loading);
  btn.disabled = loading;
}

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// ---------- Password visibility toggles ----------
document.querySelectorAll(".toggle-pass").forEach((btn) => {
  btn.innerHTML = EYE_SHOW;
  btn.addEventListener("click", () => {
    const input = document.getElementById(btn.dataset.target);
    if (!input) return;
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    btn.innerHTML = show ? EYE_HIDE : EYE_SHOW;
  });
});

// ---------- Password strength meter ----------
const strengthWrap = $("#strength");
if (strengthWrap) {
  const pwd = $("#password");
  const bars = strengthWrap.querySelectorAll(".strength-bars span");
  const text = $("#strengthText");
  const levels = [
    { label: "Too weak", color: "#ef4444" },
    { label: "Weak", color: "#f97316" },
    { label: "Fair", color: "#f59e0b" },
    { label: "Good", color: "#84cc16" },
    { label: "Strong", color: "#10b981" },
  ];
  pwd.addEventListener("input", () => {
    const v = pwd.value;
    let score = 0;
    if (v.length >= 8) score++;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
    if (/\d/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;
    bars.forEach((b, i) => {
      b.style.background = i < score ? levels[score].color : "var(--border)";
    });
    text.textContent = v ? `Strength: ${levels[score].label}` : levels[0].label === "Too weak"
      ? "Use 8+ characters with a mix of letters, numbers & symbols."
      : "";
    text.style.color = v ? levels[score].color : "var(--muted)";
  });
}