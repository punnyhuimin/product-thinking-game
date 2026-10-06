import { useGame } from "../state/store";
import { Avatar } from "./Avatar";
import { DEFAULT_OUTFIT, SLOT_LABEL, WARDROBE, type Slot } from "../data/wardrobe";

/** Character dress-up. Items unlock at XP thresholds and are never spent. */
export function Wardrobe() {
  const { state, dispatch } = useGame();
  const outfit = { ...DEFAULT_OUTFIT, ...state.outfit };
  const peak = Math.max(state.xp, state.peakXp ?? 0);
  return (
    <div className="card wardrobe">
      <Avatar outfit={outfit} />
      <div className="wardrobe-slots">
        {(Object.keys(WARDROBE) as Slot[]).map((slot) => (
          <div key={slot}>
            <p className="kicker">{SLOT_LABEL[slot]}</p>
            <div className="wardrobe-options">
              {WARDROBE[slot].map((it) => {
                const open = peak >= it.xp;
                return (
                  <button key={it.id} className={`btn ghost chip ${outfit[slot] === it.id ? "on" : ""}`} disabled={!open}
                    aria-pressed={outfit[slot] === it.id} onClick={() => dispatch({ type: "wear", slot, item: it.id })}>
                    {it.label}{!open && <small> · {it.xp} XP</small>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
