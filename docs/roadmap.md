# Roadmap

## Vision

By hour 48, show a volunteer coordinator restore full event coverage after a late cancellation. The [Shift Rescue MVP](mvp.md) defines the offline demo. Work through the [backlog](backlog.md) starting with [SR-01](current_task.md).

## MVP Features

- A roster with coverage at a glance and a cancellation action.
- One eligible substitute in the happy path and a clear no-replacement state.
- A reset for repeat rehearsals, plus a shareable build and local fallback.

## Stretch Goals

Use spare time for Lovable polish after the happy path and failure case pass. Keep the demo self-contained.

## 48-Hour Schedule

| Hours | Exit condition |
| --- | --- |
| 0–3 | Both machines run the same starter commit when available. Codex renders the seeded roster and Claude checks it against the demo flow. |
| 3–14 | Codex completes the happy path with local data. Lovable drafts UI in parallel if needed. Claude checks the first PR. |
| 14–28 | Integrate UI, handle one failure case, and verify the flow from a clean clone. |
| 28–40 | Publish or package the build, rehearse twice, and capture a backup demo. Freeze scope at hour 40. |
| 40–48 | Fix demo blockers, check submission requirements, and submit. |

If hosting is unavailable, rehearse from the local production build and keep the backup recording.

## Completed Features

- Minimal browser starter, typed offline roster, and Shift Rescue scope. The first product screen is queued as SR-01.
