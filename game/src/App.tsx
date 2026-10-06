import { useState } from "react";
import { CampaignMap } from "./screens/CampaignMap";
import { LevelShell } from "./screens/LevelShell";
import { LEVEL_COMPONENTS } from "./levels";

export function App() {
  const [level, setLevel] = useState<number | null>(null);
  const Level = level !== null ? LEVEL_COMPONENTS[level] : undefined;
  return (
    <div className="app">
      {level === null || !Level ? (
        <CampaignMap onPlay={setLevel} />
      ) : (
        <LevelShell key={level} id={level} Level={Level} onExit={() => setLevel(null)} />
      )}
    </div>
  );
}
