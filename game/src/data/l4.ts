import type { MCQ } from "../components/MultiChoice";

export const SMART_QS: MCQ[] = [
  {
    prompt: "“Make the website better.” Which SMART property is missing, and what fixes it?",
    options: [
      "Specific: “Improve click-through rate from 20% to 25%”",
      "Time-bound: “Make it better by Friday”",
      "Relevant: “Make the logo bigger”",
    ],
    answer: 0,
    why: "“Making the website better is not very specific. Improving the click-through rates from 20% to 25% is.”",
  },
  {
    prompt: "“Improve citizen happiness.” Which property fails?",
    options: ["Measurable: use something like Net Promoter Score (NPS)", "Achievable: hire more staff", "Time-bound: pick a year"],
    answer: 0,
    why: "“Improving citizen happiness is not measurable. Net promoter score is measurable.” NPS is a survey score of how likely users are to recommend a service.",
  },
  {
    prompt: "A team of one engineer promises a nationwide rollout this sprint. Which property fails?",
    options: ["Specific", "Achievable: “ambitious yet grounded”", "Relevant"],
    answer: 1,
    why: "“What one engineer can deliver in the sprint is very different from what 10 engineers can deliver in a year.”",
  },
  {
    prompt: "A team tracks “number of logins” to prove the form is easier to complete. Which property fails?",
    options: ["Relevant: the metric should move when the problem is being solved", "Measurable", "Time-bound"],
    answer: 0,
    why: "Logins can rise while people still abandon the form. A relevant metric moves when the problem is solved.",
  },
  {
    prompt: "“Cut hotline calls by 30%.” Which property is still missing?",
    options: ["Time-bound: by when? 3 months and 3 years look very different", "Measurable", "Specific"],
    answer: 0,
    why: "“Anchor your targets to a timeline.”",
  },
];

// IDG Guide 4: teachers' portal, from leading to lagging.
export const LADDER = [
  { text: "Teachers onboarded each day", note: "Easy to measure, but perhaps not very telling." },
  { text: "Teachers who used a specific feature", note: "Still an early signal." },
  { text: "Teachers who crafted a message within a time limit", note: "Closer to the task they care about." },
  { text: "Campaigns approved quickly", note: "Closer still to the outcome." },
  { text: "Time teachers actually saved", note: "Closest to the real problem, but may only be measurable quarterly." },
];

export const AFTER_QS: MCQ[] = [
  {
    prompt: "A new feature shows low adoption in week two. What does the leading indicator let you conclude?",
    options: [
      "It probably isn't saving anyone's time. No need to wait for the quarter.",
      "Nothing until quarter end.",
      "Adoption never matters.",
    ],
    answer: 0,
    why: "That is the value of earlier indicators: faster feedback.",
  },
  {
    prompt: "You can't pick one right metric. Most likely cause?",
    options: ["The problem statement is too broad: narrow it", "You need more dashboards", "VCR is wrong"],
    answer: 0,
    why: "“If you're struggling to identify a single right metric, the problem statement is probably too broad.”",
  },
  {
    prompt: "What is Value Cost Ratio (VCR) for?",
    options: [
      "A pass/fail verdict on a project",
      "Asking the right questions: what value from an extra dollar, and what must change to improve the ratio?",
      "Replacing SMART metrics",
    ],
    answer: 1,
    why: "“VCR isn't a verdict.” It measures units of value generated per dollar spent and enables better questions.",
  },
];
