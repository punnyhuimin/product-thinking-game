export const HEADS_UP_MIN = 10;
export const SHIFT_MIN = 3;

export type AlertKind = "headsUp" | "update" | "go";

// What we've already told the user for this trip.
export type Sent = { headsUpLeaveAt?: number; go?: boolean };

// Decide which alert (if any) to send now. Pure so the rules are easy to test.
export function nextAlert(sent: Sent, leaveAt: number, now: number): AlertKind | null {
  if (sent.go) return null;
  const minsLeft = (leaveAt - now) / 60_000;
  if (minsLeft <= 0) return "go";
  if (sent.headsUpLeaveAt === undefined) return minsLeft <= HEADS_UP_MIN ? "headsUp" : null;
  return Math.abs(leaveAt - sent.headsUpLeaveAt) >= SHIFT_MIN * 60_000 ? "update" : null;
}

export function record(sent: Sent, kind: AlertKind, leaveAt: number): Sent {
  return kind === "go" ? { ...sent, go: true } : { ...sent, headsUpLeaveAt: leaveAt };
}

export type Context = {
  toLabel: string;
  serviceNo: string;
  busWaitMin: number | null;
  forecast: string;
  umbrella: boolean;
  mapsUrl: string;
};

export const hhmm = (ms: number) =>
  new Date(ms).toLocaleTimeString("en-SG", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Singapore" });

export function formatAlert(kind: AlertKind, leaveAt: number, now: number, c: Context): string {
  const mins = Math.max(0, Math.round((leaveAt - now) / 60_000));
  const head = {
    go: `Leave now for ${c.toLabel}.`,
    headsUp: `Leave in ${mins} min (${hhmm(leaveAt)}) for ${c.toLabel}.`,
    update: `Change of plan: leave at ${hhmm(leaveAt)} (in ${mins} min) for ${c.toLabel}.`,
  }[kind];
  const bus = c.busWaitMin === null ? `No live arrival for bus ${c.serviceNo}.` : `Bus ${c.serviceNo} in ${c.busWaitMin} min.`;
  const rain = c.umbrella ? `Weather: ${c.forecast}. Bring an umbrella.` : `Weather: ${c.forecast}.`;
  return [head, bus, rain, `Route: ${c.mapsUrl}`].join("\n");
}
