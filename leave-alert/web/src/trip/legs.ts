import type { Leg } from "./types";

export const WALK_COLOR = "#6b7280";
// Transit legs cycle through these; all read well on OneMap's light tiles.
const TRANSIT_COLORS = ["#1d4ed8", "#c2410c", "#7c3aed", "#047857"];

const MODE_NAMES: Record<Leg["mode"], string> = {
  WALK: "Walk",
  BUS: "Bus",
  SUBWAY: "MRT",
  RAIL: "Train",
  TRAM: "LRT",
};

// Color for each leg, in order; walks are grey, rides take the next palette color.
export function legColors(legs: Leg[]): string[] {
  let ride = 0;
  return legs.map((l) => (l.mode === "WALK" ? WALK_COLOR : TRANSIT_COLORS[ride++ % TRANSIT_COLORS.length]));
}

// One step line, e.g. "Walk 4 min to Opp Kings Ville (stop 41041)" or "Bus 61 · 12 min to ...".
export function describeLeg(leg: Leg, next?: Leg): string {
  if (leg.mode === "WALK") {
    const stop = next?.fromStopCode ? ` (stop ${next.fromStopCode})` : "";
    return `Walk ${leg.durationMin} min to ${leg.toName}${stop}`;
  }
  const name = [MODE_NAMES[leg.mode], leg.service].filter(Boolean).join(" ");
  return `${name} · ${leg.durationMin} min to ${leg.toName}`;
}
