import type { FormEvent } from "react";
import type { FieldErrors, FieldName, TripForm as TripFormValues } from "../trip/types";
import { Field } from "./Field";
import { PlaceSearch } from "./PlaceSearch";

type Props = {
  values: TripFormValues;
  errors: FieldErrors;
  busy: boolean;
  onChange: <K extends FieldName>(name: K, value: TripFormValues[K]) => void;
  onSubmit: () => void;
};

const SEARCH_HINT = "Type an address, place or postal code, then pick a match.";

export function TripForm({ values, errors, busy, onChange, onSubmit }: Props) {
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={submit} noValidate>
      <fieldset className="card">
        <legend>Your journey</legend>
        <Field id="from" label="From" hint={values.from?.address ?? SEARCH_HINT} error={errors.from}>
          {(c) => (
            <PlaceSearch control={c} value={values.from} placeholder="e.g. 266439" onPick={(p) => onChange("from", p)} />
          )}
        </Field>
        <Field id="to" label="To" hint={values.to?.address ?? SEARCH_HINT} error={errors.to}>
          {(c) => (
            <PlaceSearch control={c} value={values.to} placeholder="e.g. Hwa Chong Institution" onPick={(p) => onChange("to", p)} />
          )}
        </Field>
      </fieldset>

      <fieldset className="card">
        <legend>Timing</legend>
        <div className="grid-2">
          <Field id="arriveTime" label="Arrive by (today)" error={errors.arriveTime}>
            {(c) => (
              <input {...c} name="arriveTime" type="time" value={values.arriveTime} onChange={(e) => onChange("arriveTime", e.target.value)} />
            )}
          </Field>
          <Field id="bufferMin" label="Safety buffer (min)" error={errors.bufferMin}>
            {(c) => (
              <input
                {...c}
                name="bufferMin"
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                value={values.bufferMin}
                onChange={(e) => onChange("bufferMin", e.target.value)}
              />
            )}
          </Field>
        </div>
      </fieldset>

      <button className="btn" type="submit" disabled={busy}>
        {busy ? "Finding your route..." : "Save trip"}
      </button>
    </form>
  );
}
