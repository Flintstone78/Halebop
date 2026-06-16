# Överlämning till nästa session

**Branch att jobba på:** `claude/loving-shannon-sxhs53`
**Projekt:** Halebop "Din resa genom universum" — en B-version av halebop.se som
affiliate-/experimentyta. Statisk sajt, inga byggsteg (öppna `index.html`).

## Var vi är nu
En immersiv **djupresa** är byggd och pushad: man scrollar inte, man *dyker djupare*
in i universum. Hjul / piltangenter / "Fortsätt resan" warpar kameran framåt mot en
lysande galaxkärna, ett stopp i taget (Abonnemang → Mobil → Streaming → Din resa).
Procedurell canvas-warp + CSS, ljus drömsk teal-palett, holografisk HUD och en
cockpit-dashboard nederst.

Filer:
- `index.html` — skal (nav, stage, station, summary-HUD, cockpit, modal)
- `assets/css/styles.css` — designsystem (tokens högst upp)
- `assets/js/data.js` — produkter/priser (ändra här för ny variant)
- `assets/js/app.js` — djupmotor (warp), stationer, modaler, eventlogg `track()`

## NÄSTA UPPGIFT (det här ska sessionen ta vid på)
Baka in **Higgsfield-genererad galax** bakom warp-effekten. Detta var blockerat
tidigare av miljöns egress-allowlist; användaren håller på att tillåta
`*.cloudfront.net` (Network access = Custom + inkludera defaults, eller Full).

1. **Verifiera egress** (ska ge HTTP 200, inte 403 "Host not in allowlist"):
   ```
   curl -sSL -o assets/img/galaxy-hero.png -w "%{http_code}\n" \
     "https://d8j0ntlcm91z4.cloudfront.net/user_31lzKoSpboO8qwWIiCCdqBBI5ak/hf_20260616_103757_5dc9e736-5ee8-4b9d-91dd-3868530fc732.png"
   ```
   - Redan genererad bild (Higgsfield job id): `5dc9e736-5ee8-4b9d-91dd-3868530fc732`
   - Om 403 kvarstår: be användaren bekräfta att policyn sparats OCH att en NY
     session startats (ändringen slår igenom först i ny session).

2. **Generera + hämta en flyg-in-i-universum-video** med Higgsfield MCP
   (`mcp__Higgsfield__generate_video`), använd galax-bilden som `start_image` för
   konsistens. Saldo fanns gott om (ultimate-plan). Hämta ner mp4 till `assets/video/`.

3. **Baka in i sajten:** lägg bilden som en mjuk bakgrund och/eller videon som ett
   `<video autoplay muted loop playsinline>`-lager *bakom* canvas-warpen
   (`#warp`), med CSS-gradienten kvar som fallback. Behåll warp-stjärnorna ovanpå.
   Tona ev. ner videon (opacity/blur) så HUD-kontrasten håller.

4. Verifiera i headless Chromium (puppeteer via `npm i puppeteer`, körs i sandbox),
   städa bort node_modules/screenshots, committa och pusha.

## Arbetssätt
- Utveckla på branchen ovan, committa med tydliga meddelanden, pusha med
  `git push -u origin claude/loving-shannon-sxhs53`.
- Skapa INTE en PR om användaren inte ber om det.
- Svara användaren på svenska.
