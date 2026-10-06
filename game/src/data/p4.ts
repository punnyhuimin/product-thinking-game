// Level 4 puzzle: build a metric from three pieces, then test it against SMART.
export interface Piece { label: string; flags: Partial<Record<"specific" | "measurable" | "achievable" | "relevant" | "timebound", boolean>> }

export const SCENARIO =
  "Problem: citizens abandon the licence form before finishing. Your team is two engineers. The funding review is in 3 months. Pick one piece for each slot.";

export const SLOTS: { name: string; pieces: Piece[] }[] = [
  {
    name: "Measure",
    pieces: [
      { label: "Citizen happiness", flags: { measurable: false, relevant: true } },
      { label: "Form completion rate", flags: { measurable: true, relevant: true } },
      { label: "Number of logins", flags: { measurable: true, relevant: false } },
    ],
  },
  {
    name: "Target",
    pieces: [
      { label: "Make it better", flags: { specific: false, achievable: true } },
      { label: "from 60% to 80%", flags: { specific: true, achievable: true } },
      { label: "from 60% to 99%", flags: { specific: true, achievable: false } },
    ],
  },
  {
    name: "Timeframe",
    pieces: [
      { label: "eventually", flags: { timebound: false, achievable: true } },
      { label: "by the end of this week", flags: { timebound: true, achievable: false } },
      { label: "within 3 months", flags: { timebound: true, achievable: true } },
      { label: "within 3 years", flags: { timebound: false, achievable: true } },
    ],
  },
];

export const LETTERS = [
  { key: "specific", letter: "S", name: "Specific" },
  { key: "measurable", letter: "M", name: "Measurable" },
  { key: "achievable", letter: "A", name: "Achievable" },
  { key: "relevant", letter: "R", name: "Relevant" },
  { key: "timebound", letter: "T", name: "Time-bound" },
] as const;
