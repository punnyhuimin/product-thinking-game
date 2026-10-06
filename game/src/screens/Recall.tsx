import { useState } from "react";
import { RECALL } from "../data/recall";
import { MultiChoice } from "../components/MultiChoice";

/** Quick warm-up on the previous level. No hearts at stake. */
export function Recall({ level, onDone }: { level: number; onDone: () => void }) {
  const qs = RECALL[level] ?? [];
  const [i, setI] = useState(0);
  if (i >= qs.length) { onDone(); return null; }
  return (
    <div className="card">
      <p className="kicker">Warm-up · from the last level</p>
      <MultiChoice key={i} q={qs[i]} onNext={() => setI(i + 1)} nextLabel={i + 1 < qs.length ? "Next" : "Start level"} />
    </div>
  );
}
