import { useState } from "react";
import { Feedback } from "../components/Feedback";
import { ASSUMPTIONS, BUDGET, TESTS } from "../data/p5";

const TOTAL = ASSUMPTIONS.reduce((a, x) => a + x.risk, 0);

/** Pick experiments within the budget so every risky assumption is tested. */
export function P5Planner({ onWin }: { onWin: () => void }) {
  const [sel, setSel] = useState<string[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const chosen = TESTS.filter((t) => sel.includes(t.id));
  const cost = chosen.reduce((a, t) => a + t.cost, 0);
  const covered = new Set(chosen.flatMap((t) => t.covers));
  const risk = ASSUMPTIONS.filter((a) => covered.has(a.id)).reduce((s, a) => s + a.risk, 0);
  const full = risk === TOTAL;

  const toggle = (id: string) => {
    if (full) return;
    if (sel.includes(id)) { setSel(sel.filter((x) => x !== id)); setMsg(null); return; }
    const t = TESTS.find((x) => x.id === id)!;
    if (cost + t.cost > BUDGET) { setMsg(`That would cost ${cost + t.cost} weeks. Your budget is ${BUDGET}.`); return; }
    const next = [...sel, id];
    setSel(next); setMsg(t.note);
    const cov = new Set(TESTS.filter((x) => next.includes(x.id)).flatMap((x) => x.covers));
    if (ASSUMPTIONS.every((a) => cov.has(a.id))) onWin();
  };

  return (
    <div className="card">
      <p>You have <strong>{BUDGET} weeks</strong>. Test every assumption you can, starting with the risky ones. “Identify the biggest risk early and find the lowest cost way to test it.”</p>
      {ASSUMPTIONS.map((a) => (
        <div key={a.id} className={`assume ${covered.has(a.id) ? "ok" : ""}`}>
          <span><b>{a.kind}</b> · {a.text}</span>
          <span className="pts">{covered.has(a.id) ? "tested ✓" : `risk ${a.risk}`}</span>
        </div>
      ))}
      <div className="cost"><div style={{ width: `${(cost / BUDGET) * 100}%` }} /></div>
      <small className="muted">Weeks used: {cost} / {BUDGET} · Risk covered: {risk} / {TOTAL}</small>
      {TESTS.map((t) => (
        <button key={t.id} className={`choice ${sel.includes(t.id) ? "correct" : ""}`} onClick={() => toggle(t.id)}>
          <b>{t.cost} wk</b> · {t.text}
        </button>
      ))}
      {msg && <Feedback good={!msg.startsWith("That would")}>{msg}</Feedback>}
      {full && <Feedback good>Every assumption tested in {cost} weeks. The cheapest way to learn about the biggest risk came first.</Feedback>}
      {!full && sel.length > 0 && <button className="btn ghost" onClick={() => { setSel([]); setMsg(null); }}>Reset</button>}
    </div>
  );
}
