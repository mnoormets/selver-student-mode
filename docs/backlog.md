# Shift Rescue Backlog

P0 is required for the demo. P1 can be dropped. Effort is hands-on time: S up to 45 minutes, M 46–115 minutes, L 2–4 hours. Work in order, with one task per feature branch. Deployment and rehearsal can start as soon as the core flow passes.

| ID | Priority | Task description | Acceptance criteria | Effort |
| --- | --- | --- | --- | --- |
| SR-01 | P0 | Render a read-only Shift Rescue roster from the bundled fixture. | The root screen shows the event, 10:00–11:00, 3/3 coverage, and the three stations with their fixture assignees. Reproduction and scope are in the [current task](current_task.md). | M |
| SR-02 | P0 | Add local session state and Cancel for assigned shifts. | Cancelling Ava opens only Check-in, drops coverage to 2/3, and records Ava as unavailable for that slot until reset. Reload still starts from the fixture. | M |
| SR-03 | P0 | Implement and test a pure replacement selector, then show candidates on each open shift. | Check-in lists only Maya after Ava cancels. Tests cover missing qualification, unavailable slot, an overlapping assignment, and cancellation. Being assigned in a different slot does not disqualify someone. | M |
| SR-04 | P0 | Assign a candidate and update coverage in one state change. | Selecting Maya fills Check-in, restores 3/3, and removes the candidate list for that shift. A stale or ineligible selection cannot double-book someone or overwrite a filled shift. | M |
| SR-05 | P0 | Add the no-replacement state and reset control. | Cancelling Riley displays “No eligible replacements” at Supply Table and leaves it open. Reset restores 3/3 and all three original assignees and clears cancellations, including after multiple actions. | M |
| SR-06 | P0 | Polish the visible demo states and check keyboard use. | Open and covered states have text labels. All actions are reachable by keyboard, focus remains usable after changes, and the roster fits a 375 px viewport with no horizontal scroll. | M |
| SR-07 | P0 | Review and smoke-test the production build. | Claude reviews the implementation SHA. On production preview, the team completes the recovery, failure, and reset paths twice with external network access disabled. Build and type checks pass. | M |
| SR-08 | P0 | Prepare the submission and offline fallback. | The happy path fits 30 seconds. The team verifies the submission artifact or URL on Machine 2 when available and keeps a local production build and a backup recording. | M |
| SR-09 | P1 | Apply Lovable polish if time remains. | Integrate one visual proposal without changing the roster contract, eligibility behavior, offline operation, or keyboard flow. | M |

SR-01 is the first handoff. Cut SR-09 before cutting any failure-state or rehearsal work.
