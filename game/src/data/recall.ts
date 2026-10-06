import type { MCQ } from "../components/MultiChoice";

/** Spaced-retrieval questions asked at the START of level N about level N-1. */
export const RECALL: Record<number, MCQ[]> = {
  2: [
    {
      prompt: "Which is an outcome rather than an output?",
      options: ["A website with five buttons", "More citizens completing transactions", "A new mobile app", "Twelve shipped features"],
      answer: 1,
      why: "An outcome is the change achieved for people, not the thing delivered.",
    },
  ],
  3: [
    {
      prompt: "In the Five Whys, which why should you fix?",
      options: ["Always the last one", "Always the first one", "One within your control and strongly connected to the outcome", "The cheapest one"],
      answer: 2,
      why: "Balance meaningful and achievable: close to the root, within your sphere of influence.",
    },
  ],
  4: [
    {
      prompt: "Which C asks \"what data shows the problem is real and significant?\"",
      options: ["Clarity", "Consequence", "Cause", "Confirmation"],
      answer: 3,
      why: "Confirmation is the evidence; Cause comes from the Five Whys.",
    },
  ],
  5: [
    {
      prompt: "You cannot pick a single right metric. What does that usually mean?",
      options: ["Use five metrics", "The problem statement is too broad", "Wait for the quarter to end", "Choose the lagging indicator"],
      answer: 1,
      why: "If you can't choose one metric, narrow the problem.",
    },
  ],
  6: [
    {
      prompt: "A booking form with a QR code is the cheapest test of which risk?",
      options: ["Team risk", "Technical risk", "Market risk", "Budget risk"],
      answer: 2,
      why: "The question was whether people would book online, which is market risk.",
    },
  ],
  7: [
    {
      prompt: "Airbnb's 11-star framework: what are stars 10 and 11 for?",
      options: ["The target to ship", "Stretching thinking, then working back to what is feasible", "Marketing copy", "Measuring host quality"],
      answer: 1,
      why: "The target is somewhere between 5 and 11 that is ambitious and feasible.",
    },
  ],
};
