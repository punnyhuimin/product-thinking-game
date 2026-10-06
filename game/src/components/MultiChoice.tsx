import { useState } from "react";
import { Feedback } from "./Feedback";

export interface MCQ {
  prompt: React.ReactNode;
  options: string[];
  answer: number;
  why: string;
}

/** One question. Wrong picks are disabled; onResult(true|false) fires per attempt. */
export function MultiChoice({ q, onResult, onNext, nextLabel = "Next" }: {
  q: MCQ;
  onResult?: (correct: boolean) => void;
  onNext: () => void;
  nextLabel?: string;
}) {
  const [picked, setPicked] = useState<number[]>([]);
  const solved = picked.includes(q.answer);
  const pick = (i: number) => {
    if (solved || picked.includes(i)) return;
    setPicked([...picked, i]);
    onResult?.(i === q.answer);
  };
  return (
    <div>
      <p>{q.prompt}</p>
      {q.options.map((o, i) => (
        <button
          key={i}
          className={`choice ${picked.includes(i) ? (i === q.answer ? "correct" : "wrong") : ""}`}
          disabled={solved || picked.includes(i)}
          onClick={() => pick(i)}
        >
          {o}
        </button>
      ))}
      {picked.length > 0 && (
        <Feedback good={solved}>{solved ? `Correct. ${q.why}` : "Not quite, try another."}</Feedback>
      )}
      {solved && <button className="btn" onClick={onNext}>{nextLabel}</button>}
    </div>
  );
}
