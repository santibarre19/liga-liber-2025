// Equipos iniciales (puedes editar nombres y agregar escudos después)
let equipos = [
  { id: 1, nombre: "Primero", escudo: "" },
  { id: 2, nombre: "Segundo Lenguas", escudo: "" },
  { id: 3, nombre: "Segundo Sociales", escudo: "" },
  { id: 4, nombre: "Cuarto", escudo: "" },
  { id: 5, nombre: "Quinto Lenguas", escudo: "" },
  { id: 6, nombre: "Quinto Sociales", escudo: "" },
];

// Fechas de los partidos
const fechasPartidos = ["13/6", "20/6", "27/6", "4/7", "11/7", "18/7", "1/8", "8/8"];

// Partidos (se generarán automáticamente)
let partidos = [];

// Genera fixture aleatorio, pero mantiene el orden fijo para "Quinto Lenguas"
function generarFixture() {
  // Equipos excepto Quinto Lenguas
  const otrosEquipos = equipos.filter(e => e.nombre !== "Quinto Lenguas");

  // Equipos ordenados con Quinto Lenguas fijo (posiciones para sus partidos)
  // El orden de partidos para Quinto Lenguas es:
  // Primero, Segundo Sociales, Segundo Lenguas, Quinto Sociales, Cuarto (en ese orden)
  // Vamos a fijar ese orden en partidos donde esté Quinto Lenguas de local o visitante.

  // Crear una lista con todos los partidos posibles (todos contra todos)
  let partidosPosibles = [];
  for(let i = 0; i < equipos.length; i++) {
    for(let j = i+1; j < equipos.length; j++) {
      partidosPosibles.push([equipos[i].id, equipos[j].id]);
    }
  }

  // Para mezclar, vamos a asignar partidos a fechas
  // Hay 15 partidos (6 equipos, todos contra todos -> n*(n-1)/2)
  // Se juegan 5 fechas con 3 partidos y 3 fechas con 2 partidos (total 24 slots),
  // pero sólo 15 partidos, así que algunos viernes quedan menos partidos

  // La distribución que dijiste es 3 partidos los primeros 5 viernes (5x3=15)
  // y 2 partidos los últimos 3 viernes (3x2=6). Pero hay sólo 15 partidos, así que 
  // solo se necesitan 5 viernes con 3 partidos, y 3 últimos viernes sin partidos.

  // Entonces usaremos sólo los primeros 5 viernes con 3 partidos cada uno.

  // Vamos a ordenar los partidos para que Quinto Lenguas juegue con el orden que dijiste:
  // primero vs Primero, luego vs Segundo Sociales, etc.

  // Construimos la lista ordenada con los partidos de Quinto Lenguas primero en ese orden
  let ordenQuintoLenguas = [];
  let quintoLenguasId = equipos.find(e => e.nombre === "Quinto Lenguas").id;
  let ordenEquipos = ["Primero", "Segundo Sociales", "Segundo Lenguas", "Quinto Sociales", "Cuarto"].map(nombre => equipos.find(e => e.nombre === nombre).id);

  ordenEquipos.forEach(otroId => {
    // Partido Quinto Lenguas vs otroId (en ese orden de local o visitante)
    // Para mantener alternancia, Quinto Lenguas será local en partidos 1,3,5 y visitante en 2,4
    let index = ordenEquipos.indexOf(otroId);
    if(index % 2 === 0) {
      ordenQuintoLenguas.push([quintoLenguasId, otroId]); // Quinto Lenguas local
    } else {
      ordenQuintoLenguas.push([otroId, quintoLenguasId]); // Quinto Lenguas visitante
    }
  });

  // El resto de partidos son los demás que no incluyen a Quinto Lenguas
  let restoPartidos = partidosPosibles.filter(p => !p.includes(quintoLenguasId));

  // Barajamos el resto de partidos
  restoPartidos.sort(() => Math.random() - 0.5);

  // Armamos la lista final de partidos con los del Quinto Lenguas al principio
  let listaFinalPartidos = [...ordenQuintoLenguas, ...restoPartidos];

  // Asignamos fechas a partidos (3 partidos por cada uno de los primeros 5 viernes)
  partidos = [];
  let fechaIndex = 0;
  for(let i = 0; i < listaFinalPartidos.length; i += 3) {
    let partidosFecha = listaFinalPartidos.slice(i, i + 3);
    partidosFecha.forEach(p => {
      if (fechaIndex < fechasPartidos.length) {
        partidos.push({
          local: p[0],
          visitante: p[1],
          fecha: fechasPartidos[fechaIndex],
          golesLocal: null,
          golesVisitante: null,
          goleadoresLocal: [],
          goleadoresVisitante: []
        });
      }
    });
    fechaIndex++;
  }
}

