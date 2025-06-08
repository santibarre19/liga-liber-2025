// script.js

document.addEventListener("DOMContentLoaded", () => {
  const adminPassword = "LIGALIBER2025";

  const loginForm = document.getElementById("admin-login-form");
  const adminSection = document.getElementById("admin-section");
  const loginSection = document.getElementById("login-section");

  if (localStorage.getItem("isAdmin") === "true") {
    showAdminSection();
  }

  loginForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const passwordInput = document.getElementById("admin-password").value;
    if (passwordInput === adminPassword) {
      localStorage.setItem("isAdmin", "true");
      showAdminSection();
    } else {
      alert("Contraseña incorrecta.");
    }
  });

  function showAdminSection() {
    adminSection?.classList.remove("hidden");
    loginSection?.classList.add("hidden");
    document.body.classList.add("admin-mode");
  }
});
