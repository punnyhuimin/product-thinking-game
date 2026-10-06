import type { MCQ } from "../components/MultiChoice";

export const ZONES = ["Clarity", "Consequence", "Cause", "Confirmation", "Doesn't belong"] as const;
export type Zone = (typeof ZONES)[number];

export const ZONE_HINT: Record<Zone, string> = {
  Clarity: "Who is affected, what they are trying to do, what is broken, how severe",
  Consequence: "What happens if we don't solve it",
  Cause: "Why it exists (from the Five Whys)",
  Confirmation: "Data showing it is real and significant",
  "Doesn't belong": "A solution in disguise or a wish list",
};

export interface Snippet { id: string; text: string; zone: Zone; why: string }

// Worked example from IDG Guide 3 (repeated form-filling), plus two distractors.
export const SNIPPETS: Snippet[] = [
  { id: "a", zone: "Clarity", text: "Citizens fill in the same personal information more than 15 times across platforms.", why: "Who is affected and what is broken." },
  { id: "b", zone: "Clarity", text: "Each form takes 20 to 30 minutes and many give up before finishing, missing benefits they're entitled to.", why: "How severe, and how it hurts the user." },
  { id: "c", zone: "Consequence", text: "Citizens lose access to support they qualify for.", why: "The stakes if nothing changes." },
  { id: "d", zone: "Consequence", text: "Trust in government services erodes, and the burden falls heaviest on those least equipped to navigate complex processes.", why: "More stakes." },
  { id: "e", zone: "Cause", text: "Services are built independently by different agencies, with no shared data layer, so every service asks the same questions again.", why: "The reason it exists. It points to what is right to fix." },
  { id: "f", zone: "Confirmation", text: "68% of transactions are abandoned due to repeated form-filling: about 204,000 of 300,000 a year.", why: "Evidence that the problem is real and significant." },
  { id: "g", zone: "Doesn't belong", text: "We should build a single super app for all agencies.", why: "A solution in disguise. IDG's focus shifts “from the tool to the people.”" },
  { id: "h", zone: "Doesn't belong", text: "We want to be the best digital government in the world.", why: "A wish list item. It does not describe who is affected or what is broken." },
];

export const GATE: MCQ[] = [
  {
    prompt: (
      <>
        Your draft says: <em>“Applicants find the licence form confusing. We will build a chatbot.”</em> It has no Consequence, no Cause and no data. Ready to build?
      </>
    ),
    options: ["Yes, the chatbot is clearly needed", "No: “If you can't complete all four themes, you're probably not ready to build yet.”", "Yes, we can add data later"],
    answer: 1,
    why: "A statement must cover all four C's, and the chatbot is a solution in disguise.",
  },
  {
    prompt: "Which of these is a good consequence?",
    options: ["Citizens lose support they qualify for", "The agency lacks a CRM", "A new portal is needed"],
    answer: 0,
    why: "Consequences carry stakes for people. “If the answer is not much, it may not be worth solving.”",
  },
  {
    prompt: "Where does the Cause come from?",
    options: ["Stakeholder opinions", "The Five Whys", "Vendor proposals"],
    answer: 1,
    why: "Cause is the Five Whys work from the previous level.",
  },
];