// Calcula la tabla de posiciones con base en resultados
function calcularPosiciones() {
  let tabla = equipos.map(e => ({
    id: e.id,
    nombre: e.nombre,
    puntos: 0,
    pj: 0,
    pg: 0,
    pe: 0,
    pp: 0,
    gf: 0,
    gc: 0,
    dif: 0
  }));

  partidos.forEach(p => {
    if (p.golesLocal !== null && p.golesVisitante !== null) {
      let local = tabla.find(t => t.id === p.local);
      let visitante = tabla.find(t => t.id === p.visitante);
      local.pj++;
      visitante.pj++;
      local.gf += p.golesLocal;
      local.gc += p.golesVisitante;
      visitante.gf += p.golesVisitante;
      visitante.gc += p.golesLocal;
      if (p.golesLocal > p.golesVisitante) {
        local.pg++;
        visitante.pp++;
        local.puntos += 3;
      } else if (p.golesLocal < p.golesVisitante) {
        visitante.pg++;
        local.pp++;
        visitante.puntos += 3;
      } else {
        local.pe++;
        visitante.pe++;
        local.puntos += 1;
        visitante.puntos += 1;
      }
    }
  });

  tabla.forEach(t => {
    t.dif = t.gf - t.gc;
  });

  // Ordenar por puntos, diferencia, goles a favor
  tabla.sort((a, b) => {
    if (b.puntos !== a.puntos) return b.puntos - a.puntos;
    if (b.dif !== a.dif) return b.dif - a.dif;
    return b.gf - a.gf;
  });

  posiciones = tabla;
}

// Variables para tabla de posiciones
let posiciones = [];

// Mostrar tabla de posiciones en la página
function mostrarPosiciones() {
  const div = document.getElementById("posiciones");
  div.innerHTML = "<h2>Tabla de Posiciones</h2>";

  if (posiciones.length === 0) {
    div.innerHTML += "<p>No hay datos para mostrar.</p>";
    return;
  }

  let html = `<table>
    <thead>
      <tr>
        <th>#</th>
        <th>Equipo</th>
        <th>PJ</th>
        <th>PG</th>
        <th>PE</th>
        <th>PP</th>
        <th>GF</th>
        <th>GC</th>
        <th>DIF</th>
        <th>Ptos</th>
      </tr>
    </thead><tbody>`;

  posiciones.forEach((pos, i) => {
    html += `<tr>
      <td>${i + 1}</td>
      <td>${pos.nombre}</td>
      <td>${pos.pj}</td>
      <td>${pos.pg}</td>
      <td>${pos.pe}</td>
      <td>${pos.pp}</td>
      <td>${pos.gf}</td>
      <td>${pos.gc}</td>
      <td>${pos.dif}</td>
      <td>${pos.puntos}</td>
    </tr>`;
  });

  html += "</tbody></table>";
  div.innerHTML += html;
}

