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

Every level ends with a puzzle (skippable, bonus XP when solved). Solving it unlocks a debrief quiz question about what the puzzle showed (`src/data/debrief.ts`), scored with the level's hearts and stars:

1. Strip the solution: tap the words that smuggle a solution into a request
2. Licence web: a cause web with locked nodes and a 3-fix budget
3. Statement shuffle: swap scrambled sentences into the right C
4. Metric builder: assemble a metric and test it against SMART
5. Experiment planner: pick tests within a budget to cover the most risk
6. Release trade-offs: give three users their essentials within capacity
7. Toolkit memory match: pair each tool with the question it answers

The Puzzle Room (unlocks after level 2) holds four standalone cause webs. Every level starts with a warm-up on the previous one. Content lives in `src/data/`, sourced from `../sources/idg/transcripts/`. Effort costs in level 6 and the licence portal case in level 2 are invented for the game and labelled as such.
