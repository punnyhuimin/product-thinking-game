import { toSgIso } from "./time";
import type { FieldErrors, TripForm, TripPayload } from "./types";

type Result = { errors: FieldErrors; payload?: TripPayload };

export function validateTrip(f: TripForm, now = new Date()): Result {
  const errors: FieldErrors = {};
  if (!f.from) errors.from = "Search for your starting point and pick it from the list.";
  if (!f.to) errors.to = "Search for your destination and pick it from the list.";
  if (f.from && f.to && f.from.lat === f.to.lat && f.from.lng === f.to.lng) {
    errors.to = "Your destination is the same as your starting point.";
  }

  let arriveBy = "";
  if (!f.arriveTime) {
    errors.arriveTime = "Choose the time you need to arrive.";
  } else {
    arriveBy = toSgIso(f.arriveTime, now);
    if (new Date(arriveBy).getTime() <= now.getTime()) {
      errors.arriveTime = "That time has already passed today. Pick a later time.";
    }
  }

  const buffer = Number(f.bufferMin);
  if (f.bufferMin.trim() === "") errors.bufferMin = "Safety buffer needs a number of minutes.";
  else if (!Number.isFinite(buffer)) errors.bufferMin = "Safety buffer must be a number.";
  else if (buffer < 0) errors.bufferMin = "Safety buffer can't be negative.";

  if (Object.keys(errors).length > 0 || !f.from || !f.to) return { errors };
  return { errors, payload: { from: f.from, to: f.to, arriveBy, bufferMin: buffer } };
}
