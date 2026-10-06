import { formatAlert, nextAlert, record, type Sent } from "./alerts.ts";
import { tripView, type ActiveTrip, type Snapshot } from "./trip.ts";

export type TripsDeps = {
  check(trip: ActiveTrip): Promise<Snapshot>;
  send(chatId: number, text: string): Promise<void>;
  now?(): number;
};

type Tracked = { trip: ActiveTrip; sent: Sent; last: Snapshot; error: string | null };

// Every user's current trip, keyed by their Telegram chat id. One trip per user; in memory for now.
export function createTrips(deps: TripsDeps) {
  const trips = new Map<number, Tracked>();
  const now = () => deps.now?.() ?? Date.now();

  // Checks the trip once and tracks it, replacing any trip this chat already had.
  async function start(chatId: number, trip: ActiveTrip): Promise<Snapshot> {
    const last = await deps.check(trip);
    trips.set(chatId, { trip, sent: {}, last, error: null });
    return last;
  }

  // A failure is kept on the trip, not thrown, so one user's bad check can't hold up the rest.
  async function poll(chatId: number, t: Tracked) {
    try {
      const last = await deps.check(t.trip);
      if (trips.get(chatId) !== t) return; // replaced or cancelled while we were checking
      t.last = last;
      const at = now();
      const leaveAt = t.last.plan.leaveAt.getTime();
      const kind = nextAlert(t.sent, leaveAt, at);
      if (kind) {
        await deps.send(chatId, formatAlert(kind, leaveAt, at, t.last.context));
        t.sent = record(t.sent, kind, leaveAt);
      }
      t.error = null;
      if (t.sent.go || at > Date.parse(t.trip.arriveBy)) trips.delete(chatId);
    } catch (e) {
      t.error = (e as Error).message;
      console.error(`tick failed for chat ${chatId}:`, t.error);
    }
  }

  // Re-checks every trip (or just this chat's) and sends whatever alerts are due.
  async function tick(only?: number) {
    const due = [...trips].filter(([chatId]) => only === undefined || chatId === only);
    await Promise.all(due.map(([chatId, t]) => poll(chatId, t)));
  }

  // The trip as the web app and /status show it, plus the last check's error if it failed.
  function view(chatId: number) {
    const t = trips.get(chatId);
    return { trip: t ? tripView(t.trip, t.last) : null, error: t?.error ?? null };
  }

  // Stops alerts for this chat's trip. False if it had none.
  const cancel = (chatId: number) => trips.delete(chatId);

  return { start, tick, view, cancel };
}
