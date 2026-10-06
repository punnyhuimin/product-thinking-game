import { computeLeaveTime, type LeavePlan } from "./leaveTime.ts";
import { busWaitMin } from "./lta.ts";
import { firstTransit, type Place, type Route } from "./route.ts";
import { fetchRainNear } from "./weather.ts";
import type { Context } from "./alerts.ts";

// Matches the POST /api/trip payload from web/.
export type Trip = { from: Place; to: Place; arriveBy: string; bufferMin: number };
export type ActiveTrip = Trip & { route: Route };

function parsePlace(p: unknown, name: string): Place {
  const x = p as Place;
  const ok = typeof x?.label === "string" && x.label.trim() && Number.isFinite(x.lat) && Number.isFinite(x.lng);
  if (!ok) throw new Error(`Pick a ${name} address from the suggestions`);
  return { label: x.label, address: String(x.address ?? ""), postal: String(x.postal ?? ""), lat: x.lat, lng: x.lng };
}

export function parseTrip(body: unknown): Trip {
  const t = body as Trip;
  const arrive = Date.parse(t?.arriveBy);
  if (Number.isNaN(arrive)) throw new Error("arriveBy must be a date-time");
  if (arrive <= Date.now()) throw new Error("Arrive-by time has already passed");
  if (typeof t.bufferMin !== "number" || t.bufferMin < 0) throw new Error("bufferMin must be a non-negative number");
  return { from: parsePlace(t.from, "starting"), to: parsePlace(t.to, "destination"), arriveBy: t.arriveBy, bufferMin: t.bufferMin };
}

export type Snapshot = { plan: LeavePlan; context: Context; checkedAt: number };

// One live check: bus wait at the first stop + rain at the origin, folded into a leave time.
export async function checkTrip(trip: ActiveTrip, ltaKey: string, now = new Date()): Promise<Snapshot> {
  const { route } = trip;
  const first = firstTransit(route);
  const bus = first?.mode === "BUS" && first.fromStopCode && first.service ? first : null;
  const [live, rain] = await Promise.all([
    bus ? busWaitMin(ltaKey, bus.fromStopCode!, bus.service!, now).catch(() => null) : Promise.resolve(null),
    fetchRainNear(trip.from.lat, trip.from.lng).catch(() => ({ raining: false, forecast: "Unavailable", rainMm: 0 })),
  ]);
  // Live wait replaces the scheduled first wait; multi-leg trips keep scheduled transfer waits.
  const transitLegs = route.legs.filter((l) => l.mode !== "WALK").length;
  const wait = live === null ? route.waitMin : live + (transitLegs > 1 ? route.waitMin : 0);
  const plan = computeLeaveTime({
    arriveBy: new Date(trip.arriveBy),
    bufferMin: trip.bufferMin,
    walkToStopMin: route.walkMin,
    busWaitMin: wait,
    rideMin: route.transitMin,
    walkFromStopMin: 0,
    raining: rain.raining,
  });
  const context = {
    toLabel: trip.to.label,
    serviceNo: first?.service ?? "",
    busWaitMin: live,
    forecast: rain.forecast,
    umbrella: plan.umbrella,
  };
  return { plan, context, checkedAt: now.getTime() };
}

export function tripView(trip: ActiveTrip, s: Snapshot) {
  return {
    ok: true as const,
    from: trip.from,
    to: trip.to,
    arriveBy: trip.arriveBy,
    bufferMin: trip.bufferMin,
    leaveAt: s.plan.leaveAt.toISOString(),
    route: trip.route,
    live: { busWaitMin: s.context.busWaitMin, forecast: s.context.forecast, umbrella: s.context.umbrella },
  };
}
