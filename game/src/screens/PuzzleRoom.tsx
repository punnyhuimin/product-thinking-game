import { useMemo, useState } from "react";
import { useGame } from "../state/store";
import { TopBar } from "../components/TopBar";
import { Feedback } from "../components/Feedback";
import { activeSet, optimum, solved, type CausePuzzle } from "../puzzle/graph";
import { PUZZLES } from "../puzzle/puzzles";

const ROW_H = 5.2; // rem

function CauseWeb({ puzzle, onDone }: { puzzle: CausePuzzle; onDone: (stars: number) => void }) {
  const { dispatch } = useGame();
  const { nodes, budget } = puzzle;
  const [fixed, setFixed] = useState<Set<string>>(new Set());
  const [hint, setHint] = useState<string | null>(null);
  const [hinted, setHinted] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const best = useMemo(() => optimum(nodes), [nodes]);
  const active = activeSet(nodes, fixed);
  const win = solved(nodes, fixed);
  const cols = Math.max(...nodes.map((n) => n.col)) + 1;
  const rows = Math.max(...nodes.map((n) => n.row)) + 1;
  const pos = (n: { col: number; row: number }) => ({ x: ((n.col + 0.5) / cols) * 100, y: ((n.row + 0.5) / rows) * 100 });

  const toggle = (id: string) => {
    if (win) return;
    const n = nodes.find((x) => x.id === id)!;
    if (!n.ctrl || n.symptom) { setMsg("🔒 That is outside your sphere of influence. Work upstream or find a controllable node."); return; }
    const next = new Set(fixed);
    if (next.has(id)) next.delete(id);
    else if (next.size >= budget) { setMsg(`You only have ${budget} fix${budget > 1 ? "es" : ""}. Undo one first.`); return; }
    else next.add(id);
    setFixed(next);
    setHint(null);
    setMsg(null);
  };
  const useHint = () => {
    const pick = best.find((b) => !fixed.has(b));
    if (!pick) return;
    setHint(pick);
    if (!hinted) { dispatch({ type: "xp", amount: -5 }); setHinted(true); }
  };

  return (
    <div className="card">
      <p>{puzzle.intro}</p>
      <p className="kicker">Fixes used: {fixed.size} / {budget}</p>
      <div className="web" style={{ height: `${rows * ROW_H}rem` }}>
        <svg className="web-lines" aria-hidden="true">
          <defs>
            <marker id="arr" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M0,0 L6,3 L0,6 z" fill="currentColor" />
            </marker>
          </defs>
          {nodes.flatMap((n) => n.causes.map((c) => {
            const a = pos(nodes.find((x) => x.id === c)!);
            const b = pos(n);
            return <line key={`${c}-${n.id}`} className={active.has(c) ? "hot" : "cool"} markerEnd="url(#arr)"
              x1={`${a.x + 8}%`} y1={`${a.y}%`} x2={`${b.x - 9}%`} y2={`${b.y}%`} />;
          }))}
        </svg>
        {nodes.map((n) => {
          const p = pos(n);
          const cls = ["wnode", n.symptom ? "symptom" : "", fixed.has(n.id) ? "fixed" : active.has(n.id) ? "on" : "off", !n.ctrl ? "locked" : "", hint === n.id ? "hinted" : ""].join(" ");
          return (
            <button key={n.id} className={cls} style={{ left: `${p.x}%`, top: `${p.y}%` }} onClick={() => toggle(n.id)}
              aria-pressed={fixed.has(n.id)} aria-label={`${n.text}${!n.ctrl ? " (locked)" : ""}${fixed.has(n.id) ? " (fixed)" : active.has(n.id) ? " (active)" : " (resolved)"}`}>
              {!n.ctrl && !n.symptom && "🔒 "}{fixed.has(n.id) && "✓ "}{n.text}
            </button>
          );
        })}
      </div>
      <small className="muted">Red = still causing trouble. Green = cleared. A node clears only when every cause feeding it is cleared or fixed.</small>
      {msg && <Feedback good={false}>{msg}</Feedback>}
      {win ? (
        <>
          <Feedback good>Solved with {fixed.size} fix{fixed.size > 1 ? "es" : ""}. {puzzle.lesson}</Feedback>
          <button className="btn" onClick={() => onDone(hinted ? 2 : fixed.size <= best.length ? 3 : 2)}>Collect</button>
        </>
      ) : (
        <p>
          <button className="btn ghost" onClick={() => { setFixed(new Set()); setHint(null); setMsg(null); }}>Reset</button>{" "}
          <button className="btn ghost" onClick={useHint}>Hint (−5 XP)</button>
        </p>
      )}
    </div>
  );
}

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
