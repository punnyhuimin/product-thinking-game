import { toRoute, type Place, type RawItinerary, type Route } from "./route.ts";

const BASE = "https://www.onemap.gov.sg/api";

type SearchHit = { SEARCHVAL: string; ADDRESS: string; POSTAL: string; LATITUDE: string; LONGITUDE: string };

export async function search(q: string, token?: string): Promise<Place[]> {
  const url = `${BASE}/common/elastic/search?searchVal=${encodeURIComponent(q)}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;
  const res = await fetch(url, token ? { headers: { Authorization: token } } : {});
  if (!res.ok) throw new Error(`OneMap search ${res.status}`);
  const body = (await res.json()) as { results?: SearchHit[] };
  return (body.results ?? []).slice(0, 8).map((h) => ({
    label: titleCase(h.SEARCHVAL),
    address: h.ADDRESS,
    postal: h.POSTAL === "NIL" ? "" : h.POSTAL,
    lat: Number(h.LATITUDE),
    lng: Number(h.LONGITUDE),
  }));
}

const titleCase = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

// Tokens last 3 days; refresh an hour early.
let cached: { token: string; expiresAt: number } | null = null;

// The `exp` claim of a OneMap JWT, in ms; 0 if unreadable.
function jwtExpiry(token: string): number {
  try {
    return JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString()).exp * 1000;
  } catch {
    return 0;
  }
}

type Creds = { token?: string; email?: string; password?: string };

// Prefers a still-valid pasted token, else logs in with email + password.
export async function getToken({ token, email, password }: Creds): Promise<string> {
  if (cached && cached.expiresAt - Date.now() > 3_600_000) return cached.token;
  if (token && jwtExpiry(token) > Date.now()) {
    cached = { token, expiresAt: jwtExpiry(token) };
    return token;
  }
  if (!email || !password) {
    throw new Error(token ? "OneMap token expired: renew it or set ONEMAP_EMAIL/ONEMAP_PASSWORD" : "Set ONEMAP_TOKEN or ONEMAP_EMAIL/ONEMAP_PASSWORD in .env");
  }
  const res = await fetch(`${BASE}/auth/post/getToken`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = (await res.json()) as { access_token?: string; expiry_timestamp?: string; error?: string };
  if (!body.access_token) throw new Error(`OneMap login failed: ${body.error ?? res.status}`);
  cached = { token: body.access_token, expiresAt: Number(body.expiry_timestamp) * 1000 };
  return cached.token;
}

// Public-transport route departing at `departAt` (Singapore time). Picks the fastest itinerary.
export async function route(token: string, from: Place, to: Place, departAt: Date): Promise<Route> {
  const sg = new Date(departAt.getTime() + 8 * 3_600_000).toISOString(); // shift to SGT wall clock
  const date = `${sg.slice(5, 7)}-${sg.slice(8, 10)}-${sg.slice(0, 4)}`;
  const time = `${sg.slice(11, 19)}`;
  const qs = new URLSearchParams({
    start: `${from.lat},${from.lng}`,
    end: `${to.lat},${to.lng}`,
    routeType: "pt",
    date,
    time,
    mode: "TRANSIT",
    maxWalkDistance: "1000",
    numItineraries: "3",
  });
  const res = await fetch(`${BASE}/public/routingsvc/route?${qs}`, { headers: { Authorization: token } });
  const body = (await res.json()) as { plan?: { itineraries?: RawItinerary[] }; error?: string; message?: string };
  const its = body.plan?.itineraries ?? [];
  if (!its.length) throw new Error(`No public transport route found${body.error || body.message ? `: ${body.error ?? body.message}` : ""}`);
  const best = its.reduce((a, b) => (b.duration < a.duration ? b : a));
  return toRoute(best, from, to);
}
