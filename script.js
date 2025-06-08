const PASSWORD = "Excursio2016";
let isAdmin = false;

document.addEventListener("DOMContentLoaded", () => {
  if (!localStorage.getItem("isAdmin")) {
    const pass = prompt("Contraseña para editar:");
    if (pass === PASSWORD) {
      isAdmin = true;
      localStorage.setItem("isAdmin", "true");
    } else {
      isAdmin = false;
    }
  } else {
    isAdmin = true;
  }

  mostrarSeccion("fixture");
  generarEquipos();
  generarFixture();
  actualizarTabla();
  actualizarGoleadores();
});

function mostrarSeccion(id) {
  document.querySelectorAll("section").forEach(sec => sec.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

const equiposIniciales = [
  "Primero",
  "Segundo Lenguas",
  "Segundo Sociales",
  "Cuarto",
  "Quinto Lenguas",
  "Quinto Sociales"
];

function generarEquipos() {
  if (!localStorage.getItem("equipos")) {
    const data = equiposIniciales.map(nombre => ({ nombre, escudo: "" }));
    localStorage.setItem("equipos", JSON.stringify(data));
  }
}

function obtenerEquipos() {
  return JSON.parse(localStorage.getItem("equipos"));
}

function guardarEquipos(equipos) {
  localStorage.setItem("equipos", JSON.stringify(equipos));
}

function generarFixture() {
  const equipos = obtenerEquipos();
  let partidos = JSON.parse(localStorage.getItem("partidos"));

  if (!partidos) {
    const fechas = [ "13/6", "20/6", "27/6", "4/7", "11/7" ];
    const fixtureQuintoL = ["Primero", "Segundo Sociales", "Segundo Lenguas", "Quinto Sociales", "Cuarto"];
    let usados = { "Quinto Lenguas": new Set() };
    partidos = [];

    let restantes = equipos.filter(eq => eq.nombre !== "Quinto Lenguas");
    let usadoEnFecha = new Set();

    for (let i = 0; i < fechas.length; i++) {
      let fecha = fechas[i];
      let equiposEnFecha = new Set();
      let partidosFecha = [];

      // Aseguramos que Quinto Lenguas juegue su partido fijo
      const rival = fixtureQuintoL[i];
      partidosFecha.push({ fecha, local: "Quinto Lenguas", visitante: rival, golesLocal: null, golesVisitante: null, goleadoresLocal: "", goleadoresVisitante: "" });
      equiposEnFecha.add("Quinto Lenguas");
      equiposEnFecha.add(rival);

      // Buscamos el resto de partidos
      for (let a = 0; a < equipos.length; a++) {
        for (let b = a + 1; b < equipos.length; b++) {
          const e1 = equipos[a].nombre;
          const e2 = equipos[b].nombre;

          if (
            !equiposEnFecha.has(e1) &&
            !equiposEnFecha.has(e2) &&
            !fixtureQuintoL.includes(e1) && !fixtureQuintoL.includes(e2) &&
            !partidos.some(p => (p.local === e1 && p.visitante === e2) || (p.local === e2 && p.visitante === e1))
          ) {
            partidosFecha.push({ fecha, local: e1, visitante: e2, golesLocal: null, golesVisitante: null, goleadoresLocal: "", goleadoresVisitante: "" });
            equiposEnFecha.add(e1);
            equiposEnFecha.add(e2);
            break;
          }
        }
        if (equiposEnFecha.size === 6) break;
      }

      partidos.push(...partidosFecha);
    }

    localStorage.setItem("partidos", JSON.stringify(partidos));
  }

  renderFixture(partidos);
}

function renderFixture(partidos) {
  const cont = document.getElementById("fixtureContent");
  cont.innerHTML = "";

  const fechasUnicas = [...new Set(partidos.map(p => p.fecha))];

  fechasUnicas.forEach(fecha => {
    const fechaDiv = document.createElement("div");
    fechaDiv.innerHTML = `<h3>Fecha ${fecha}</h3>`;
    const tabla = document.createElement("table");
    const encabezado = `<tr><th>Local</th><th>Goles</th><th>Visitante</th><th>Goles</th>${isAdmin ? "<th>Goleadores</th><th>Acción</th>" : ""}</tr>`;
    tabla.innerHTML = encabezado;

    partidos.filter(p => p.fecha === fecha).forEach((p, index) => {
      const fila = document.createElement("tr");

      const golesL = p.golesLocal ?? "";
      const golesV = p.golesVisitante ?? "";

      if (isAdmin) {
        fila.innerHTML = `
          <td>${p.local}</td>
          <td><input type="number" value="${golesL}" id="golL-${fecha}-${index}" /></td>
          <td>${p.visitante}</td>
          <td><input type="number" value="${golesV}" id="golV-${fecha}-${index}" /></td>
          <td>
            <input type="text" placeholder="Goleadores Local" value="${p.goleadoresLocal}" id="gl-${fecha}-${index}" />
            <input type="text" placeholder="Goleadores Visitante" value="${p.goleadoresVisitante}" id="gv-${fecha}-${index}" />
          </td>
          <td><button class="save-btn" onclick="guardarResultado('${fecha}', ${index})">Guardar</button></td>
        `;
      } else {
        fila.innerHTML = `
          <td>${p.local}</td><td>${golesL}</td><td>${p.visitante}</td><td>${golesV}</td>
        `;
      }

      tabla.appendChild(fila);
    });

    fechaDiv.appendChild(tabla);
    cont.appendChild(fechaDiv);
  });
}

function guardarResultado(fecha, index) {
  let partidos = JSON.parse(localStorage.getItem("partidos"));
  const partidosFecha = partidos.filter(p => p.fecha === fecha);
  const p = partidosFecha[index];

  const golesL = parseInt(document.getElementById(`golL-${fecha}-${index}`).value);
  const golesV = parseInt(document.getElementById(`golV-${fecha}-${index}`).value);
  const goleadoresL = document.getElementById(`gl-${fecha}-${index}`).value;
  const goleadoresV = document.getElementById(`gv-${fecha}-${index}`).value;

  const i = partidos.findIndex(x => x.fecha === fecha && x.local === p.local && x.visitante === p.visitante);
  partidos[i].golesLocal = golesL;
  partidos[i].golesVisitante = golesV;
  partidos[i].goleadoresLocal = goleadoresL;
  partidos[i].goleadoresVisitante = goleadoresV;

  localStorage.setItem("partidos", JSON.stringify(partidos));

  actualizarTabla();
  actualizarGoleadores();
  generarFixture();
}

function actualizarTabla() {
  const equipos = obtenerEquipos().map(eq => ({ ...eq, puntos: 0, gf: 0, gc: 0, pj: 0 }));
  const partidos = JSON.parse(localStorage.getItem("partidos"));

  partidos.forEach(p => {
    if (p.golesLocal !== null && p.golesVisitante !== null) {
      const eqL = equipos.find(e => e.nombre === p.local);
      const eqV = equipos.find(e => e.nombre === p.visitante);

      eqL.gf += p.golesLocal;
      eqL.gc += p.golesVisitante;
      eqL.pj += 1;

      eqV.gf += p.golesVisitante;
      eqV.gc += p.golesLocal;
      eqV.pj += 1;

      if (p.golesLocal > p.golesVisitante) eqL.puntos += 3;
      else if (p.golesLocal < p.golesVisitante) eqV.puntos += 3;
      else {
        eqL.puntos += 1;
        eqV.puntos += 1;
      }
    }
  });

  equipos.sort((a, b) => b.puntos - a.puntos || (b.gf - b.gc) - (a.gf - a.gc));

  const tabla = document.getElementById("tablaPosiciones");
  tabla.innerHTML = `
    <tr><th>Equipo</th><th>PJ</th><th>GF</th><th>GC</th><th>DIF</th><th>Puntos</th></tr>
  `;

  equipos.forEach(eq => {
    tabla.innerHTML += `
      <tr>
        <td>${eq.nombre}</td>
        <td>${eq.pj}</td>
        <td>${eq.gf}</td>
        <td>${eq.gc}</td>
        <td>${eq.gf - eq.gc}</td>
        <td>${eq.puntos}</td>
      </tr>
    `;
  });
}

function actualizarGoleadores() {
  const partidos = JSON.parse(localStorage.getItem("partidos"));
  const goles = {};

  partidos.forEach(p => {
    if (p.goleadoresLocal) {
      p.goleadoresLocal.split(",").map(n => n.trim()).forEach(n => {
        if (!n) return;
        goles[n] = (goles[n] || 0) + 1;
      });
    }
    if (p.goleadoresVisitante) {
      p.goleadoresVisitante.split(",").map(n => n.trim()).forEach(n => {
        if (!n) return;
        goles[n] = (goles[n] || 0) + 1;
      });
    }
  });

  const goleadores = Object.entries(goles).sort((a, b) => b[1] - a[1]);

  const cont = document.getElementById("tablaGoleadores");
  cont.innerHTML = `<tr><th>Jugador</th><th>Goles</th></tr>`;

  goleadores.forEach(([nombre, goles]) => {
    cont.innerHTML += `<tr><td>${nombre}</td><td>${goles}</td></tr>`;
  });
}
