import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from "react";

export const MAX_HEARTS = 5;
const KEY = "product-officer-v1";

export interface GameState {
  xp: number;
  hearts: number;
  completed: Record<number, number>; // level id -> stars (1-3)
  recallDone: Record<number, boolean>;
}

export type Action =
  | { type: "xp"; amount: number }
  | { type: "lose-heart" }
  | { type: "refill-hearts" }
  | { type: "complete"; level: number; stars: number }
  | { type: "recall-done"; level: number }
  | { type: "reset" };

const initial: GameState = { xp: 0, hearts: MAX_HEARTS, completed: {}, recallDone: {} };

function reducer(s: GameState, a: Action): GameState {
  switch (a.type) {
    case "xp": return { ...s, xp: s.xp + a.amount };
    case "lose-heart": return { ...s, hearts: Math.max(0, s.hearts - 1) };
    case "refill-hearts": return { ...s, hearts: MAX_HEARTS };
    case "complete":
      return { ...s, completed: { ...s.completed, [a.level]: Math.max(s.completed[a.level] ?? 0, a.stars) } };
    case "recall-done": return { ...s, recallDone: { ...s.recallDone, [a.level]: true } };
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
