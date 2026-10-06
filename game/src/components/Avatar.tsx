import type { Outfit } from "../data/wardrobe";

/** The player's character: a simple figure dressed from the wardrobe. */
export function Avatar({ outfit }: { outfit: Outfit }) {
  const { hat, tool, backdrop } = outfit;
  return (
    <svg className="avatar" viewBox="0 0 120 120" role="img" aria-label="Your character">
      {backdrop === "none" && <rect width="120" height="120" fill="var(--accent-soft)" />}
      {backdrop === "sunrise" && (<>
        <rect width="120" height="120" fill="#f6c58e" />
        <circle cx="60" cy="96" r="38" fill="#f08a4b" />
        <rect y="96" width="120" height="24" fill="#c9693a" />
      </>)}
      {backdrop === "whiteboard" && (<>
        <rect width="120" height="120" fill="#f3f4f1" />
        <rect x="6" y="6" width="108" height="108" fill="none" stroke="#b9bdb5" strokeWidth="3" />
        <path d="M16 24h36M16 34h24M74 24h30M74 34h22" stroke="#6a8fb8" strokeWidth="2.5" strokeLinecap="round" />
      </>)}
      {backdrop === "night" && (<>
        <rect width="120" height="120" fill="#1d2440" />
        <circle cx="96" cy="22" r="9" fill="#f1e7b5" />
        <g fill="#f1e7b5"><circle cx="18" cy="20" r="1.5" /><circle cx="40" cy="12" r="1.2" /><circle cx="28" cy="40" r="1.2" /><circle cx="76" cy="38" r="1.5" /><circle cx="104" cy="56" r="1.2" /></g>
      </>)}

      <path d="M24 120c0-26 16-38 36-38s36 12 36 38z" fill="#3d5a80" />
      <rect x="53" y="68" width="14" height="14" fill="#e9b996" />
      <circle cx="60" cy="52" r="22" fill="#f1c9a8" />
      <circle cx="52" cy="52" r="2.4" fill="#2a211b" />
      <circle cx="68" cy="52" r="2.4" fill="#2a211b" />
      <path d="M52 62q8 6 16 0" fill="none" stroke="#2a211b" strokeWidth="2.2" strokeLinecap="round" />

      {hat === "sticky" && (<>
        <rect x="42" y="26" width="36" height="30" fill="#f7d94c" transform="rotate(-8 60 40)" />
        <path d="M48 36h24M48 43h16" stroke="#a88a10" strokeWidth="2" strokeLinecap="round" transform="rotate(-8 60 40)" />
      </>)}
      {hat === "hardhat" && (<>
        <path d="M36 44a24 24 0 0 1 48 0z" fill="#f2b705" />
        <rect x="32" y="43" width="56" height="6" rx="3" fill="#d99a00" />
        <rect x="56" y="22" width="8" height="22" fill="#d99a00" />
      </>)}
      {hat === "crown" && (<>
        <path d="M40 38l5-16 10 10 5-14 5 14 10-10 5 16z" fill="#e0b13a" stroke="#a37a14" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="60" cy="24" r="2.4" fill="#9a3b1f" />
      </>)}

      {tool === "marker" && (<>
        <rect x="88" y="62" width="8" height="38" rx="2" fill="#2f6b3a" transform="rotate(18 92 80)" />
        <rect x="88" y="56" width="8" height="10" fill="#222" transform="rotate(18 92 80)" />
      </>)}
      {tool === "magnifier" && (<>
        <circle cx="94" cy="76" r="13" fill="#cfe6f2" fillOpacity=".6" stroke="#6b4a2a" strokeWidth="4" />
        <path d="M103 86l10 12" stroke="#6b4a2a" strokeWidth="5" strokeLinecap="round" />
      </>)}
      {tool === "compass" && (<>
        <circle cx="94" cy="80" r="14" fill="#f6f1e3" stroke="#6b4a2a" strokeWidth="3" />
        <path d="M94 70l4 10-4 10-4-10z" fill="#9a2a2a" />
        <circle cx="94" cy="80" r="2" fill="#222" />
      </>)}
    </svg>
  );
}
