import { useEffect, useMemo, useState } from "react";
import { Feedback } from "../components/Feedback";
import { MAX_TRIES, PAIRS } from "../data/p7";

interface Card { key: string; pair: number; text: string; isTool: boolean }

function deal(): Card[] {
  const cards = PAIRS.flatMap((p, i) => [
    { key: `t${i}`, pair: i, text: p.tool, isTool: true },
    { key: `q${i}`, pair: i, text: p.q, isTool: false },
  ]);
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

/** Flip two cards at a time: pair each tool with the question it answers. */
export function P7Memory({ onWin }: { onWin: () => void }) {
  const [round, setRound] = useState(0);
  const cards = useMemo(deal, [round]);
  const [open, setOpen] = useState<string[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [tries, setTries] = useState(0);
  const won = matched.length === PAIRS.length;
  const out = tries >= MAX_TRIES && !won;

  useEffect(() => { if (won) onWin(); }, [won]); // eslint-disable-line react-hooks/exhaustive-deps

  const flip = (c: Card) => {
    if (open.length >= 2 || open.includes(c.key) || matched.includes(c.pair) || out) return;
    const next = [...open, c.key];
    setOpen(next);
    if (next.length === 2) {
      const [a, b] = next.map((k) => cards.find((x) => x.key === k)!);
      setTries(tries + 1);
      if (a.pair === b.pair && a.isTool !== b.isTool) {
        setTimeout(() => { setMatched((m) => [...m, a.pair]); setOpen([]); }, 450);
      } else {
        setTimeout(() => setOpen([]), 900);
      }
    }
  };
  const reshuffle = () => { setRound(round + 1); setOpen([]); setMatched([]); setTries(0); };

  return (
    <div className="card">
      <p>Pair each tool with the question it answers. Matches left: {PAIRS.length - matched.length}. Tries: {tries} / {MAX_TRIES}.</p>
      <div className="memory">
        {cards.map((c) => {
          const shown = open.includes(c.key) || matched.includes(c.pair);
          return (
            <button key={c.key} className={`mcard ${shown ? "up" : ""} ${matched.includes(c.pair) ? "got" : ""} ${c.isTool ? "tool" : ""}`}
              onClick={() => flip(c)} aria-label={shown ? c.text : "Hidden card"}>
              {shown ? c.text : "?"}
            </button>
          );
        })}
      </div>
      {out && <Feedback good={false}>Out of tries. Reshuffle and try again.</Feedback>}
      {won && <Feedback good>All six tools matched to their questions. That is the whole pathway: why, problem statement, metrics, risk and scale, CX.</Feedback>}
      {out && <button className="btn" onClick={reshuffle}>Reshuffle</button>}
    </div>
  );
}
