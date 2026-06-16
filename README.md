# Halebop — Kometresan (B-version)

En experimentell, *jävligt mycket snyggare* version av halebop.se, byggd som en
rymdfärd: du följer Halebops komet genom solsystemet och bygger ihop ditt
abonnemang ett stopp i taget — telefon, abonnemang, bredband och streaming.

Tanken är att sajten ska leva vidare som en **affiliate-/experimentyta** där vi
snabbt kan skjuta ut nya varianter med hjälp av AI, samla data och testa
UX-lösningar och erbjudanden.

## Varför rymden?

Halebop är uppkallat efter **Hale–Bopp-kometen** (synlig 1997). Rymdtemat ligger
alltså i varumärkets DNA — och kometen blir en naturlig guide genom flödet.

## Resan

| Stopp | Planet | Vad du väljer |
|------:|--------|---------------|
| 0 | Solen | Uppskjutning / hero |
| 1 | Merkurius | Telefon (eller ta med egen / bara SIM) |
| 2 | Venus | Abonnemang (surf) |
| 3 | Mars | Bredband hemma *(frivilligt)* |
| 4 | Jupiter | Streamingtjänster *(flerval)* |
| 5 | Saturnus | Färdplan + kassa (affiliate-CTA) |

En löpande summa (**Din färdplan**) uppdateras live i sidfoten för varje val.

## Designspråk

- **Färg:** djupt kosmos (lila/svart) + Halebops signaturrosa `#ff2d87` + stjärnguld.
- **Signatur:** kometen som åker längs orbit-rail:en från planet till planet.
- **Typografi:** Space Grotesk (display) + Sora (body), med systemfallbacks.
- Tillgänglighet: tangentbordsnavigering (←/→), synlig fokusmarkering,
  `prefers-reduced-motion` respekteras.

## Köra lokalt

Helt byggstegsfritt — öppna bara filen:

```bash
# valfritt: enkel lokal server
python3 -m http.server 8000
# → http://localhost:8000
```

eller öppna `index.html` direkt i webbläsaren.

## Struktur

```
index.html              # skal: topbar, rail, scen, sidfot
assets/css/styles.css   # hela designsystemet (tokens högst upp)
assets/js/data.js       # ALLA produkter/priser — ändra här för ny variant
assets/js/app.js        # steg-/state-logik, komet, stjärnfält, eventlogg
```

## Skjuta ut en ny variant (A/B)

1. **Innehåll/priser:** redigera `assets/js/data.js`.
2. **Look:** justera tokens högst upp i `assets/css/styles.css`.
3. **Mätning:** alla val loggas via `track()` i `app.js` till
   `window.__halebopEvents`. Koppla in riktig analytics där `track()` definieras.

## Status

Demo/prototyp. Affiliate-länkar och kassaflöde är platshållare. Produkter och
priser är representativa exempel, inte en officiell prislista.
