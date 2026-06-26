import { sendMessage } from "./telegram.js";

const SCOREBOARD_URL = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard";
const SCHEDULE_URL = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260611-20260719&limit=200";

async function fetchJson(url) {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

function formatMatch(event) {
  const comp = event.competitions?.[0] ?? event;
  const teams = (comp.competitors ?? []).sort((a, b) => (a.homeAway === "home" ? -1 : 1));
  const status = comp.status ?? event.status;
  const state = status?.type?.state ?? "pre";
  const detail = status?.type?.shortDetail ?? "예정";

  const home = teams[0];
  const away = teams[1];
  const homeName = home?.team?.displayName ?? "?";
  const awayName = away?.team?.displayName ?? "?";
  const homeScore = home?.score ?? "0";
  const awayScore = away?.score ?? "0";

  let emoji = "⏳";
  if (state === "in") emoji = "🔴";
  else if (state === "post") emoji = "✅";

  const scoreLine = state === "pre"
    ? `${homeName} vs ${awayName}`
    : `${homeName} ${homeScore} - ${awayScore} ${awayName}`;

  return `${emoji} ${scoreLine}\n   📅 ${detail} | ${comp.venue?.fullName ?? ""}`;
}

function matchKey(event) {
  const comp = event.competitions?.[0] ?? event;
  const teams = (comp.competitors ?? []).sort((a, b) => (a.homeAway === "home" ? -1 : 1));
  const home = teams[0];
  const away = teams[1];
  return `${event.id}:${home?.score ?? "0"}-${away?.score ?? "0"}`;
}

export default async function handler(request, response) {
  // Optional: verify cron secret
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.authorization;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return response.status(401).json({ error: "Unauthorized" });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_GROUP_CHAT_ID;

  if (!token || !chatId) {
    return response.status(500).json({ error: "Missing TELEGRAM_BOT_TOKEN or TELEGRAM_GROUP_CHAT_ID" });
  }

  try {
    const data = await fetchJson(SCOREBOARD_URL);
    const events = data.events ?? [];

    const liveEvents = events.filter(e => {
      const state = (e.competitions?.[0]?.status?.type?.state ?? e.status?.type?.state);
      return state === "in";
    });

    const finishedEvents = events.filter(e => {
      const state = (e.competitions?.[0]?.status?.type?.state ?? e.status?.type?.state);
      return state === "post";
    });

    const upcomingEvents = events.filter(e => {
      const state = (e.competitions?.[0]?.status?.type?.state ?? e.status?.type?.state);
      return state === "pre";
    });

    const messages = [];

    if (liveEvents.length > 0) {
      const lines = liveEvents.map(formatMatch);
      messages.push(`🔴 <b>현재 라이브 경기</b>\n\n${lines.join("\n\n")}`);
    }

    if (finishedEvents.length > 0) {
      const lines = finishedEvents.map(formatMatch);
      messages.push(`✅ <b>종료된 경기</b>\n\n${lines.join("\n\n")}`);
    }

    if (upcomingEvents.length > 0) {
      const lines = upcomingEvents.slice(0, 4).map(formatMatch);
      messages.push(`⏳ <b>예정된 경기</b>\n\n${lines.join("\n\n")}`);
    }

    if (messages.length === 0) {
      return response.status(200).json({ ok: true, sent: false, reason: "No events" });
    }

    // Send each section as a separate message
    const results = [];
    for (const text of messages) {
      const result = await sendMessage(token, chatId, text);
      results.push(result.message_id);
    }

    return response.status(200).json({ ok: true, sent: true, messageIds: results });
  } catch (error) {
    console.error("Cron notify error:", error);
    return response.status(502).json({ error: error.message });
  }
}
