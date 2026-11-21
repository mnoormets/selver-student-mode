# Current Task

## Objective

SR-01 — Show the first real Shift Rescue screen using the offline roster fixture. Estimated effort is 60–90 minutes.

## Requirements

- Replace the startup confirmation with a single read-only roster at `/`.
- Render the event name, time, station labels, assignees, and coverage count from the fixture. Derive the count from assignments.
- Keep the roster markup in a feature component and the React mount in `src/main.tsx`. Use semantic headings and a list or table.
- Reserve cancellation, replacement, and reset for later backlog items.

## Acceptance Criteria

- [ ] The page is titled Shift Rescue and shows Riverside Community Fair.
- [ ] The 10:00–11:00 roster shows Check-in assigned to Ava Chen, Welcome Desk assigned to Jordan Lee, and Supply Table assigned to Riley Brooks.
- [ ] The page displays 3/3 shifts covered. The same three assignments render after reload.
- [ ] No new runtime dependencies or external requests are needed.

## Files Expected To Change

- `src/main.tsx` and `index.html` to mount and name the product.
- `src/features/shift-rescue/ShiftRescue.tsx` for the roster, importing the existing `demoRoster.ts`.
- A feature stylesheet only if needed for a readable roster.

## Testing Requirements

- Run `npm run check`.
- Open `/` in development or preview and compare all station names, assignees, time, and coverage against the fixture. Reload to verify the starting state.

## Definition Of Done

- [ ] The acceptance checks pass and Codex shares the implementation SHA, PR when available, and browser check results.
- [ ] Claude verifies the fixture-driven roster and records the review.

## Status

- State: Ready
- Owner: Codex
- Branch: `feature/sr-01-roster`
- Next action: Render the read-only roster using the bundled fixture.
