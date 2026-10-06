import type { Place } from "./route.ts";

// Opens Google Maps with public-transport directions between the two picked points.
export function googleMapsUrl(from: Place, to: Place): string {
  const qs = new URLSearchParams({
    api: "1",
    origin: `${from.lat},${from.lng}`,
    destination: `${to.lat},${to.lng}`,
    travelmode: "transit",
  });
  return `https://www.google.com/maps/dir/?${qs}`;
}
