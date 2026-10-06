import { DEFAULT_OUTFIT, type Outfit, type Slot } from "../data/wardrobe";
import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from "react";

export const MAX_HEARTS = 5;
const KEY = "product-officer-v1";

export interface GameState {
  xp: number;
  peakXp: number; // highest XP reached, so hints never re-lock wardrobe items
  outfit: Outfit;
  hearts: number;
  completed: Record<number, number>; // level id -> stars (1-3)
  recallDone: Record<number, boolean>;
  puzzles: Record<string, number>; // puzzle id -> stars (1-3)
}

export type Action =
  | { type: "xp"; amount: number }
  | { type: "wear"; slot: Slot; item: string }
  | { type: "lose-heart" }
  | { type: "refill-hearts" }
  | { type: "complete"; level: number; stars: number }
  | { type: "recall-done"; level: number }
  | { type: "puzzle-done"; id: string; stars: number }
  | { type: "reset" };

const initial: GameState = { xp: 0, peakXp: 0, outfit: DEFAULT_OUTFIT, hearts: MAX_HEARTS, completed: {}, recallDone: {}, puzzles: {} };

function reducer(s: GameState, a: Action): GameState {
  switch (a.type) {
    case "xp": {
      const xp = Math.max(0, s.xp + a.amount);
      return { ...s, xp, peakXp: Math.max(s.peakXp ?? 0, xp) };
    }
    case "wear": return { ...s, outfit: { ...DEFAULT_OUTFIT, ...s.outfit, [a.slot]: a.item } };
    case "lose-heart": return { ...s, hearts: Math.max(0, s.hearts - 1) };
    case "refill-hearts": return { ...s, hearts: MAX_HEARTS };
    case "complete":
      return { ...s, completed: { ...s.completed, [a.level]: Math.max(s.completed[a.level] ?? 0, a.stars) } };
    case "recall-done": return { ...s, recallDone: { ...s.recallDone, [a.level]: true } };
    case "puzzle-done":
      return { ...s, puzzles: { ...s.puzzles, [a.id]: Math.max(s.puzzles[a.id] ?? 0, a.stars) } };
    case "reset": return initial;
  }
}

function load(): GameState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...initial, ...JSON.parse(raw) };
  } catch { /* storage unavailable */ }
  return initial;
}

const Ctx = createContext<{ state: GameState; dispatch: Dispatch<Action> } | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state]);
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useGame() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useGame outside GameProvider");
  return c;
}
