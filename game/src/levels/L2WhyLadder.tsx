import { useState } from "react";
import type { LevelProps } from "../screens/LevelShell";
import { Quote } from "../components/Quote";
import { WhyLadder } from "../components/WhyLadder";
import { CHAINS } from "../data/l2";

export function L2WhyLadder({ onMistake, onCorrect, onFinish }: LevelProps) {
  const [i, setI] = useState(-1);
  if (i < 0) {
    return (
      <div className="card">
        <p>Start from an observable problem and ask “why” until you reach a cause. Then choose the right rung, which is not always the last one.</p>
        <Quote source="IDG Guide 2">You don't always have to fix the last why in the chain. Focus on the ones within your control.</Quote>
        <button className="btn" onClick={() => setI(0)}>Climb</button>
      </div>
    );
  }
  return (
    <WhyLadder
      key={i}
      chain={CHAINS[i]}
      onWrong={onMistake}
      onRight={onCorrect}
      onDone={() => (i + 1 < CHAINS.length ? setI(i + 1) : onFinish())}
    />
  );
}
