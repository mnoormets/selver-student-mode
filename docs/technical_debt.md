# Technical Debt

## Known shortcuts

| Shortcut | What to revisit |
| --- | --- |
| The starter renders from one entry point. | Split product logic from rendering as soon as the first demo flow has meaningful logic. |
| The repo uses a local type and build check. It has no automated product test or CI workflow yet. | Add one focused check with the first feature. Add CI if the two machines cannot reproduce the same check reliably. |
| The plan starts with local fixtures and browser-only state. | Verify both Shift Rescue scenarios from the seeded roster and confirm reset restores it. Revisit persistence only if a later real-world journey needs it. |

## Hackathon assumptions

- One target user and one complete flow are enough for the first demo.
- The team can use synthetic data and publish or package static assets if allowed by the event.
- Both machines can reproduce checks from the same Git commit after the operator connects the shared remote.

## Post-hackathon improvements

- Add automated browser coverage for the core path and its main failure case.
- Add a repeatable CI and deployment process once the demo destination is known.
- Validate real-data access, privacy needs, accessibility, and persistence before expanding beyond the synthetic demo.
