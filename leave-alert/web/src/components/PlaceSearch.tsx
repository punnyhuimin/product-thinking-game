import { useEffect, useState } from "react";
import type { KeyboardEvent } from "react";
import { searchPlaces } from "../trip/api";
import type { Place } from "../trip/types";
import type { ControlProps } from "./Field";

type Props = {
  control: ControlProps;
  value: Place | null;
  placeholder: string;
  onPick: (place: Place | null) => void;
};

// Address combobox: type 3+ characters, then pick a suggestion from /api/search.
export function PlaceSearch({ control, value, placeholder, onPick }: Props) {
  const [text, setText] = useState(value?.label ?? "");
  const [results, setResults] = useState<Place[]>([]);
  const [note, setNote] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = `${control.id}-list`;

  useEffect(() => {
    const q = text.trim();
    setResults([]);
    setActive(-1);
    setNote("");
    if (value || q.length < 3) return;
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      setNote("Searching...");
      const res = await searchPlaces(q, ctrl.signal);
      if (ctrl.signal.aborted) return;
      if (res.kind === "ok") {
        setResults(res.data);
        setNote(res.data.length ? "" : "No matches. Try a street name or postal code.");
      } else {
        setNote(res.kind === "offline" ? "Search is unavailable: the backend isn't running." : `Search failed: ${res.message}`);
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [text, value]);

  const expanded = open && results.length > 0;

  const pick = (place: Place) => {
    setText(place.label);
    setOpen(false);
    onPick(place);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const n = results.length;
    if (e.key === "ArrowDown" && n) {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % n);
    } else if (e.key === "ArrowUp" && n) {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i <= 0 ? n - 1 : i - 1));
    } else if (e.key === "Enter" && expanded) {
      e.preventDefault();
      pick(results[Math.max(active, 0)]);
    } else if (e.key === "Escape" && expanded) {
      e.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div className="combo">
      <input
        {...control}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={listId}
        aria-activedescendant={expanded && active >= 0 ? `${listId}-${active}` : undefined}
        value={text}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => {
          setText(e.target.value);
          setOpen(true);
          if (value) onPick(null);
        }}
        onKeyDown={onKeyDown}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      />
      <ul id={listId} role="listbox" className="combo-list" hidden={!expanded}>
        {results.map((p, i) => (
          <li
            key={`${p.postal}-${p.lat}-${p.lng}-${i}`}
            id={`${listId}-${i}`}
            role="option"
            aria-selected={i === active}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => pick(p)}
          >
            <span className="combo-label">{p.label}</span>
            <span className="combo-address">{p.address}</span>
          </li>
        ))}
      </ul>
      <p className="combo-note" aria-live="polite">{open ? note : ""}</p>
    </div>
  );
}
