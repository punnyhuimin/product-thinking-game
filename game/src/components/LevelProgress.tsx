/** Progress through the current level: correct answers so far out of the total needed. */
export function LevelProgress({ done, total }: { done: number; total: number }) {
  const left = total - done;
  return (
    <div className="level-progress" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done}
      aria-label="Level progress">
      <div className="progress"><div style={{ width: `${(done / total) * 100}%` }} /></div>
      <small className="muted">
        {done} of {total} done · {left === 0 ? "level complete" : `${left} left (the puzzle counts for 2)`}
      </small>
    </div>
  );
}
