// Level 6 puzzle: pick the first release. Numbers are invented for the game, not from IDG.
export const CAPACITY = 7;
export const NEED = 3;
export const WHO = ["Organisers", "Consumers", "Merchants"] as const;

export interface Feature { id: string; text: string; cost: number; gain: [number, number, number] }

export const FEATURES: Feature[] = [
  { id: "qr", text: "One-tap QR redemption", cost: 2, gain: [0, 2, 2] },
  { id: "dash", text: "Campaign dashboard", cost: 3, gain: [3, 0, 0] },
  { id: "budget", text: "Voucher budget controls", cost: 2, gain: [2, 0, 0] },
  { id: "game", text: "Loyalty gamification", cost: 3, gain: [0, 2, 0] },
  { id: "payout", text: "Instant merchant payout", cost: 3, gain: [0, 0, 3] },
  { id: "lang", text: "Multilingual screens", cost: 2, gain: [0, 2, 1] },
  { id: "analytics", text: "Real-time analytics", cost: 4, gain: [2, 0, 1] },
];
