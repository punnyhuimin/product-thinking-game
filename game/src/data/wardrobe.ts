export type Slot = "hat" | "tool" | "backdrop";

export interface WardrobeItem { id: string; label: string; xp: number }

/** Items unlock when peak XP reaches the threshold. "none" is always free. */
export const WARDROBE: Record<Slot, WardrobeItem[]> = {
  hat: [
    { id: "none", label: "No hat", xp: 0 },
    { id: "sticky", label: "Sticky note", xp: 50 },
    { id: "hardhat", label: "Hard hat", xp: 150 },
    { id: "crown", label: "Officer crown", xp: 300 },
  ],
  tool: [
    { id: "none", label: "Empty hands", xp: 0 },
    { id: "marker", label: "Marker", xp: 80 },
    { id: "magnifier", label: "Magnifier", xp: 200 },
    { id: "compass", label: "Compass", xp: 350 },
  ],
  backdrop: [
    { id: "none", label: "Plain", xp: 0 },
    { id: "sunrise", label: "Sunrise", xp: 100 },
    { id: "whiteboard", label: "Whiteboard", xp: 250 },
    { id: "night", label: "Night sky", xp: 400 },
  ],
};

export const SLOT_LABEL: Record<Slot, string> = { hat: "Hat", tool: "Tool", backdrop: "Backdrop" };
export type Outfit = Record<Slot, string>;
export const DEFAULT_OUTFIT: Outfit = { hat: "none", tool: "none", backdrop: "none" };
