# Start Here

| Owner | Role and files |
| --- | --- |
| Claude Code, Machine 2 | Proposes MVP scope and architecture, writes the next task and reviews the implementation. Leads edits to `docs/roadmap.md`, `docs/current_task.md`, `docs/decisions.md`, `docs/first_tasks.md`, and `docs/review.md`. |
| Codex, Machine 1 | Implements product code, integrates generated UI, adds focused tests, and fixes findings. Leads edits to `src/`, `index.html`, package and build configuration, and technical setup docs. Updates implementation status in `docs/current_task.md` during its turn. |
| Cursor, Machine 2 | Helps Claude and the operator navigate and debug. Keep proposed changes local and share them with Codex unless the branch owner hands over editing. |
| Lovable, either machine | Generates UI for the agreed screen. One operator per task shares a preview or export in the PR. Codex owns integration and the repository edits. |
| Team operator | Confirms product scope, owns GitHub access, and squash-merges approved PRs. |

1. Claude pushes the task brief on a `feature/*` branch and shares the branch and SHA.
2. Codex takes ownership, pulls the brief, implements, and pushes. Share the PR, implementation SHA, checks, and reproduction steps.
3. Claude checks that SHA against the acceptance criteria and records findings in `docs/review.md`. Claude pushes the notes and hands the branch back for fixes. Repeat for changes that affect the reviewed behavior.
4. The operator squash-merges once Claude approves, the acceptance checks pass, and the task status is Done. Both machines start their next task from updated `main`.

Use one writer per feature branch. See [setup](SETUP.md) for commands and [the first tasks](docs/first_tasks.md) for the kickoff sequence.
