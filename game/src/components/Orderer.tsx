import { useMemo, useState } from "react";
import { Feedback } from "./Feedback";

function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

/** Tap the items in the correct order. `items` are given in the correct order. */
export function Orderer({ items, labels, onWrong, onRight, onDone, doneLabel = "Continue" }: {
  items: { text: string; note: string }[];
  /** Labels for the first and last position, e.g. ["Leading", "Lagging"]. */
  labels: [string, string];
  onWrong: () => void;
  onRight: () => void;
  onDone: () => void;
  doneLabel?: string;
}) {
  const pool = useMemo(() => shuffle(items.map((_, i) => i)), [items]);
  const [n, setN] = useState(0);
  const [msg, setMsg] = useState<{ good: boolean; text: string } | null>(null);
  const tap = (i: number) => {
    if (i < n) return;
    if (i === n) {
      setN(n + 1);
      setMsg({ good: true, text: items[i].note });
      onRight();
    } else {
      setMsg({ good: false, text: "Not next. Which one comes earlier in the chain?" });
      onWrong();
    }
  };
  return (
    <div className="card">
      <div className="order-axis"><span>{labels[0]}</span><span>→</span><span>{labels[1]}</span></div>
      <ol className="ladder">
        {items.slice(0, n).map((it, i) => <li key={i}>{it.text}</li>)}
      </ol>
      {pool.filter((i) => i >= n).map((i) => (
        <button key={i} className="choice" onClick={() => tap(i)}>{items[i].text}</button>
      ))}
      {msg && <Feedback good={msg.good}>{msg.text}</Feedback>}
      {n === items.length && <button className="btn" onClick={onDone}>{doneLabel}</button>}
    </div>
  );
}
