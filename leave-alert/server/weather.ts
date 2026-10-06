const BASE = "https://api-open.data.gov.sg/v2/real-time/api";

type LatLng = { latitude: number; longitude: number };
type Forecast = {
  area_metadata: { name: string; label_location: LatLng }[];
  items: { forecasts: { area: string; forecast: string }[] }[];
};
type Rainfall = {
  stations: { id: string; location: LatLng }[];
  readings: { data: { stationId: string; value: number }[] }[];
};

export type RainReport = { raining: boolean; forecast: string; rainMm: number };

// NEA forecast text for wet weather: "Showers", "Light Rain", "Thundery Showers", etc.
export function forecastIsWet(text: string): boolean {
  return /rain|shower|thunder|drizzle/i.test(text);
}

// Flat-earth distance is fine at Singapore's scale; we only need the closest gauge.
function nearest<T extends { location: LatLng }>(items: T[], p: LatLng): T | undefined {
  const d = (a: LatLng) => (a.latitude - p.latitude) ** 2 + (a.longitude - p.longitude) ** 2;
  return items.reduce<T | undefined>((best, s) => (!best || d(s.location) < d(best.location) ? s : best), undefined);
}

export function rainReport(area: string, f: Forecast, r: Rainfall): RainReport {
  const meta = f.area_metadata.find((a) => a.name.toLowerCase() === area.toLowerCase());
  if (!meta) throw new Error(`Unknown forecast area: ${area}`);
  const forecast = f.items[0]?.forecasts.find((x) => x.area === meta.name)?.forecast ?? "Unknown";
  const station = nearest(r.stations, meta.label_location);
  const rainMm = r.readings[0]?.data.find((x) => x.stationId === station?.id)?.value ?? 0;
  return { raining: forecastIsWet(forecast) || rainMm > 0, forecast, rainMm };
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}/${path}`);
  if (!res.ok) throw new Error(`data.gov.sg ${path} ${res.status}`);
  return ((await res.json()) as { data: T }).data;
}

export async function fetchRain(area: string): Promise<RainReport> {
  const [f, r] = await Promise.all([get<Forecast>("two-hr-forecast"), get<Rainfall>("rainfall")]);
  return rainReport(area, f, r);
}

// The forecast area whose label point is closest to a location, e.g. a trip's origin.
export function nearestArea(f: Forecast, p: LatLng): string {
  const areas = f.area_metadata.map((a) => ({ name: a.name, location: a.label_location }));
  const hit = nearest(areas, p);
  if (!hit) throw new Error("No forecast areas");
  return hit.name;
}

export async function fetchRainNear(lat: number, lng: number): Promise<RainReport & { area: string }> {
  const [f, r] = await Promise.all([get<Forecast>("two-hr-forecast"), get<Rainfall>("rainfall")]);
  const area = nearestArea(f, { latitude: lat, longitude: lng });
  return { ...rainReport(area, f, r), area };
}

export async function forecastAreas(): Promise<string[]> {
  return (await get<Forecast>("two-hr-forecast")).area_metadata.map((a) => a.name);
}

type Region = "north" | "south" | "east" | "west" | "central";
export type Forecast24 = {
  records: {
    periods: { timePeriod: { start: string; end: string }; regions: Record<Region, { text: string }> }[];
  }[];
};
type TwoHrFeed = Forecast & { items: { valid_period?: { start: string; end: string } }[] };

export type ForecastSource = "two-hour" | "24-hour" | "none" | "unavailable";
export type LeaveForecast = { forecast: string; wet: boolean; area: string | null; source: ForecastSource };

// Rough centre of each 24-hour forecast region.
const REGIONS: { name: Region; location: LatLng }[] = [
  { name: "north", location: { latitude: 1.418, longitude: 103.82 } },
  { name: "south", location: { latitude: 1.27, longitude: 103.82 } },
  { name: "east", location: { latitude: 1.335, longitude: 103.96 } },
  { name: "west", location: { latitude: 1.34, longitude: 103.7 } },
  { name: "central", location: { latitude: 1.35, longitude: 103.82 } },
];

export function nearestRegion(p: LatLng): Region {
  return nearest(REGIONS, p)!.name;
}

// The period containing a time (start inclusive, end exclusive), for the region nearest a point.
export function forecast24At(f: Forecast24, ms: number, p: LatLng): { text: string; region: Region } | null {
  const region = nearestRegion(p);
  for (const rec of f.records) {
    for (const per of rec.periods) {
      if (ms >= Date.parse(per.timePeriod.start) && ms < Date.parse(per.timePeriod.end)) {
        return { text: per.regions[region].text, region };
      }
    }
  }
  return null;
}

// Which forecast covers a leave time. Each feed is null when its fetch failed.
export function forecastForLeaveTime(
  ms: number,
  p: LatLng,
  twoHr: { f: TwoHrFeed; r: Rainfall | null } | null,
  day: Forecast24 | null,
): LeaveForecast {
  const win = twoHr?.f.items[0]?.valid_period;
  if (twoHr && win && ms >= Date.parse(win.start) && ms < Date.parse(win.end)) {
    const area = nearestArea(twoHr.f, p);
    const rain = rainReport(area, twoHr.f, twoHr.r ?? { stations: [], readings: [] });
    return { forecast: rain.forecast, wet: rain.raining, area, source: "two-hour" };
  }
  const hit = day && forecast24At(day, ms, p);
  if (hit) return { forecast: hit.text, wet: forecastIsWet(hit.text), area: hit.region, source: "24-hour" };
  // Both feeds answered but neither reaches the leave time: not out yet. Otherwise a feed is missing.
  return twoHr && day
    ? { forecast: "Forecast not out yet", wet: false, area: null, source: "none" }
    : { forecast: "Forecast unavailable", wet: false, area: null, source: "unavailable" };
}

export async function fetchLeaveForecast(ms: number, lat: number, lng: number): Promise<LeaveForecast> {
  const [f, r, day] = await Promise.all([
    get<TwoHrFeed>("two-hr-forecast").catch(() => null),
    get<Rainfall>("rainfall").catch(() => null),
    get<Forecast24>("twenty-four-hr-forecast").catch(() => null),
  ]);
  return forecastForLeaveTime(ms, { latitude: lat, longitude: lng }, f && { f, r }, day);
}
