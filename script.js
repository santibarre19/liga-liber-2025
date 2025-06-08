// Datos iniciales
let equipos = [
  { nombre: "Primero", escudo: "", puntos: 0, golesFavor: 0, golesContra: 0, partidosJugados: 0, goles: {} },
  { nombre: "Segundo Lenguas", escudo: "", puntos: 0, golesFavor: 0, golesContra: 0, partidosJugados: 0, goles: {} },
  { nombre: "Segundo Sociales", escudo: "", puntos: 0, golesFavor: 0, golesContra: 0, partidosJugados: 0, goles: {} },
  { nombre: "Cuarto", escudo: "", puntos: 0, golesFavor: 0, golesContra: 0, partidosJugados: 0, goles: {} },
  { nombre: "Deportivo Dioskiera", escudo: "", puntos: 0, golesFavor: 0, golesContra: 0, partidosJugados: 0, goles: {} },
  { nombre: "Villa Sapito", escudo: "", puntos: 0, golesFavor: 0, golesContra: 0, partidosJugados: 0, goles: {} }
];

let partidos = []; // Fixture con resultados

const fechas = ["13/6", "20/6", "27/6", "4/7", "11/7", "18/7", "1/8", "8/8"];
const passwordAdmin = "Excursio2016";
let adminLogged = false;

// Generar fixture aleatorio, con orden para Deportivo Dioskiera
function generarFixture() {
  partidos = [];
  // Equipos en orden Deportivo Dioskiera fijo: primero, segundo sociales, segundo lenguas, quinto sociales, cuarto
  // Como el torneo es todos contra todos (5 partidos cada uno y juegan una vez por fecha)
  let ordenEquipos = ["Primero", "Segundo Sociales", "Segundo Lenguas", "Villa Sapito", "Cuarto"];
  
  // Comenzamos con los partidos de la liga (fase todos contra todos)
  // Usamos equipos originales y el orden que mencionaste, pero manteniendo la lógica
  // Aquí un método sencillo para fixture con 6 equipos y fechas
  
  // Equipos indexados
  const equiposNombres = equipos.map(e => e.nombre);
  
  // Generamos todos contra todos (sin repetir partidos y sin que se enfrenten con ellos mismos)
  for (let i = 0; i < equipos.length - 1; i++) {
    for (let j = i + 1; j < equipos.length; j++) {
      partidos.push({
        local: equipos[i].nombre,
        visitante: equipos[j].nombre,
        golesLocal: null,
        golesVisitante: null,
        fecha: null,
        horario: null
      });
    }
  }
  
  // Asignar fechas y horarios, 3 partidos viernes 1-5, 2 partidos viernes 6-8
  // Total partidos: 15 (6 equipos todos contra todos = 15 partidos)
  
  // Partidos 0 a 14 en orden, los primeros 5 viernes 3 partidos, los últimos 3 viernes 2 partidos
  let partidosIndex = 0;
  for (let i = 0; i < fechas.length; i++) {
    let partidosEnFecha = i < 5 ? 3 : 2;
    for (let j = 0; j < partidosEnFecha; j++) {
      if (partidos[partidosIndex]) {
        partidos[partidosIndex].fecha = fechas[i];
        partidos[partidosIndex].horario = "Sin horario aún";
        partidosIndex++;
      }
    }
  }
}

// Función para mostrar posiciones
function mostrarPosiciones() {
  const div = document.getElementById("posiciones");
  let html = "<h2>Tabla de Posiciones</h2>";
  html += "<table><thead><tr><th>#</th><th>Equipo</th><th>PJ</th><th>PG</th><th>PE</th><th>PP</th><th>GF</th><th>GC</th><th>DG</th><th>Puntos</th></tr></thead><tbody>";
  
  // Ordenar equipos por puntos, diferencia de goles, goles a favor
  equipos.sort((a, b) => {
    if (b.puntos !== a.puntos) return b.puntos - a.puntos;
    let difA = a.golesFavor - a.golesContra;
    let difB = b.golesFavor - b.golesContra;
    if (difB !== difA) return difB - difA;
    return b.golesFavor - a.golesFavor;
  });
  
  equipos.forEach((e, i) => {
    let dg = e.golesFavor - e.golesContra;
    html += `<tr>
      <td>${i + 1}</td>
      <td>${e.nombre}</td>
      <td>${e.partidosJugados}</td>
      <td>${Math.floor(e.puntos / 3)}</td>
      <td>${e.puntos % 3}</td>
      <td>0</td>
      <td>${e.golesFavor}</td>
      <td>${e.golesContra}</td>
      <td>${dg}</td>
      <td>${e.puntos}</td>
    </tr>`;
  });
  
  html += "</tbody></table>";
  div.innerHTML = html;
}

