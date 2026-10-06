import { PROBLEM_FIRST, OUTPUT_OUTCOME, PRINCIPLES_QUIZ } from "./l1";
import { CHAINS } from "./l2";
import { SNIPPETS, GATE } from "./l3";
import { SMART_QS, LADDER, AFTER_QS } from "./l4";
import { RISKS, STAGES } from "./l5";
import { CX_QS } from "./l6";
import { STEPS } from "./boss";

export interface LevelMeta {
  id: number;
  title: string;
  guide: string;
  blurb: string;
  /** Correct answers needed to complete the level, counting the puzzle and its debrief. */
  steps: number;
}

// The closing puzzle counts for 2: solving it, and answering its debrief question.
const PUZZLE = 2;
// One-off questions in L5 (cheapest test, A/B follow-up, skateboard path) and L6 (the build choice).
const L5_SINGLES = 3;
const L6_BUILD = 1;

export const LEVELS: LevelMeta[] = [
  { id: 1, title: "Triage", guide: "Guide 1", blurb: "Problems before solutions, outcomes before outputs.", steps: PROBLEM_FIRST.length + OUTPUT_OUTCOME.length + PRINCIPLES_QUIZ.length + PUZZLE },
  { id: 2, title: "The Why Ladder", guide: "Guide 2", blurb: "Five Whys, then pick the right rung to fix.", steps: CHAINS.reduce((a, c) => a + c.steps.length + 1, 0) + PUZZLE },
  { id: 3, title: "Statement Builder", guide: "Guide 3", blurb: "Assemble a 4Cs problem statement.", steps: SNIPPETS.length + GATE.length + PUZZLE },
  { id: 4, title: "Metric Forge", guide: "Guide 4", blurb: "SMART metrics, leading and lagging indicators.", steps: SMART_QS.length + LADDER.length + AFTER_QS.length + PUZZLE },
  { id: 5, title: "Risk Lab", guide: "Guide 5", blurb: "Riskiest assumption, cheapest test, staged delivery.", steps: RISKS.length + STAGES.length + L5_SINGLES + PUZZLE },
  { id: 6, title: "The 11-Star Dial", guide: "Guide 6", blurb: "Stretch the experience, then pick what is worth building.", steps: L6_BUILD + CX_QS.length + PUZZLE },
  { id: 7, title: "Boss: The Director's Ask", guide: "Guide 7", blurb: "Run the whole toolkit on one vague request.", steps: STEPS.length + PUZZLE },
];
