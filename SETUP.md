# Setup

## Shared prerequisites

Install Git and the full Node.js 24 LTS distribution, which includes npm. Each machine uses its own clone and Git identity. From the repository root:

```sh
node --version
npm --version
npm ci
npm run dev
```

Open http://localhost:5173/. Run `npm run check` before handing off. To rehearse the production build locally, run `npm run preview` after the check and open http://localhost:4173/. On Windows, use `npm.cmd` if PowerShell blocks `npm.ps1`. If a local port is in use, Vite exits so both machines can use the URLs documented here.

## Machine 1

Open the clone in Codex and read [START_HERE.md](START_HERE.md) and [the current task](docs/current_task.md). Run the shared commands. When assigned UI generation, open Lovable in the browser, use the agreed task criteria, and attach the preview or export to the PR. Integrate the selected UI on the feature branch.

## Machine 2

Open the clone in Cursor, then start Claude Code with `claude` from the repository root. Read [START_HERE.md](START_HERE.md), [PROJECT_STATUS.md](PROJECT_STATUS.md), and [project context](docs/project_context.md). Run the same bootstrap commands. Review the exact implementation SHA from the handoff. Use Lovable when this machine owns UI generation, and share the result with Codex for integration.

## GitHub

The operator creates an empty repository from the GitHub account the team will use and grants the other operator write access if they use a separate account. Copy the clone URL. From the initialized starter, set a repository-local Git identity if needed with `git config user.name` and `git config user.email`, passing your preferred name and email as values. Add the GitHub clone URL with `git remote add origin`, then run `git push -u origin main`. On the other machine, run `git clone` with that URL and open the resulting directory. Use `main` as the default branch and enable squash merging. If both machines share a GitHub account, use Claude's written review as the sign-off so the workflow works with same-account PRs.

## Branch workflow

Machine 2 starts with `git switch main` and `git pull --ff-only`. For the first handoff, create `feature/first-demo-flow` with `git switch -c feature/first-demo-flow`, commit the task brief, and run `git push -u origin HEAD`. Machine 1 runs `git fetch origin` and `git switch --track origin/feature/first-demo-flow` the first time it checks out the branch. On later handoffs to either machine, switch to the existing local feature branch and run `git pull --ff-only` before writing. Use `git rev-parse --short HEAD` to identify each handoff. After implementation, run the check, commit, push, and open the PR to `main`. Follow [GIT_WORKFLOW.md](GIT_WORKFLOW.md) for review and merge.

## Daily workflow

At kickoff, sync `main` and check the current task. If a feature is already in progress, resume on its branch and fast-forward it before writing. Use the active PR for branch and SHA handoffs. Before stopping, push completed work and leave the next action and any failure reproduction steps in the PR. Keep `main` runnable and rehearse the production preview before the submission window.
