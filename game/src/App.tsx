import { useState } from "react";
import { CampaignMap } from "./screens/CampaignMap";

export function App() {
  const [level, setLevel] = useState<number | null>(null);
  return (
    <div className="app">
      {level === null ? <CampaignMap onPlay={setLevel} /> : <p>Level {level} coming soon.</p>}
    </div>
  );
}
