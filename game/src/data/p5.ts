// Level 5 puzzle: choose experiments within a budget to cover the most risk.
export interface Assumption { id: string; text: string; kind: "Market" | "Technical" | "Team"; risk: number }
export interface Test { id: string; text: string; cost: number; covers: string[]; note: string }

export const BUDGET = 7;

export const ASSUMPTIONS: Assumption[] = [
  { id: "A1", text: "People will book their vaccination online", kind: "Market", risk: 5 },
  { id: "A2", text: "We can read clinic calendars automatically", kind: "Technical", risk: 3 },
  { id: "A3", text: "Policy, ops and tech can decide together", kind: "Team", risk: 2 },
];

// Costs are in weeks and are invented for the game.
export const TESTS: Test[] = [
  { id: "concierge", text: "Concierge test: a FormSG form feeding Excel, with a product manager phoning clinics by hand", cost: 2, covers: ["A1"], note: "IDG's own approach: not scalable, but the lowest-cost validation." },
  { id: "platform", text: "Build the full booking platform and integrate every clinic", cost: 8, covers: ["A1", "A2"], note: "Covers two risks but over-invests before you know anyone will book." },
  { id: "spike", text: "One-clinic calendar integration spike", cost: 2, covers: ["A2"], note: "Cheap proof the integration is feasible." },
  { id: "sprint", text: "One-week joint sprint with policy, ops and tech, with clear owners", cost: 3, covers: ["A3"], note: "Tests whether the team can decide and act together." },
  { id: "survey", text: "Survey 1,000 residents on what they would do", cost: 3, covers: [], note: "Says what people say, not what they do. It tests none of the assumptions." },
  { id: "abletter", text: "A/B letter test: standard letter vs a QR code to the booking flow", cost: 3, covers: ["A1"], note: "Valid, but costs more than the concierge test for the same assumption." },
];
