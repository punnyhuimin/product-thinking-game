import { LEVELS } from "../data/levels";
import { useGame } from "../state/store";
import { TopBar } from "../components/TopBar";
import { Results } from "./Results";

export function CampaignMap({ onPlay, onPuzzles }: { onPlay: (id: number) => void; onPuzzles: () => void }) {
  const { state, dispatch } = useGame();
  const unlocked = (id: number) => id === 1 || state.completed[id - 1] !== undefined;
  const done = Object.keys(state.completed).length;
  return (
    <>
      <TopBar />
      <p className="kicker">IDG · AI Build 301</p>
      <h1>Product Officer</h1>
      <p className="subtitle">Your director says "We need AI." Where do you start?</p>
      <div className="progress"><div style={{ width: `${(done / LEVELS.length) * 100}%` }} /></div>
      <Results />
      <div className="map">
        {LEVELS.map((l) => (
          <button key={l.id} className={`node ${state.completed[l.id] ? "done" : ""}`} disabled={!unlocked(l.id)} onClick={() => onPlay(l.id)}>
            <span className="num">{state.completed[l.id] ? "✓" : l.id}</span>
            <span>
              <h3>{l.title}</h3>
              <p>{l.guide} · {l.blurb}{state.completed[l.id] ? ` · ${"★".repeat(state.completed[l.id])}` : ""}</p>
            </span>
          </button>
        ))}
      </div>
      <div className="map">
        <button className="node" disabled={state.completed[2] === undefined} onClick={onPuzzles}>
          <span className="num">?</span>
          <span><h3>Puzzle Room</h3><p>{state.completed[2] === undefined ? "Unlocks after level 2" : `Cause webs: ${Object.keys(state.puzzles).length} of 3 solved`}</p></span>
        </button>
      </div>
      <p style={{ marginTop: "2rem" }}>
        <button className="btn ghost" onClick={() => confirm("Reset all progress?") && dispatch({ type: "reset" })}>Reset progress</button>
      </p>
    </>
  );
}
