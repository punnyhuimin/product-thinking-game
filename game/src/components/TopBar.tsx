import { MAX_HEARTS, useGame } from "../state/store";

export function TopBar({ onHome }: { onHome?: () => void }) {
  const { state } = useGame();
  return (
    <div className="topbar">
      {onHome ? <button className="btn ghost" onClick={onHome}>← Map</button> : <span />}
      <span className="stat" aria-label={`${state.hearts} of ${MAX_HEARTS} hearts`}>
        <span className="hearts">{"♥".repeat(state.hearts)}{"♡".repeat(MAX_HEARTS - state.hearts)}</span>
      </span>
      <span className="stat">{state.xp} XP</span>
    </div>
  );
}
