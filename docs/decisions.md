# Decisions

## Architectural Decisions

- Use a single client-side web app and one shared Git repository. Start with a fixture so the demo can run locally and both machines can test it.
- Keep input validation and result logic separate from the UI when the first feature is built. This gives Codex a small testable surface and Lovable a stable screen contract.
- Add a server only if the scenario requires a private credential, a shared source of truth, or another operation that cannot run in the browser.

## Libraries Used

- React and React DOM render the UI.
- TypeScript checks application code. Vite runs the development server and builds static assets.
- Node.js 24 LTS and npm provide one toolchain on both machines.

## Key Assumptions

- The event allows a web demo. Confirm its submission requirements at kickoff.
- One synthetic example can demonstrate the main value unless the chosen idea requires a live interaction.
