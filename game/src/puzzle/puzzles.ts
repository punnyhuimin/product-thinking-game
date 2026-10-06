import type { CausePuzzle } from "./graph";

export const PUZZLES: CausePuzzle[] = [
  {
    id: "grants",
    title: "The grants tangle",
    intro: "IDG's grants chain, with a second cause added. You have 1 fix. Each fix clears a node and everything that only depended on it.",
    budget: 1,
    lesson: "Incomplete applications was the choke-point: both the back-and-forth and the give-ups flow through it. Fixing the jargon form alone leaves the agency's internal-first habit feeding the same node.",
    nodes: [
      { id: "T", text: "Applicants can't access grants", col: 3, row: 1, ctrl: false, causes: ["A", "B"], symptom: true },
      { id: "A", text: "Slow processing", col: 2, row: 0, ctrl: true, causes: ["C"] },
      { id: "B", text: "Applicants give up mid-way", col: 2, row: 2, ctrl: true, causes: ["D"] },
      { id: "C", text: "Back and forth with officers", col: 1, row: 0, ctrl: true, causes: ["D"] },
      { id: "D", text: "Incomplete applications", col: 1, row: 2, ctrl: true, causes: ["E", "F"] },
      { id: "E", text: "Jargon-filled form", col: 0, row: 1, ctrl: true, causes: [] },
      { id: "F", text: "Forms designed around agency process", col: 0, row: 3, ctrl: true, causes: [] },
    ],
  },
  {
    id: "hotline",
    title: "The overloaded hotline",
    intro: "Illustrative case, not from IDG. 🔒 nodes are outside your control. You have 4 fixes. Find the cheapest cut.",
    budget: 4,
    lesson: "When a cause is locked you can't fix the symptom directly, so you work upstream or cut a controllable node above it. Fixing the status page, both document causes and the English-only forms clears it in 4, and no fix is wasted.",
    nodes: [
      { id: "T", text: "Hotline overwhelmed", col: 3, row: 1, ctrl: false, causes: ["X1", "X2", "X3"], symptom: true },
      { id: "X1", text: "Callers can't track status", col: 2, row: 0, ctrl: true, causes: ["R1", "R2"] },
      { id: "X2", text: "Callers miss required documents", col: 2, row: 1, ctrl: false, causes: ["R3", "R4"] },
      { id: "X3", text: "Callers need help in other languages", col: 2, row: 2, ctrl: false, causes: ["R5"] },
      { id: "R1", text: "No status page", col: 0, row: 0, ctrl: true, causes: [] },
      { id: "R2", text: "Vendor-locked case system", col: 1, row: 0, ctrl: false, causes: [] },
      { id: "R3", text: "Checklist on a separate page", col: 0, row: 1, ctrl: true, causes: [] },
      { id: "R4", text: "Guidance written in legalese", col: 1, row: 1, ctrl: true, causes: [] },
      { id: "R5", text: "Forms only in English", col: 0, row: 2, ctrl: true, causes: [] },
    ],
  },
  {
    id: "reminders",
    title: "Missed appointments",
    intro: "Illustrative case. Policy, ops and tech each hold their own records. You have 1 fix. Look upstream.",
    budget: 1,
    lesson: "Principle 3: no initiative succeeds when policy, ops and tech work in silos. One shared root fed every branch, and fixing it cleared both the reminders and the clinic-hours problem, even the locked node.",
    nodes: [
      { id: "T", text: "Elderly residents miss appointments", col: 3, row: 1, ctrl: false, causes: ["M1", "M2"], symptom: true },
      { id: "M1", text: "Reminders go unseen", col: 2, row: 0, ctrl: false, causes: ["E1", "E2"] },
      { id: "M2", text: "Can't attend at clinic hours", col: 2, row: 2, ctrl: true, causes: ["E3"] },
      { id: "E1", text: "Reminders are email-only", col: 1, row: 0, ctrl: true, causes: ["S"] },
      { id: "E2", text: "Contact details out of date", col: 1, row: 1, ctrl: true, causes: ["S"] },
      { id: "E3", text: "Clinic hours clash with caregiver availability", col: 1, row: 2, ctrl: false, causes: ["S"] },
      { id: "S", text: "Policy, ops and tech hold separate records", col: 0, row: 1, ctrl: true, causes: [] },
    ],
  },
];
