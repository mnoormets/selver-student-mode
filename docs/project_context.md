# Selver Student Mode Architecture

## One-screen app

React, TypeScript, and Vite serve one screen at `/`. Keep form input and the current generation result in local React state. Derive basket and reuse values from the accepted week. Avoid a router, global store, or database for this demo.

## Data and responsibilities

- `src/main.tsx` mounts `src/features/student-mode/StudentMode.tsx`.
- `src/features/student-mode/types.ts` defines the profile, plan, recipe, and catalog contracts.
- `src/features/student-mode/data/` holds the dated Selver product snapshot, one-serving recipes with estimated total cooking times, and an offline reference week.
- Add `basket.ts` for pure aggregation and pricing, and `plan.ts` for candidate validation. Extract form, week, basket, and reuse UI components only as their markup grows.
- For live AI, use one server-side handler. Send the profile and allowed recipe metadata, with recipe IDs and ingredients to guide variety and reuse. Expect only seven days with breakfast, lunch, and dinner recipe IDs. Keep provider credentials on the server.

## Deterministic path

Validate the candidate's shape, distinct days, allowed recipes, meal slots, dietary preference, and strict time limit. Resolve ingredient product IDs, sum quantities by product, and buy `ceil(totalQuantity / packQuantity)` whole packs. Each product defines its base unit. Multiply by its pinned pack price in cents and sum the lines. Subtract the total from budget cents. Reject over-budget candidates and report no plan if neither the candidate nor the offline sample is valid for this profile.

Reuse is the distinct recipes using a product, alongside leftover quantity from the packs purchased. It makes no prediction about waste. The reference week prices all listed ingredients and assumes water, salt, pepper, and cooking oil are already on hand.

## Price provenance and demo

The product file links each exact package to price evidence from Soodsad Hinnad's published Selver listings or price history. The snapshot assembled on 21 November 2026 uses observed regular prices and never assumes a loyalty discount. The date identifies the fixture compilation, while source observations may be earlier. Label it as sample pricing in the UI. The basket engine makes no retailer requests.

Use `npm run dev` for local development, `npm run check` for type checking and building, and `npm run preview` to rehearse. See the [team brief](https://docs.google.com/document/d/1lM6kpeXfCHaYGz2LevyXPDY4DfCj4lkzWuC-rikamNI/edit?tab=t.0).
