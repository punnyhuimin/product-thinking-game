import type { MCQ } from "../components/MultiChoice";

/** One quiz question per level, asked right after the level's puzzle is solved. */
export const DEBRIEF: Record<number, MCQ> = {
  1: {
    prompt: "In the puzzle you stripped “a super app” and “an AI chatbot” down to the need underneath. Which mindset shift is that?",
    options: ["Solutions to problems", "Outputs to outcomes", "Big-bang to staged delivery"],
    answer: 0,
    why: "“Start with what's broken, not what technology is available.”",
  },
  2: {
    prompt: "In the licence web some nodes were locked. What rule decided which node you should fix?",
    options: [
      "Always the last why in the chain",
      "A cause within your control that is strongly connected to the outcome",
      "The cheapest one, whatever it connects to",
    ],
    answer: 1,
    why: "“Identify the causes that are within your control and strongly connected to the outcomes you want to achieve.”",
  },
  3: {
    prompt: "In the shuffle, the sentence with a figure like “1 in 4 appointments missed” belonged in which C, and what is its job?",
    options: [
      "Clarity: it says who is affected",
      "Cause: it explains why the problem exists",
      "Confirmation: it shows with data that the problem is real and significant",
    ],
    answer: 2,
    why: "Confirmation “grounds everything in data”: what evidence do we have that this problem is real, significant and worth prioritising?",
  },
  4: {
    prompt: "In the metric builder, “number of logins” failed even though it is easy to measure. Which SMART property did it fail?",
    options: [
      "Relevant: logins can rise while people still abandon the form",
      "Time-bound: logins have no deadline",
      "Specific: logins are vague",
    ],
    answer: 0,
    why: "“The metric should move when the problem is being solved.”",
  },
  5: {
    prompt: "Why was the concierge test (a form plus Excel and manual calls) a better pick than the A/B letter test for the market risk?",
    options: [
      "It tested the same assumption for fewer weeks: the lowest-cost way to learn before over-investing",
      "It could scale to every clinic",
      "It avoided real users",
    ],
    answer: 0,
    why: "“Not scalable, but that wasn't the point. It was the lowest way to validate the approach.”",
  },
  6: {
    prompt: "In the trade-offs puzzle, “instant payout” helped only merchants. How did the winning release serve everyone?",
    options: [
      "It built every feature, a little at a time",
      "It got the essentials right first with features that helped more than one user, and left the rest for a roadmap",
      "It served the loudest user first",
    ],
    answer: 1,
    why: "“Get the essentials right first and build a road map for everything else.”",
  },
  7: {
    prompt: "The memory match covered the whole toolkit. In what order does IDG's pathway run?",
    options: [
      "CX, metrics, risk and scale, problem statement, why",
      "Why (Five Whys), problem statement (4Cs), metrics, risk and scale, CX",
      "Metrics, 4Cs, CX, Five Whys, risk and scale",
    ],
    answer: 1,
    why: "Pathway order: why, problem statement, metrics, risk and scale, CX.",
  },
};
