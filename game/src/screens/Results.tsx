import { LEVELS } from "../data/levels";
import { useGame } from "../state/store";

// MISSION.md success criteria, each mapped to the level that trains it.
const CRITERIA = [
  { text: "Explain the 3 principles and 3 mindset shifts", levels: [1, 7] },
  { text: "Turn “let's build X” into a 4Cs problem statement", levels: [1, 3] },
  { text: "Run a Five Whys and pick the right level", levels: [2] },
  { text: "Choose an outcome metric and sort leading from lagging", levels: [4] },
  { text: "Name the riskiest assumption and the cheapest test", levels: [5] },
];

export function Results() {
  const { state } = useGame();
  const total = LEVELS.reduce((a, l) => a + (state.completed[l.id] ?? 0), 0);
  const done = LEVELS.every((l) => state.completed[l.id]);
  if (!done) return null;
  return (
    <div className="card">
      <h2>Campaign complete</h2>
      <p>{state.xp} XP · {total} of {LEVELS.length * 3} stars</p>
      <ul className="criteria">
        {CRITERIA.map((c) => (
          <li key={c.text}>✓ {c.text} <small className="muted">levels {c.levels.join(", ")}</small></li>
        ))}
      </ul>
      <p className="muted">Replay any level for 3 stars. Next step: apply the toolkit to one real initiative.</p>
    </div>
  );
}
