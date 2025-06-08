const equiposIniciales = [
  "Primero",
  "Segundo Lenguas",
  "Segundo Sociales",
  "Cuarto",
  "Quinto Lenguas",
  "Quinto Sociales"
];

let equipos = JSON.parse(localStorage.getItem("equipos")) || equiposIniciales;
let resultados = JSON.parse(localStorage.getItem("resultados")) || {};
let goleadores = JSON.parse(localStorage.getItem("goleadores")) || {};
let fixture = JSON.parse(localStorage.getItem("fixture")) || generarFixture();

function guardar() {
  localStorage.setItem("equipos", JSON.stringify(equipos));
  localStorage.setItem("resultados", JSON.stringify(resultados));
  localStorage.setItem("goleadores", JSON.stringify(goleadores));
  localStorage.setItem("fixture", JSON.stringify(fixture));
}

function generarFixture() {
  let fechas = [[], [], [], [], []];
  let rivales = [...equipos];
  let quinto = "Quinto Lenguas";
  let ordenQuinto = ["Primero", "Segundo Sociales", "Segundo Lenguas", "Quinto Sociales", "Cuarto"];

  ordenQuinto.forEach((rival, i) => {
    fechas[i].push([quinto, rival]);
    rivales = rivales.filter(e => e !== rival && e !== quinto);
  });

  let partidosRestantes = [];
  for (let i = 0; i < equipos.length; i++) {
    for (let j = i + 1; j < equipos.length; j++) {
      let a = equipos[i], b = equipos[j];
      if (!ordenQuinto.includes(a) || a !== "Quinto Lenguas") {
        if (!ordenQuinto.includes(b) || b !== "Quinto Lenguas") {
          partidosRestantes.push([a, b]);
        }
      }
    }
  }

  while (fechas.some(f => f.length < 3) && partidosRestantes.length > 0) {
    for (let f = 0; f < 5; f++) {
      if (fechas[f].length >= 3) continue;
      for (let i = 0; i < partidosRestantes.length; i++) {
        let [a, b] = partidosRestantes[i];
        let ya = fechas[f].flat();
        if (!ya.includes(a) && !ya.includes(b)) {
          fechas[f].push([a, b]);
          partidosRestantes.splice(i, 1);
          break;
        }
      }
    }
  }

  return fechas;
}

function mostrarSeccion(id) {
  document.querySelectorAll(".seccion").forEach(sec => sec.classList.add("oculto"));
  document.getElementById(id).classList.remove("oculto");
}

function actualizarTodo() {
  mostrarFixture();
  mostrarResultados();
  mostrarPosiciones();
  mostrarGoleadores();
  mostrarFaseFinal();
}

function mostrarFixture() {
  const contenedor = document.getElementById("tabla-fixture");
  contenedor.innerHTML = "";
  fixture.forEach((fecha, i) => {
    fecha.forEach(partido => {
      const fila = document.createElement("tr");
      fila.innerHTML = `<td>Fecha ${i + 1}</td><td>${partido[0]}</td><td>${partido[1]}</td>`;
      contenedor.appendChild(fila);
    });
  });
}

function mostrarResultados() {
  const contenedor = document.getElementById("tabla-resultados");
  contenedor.innerHTML = "";
  fixture.forEach((fecha, fIndex) => {
    fecha.forEach((partido, pIndex) => {
      const key = `f${fIndex}_p${pIndex}`;
      const res = resultados[key] || { g1: "", g2: "", goles: [] };

      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>Fecha ${fIndex + 1}</td>
        <td>${partido[0]}</td>
        <td><input type="number" value="${res.g1}" onchange="guardarResultado('${key}', 0, this.value)" /></td>
        <td>${partido[1]}</td>
        <td><input type="number" value="${res.g2}" onchange="guardarResultado('${key}', 1, this.value)" /></td>
        <td><input type="text" value="${(res.goles || []).join(', ')}" onchange="guardarGoleadores('${key}', this.value)" placeholder="goleadores separados por coma" /></td>
      `;
      contenedor.appendChild(fila);
    });
  });
}

function guardarResultado(key, equipo, valor) {
  resultados[key] = resultados[key] || { g1: "", g2: "", goles: [] };
  if (equipo === 0) resultados[key].g1 = parseInt(valor);
  else resultados[key].g2 = parseInt(valor);
  guardar();
  actualizarTodo();
}

function guardarGoleadores(key, texto) {
  let nombres = texto.split(",").map(n => n.trim()).filter(n => n !== "");
  resultados[key] = resultados[key] || { g1: "", g2: "", goles: [] };
  resultados[key].goles = nombres;

  goleadores = {};
  Object.values(resultados).forEach(r => {
    (r.goles || []).forEach(nombre => {
      goleadores[nombre] = (goleadores[nombre] || 0) + 1;
    });
  });

  guardar();
  actualizarTodo();
}

function mostrarPosiciones() {
  const puntos = {};
  const jugados = {};
  const gf = {};
  const gc = {};

  equipos.forEach(e => {
    puntos[e] = 0;
    jugados[e] = 0;
    gf[e] = 0;
    gc[e] = 0;
  });

  fixture.forEach((fecha, fIndex) => {
    fecha.forEach((partido, pIndex) => {
      const key = `f${fIndex}_p${pIndex}`;
      const res = resultados[key];
      if (!res || res.g1 === "" || res.g2 === "") return;

      let [a, b] = partido;
      let g1 = parseInt(res.g1), g2 = parseInt(res.g2);
      jugados[a]++;
      jugados[b]++;
      gf[a] += g1; gc[a] += g2;
      gf[b] += g2; gc[b] += g1;
      if (g1 > g2) puntos[a] += 3;
      else if (g2 > g1) puntos[b] += 3;
      else {
        puntos[a] += 1;
        puntos[b] += 1;
      }
    });
  });

  const tabla = equipos.map(e => ({
    equipo: e,
    puntos: puntos[e],
    pj: jugados[e],
    gf: gf[e],
    gc: gc[e],
    dg: gf[e] - gc[e]
  }));

  tabla.sort((a, b) => b.puntos - a.puntos || b.dg - a.dg || b.gf - a.gf);

  const contenedor = document.getElementById("tabla-posiciones");
  contenedor.innerHTML = "";
  tabla.forEach(t => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${t.equipo}</td>
      <td>${t.puntos}</td>
      <td>${t.pj}</td>
      <td>${t.gf}</td>
      <td>${t.gc}</td>
      <td>${t.dg}</td>
    `;
    contenedor.appendChild(fila);
  });
}

function mostrarGoleadores() {
  const lista = Object.entries(goleadores);
  lista.sort((a, b) => b[1] - a[1]);

  const contenedor = document.getElementById("tabla-goleadores");
  contenedor.innerHTML = "";
  lista.forEach(([nombre, goles]) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `<td>${nombre}</td><td>${goles}</td>`;
    contenedor.appendChild(fila);
  });
}

function mostrarFaseFinal() {
  const contenedor = document.getElementById("fase-final");
  contenedor.innerHTML = `<p>🧩 ¡La fase final se genera automáticamente cuando termine la fase de grupos!</p>`;
}

actualizarTodo();
