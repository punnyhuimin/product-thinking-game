import { describeLeg, legColors } from "../trip/legs";
import { formatSgTime } from "../trip/time";
import type { TripView } from "../trip/types";
import { RouteMap } from "./RouteMap";

type Props = { trip: TripView; onPlanAnother: () => void };

function liveLine({ busWaitMin, forecast, umbrella }: TripView["live"]): string {
  const parts: string[] = [];
  if (busWaitMin !== null) parts.push(busWaitMin <= 0 ? "Bus arriving now" : `Next bus in ${busWaitMin} min`);
  if (forecast) parts.push(`Forecast: ${forecast}`);
  if (umbrella) parts.push("Bring an umbrella");
  return parts.join(" · ");
}

// The saved trip: when to leave, live conditions, map and steps.
export function TripDetails({ trip, onPlanAnother }: Props) {
  const { route } = trip;
  const colors = legColors(route.legs);
  const live = liveLine(trip.live);

  return (
    <section className="trip" aria-labelledby="trip-title">
      <div className="card">
        <p className="kicker">Your trip</p>
        <h2 id="trip-title" className="leave-at">Leave at {formatSgTime(new Date(trip.leaveAt))}</h2>
        <p className="arrive">
          to arrive at {trip.to.label} by {formatSgTime(new Date(trip.arriveBy))}
        </p>
        {live && <p className="live">{live}</p>}
      </div>

      <RouteMap from={trip.from} to={trip.to} route={route} />

      <div className="card">
        <p className="total">
          {route.totalMin} min total · {route.walkMin} min walking · {trip.bufferMin} min buffer
        </p>
        <ol className="steps">
          <li>
            <span className="swatch start" aria-hidden="true" />
            Start at {trip.from.label}
          </li>
          {route.legs.map((leg, i) => (
            <li key={i}>
              <span
                className={`swatch ${leg.mode === "WALK" ? "walk" : ""}`}
                style={{ borderColor: colors[i] }}
                aria-hidden="true"
              />
              {describeLeg(leg, route.legs[i + 1])}
            </li>
          ))}
        </ol>
      </div>

      <button className="btn secondary" type="button" onClick={onPlanAnother}>
        Plan another trip
      </button>
    </section>
  );
}
