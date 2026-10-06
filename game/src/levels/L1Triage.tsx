import { useState } from "react";
import type { LevelProps } from "../screens/LevelShell";
import { Quote } from "../components/Quote";
import { Term } from "../components/Term";
import { Sorter } from "../components/Sorter";
import { MultiChoice } from "../components/MultiChoice";
import { PuzzleFrame } from "../components/PuzzleFrame";
import { P1Strip } from "./P1Strip";
import { OUTPUT_OUTCOME, PRINCIPLES_QUIZ, PROBLEM_FIRST } from "../data/l1";

export function L1Triage({ onMistake, onCorrect, onFinish }: LevelProps) {
  const [stage, setStage] = useState(0);
  const [q, setQ] = useState(0);
  return (
    <>
      {stage === 0 && (
        <div className="card">
          <p>
            You have a budget, a team and a deadline. Your director says <strong>“We need AI.”</strong> Your
            team says <strong>“We need a super app.”</strong> Where do you start? IDG's answer: neither.
          </p>
          <Quote source="IDG Guide 7">Product thinking is a discipline of asking better questions before reaching for solutions.</Quote>
          <p>
            Round 1: is each request <Term def="Starts from who is affected and what is in their way.">problem-first</Term> or{" "}
            <Term def="Starts from a tool or feature someone already wants.">solution-first</Term>? Use the buttons or press 1 / 2.
          </p>
          <button className="btn" onClick={() => setStage(1)}>Start sorting</button>
        </div>
      )}
      {stage === 1 && (
        <Sorter buckets={["Problem-first", "Solution-first"]} items={PROBLEM_FIRST} onWrong={onMistake} onRight={onCorrect} onDone={() => setStage(2)} />
      )}
      {stage === 2 && (
        <div className="card">
          <p>
            Round 2: an <Term def="Something the team produces, e.g. a website.">output</Term> is what you make. An{" "}
            <Term def="The change achieved for people.">outcome</Term> is what changes for people.
          </p>
          <button className="btn" onClick={() => setStage(3)}>Continue</button>
        </div>
      )}
      {stage === 3 && (
        <Sorter buckets={["Output", "Outcome"]} items={OUTPUT_OUTCOME} onWrong={onMistake} onRight={onCorrect} onDone={() => setStage(4)} />
      )}
      {stage === 4 && (
        <div className="card">
          <p className="kicker">Check · {q + 1} of {PRINCIPLES_QUIZ.length}</p>
          <MultiChoice
            key={q}
            q={PRINCIPLES_QUIZ[q]}
            onResult={(ok) => (ok ? onCorrect() : onMistake())}
            onNext={() => (q + 1 < PRINCIPLES_QUIZ.length ? setQ(q + 1) : setStage(5))}
            nextLabel={q + 1 < PRINCIPLES_QUIZ.length ? "Next" : "To the puzzle"}
          />
        </div>
      )}
      {stage === 5 && (
        <PuzzleFrame title="Strip the solution" onCorrect={onCorrect} onFinish={onFinish}>
          {(win) => <P1Strip onMistake={onMistake} onWin={win} />}
        </PuzzleFrame>
      )}
    </>
  );
}
