import { useState } from "react";
import { Feedback } from "../components/Feedback";
import { CAPACITY, FEATURES, NEED, WHO } from "../data/p6";

/** RedeemSG-style: three users, one first release. Get the essentials right for everyone. */
export function P6Tradeoffs({ onWin }: { onWin: () => void }) {
  const [sel, setSel] = useState<string[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const chosen = FEATURES.filter((f) => sel.includes(f.id));
  const cost = chosen.reduce((a, f) => a + f.cost, 0);
  const score = [0, 1, 2].map((i) => chosen.reduce((a, f) => a + f.gain[i], 0));
  const win = score.every((s) => s >= NEED);

  const toggle = (id: string) => {
    if (win) return;
    if (sel.includes(id)) { setSel(sel.filter((x) => x !== id)); setMsg(null); return; }
    const f = FEATURES.find((x) => x.id === id)!;
    if (cost + f.cost > CAPACITY) { setMsg(`Over capacity: ${cost + f.cost} of ${CAPACITY}. Drop something first.`); return; }
    const next = [...sel, id];
    setSel(next); setMsg(null);
    const sc = [0, 1, 2].map((i) => FEATURES.filter((x) => next.includes(x.id)).reduce((a, x) => a + x.gain[i], 0));
    if (sc.every((s) => s >= NEED)) onWin();
  };

  return (
    <div className="card">
      <p>Three users, one first release. Capacity {CAPACITY}. Every user needs at least {NEED} points of the essentials. “It couldn't make everyone equally happy, so make smart trade-offs.”</p>
      {WHO.map((w, i) => (
        <div key={w} className="bar-row meter">
          <span>{w}</span>
          <div className="bar"><div className={score[i] >= NEED ? "t" : ""} style={{ width: `${Math.min(100, (score[i] / NEED) * 100)}%` }} /></div>
          <b>{score[i]}/{NEED}</b>
        </div>
      ))}
      <div className="cost"><div style={{ width: `${(cost / CAPACITY) * 100}%` }} /></div>
      <small className="muted">Capacity used: {cost} / {CAPACITY}</small>
      {FEATURES.map((f) => (
        <button key={f.id} className={`choice ${sel.includes(f.id) ? "correct" : ""}`} onClick={() => toggle(f.id)}>
          <b>{f.cost}</b> · {f.text}
          <span className="gain"> {WHO.map((w, i) => f.gain[i] ? `${w[0]}+${f.gain[i]}` : "").filter(Boolean).join(" ")}</span>
        </button>
      ))}
      {msg && <Feedback good={false}>{msg}</Feedback>}
      {win && <Feedback good>Everyone has their essentials in {cost} of {CAPACITY}. Features that serve two users at once beat ones that serve a single user a lot. The rest goes on the roadmap.</Feedback>}
      {!win && sel.length > 0 && <button className="btn ghost" onClick={() => { setSel([]); setMsg(null); }}>Reset</button>}
    </div>
  );
}
