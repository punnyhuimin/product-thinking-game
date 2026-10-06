import { createHash } from "node:crypto";
import { createServer, type IncomingMessage } from "node:http";
import { COMMANDS, createBot } from "./bot.ts";
import { HEADS_UP_MIN, hhmm, weatherLine } from "./alerts.ts";
import { signLink, verifyLink } from "./link.ts";
import { getToken, route, search } from "./onemap.ts";
import { staticMapUrl } from "./staticMap.ts";
import { answerCallback, editMessage, getUpdates, sendMessage, sendPhoto, setMyCommands, setWebhook, type Update } from "./telegram.ts";
import { checkTrip, parseTrip, tripView } from "./trip.ts";
import { createTrips } from "./trips.ts";

const PORT = Number(process.env.PORT ?? 8787);
const POLL_MS = Number(process.env.POLL_SECONDS ?? 60) * 1000;
const LTA_KEY = process.env.LTA_ACCOUNT_KEY ?? "";
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const ONEMAP = { token: process.env.ONEMAP_TOKEN, email: process.env.ONEMAP_EMAIL, password: process.env.ONEMAP_PASSWORD };
// The web app's origin when it is hosted separately (e.g. GitHub Pages); unset for local dev.
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? "";
// When set (Render sets RENDER_EXTERNAL_URL itself), Telegram pushes updates to a webhook; otherwise we long-poll.
const PUBLIC_URL = process.env.PUBLIC_URL ?? process.env.RENDER_EXTERNAL_URL;
const HOOK_PATH = "/telegram";
const HOOK_SECRET = createHash("sha256").update(BOT_TOKEN).digest("hex").slice(0, 32);
// Signs the /web links. Derived from the bot token, so rotating the token signs every browser out.
const LINK_SECRET = createHash("sha256").update(`web-link:${BOT_TOKEN}`).digest("hex");
// Where /web links point: the web app's page.
const WEB_URL = process.env.WEB_URL ?? "http://localhost:5173/";
// Telegram user ids allowed to use the bot (in a private chat the chat id is the user id).
const ALLOWED = new Set(
  (process.env.TELEGRAM_ALLOWED_IDS || process.env.TELEGRAM_CHAT_ID || "").split(",").map((s) => s.trim()).filter(Boolean).map(Number),
);
if (!LTA_KEY || !BOT_TOKEN) throw new Error("Set LTA_ACCOUNT_KEY and TELEGRAM_BOT_TOKEN in .env");
if (!ALLOWED.size || [...ALLOWED].some((id) => !Number.isInteger(id))) {
  throw new Error("Set TELEGRAM_ALLOWED_IDS in .env to a comma-separated list of Telegram user ids");
}

const trips = createTrips({
  check: (t) => checkTrip(t, LTA_KEY),
  send: (chatId, text) => sendMessage(BOT_TOKEN, chatId, text),
});

// Route roughly an hour before arrival so OneMap uses the right timetable, but never in the past.
const departGuess = (arriveBy: string) => new Date(Math.max(Date.now(), Date.parse(arriveBy) - 60 * 60_000));

async function saveTrip(id: number, body: unknown) {
  const t = parseTrip(body);
  const r = await route(await getToken(ONEMAP), t.from, t.to, departGuess(t.arriveBy));
  const active = { ...t, route: r };
  const snap = await trips.start(id, active);
  const caption = `Trip set: ${t.from.label} to ${t.to.label}, arrive by ${hhmm(Date.parse(t.arriveBy))}.\n` +
    `Leave around ${hhmm(snap.plan.leaveAt.getTime())} (${r.totalMin} min journey). ` +
    `I'll message you ${HEADS_UP_MIN} min before.\n` +
    `${weatherLine(snap.context.forecast, snap.context.forecastAt, snap.context.umbrella)}\n` +
    `Route: ${snap.context.mapsUrl}`;
  await sendPhoto(BOT_TOKEN, id, staticMapUrl(r, t.from, t.to), caption)
    .catch((e) => (console.error("map photo failed:", e.message), sendMessage(BOT_TOKEN, id, caption)));
  await trips.tick(id); // sends a heads-up straight away if leave time is already close
  return trips.view(id).trip ?? tripView(active, snap);
}

function webLink(chatId: number) {
  const url = new URL(WEB_URL);
  url.searchParams.set("key", signLink(chatId, LINK_SECRET));
  return url.toString();
}

const bot = createBot({
  send: (id, r) => sendMessage(BOT_TOKEN, id, r.text, r.keyboard),
  search: async (q) => search(q, await getToken(ONEMAP).catch(() => undefined)),
  saveTrip: async (id, t) => void (await saveTrip(id, t)),
  status: (id) => trips.view(id).trip,
  cancelTrip: (id) => trips.cancel(id),
  webLink,
});

