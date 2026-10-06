import { useState } from "react";
import { Feedback } from "../components/Feedback";
import { REQUESTS } from "../data/p1";

/** Tap the words that smuggle a solution into the request. Some requests are already clean. */
export function P1Strip({ onMistake, onWin }: { onMistake: () => void; onWin: () => void }) {
  const [i, setI] = useState(0);
  const [found, setFound] = useState<number[]>([]);
  const [msg, setMsg] = useState<{ good: boolean; text: string } | null>(null);
  const r = REQUESTS[i];
  const total = r.chunks.filter((c) => c.sol).length;
  const done = r.clean ? found.length === 1 : found.length === total;

  const tap = (k: number) => {
    if (done || found.includes(k)) return;
    if (r.chunks[k].sol) {
      setFound([...found, k]);
      setMsg({ good: true, text: "A solution: a tool someone already wants, not a problem." });
    } else {
      setMsg({ good: false, text: "That part describes the people or the need. Look for the tool or feature." });
      onMistake();
    }
  };
  const nothing = () => {
    if (done) return;
    if (r.clean) { setFound([0]); setMsg({ good: true, text: "Right, nothing to strip." }); }
    else { setMsg({ good: false, text: "There is a hidden solution in there." }); onMistake(); }
  };
  const next = () => {
    if (i + 1 >= REQUESTS.length) { onWin(); return; }
    setI(i + 1); setFound([]); setMsg(null);
  };

  return (
    <div className="card">
      <p>Tap every word that smuggles in a <strong>solution</strong>. What is left is the real need. If the request is already problem-first, say so. ({i + 1} of {REQUESTS.length})</p>
      <p className="strip">
        {r.chunks.map((c, k) => (
          <button key={k} className={`chunk ${found.includes(k) ? "gone" : ""}`} onClick={() => tap(k)}>{c.t}</button>
        ))}
      </p>
      {!done && <button className="btn ghost" onClick={nothing}>Nothing to strip</button>}
      {msg && <Feedback good={msg.good}>{msg.text}</Feedback>}
      {done && (
        <>
          <Feedback good>The need: {r.need}</Feedback>
          <button className="btn" onClick={next}>{i + 1 >= REQUESTS.length ? "Puzzle solved" : "Next request"}</button>
        </>
      )}
    </div>
  );
}
