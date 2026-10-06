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
