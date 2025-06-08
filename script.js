const CONTRASENA = "Excursio2016";
let esAdmin = false;
let equipos = [
  "Primero", "Segundo Lenguas", "Segundo Sociales",
  "Cuarto", "Quinto Lenguas", "Quinto Sociales"
];

let resultados = JSON.parse(localStorage.getItem("resultados")) || [];
let goleadores = JSON.parse(localStorage.getItem("goleadores")) || {};

function checkPassword() {
  const pass = document.getElementById("password").value;
  if (pass === CONTRASENA) {
    esAdmin = true;
    document.getElementById("auth").style.display = "none";
    document.getElementById("mainContent").style.display = "block";
    renderSecciones();
  } else {
    alert("Contraseña incorrecta.");
  }
}

function mostrarSeccion(id) {
  document.querySelectorAll(".seccion").forEach(s => s.classList.remove("visible"));
  document.getElementById(id).classList.add("visible");
}

function renderSecciones() {
  renderFixture();
  renderPosiciones();
  renderGoleadores();
}

function renderFixture() {
  const fixtureHTML = [];
  const fechas = [
    "13/6", "20/6", "27/6", "4/7", "11/7"
  ];

  // Generar fixture fijo para Quinto Lenguas y aleatorio para el resto
  const partidos = [
    ["Quinto Lenguas", "Primero"],
    ["Quinto Lenguas", "Segundo Sociales"],
    ["Quinto Lenguas", "Segundo Lenguas"],
    ["Quinto Lenguas", "Quinto Sociales"],
    ["Quinto Lenguas", "Cuarto"]
  ];

  let usados = new Set(partidos.flat());
  let restantes = equipos.filter(e => !usados.has(e));
  while (partidos.length < 15) {
    let [a, b] = [null, null];
    do {
      a = equipos[Math.floor(Math.random() * equipos.length)];
      b = equipos[Math.floor(Math.random() * equipos.length)];
    } while (a === b || partidos.some(p => (p[0] === a && p[1] === b) || (p[0] === b && p[1] === a)));
    partidos.push([a, b]);
  }

  fixtureHTML.push("<h2>Fixture</h2>");
  fechas.forEach((fecha, i) => {
    fixtureHTML.push(`<h3>Fecha ${i + 1} - ${fecha}</h3><table><tr><th>Partido</th><th>Resultado</th><th>Goleadores</th></tr>`);
    for (let j = 0; j < 3; j++) {
      const idx = i * 3 + j;
      const [local, visitante] = partidos[idx];
      const res = resultados.find(r => r.local === local && r.visitante === visitante);
      if (esAdmin) {
        fixtureHTML.push(`<tr><td>${local} vs ${visitante}</td><td><input data-index="${idx}" placeholder="Ej: 2-1"/></td>
        <td><input data-index="${idx}" data-goles placeholder="Ej: Juan(2), Pedro"/></td></tr>`);
      } else {
        fixtureHTML.push(`<tr><td>${local} vs ${visitante}</td><td>${res ? res.resultado : "-"}</td>
        <td>${res ? res.goleadores : "-"}</td></tr>`);
      }
    }
    fixtureHTML.push("</table>");
  });

  if (esAdmin) {
    fixtureHTML.push(`<button onclick="guardarResultados()">Guardar Resultados</button>`);
  }

  document.getElementById("fixture").innerHTML = fixtureHTML.join("");
}

function guardarResultados() {
  const inputs = document.querySelectorAll("input[data-index]");
  resultados = [];
  goleadores = {};
  for (let i = 0; i < inputs.length; i += 2) {
    const idx = parseInt(inputs[i].dataset.index);
    const resultado = inputs[i].value.trim();
    const goleadoresTexto = inputs[i + 1].value.trim();
    if (!resultado) continue;
    const [local, visitante] = getPartidoPorIndice(idx);
    resultados.push({ local, visitante, resultado, goleadores: goleadoresTexto });

    // Contar goles por jugador
    const matches = [...goleadoresTexto.matchAll(/([A-Za-zÁÉÍÓÚÑáéíóúñ\s]+)\((\d+)\)/g)];
    for (const [, nombre, goles] of matches) {
      const jugador = nombre.trim();
      goleadores[jugador] = (goleadores[jugador] || 0) + parseInt(goles);
    }
  }
  localStorage.setItem("resultados", JSON.stringify(resultados));
  localStorage.setItem("goleadores", JSON.stringify(goleadores));
  renderSecciones();
}

function getPartidoPorIndice(idx) {
  const fijos = [
    ["Quinto Lenguas", "Primero"],
    ["Quinto Lenguas", "Segundo Sociales"],
    ["Quinto Lenguas", "Segundo Lenguas"],
    ["Quinto Lenguas", "Quinto Sociales"],
    ["Quinto Lenguas", "Cuarto"]
  ];
  const usados = new Set(fijos.flat());
  const restantes = equipos.filter(e => !usados.has(e));
  let partidos = [...fijos];
  while (partidos.length < 15) {
    let [a, b] = [null, null];
    do {
      a = equipos[Math.floor(Math.random() * equipos.length)];
      b = equipos[Math.floor(Math.random() * equipos.length)];
    } while (a === b || partidos.some(p => (p[0] === a && p[1] === b) || (p[0] === b && p[1] === a)));
    partidos.push([a, b]);
  }
  return partidos[idx];
}

function renderPosiciones() {
  const tabla = {};
  equipos.forEach(eq => {
    tabla[eq] = { pts: 0, pj: 0, gf: 0, gc: 0, dg: 0 };
  });

  for (const { local, visitante, resultado } of resultados) {
    const [g1, g2] = resultado.split("-").map(n => parseInt(n));
    if (isNaN(g1) || isNaN(g2)) continue;
    tabla[local].pj++; tabla[visitante].pj++;
    tabla[local].gf += g1; tabla[local].gc += g2;
    tabla[visitante].gf += g2; tabla[visitante].gc += g1;
    tabla[local].dg = tabla[local].gf - tabla[local].gc;
    tabla[visitante].dg = tabla[visitante].gf - tabla[visitante].gc;

    if (g1 > g2) tabla[local].pts += 3;
    else if (g2 > g1) tabla[visitante].pts += 3;
    else { tabla[local].pts++; tabla[visitante].pts++; }
  }

  const posicionesHTML = [];
  posicionesHTML.push("<h2>Tabla de Posiciones</h2><table><tr><th>Equipo</th><th>PTS</th><th>PJ</th><th>GF</th><th>GC</th><th>DG</th></tr>");
  Object.entries(tabla).sort((a, b) => b[1].pts - a[1].pts || b[1].dg - a[1].dg || b[1].gf - a[1].gf).forEach(([eq, stats]) => {
    posicionesHTML.push(`<tr><td>${eq}</td><td>${stats.pts}</td><td>${stats.pj}</td><td>${stats.gf}</td><td>${stats.gc}</td><td>${stats.dg}</td></tr>`);
  });
  posicionesHTML.push("</table>");
  document.getElementById("posiciones").innerHTML = posicionesHTML.join("");
}

function renderGoleadores() {
  const goleadoresHTML = [];
  goleadoresHTML.push("<h2>Tabla de Goleadores</h2><table><tr><th>Jugador</th><th>Goles</th></tr>");
  Object.entries(goleadores).sort((a, b) => b[1] - a[1]).forEach(([nombre, goles]) => {
    goleadoresHTML.push(`<tr><td>${nombre}</td><td>${goles}</td></tr>`);
  });
  goleadoresHTML.push("</table>");
  document.getElementById("goleadores").innerHTML = goleadoresHTML.join("");
}
