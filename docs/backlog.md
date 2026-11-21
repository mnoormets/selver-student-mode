# Selver Student Mode Backlog

All five tasks are P0 for the demo. Estimates are hands-on time. The team can rehearse as soon as the offline flow works.

| ID | Task | Acceptance criteria | Effort |
| --- | --- | --- | --- |
| SSM-01 | Implement deterministic basket and ingredient reuse, and display the calculated totals. | The reference week yields 9 products, €34.24 total, and €0.76 remaining. Tomatoes use 1,200 g and three 400 g packs across four distinct recipes. Reject unresolved IDs. | M, 60–90 min |
| SSM-02 | Build the one-screen profile form and offline reference result. | The €35 / Standard / Under 20 minutes defaults render 7 days and 21 meal slots, the itemized cart, remaining budget, and reuse summary. Inputs with no valid offline result get a clear message. | L, 2–3 hr |
| SSM-03 | Validate and price candidate weeks before rendering. | Enforce canonical seven-day and three-slot shape, known recipe IDs, permitted meal slots, supported diet, strict cooking-time limit, and whole-pack budget cap. Tests reject a 20-minute meal for Under 20, an unknown recipe, and an over-budget week. | M, 60–100 min |
| SSM-04 | Connect one AI meal-idea adapter. | One server-side request proposes a week from allowed recipe IDs. Provider credentials stay server-side. Use valid results only. Timeout or invalid output uses the labeled reference sample if it passes the same checks for the submitted profile. Otherwise show no plan. | L, 2–4 hr |
| SSM-05 | Test and rehearse the production demo. | Build and type checks pass. Walkthrough stays below 3 minutes. Verify the live path when credentials are available and rehearse the offline path twice. Independently check the sample total and reuse quantities. | M, 60–90 min |

Claude reviews the pricing contract and candidate validation. Codex implements and verifies the slices. Use the offline path for rehearsal from SSM-02 onward.
