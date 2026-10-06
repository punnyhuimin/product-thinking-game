import { useState } from "react";
import type { LevelProps } from "../screens/LevelShell";
import { Quote } from "../components/Quote";
import { WhyLadder } from "../components/WhyLadder";
import { CHAINS } from "../data/l2";
import { CauseWeb } from "../components/CauseWeb";
import { PuzzleFrame } from "../components/PuzzleFrame";
import { DEBRIEF } from "../data/debrief";
import { PUZZLES } from "../puzzle/puzzles";

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
  if (i >= CHAINS.length) {
    const puzzle = PUZZLES.find((p) => p.id === "licence")!;
    return (
      <PuzzleFrame title={puzzle.title} debrief={DEBRIEF[2]} onCorrect={onCorrect} onMistake={onMistake} onFinish={onFinish}>
        {(win) => <CauseWeb puzzle={puzzle} onDone={win} />}
      </PuzzleFrame>
    );
  }
  return (
    <WhyLadder
      key={i}
      chain={CHAINS[i]}
      onWrong={onMistake}
      onRight={onCorrect}
      onDone={() => setI(i + 1)}
    />
  );
}
