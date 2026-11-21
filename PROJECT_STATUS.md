# Project Status

## Current state

- **MVP selected:** Shift Rescue. The [MVP](docs/mvp.md) and [backlog](docs/backlog.md) define one offline volunteer reassignment flow.
- Typed demo data is committed with three seeded shifts and six fictional volunteers. The app still shows the starter screen. SR-01 is the first visible product slice.
- The latest local verification passed npm install, the Vite production build, and TypeScript checks.

## Tech stack

Node.js 24 LTS, npm with a tracked lockfile, React and React DOM 19, TypeScript 5.9, and Vite 7. [Project context](docs/project_context.md)

## Last commit

Baseline entering MVP preparation was `e46225b`. Run `git log -1 --oneline` for the current tip.

## Current blockers

Local implementation can begin. The operator still needs to publish the repository to GitHub for two-machine PR handoffs and verify that the event accepts this non-AI demo.

## Recommended next action

Codex implements [SR-01](docs/current_task.md). Claude reviews the first roster and checks that the seeded recovery and no-replacement scenarios support the planned demo.
