import type { WhyChain } from "../components/WhyLadder";

export const CHAINS: WhyChain[] = [
  {
    title: "Warm-up · The flat battery (IDG, Guide 2)",
    start: "You were late to work this morning.",
    steps: [
      { options: ["You woke up late.", "Traffic was bad.", "You skipped breakfast."], answer: 0, why: "You woke up late." },
      { options: ["Your alarm didn't go off.", "You stayed up watching TV.", "Your phone was lost."], answer: 0, why: "The alarm didn't go off." },
      { options: ["The battery was flat.", "The alarm was set for the wrong day.", "The clock is old."], answer: 0, why: "The battery was flat." },
      { options: ["You forgot to replace it.", "Batteries are expensive.", "Someone moved the clock."], answer: 0, why: "You forgot to replace it." },
    ],
    fix: {
      prompt: "Which fix addresses the problem?",
      options: ["Buy a new alarm clock", "Replace the battery (and remember to check it)", "Move to a flat nearer the office"],
      answer: 1,
      why: "“The fix isn't a new alarm clock. It's replacing the battery. A small intervention solves the entire problem.”",
    },
  },
  {
    title: "Case 1 · Grants (IDG, Guide 2)",
    start: "Applicants can't access grants.",
    steps: [
      { options: ["Applications take too long to process.", "Applicants don't read the website.", "The grant budget is too small."], answer: 0, why: "Slow processing blocks access." },
      { options: ["Officers spend too much time going back and forth with applicants.", "Servers are slow.", "Approval needs many signatures."], answer: 0, why: "Rework loops eat the time." },
      { options: ["Applications come in incomplete.", "Applicants submit too early.", "Officers are on leave."], answer: 0, why: "Incomplete applications trigger the back and forth." },
      { options: ["The form is full of internal jargon.", "Applicants are careless.", "The deadline is too short."], answer: 0, why: "It was designed around how the agency works, not how applicants think." },
    ],
    fix: {
      prompt: "Which rung do you fix?",
      options: [
        "Processing time: hire more officers",
        "The back and forth: build a chat tool",
        "Incomplete applications: send reminders",
        "The jargon-filled form: redesign it around how applicants think",
      ],
      answer: 3,
      why: "“The last answer here is the real problem to solve. Not processing time, not back and forth, the simple form itself.”",
    },
  },
  {
    title: "Case 2 · Licence portal (illustrative, not from IDG)",
    start: "Small businesses abandon the licence application.",
    steps: [
      { options: ["They can't tell which documents to upload.", "They prefer paper.", "The fee is too high."], answer: 0, why: "Uncertainty about documents makes them stop." },
      { options: ["The document checklist sits on a separate page.", "Applicants skim.", "The portal is slow."], answer: 0, why: "They never see the list while filling the form." },
      { options: ["The portal was built by a vendor with a fixed layout.", "Designers forgot.", "No one asked for it."], answer: 0, why: "The layout came with the vendor's template." },
      { options: ["The vendor contract only allows changes at a yearly review.", "Vendors are slow.", "Budget is tight."], answer: 0, why: "Changes are locked to the annual review." },
    ],
    fix: {
      prompt: "You don't always fix the last why. Which rung is within your control and strongly tied to the outcome?",
      options: [
        "The yearly vendor contract review (out of your hands)",
        "The checklist living on a separate page",
        "Applicants who skim",
        "Nothing, wait for the review",
      ],
      answer: 1,
      why: "“Focus on the ones within your control.” A copy change or inline checklist can ship now, and it directly reduces drop-off.",
    },
  },
];
