// Level 1 puzzle: strip the solution out of each request to reveal the need.
export interface Chunk { t: string; sol?: boolean }
export interface Request { chunks: Chunk[]; need: string; clean?: boolean }

export const REQUESTS: Request[] = [
  {
    chunks: [{ t: "We need" }, { t: "an AI chatbot", sol: true }, { t: "so citizens can check their grant status without calling the hotline." }],
    need: "Citizens can't check their grant status and end up calling the hotline.",
  },
  {
    chunks: [{ t: "Let's build" }, { t: "a mobile app", sol: true }, { t: "and" }, { t: "a dashboard", sol: true }, { t: "because officers can't see which cases are overdue." }],
    need: "Officers can't see which cases are overdue.",
  },
  {
    chunks: [{ t: "We should" }, { t: "buy a CRM platform", sol: true }, { t: "to fix long wait times for citizens." }],
    need: "Citizens wait too long.",
  },
  {
    chunks: [{ t: "Many elderly residents miss clinic appointments because reminders only go out by email." }],
    need: "Already problem-first: who, what they're trying to do, what's in the way.",
    clean: true,
  },
  {
    chunks: [{ t: "Our" }, { t: "super app", sol: true }, { t: "will let businesses renew licences in one place." }],
    need: "Businesses can't renew licences easily. IDG's example: Grab began with one goal, taxis that are safer, more reliable and easier to book.",
  },
];
