# First Implementation Tasks

Estimates are hands-on time after prerequisites are met. P0 is required for the demo and P1 improves presentation. The operator confirms the scenario, GitHub access, and submission requirements.

| # | Priority | Owner | Estimate | Description | Acceptance criteria |
| --- | --- | --- | --- | --- | --- |
| 1 | P0 | Claude Code | 30–45 min | Turn the event brief into one target user, action, and visible result. | Team approves one concrete example with expected output and one scope cut. Brief is committed and shared. |
| 2 | P0 | Codex | 30–45 min | With the operator, prove the starter and Git handoff on both machines. | Both machines run the same commit and open the local app. Machine 2 can fetch Machine 1's test PR. |
| 3 | P0 | Claude Code | 30–45 min | Specify the input-to-result boundary, the smallest useful fixture, and one invalid-input case. | Brief contains the input, expected output, failure behavior, and whether a live integration is essential. |
| 4 | P0 | Codex | 60–90 min | Add the synthetic fixture and implement the core transformation or action. | The agreed fixture produces the expected result through a focused repeatable check. Invalid input returns the agreed error. |
| 5 | P0 | Codex | 90–120 min | Connect a minimal start screen to the core action and result. | A fresh load reproduces the fixture outcome in the browser. The user can recover from the invalid-input case. |
| 6 | P1 | Codex with Lovable | 60–120 min | Generate and integrate one screen for the agreed flow if it improves the demo. | The flow still works at narrow and desktop widths. Generated dependencies are required by the screen and pass the existing checks. |
| 7 | P0 | Claude Code | 45–60 min | Review the exact PR commit against the brief and try the happy path and the failure case. | Review includes the SHA, reproduction steps, and an explicit approved or changes requested result. |
| 8 | P0 | Codex | 45–120 min | Fix merge blockers and add a reliable reset or restart for repeat demos. | Claude verifies blockers are resolved. A second run reproduces the result without manual data cleanup. |
| 9 | P0 | Codex | 45–90 min | Build and publish the demo or package a local build for submission. | The submitted build or URL runs the core path on the second machine. The commit and local fallback commands are recorded. |
| 10 | P0 | Claude Code with operator | 45–60 min | Plan and run two rehearsals, record the fallback, and verify the submission checklist. | Both rehearsals reach the result within the event's time limit. Backup media or artifact and submission links are accessible. |

Run tasks 1 and 2 in parallel. After task 5, keep the plain UI if it is clear enough to demo. If task 3 establishes a required live integration, add it behind the same boundary and retain the local fixture for rehearsal.
