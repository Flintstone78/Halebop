/* =========================================================================
   Halebop — Kometresan (B-version)
   Produktdata. Allt på ett ställe så att en ny version snabbt kan skjutas ut.
   Priser i kr/mån om inget annat anges. Detta är en demo/affiliate-prototyp.
   ========================================================================= */

window.HALEBOP_DATA = {
  // Varje "planet" är ett steg i resan.
  planets: [
    { id: "start",     name: "Uppskjutning", body: "sol",     hint: "Starta resan" },
    { id: "phone",     name: "Merkurius",    body: "mercury", hint: "Välj telefon" },
    { id: "plan",      name: "Venus",        body: "venus",   hint: "Välj abonnemang" },
    { id: "broadband", name: "Mars",         body: "mars",    hint: "Lägg till bredband" },
    { id: "streaming", name: "Jupiter",      body: "jupiter", hint: "Lägg till streaming" },
    { id: "summary",   name: "Saturnus",     body: "saturn",  hint: "Din färdplan" }
  ],

  phones: [
    {
      id: "byo",   name: "Ta med din egen", brand: "Bara SIM",
      monthly: 0,  upfront: 0, emoji: "📱",
      tagline: "Behåll luren du har — vi skickar bara ett SIM."
    },
    {
      id: "iphone16", name: "iPhone 16", brand: "Apple",
      monthly: 279, upfront: 0, emoji: "🤍",
      tagline: "24 mån delbetalning. Glittrar fint i mörkret."
    },
    {
      id: "s25", name: "Galaxy S25", brand: "Samsung",
      monthly: 249, upfront: 0, emoji: "💙",
      tagline: "AI i fickan och en kamera som ser stjärnor."
    },
    {
      id: "pixel9", name: "Pixel 9", brand: "Google",
      monthly: 209, upfront: 0, emoji: "💜",
      tagline: "Ren Android. Magisk redigering på köpet."
    }
  ],

  plans: [
    {
      id: "lagom", name: "Lagom", data: "30 GB",
      monthly: 195, badge: null,
      perks: ["Fri surf i sociala medier", "5G i hela Telias nät", "Ingen bindningstid"]
    },
    {
      id: "mellan", name: "Mellan", data: "100 GB",
      monthly: 245, badge: "Populärast",
      perks: ["Datarollover", "EU-roaming ingår", "Ingen bindningstid"]
    },
    {
      id: "granslost", name: "Gränslöst", data: "Obegränsad surf",
      monthly: 345, badge: null,
      perks: ["Obegränsad data i full fart", "Dela surf med 3 extra SIM", "Ingen bindningstid"]
    },
    {
      id: "stjarnklart", name: "Stjärnklart", data: "Obegränsad + streaming",
      monthly: 469, badge: "Bäst värde",
      perks: ["Obegränsad surf", "1 streamingtjänst på köpet", "5G+ prioriterad fart"]
    }
  ],

  broadband: [
    { id: "bb_none", name: "Inget bredband", speed: "Hoppa över", monthly: 0,   emoji: "🚫" },
    { id: "bb100",   name: "Lagom hem",       speed: "100 Mbit",  monthly: 299, emoji: "🛰️" },
    { id: "bb250",   name: "Familjehem",      speed: "250 Mbit",  monthly: 379, emoji: "📡" },
    { id: "bb1000",  name: "Ljushastighet",   speed: "1000 Mbit", monthly: 449, emoji: "🚀" }
  ],

  streaming: [
    { id: "netflix",  name: "Netflix",   tier: "Standard",  monthly: 99,  emoji: "🎬" },
    { id: "hbo",      name: "HBO Max",   tier: "Standard",  monthly: 109, emoji: "🐉" },
    { id: "disney",   name: "Disney+",   tier: "Standard",  monthly: 99,  emoji: "✨" },
    { id: "spotify",  name: "Spotify",   tier: "Premium",   monthly: 119, emoji: "🎧" },
    { id: "viaplay",  name: "Viaplay",   tier: "Total",     monthly: 169, emoji: "⚽" }
  ]
};
