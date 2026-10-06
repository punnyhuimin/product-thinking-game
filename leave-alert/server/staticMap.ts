import { thin, type LatLng } from "./polyline.ts";
import type { Place, Route } from "./route.ts";

const SIZE = 512; // OneMap's static map maximum
const WALK = "120,120,120";
const TRANSIT = "0,90,200";

// Zoom where the route's span fits the image with some margin (256px tiles).
function fitZoom(points: LatLng[]): number {
  const lats = points.map((p) => p[0]);
  const lngs = points.map((p) => p[1]);
  const span = Math.max(Math.max(...lats) - Math.min(...lats), Math.max(...lngs) - Math.min(...lngs), 0.002);
  const z = Math.floor(Math.log2((360 * SIZE) / 256 / (span * 1.3)));
  return Math.min(18, Math.max(11, z));
}

const fmt = (p: LatLng) => `[${p[0].toFixed(5)},${p[1].toFixed(5)}]`;

export function staticMapUrl(route: Route, from: Place, to: Place): string {
  const ends: LatLng[] = [[from.lat, from.lng], [to.lat, to.lng]];
  const all = [...ends, ...route.legs.flatMap((l) => l.path)];
  const lats = all.map((p) => p[0]);
  const lngs = all.map((p) => p[1]);
  // Spread a budget of ~120 points across legs to keep the URL short.
  const perLeg = Math.max(2, Math.floor(120 / Math.max(1, route.legs.length)));
  const lines = route.legs
    .filter((l) => l.path.length > 1)
    .map((l) => `[${thin(l.path, perLeg).map(fmt).join(",")}]:${l.mode === "WALK" ? WALK : TRANSIT}:${l.mode === "WALK" ? 3 : 5}`)
    .join("|");
  const points = `[${from.lat},${from.lng},"0,150,0","A"]|[${to.lat},${to.lng},"200,0,0","B"]`;
  const qs = [
    "layerchosen=default",
    `lat=${((Math.max(...lats) + Math.min(...lats)) / 2).toFixed(5)}`,
    `lng=${((Math.max(...lngs) + Math.min(...lngs)) / 2).toFixed(5)}`,
    `zoom=${fitZoom(all)}`,
    `width=${SIZE}`,
    `height=${SIZE}`,
    lines && `lines=${encodeURIComponent(lines)}`,
    `points=${encodeURIComponent(points)}`,
  ].filter(Boolean);
  return `https://www.onemap.gov.sg/api/staticmap/getStaticImage?${qs.join("&")}`;
}
