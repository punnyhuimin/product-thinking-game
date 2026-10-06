import { useEffect, useState } from "react";
import { TripDetails } from "./components/TripDetails";
import { TripForm } from "./components/TripForm";
import { loadTrip, saveTrip } from "./trip/api";
import { EMPTY_FORM } from "./trip/types";
import type { FieldErrors, FieldName, TripForm as TripFormValues, TripView } from "./trip/types";
import { validateTrip } from "./trip/validate";

type Status = { kind: "good" | "info" | "bad"; text: string } | null;

const OFFLINE: Status = { kind: "info", text: "The backend isn't running, so we can't plan routes or send alerts yet." };

export function App() {
  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>(null);
  const [trip, setTrip] = useState<TripView | null>(null);
  const [busy, setBusy] = useState(false);

  // Show the active trip on load. ?mock swaps in sample data for working without the backend.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (new URLSearchParams(window.location.search).has("mock")) {
        const { MOCK_TRIP } = await import("./trip/mock");
        if (!cancelled) setTrip(MOCK_TRIP);
        return;
      }
      const res = await loadTrip();
      if (cancelled) return;
      if (res.kind === "ok" && res.data.trip) setTrip(res.data.trip);
      else if (res.kind === "ok" && res.data.error) setStatus({ kind: "bad", text: `Couldn't load your trip: ${res.data.error}` });
      else if (res.kind === "error") setStatus({ kind: "bad", text: `Couldn't load your trip: ${res.message}` });
      else if (res.kind === "offline") setStatus(OFFLINE);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onChange = <K extends FieldName>(name: K, value: TripFormValues[K]) => {
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const onSubmit = async () => {
    const result = validateTrip(values);
    setErrors(result.errors);
    if (!result.payload) {
      const count = Object.keys(result.errors).length;
      setStatus({ kind: "bad", text: `Please fix ${count} ${count === 1 ? "field" : "fields"} below.` });
      // Focus after render so the field's error is already attached.
      const first = Object.keys(result.errors)[0];
      requestAnimationFrame(() => document.getElementById(first)?.focus());
      return;
    }
    setBusy(true);
    setStatus({ kind: "info", text: "Finding your route..." });
    const saved = await saveTrip(result.payload);
    setBusy(false);
    if (saved.kind === "ok") {
      setTrip(saved.data);
      setStatus({ kind: "good", text: "Trip saved. We'll text you on Telegram when it's time to leave." });
    } else {
      setStatus(saved.kind === "error" ? { kind: "bad", text: `Couldn't set up alerts: ${saved.message}` } : OFFLINE);
    }
  };

  const planAnother = () => {
    setTrip(null);
    setStatus(null);
  };

  return (
    <main className="app">
      <p className="kicker">Leave Alert</p>
      <h1>When should I leave?</h1>
      <p className="subtitle">Tell us where you're going and when you need to be there. We'll text you when to go.</p>
      <div aria-live="polite" role="status">
        {status && <p className={`feedback ${status.kind}`}>{status.text}</p>}
      </div>
      {trip ? (
        <TripDetails trip={trip} onPlanAnother={planAnother} />
      ) : (
        <TripForm values={values} errors={errors} busy={busy} onChange={onChange} onSubmit={onSubmit} />
      )}
    </main>
  );
}
