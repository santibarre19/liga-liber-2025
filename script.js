 script.js

// ================= CONFIGURACIÓN INICIAL =================
const password = "Excursio2016";
let isAdmin = false;

const equipos = [
  { nombre: "Primero", escudo: "" },
  { nombre: "Segundo Lenguas", escudo: "" },
  { nombre: "Segundo Sociales", escudo: "" },
  { nombre: "Cuarto", escudo: "" },
  { nombre: "Quinto Lenguas", escudo: "" },
  { nombre: "Quinto Sociales", escudo: "" }
];

const fechas = [
  "13/6", "20/6", "27/6", "4/7", "11/7", "18/7", "1/8", "8/8"
];

let fixture = [];
let resultados = {};
let goleadores = {};
let jugadoresPorEquipo = {};

// ================= UTILIDADES =================
function guardarDatos() {
  localStorage.setItem("fixture", JSON.stringify(fixture));
  localStorage.setItem("resultados", JSON.stringify(resultados));
  localStorage.setItem("goleadores", JSON.stringify(goleadores));
  localStorage.setItem("jugadores", JSON.stringify(jugadoresPorEquipo));
}

function cargarDatos() {
  fixture = JSON.parse(localStorage.getItem("fixture")) || [];
  resultados = JSON.parse(localStorage.getItem("resultados")) || {};
  goleadores = JSON.parse(localStorage.getItem("goleadores")) || {};
  jugadoresPorEquipo = JSON.parse(localStorage.getItem("jugadores")) || {};
}

function verificarAdmin() {
  const input = prompt("Ingresá la contraseña de administrador:");
  if (input === password) {
    isAdmin = true;
    document.body.classList.add("admin");
    mostrarSeccionesAdmin();
  } else {
    alert("Contraseña incorrecta");
  }
}

function mostrarSeccionesAdmin() {
  document.querySelectorAll(".admin-only").forEach(e => e.style.display = "block");
}

// ================= RENDERIZADO =================
function renderizarEquipos() {
  const contenedor = document.getElementById("equipos");
  contenedor.innerHTML = "";
  equipos.forEach((e, idx) => {
    contenedor.innerHTML += `<div>
      <input type="text" value="${e.nombre}" onchange="cambiarNombreEquipo(${idx}, this.value)" ${!isAdmin ? 'disabled' : ''}/>
      <input type="file" accept="image/*" onchange="cambiarEscudo(${idx}, this)" ${!isAdmin ? 'disabled' : ''}/>
    </div>`;
  });
}

function cambiarNombreEquipo(idx, nuevoNombre) {
  equipos[idx].nombre = nuevoNombre;
  guardarDatos();
}

function cambiarEscudo(idx, input) {
  const reader = new FileReader();
  reader.onload = function (e) {
    equipos[idx].escudo = e.target.result;
    guardarDatos();
  };
  reader.readAsDataURL(input.files[0]);
}

function renderizarFixture() {
  const contenedor = document.getElementById("fixture");
  contenedor.innerHTML = "";
  fixture.forEach((fecha, idx) => {
    contenedor.innerHTML += `<h3>Fecha ${idx + 1} - ${fechas[idx]}</h3>`;
    fecha.forEach((partido, i) => {
      const id = `f${idx}-p${i}`;
      const r = resultados[id] || { g1: "", g2: "", goleadores1: "", goleadores2: "" };
      contenedor.innerHTML += `<div>
        ${equipos[partido.e1].nombre} <input type="number" value="${r.g1}" onchange="editarResultado('${id}', 'g1', this.value)">
        vs
        <input type="number" value="${r.g2}" onchange="editarResultado('${id}', 'g2', this.value)"> ${equipos[partido.e2].nombre}
        <br>Goleadores ${equipos[partido.e1].nombre}: <input type="text" value="${r.goleadores1}" onchange="editarResultado('${id}', 'goleadores1', this.value)">
        <br>Goleadores ${equipos[partido.e2].nombre}: <input type="text" value="${r.goleadores2}" onchange="editarResultado('${id}', 'goleadores2', this.value)">
      </div>`;
    });
  });
}

function editarResultado(id, campo, valor) {
  if (!resultados[id]) resultados[id] = {};
  resultados[id][campo] = valor;
  guardarDatos();
  renderizarTablaPosiciones();
  renderizarGoleadores();
}

function renderizarTablaPosiciones() {
  const tabla = document.getElementById("posiciones");
  let pts = equipos.map((e, idx) => ({ idx, nombre: e.nombre, pts: 0 }));

  Object.keys(resultados).forEach(id => {
    const [fecha, partido] = id.split("-");
    const f = parseInt(fecha[1]);
    const p = parseInt(partido[1]);
    const juego = fixture[f][p];
    const r = resultados[id];
    const g1 = parseInt(r.g1);
    const g2 = parseInt(r.g2);
    if (!isNaN(g1) && !isNaN(g2)) {
      if (g1 > g2) {
        pts[juego.e1].pts += 3;
      } else if (g1 < g2) {
        pts[juego.e2].pts += 3;
      } else {
        pts[juego.e1].pts += 1;
        pts[juego.e2].pts += 1;
      }
    }
  });

  pts.sort((a, b) => b.pts - a.pts);
  tabla.innerHTML = "<tr><th>Equipo</th><th>Puntos</th></tr>";
  pts.forEach(e => {
    tabla.innerHTML += `<tr><td>${e.nombre}</td><td>${e.pts}</td></tr>`;
  });
}

function renderizarGoleadores() {
  const contenedor = document.getElementById("goleadores");
  const cont = {};
  Object.values(resultados).forEach(r => {
    [r.goleadores1, r.goleadores2].forEach(lista => {
      if (!lista) return;
      lista.split(",").map(n => n.trim()).forEach(n => {
        if (!n) return;
        if (!cont[n]) cont[n] = 0;
        cont[n]++;
      });
    });
  });
  const ordenado = Object.entries(cont).sort((a, b) => b[1] - a[1]);
  contenedor.innerHTML = "<tr><th>Jugador</th><th>Goles</th></tr>";
  ordenado.forEach(([nombre, goles]) => {
    contenedor.innerHTML += `<tr><td>${nombre}</td><td>${goles}</td></tr>`;
  });
}

// ================= INICIALIZAR =================
window.onload = () => {
  cargarDatos();
  verificarAdmin();
  renderizarEquipos();
  renderizarFixture();
  renderizarTablaPosiciones();
  renderizarGoleadores();
};
