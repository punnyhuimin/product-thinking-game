import { useState } from "react";
import { CampaignMap } from "./screens/CampaignMap";
import { LevelShell } from "./screens/LevelShell";
import { PuzzleRoom } from "./screens/PuzzleRoom";
import { LEVEL_COMPONENTS } from "./levels";

export function App() {
  const [level, setLevel] = useState<number | null>(null);
  const [puzzles, setPuzzles] = useState(false);
  const Level = level !== null ? LEVEL_COMPONENTS[level] : undefined;
  return (
    <div className="app">
      {puzzles ? (
        <PuzzleRoom onExit={() => setPuzzles(false)} />
      ) : level === null || !Level ? (
        <CampaignMap onPlay={setLevel} onPuzzles={() => setPuzzles(true)} />
      ) : (
        <LevelShell key={level} id={level} Level={Level} onExit={() => setLevel(null)} />
      )}
    </div>
  );
}
