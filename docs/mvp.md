# Selver Student Mode MVP

## Pitch

Turn a student's weekly budget, diet, and cooking-time preference into a seven-day menu and a Selver shopping list with a total they can check.

## Problem and user

A student living independently needs to decide what to cook, what to buy, and whether the weekly basket fits their budget. Buying packs for separate meals can leave ingredients unused.

## Demo in under three minutes

1. **0:00–0:30** — Open the planner with €35, Standard diet, and Under 20 minutes selected. Click Generate.
2. **0:30–1:20** — Show seven days of breakfasts, lunches, and dinners for one student. Point out the cooking times.
3. **1:20–2:30** — Open the shopping list and show whole packs, line totals, basket total, and remaining budget. Use chopped tomatoes as the example of one ingredient appearing in several recipes.
4. **2:30–2:50** — Point out the dated demo prices. If the AI provider is unavailable, use the labeled offline sample.

## Core features

- Three profile inputs and one Generate action. Standard is the reference profile. Vegetarian is supported from the same catalog if a valid plan can be found.
- AI suggests a week by choosing and arranging recipes from the catalog. Code validates the suggestions against the profile.
- The shopping list comes from a frozen sample of Selver packages with published regular prices. Code aggregates quantities, rounds up to whole packs, and computes totals and budget remaining in euro cents.
- Ingredient reuse shows which recipes share a product and how much of the purchased pack capacity is unused. Water, salt, pepper, and cooking oil are treated as pantry staples.

## Non-goals

Live Selver pricing or inventory, loyalty promotions, checkout, accounts, delivery, meal swaps, nutrition optimization, and pantry tracking.

## Success criteria

- The demo profile produces 21 meal slots across seven days, each with a recipe whose estimated time is strictly below 20 minutes.
- Every basket line maps to a catalog product with a source. The offline reference week costs €34.24 and leaves €0.76 from €35 using the sample prices.
- Chopped tomatoes appear in four distinct recipes and need three 400 g packs for the reference week.
- Invalid AI suggestions never appear as valid plans. The offline sample is labeled and only used if it satisfies the submitted preferences and budget.
