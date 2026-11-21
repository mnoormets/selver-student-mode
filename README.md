# Tudengirežiim · Partnerkaart × Selver

Häkatoni prototüüp: **Tudengirežiim** kui eraldiseisev moodul Partnerkaardi äpis. Ütle nädala eelarve — saad menüü, kampaaniakorvi ja jääkide-abilise, mis sobib edasi Partnerkaardi ostunimekirja.

## Mida proovida (2 min demo)

1. Partnerkaardi peamenüüs ava **Student Mode**
2. **35 € · kiire · pasta** → näidisnädal + **34,24 €** korv
3. Vajuta **Mul on kodus 10 muna** → munad 2→1 karp, korv **32,35 €**
4. „Jätka e-Selveris“ (tuleviku CTA)

Demo töötab ilma API-võtmeta. Korv arvutatakse sentides allikaviidetega andmestikust (`src/features/student-mode/data/`), retseptide koostisosad on seotud toote ID-dega.

Kontroll: `npm run verify:demo` — 14 muna → 0/10/14 kodus annavad 2/1/0 karpi; spageti+muna proovijuhtum.

## Käivitamine

```bash
npm install
npm run dev
```

Ava [http://localhost:3847](http://localhost:3847).
