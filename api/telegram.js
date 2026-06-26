const TELEGRAM_API = "https://api.telegram.org/bot";

async function tgFetch(token, method, body) {
  const url = `${TELEGRAM_API}${token}/${method}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(`Telegram ${method}: ${data.description}`);
  return data.result;
}

export async function sendMessage(token, chatId, text, options = {}) {
  return tgFetch(token, "sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...options,
  });
}

export async function sendPhoto(token, chatId, photoUrl, caption, options = {}) {
  return tgFetch(token, "sendPhoto", {
    chat_id: chatId,
    photo: photoUrl,
    caption,
    parse_mode: "HTML",
    ...options,
  });
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_GROUP_CHAT_ID;

  if (!token || !chatId) {
    return response.status(500).json({ error: "Missing TELEGRAM_BOT_TOKEN or TELEGRAM_GROUP_CHAT_ID env vars" });
  }

  try {
    const { text, photo, caption } = await request.json();
    if (photo) {
      const result = await sendPhoto(token, chatId, photo, caption);
      return response.status(200).json({ ok: true, messageId: result.message_id });
    }
    if (text) {
      const result = await sendMessage(token, chatId, text);
      return response.status(200).json({ ok: true, messageId: result.message_id });
    }
    return response.status(400).json({ error: "Missing text or photo in body" });
  } catch (error) {
    return response.status(502).json({ error: error.message });
  }
}
