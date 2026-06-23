const ESPN_SCOREBOARD_URL = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard";
const SCOREBOARD_URL = window.location.protocol === "file:" ? ESPN_SCOREBOARD_URL : "/api/worldcup";
const REFRESH_MS = 60_000;

const demoEvents = [
  {
    id: "demo-live-1",
    name: "Brazil vs Germany",
    date: new Date().toISOString(),
    note: "FIFA World Cup, Group A",
    venue: "MetLife Stadium",
    status: { type: { state: "in", shortDetail: "62'", description: "In Progress" } },
    competitors: [
      { homeAway: "home", team: { displayName: "Brazil", abbreviation: "BRA", logo: "" }, score: "2" },
      { homeAway: "away", team: { displayName: "Germany", abbreviation: "GER", logo: "" }, score: "1" },
    ],
  },
  {
    id: "demo-scheduled-1",
    name: "Korea Republic vs Japan",
    date: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    note: "FIFA World Cup, Group B",
    venue: "SoFi Stadium",
    status: { type: { state: "pre", shortDetail: "오늘 22:00", description: "Scheduled" } },
    competitors: [
      { homeAway: "home", team: { displayName: "Korea Republic", abbreviation: "KOR", logo: "" }, score: "0" },
      { homeAway: "away", team: { displayName: "Japan", abbreviation: "JPN", logo: "" }, score: "0" },
    ],
  },
  {
    id: "demo-final-1",
    name: "Argentina vs France",
    date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    note: "FIFA World Cup, Group C",
    venue: "AT&T Stadium",
    status: { type: { state: "post", shortDetail: "FT", description: "Final" } },
    competitors: [
      { homeAway: "home", team: { displayName: "Argentina", abbreviation: "ARG", logo: "" }, score: "1" },
      { homeAway: "away", team: { displayName: "France", abbreviation: "FRA", logo: "" }, score: "1" },
    ],
  },
];

const demoScorers = [
  { id: "45843", name: "Lionel Messi", team: "Argentina", goals: 5, assists: 2, teamLogo: "", headshot: "https://a.espncdn.com/i/headshots/soccer/players/full/45843.png" },
  { id: "231388", name: "Kylian Mbappé", team: "France", goals: 4, assists: 1, teamLogo: "", headshot: "https://a.espncdn.com/i/headshots/soccer/players/full/231388.png" },
  { id: "149945", name: "Son Heung-min", team: "Korea Republic", goals: 3, assists: 2, teamLogo: "", headshot: "https://a.espncdn.com/i/headshots/soccer/players/full/149945.png" },
];

const elements = {
  alert: document.querySelector("#alert"),
  dialog: document.querySelector("#matchDialog"),
  dialogClose: document.querySelector("#dialogClose"),
  finishedCount: document.querySelector("#finishedCount"),
  liveCount: document.querySelector("#liveCount"),
  matchDetail: document.querySelector("#matchDetail"),
  matchesList: document.querySelector("#matchesList"),
  refreshButton: document.querySelector("#refreshButton"),
  scheduledCount: document.querySelector("#scheduledCount"),
  scheduleList: document.querySelector("#scheduleList"),
  scorersList: document.querySelector("#scorersList"),
  summaryText: document.querySelector("#summaryText"),
  template: document.querySelector("#matchTemplate"),
  totalCount: document.querySelector("#totalCount"),
  updatedAt: document.querySelector("#updatedAt"),
};

let currentPayload = { events: [], schedule: [], topScorers: [] };

function formatTime(value, options = {}) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  }).format(new Date(value));
}

function getCompetition(event) {
  return event.competitions?.[0] ?? event;
}

function getCompetitors(event) {
  return getCompetition(event).competitors ?? [];
}

function getState(event) {
  return getCompetition(event).status?.type?.state ?? event.status?.type?.state ?? "pre";
}

function getStatus(event) {
  return getCompetition(event).status ?? event.status ?? { type: { state: "pre", shortDetail: "Scheduled" } };
}

