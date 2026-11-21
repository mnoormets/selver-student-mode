# Project Context

## Architecture

Shift Rescue is a single-screen React app built with TypeScript and Vite. `index.html` loads `src/main.tsx`, which currently mounts the starter screen. The [first task](current_task.md) will mount the Shift Rescue roster there. Demo data is synthetic, bundled in source, and works without a server API.

## Folder structure and components

- `src/main.tsx` mounts the root and hands rendering to the feature.
- `src/features/shift-rescue/` contains the existing `types.ts` and `demoRoster.ts`. Add `ShiftRescue.tsx` here for the one-screen roster. Once replacement logic is needed, put the pure selector and its focused tests beside the feature.
- Let the feature own the coverage summary, roster, and open-shift controls. Extract a shift row or candidate list when it has independent behavior or when it makes the feature easier to read.

Keep the seed, types, and UI together. Create shared folders when a second feature needs to reuse something.

## State and routing

The read-only roster needs no mutable state. When cancellation starts, keep assignments by shift ID and cancellations by slot in one local React state value owned by `ShiftRescue`. Derive coverage and candidates from that state and the fixture. Use pure helpers for eligibility and immutable state updates so cancel, assign, and reset stay predictable.

Serve the roster at `/`. Keep dialogs and open-shift controls on the same screen. The planned demo needs no router, global store, or persistence.

## Build process

Both machines use Node.js 24 LTS and npm. `npm run dev` serves the app locally. `npm run check` runs TypeScript and a production build. Vite writes assets to ignored `dist/`. `npm run preview` serves the build locally. The running demo makes no external requests.
