const SG_TZ = "Asia/Singapore";

// Today's date in Singapore as YYYY-MM-DD, regardless of the browser's zone.
export function sgToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: SG_TZ }).format(now);
}

// "07:45" -> "2026-10-06T07:45:00+08:00"
export function toSgIso(time: string, now = new Date()): string {
  return `${sgToday(now)}T${time}:00+08:00`;
}

// Formats an instant as HH:MM in Singapore time.
export function formatSgTime(d: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: SG_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}
