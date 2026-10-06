import { createHash } from "node:crypto";
import { createServer, type IncomingMessage } from "node:http";
import { createBot } from "./bot.ts";
import { formatAlert, HEADS_UP_MIN, hhmm, nextAlert, record, weatherLine, type Sent } from "./alerts.ts";
import { getToken, route, search } from "./onemap.ts";
import { staticMapUrl } from "./staticMap.ts";
import { answerCallback, editMessage, getUpdates, sendMessage, sendPhoto, setWebhook, type Update } from "./telegram.ts";
import { checkTrip, parseTrip, tripView, type ActiveTrip, type Snapshot } from "./trip.ts";

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
if (!LTA_KEY || !BOT_TOKEN) throw new Error("Set LTA_ACCOUNT_KEY and TELEGRAM_BOT_TOKEN in .env");

// v1 tracks one trip at a time, in memory.
let trip: ActiveTrip | null = null;
let sent: Sent = {};
let last: Snapshot | null = null;
let lastError: string | null = null;
// The only chat that may use the bot and get alerts. Without TELEGRAM_CHAT_ID, the first private chat claims it.
let owner: number | null = Number(process.env.TELEGRAM_CHAT_ID) || null;

function chat(): number {
  if (owner === null) throw new Error("No chat yet: send your bot any message on Telegram first");
  return owner;
}

async function tick() {
  if (!trip) return;
  try {
    last = await checkTrip(trip, LTA_KEY);
    const now = Date.now();
    const leaveAt = last.plan.leaveAt.getTime();
    const kind = nextAlert(sent, leaveAt, now);
    if (kind) {
      await sendMessage(BOT_TOKEN, chat(), formatAlert(kind, leaveAt, now, last.context));
      sent = record(sent, kind, leaveAt);
    }
    lastError = null;
    if (sent.go || now > Date.parse(trip.arriveBy)) trip = null;
  } catch (e) {
    lastError = (e as Error).message;
    console.error("tick failed:", lastError);
  }
}

// Route roughly an hour before arrival so OneMap uses the right timetable, but never in the past.
const departGuess = (arriveBy: string) => new Date(Math.max(Date.now(), Date.parse(arriveBy) - 60 * 60_000));

async function saveTrip(body: unknown) {
  const t = parseTrip(body);
  const r = await route(await getToken(ONEMAP), t.from, t.to, departGuess(t.arriveBy));
  const id = chat();
  const active: ActiveTrip = { ...t, route: r };
  const snap = await checkTrip(active, LTA_KEY);
  [trip, sent, last, lastError] = [active, {}, snap, null];
  const caption = `Trip set: ${t.from.label} to ${t.to.label}, arrive by ${hhmm(Date.parse(t.arriveBy))}.\n` +
    `Leave around ${hhmm(snap.plan.leaveAt.getTime())} (${r.totalMin} min journey). ` +
    `I'll message you ${HEADS_UP_MIN} min before.\n` +
    `${weatherLine(snap.context.forecast, snap.context.forecastAt, snap.context.umbrella)}\n` +
    `Route: ${snap.context.mapsUrl}`;
  await sendPhoto(BOT_TOKEN, id, staticMapUrl(r, t.from, t.to), caption)
    .catch((e) => (console.error("map photo failed:", e.message), sendMessage(BOT_TOKEN, id, caption)));
  await tick(); // sends a heads-up straight away if leave time is already close
  return tripView(active, last ?? snap);
}

const bot = createBot({
  send: (id, r) => sendMessage(BOT_TOKEN, id, r.text, r.keyboard),
  search: async (q) => search(q, await getToken(ONEMAP).catch(() => undefined)),
  saveTrip: async (t) => void (await saveTrip(t)),
  status: () => (trip && last ? tripView(trip, last) : null),
  cancelTrip: () => {
    const had = trip !== null;
    [trip, sent, last, lastError] = [null, {}, null, null];
    return had;
  },
});

let lastUpdateId = 0;

async function handleUpdate(u: Update) {
  if (u.update_id <= lastUpdateId) return; // Telegram redelivers when a webhook reply is slow
  lastUpdateId = u.update_id;
  const c = u.message?.chat ?? u.callback_query?.message?.chat;
  if (c?.type !== "private") return;
  owner ??= c.id;
  if (c.id !== owner) return sendMessage(BOT_TOKEN, c.id, "Sorry, this is a private bot.");
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
    res.setHeader("access-control-allow-headers", "content-type");
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
    if (url.pathname === "/api/search" && req.method === "GET") {
      const q = url.searchParams.get("q")?.trim() ?? "";
      const token = await getToken(ONEMAP).catch(() => undefined);
      return reply(200, { results: q.length < 2 ? [] : await search(q, token) });
    }
    if (url.pathname === "/api/trip" && req.method === "POST") {
      return reply(200, await saveTrip(await readJson(req)));
    }
    if (url.pathname === "/api/trip" && req.method === "GET") {
      return reply(200, { trip: trip && last ? tripView(trip, last) : null, error: lastError });
    }
    reply(404, { ok: false, error: "Not found" });
  } catch (e) {
    reply(400, { ok: false, error: (e as Error).message });
  }
}).listen(PORT, () => console.log(`leave-alert server on http://localhost:${PORT}`));

setInterval(tick, POLL_MS);

if (PUBLIC_URL) {
  setWebhook(BOT_TOKEN, PUBLIC_URL + HOOK_PATH, HOOK_SECRET)
    .then(() => console.log(`Telegram webhook: ${PUBLIC_URL}${HOOK_PATH}`))
    .catch((e) => console.error("setWebhook failed:", e.message));
} else {
  void pollTelegram();
}
