# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What's in this repo

Three unrelated pieces share one repo:

1. **Course material for learning IDG's Product Thinking pathway** (the user's goals are in `MISSION.md`; the user's learning preferences are in `NOTES.md`; the source list is in `RESOURCES.md`). Lessons in `lessons/` and the reference sheet in `reference/` are static HTML. They use `assets/course.css` and `assets/components.js`, a dependency-free script that must keep working from `file://`. `learning-records/` logs what the user knows.
2. **`game/`**: "Product Officer", a React 19 + Vite single-page game that teaches the same pathway. It has no backend.
3. **`leave-alert/`**: a Singapore commute "when should I leave" app. A Node server (`server/`) runs a Telegram bot and polls live data. A React + Leaflet front end (`web/`) plans trips.

Each app has its own `package.json`. There is no root package and no workspace tooling, so run commands from the app's own directory.

## Commands

```sh
# game/
npm run dev        # Vite dev server
npm run build      # tsc --noEmit + vite build (this is the only type-check; no linter or tests)

# leave-alert/ (server: no dependencies and no build; Node runs .ts directly via --experimental-strip-types)
cp .env.example .env
npm run server     # local, loads .env, listens on :8787
npm test           # node:test over server/*.test.ts
node --experimental-strip-types --test server/leaveTime.test.ts                       # one file
node --experimental-strip-types --test --test-name-pattern="dry trip" server/*.test.ts # one test
node --env-file=.env --experimental-strip-types server/ltaCheck.ts <stopCode> <serviceNo>  # live LTA bus check
node --experimental-strip-types server/weatherCheck.ts [area]                              # live rain check

# leave-alert/web/
npm run dev        # Vite proxies /api to localhost:8787; add ?mock to the URL to use sample data with no backend
npm run build
```

Server imports use explicit `.ts` extensions (`import ... from "./trip.ts"`), which `--experimental-strip-types` requires. Keep to erasable TypeScript syntax: no enums, namespaces or parameter properties.

## Course content rules (lessons and game data)

- Ground everything in IDG's own material. The verbatim source is `sources/idg/transcripts/` (plus the guide text in `sources/idg/*.txt`), and lessons quote it with a citation. `sources/secondary-research.md` is lower trust.
- Content made up for the game (such as level 6's effort costs and level 2's licence portal case) must be labelled as invented.
- The user is new to product work: define every term the first time it's used. Lessons run 5–10 minutes, open with 1–2 recall questions on the previous lesson, and end with a quiz. They follow IDG's guide order 1→7.

## game/ architecture

- `App.tsx` switches between `CampaignMap`, `PuzzleRoom` and `LevelShell`. Levels are registered by number in `src/levels/index.ts`.
- **`LevelShell` contract**: each level component gets `onCorrect` (+XP and a progress tick), `onMistake` (costs a heart; at 0 hearts the level is lost and restarts) and `onFinish`. The shell handles the warm-up recall (`data/recall.ts`, keyed by the level that asks it), hearts, stars and the results card.
- **Progress totals are derived, not hard-coded**: `LevelMeta.steps` in `data/levels.ts` is computed from the lengths of each level's data arrays, plus fixed extras (`PUZZLE = 2` for the closing puzzle and its debrief, plus one-off questions). If you add or remove a question, or change how many times a level calls `onCorrect`, update that formula too, or the progress bar will be wrong.
- Level content lives in `src/data/` (`lN` = level N, `pN` = the puzzle closing level N, except level 2, whose cause web is in `src/puzzle/puzzles.ts`; `debrief.ts` = the post-puzzle questions). The UI lives in `src/levels/` and the shared interaction components (Sorter, MultiChoice, Orderer, CauseWeb and others) in `src/components/`.
- Cause-web puzzles (`src/puzzle/`): a node is active while it is unfixed and either has no causes or has an active cause. A puzzle is solved when the symptom is inactive within the fix budget. Locked nodes (`ctrl: false`) can't be fixed.
- State is a reducer in `state/store.tsx`, saved to `localStorage` under `product-officer-v1`. On load, saved state is shallow-merged over `initial`, so new top-level fields need a default in `initial`. A change to an existing field's shape needs a new key or a migration.
- `vite.config.ts` uses `base: "./"`, so the build works from any path.

## leave-alert/ architecture

- **Server state is in memory and allows one trip at a time** (`server/index.ts`). A restart loses the trip. Only one Telegram chat can use the bot: `TELEGRAM_CHAT_ID`, or the first private chat to message it.
- **Loop**: `setInterval(tick, POLL_SECONDS)` → `checkTrip` (LTA bus arrival at the first transit stop plus a data.gov.sg rain forecast) → `computeLeaveTime` → `nextAlert` decides between heads-up, update (leave time moved ≥3 min) and go → Telegram message.
- **Pure logic is kept separate from I/O so it can be tested**: `leaveTime.ts`, `alerts.ts`, `route.ts` (parses OneMap itineraries into legs), `weather.ts` and `bot.ts`. The bot's conversation state machine takes a `BotDeps` object for side effects, so tests pass fakes. The API clients are `onemap.ts` (routing and search; renews its token from email and password), `lta.ts` and `telegram.ts`.
- **How Telegram updates arrive**: if `PUBLIC_URL`, or `RENDER_EXTERNAL_URL` (which Render sets), is set, the server registers a webhook at `/telegram` with a secret derived from the bot token. Otherwise it long-polls. While the deployed webhook is active, a local server long-polling with the same bot token gets HTTP 409 and receives no bot messages.
- **HTTP API**: `GET /api/search?q=`, `POST /api/trip`, `GET /api/trip`, `GET /healthz`. CORS is limited to `ALLOWED_ORIGIN`. The `POST /api/trip` payload is validated by `parseTrip` in `server/trip.ts` and must match `web/src/trip/types.ts`.
- **Web**: `web/src/trip/api.ts` returns `ok | offline | error` results. `VITE_API_BASE` sets the backend origin in production; it is empty in dev, where the Vite proxy handles `/api`.

## Deployment

- `leave-alert/web` → GitHub Pages at `https://punnyhuimin.github.io/product-thinking-game/` (production `base` is `/product-thinking-game/`). It deploys via `.github/workflows/leave-alert-pages.yml` on pushes to `main` that touch `leave-alert/web/**`. `VITE_API_BASE` comes from the repo variable `LEAVE_ALERT_API_BASE`.
- `leave-alert/server` → Render, configured in `render.yaml` (rootDir `leave-alert`, `npm start`, Node 24). It auto-deploys on commits to `leave-alert/server/**`. On the free plan the instance sleeps after about 15 minutes idle, which pauses the alert loop.
- `game/` has no deploy setup.
- PRs get an automated Claude review (`.github/workflows/claude-code-review.yml`).
