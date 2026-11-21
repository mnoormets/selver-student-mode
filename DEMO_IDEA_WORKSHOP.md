# Demo Idea Workshop

Pick one idea that fits the event brief. Each idea assumes one screen or flow, synthetic demo data, and a React, TypeScript, and Vite frontend. The estimates cover one working demo slice plus a smoke check. They exclude event research and presentation prep.

For an AI idea, start with a saved example response and show it as fixture mode. If live inference is central to judging, put provider credentials behind a small server endpoint and validate the response before rendering. The original input and model suggestions should remain visible so a person can verify the result.

## AI-assisted ideas

| Idea | Problem | User | Demo flow | Why judges would care | Difficulty |
| --- | --- | --- | --- | --- | --- |
| Handoff Lens | A shift handover buries unresolved work in free-text notes. | Makerspace shift lead | Paste a synthetic handover. Extract open tasks, owners and missing details. Click a task to see its source excerpt. | Judges can compare the output with the input and spot unsupported claims during the demo. | Moderate, 5–8 hours with fixture mode and a simple live adapter. |
| Form Coach | Applicants struggle to understand dense instructions. | First-time applicant for a community program | Load a sample instruction sheet. Generate a plain-language checklist with source links and flags for details the sheet omits. | One side-by-side example demonstrates a concrete accessibility gain and makes omissions visible. | Moderate, 6–9 hours with pasted text and one document. |
| Repair Brief | A vague issue report leads to repeat trips to inspect a fault. | Building maintenance dispatcher | Enter a sample report about a broken appliance. Extract location and symptoms, then show up to three follow-up questions. | The audience sees the transition from an ambiguous note to a dispatch-ready brief. | Moderate, 5–8 hours with a structured response. |
| Feedback Atlas | Organizers spend hours mapping free-text feedback to actionable themes. | Volunteer event organizer | Load 12 synthetic comments. Group them into themes with counts, open representative quotes, then inspect uncategorized comments. | Judges can trace themes back to examples and judge the tradeoff between speed and accuracy. | Moderate, 6–10 hours with fixed input size and evidence checks. |
| Scope Scribe | A rough hackathon idea rarely contains implementation-ready criteria. | Hackathon technical lead | Paste a sample idea and time budget. Generate one task with acceptance checks, assumptions, and a scope cut. Edit and copy the Markdown. | Shows immediately how a vague pitch becomes an actionable handoff and lets a teammate correct it. | Moderate, 5–8 hours with one response shape and no account system. |

## Non-AI ideas

| Idea | Problem | User | Demo flow | Why judges would care | Difficulty |
| --- | --- | --- | --- | --- | --- |
| Shift Rescue | A late volunteer cancellation leaves a staffed station uncovered. | Community event coordinator | Load a sample roster. Cancel a volunteer, show available qualified substitutes, apply one reassignment, and see coverage recover. Also show a case with no eligible replacement. | Clear before-and-after outcome with visible eligibility rules and a reliable offline demo. | Easy, 5–8 hours with fixed rules and a seeded roster. |
| Pantry Plan | Staff need to distribute limited donated items across pickup slots. | Food pantry coordinator | Load sample inventory and pickup slots. Allocate stock to a slot and show remaining quantities and any shortfall. | The demo makes a resource constraint visible and prevents over-allocation in one interaction. | Easy, 5–8 hours with local fixtures and no personal data. |
| Queue Replay | Teams cannot explain how staffing changes affect wait times at an event. | Registration desk lead | Load a small arrival sequence. Run one versus two desks and compare the same queue's maximum and median wait. | A deterministic comparison gives judges a concrete result they can reproduce. | Easy to moderate, 6–10 hours with a simplified simulation. |
| Gear Check | Shared kit gets packed without a key component or returned incomplete. | Student media crew | Select a kit, mark components as packed, and see the missing item. Switch to return mode and compare with the packing list. | A short demo shows a preventable failure and a repeatable check for the next crew. | Easy, 4–7 hours with local fixture data and reset. |
| Break Board | A coordinator assigning event breaks can accidentally leave a station unstaffed. | Small venue floor manager | Load a sample schedule. Propose a break, show the coverage conflict, then move it to a valid slot. | Judges see a constraint that users can understand and correct in seconds. | Easy to moderate, 6–9 hours with fixed slots and one coverage rule. |

## Kickoff recommendation

Start with **Shift Rescue** unless the event requires AI. Define eligibility as qualified, available, and unassigned for the affected slot. Demo one successful reassignment and one blocked case. Estimate success by whether a first-time user can restore coverage with the seeded roster in under 60 seconds. Defer accounts, notifications, and persistence. If AI is required, test **Handoff Lens** with synthetic notes and verify each extracted task against its source excerpt.