function sortedTeams(event) {
  return [...getCompetitors(event)].sort((a, b) => (a.homeAway === "home" ? -1 : 1) - (b.homeAway === "home" ? -1 : 1));
}

function teamLogo(team = {}) {
  if (team.logo && team.logo !== "1") return team.logo;
  const label = encodeURIComponent(team.abbreviation || team.displayName || "WC");
  return `https://placehold.co/72x72/16a35a/ffffff?text=${label}`;
}

function setAlert(message) {
  elements.alert.hidden = !message;
  elements.alert.textContent = message || "";
}

function eventVenue(event) {
  return event.venue || getCompetition(event).venue?.fullName || event.name || "Venue TBD";
}

function eventNote(event) {
  return event.note || getCompetition(event).altGameNote || "FIFA World Cup";
}

function compactNote(event) {
  const note = eventNote(event);
  return note.match(/Group [A-Z]/)?.[0] ?? note.replace("FIFA World Cup, ", "");
}

function formatDateKey(value) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function formatDateLabel(value) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(value));
}

function renderStats(events) {
  const live = events.filter((event) => getState(event) === "in").length;
  const scheduled = events.filter((event) => getState(event) === "pre").length;
  const finished = events.filter((event) => getState(event) === "post").length;

  elements.liveCount.textContent = live;
  elements.totalCount.textContent = events.length;
  elements.scheduledCount.textContent = scheduled;
  elements.finishedCount.textContent = finished;
  elements.updatedAt.textContent = new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date());
  elements.summaryText.textContent = live > 0 ? "라이브 경기가 진행 중입니다." : "현재 진행 중인 경기는 없습니다.";
}

function renderMatches(events) {
  elements.matchesList.replaceChildren();

  if (events.length === 0) {
    const empty = document.createElement("p");
    empty.className = "source-note";
    empty.textContent = "표시할 월드컵 경기가 없습니다.";
    elements.matchesList.append(empty);
    return;
  }

  events.forEach((event) => {
    const card = elements.template.content.firstElementChild.cloneNode(true);
    const badge = card.querySelector(".badge");
    const time = card.querySelector("time");
    const teams = card.querySelector(".teams");
    const venue = card.querySelector(".venue");
    const state = getState(event);
    const status = getStatus(event);

    card.dataset.eventId = event.id;
    badge.textContent = status.type?.shortDetail || status.type?.description || state;
    badge.classList.toggle("is-live", state === "in");
    badge.classList.toggle("is-final", state === "post");
    time.dateTime = event.date;
    time.textContent = formatTime(event.date);

    sortedTeams(event).forEach((competitor) => {
      const row = document.createElement("div");
      row.className = "team";
      const team = competitor.team ?? {};
      row.innerHTML = `
        <img alt="" src="${teamLogo(team)}" loading="lazy" />
        <span class="team-name">${team.displayName ?? competitor.displayName ?? "TBD"}</span>
        <span class="team-score">${competitor.score ?? "-"}</span>
      `;
      teams.append(row);
    });

    venue.textContent = `${eventVenue(event)} · ${compactNote(event)}`;
    card.addEventListener("click", () => openMatchDetail(event.id));
    card.addEventListener("keydown", (eventKey) => {
      if (eventKey.key === "Enter" || eventKey.key === " ") {
        eventKey.preventDefault();
        openMatchDetail(event.id);
      }
    });
    elements.matchesList.append(card);
  });
}

function playerHeadshot(scorer, index) {
  if (index > 2) return "";
  if (scorer.headshot) return scorer.headshot;
  const id = String(scorer.id ?? "");
  return /^\d+$/.test(id) ? `https://a.espncdn.com/i/headshots/soccer/players/full/${id}.png` : "";
}

