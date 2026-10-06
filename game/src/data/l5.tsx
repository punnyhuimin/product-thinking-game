import type { SortItem } from "../components/Sorter";
import type { MCQ } from "../components/MultiChoice";

export const RISK_BUCKETS = ["Market", "Technical", "Team"];

export const RISKS: SortItem[] = [
  { text: "Will elderly residents actually book their vaccination online?", answer: "Market", why: "“Would people actually book online?” is IDG's own market risk." },
  { text: "Is the solution too complex or costly to build relative to the impact it delivers?", answer: "Technical", why: "That is the definition of technical risk." },
  { text: "Policy, ops and tech sit in separate teams and none can act alone.", answer: "Team", why: "Team risk: “bring together policy, ops and tech expertise in one team with actual levers to act.”" },
  { text: "Even if people use it, will it actually solve the problem?", answer: "Market", why: "Market risk covers both: will anyone use it, and will it solve the problem?" },
  { text: "Nobody is sure who owns the decision on clinic partnerships.", answer: "Team", why: "“Ambiguity about who owns what is where good projects start to stall.”" },
  { text: "Can the system handle thousands of clinic slots in real time on this budget?", answer: "Technical", why: "Complexity and cost against impact." },
];

export const TEST_Q: MCQ = {
  prompt: (
    <>
      Singapore's pneumococcal vaccine uptake in high-risk groups was low. The hypothesis: <em>easier booking means more vaccinations.</em> The riskiest assumption is that people will book online. What is the cheapest test?
    </>
  ),
  options: [
    "Build a full booking platform integrated with every clinic",
    "A FormSG form feeding an Excel sheet, with a product manager calling clinics and emailing confirmations by hand",
    "Run a year-long survey on what people say they would do",
  ],
  answer: 1,
  why: "“Not scalable, but that wasn't the point. It was the lowest way to validate the approach.”",
};

export const AFTER_AB: MCQ = {
  prompt: "Why was this a clear test?",
  options: ["It had a huge sample", "One variable changed (the QR code in the letter), with a control group for comparison", "It was run by a vendor"],
  answer: 1,
  why: "“One variable with clear results.” The control got a standard letter, the treatment got a QR code to the booking flow.",
};

export const STAGES = [
  { text: "Proof of concept: does it work? One user segment, one use case", note: "Start small." },
  { text: "Proof of value: can it scale? More segments, more problems", note: "Test the scaling." },
  { text: "Scale: reach as many users as possible", note: "Only after the earlier stages." },
  { text: "Maturity: keep improving over time", note: "Never finished." },
];

export const SKATE_Q: MCQ = {
  prompt: "Which delivery path does IDG prefer?",
  options: [
    "Wheels, then chassis, then body, then a car",
    "Skateboard, scooter, bicycle, motorcycle, car",
    "Build the car first, then test it",
  ],
  answer: 1,
  why: "“At every stage, users have something functional. At every stage, we are learning something.”",
};
