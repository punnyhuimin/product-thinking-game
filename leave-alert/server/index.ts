import { createServer, type IncomingMessage } from "node:http";
import { formatAlert, HEADS_UP_MIN, hhmm, nextAlert, record, type Sent } from "./alerts.ts";
import { getToken, route, search } from "./onemap.ts";
import { staticMapUrl } from "./staticMap.ts";
import { latestChatId, sendMessage, sendPhoto } from "./telegram.ts";
import { checkTrip, parseTrip, tripView, type ActiveTrip, type Snapshot } from "./trip.ts";

const PORT = Number(process.env.PORT ?? 8787);
const POLL_MS = Number(process.env.POLL_SECONDS ?? 60) * 1000;
const LTA_KEY = process.env.LTA_ACCOUNT_KEY ?? "";
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const ONEMAP = { token: process.env.ONEMAP_TOKEN, email: process.env.ONEMAP_EMAIL, password: process.env.ONEMAP_PASSWORD };
// The web app's origin when it is hosted separately (e.g. GitHub Pages); unset for local dev.
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? "";
if (!LTA_KEY || !BOT_TOKEN) throw new Error("Set LTA_ACCOUNT_KEY and TELEGRAM_BOT_TOKEN in .env");

// v1 tracks one trip at a time, in memory.
let trip: ActiveTrip | null = null;
let sent: Sent = {};
let last: Snapshot | null = null;
let lastError: string | null = null;
let chatId: number | null = null;

async function chat(): Promise<number> {
  chatId ??= await latestChatId(BOT_TOKEN);
  if (chatId === null) throw new Error("No chat yet: send your bot any message on Telegram first");
  return chatId;
}

async function tick() {
  if (!trip) return;
  try {
    last = await checkTrip(trip, LTA_KEY);
    const now = Date.now();
    const leaveAt = last.plan.leaveAt.getTime();
    const kind = nextAlert(sent, leaveAt, now);
    if (kind) {
      await sendMessage(BOT_TOKEN, await chat(), formatAlert(kind, leaveAt, now, last.context));
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
  const id = await chat();
  const active: ActiveTrip = { ...t, route: r };
  const snap = await checkTrip(active, LTA_KEY);
  [trip, sent, last, lastError] = [active, {}, snap, null];
  const caption = `Trip set: ${t.from.label} to ${t.to.label}, arrive by ${hhmm(Date.parse(t.arriveBy))}.\n` +
    `Leave around ${hhmm(snap.plan.leaveAt.getTime())} (${r.totalMin} min journey). ` +
    `I'll message you ${HEADS_UP_MIN} min before.\n` +
    `Route: ${snap.context.mapsUrl}`;
  await sendPhoto(BOT_TOKEN, id, staticMapUrl(r, t.from, t.to), caption)
    .catch((e) => (console.error("map photo failed:", e.message), sendMessage(BOT_TOKEN, id, caption)));
  await tick(); // sends a heads-up straight away if leave time is already close
  return tripView(active, last ?? snap);
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
