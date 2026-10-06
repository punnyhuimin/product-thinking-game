import { useState } from "react";
import type { LevelProps } from "../screens/LevelShell";
import { MultiChoice } from "../components/MultiChoice";
import { PuzzleFrame } from "../components/PuzzleFrame";
import { DEBRIEF } from "../data/debrief";
import { P7Memory } from "./P7Memory";
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
  if (i >= STEPS.length) {
    return (
      <PuzzleFrame title="Toolkit memory match" debrief={DEBRIEF[7]} onCorrect={onCorrect} onMistake={onMistake} onFinish={onFinish}>
        {(win) => <P7Memory onWin={win} />}
      </PuzzleFrame>
    );
  }
  const s = STEPS[i];
  return (
    <div className="card">
      <div className="progress"><div style={{ width: `${(i / STEPS.length) * 100}%` }} /></div>
      <p className="kicker">{s.tool} · {i + 1} of {STEPS.length}</p>
      <MultiChoice key={i} q={s.q} onResult={(ok) => (ok ? onCorrect() : onMistake())}
        onNext={() => setI(i + 1)} nextLabel={i + 1 < STEPS.length ? "Next" : "To the final puzzle"} />
    </div>
  );
}