// Mostrar fixture y resultados
function mostrarFixture() {
  const div = document.getElementById("fixture");
  let html = "<h2>Fixture</h2>";
  
  // Agrupar partidos por fecha
  const partidosPorFecha = {};
  partidos.forEach(p => {
    if (!partidosPorFecha[p.fecha]) partidosPorFecha[p.fecha] = [];
    partidosPorFecha[p.fecha].push(p);
  });
  
  for (const fecha in partidosPorFecha) {
    html += `<h3>Fecha: ${fecha}</h3><table><thead><tr><th>Local</th><th>Goles</th><th>Visitante</th><th>Horario</th></tr></thead><tbody>`;
    partidosPorFecha[fecha].forEach(p => {
      const golesLocal = p.golesLocal !== null ? p.golesLocal : "-";
      const golesVisitante = p.golesVisitante !== null ? p.golesVisitante : "-";
      html += `<tr><td>${p.local}</td><td>${golesLocal} - ${golesVisitante}</td><td>${p.visitante}</td><td>${p.horario}</td></tr>`;
    });
    html += "</tbody></table>";
  }
  div.innerHTML = html;
}

// Mostrar goleadores (a implementar con los datos de goles)
function mostrarGoleadores() {
  const div = document.getElementById("goleadores");
  let html = "<h2>Tabla de Goleadores</h2>";
  // Como aún no hay datos de goleadores, mostramos mensaje
  html += "<p>Esta función estará disponible cuando se registren goles y goleadores.</p>";
  div.innerHTML = html;
}

// Función para mostrar sección administración con login
function mostrarAdministracion() {
  const div = document.getElementById("administracion");
  if (!adminLogged) {
    div.innerHTML = `
      <h2>Administración - Iniciar sesión</h2>
      <label>Contraseña: <input type="password" id="passwordAdmin"></label>
      <button onclick="loginAdmin()">Entrar</button>
      <p id="mensajeLogin" class="error"></p>
    `;
  } else {
    mostrarIngresoResultados();
  }
}

function loginAdmin() {
  const pass = document.getElementById("passwordAdmin").value;
  if (pass === passwordAdmin) {
    adminLogged = true;
    mostrarIngresoResultados();
  } else {
    document.getElementById("mensajeLogin").innerText = "Contraseña incorrecta.";
  }
}

function mostrarIngresoResultados() {
  const div = document.getElementById("administracion");
  let html = "<h2>Ingresar Resultados</h2>";
  partidos.forEach((p, i) => {
    html += `<div style="margin-bottom: 1em;">
      <strong>${p.local}</strong> vs <strong>${p.visitante}</strong> (Fecha: ${p.fecha})<br>
      <label>Goles ${p.local}: <input type="number" min="0" id="golesLocal-${i}" value="${p.golesLocal !== null ? p.golesLocal : ''}"></label><br>
      <label>Goles ${p.visitante}: <input type="number" min="0" id="golesVisitante-${i}" value="${p.golesVisitante !== null ? p.golesVisitante : ''}"></label>
    </div>`;
  });
  html += `<button class="save-resultados" onclick="guardarResultados()">Guardar Resultados</button>`;
  div.innerHTML = html;
}

function guardarResultados() {
  let valid = true;
  partidos.forEach((p, i) => {
    const gl = document.getElementById(`golesLocal-${i}`).value;
    const gv = document.getElementById(`golesVisitante-${i}`).value;
    if (gl === "" || gv === "" || isNaN(gl) || isNaN(gv) || gl < 0 || gv < 0) {
      valid = false;
    }
  });
  if (!valid) {
    alert("Por favor, ingresa todos los resultados correctamente.");
    return;
  }

  partidos.forEach((p, i) => {
    p.golesLocal = parseInt(document.getElementById(`golesLocal-${i}`).value);
    p.golesVisitante = parseInt(document.getElementById(`golesVisitante-${i}`).value);
  });

  calcularPosiciones();
  mostrarPosiciones();
  mostrarFixture();
  mostrarGoleadores();
  alert("Resultados guardados correctamente.");
}

function calcularPosiciones() {
  // Resetear estadísticas de equipos
  equipos.forEach(e => {
    e.puntos = 0;
    e.golesFavor = 0;
    e.golesContra = 0;
    e.partidosJugados = 0;
  });

  partidos.forEach(p => {
    if (p.golesLocal === null || p.golesVisitante === null) return;
    let local = equipos.find(e => e.nombre === p.local);
    let visitante = equipos.find(e => e.nombre === p.visitante);
    local.partidosJugados++;
    visitante.partidosJugados++;

    local.golesFavor += p.golesLocal;
    local.golesContra += p.golesVisitante;

    visitante.golesFavor += p.golesVisitante;
    visitante.golesContra += p.golesLocal;

    if (p.golesLocal > p.golesVisitante) {
      local.puntos += 3;
    } else if (p.golesLocal < p.golesVisitante) {
      visitante.puntos += 3;
    } else {
      local.puntos += 1;
      visitante.puntos += 1;
    }
  });
}

// Inicialización
generarFixture();
calcularPosiciones();
mostrarPosiciones();
mostrarFixture();
mostrarGoleadores();
mostrarAdministracion();
