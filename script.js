// script.js

// Datos en localStorage
const STORAGE_KEYS = {
  teams: "liber2025_teams",
  matches: "liber2025_matches",
  scorers: "liber2025_scorers",
  players: "liber2025_players"
};

// Datos iniciales
const defaultTeams = [
  { name: "Primero", logo: "", players: [] },
  { name: "Segundo Lenguas", logo: "", players: [] },
  { name: "Segundo Sociales", logo: "", players: [] },
  { name: "Cuarto", logo: "", players: [] },
  { name: "Quinto Lenguas", logo: "", players: [] },
  { name: "Quinto Sociales", logo: "", players: [] }
];

const defaultMatches = []; // Se cargan desde el fixture
const defaultScorers = [];

function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function loadData(key, defaultValue) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
}

function initApp() {
  window.teams = loadData(STORAGE_KEYS.teams, defaultTeams);
  window.matches = loadData(STORAGE_KEYS.matches, defaultMatches);
  window.scorers = loadData(STORAGE_KEYS.scorers, defaultScorers);
  window.players = loadData(STORAGE_KEYS.players, []);
  renderAll();
}

function renderAll() {
  renderTeams();
  renderFixture();
  renderStandings();
  renderScorers();
  renderFinalStage();
  renderTeamPlayers();
}

function renderTeams() {
  const container = document.getElementById("team-editor");
  container.innerHTML = "";
  teams.forEach((team, i) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <input value="${team.name}" onchange="updateTeamName(${i}, this.value)" />
      <input type="file" accept="image/*" onchange="uploadLogo(${i}, event)" />
    `;
    container.appendChild(div);
  });
  saveData(STORAGE_KEYS.teams, teams);
}

function updateTeamName(index, value) {
  teams[index].name = value;
  saveData(STORAGE_KEYS.teams, teams);
  renderAll();
}

function uploadLogo(index, event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    teams[index].logo = reader.result;
    saveData(STORAGE_KEYS.teams, teams);
    renderAll();
  };
  reader.readAsDataURL(file);
}

function renderFixture() {
  const fixtureContainer = document.getElementById("fixture");
  fixtureContainer.innerHTML = matches.map((match, i) => {
    const teamA = teams[match.a]?.name || "";
    const teamB = teams[match.b]?.name || "";
    return `
      <div>
        <strong>Fecha ${match.date}</strong>: ${teamA} vs ${teamB}
        <input type="number" value="${match.goalsA || ""}" onchange="updateResult(${i}, 'a', this.value)" />
        <input type="number" value="${match.goalsB || ""}" onchange="updateResult(${i}, 'b', this.value)" />
        <textarea placeholder="Goleadores" onchange="updateScorers(${i}, this.value)">${match.scorers || ""}</textarea>
      </div>
    `;
  }).join("");
}

function updateResult(index, side, value) {
  matches[index][`goals${side.toUpperCase()}`] = parseInt(value);
  saveData(STORAGE_KEYS.matches, matches);
  renderStandings();
}

function updateScorers(index, value) {
  matches[index].scorers = value;
  saveData(STORAGE_KEYS.matches, matches);
  updateScorerTable();
}

function renderStandings() {
  const table = document.getElementById("standings");
  const stats = teams.map((team, i) => ({ i, name: team.name, pts: 0, gf: 0, ga: 0, pj: 0 }));

  matches.forEach(match => {
    if (match.goalsA == null || match.goalsB == null) return;
    stats[match.a].pj++;
    stats[match.b].pj++;
    stats[match.a].gf += match.goalsA;
    stats[match.a].ga += match.goalsB;
    stats[match.b].gf += match.goalsB;
    stats[match.b].ga += match.goalsA;

    if (match.goalsA > match.goalsB) stats[match.a].pts += 3;
    else if (match.goalsA < match.goalsB) stats[match.b].pts += 3;
    else {
      stats[match.a].pts++;
      stats[match.b].pts++;
    }
  });

  stats.sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga));
  table.innerHTML = stats.map(s => `
    <tr><td>${s.name}</td><td>${s.pj}</td><td>${s.gf}</td><td>${s.ga}</td><td>${s.pts}</td></tr>
  `).join("");
}

function updateScorerTable() {
  const map = {};
  matches.forEach(match => {
    const lines = (match.scorers || "").split("\n");
    lines.forEach(line => {
      const [name, goals] = line.split(":");
      if (!name || !goals) return;
      if (!map[name.trim()]) map[name.trim()] = 0;
      map[name.trim()] += parseInt(goals);
    });
  });
  const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
  document.getElementById("scorers").innerHTML = sorted.map(([n, g]) => `<tr><td>${n}</td><td>${g}</td></tr>`).join("");
}

function renderScorers() {
  updateScorerTable();
}

function renderFinalStage() {
  document.getElementById("final-stage").innerHTML = `
    <h3>Playoffs y Finales (próximamente)</h3>
    <p>Esta sección se actualizará automáticamente una vez finalizada la liga.</p>
  `;
}

function renderTeamPlayers() {
  const section = document.getElementById("team-players");
  section.innerHTML = teams.map((t, i) => `
    <h4>${t.name}</h4>
    <textarea onchange="updatePlayers(${i}, this.value)">${(t.players || []).join("\n")}</textarea>
  `).join("");
  saveData(STORAGE_KEYS.teams, teams);
}

function updatePlayers(i, text) {
  teams[i].players = text.split("\n");
  saveData(STORAGE_KEYS.teams, teams);
}

initApp();
