// Datos iniciales

const equipos = [
  { id: 1, nombre: "Primero", escudo: "", puntos: 0, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0, goleadores: {} },
  { id: 2, nombre: "Segundo Lenguas", escudo: "", puntos: 0, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0, goleadores: {} },
  { id: 3, nombre: "Segundo Sociales", escudo: "", puntos: 0, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0, goleadores: {} },
  { id: 4, nombre: "Cuarto", escudo: "", puntos: 0, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0, goleadores: {} },
  { id: 5, nombre: "Quinto Lenguas", escudo: "", puntos: 0, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0, goleadores: {} },
  { id: 6, nombre: "Quinto Sociales", escudo: "", puntos: 0, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0, goleadores: {} },
];

let partidos = []; // acá va el fixture generado

const fechasPartidos = [
  "13/6",
  "20/6",
  "27/6",
  "4/7",
  "11/7",
  "18/7",
  "1/8",
  "8/8",
];

// Función para crear fixture aleatorio con la condición especial para Quinto Lenguas
function generarFixture() {
  // Equipos excepto Quinto Lenguas (id 5)
  const otrosEquipos = equipos.filter(e => e.id !== 5);
  
  // Orden fijo para Quinto Lenguas
  const ordenQuintoLenguas = [1, 3, 2, 6, 4]; // Primero; Segundo Sociales; Segundo Lenguas; Quinto Sociales; Cuarto
  
  // Generar partidos todos contra todos 1 vuelta (5 partidos cada equipo)
  // Para Quinto Lenguas (id 5) respetar el orden dado
  // Para los demás equipos el orden será aleatorio
  
  partidos = [];
  
  // Primero, armar partidos de Quinto Lenguas vs orden fijo
  ordenQuintoLenguas.forEach((rivalId, index) => {
    partidos.push({
      fecha: fechasPartidos[index],
      local: 5,
      visitante: rivalId,
      golesLocal: null,
      golesVisitante: null,
      goleadoresLocal: [],
      goleadoresVisitante: []
    });
  });
  
  // Ahora armar partidos entre los otros equipos (excepto el 5)
  // Generar todos contra todos sin repetir
  
  const pares = [];
  for (let i = 0; i < otrosEquipos.length; i++) {
    for (let j = i + 1; j < otrosEquipos.length; j++) {
      pares.push([otrosEquipos[i].id, otrosEquipos[j].id]);
    }
  }
  
  // Vamos a asignar estas parejas a fechas disponibles (las que quedan)
  // Fechas usadas por Quinto Lenguas: indices 0 a 4 (5 fechas)
  // Quedan fechas índices 5 a 7 (3 fechas)
  
  let fechaIndex = 5;
  pares.forEach((par, i) => {
    const partido = {
      fecha: fechasPartidos[fechaIndex],
      local: par[0],
      visitante: par[1],
      golesLocal: null,
      golesVisitante: null,
      goleadoresLocal: [],
      goleadoresVisitante: []
    };
    partidos.push(partido);
    
    // Cambiar fechaIndex cíclicamente para repartir partidos en esas fechas
    fechaIndex++;
    if (fechaIndex > 7) fechaIndex = 5;
  });
}

// Ejecutar generación inicial
generarFixture();

// Función para mostrar fixture en el HTML
function mostrarFixture() {
  const fixtureSection = document.getElementById("fixture");
  fixtureSection.innerHTML = "";
  
  const tabla = document.createElement("table");
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  
  ["Fecha", "Local", "Goles Local", "Goles Visitante", "Visitante", "Goleadores Local", "Goleadores Visitante"].forEach(text => {
    const th = document.createElement("th");
    th.textContent = text;
    headerRow.appendChild(th);
  });
  
  thead.appendChild(headerRow);
  tabla.appendChild(thead);
  
  const tbody = document.createElement("tbody");
  
  partidos.forEach((p, i) => {
    const tr = document.createElement("tr");
    
    const equipoLocal = equipos.find(e => e.id === p.local);
    const equipoVisitante = equipos.find(e => e.id === p.visitante);
    
    tr.innerHTML = `
      <td>${p.fecha}</td>
      <td>${equipoLocal.nombre}</td>
      <td>${p.golesLocal !== null ? p.golesLocal : "-"}</td>
      <td>${p.golesVisitante !== null ? p.golesVisitante : "-"}</td>
      <td>${equipoVisitante.nombre}</td>
      <td>${p.goleadoresLocal.length > 0 ? p.goleadoresLocal.join(", ") : "-"}</td>
      <td>${p.goleadoresVisitante.length > 0 ? p.goleadoresVisitante.join(", ") : "-"}</td>
    `;
    
    tbody.appendChild(tr);
  });
  
  tabla.appendChild(tbody);
  fixtureSection.appendChild(tabla);
}

