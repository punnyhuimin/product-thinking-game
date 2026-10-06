import { useState } from "react";
import { Feedback } from "../components/Feedback";
import { ROUNDS, SLOTS } from "../data/p3";

/** Tap two sentences to swap them. Get every sentence into its C within the swap limit. */
export function P3Shuffle({ onWin }: { onWin: () => void }) {
  const [r, setR] = useState(0);
  const round = ROUNDS[r];
  const [order, setOrder] = useState<number[]>(round.start);
  const [sel, setSel] = useState<number | null>(null);
  const [swaps, setSwaps] = useState(0);

  const correct = order.every((v, i) => v === i);
  const out = swaps >= round.limit && !correct;

  const tap = (pos: number) => {
    if (correct || out) return;
    if (sel === null) { setSel(pos); return; }
    if (sel !== pos) {
      const o = [...order];
      [o[sel], o[pos]] = [o[pos], o[sel]];
      setOrder(o);
      setSwaps(swaps + 1);
    }
    setSel(null);
  };
  const reset = (k = r) => { setOrder(ROUNDS[k].start); setSel(null); setSwaps(0); };
  const next = () => {
    if (r + 1 >= ROUNDS.length) { onWin(); return; }
    setR(r + 1); reset(r + 1);
  };

  return (
    <div className="card">
      <p>{round.title}. The four sentences are in the wrong boxes. Tap two to swap them. Swaps: {swaps} / {round.limit}.</p>
      {order.map((v, pos) => (
        <div key={pos} className={`swap-row ${order[pos] === pos ? "ok" : ""}`}>
          <strong>{SLOTS[pos]}</strong>
          <button className={`swap-card ${sel === pos ? "sel" : ""}`} onClick={() => tap(pos)}>{round.items[v]}</button>
        </div>
      ))}
      {out && <Feedback good={false}>Out of swaps. Think about which two belong together before you tap.</Feedback>}
      {correct && <Feedback good>All four in place. Clarity says who and what, Consequence the stakes, Cause the why, Confirmation the evidence.</Feedback>}
      <p>
        {!correct && <button className="btn ghost" onClick={() => reset()}>Reset</button>}
        {correct && <button className="btn" onClick={next}>{r + 1 >= ROUNDS.length ? "Puzzle solved" : "Next statement"}</button>}
      </p>
    </div>
  );
}