function renderScorers(scorers) {
  elements.scorersList.replaceChildren();
  const list = scorers.length ? scorers : demoScorers;

  list.slice(0, 5).forEach((scorer, index) => {
    const item = document.createElement("li");
    const headshot = playerHeadshot(scorer, index);
    item.className = `scorer-row${index < 3 ? " is-podium" : ""}`;
    item.innerHTML = `
      <span class="rank">${index + 1}</span>
      <img class="team-logo" alt="" src="${teamLogo({ logo: scorer.teamLogo, abbreviation: scorer.team?.slice(0, 3) })}" loading="lazy" />
      <span class="scorer-identity">
        <span class="scorer-main">
          ${headshot ? `<img class="scorer-photo" alt="" src="${headshot}" loading="lazy" onerror="this.remove()" />` : ""}
          <span class="scorer-name">${scorer.name}</span>
        </span>
        <span class="scorer-team">${scorer.team}</span>
        <small>G · ${scorer.assists ?? 0} A</small>
      </span>
      <strong>${scorer.goals}</strong>
    `;
    elements.scorersList.append(item);
  });
}

function renderSchedule(schedule) {
  elements.scheduleList.replaceChildren();
  const ordered = [...schedule].sort((a, b) => new Date(a.date) - new Date(b.date));
  const groups = new Map();

  ordered.forEach((event) => {
    const key = formatDateKey(event.date);
    const group = groups.get(key) ?? [];
    group.push(event);
    groups.set(key, group);
  });

  for (const events of groups.values()) {
    const section = document.createElement("section");
    section.className = "schedule-day";

    const title = document.createElement("div");
    title.className = "schedule-day__title";
    title.innerHTML = `<strong>${formatDateLabel(events[0].date)}</strong><span>${events.length}경기</span>`;

    const list = document.createElement("div");
    list.className = "schedule-day__matches";

    events.forEach((event) => {
      const item = document.createElement("button");
      item.className = "schedule-item";
      item.type = "button";
      const teams = sortedTeams(event).map((competitor) => competitor.team?.abbreviation || competitor.team?.displayName || "TBD");
      const status = getStatus(event);
      item.innerHTML = `
        <span>${formatTime(event.date, { month: undefined, day: undefined })}</span>
        <strong>${teams.join(" vs ")}</strong>
        <em>${status.type?.shortDetail || compactNote(event)}</em>
      `;
      item.addEventListener("click", () => openMatchDetail(event.id));
      list.append(item);
    });

    section.append(title, list);
    elements.scheduleList.append(section);
  }

  if (groups.size === 0) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "표시할 전체 일정이 없습니다.";
    elements.scheduleList.append(empty);
  }
}

