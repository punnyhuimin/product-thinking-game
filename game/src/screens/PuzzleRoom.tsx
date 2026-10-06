import { useState } from "react";
import { useGame } from "../state/store";
import { TopBar } from "../components/TopBar";
import { CauseWeb } from "../components/CauseWeb";
import { PUZZLES } from "../puzzle/puzzles";

export function PuzzleRoom({ onExit }: { onExit: () => void }) {
  const { state, dispatch } = useGame();
  const [open, setOpen] = useState<string | null>(null);
  const puzzle = PUZZLES.find((p) => p.id === open);
  return (
    <>
      <TopBar onHome={open ? () => setOpen(null) : onExit} />
      <p className="kicker">Puzzle Room</p>
      <h1>{puzzle ? puzzle.title : "Cause Webs"}</h1>
      {puzzle ? (
        <CauseWeb key={puzzle.id} puzzle={puzzle} onDone={(stars) => {
          dispatch({ type: "puzzle-done", id: puzzle.id, stars });
          dispatch({ type: "xp", amount: 30 });
          setOpen(null);
        }} />
      ) : (
        <>
          <p className="subtitle">Real problems have several contributing factors. Clear the symptom with as few fixes as you can. Tap a node to fix it.</p>
          <div className="map">
            {PUZZLES.map((p, i) => (
              <button key={p.id} className={`node ${state.puzzles[p.id] ? "done" : ""}`} onClick={() => setOpen(p.id)}>
                <span className="num">{state.puzzles[p.id] ? "✓" : i + 1}</span>
                <span><h3>{p.title}</h3><p>{p.budget} fix{p.budget > 1 ? "es" : ""}{state.puzzles[p.id] ? ` · ${"★".repeat(state.puzzles[p.id])}` : ""}</p></span>
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}
