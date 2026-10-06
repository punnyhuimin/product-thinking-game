import { useState } from "react";
import { Feedback } from "../components/Feedback";
import { LETTERS, SCENARIO, SLOTS } from "../data/p4";

/** Assemble a metric, press Test, and see which SMART properties fail. */
export function P4Builder({ onWin }: { onWin: () => void }) {
  const [pick, setPick] = useState<(number | null)[]>([null, null, null]);
  const [result, setResult] = useState<Record<string, boolean> | null>(null);
  const [tests, setTests] = useState(0);
  const ready = pick.every((p) => p !== null);

  const choose = (slot: number, k: number) => {
    const p = [...pick]; p[slot] = k; setPick(p); setResult(null);
  };
  const test = () => {
    const pieces = pick.map((k, s) => SLOTS[s].pieces[k!]);
    const get = (key: string) => pieces.map((p) => (p.flags as Record<string, boolean | undefined>)[key]);
    const r: Record<string, boolean> = {};
    for (const l of LETTERS) r[l.key] = get(l.key).every((v) => v !== false);
    setResult(r);
    setTests(tests + 1);
    if (Object.values(r).every(Boolean)) onWin();
  };
  const pass = result && Object.values(result).every(Boolean);

  return (
    <div className="card">
      <p>{SCENARIO}</p>
      {SLOTS.map((slot, s) => (
        <div key={slot.name}>
          <p className="kicker">{slot.name}</p>
          <div className="pieces">
            {slot.pieces.map((p, k) => (
              <button key={p.label} className={`piece ${pick[s] === k ? "on" : ""}`} onClick={() => choose(s, k)}>{p.label}</button>
            ))}
          </div>
        </div>
      ))}
      <p className="metric-line">
        {ready ? <>“<strong>{SLOTS[0].pieces[pick[0]!].label}</strong> {SLOTS[1].pieces[pick[1]!].label}, {SLOTS[2].pieces[pick[2]!].label}.”</> : "Choose one piece in each slot."}
      </p>
      <button className="btn" disabled={!ready || !!pass} onClick={test}>Test against SMART</button>
      {result && (
        <div className="smart">
          {LETTERS.map((l) => (
            <span key={l.key} className={`lt ${result[l.key] ? "ok" : "no"}`} title={l.name}>{l.letter}<small>{result[l.key] ? "✓" : "✗"}</small></span>
          ))}
        </div>
      )}
      {result && !pass && <Feedback good={false}>Some properties fail. Change a piece and test again. Tests so far: {tests}.</Feedback>}
      {pass && <Feedback good>All five pass in {tests} test{tests > 1 ? "s" : ""}. Measurable, relevant to the problem, ambitious yet grounded, and anchored to the review date.</Feedback>}
    </div>
  );
}