// Mostrar fixture con resultados
function mostrarFixture() {
  const div = document.getElementById("fixture");
  div.innerHTML = "<h2>Fixture</h2>";

  if (partidos.length === 0) {
    div.innerHTML += "<p>No hay partidos programados.</p>";
    return;
  }

  let html = `<table>
    <thead><tr><th>Fecha</th><th>Local</th><th>Visitante</th><th>Resultado</th></tr></thead><tbody>`;

  partidos.forEach(p => {
    const local = equipos.find(e => e.id === p.local);
    const visitante = equipos.find(e => e.id === p.visitante);
    const resultado = (p.golesLocal === null || p.golesVisitante === null) ? "-" : `${p.golesLocal} - ${p.golesVisitante}`;
    html += `<tr>
      <td>${p.fecha}</td>
      <td>${local.nombre}</td>
      <td>${visitante.nombre}</td>
      <td>${resultado}</td>
    </tr>`;
  });

  html += "</tbody></table>";
  div.innerHTML += html;
}

// Mostrar tabla de goleadores (vacía por ahora)
function mostrarGoleadores() {
  const div = document.getElementById("goleadores");
  div.innerHTML = "<h2>Tabla de Goleadores</h2>";

  let goleadoresTotales = {};

  partidos.forEach(p => {
    p.goleadoresLocal.forEach(g => {
      goleadoresTotales[g] = (goleadoresTotales[g] || 0) + 1;
    });
    p.goleadoresVisitante.forEach(g => {
      goleadoresTotales[g] = (goleadoresTotales[g] || 0) + 1;
    });
  });

  let arr = Object.entries(goleadoresTotales);
  arr.sort((a,b) => b[1] - a[1]);

  if(arr.length === 0){
    div.innerHTML += "<p>No hay goles registrados.</p>";
    return;
  }

  let html = `<table>
    <thead><tr><th>Jugador</th><th>Goles</th></tr></thead><tbody>`;
  arr.forEach(([jugador, goles]) => {
    html += `<tr><td>${jugador}</td><td>${goles}</td></tr>`;
  });
  html += "</tbody></table>";
  div.innerHTML += html;
}

// ADMINISTRACION

const passAdmin = "Excursio2016";
let adminLogged = false;

function mostrarAdministracion() {
  const div = document.getElementById("administracion");
  if (!adminLogged) {
    div.innerHTML = `
      <h2>Ingreso de Administrador</h2>
      <input type="password" id="pass" placeholder="Contraseña" />
      <button onclick="login()">Entrar</button>
      <p id="error" class="error"></p>
    `;
  } else {
    div.innerHTML = `
      <h2>Administración de Resultados</h2>
      <p>Ingresá los resultados de los partidos para actualizar la tabla.</p>
      <div id="form-partidos"></div>
      <button onclick="logout()">Cerrar sesión</button>
    `;
    mostrarFormularioPartidos();
  }
}

function login() {
  const pass = document.getElementById("pass").value;
  if (pass === passAdmin) {
    adminLogged = true;
    mostrarAdministracion();
  } else {
    document.getElementById("error").innerText = "Contraseña incorrecta";
  }
}

function logout() {
  adminLogged = false;
  mostrarAdministracion();
}

function mostrarFormularioPartidos() {
  const div = document.getElementById("form-partidos");
  let html = "";
  partidos.forEach((p, i) => {
    const local = equipos.find(e => e.id === p.local);
    const visitante = equipos.find(e => e.id === p.visitante);
    html += `<div style="margin-bottom:10px;">
      <b>${p.fecha} - ${local.nombre} vs ${visitante.nombre}</b><br />
      <label>Goles ${local.nombre}: <input type="number" min="0" id="golesLocal-${i}" value="${p.golesLocal !== null ? p.golesLocal : ''}"></label>
      <label>Goles ${visitante.nombre}: <input type="number" min="0" id="golesVisitante-${i}" value="${p.golesVisitante !== null ? p.golesVisitante : ''}"></label>
    </div>`;
  });
  html += `<button onclick="guardarResultados()">Guardar Resultados</button>`;
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

// Inicialización
generarFixture();
calcularPosiciones();
mostrarPosiciones();

