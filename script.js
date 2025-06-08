// Contraseña de administrador
const adminPassword = "liber2025";
let isAdmin = false;

document.addEventListener("DOMContentLoaded", () => {
  const loginSection = document.getElementById("login-section");
  const appSection = document.getElementById("app");
  const passwordInput = document.getElementById("password-input");
  const loginButton = document.getElementById("login-button");

  loginButton.addEventListener("click", () => {
    if (passwordInput.value === adminPassword) {
      isAdmin = true;
      loginSection.classList.add("hidden");
      appSection.classList.remove("hidden");
    } else {
      alert("Contraseña incorrecta.");
    }
  });

  // Navegación entre secciones
  const botones = document.querySelectorAll("nav button");
  const secciones = document.querySelectorAll(".section");

  botones.forEach(boton => {
    boton.addEventListener("click", () => {
      secciones.forEach(seccion => seccion.classList.remove("visible"));
      document.getElementById(boton.dataset.target).classList.add("visible");
    });
  });

  // Cargar datos iniciales o desde localStorage
  const equipos = cargarEquipos();
  const posiciones = inicializarPosiciones(equipos);
  const goleadores = {};

  mostrarPosiciones(posiciones);
  mostrarFixture();
  mostrarGoleadores(goleadores);
  mostrarEquipos(equipos);
});

// Funciones de almacenamiento local
function cargarEquipos() {
  const datos = localStorage.getItem("equipos");
  if (datos) return JSON.parse(datos);

  // Datos por defecto
  const iniciales = [
    { nombre: "Quinto Lenguas", escudo: "" },
    { nombre: "Segundo Sociales", escudo: "" },
    { nombre: "Segundo Lenguas", escudo: "" },
    { nombre: "Quinto Sociales", escudo: "" },
    { nombre: "Cuarto", escudo: "" },
    { nombre: "Sexto", escudo: "" }
  ];
  localStorage.setItem("equipos", JSON.stringify(iniciales));
  return iniciales;
}

function guardarEquipos(equipos) {
  localStorage.setItem("equipos", JSON.stringify(equipos));
}

// Mostrar posiciones
function inicializarPosiciones(equipos) {
  return equipos.map(e => ({
    nombre: e.nombre,
    pts: 0,
    pj: 0,
    pg: 0,
    pe: 0,
    pp: 0,
    gf: 0,
    gc: 0,
    dif: 0
  }));
}

function mostrarPosiciones(posiciones) {
  const tabla = document.getElementById("tabla-posiciones");
  tabla.innerHTML = `
    <h3>Tabla de Posiciones</h3>
    <table>
      <tr><th>Equipo</th><th>Pts</th><th>PJ</th><th>PG</th><th>PE</th><th>PP</th><th>GF</th><th>GC</th><th>DIF</th></tr>
      ${posiciones.map(p => `
        <tr>
          <td>${p.nombre}</td>
          <td>${p.pts}</td>
          <td>${p.pj}</td>
          <td>${p.pg}</td>
          <td>${p.pe}</td>
          <td>${p.pp}</td>
          <td>${p.gf}</td>
          <td>${p.gc}</td>
          <td>${p.dif}</td>
        </tr>
      `).join("")}
    </table>
  `;
}

// Mostrar fixture (modo simple temporal)
function mostrarFixture() {
  const container = document.getElementById("fixture-container");
  container.innerHTML = `<h3>Fixture</h3><p>Fixture cargado correctamente (modo básico).</p>`;
}

// Mostrar goleadores
function mostrarGoleadores(goleadores) {
  const tabla = document.getElementById("tabla-goleadores");
  tabla.innerHTML = `
    <h3>Goleadores</h3>
    <table>
      <tr><th>Jugador</th><th>Equipo</th><th>Goles</th></tr>
      ${
        Object.values(goleadores).map(g => `
          <tr>
            <td>${g.nombre}</td>
            <td>${g.equipo}</td>
            <td>${g.goles}</td>
          </tr>
        `).join("")
      }
    </table>
  `;
}

// Mostrar equipos
function mostrarEquipos(equipos) {
  const container = document.getElementById("equipos-container");
  container.innerHTML = `
    <h3>Equipos</h3>
    <table>
      <tr><th>Escudo</th><th>Nombre</th>${isAdmin ? "<th>Editar</th>" : ""}</tr>
      ${
        equipos.map((eq, index) => `
          <tr>
            <td>${eq.escudo ? `<img src="${eq.escudo}" alt="escudo">` : ""}</td>
            <td>${eq.nombre}</td>
            ${
              isAdmin
                ? `<td><button onclick="editarEquipo(${index})">Editar</button></td>`
                : ""
            }
          </tr>
        `).join("")
      }
    </table>
  `;
}

function editarEquipo(index) {
  const equipos = cargarEquipos();
  const nuevoNombre = prompt("Nuevo nombre del equipo:", equipos[index].nombre);
  const nuevaImagen = prompt("URL del escudo:", equipos[index].escudo || "");

  if (nuevoNombre !== null) {
    equipos[index].nombre = nuevoNombre;
    equipos[index].escudo = nuevaImagen;
    guardarEquipos(equipos);
    mostrarEquipos(equipos);
  }
}
