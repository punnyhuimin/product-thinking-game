import { useState } from "react";
import { MultiChoice, type MCQ } from "./MultiChoice";

export interface WhyChain {
  title: string;
  start: string;
  /** Each step: pick the correct next "why" (answer to "Why?"). */
  steps: { options: string[]; answer: number; why: string }[];
  /** Final step: which rung should you fix? Options index into [start, ...answers] plus extras. */
  fix: MCQ;
}

/** Builds a Five Whys ladder rung by rung, then asks which rung to fix. */
export function WhyLadder({ chain, onWrong, onRight, onDone }: {
  chain: WhyChain;
  onWrong: () => void;
  onRight: () => void;
  onDone: () => void;
}) {
  const [step, setStep] = useState(0);
  const built = [chain.start, ...chain.steps.slice(0, step).map((s) => s.options[s.answer])];
  const fixing = step >= chain.steps.length;
  return (
    <div className="card">
      <p className="kicker">{chain.title}</p>
      <ol className="ladder">
        {built.map((b, i) => (
          <li key={i}><span className="why-tag">{i === 0 ? "Problem" : `Why ${i}`}</span> {b}</li>
        ))}
      </ol>
      {!fixing ? (
        <MultiChoice
          key={step}
          q={{ prompt: `Why? (Why ${step + 1} of ${chain.steps.length})`, ...chain.steps[step] }}
          onResult={(ok) => (ok ? onRight() : onWrong())}
          onNext={() => setStep(step + 1)}
        />
      ) : (
        <MultiChoice
          q={chain.fix}
          onResult={(ok) => (ok ? onRight() : onWrong())}
          onNext={onDone}
          nextLabel="Next case"
        />
      )}
    </div>
  );
}
