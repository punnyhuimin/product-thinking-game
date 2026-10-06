import { computeLeaveTime, type LeavePlan } from "./leaveTime.ts";
import { busWaitMin } from "./lta.ts";
import { firstTransit, type Place, type Route } from "./route.ts";
import { fetchLeaveForecast, type LeaveForecast } from "./weather.ts";
import { googleMapsUrl } from "./googleMaps.ts";
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
  const live = bus ? await busWaitMin(ltaKey, bus.fromStopCode!, bus.service!, now).catch(() => null) : null;
  // Live wait replaces the scheduled first wait; multi-leg trips keep scheduled transfer waits.
  const transitLegs = route.legs.filter((l) => l.mode !== "WALK").length;
  const wait = live === null ? route.waitMin : live + (transitLegs > 1 ? route.waitMin : 0);
  const inputs = {
    arriveBy: new Date(trip.arriveBy),
    bufferMin: trip.bufferMin,
    walkToStopMin: route.walkMin,
    busWaitMin: wait,
    rideMin: route.transitMin,
    walkFromStopMin: 0,
  };
  // The forecast depends on the leave time and the leave time on the forecast. Look the forecast up for the
  // dry leave time, then recompute with rain if it's wet; the wet (earlier) time is the one we report.
  const dry = computeLeaveTime({ ...inputs, raining: false });
  const fc = await fetchLeaveForecast(dry.leaveAt.getTime(), trip.from.lat, trip.from.lng).catch(
    (): LeaveForecast => ({ forecast: "Forecast unavailable", wet: false, area: null, source: "unavailable" }),
  );
  const plan = fc.wet ? computeLeaveTime({ ...inputs, raining: true }) : dry;
  const context = {
    toLabel: trip.to.label,
    serviceNo: first?.service ?? "",
    busWaitMin: live,
    forecast: fc.forecast,
    forecastAt: plan.leaveAt.getTime(),
    forecastArea: fc.area,
    forecastSource: fc.source,
    umbrella: plan.umbrella,
    mapsUrl: googleMapsUrl(trip.from, trip.to),
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
    live: {
      busWaitMin: s.context.busWaitMin,
      forecast: s.context.forecast,
      forecastAt: new Date(s.context.forecastAt).toISOString(),
      forecastArea: s.context.forecastArea,
      forecastSource: s.context.forecastSource,
      umbrella: s.context.umbrella,
    },
  };
}
