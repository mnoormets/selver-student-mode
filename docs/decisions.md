# Decisions

- **Retail data.** Use a frozen snapshot of published Selver pack prices with a source per SKU. Disclose sample prices in the demo and omit current stock, loyalty, and checkout.
- **AI boundary.** The model proposes recipe IDs for the week. Production code validates the plan and calculates cart quantities, budget, and ingredient reuse.
- **Reference profile.** Use €35, Standard diet, and Under 20 minutes. A labeled offline reference week is available and must pass the same validation and budget check.
- **Stack.** Keep React, TypeScript, and Vite. Live AI needs only one server-side endpoint. [Architecture](project_context.md)