// Mostrar fixture cuando se cargue la página
window.onload = () => {
  mostrarFixture();
  mostrarSeccion("posiciones"); // Mostrar posiciones por defecto
};

// Función para manejar cambio de secciones
function mostrarSeccion(nombre) {
  document.querySelectorAll(".seccion").forEach(sec => {
    sec.classList.remove("visible");
  });
  document.getElementById(nombre).classList.add("visible");
}

// Botones de navegación
document.getElementById("btn-posiciones").addEventListener("click", () => mostrarSeccion("posiciones"));
document.getElementById("btn-fixture").addEventListener("click", () => {
  mostrarSeccion("fixture");
  mostrarFixture();
});
document.getElementById("btn-goleadores").addEventListener("click", () => mostrarSeccion("goleadores"));
document.getElementById("btn-reglas").addEventListener("click", () => mostrarSeccion("reglas"));
document.getElementById("btn-jugadores").addEventListener("click", () => mostrarSeccion("jugadores"));
document.getElementById("btn-estadisticas").addEventListener("click", () => mostrarSeccion("estadisticas"));
document.getElementById("btn-noticias").addEventListener("click", () => mostrarSeccion("noticias"));
document.getElementById("btn-admin").addEventListener("click", () => mostrarSeccion("administracion"));

// Función para calcular y mostrar tabla de posiciones (simple por ahora)
function calcularPosiciones() {
  // Reiniciar stats
  equipos.forEach(e => {
    e.puntos = 0;
    e.pj = 0;
    e.pg = 0;
    e.pe = 0;
    e.pp = 0;
    e.gf = 0;
    e.gc = 0;
    e.dg = 0;
  });
  
  partidos.forEach(p => {
    if (p.golesLocal === null || p.golesVisitante === null) return;
    
    const local = equipos.find(e => e.id === p.local);
    const visitante = equipos.find(e => e.id === p.visitante);
    
    local.pj++;
    visitante.pj++;
    
    local.gf += p.golesLocal;
    local.gc += p.golesVisitante;
    visitante.gf += p.golesVisitante;
    visitante.gc += p.golesLocal;
    
    if (p.golesLocal > p.golesVisitante) {
      local.pg++;
      local.puntos += 3;
      visitante.pp++;
    } else if (p.golesLocal < p.golesVisitante) {
      visitante.pg++;
      visitante.puntos += 3;
      local.pp++;
    } else {
      local.pe++;
      local.puntos += 1;
      visitante.pe++;
      visitante.puntos += 1;
    }
    
    local.dg = local.gf - local.gc;
    visitante.dg = visitante.gf - visitante.gc;
  });
  
  // Ordenar equipos por puntos, luego diferencia de gol, luego goles a favor
  equipos.sort((a,b) => {
    if (b.puntos !== a.puntos) return b.puntos - a.puntos;
    if (b.dg !== a.dg) return b.dg - a.dg;
    return b.gf - a.gf;
  });
  
  // Mostrar tabla en HTML
  const posSection = document.getElementById("posiciones");
  posSection.innerHTML = "<h2>Tabla de Posiciones</h2>";
  
  const tabla = document.createElement("table");
  const thead = document.createElement("thead");
  const trHead = document.createElement("tr");
  ["Pos", "Equipo", "PJ", "PG", "PE", "PP", "GF", "GC", "DG", "Pts"].forEach(text => {
    const th = document.createElement("th");
    th.textContent = text;
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);
  tabla.appendChild(thead);
  
  const tbody = document.createElement("tbody");
  equipos.forEach((e,i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i+1}</td>
      <td>${e.nombre}</td>
      <td>${e.pj}</td>
      <td>${e.pg}</td>
      <td>${e.pe}</td>
      <td>${e.pp}</td>
      <td>${e.gf}</td>
      <td>${e.gc}</td>
      <td>${e.dg}</td>
      <td>${e.puntos}</td>
    `;
    tbody.appendChild(tr);
  });
  
  tabla.appendChild(tbody);
  posSection.appendChild(tabla);
}

// Mostrar posiciones cuando se cambie a esa sección
document.getElementById("btn-posiciones").addEventListener("click", calcularPosiciones);
// Variable para controlar si estás logueado para editar
let logueado = false;

// Función para mostrar el formulario de login (contraseña)
function mostrarLogin() {
  const adminDiv = document.getElementById("administracion");
  adminDiv.innerHTML = `
    <h2>Administración - Iniciar Sesión</h2>
    <input type="password" id="passAdmin" placeholder="Contraseña">
    <button id="btnLogin">Entrar</button>
    <p id="mensajeLogin" style="color:red;"></p>
  `;

  document.getElementById("btnLogin").addEventListener("click", () => {
    const pass = document.getElementById("passAdmin").value;
    if (pass === "Excursio2016") {
      logueado = true;
      mostrarAdmin();
    } else {
      document.getElementById("mensajeLogin").textContent = "Contraseña incorrecta";
    }
  });
}

// Función para mostrar el panel de edición de resultados y goleadores
function mostrarAdmin() {
  if (!logueado) {
    mostrarLogin();
    return;
  }
  
  const adminDiv = document.getElementById("administracion");
  adminDiv.innerHTML = "<h2>Administración - Editar Resultados</h2>";

  partidos.forEach((p, i) => {
    const equipoLocal = equipos.find(e => e.id === p.local);
    const equipoVisitante = equipos.find(e => e.id === p.visitante);

    const partidoDiv = document.createElement("div");
    partidoDiv.style.border = "1px solid #ccc";
    partidoDiv.style.marginBottom = "10px";
    partidoDiv.style.padding = "10px";

    partidoDiv.innerHTML = `
      <strong>Fecha ${p.fecha}:</strong> ${equipoLocal.nombre} vs ${equipoVisitante.nombre} <br>
      Goles ${equipoLocal.nombre}: <input type="number" min="0" id="golesLocal${i}" value="${p.golesLocal !== null ? p.golesLocal : ''}" style="width:50px;">
      Goles ${equipoVisitante.nombre}: <input type="number" min="0" id="golesVisitante${i}" value="${p.golesVisitante !== null ? p.golesVisitante : ''}" style="width:50px;"><br><br>
      
      Goleadores ${equipoLocal.nombre} (separar con coma): <input type="text" id="goleadoresLocal${i}" value="${p.goleadoresLocal.join(", ")}" style="width: 300px;"><br>
      Goleadores ${equipoVisitante.nombre} (separar con coma): <input type="text" id="goleadoresVisitante${i}" value="${p.goleadoresVisitante.join(", ")}" style="width: 300px;"><br>
    `;

    adminDiv.appendChild(partidoDiv);
  });

  const guardarBtn = document.createElement("button");
  guardarBtn.textContent = "Guardar Cambios";
  guardarBtn.addEventListener("click", () => {
    for (let i = 0; i < partidos.length; i++) {
      const golesL = document.getElementById(`golesLocal${i}`).value;
      const golesV = document.getElementById(`golesVisitante${i}`).value;
      const goleadoresL = document.getElementById(`goleadoresLocal${i}`).value;
      const goleadoresV = document.getElementById(`goleadoresVisitante${i}`).value;

      partidos[i].golesLocal = golesL === "" ? null : parseInt(golesL);
      partidos[i].golesVisitante = golesV === "" ? null : parseInt(golesV);
      partidos[i].goleadoresLocal = goleadoresL === "" ? [] : goleadoresL.split(",").map(g => g.trim()).filter(g => g !== "");
      partidos[i].goleadoresVisitante = goleadoresV === "" ? [] : goleadoresV.split(",").map(g => g.trim()).filter(g => g !== "");
    }

    // Actualizar tablas automáticamente
    calcularPosiciones();
    mostrarFixture();
    mostrarGoleadores();
    alert("Cambios guardados.");
  });

  adminDiv.appendChild(guardarBtn);
}

// Función para mostrar tabla de goleadores sumando todos los partidos
function mostrarGoleadores() {
  const goleSection = document.getElementById("goleadores");
  goleSection.innerHTML = "<h2>Tabla de Goleadores</h2>";

  // Objeto para acumular goleadores {nombre: goles}
  const goleadoresTotales = {};

  partidos.forEach(p => {
    p.goleadoresLocal.forEach(g => {
      goleadoresTotales[g] = (goleadoresTotales[g] || 0) + 1;
    });
    p.goleadoresVisitante.forEach(g => {
      goleadoresTotales[g] = (goleadoresTotales[g] || 0) + 1;
    });
  });

  // Pasar a array y ordenar
  const listaGoleadores = Object.entries(goleadoresTotales).sort((a,b) => b[1] - a[1]);

  if (listaGoleadores.length === 0) {
    goleSection.innerHTML += "<p>No hay goles registrados aún.</p>";
    return;
  }

  const tabla = document.createElement("table");
  const thead = document.createElement("thead");
  const trHead = document.createElement("tr");
  ["Pos", "Jugador", "Goles"].forEach(text => {
    const th = document.createElement("th");
    th.textContent = text;
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);
  tabla.appendChild(thead);

  const tbody = document.createElement("tbody");
  listaGoleadores.forEach(([nombre, goles], i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${i+1}</td><td>${nombre}</td><td>${goles}</td>`;
    tbody.appendChild(tr);
  });

  tabla.appendChild(tbody);
  goleSection.appendChild(tabla);
}

// Mostrar login o panel admin al entrar en esa sección
document.getElementById("btn-admin").addEventListener("click", mostrarLogin);
