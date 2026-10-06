import { useRef, useState, type ComponentType } from "react";
import { LEVELS } from "../data/levels";
import { RECALL } from "../data/recall";
import { useGame } from "../state/store";
import { TopBar } from "../components/TopBar";
import { Recall } from "./Recall";

export interface LevelProps {
  /** Report a wrong attempt: costs a heart. */
  onMistake: () => void;
  /** Report progress that earns XP. */
  onCorrect: () => void;
  /** Level finished. */
  onFinish: () => void;
}

type Phase = "recall" | "play" | "won" | "lost";

/** Wraps a level with warm-up recall, hearts, game-over retry and a results card. */
export function LevelShell({ id, Level, onExit }: { id: number; Level: ComponentType<LevelProps>; onExit: () => void }) {
  const meta = LEVELS.find((l) => l.id === id)!;
  const { state, dispatch } = useGame();
  const [phase, setPhase] = useState<Phase>(RECALL[id] ? "recall" : "play");
  const [attempt, setAttempt] = useState(0);
  const mistakes = useRef(0);

  const stars = mistakes.current === 0 ? 3 : mistakes.current <= 2 ? 2 : 1;

  const onMistake = () => {
    mistakes.current += 1;
    dispatch({ type: "lose-heart" });
    if (state.hearts <= 1) setPhase("lost");
  };
  const onCorrect = () => dispatch({ type: "xp", amount: 10 });
  const onFinish = () => {
    dispatch({ type: "complete", level: id, stars: mistakes.current === 0 ? 3 : mistakes.current <= 2 ? 2 : 1 });
    dispatch({ type: "xp", amount: 20 });
    setPhase("won");
  };
  const retry = () => {
    mistakes.current = 0;
    dispatch({ type: "refill-hearts" });
    setAttempt(attempt + 1);
    setPhase("play");
  };

  return (
    <>
      <TopBar onHome={onExit} />
      <p className="kicker">{meta.guide} · Level {id}</p>
      <h1>{meta.title}</h1>
      {phase === "recall" && <Recall level={id} onDone={() => setPhase("play")} />}
      {phase === "play" && <Level key={attempt} onMistake={onMistake} onCorrect={onCorrect} onFinish={onFinish} />}
      {phase === "lost" && (
        <div className="card">
          <h2>Out of hearts</h2>
          <p>Reread the explanations and try again. Hearts refill.</p>
          <button className="btn" onClick={retry}>Retry level</button>
        </div>
      )}
      {phase === "won" && (
        <div className="card">
          <h2>Level complete {"★".repeat(stars)}{"☆".repeat(3 - stars)}</h2>
          <p>{mistakes.current === 0 ? "Flawless." : `${mistakes.current} mistake${mistakes.current > 1 ? "s" : ""}. Replay for 3 stars.`}</p>
          <button className="btn" onClick={onExit}>Back to map</button>
        </div>
      )}
    </>
  );
}
