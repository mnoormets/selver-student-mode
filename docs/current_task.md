# Current Task

## Objective

Choose one demo scenario and agree on its input, output, and acceptance check so Codex can build the first complete slice.

## Requirements

- Pick one target user and one action that fits the event brief.
- Use one reproducible example with an expected result that can be checked in the browser.
- Decide whether a live external dependency is essential to proving the core value.

## Files Expected To Change

- `docs/mvp.md` for the chosen scope, copied from the [MVP template](mvp_template.md).
- `docs/roadmap.md` for any changes to priorities or timing.
- `docs/current_task.md` for the first implementation brief.
- `docs/decisions.md` for the input-to-result boundary and any essential integration.

## Acceptance Criteria

- [ ] The team can describe the target user, action, and result in one sentence.
- [ ] The brief records one concrete input, its expected result, and one explicit scope cut.

## Testing Requirements

- Walk through the exact sample input and expected result against the event criteria.
- Confirm the first implementation task includes `npm run check` and one reproducible browser check.

## Definition Of Done

- [ ] The operator confirms the scope captured in `docs/mvp.md`.
- [ ] Claude publishes the first implementation brief using the [task template](task_template.md) and shares the branch and commit with Codex.

## Status

- State: Ready
- Owner: Claude Code with team operator input
- Next action: Use the event brief to choose the scenario at kickoff.
