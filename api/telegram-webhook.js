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

async function handleCommand(token, chatId, text) {
  const cmd = text.split(" ")[0].toLowerCase();

  if (cmd === "/start") {
    await sendMessage(token, chatId, `⚽ <b>WorldCup Live 봇</b>\n\n/matches - 오늘 경기\n/live - 현재 진행 중\n/schedule - 전체 일정\n/help - 도움말`);
    return;
  }

  if (cmd === "/help") {
    await sendMessage(token, chatId, `📋 <b>명령어 목록</b>\n\n/matches - 오늘 경기 목록\n/live - 현재 라이브 경기\n/schedule - 남은 전체 일정\n/scorers - 득점 순위`);
    return;
  }

  if (cmd === "/matches" || cmd === "/live") {
    const data = await fetchJson(SCOREBOARD_URL);
    const events = data.events ?? [];
    if (events.length === 0) {
      await sendMessage(token, chatId, "오늘 경기가 없습니다.");
      return;
    }
    const filtered = cmd === "/live"
      ? events.filter(e => (e.competitions?.[0]?.status?.type?.state ?? e.status?.type?.state) === "in")
      : events;

    if (filtered.length === 0) {
      await sendMessage(token, chatId, cmd === "/live" ? "현재 진행 중인 경기가 없습니다." : "오늘 경기가 없습니다.");
      return;
    }

    const lines = filtered.map(formatMatch);
    const header = cmd === "/live" ? "🔴 <b>라이브 경기</b>" : "⚽ <b>오늘의 경기</b>";
    await sendMessage(token, chatId, `${header}\n\n${lines.join("\n\n")}`);
    return;
  }

  if (cmd === "/schedule") {
    const data = await fetchJson(SCHEDULE_URL);
    const events = (data.events ?? []).filter(e => {
      const state = (e.competitions?.[0]?.status?.type?.state ?? e.status?.type?.state);
      return state !== "post";
    }).slice(0, 10);

    if (events.length === 0) {
      await sendMessage(token, chatId, "남은 일정이 없습니다.");
      return;
    }
    const lines = events.map(formatMatch);
    await sendMessage(token, chatId, `📅 <b>앞으로의 일정</b>\n\n${lines.join("\n\n")}`);
    return;
  }

  if (cmd === "/scorers") {
    const data = await fetchJson(SCHEDULE_URL);
    // Simplified: we'd need to fetch summaries for each match to get scorers
    // For now just return a placeholder or fetch from a cached endpoint
    await sendMessage(token, chatId, "득점 순위는 /api/worldcup 엔드포인트에서 확인 후 수동 전송 권장.\n또는 웹사이트에서 확인: https://worldcup-live.vercel.app#scorers");
    return;
  }

  // Unknown command
  await sendMessage(token, chatId, `알 수 없는 명령어입니다. /help 로 도움말을 확인하세요.`);
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return response.status(500).json({ error: "Missing TELEGRAM_BOT_TOKEN" });
  }

  try {
    const update = await request.json();
    const msg = update.message ?? update.edited_message;
    if (!msg?.text) return response.status(200).json({ ok: true });

    const chatId = msg.chat.id;
    const text = msg.text;

    await handleCommand(token, chatId, text);
    return response.status(200).json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return response.status(200).json({ ok: true }); // Always return 200 to Telegram
  }
}
