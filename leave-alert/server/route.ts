import { decodePolyline, type LatLng } from "./polyline.ts";

export type Place = { label: string; address: string; postal: string; lat: number; lng: number };

export type Leg = {
  mode: "WALK" | "BUS" | "SUBWAY" | "RAIL" | "TRAM";
  service: string | null;
  fromName: string;
  toName: string;
  fromStopCode: string | null;
  durationMin: number;
  path: LatLng[];
};

// waitMin is scheduled waiting across the trip (initial and transfers).
export type Route = { totalMin: number; walkMin: number; transitMin: number; waitMin: number; legs: Leg[] };

type RawStop = { name?: string; stopCode?: string };
type RawLeg = {
  mode: string;
  route?: string;
  routeShortName?: string;
  from: RawStop;
  to: RawStop;
  duration: number;
  legGeometry?: { points: string };
};
export type RawItinerary = { duration: number; walkTime: number; transitTime: number; waitingTime: number; legs: RawLeg[] };

const mins = (s: number) => Math.round(s / 60);
// OneMap stop names are upper case ("FARRER ROAD MRT STATION"); keep acronyms like MRT/INT.
const tidy = (s = "") => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\b(Mrt|Lrt|Int|Opp|Blk)\b/g, (w) => (w === "Opp" || w === "Blk" ? w : w.toUpperCase()));

// OneMap names the start and end of a trip "Origin"/"Destination"; swap in the user's places.
export function toRoute(it: RawItinerary, from: Place, to: Place): Route {
  const legs = it.legs.map((l, k): Leg => ({
    mode: (l.mode === "WALK" ? "WALK" : l.mode) as Leg["mode"],
    service: l.mode === "WALK" ? null : (l.routeShortName || l.route || null),
    fromName: k === 0 ? from.label : tidy(l.from.name),
    toName: k === it.legs.length - 1 ? to.label : tidy(l.to.name),
    fromStopCode: l.mode === "BUS" ? (l.from.stopCode ?? null) : null,
    durationMin: Math.max(1, mins(l.duration)),
    path: l.legGeometry ? decodePolyline(l.legGeometry.points) : [],
  }));
  return {
    totalMin: mins(it.duration),
    walkMin: mins(it.walkTime),
    transitMin: mins(it.transitTime),
    waitMin: mins(it.waitingTime),
    legs,
  };
}

export const firstTransit = (r: Route) => r.legs.find((l) => l.mode !== "WALK") ?? null;
