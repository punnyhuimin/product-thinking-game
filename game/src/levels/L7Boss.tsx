import { useState } from "react";
import type { LevelProps } from "../screens/LevelShell";
import { MultiChoice } from "../components/MultiChoice";
import { REQUEST, STEPS } from "../data/boss";

export function L7Boss({ onMistake, onCorrect, onFinish }: LevelProps) {
  const [i, setI] = useState(-1);
  if (i < 0) {
    return (
      <div className="card">
        <p className="kicker">The Director's Ask</p>
        <p><strong>“{REQUEST}”</strong></p>
        <p>Run it through the whole toolkit: {STEPS.length} steps, in IDG's order. Mistakes cost hearts.</p>
        <button className="btn" onClick={() => setI(0)}>Face the director</button>
      </div>
    );
  }
  const s = STEPS[i];
  return (
    <div className="card">
      <div className="progress"><div style={{ width: `${(i / STEPS.length) * 100}%` }} /></div>
      <p className="kicker">{s.tool} · {i + 1} of {STEPS.length}</p>
      <MultiChoice key={i} q={s.q} onResult={(ok) => (ok ? onCorrect() : onMistake())}
        onNext={() => (i + 1 < STEPS.length ? setI(i + 1) : onFinish())} nextLabel={i + 1 < STEPS.length ? "Next" : "Finish the campaign"} />
    </div>
  );
}
