import { useState } from "react";
import type { LevelProps } from "../screens/LevelShell";
import { Quote } from "../components/Quote";
import { Feedback } from "../components/Feedback";
import { MultiChoice } from "../components/MultiChoice";
import { BUDGET, CX_QS, STARS } from "../data/l6";

export function L6StarDial({ onMistake, onCorrect, onFinish }: LevelProps) {
  const [stage, setStage] = useState(0);
  const [idx, setIdx] = useState(2);
  const [q, setQ] = useState(0);
  const [msg, setMsg] = useState<{ good: boolean; text: string } | null>(null);
  const [locked, setLocked] = useState(false);
  const cur = STARS[idx];

  // The best feasible experience within budget is the highest star whose cost fits.
  const best = [...STARS].reverse().find((s) => s.cost <= BUDGET)!;
  const build = () => {
    if (cur.star === best.star) {
      setMsg({ good: true, text: `${cur.star} stars is the highest experience that fits. “Somewhere between five and 11 stars lies an experience that's genuinely worth building and feasible.”` });
      setLocked(true);
      onCorrect();
    } else if (cur.cost > BUDGET) {
      setMsg({ good: false, text: `${cur.star} stars costs ${cur.cost}, over your budget of ${BUDGET}. “The 10 and 11 star experiences aren't the goal. They're a prompt.”` });
      onMistake();
    } else {
      setMsg({ good: false, text: `${cur.star} stars is affordable, but you can reach higher within budget. Don't settle for baseline.` });
      onMistake();
    }
  };

  if (stage === 2) {
    return (
      <div className="card">
        <p className="kicker">{q + 1} of {CX_QS.length}</p>
        <MultiChoice key={q} q={CX_QS[q]} onResult={(ok) => (ok ? onCorrect() : onMistake())}
          onNext={() => (q + 1 < CX_QS.length ? setQ(q + 1) : onFinish())} nextLabel={q + 1 < CX_QS.length ? "Next" : "Finish level"} />
      </div>
    );
  }
  if (stage === 0) {
    return (
      <div className="card">
        <p>Airbnb's <strong>11-star framework</strong> stretches what “good” could feel like. Drag the dial up from the baseline, then decide what is worth building.</p>
        <Quote source="IDG Guide 6">The 10 and 11 star experiences aren't the goal. They're a prompt.</Quote>
        <button className="btn" onClick={() => setStage(1)}>Open the dial</button>
      </div>
    );
  }
  return (
    <div className="card">
      <p className="kicker">Your budget: {BUDGET} effort units (game numbers, not from IDG)</p>
      <input type="range" min={0} max={STARS.length - 1} value={idx} disabled={locked} aria-label="Star level"
        onChange={(e) => { setIdx(Number(e.target.value)); setMsg(null); }} style={{ width: "100%" }} />
      <div className="star-big">{"★".repeat(Math.min(cur.star, 11))}</div>
      <p><strong>{cur.star} star{cur.star > 1 ? "s" : ""}</strong>, effort {cur.cost}</p>
      <p>{cur.text}</p>
      <div className="cost"><div style={{ width: `${Math.min(100, (cur.cost / BUDGET) * 100)}%` }} className={cur.cost > BUDGET ? "over" : ""} /></div>
      <small className="muted">IDG describes stars 1, 2 and 5 to 11 only.</small>
      {msg && <Feedback good={msg.good}>{msg.text}</Feedback>}
      {!locked ? <button className="btn" onClick={build}>Build this experience</button> : <button className="btn" onClick={() => setStage(2)}>Continue</button>}
    </div>
  );
}
