export interface LevelMeta {
  id: number;
  title: string;
  guide: string;
  blurb: string;
}

export const LEVELS: LevelMeta[] = [
  { id: 1, title: "Triage", guide: "Guide 1", blurb: "Problems before solutions, outcomes before outputs." },
  { id: 2, title: "The Why Ladder", guide: "Guide 2", blurb: "Five Whys, then pick the right rung to fix." },
  { id: 3, title: "Statement Builder", guide: "Guide 3", blurb: "Assemble a 4Cs problem statement." },
  { id: 4, title: "Metric Forge", guide: "Guide 4", blurb: "SMART metrics, leading and lagging indicators." },
  { id: 5, title: "Risk Lab", guide: "Guide 5", blurb: "Riskiest assumption, cheapest test, staged delivery." },
  { id: 6, title: "The 11-Star Dial", guide: "Guide 6", blurb: "Stretch the experience, then pick what is worth building." },
  { id: 7, title: "Boss: The Director's Ask", guide: "Guide 7", blurb: "Run the whole toolkit on one vague request." },
];
