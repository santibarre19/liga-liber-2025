// script.js

const PASSWORD = "Excursio2016";

// Estado inicial
let data = {
  equipos: [
    { nombre: "Primero", escudo: "" },
    { nombre: "Segundo Lenguas", escudo: "" },
    { nombre: "Segundo Sociales", escudo: "" },
    { nombre: "Cuarto", escudo: "" },
    { nombre: "Quinto Lenguas", escudo: "" },
    { nombre: "Quinto Sociales", escudo: "" }
  ],
  fixture: [],
  resultados: [],
  goleadores: {},
  jugadores: {},
};

// Guardar y cargar del localStorage
function guardarDatos() {
  localStorage.setItem("ligaLiber2025", JSON.stringify(data));
}

function cargarDatos() {
  const saved = localStorage.getItem("ligaLiber2025");
  if (saved) {
    data = JSON.parse(saved);
  }
}

// Verificar contraseña para acceder al modo administrador
function verificarPassword() {
  const input = prompt("Ingrese la contraseña para editar:");
  if (input === PASSWORD) {
    document.body.classList.add("admin");
  } else {
    alert("Contraseña incorrecta");
  }
}

// Renderizado de páginas
function mostrarSeccion(id) {
  document.querySelectorAll(".seccion").forEach(sec => sec.style.display = "none");
  document.getElementById(id).style.display = "block";
}

function actualizarEquipos() {
  const lista = document.getElementById("lista-equipos");
  lista.innerHTML = "";
  data.equipos.forEach((equipo, i) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <input value="${equipo.nombre}" onchange="editarEquipo(${i}, this.value)">
      <input type="file" onchange="cambiarEscudo(${i}, this)">
      <img src="${equipo.escudo}" alt="Escudo" width="30">
    `;
    lista.appendChild(div);
  });
}

function editarEquipo(i, nombre) {
  data.equipos[i].nombre = nombre;
  guardarDatos();
}

function cambiarEscudo(i, input) {
  const reader = new FileReader();
  reader.onload = () => {
    data.equipos[i].escudo = reader.result;
    guardarDatos();
    actualizarEquipos();
  };
  reader.readAsDataURL(input.files[0]);
}

// Fixture editable
function generarFixture() {
  // Implementación básica solo como placeholder
  data.fixture = [
    { fecha: "13/6", partidos: [ [0,1], [2,3], [4,5] ] },
    { fecha: "20/6", partidos: [ [0,2], [1,4], [3,5] ] },
    { fecha: "27/6", partidos: [ [0,3], [1,5], [2,4] ] },
    { fecha: "4/7",  partidos: [ [0,4], [1,3], [2,5] ] },
    { fecha: "11/7", partidos: [ [0,5], [1,2], [3,4] ] }
  ];
  guardarDatos();
  renderFixture();
}

function renderFixture() {
  const cont = document.getElementById("fixture");
  cont.innerHTML = "";
  data.fixture.forEach((fecha, i) => {
    const div = document.createElement("div");
    div.innerHTML = `<h4>Fecha ${i + 1} - ${fecha.fecha}</h4>`;
    fecha.partidos.forEach(([a,b], j) => {
      const res = data.resultados.find(r => r.fecha === i && r.partido === j);
      div.innerHTML += `
        <div>
          ${data.equipos[a].nombre} vs ${data.equipos[b].nombre} - 
          <span>${res ? res.golesA : "_"} - ${res ? res.golesB : "_"}</span>
          ${document.body.classList.contains("admin") ? 
            `<button onclick="editarResultado(${i},${j})">Editar</button>` : ""}
        </div>
      `;
    });
    cont.appendChild(div);
  });
}

function editarResultado(fecha, partido) {
  const [a, b] = data.fixture[fecha].partidos[partido];
  const golesA = parseInt(prompt(`Goles de ${data.equipos[a].nombre}`));
  const golesB = parseInt(prompt(`Goles de ${data.equipos[b].nombre}`));
  const golesJugadoresA = prompt("Goleadores del equipo A (separados por coma)").split(",");
  const golesJugadoresB = prompt("Goleadores del equipo B (separados por coma)").split(",");
  data.resultados = data.resultados.filter(r => !(r.fecha === fecha && r.partido === partido));
  data.resultados.push({ fecha, partido, a, b, golesA, golesB, golesJugadoresA, golesJugadoresB });

  // Actualizar tabla goleadores
  [...golesJugadoresA, ...golesJugadoresB].forEach(nombre => {
    const jugador = nombre.trim();
    if (jugador) {
      if (!data.goleadores[jugador]) data.goleadores[jugador] = 0;
      data.goleadores[jugador]++;
    }
  });
  guardarDatos();
  renderFixture();
  renderGoleadores();
}

function renderGoleadores() {
  const cont = document.getElementById("tabla-goleadores");
  cont.innerHTML = "";
  const lista = Object.entries(data.goleadores).sort((a,b) => b[1] - a[1]);
  lista.forEach(([nombre, goles]) => {
    const div = document.createElement("div");
    div.textContent = `${nombre}: ${goles} goles`;
    cont.appendChild(div);
  });
}

// Inicializar
cargarDatos();
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.hash === "#admin") verificarPassword();
  renderFixture();
  renderGoleadores();
  actualizarEquipos();
});
