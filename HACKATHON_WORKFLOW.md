# Hackathon Workflow

## Machine Setup

| Machine | Tools and role |
| --- | --- |
| 1 | Codex implements, tests, and fixes. Lovable generates UI when this machine owns the UI task. |
| 2 | Claude Code plans and reviews. Cursor assists with code navigation and debugging. Lovable generates UI when this machine owns the UI task. |

Both machines use separate clones of the same GitHub repository.

## Handoff

1. **Machine 2 → Machine 1.** Claude Code pushes the task brief on a feature branch. Share the branch name and commit SHA. Machine 1 fetches the branch before editing.
2. **UI handoff, if needed.** Pick one machine to generate the UI for the task. Share the Lovable preview or export and note any assets or dependencies in the task or PR. Codex integrates the UI on the feature branch. Route generated changes through that branch.
3. **Machine 1 → Machine 2.** Codex runs the acceptance checks, commits and pushes, and shares the PR, commit SHA, and check results. Machine 2 fetches that revision and reviews it.
4. **Machine 2 → Machine 1.** Claude Code pushes review notes and shares the review commit. Codex pulls those notes, fixes issues, reruns checks, and pushes the follow-up. Repeat review as needed.
5. **Merge.** Once Claude Code approves and the acceptance checks pass, merge the PR. Both machines pull `main`.

Give one machine write ownership of a feature branch at a time. Push before handing off and run `git pull --ff-only` on the branch before editing an existing local checkout. If it fails, coordinate with the other machine before pushing. Cursor can sketch changes locally and share them with Codex during Machine 1’s turn.

## 48-Hour Priorities

Deliver the smallest end-to-end demo first. Use the roadmap to defer stretch goals until the MVP works. Reserve the final hours for demo rehearsal and fixes.