let lastUpdateId = 0;

async function handleUpdate(u: Update) {
  if (u.update_id <= lastUpdateId) return; // Telegram redelivers when a webhook reply is slow
  lastUpdateId = u.update_id;
  const c = u.message?.chat ?? u.callback_query?.message?.chat;
  if (c?.type !== "private") return;
  if (!ALLOWED.has(c.id)) {
    return sendMessage(BOT_TOKEN, c.id, `Sorry, this is a private bot. Your Telegram id is ${c.id}: ask the owner to add it.`);
  }
  const m = u.message;
  if (m && Date.now() - m.date * 1000 > 10 * 60_000) return; // stale backlog from while we were down
  if (m?.location) return bot.onLocation(c.id, m.location.latitude, m.location.longitude);
  if (m?.text) return bot.onText(c.id, m.text);
  const q = u.callback_query;
  if (!q) return;
  await answerCallback(BOT_TOKEN, q.id).catch(() => {});
  const label = await bot.onPick(c.id, q.data ?? "");
  if (label && q.message) await editMessage(BOT_TOKEN, c.id, q.message.message_id, label);
}

const onUpdate = (u: Update) => handleUpdate(u).catch((e) => console.error("bot update failed:", e.message));

async function pollTelegram() {
  let offset = 0;
  for (;;) {
    try {
      for (const u of await getUpdates(BOT_TOKEN, offset)) {
        offset = u.update_id + 1;
        await onUpdate(u);
      }
    } catch (e) {
      const webhookSet = (e as { code?: number }).code === 409;
      console.error(webhookSet ? "A webhook owns the bot (deployed server?), so this server won't get bot messages" : (e as Error).message);
      await new Promise((r) => setTimeout(r, webhookSet ? 5 * 60_000 : 5_000));
    }
  }
}

// The allowed chat a web request acts as, from the key its browser got through /web.
function webChat(req: IncomingMessage): number | null {
  const key = req.headers.authorization?.match(/^Bearer (\S+)$/)?.[1];
  const id = key ? verifyLink(key, LINK_SECRET) : null;
  return id !== null && ALLOWED.has(id) ? id : null;
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  return JSON.parse(raw || "null");
}

createServer(async (req, res) => {
  const reply = (status: number, body: unknown) => {
    res.writeHead(status, { "content-type": "application/json" });
    res.end(JSON.stringify(body));
  };
  if (ALLOWED_ORIGIN) {
    res.setHeader("access-control-allow-origin", ALLOWED_ORIGIN);
    res.setHeader("access-control-allow-headers", "content-type, authorization");
    res.setHeader("vary", "origin");
  }
  if (req.method === "OPTIONS") return void res.writeHead(204).end();
  const url = new URL(req.url ?? "/", "http://localhost");
  if (url.pathname === "/healthz") return reply(200, { ok: true });
  try {
    if (url.pathname === HOOK_PATH && req.method === "POST") {
      if (req.headers["x-telegram-bot-api-secret-token"] !== HOOK_SECRET) return reply(403, { ok: false });
      const u = (await readJson(req)) as Update;
      reply(200, { ok: true }); // answer first so Telegram doesn't retry while we route
      return void onUpdate(u);
    }
    if (url.pathname.startsWith("/api/")) {
      const chatId = webChat(req);
      if (chatId === null) {
        return reply(401, { ok: false, error: "This browser isn't linked to Telegram. Send /web to the bot and open its link." });
      }
      if (url.pathname === "/api/search" && req.method === "GET") {
        const q = url.searchParams.get("q")?.trim() ?? "";
        const token = await getToken(ONEMAP).catch(() => undefined);
        return reply(200, { results: q.length < 2 ? [] : await search(q, token) });
      }
      if (url.pathname === "/api/trip" && req.method === "POST") {
        return reply(200, await saveTrip(chatId, await readJson(req)));
      }
      if (url.pathname === "/api/trip" && req.method === "GET") {
        return reply(200, trips.view(chatId));
      }
    }
    reply(404, { ok: false, error: "Not found" });
  } catch (e) {
    reply(400, { ok: false, error: (e as Error).message });
  }
}).listen(PORT, () => console.log(`leave-alert server on http://localhost:${PORT}`));

setInterval(() => void trips.tick(), POLL_MS);

setMyCommands(BOT_TOKEN, COMMANDS).catch((e) => console.error("setMyCommands failed:", e.message));

if (PUBLIC_URL) {
  setWebhook(BOT_TOKEN, PUBLIC_URL + HOOK_PATH, HOOK_SECRET)
    .then(() => console.log(`Telegram webhook: ${PUBLIC_URL}${HOOK_PATH}`))
    .catch((e) => console.error("setWebhook failed:", e.message));
} else {
  void pollTelegram();
}
