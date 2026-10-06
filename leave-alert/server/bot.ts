import { hhmm } from "./alerts.ts";
import type { Place } from "./route.ts";
import type { Keyboard } from "./telegram.ts";
import type { Trip, tripView } from "./trip.ts";

export const DEFAULT_BUFFER_MIN = 10;
const MAX_OPTIONS = 5;
const DAY_MS = 86_400_000;

export type Reply = { text: string; keyboard?: Keyboard };

export type BotDeps = {
  send(chatId: number, reply: Reply): Promise<void>;
  search(q: string): Promise<Place[]>;
  // Routes and saves the trip, and sends the confirmation photo itself.
  saveTrip(trip: Trip): Promise<void>;
  status(): ReturnType<typeof tripView> | null;
  cancelTrip(): boolean;
  now?(): Date;
};

// `list` numbers each suggestion list, so a button from an older list can't pick from a newer one.
type Session =
  | { step: "from"; list: number; options: Place[] }
  | { step: "to"; from: Place; list: number; options: Place[] }
  | { step: "arrive"; from: Place; to: Place };

const HELP =
  "I work out when you need to leave and message you before then.\n\n" +
  "/trip - plan a trip\n/status - show the current trip\n/cancel - stop planning, or cancel the current trip";
const ASK_FROM = "Where are you starting from? Send a place, address or postal code, or share your location.";
const ASK_TO = "Where are you going?";
const ASK_TIME = `What time do you need to arrive? e.g. 18:30 or 6:30pm.\nAdd +15 for a 15 min safety buffer (default ${DEFAULT_BUFFER_MIN}).`;

const sgDate = (ms: number) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Singapore" }).format(ms);

