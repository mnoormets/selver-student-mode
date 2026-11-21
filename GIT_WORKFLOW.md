# Git Workflow

## Branch Strategy

- `main` holds the latest reviewed, demo-ready code. Merge through a GitHub pull request.
- `feature/*` holds one task per branch. Branch from the latest `main`.

These steps assume `origin` points to the shared GitHub repository and `main` exists there.

## Development Cycle

1. Claude Code creates a `feature/<short-name>` branch from up-to-date `main`, fills in `docs/current_task.md` using the [task template](docs/task_template.md), commits and pushes the brief, and shares the branch and SHA.
2. Codex checks out the shared branch, implements the task, runs the agreed checks, and sets the status to In review.
3. Codex commits the changes with a short, descriptive message.
4. Codex pushes the branch to GitHub and opens or updates a PR against `main`, including the checks run.
5. Claude Code fetches the branch and reviews the pushed commit against the acceptance criteria.
6. Claude Code records the result and reviewed SHA in `docs/review.md`. Mark the task Fixes needed if there are blockers or Done if approved. Commit and push the notes and status update.
7. If changes are requested, Codex pulls the review commit, fixes the issues, reruns the checks, and pushes to the same PR with the task In review. Claude Code rechecks the updated implementation SHA.

Once Claude approves, the acceptance checks pass, and the task is Done, the operator squash-merges the PR. Both machines pull the updated `main` before starting the next task.
