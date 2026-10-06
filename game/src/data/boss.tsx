import type { MCQ } from "../components/MultiChoice";

export interface BossStep { tool: string; q: MCQ }

// One vague request run through the whole toolkit, in IDG's pathway order.
export const REQUEST = "We need an AI chatbot to answer questions about the grants scheme.";

export const STEPS: BossStep[] = [
  {
    tool: "Problem first",
    q: {
      prompt: "Your director says: “We need an AI chatbot to answer questions about the grants scheme.” Which reframe starts from the problem?",
      options: [
        "Build the chatbot on a larger language model",
        "Small business owners abandon grant applications and call the hotline, because they can't tell what the form is asking",
        "Which chatbot vendor is cheapest?",
      ],
      answer: 1,
      why: "It names who, what they are trying to do, and what is in the way, with no technology assumed.",
    },
  },
  {
    tool: "Five Whys",
    q: {
      prompt: (
        <>
          You ask why. Calls are high → applicants are confused → <em>the form uses internal jargon</em> → it was designed around how the agency works. Which do you fix?
        </>
      ),
      options: [
        "Call volume: hire more hotline staff",
        "The jargon-filled form: it is within your control and strongly connected to the outcome",
        "Applicant confusion: run a campaign",
      ],
      answer: 1,
      why: "The same logic as IDG's grants example: “the simple form itself.”",
    },
  },
  {
    tool: "4Cs",
    q: {
      prompt: "Your draft states who is affected and what is broken, and says calls are up. It has no stakes, no cause and no data. Which C do you add first so it points at what to fix?",
      options: ["Cause, from the Five Whys", "A budget", "A launch date"],
      answer: 0,
      why: "Cause “points to what's right to fix, not just what's wrong.” You still need Consequence and Confirmation before building.",
    },
  },
  {
    tool: "Metrics",
    q: {
      prompt: "Pick the best metric for the problem.",
      options: [
        "Number of chatbot conversations",
        "Improve applicant happiness",
        "Reduce hotline calls per submitted application from 40% to 25% within 3 months",
      ],
      answer: 2,
      why: "Specific, measurable, relevant to the problem and time-bound. Conversations are an output.",
    },
  },
  {
    tool: "Leading vs lagging",
    q: {
      prompt: "Which is the best leading indicator to watch in week 2 of a revised form?",
      options: [
        "Share of applicants who finish the form without leaving the page",
        "Quarterly processing time",
        "Total grants awarded this year",
      ],
      answer: 0,
      why: "It arrives fast and is linked to the outcome. Quarterly measures lag.",
    },
  },
  {
    tool: "Risk",
    q: {
      prompt: "Your riskiest assumption is that plain-language forms will actually cut incomplete applications. Cheapest test?",
      options: [
        "Rebuild the whole portal",
        "Send the plain-language form to half of new applicants and compare completion against the original",
        "Ask staff what they think",
      ],
      answer: 1,
      why: "One variable, a control group, and real behaviour. “Watch what they do, not just what they say.”",
    },
  },
  {
    tool: "Staged delivery",
    q: {
      prompt: "How do you roll out?",
      options: [
        "Redesign every agency form at once",
        "Start with one grant and one applicant segment, learn, then scale what works",
        "Wait for a perfect design",
      ],
      answer: 1,
      why: "“Do the skateboard before you do the car.”",
    },
  },
  {
    tool: "Mindset shifts",
    q: {
      prompt: "Which are IDG's three mindset shifts?",
      options: [
        "Solutions to problems, outputs to outcomes, big-bang to staged delivery",
        "Speed to quality, tools to talent, cost to value",
        "Plan to build, build to launch, launch to maintain",
      ],
      answer: 0,
      why: "“Start with what's broken, not what technology is available.”",
    },
  },
];
