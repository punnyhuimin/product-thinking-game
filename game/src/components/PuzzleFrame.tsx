import { useState, type ReactNode } from "react";

/** Wraps a level's closing puzzle: bonus XP on a solve, skippable so nobody gets stuck. */
export function PuzzleFrame({ title, onCorrect, onFinish, children }: {
  title: string;
  onCorrect: () => void;
  onFinish: () => void;
  children: (win: () => void) => ReactNode;
}) {
  const [won, setWon] = useState(false);
  const win = () => {
    if (won) return;
    setWon(true);
    onCorrect();
  };
  return (
    <div>
      <p className="kicker puzzle-kicker">🧩 Puzzle · {title}</p>
      {children(win)}
      <p>
        {won
          ? <button className="btn" onClick={onFinish}>Finish level</button>
          : <button className="btn ghost" onClick={onFinish}>Skip puzzle</button>}
      </p>
    </div>
  );
}
