// Defines a term on first use: dotted underline, definition on hover/focus/tap.
export function Term({ def, children }: { def: string; children: React.ReactNode }) {
  return (
    <span className="term" tabIndex={0} title={def} data-def={def}>
      {children}
    </span>
  );
}
