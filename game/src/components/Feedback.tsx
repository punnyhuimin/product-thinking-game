export function Feedback({ good, children }: { good: boolean; children: React.ReactNode }) {
  return <div className={`feedback ${good ? "good" : "bad"}`} role="status">{children}</div>;
}