function renderPlayerList(title, players) {
  if (!players.length) return `<section><h4>${title}</h4><p class="muted">정보가 아직 공개되지 않았습니다.</p></section>`;
  return `
    <section>
      <h4>${title}</h4>
      <div class="player-grid">
        ${players.map((player) => `
          <div class="player-pill">
            <span>${player.jersey ? `#${player.jersey}` : ""} ${player.shortName || player.name}</span>
            <small>${player.position || ""}${player.goals ? ` · ${player.goals}G` : ""}${player.assists ? ` · ${player.assists}A` : ""}</small>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function renderGoalTimeline(goals) {
  if (!goals?.length) {
    return `
      <section class="goals-panel">
        <div>
          <h4>득점 기록</h4>
          <p class="muted">아직 골 기록이 없거나 경기 전입니다.</p>
        </div>
      </section>
    `;
  }

  return `
    <section class="goals-panel">
      <div class="goals-panel__header">
        <h4>득점 기록</h4>
        <span>${goals.length} Goals</span>
      </div>
      <div class="goal-timeline">
        ${goals.map((goal) => `
          <div class="goal-row">
            <time>${goal.minute}</time>
            <img alt="" src="${teamLogo({ logo: goal.teamLogo, abbreviation: goal.team?.slice(0, 3) })}" />
            <div>
              <strong>${goal.scorer || "Unknown scorer"}${goal.ownGoal ? " (OG)" : ""}${goal.penalty ? " (PK)" : ""}</strong>
              <span>${goal.team}${goal.assistant ? ` · 도움 ${goal.assistant}` : ""}</span>
            </div>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function renderDetail(detail, fallbackEvent) {
  const teams = detail.rosters ?? [];
  const eventTeams = sortedTeams(fallbackEvent).map((competitor) => competitor.team?.displayName).join(" vs ");
  elements.matchDetail.innerHTML = `
    <div class="dialog-hero">
      <p class="eyebrow">Match Detail</p>
      <h3 id="dialogTitle">${eventTeams || fallbackEvent.name || "경기 상세"}</h3>
      <p>${formatTime(fallbackEvent.date)} · ${eventVenue(fallbackEvent)} · ${eventNote(fallbackEvent)}</p>
    </div>
    ${renderGoalTimeline(detail.goals)}
    <div class="lineup-grid">
      ${teams.map((team) => `
        <article class="lineup-card">
          <div class="lineup-card__title">
            <img alt="" src="${teamLogo({ logo: team.team?.logos?.[0]?.href, abbreviation: team.team?.abbreviation })}" />
            <div>
              <h4>${team.team?.displayName ?? "Team"}</h4>
              <span>${team.formation ? `${team.formation} Formation` : "Lineup"}</span>
            </div>
          </div>
          ${renderPlayerList("선발 라인업", team.starters ?? [])}
          ${renderPlayerList("벤치", team.bench ?? [])}
        </article>
      `).join("") || `<p class="muted">라인업 정보가 아직 공개되지 않았습니다.</p>`}
    </div>
  `;
}

async function openMatchDetail(eventId) {
  const fallbackEvent = [...currentPayload.events, ...currentPayload.schedule].find((event) => event.id === eventId);
  if (!fallbackEvent) return;
  elements.matchDetail.innerHTML = `<div class="dialog-loading">라인업을 불러오는 중...</div>`;
  elements.dialog.showModal();

  try {
    if (window.location.protocol === "file:" || String(eventId).startsWith("demo")) throw new Error("detail unavailable in file mode");
    const response = await fetch(`/api/worldcup?event=${encodeURIComponent(eventId)}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`detail failed: ${response.status}`);
    renderDetail(await response.json(), fallbackEvent);
  } catch (error) {
    renderDetail({ rosters: [] }, fallbackEvent);
  }
}

async function fetchScoreboard() {
  const response = await fetch(SCOREBOARD_URL, { cache: "no-store" });
  if (!response.ok) throw new Error(`Scoreboard request failed: ${response.status}`);
  const payload = await response.json();
  const events = Array.isArray(payload.events) ? payload.events : [];
  return {
    events,
    schedule: Array.isArray(payload.schedule) ? payload.schedule : events,
    topScorers: Array.isArray(payload.topScorers) ? payload.topScorers : [],
  };
}

async function loadScoreboard() {
  elements.refreshButton.disabled = true;
  elements.refreshButton.textContent = "불러오는 중...";

  try {
    currentPayload = await fetchScoreboard();
    setAlert("");
  } catch (error) {
    console.warn(error);
    setAlert("실시간 데이터를 가져오지 못해 데모 데이터를 표시합니다. 실제 배포에서는 서버 프록시 또는 공식 스포츠 데이터 API 키를 연결하세요.");
    currentPayload = { events: demoEvents, schedule: demoEvents, topScorers: demoScorers };
  } finally {
    renderStats(currentPayload.events);
    renderMatches(currentPayload.events);
    renderScorers(currentPayload.topScorers);
    renderSchedule(currentPayload.schedule);
    elements.refreshButton.disabled = false;
    elements.refreshButton.textContent = "새로고침";
  }
}

elements.dialogClose.addEventListener("click", () => elements.dialog.close());
elements.dialog.addEventListener("click", (event) => {
  if (event.target === elements.dialog) elements.dialog.close();
});
elements.refreshButton.addEventListener("click", loadScoreboard);
loadScoreboard();
window.setInterval(loadScoreboard, REFRESH_MS);
