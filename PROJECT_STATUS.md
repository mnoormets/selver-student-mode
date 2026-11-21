# Project Status

> **MVP not yet defined.** The team has a runnable starter and a delivery plan. Confirm the event requirements and select one product idea before building features.

## Current state

- `main` contains a browser starter. `index.html` loads `src/main.tsx`, which renders the startup confirmation.
- The latest local verification passed npm install, the Vite production build, and TypeScript checks.
- The MVP kickoff task is Ready. There is no product feature, product test suite, or implementation PR yet.
- Claude Code leads scope, architecture, and review. Codex implements the agreed slice. [Tool ownership and handoffs](START_HERE.md)

## Tech stack

Node.js 24 LTS, npm with a tracked lockfile, React and React DOM 19, TypeScript 5.9, and Vite 7. The production build is static. [Project context](docs/project_context.md)

## Last commit

Baseline entering this handoff: `60e6056` — Initialize hackathon starter and delivery plan. The preparation commit follows it. Run `git log -1 --oneline` for the checked-out tip.

## Current blockers

- **Product** — The team still needs to confirm the judging criteria, target user, and one demonstrable outcome.
- **Two-machine handoff** — There is no configured `origin`. The operator needs to publish the repository and verify the second machine can clone it. Local development can begin immediately. [GitHub setup](SETUP.md#github)

## Recommended next action

Claude and the operator should spend 30 minutes testing the event fit of **Shift Rescue**, a browser demo that restores coverage after a volunteer cancels. Copy [the MVP template](docs/mvp_template.md) to `docs/mvp.md` and record the selected idea there. Then use [the task template](docs/task_template.md) to brief Codex on one input, one expected result, and one failure case.
