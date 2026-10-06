export interface CauseNode {
  id: string;
  text: string;
  col: number;
  row: number;
  /** Within your sphere of influence? Locked nodes can't be fixed. */
  ctrl: boolean;
  /** Ids of nodes that cause this one. */
  causes: string[];
  /** The symptom you are trying to clear. Never fixable directly. */
  symptom?: boolean;
}

export interface CausePuzzle {
  id: string;
  title: string;
  intro: string;
  /** Max fixes you may apply. */
  budget: number;
  nodes: CauseNode[];
  /** Shown after solving. */
  lesson: string;
}

/** A node is active if unfixed and it is a root, or any of its causes is active. */
export function activeSet(nodes: CauseNode[], fixed: Set<string>): Set<string> {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const memo = new Map<string, boolean>();
  const isActive = (id: string): boolean => {
    const hit = memo.get(id);
    if (hit !== undefined) return hit;
    const n = byId.get(id)!;
    const v = !fixed.has(id) && (n.causes.length === 0 || n.causes.some(isActive));
    memo.set(id, v);
    return v;
  };
  return new Set(nodes.filter((n) => isActive(n.id)).map((n) => n.id));
}

export function solved(nodes: CauseNode[], fixed: Set<string>): boolean {
  const t = nodes.find((n) => n.symptom)!;
  return !activeSet(nodes, fixed).has(t.id);
}

/** Smallest set of fixable nodes that clears the symptom (brute force; graphs are tiny). */
export function optimum(nodes: CauseNode[]): string[] {
  const fixable = nodes.filter((n) => n.ctrl && !n.symptom).map((n) => n.id);
  for (let k = 0; k <= fixable.length; k++) {
    const found = combos(fixable, k).find((c) => solved(nodes, new Set(c)));
    if (found) return found;
  }
  return [];
}

function combos(items: string[], k: number): string[][] {
  if (k === 0) return [[]];
  if (items.length < k) return [];
  const [h, ...rest] = items;
  return [...combos(rest, k - 1).map((c) => [h, ...c]), ...combos(rest, k)];
}
