# Current Task

## Objective

SSM-01 — Build the deterministic basket and ingredient reuse calculation for the offline reference week. Estimated effort is 60–90 minutes.

## Requirements

- Resolve plan recipe IDs against the recipe dataset and ingredient product IDs against the controlled product dataset.
- Sum each product's quantities over all 21 slots, then round up once to whole packs. Calculate line prices, basket total, and signed budget remainder in integer cents.
- Return purchasable pack count, required quantity, unused quantity, and distinct recipe names per product. Reject unknown IDs with an actionable error.

## Files Expected To Change

- `src/features/student-mode/basket.ts` and a focused test beside it.
- `src/features/student-mode/StudentMode.tsx` to display the computed reference basket total and remaining budget.

## Acceptance Criteria

- [ ] The reference week returns 9 basket lines, 3,424 cents total, and 76 cents remaining from 3,500 cents.
- [ ] Tomatoes have 1,200 g required, three packs, zero unused grams, and four distinct recipe names. Eggs require 14 and buy two 10-count packs.
- [ ] The product screen shows €34.24 basket total and €0.76 remaining from the calculation.
- [ ] Price changes in the dataset affect totals through code. Unknown IDs fail instead of producing incomplete totals.

## Testing Requirements

Run `npm run check` and cover aggregate-before-rounding, exact packs, unknown IDs, and the reference-week totals in a repeatable test.

## Definition Of Done

The calculation is ready for the form and results UI, and Claude can check the reference total against the sourced pack prices.

## Status

- State: Ready
- Owner: Codex
- Branch: `feature/ssm-01-basket`
