// Level 3 puzzle: sentences are scrambled across the four C's slots. Swap them back.
export const SLOTS = ["Clarity", "Consequence", "Cause", "Confirmation"];

export interface Shuffle {
  title: string;
  /** Sentences in correct order (index = slot). */
  items: string[];
  /** start[i] = which correct index sits at position i at the start. */
  start: number[];
  /** Max swaps allowed. */
  limit: number;
}

export const ROUNDS: Shuffle[] = [
  {
    title: "Missed clinic appointments (illustrative numbers)",
    items: [
      "Elderly residents with chronic conditions keep missing clinic appointments because reminders only reach them by email.",
      "Untreated conditions worsen and emergency admissions rise.",
      "Contact details sit in separate systems, and reminders are sent from a single email-only channel.",
      "Records show 1 in 4 appointments are missed, and most missed ones had no recent email opened.",
    ],
    start: [3, 2, 0, 1],
    limit: 4,
  },
  {
    title: "Licence applications (illustrative numbers)",
    items: [
      "Small businesses abandon the licence application halfway, then call the hotline to finish it.",
      "Businesses open late or trade unlicensed, and officers spend their days on avoidable calls.",
      "The document checklist sits on a different page from the form and is written in legal terms.",
      "Analytics show 55% of applications are abandoned at the upload step.",
    ],
    start: [1, 0, 3, 2],
    limit: 3,
  },
];
