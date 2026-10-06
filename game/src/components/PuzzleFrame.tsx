import { useState, type ReactNode } from "react";
import { MultiChoice, type MCQ } from "./MultiChoice";

/**
 * Wraps a level's closing puzzle. Skippable so nobody gets stuck. Solving it earns bonus XP
 * and unlocks a debrief quiz question about what the puzzle just showed, scored like the rest of the level.
 */
export function PuzzleFrame({ title, debrief, onCorrect, onMistake, onFinish, children }: {
  title: string;
  debrief: MCQ;
  onCorrect: () => void;
  onMistake: () => void;
  onFinish: () => void;
  children: (win: () => void) => ReactNode;
}) {
  const [won, setWon] = useState(false);
  const [debriefed, setDebriefed] = useState(false);
  const win = () => {
    if (won) return;
    setWon(true);
    onCorrect();
  };
  return (
    <div>
      <p className="kicker puzzle-kicker">🧩 Puzzle · {title}</p>
      {children(win)}
      {won && !debriefed && (
        <div className="card">
          <p className="kicker">Debrief · back to the quiz</p>
          <MultiChoice q={debrief} onResult={(ok) => (ok ? onCorrect() : onMistake())} onNext={() => setDebriefed(true)} nextLabel="Done" />
        </div>
      )}
      <p>
        {debriefed
          ? <button className="btn" onClick={onFinish}>Finish level</button>
          : !won && <button className="btn ghost" onClick={onFinish}>Skip puzzle</button>}
      </p>
    </div>
  );
}
