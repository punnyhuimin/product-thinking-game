import { useState } from "react";
import { DndContext, KeyboardSensor, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import type { LevelProps } from "../screens/LevelShell";
import { Quote } from "../components/Quote";
import { Feedback } from "../components/Feedback";
import { MultiChoice } from "../components/MultiChoice";
import { GATE, SNIPPETS, ZONES, ZONE_HINT, type Snippet, type Zone } from "../data/l3";

function Chip({ s, selected, onSelect }: { s: Snippet; selected: boolean; onSelect: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: s.id });
  const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)`, zIndex: 10 } : undefined;
  return (
    <div ref={setNodeRef} style={style} className={`chip ${selected ? "sel" : ""} ${isDragging ? "drag" : ""}`}
      onClick={onSelect} {...listeners} {...attributes}>
      {s.text}
    </div>
  );
}

function Slot({ zone, placed, onTap, active }: { zone: Zone; placed: Snippet[]; onTap: () => void; active: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: zone });
  return (
    <div ref={setNodeRef} className={`slot ${isOver ? "over" : ""} ${active ? "armed" : ""} ${zone === "Doesn't belong" ? "reject" : ""}`} onClick={onTap}>
      <strong>{zone}</strong>
      <small>{ZONE_HINT[zone]}</small>
      {placed.map((p) => <div key={p.id} className="placed">{p.text}</div>)}
    </div>
  );
}

export function L3Statement({ onMistake, onCorrect, onFinish }: LevelProps) {
  const [placed, setPlaced] = useState<Record<string, Zone>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ good: boolean; text: string } | null>(null);
  const [gate, setGate] = useState(-1);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor));

  const drop = (id: string, zone: Zone) => {
    const s = SNIPPETS.find((x) => x.id === id);
    if (!s || placed[id]) return;
    if (s.zone === zone) {
      setPlaced({ ...placed, [id]: zone });
      setMsg({ good: true, text: `${zone}. ${s.why}` });
      onCorrect();
    } else {
      setMsg({ good: false, text: `That doesn't belong in ${zone}. Check what that C asks.` });
      onMistake();
    }
    setSelected(null);
  };
  const onDragEnd = (e: DragEndEvent) => { if (e.over) drop(String(e.active.id), e.over.id as Zone); };

  const remaining = SNIPPETS.filter((s) => !placed[s.id]);

  if (gate >= 0) {
    return (
      <div className="card">
        <p className="kicker">Ready to build? · {gate + 1} of {GATE.length}</p>
        <MultiChoice key={gate} q={GATE[gate]} onResult={(ok) => (ok ? onCorrect() : onMistake())}
          onNext={() => (gate + 1 < GATE.length ? setGate(gate + 1) : onFinish())} nextLabel={gate + 1 < GATE.length ? "Next" : "Finish level"} />
      </div>
    );
  }

  return (
    <>
      <p>Drag each fact into the right C (or tap a fact, then tap a box). Two facts don't belong.</p>
      <Quote source="IDG Guide 3">Not a wish list, not a solution in disguise.</Quote>
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="slots">
          {ZONES.map((z) => (
            <Slot key={z} zone={z} active={selected !== null} placed={SNIPPETS.filter((s) => placed[s.id] === z)}
              onTap={() => selected && drop(selected, z)} />
          ))}
        </div>
        <h2>Facts</h2>
        <div className="chips">
          {remaining.map((s) => <Chip key={s.id} s={s} selected={selected === s.id} onSelect={() => setSelected(selected === s.id ? null : s.id)} />)}
        </div>
      </DndContext>
      {msg && <Feedback good={msg.good}>{msg.text}</Feedback>}
      {remaining.length === 0 && <button className="btn" onClick={() => setGate(0)}>Run the build gate</button>}
    </>
  );
}
