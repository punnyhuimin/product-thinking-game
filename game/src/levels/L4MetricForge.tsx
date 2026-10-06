import { useState } from "react";
import type { LevelProps } from "../screens/LevelShell";
import { Quote } from "../components/Quote";
import { Term } from "../components/Term";
import { MultiChoice, type MCQ } from "../components/MultiChoice";
import { Orderer } from "../components/Orderer";
import { AFTER_QS, LADDER, SMART_QS } from "../data/l4";

export function L4MetricForge({ onMistake, onCorrect, onFinish }: LevelProps) {
  const [stage, setStage] = useState(0);
  const [q, setQ] = useState(0);
  const run = (qs: MCQ[], after: () => void, last: string) => (
    <div className="card">
      <p className="kicker">{q + 1} of {qs.length}</p>
      <MultiChoice key={q} q={qs[q]} onResult={(ok) => (ok ? onCorrect() : onMistake())}
        onNext={() => (q + 1 < qs.length ? setQ(q + 1) : (setQ(0), after()))} nextLabel={q + 1 < qs.length ? "Next" : last} />
    </div>
  );
  return (
    <>
      {stage === 0 && (
        <div className="card">
          <p>Without metrics you are building on instinct. Forge good ones: first spot what makes a metric weak against the five <Term def="Specific, Measurable, Achievable, Relevant, Time-bound.">SMART</Term> properties.</p>
          <Quote source="IDG Guide 4">Instincts hardly hold up in a funding review.</Quote>
          <button className="btn" onClick={() => setStage(1)}>Begin</button>
        </div>
      )}
      {stage === 1 && run(SMART_QS, () => setStage(2), "Next: indicators")}
      {stage === 2 && (
        <div className="card">
          <p>
            <Term def="Early signal: measurable often and precisely, but further from the real outcome.">Leading</Term> indicators arrive early.{" "}
            <Term def="Closer to the real problem, but slow to surface and harder to pin down.">Lagging</Term> indicators sit close to the problem. Tap the teachers' portal indicators from leading to lagging.
          </p>
          <Orderer items={LADDER} labels={["Leading", "Lagging"]} onWrong={onMistake} onRight={onCorrect} onDone={() => setStage(3)} />
        </div>
      )}
      {stage === 3 && run(AFTER_QS, onFinish, "Finish level")}
    </>
  );
}
