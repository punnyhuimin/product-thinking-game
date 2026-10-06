import { useEffect, useRef } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { legColors } from "../trip/legs";
import type { Place, Route } from "../trip/types";

const TILES = "https://www.onemap.gov.sg/maps/tiles/Default/{z}/{x}/{y}.png";
const SG_BOUNDS = L.latLngBounds([1.144, 103.535], [1.494, 104.1]);
const ATTRIBUTION =
  '<img src="https://www.onemap.gov.sg/web-assets/images/logo/om_logo.png" style="height:20px;width:20px;"/>&nbsp;<a href="https://www.onemap.gov.sg/" target="_blank" rel="noopener noreferrer">OneMap</a>&nbsp;&copy;&nbsp;contributors&nbsp;&#124;&nbsp;<a href="https://www.sla.gov.sg/" target="_blank" rel="noopener noreferrer">Singapore Land Authority</a>';

type Props = { from: Place; to: Place; route: Route };

// Plain Leaflet map of the route; rebuilt whenever the trip changes.
export function RouteMap({ from, to, route }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const map = L.map(ref.current, { minZoom: 11, maxZoom: 19, maxBounds: SG_BOUNDS, maxBoundsViscosity: 1 });
    L.tileLayer(TILES, { minZoom: 11, maxZoom: 19, detectRetina: true, attribution: ATTRIBUTION }).addTo(map);

    const colors = legColors(route.legs);
    const bounds = L.latLngBounds([from.lat, from.lng], [to.lat, to.lng]);
    route.legs.forEach((leg, i) => {
      if (leg.path.length < 2) return;
      const walk = leg.mode === "WALK";
      L.polyline(leg.path, {
        color: colors[i],
        weight: walk ? 4 : 6,
        opacity: 0.9,
        dashArray: walk ? "2 8" : undefined,
        lineCap: "round",
      }).addTo(map);
      leg.path.forEach((p) => bounds.extend(p));
    });

    const pin = (p: Place, fill: string) =>
      L.circleMarker([p.lat, p.lng], { radius: 8, color: "#1f1d1a", weight: 2, fillColor: fill, fillOpacity: 1 })
        .bindTooltip(p.label)
        .addTo(map);
    pin(from, "#ffffff");
    pin(to, "#9a3b1f");

    map.fitBounds(bounds, { padding: [28, 28], maxZoom: 17 });
    return () => {
      map.remove();
    };
  }, [from, to, route]);

  return (
    <div
      ref={ref}
      className="route-map"
      role="region"
      aria-label={`Map of the route from ${from.label} to ${to.label}`}
    />
  );
}
