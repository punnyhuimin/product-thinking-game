import { useEffect, useMemo, useState } from "react";
import { Feedback } from "./Feedback";

export interface SortItem { text: string; answer: string; why: string }

function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

/** One card at a time. Click a bucket, or press 1/2 (or ←/→ for two buckets). */
export function Sorter({ buckets, items, onWrong, onRight, onDone }: {
  buckets: string[];
  items: SortItem[];
  onWrong: () => void;
  onRight: () => void;
  onDone: () => void;
}) {
  const deck = useMemo(() => shuffle(items), [items]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const item = deck[i];
  const solved = picked === item?.answer;

  const choose = (b: string) => {
    if (!item || solved) return;
    setPicked(b);
    b === item.answer ? onRight() : onWrong();
  };
  const next = () => { setPicked(null); i + 1 >= deck.length ? onDone() : setI(i + 1); };

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (solved && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); next(); return; }
      const idx = e.key === "ArrowLeft" ? 0 : e.key === "ArrowRight" ? 1 : Number(e.key) - 1;
      if (idx >= 0 && idx < buckets.length) choose(buckets[idx]);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  if (!item) return null;
  return (
    <div>
      <div className="progress"><div style={{ width: `${(i / deck.length) * 100}%` }} /></div>
      <div className={`sort-card ${picked ? (solved ? "ok" : "no") : ""}`} key={i}>{item.text}</div>
      <div className="sort-buckets">
        {buckets.map((b, k) => (
          <button key={b} className="btn" disabled={solved} onClick={() => choose(b)}>
            {b} <kbd>{k + 1}</kbd>
          </button>
        ))}
      </div>
      {picked && (
        <Feedback good={solved}>{solved ? `Correct. ${item.why}` : "Not that one, try the other bucket."}</Feedback>
      )}
      {solved && <button className="btn" onClick={next}>{i + 1 >= deck.length ? "Finish round" : "Next card"}</button>}
    </div>
  );
}
