import { useEffect, useState } from "react";
import type { LevelProps } from "../screens/LevelShell";
import { Quote } from "../components/Quote";
import { Sorter } from "../components/Sorter";
import { MultiChoice } from "../components/MultiChoice";
import { Orderer } from "../components/Orderer";
import { AFTER_AB, RISKS, RISK_BUCKETS, SKATE_Q, STAGES, TEST_Q } from "../data/l5";

/** Animated reveal of the IDG A/B result: control 0, treatment 24 after 2 weeks. */
function ABReveal({ onDone }: { onDone: () => void }) {
  const [started, setStarted] = useState(false);
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!started || t >= 24) return;
    const id = setTimeout(() => setT(t + 1), 70);
    return () => clearTimeout(id);
  }, [started, t]);
  return (
    <div className="card">
      <p>Two letters go out. <strong>Control:</strong> a standard letter, find a clinic yourself. <strong>Treatment:</strong> a letter with a QR code to the booking flow. Run it for 2 weeks.</p>
      {!started ? (
        <button className="btn" onClick={() => setStarted(true)}>Send the letters</button>
      ) : (
        <>
          <div className="bar-row"><span>Control</span><div className="bar"><div style={{ width: "0%" }} /></div><b>0</b></div>
          <div className="bar-row"><span>Treatment</span><div className="bar"><div className="t" style={{ width: `${(t / 24) * 100}%` }} /></div><b>{t}</b></div>
          {t >= 24 && (
            <>
              <p>Appointments after 2 weeks. Users even shared the link unprompted.</p>
              <button className="btn" onClick={onDone}>Continue</button>
            </>
          )}
        </>
      )}
    </div>
  );
}

export function L5RiskLab({ onMistake, onCorrect, onFinish }: LevelProps) {
  const [stage, setStage] = useState(0);
  const res = (ok: boolean) => (ok ? onCorrect() : onMistake());
  return (
    <>
      {stage === 0 && (
        <div className="card">
          <p>Every product carries market, technical and team risk. Sort six worries into the right type.</p>
          <Quote source="IDG Guide 5">If a project seems entirely risk-free, it's a sign that someone isn't looking hard enough.</Quote>
          <button className="btn" onClick={() => setStage(1)}>Start</button>
        </div>
      )}
      {stage === 1 && <Sorter buckets={RISK_BUCKETS} items={RISKS} onWrong={onMistake} onRight={onCorrect} onDone={() => setStage(2)} />}
      {stage === 2 && <div className="card"><MultiChoice q={TEST_Q} onResult={res} onNext={() => setStage(3)} nextLabel="Run the test" /></div>}
      {stage === 3 && <ABReveal onDone={() => setStage(4)} />}
      {stage === 4 && <div className="card"><MultiChoice q={AFTER_AB} onResult={res} onNext={() => setStage(5)} /></div>}
      {stage === 5 && (
        <div className="card">
          <p>Put the four <strong>stages of de-risking</strong> in order.</p>
          <Orderer items={STAGES} labels={["First", "Last"]} onWrong={onMistake} onRight={onCorrect} onDone={() => setStage(6)} />
        </div>
      )}
      {stage === 6 && <div className="card"><MultiChoice q={SKATE_Q} onResult={res} onNext={onFinish} nextLabel="Finish level" /></div>}
    </>
  );
}