// "18:30", "1830", "6:30pm", "6pm", with an optional "+15" buffer -> the next such time in Singapore.
export function parseArrive(text: string, now: Date): { arriveBy: string; bufferMin: number; tomorrow: boolean } | null {
  const m = text.trim().match(/^(\d{1,2})(?:[:.]?(\d{2}))?\s*(am|pm)?(?:\s+\+?(\d{1,3})\s*(?:m|mins?|minutes?)?)?$/i);
  if (!m) return null;
  let hour = Number(m[1]);
  const minute = Number(m[2] ?? 0);
  const ampm = m[3]?.toLowerCase();
  if (ampm) {
    if (hour < 1 || hour > 12) return null;
    hour = (hour % 12) + (ampm === "pm" ? 12 : 0);
  }
  if (hour > 23 || minute > 59) return null;
  const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00+08:00`;
  let arriveBy = `${sgDate(now.getTime())}T${time}`;
  const tomorrow = Date.parse(arriveBy) <= now.getTime();
  if (tomorrow) arriveBy = `${sgDate(now.getTime() + DAY_MS)}T${time}`;
  return { arriveBy, bufferMin: m[4] ? Number(m[4]) : DEFAULT_BUFFER_MIN, tomorrow };
}

export function formatStatus(view: ReturnType<typeof tripView> | null): string {
  if (!view) return "No trip set. Send /trip to plan one.";
  const { live } = view;
  return [
    `${view.from.label} to ${view.to.label}`,
    `Arrive by ${hhmm(Date.parse(view.arriveBy))}, leave around ${hhmm(Date.parse(view.leaveAt))}.`,
    `Weather: ${live.forecast}.${live.umbrella ? " Bring an umbrella." : ""}`,
  ].join("\n");
}

const placeButton = (p: Place) => (p.postal ? `${p.label} (${p.postal})` : p.label);

export function createBot(deps: BotDeps) {
  const sessions = new Map<number, Session>();
  const now = () => deps.now?.() ?? new Date();
  let lists = 0;

  async function offerPlaces(chatId: number, s: Exclude<Session, { step: "arrive" }>, q: string) {
    if (q.length < 2) return deps.send(chatId, { text: "Type at least 2 characters." });
    const found = (await deps.search(q)).slice(0, MAX_OPTIONS);
    if (!found.length) return deps.send(chatId, { text: `No matches for "${q}". Try a postal code or a nearby landmark.` });
    s.list = ++lists;
    s.options = found;
    const keyboard = found.map((p, i) => [{ text: placeButton(p), callback_data: `pick:${s.list}:${i}` }]);
    await deps.send(chatId, { text: "Which one?", keyboard });
  }

  // Moves past the from/to step once a place is chosen.
  async function choose(chatId: number, s: Session, place: Place, echo: boolean) {
    if (s.step === "from") {
      sessions.set(chatId, { step: "to", from: place, list: 0, options: [] });
      await deps.send(chatId, { text: echo ? `From: ${place.label}\n\n${ASK_TO}` : ASK_TO });
    } else if (s.step === "to") {
      sessions.set(chatId, { step: "arrive", from: s.from, to: place });
      await deps.send(chatId, { text: echo ? `To: ${place.label}\n\n${ASK_TIME}` : ASK_TIME });
    }
  }

  async function command(chatId: number, cmd: string) {
    switch (cmd) {
      case "/trip":
        sessions.set(chatId, { step: "from", list: 0, options: [] });
        return deps.send(chatId, { text: ASK_FROM });
      case "/status":
        return deps.send(chatId, { text: formatStatus(deps.status()) });
      case "/cancel":
        if (sessions.delete(chatId)) return deps.send(chatId, { text: "Stopped planning. Send /trip to start again." });
        if (deps.cancelTrip()) return deps.send(chatId, { text: "Trip cancelled. No more alerts for it." });
        return deps.send(chatId, { text: "Nothing to cancel." });
      default:
        return deps.send(chatId, { text: HELP });
    }
  }

  async function onText(chatId: number, raw: string) {
    const text = raw.trim();
    if (text.startsWith("/")) return command(chatId, text.split(/[\s@]/)[0].toLowerCase());
    const s = sessions.get(chatId);
    if (!s) return deps.send(chatId, { text: "Send /trip to plan a trip, or /help for more." });
    if (s.step !== "arrive") return offerPlaces(chatId, s, text);

    const when = parseArrive(text, now());
    if (!when) return deps.send(chatId, { text: `I didn't understand that time.\n\n${ASK_TIME}` });
    sessions.delete(chatId);
    const day = when.tomorrow ? "tomorrow " : "";
    await deps.send(chatId, { text: `Arrive by ${day}${when.arriveBy.slice(11, 16)}. Finding a route...` });
    try {
      await deps.saveTrip({ from: s.from, to: s.to, arriveBy: when.arriveBy, bufferMin: when.bufferMin });
    } catch (e) {
      await deps.send(chatId, { text: `Couldn't set the trip: ${(e as Error).message}\nSend /trip to try again.` });
    }
  }

  async function onLocation(chatId: number, lat: number, lng: number) {
    const s = sessions.get(chatId);
    if (!s || s.step === "arrive") return deps.send(chatId, { text: "Send /trip first, then share your location." });
    await choose(chatId, s, { label: "Shared location", address: "", postal: "", lat, lng }, true);
  }

  // A tapped suggestion. Returns the text to replace the list with, or null if the list is stale.
  async function onPick(chatId: number, data: string): Promise<string | null> {
    const [, list, i] = data.match(/^pick:(\d+):(\d+)$/) ?? [];
    const s = sessions.get(chatId);
    const place = s && s.step !== "arrive" && s.list === Number(list) ? s.options[Number(i)] : undefined;
    if (!s || !place) {
      await deps.send(chatId, { text: "That list has expired. Send /trip to start again." });
      return null;
    }
    const label = `${s.step === "from" ? "From" : "To"}: ${place.label}`;
    await choose(chatId, s, place, false);
    return label;
  }

  return { onText, onLocation, onPick };
}
