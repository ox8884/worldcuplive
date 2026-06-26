const BASE_URL = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world";
const SCOREBOARD_URL = `${BASE_URL}/scoreboard`;
const SCHEDULE_URL = `${BASE_URL}/scoreboard?dates=20260611-20260719&limit=200`;
const SUMMARY_URL = `${BASE_URL}/summary?event=`;

const jsonHeaders = {
  "Accept": "application/json",
  "User-Agent": "gajaecode-worldcup-landing/1.0",
};

async function fetchJson(url) {
  const response = await fetch(url, { headers: jsonHeaders });
  if (!response.ok) throw new Error(`${url} failed with ${response.status}`);
  return response.json();
}
async function fetchOptionalJson(url) {
  try {
    return await fetchJson(url);
  } catch {
    return null;
  }
}

async function wikipediaHeadshot(name) {
  const title = encodeURIComponent(String(name).trim().replace(/\s+/g, "_"));
  if (!title) return "";
  const summary = await fetchOptionalJson(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`);
  return summary?.thumbnail?.source ?? "";
}

async function enrichScorerPhotos(scorers) {
  const enriched = await Promise.all(
    scorers.map(async (scorer, index) => {
      if (index > 2 || scorer.headshot) return scorer;
      return { ...scorer, headshot: await wikipediaHeadshot(scorer.name) };
    }),
  );
  return enriched;
}


function statValue(stats = [], name) {
  return Number(stats.find((stat) => stat.name === name)?.value ?? 0);
}

function collectScorers(summary, event) {
  const scorers = [];
  for (const teamRoster of summary.rosters ?? []) {
    const team = teamRoster.team ?? {};
    for (const player of teamRoster.roster ?? []) {
      const goals = statValue(player.stats, "totalGoals");
      if (goals <= 0) continue;
      scorers.push({
        id: player.athlete?.id ?? `${event.id}-${player.jersey}`,
        name: player.athlete?.displayName ?? player.athlete?.fullName ?? "Unknown player",
        shortName: player.athlete?.shortName ?? player.athlete?.displayName ?? "Unknown",
        jersey: player.jersey ?? "",
        position: player.position?.abbreviation ?? "",
        team: team.displayName ?? "Unknown team",
        teamId: team.id ?? "",
        teamLogo: team.logos?.[0]?.href ?? "",
        headshot: player.athlete?.headshot?.href ?? "",
        goals,
        assists: statValue(player.stats, "goalAssists"),
        shots: statValue(player.stats, "totalShots"),
      });
    }
  }
  return scorers;
}

async function fetchSummaries(events) {
  return Promise.allSettled(
    events.map((event) => fetchJson(`${SUMMARY_URL}${encodeURIComponent(event.id)}`).then((summary) => ({ summary, event }))),
  );
}

async function buildTopScorers(events) {
  const completed = events.filter((event) => event.competitions?.[0]?.status?.type?.state === "post");
  const BATCH_SIZE = 20;
  const summaries = [];

  for (let i = 0; i < completed.length; i += BATCH_SIZE) {
    const batchResults = await fetchSummaries(completed.slice(i, i + BATCH_SIZE));
    summaries.push(...batchResults);
  }

  const table = new Map();

  for (const result of summaries) {
    if (result.status !== "fulfilled") continue;
    for (const scorer of collectScorers(result.value.summary, result.value.event)) {
      const current = table.get(scorer.id) ?? { ...scorer, goals: 0, assists: 0, shots: 0 };
      current.goals += scorer.goals;
      current.assists += scorer.assists;
      current.shots += scorer.shots;
      current.headshot ||= scorer.headshot;
      table.set(scorer.id, current);
    }
  }

  const topScorers = [...table.values()]
    .sort((a, b) => b.goals - a.goals || b.assists - a.assists || b.shots - a.shots || a.name.localeCompare(b.name))
    .slice(0, 10);

  return enrichScorerPhotos(topScorers);
}

function simplifyEvent(event) {
  const competition = event.competitions?.[0] ?? {};
  return {
    id: event.id,
    name: event.name,
    shortName: event.shortName,
    date: event.date,
    note: competition.altGameNote ?? "FIFA World Cup",
    venue: competition.venue?.fullName ?? "Venue TBD",
    city: competition.venue?.address?.city ?? "",
    status: competition.status ?? event.status,
    competitors: (competition.competitors ?? []).map((competitor) => ({
      id: competitor.id,
      homeAway: competitor.homeAway,
      score: competitor.score ?? "0",
      winner: Boolean(competitor.winner),
      team: {
        id: competitor.team?.id,
        displayName: competitor.team?.displayName,
        abbreviation: competitor.team?.abbreviation,
        logo: competitor.team?.logo,
        color: competitor.team?.color,
      },
    })),
  };
}

function collectGoalTimeline(summary) {
  const goals = [];
  for (const teamRoster of summary.rosters ?? []) {
    const team = teamRoster.team ?? {};
    for (const player of teamRoster.roster ?? []) {
      for (const play of player.plays ?? []) {
        if (!play.scoringPlay) continue;
        goals.push({
          minute: play.clock?.displayValue ?? "",
          scorer: play.didScore ? (player.athlete?.displayName ?? player.athlete?.fullName ?? "Unknown player") : null,
          assistant: play.didAssist ? (player.athlete?.displayName ?? player.athlete?.fullName ?? "Unknown player") : null,
          ownGoal: Boolean(play.ownGoal),
          penalty: Boolean(play.penaltyKick),
          team: team.displayName ?? "",
          teamLogo: team.logos?.[0]?.href ?? "",
          teamId: team.id ?? "",
        });
      }
    }
  }

  const grouped = new Map();
  for (const goal of goals) {
    const key = `${goal.minute}-${goal.teamId}`;
    const current = grouped.get(key) ?? {
      minute: goal.minute,
      scorer: "",
      assistant: "",
      ownGoal: goal.ownGoal,
      penalty: goal.penalty,
      team: goal.team,
      teamLogo: goal.teamLogo,
    };
    if (goal.scorer) current.scorer = goal.scorer;
    if (goal.assistant) current.assistant = goal.assistant;
    current.ownGoal ||= goal.ownGoal;
    current.penalty ||= goal.penalty;
    grouped.set(key, current);
  }

  return [...grouped.values()].sort((a, b) => Number.parseInt(a.minute, 10) - Number.parseInt(b.minute, 10));
}

function simplifyDetail(summary) {
  return {
    header: summary.header,
    boxscore: summary.boxscore,
    leaders: summary.leaders,
    goals: collectGoalTimeline(summary),
    rosters: (summary.rosters ?? []).map((teamRoster) => ({
      homeAway: teamRoster.homeAway,
      formation: teamRoster.formation,
      team: teamRoster.team,
      starters: (teamRoster.roster ?? [])
        .filter((player) => player.starter)
        .map((player) => ({
          jersey: player.jersey,
          name: player.athlete?.displayName ?? player.athlete?.fullName,
          shortName: player.athlete?.shortName,
          position: player.position?.abbreviation,
          formationPlace: player.formationPlace,
          goals: statValue(player.stats, "totalGoals"),
          assists: statValue(player.stats, "goalAssists"),
          subbedOut: Boolean(player.subbedOut),
        })),
      bench: (teamRoster.roster ?? [])
        .filter((player) => !player.starter)
        .slice(0, 12)
        .map((player) => ({
          jersey: player.jersey,
          name: player.athlete?.displayName ?? player.athlete?.fullName,
          shortName: player.athlete?.shortName,
          position: player.position?.abbreviation,
          goals: statValue(player.stats, "totalGoals"),
          assists: statValue(player.stats, "goalAssists"),
          subbedIn: Boolean(player.subbedIn),
        })),
    })),
  };
}

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const url = new URL(request.url, "http://localhost");
    const eventId = url.searchParams.get("event");

    if (eventId) {
      const summary = await fetchJson(`${SUMMARY_URL}${encodeURIComponent(eventId)}`);
      response.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
      response.status(200).json(simplifyDetail(summary));
      return;
    }

    const [scoreboard, schedule] = await Promise.all([fetchJson(SCOREBOARD_URL), fetchJson(SCHEDULE_URL)]);
    const scheduleEvents = Array.isArray(schedule.events) ? schedule.events : [];
    const topScorers = await buildTopScorers(scheduleEvents);

    response.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    response.status(200).json({
      leagues: scoreboard.leagues ?? schedule.leagues ?? [],
      season: scoreboard.season ?? schedule.season,
      day: scoreboard.day,
      events: (scoreboard.events ?? []).map(simplifyEvent),
      schedule: scheduleEvents.map(simplifyEvent),
      topScorers,
    });
  } catch (error) {
    response.status(502).json({
      error: "Unable to fetch World Cup data",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
