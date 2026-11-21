# Git Workflow

## Branch Strategy

- `main` holds the latest reviewed, demo-ready code. Merge through a GitHub pull request.
- `feature/*` holds one task per branch. Branch from the latest `main`.

These steps assume `origin` points to the shared GitHub repository and `main` exists there.

## Development Cycle

1. Claude Code creates a `feature/<short-name>` branch from up-to-date `main`, updates `docs/current_task.md`, commits and pushes the brief, and shares the branch.
2. Codex checks out the shared branch, implements the task, runs the agreed checks, and sets the status to In review.
3. Codex commits the changes with a short, descriptive message.
4. Codex pushes the branch to GitHub and opens or updates a PR against `main`, including the checks run.
5. Claude Code fetches the branch and reviews the pushed commit against the acceptance criteria.
6. Claude Code records the result and reviewed SHA in `docs/review.md`, commits and pushes the notes to the feature branch, and hands it back to Codex.
7. Codex pulls the review commit, fixes the issues, reruns the checks, and pushes the fixes to the same PR. Claude Code rechecks the fixes.

After approval and passing acceptance checks, mark the task Done and merge the PR. Pull the updated `main` before starting the next task.
