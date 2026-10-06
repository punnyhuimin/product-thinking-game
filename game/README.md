# Product Officer

A single-page game that teaches IDG's AI Build 301 product thinking pathway. No backend or database: progress is stored in `localStorage`.

## Run

```
npm install
npm run dev      # development
npm run build    # type-check and production build into dist/
npm run preview  # serve the production build
```

## Levels

1. Triage: problem-first vs solution-first, output vs outcome (card sorter, keys 1/2)
2. Why Ladder: build Five Whys chains, then pick the right rung to fix
3. Statement Builder: drag facts into the 4Cs (tap-to-place also works)
4. Metric Forge: SMART metrics and leading to lagging indicators
5. Risk Lab: market/technical/team risk, the A/B reveal, stages of de-risking
6. 11-Star Dial: stretch the experience, pick what fits the budget
7. Boss: one vague request through the whole toolkit

Every level starts with a warm-up on the previous one. Content lives in `src/data/`, sourced from `../sources/idg/transcripts/`. Effort costs in level 6 and the licence portal case in level 2 are invented for the game and labelled as such.
