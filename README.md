# Tudengirežiim · Partnerkaart × Selver

Häkatoni prototüüp: **Tudengirežiim** kui eraldiseisev moodul Partnerkaardi äpis. Ütle nädala eelarve — saad menüü, kampaaniakorvi ja jääkide-abilise, mis sobib edasi Partnerkaardi ostunimekirja.

## Mida proovida (2 teekonda)

### A) Nädalaeelarve (ALUSTA)

1. Partnerkaardi peamenüüs ava **Student Mode**
2. **Alusta** → vali 20–60 € eelarve → **Loo menüü ja korv**
3. Vajuta **Mul on kodus 10 muna** → munad 2→1 karp
4. „Jätka e-Selveris“ (tuleviku CTA)

### B) Tänane söök (Ava vestlus) — ilma nädalaplaanita

1. Student Mode avalehel teine kaart: **Mida ma täna süüa saaks?**
2. **Ava vestlus**
3. Kirjuta: `Mul on 100 g spagette ja kaks muna. Mida ma kiiresti teha saaks?`
4. Oota muna-köögiviljaspagette + 130 g köögiviljasegu puudu + **1× 600 g** pakk (2.39 €)
5. Jätka: `Mul on ka 130 g köögiviljasegu` → **Saad kohe teha**, ostunimekiri tühi
6. Tagasi → **Alusta** avab endiselt nädalaplaani

Ilma `OPENAI_API_KEY`-ta vastab `/api/cook-chat` selgelt märgitud **näidisvastusega**. Võti jääb ainult serverisse.

**Tootekataloog:** tuum `src/features/student-mode/data/products.ts` + valikuline import `data/imports/*.json`. Kogu Selveri sortimenti ametlikult demosse ei tule — selleks on vaja partnerifeedi või oma JSON/CSV dump’i:

```bash
npm run import:products -- ./minu-selver-dump.json
```

Vt `src/features/student-mode/data/imports/README.md`. Retseptid viitavad toote ID-dele; korv on sentides. Lovable JSON: `npm run export:lovable`.

Kontroll: `npm run verify:demo` — 14 muna → 0/10/14 kodus annavad 2/1/0 karpi; spageti+muna cook-chat proovijuhtum.

## Käivitamine

```bash
npm install
npm run dev
```

Ava [http://localhost:3847](http://localhost:3847).
