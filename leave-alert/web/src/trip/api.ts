import type { Place, TripPayload, TripView } from "./types";

// "offline": no backend answered. "error": backend answered but refused, with its reason.
export type ApiResult<T> = { kind: "ok"; data: T } | { kind: "offline" } | { kind: "error"; message: string };

// Empty in dev (Vite proxies /api); the deployed backend's origin in production builds.
const API_BASE = (import.meta.env.VITE_API_BASE ?? "").replace(/\/$/, "");

async function request<T>(url: string, init?: RequestInit): Promise<ApiResult<T>> {
  let res: Response;
  try {
    res = await fetch(API_BASE + url, init);
  } catch {
    return { kind: "offline" };
  }
  const body = (await res.json().catch(() => null)) as (T & { error?: string }) | null;
  if (res.ok && body) return { kind: "ok", data: body };
  // The Vite proxy answers 5xx with no JSON when the backend is down.
  return !res.ok && body?.error ? { kind: "error", message: body.error } : { kind: "offline" };
}

export async function searchPlaces(q: string, signal?: AbortSignal): Promise<ApiResult<Place[]>> {
  const res = await request<{ results: Place[] }>(`/api/search?q=${encodeURIComponent(q)}`, { signal });
  return res.kind === "ok" ? { kind: "ok", data: res.data.results ?? [] } : res;
}

// Guards against an older backend whose trips have no route yet.
function isTripView(t: unknown): t is TripView {
  const v = t as TripView | null;
  return Boolean(v?.from && v.to && v.leaveAt && Array.isArray(v.route?.legs) && v.live);
}

export async function saveTrip(payload: TripPayload): Promise<ApiResult<TripView>> {
  const res = await request<TripView>("/api/trip", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (res.kind !== "ok" || isTripView(res.data)) return res;
  return { kind: "error", message: "the backend sent a trip without a route." };
}

export async function loadTrip(): Promise<ApiResult<{ trip: TripView | null; error: string | null }>> {
  const res = await request<{ trip: unknown; error: string | null }>("/api/trip");
  if (res.kind !== "ok") return res;
  return { kind: "ok", data: { trip: isTripView(res.data.trip) ? res.data.trip : null, error: res.data.error ?? null } };
}
