# Selveri toodete import

Student Mode **ei laadi automaatselt kogu Selveri sortimenti**. Ametlikku avalikku “kõik toidud ja joogid” eksporti demos ei ole — selleks on vaja Selveri/Coopi partnerivoogu või käsitsi/imporditud kataloogi.

## Mis praegu töötab

1. **Tuumkataloog** — `../products.ts` (hackathoni demoretseptid).
2. **Lisaimport** — JSON failid selles kaustas (`*.json`), mis liidetakse käivitamisel tuumale.

Iga kirje:

```json
{
  "id": "rye-bread",
  "name": "Rukkileib, ...",
  "packQuantity": 500,
  "unit": "g",
  "priceCents": 149,
  "sourceUrl": "https://...",
  "eSelverUrl": "https://www.selver.ee/...",
  "selverSku": "T0000...",
  "checkedAt": "2026-11-21"
}
```

## Kuidas suuremat kataloogi siia saada

| Tee | Millal | Märkus |
| --- | --- | --- |
| **Partnerifeed** (Selver / Coop / e-Selver) | Kui tahad “kõiki” tooteid päriselt | Parim: SKU, hind, pakisuurus API/CSV-na. Küsi häkatoni kontaktilt. |
| **JSON/CSV import** siia kausta | Kui sul on juba dump | `npm run import:products -- path/to/dump.json` |
| **Käsitsi 10–50 SKU-d** | Demo / pitch | Lisa `products.ts` või `extra-demo.json` |

Ära looda, et brauserist “kogu selver.ee” skreipimine oleks stabiilne või ToS-iga OK — demos piisab kontrollitud pakkidest koos `sourceUrl` + `checkedAt`.

## Käsk

```bash
# valideeri + kirjuta imports/extra-from-dump.json
npm run import:products -- ./my-selver-dump.json
```
