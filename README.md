# Tudengirežiim · Partnerkaart × Selver

Häkatoni prototüüp: **Tudengirežiim** kui eraldiseisev moodul Partnerkaardi äpis. Ütle nädala eelarve — saad menüü, kampaaniakorvi ja jääkide-abilise, mis sobib edasi Partnerkaardi ostunimekirja.

## Mida proovida (2 min demo)

1. Partnerkaardi peamenüüs ava **Student Mode**
2. **35 € · kiire · pasta** → näidisnädal + korv (arvutatud `products.ts` pakihindadest)
3. Vajuta **Mul on kodus 10 muna** → munad 2→1 karp
4. „Jätka e-Selveris“ (tuleviku CTA)

Ainus demo tooteallikas: `src/features/student-mode/data/products.ts` (SKU, e-Selveri link, `checkedAt`). Retseptid viitavad toote ID-dele; korv on sentides. Lovable JSON: `npm run export:lovable` → `public/lovable-demo-data.json`.

Kontroll: `npm run verify:demo` — 14 muna → 0/10/14 kodus annavad 2/1/0 karpi; spageti+muna proovijuhtum.

## Käivitamine

```bash
npm install
npm run dev
```

Ava [http://localhost:3847](http://localhost:3847).
