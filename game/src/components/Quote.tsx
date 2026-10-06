export function Quote({ children, source }: { children: React.ReactNode; source: string }) {
  return (
    <blockquote className="quote">
      “{children}”
      <small>{source}</small>
    </blockquote>
  );
}
