// Shapes shared with the backend (see server API contract).
export type Place = { label: string; address: string; postal: string; lat: number; lng: number };

export type LegMode = "WALK" | "BUS" | "SUBWAY" | "RAIL" | "TRAM";

export type Leg = {
  mode: LegMode;
  service: string | null; // bus number or MRT line, null for walk
  fromName: string;
  toName: string;
  fromStopCode: string | null; // bus stop code for bus legs
  durationMin: number;
  path: [number, number][]; // [lat, lng] points
};

export type Route = { totalMin: number; walkMin: number; transitMin: number; legs: Leg[] };

export type TripView = {
  ok: true;
  from: Place;
  to: Place;
  arriveBy: string;
  bufferMin: number;
  leaveAt: string; // ISO
  route: Route;
  live: { busWaitMin: number | null; forecast: string; umbrella: boolean };
};

// Body sent to POST /api/trip.
export type TripPayload = { from: Place; to: Place; arriveBy: string; bufferMin: number };

// Raw form values; buffer stays a string so the field can be cleared while typing.
export type TripForm = {
  from: Place | null;
  to: Place | null;
  arriveTime: string; // "HH:MM" from <input type="time">
  bufferMin: string;
};

export type FieldName = keyof TripForm;
export type FieldErrors = Partial<Record<FieldName, string>>;

export const EMPTY_FORM: TripForm = { from: null, to: null, arriveTime: "", bufferMin: "10" };
