# Shift Rescue MVP

## Product name

Shift Rescue

## One-sentence pitch

Shift Rescue helps a community event coordinator fill a last-minute volunteer gap by showing who can take the shift and updating coverage as soon as the coordinator assigns someone.

## Problem

When a volunteer cancels, the coordinator has to cross-check qualifications, availability, and existing assignments before assigning a substitute. A hurried guess can leave a second station uncovered.

## User

The volunteer coordinator at a small community event. They need a fast decision just before a staffed shift starts.

## Demo workflow

Use the fictional Riverside Community Fair roster. All three stations start covered for 10:00–11:00.

1. Cancel Ava Chen at Check-in. The station opens and coverage drops from 3/3 to 2/3.
2. The app lists Maya Patel as the only eligible replacement. Assign her and show coverage return to 3/3.
3. In the extended demo, cancel Riley Brooks at Supply Table. The station stays open with a clear “No eligible replacements” message. Reset to restore the original roster for the next run.

30-second narration: “A volunteer cancels just before the fair. Check-in loses coverage. Shift Rescue finds the one qualified person who is available and free. Assign Maya and we’re back to full coverage.”

## Core features

- One roster screen with a coverage count, named stations, time slots, and current assignees.
- Cancel an assignment and keep that volunteer unavailable for the affected slot until reset.
- For each open shift, show people who are qualified for its role, available in its slot, uncancelled in that slot, and free of other assignments in that slot.
- Assign an eligible replacement, show an explicit empty state if nobody qualifies, and reset the seeded demo.

## Non-goals

Accounts, database, network requests, AI, notifications, real volunteer data, editable schedules, and automatic roster optimization. The demo uses predefined slots with one person per station.

## Success criteria

- [ ] A judge can see the gap and its resolution in 30 seconds or less, with coverage changing from 3/3 to 2/3 and back to 3/3.
- [ ] Maya is the only candidate for the seeded Check-in cancellation. The cancelled volunteer, a busy qualified volunteer, and an unavailable qualified volunteer are all excluded.
- [ ] Cancelling Riley leaves Supply Table open and shows zero eligible replacements. Reset restores the same three original assignments.
- [ ] The production demo runs from a local preview with external network access disabled and needs no credentials.
