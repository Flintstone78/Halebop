/* =========================================================================
   Halebop — Din resa, ditt universum (B-version)
   Produktdata. Allt på ett ställe så att en ny variant snabbt kan skjutas ut.
   Priser i kr/mån om inget annat anges. Demo/affiliate-prototyp.
   ========================================================================= */

window.HALEBOP_DATA = {
  /* Resans steg — speglar journey-kartan på startsidan. */
  steps: [
    { id: "plan",      n: 1, name: "Abonnemang", planet: "green",  icon: "sim",
      title: "Välj abonnemang", blurb: "Fria samtal, SMS och massor av surf." },
    { id: "phone",     n: 2, name: "Mobil",      planet: "coral",  icon: "phone",
      title: "Välj mobil", blurb: "Hitta mobilen som passar dig." },
    { id: "streaming", n: 3, name: "Streaming",  planet: "teal",   icon: "play",
      title: "Välj streaming", blurb: "Underhållning som följer med dig." },
    { id: "summary",   n: 4, name: "Din resa",   planet: "yellow", icon: "star",
      title: "Din resa", blurb: "Se din kombination och klart!" }
  ],

  plans: [
    { id: "liten",   name: "Liten",   data: "15 GB",            monthly: 249, badge: null,
      perks: ["Fria samtal & SMS", "5G i Telias nät", "Ingen bindningstid"] },
    { id: "mellan",  name: "Mellan",  data: "40 GB",            monthly: 299, badge: "Populärast",
      perks: ["Fria samtal & SMS", "Datarollover", "EU-roaming ingår"] },
    { id: "stor",    name: "Stor",    data: "100 GB",           monthly: 349, badge: null,
      perks: ["Fria samtal & SMS", "Dela surf med 3 SIM", "5G+ prioriterad fart"] },
    { id: "granslos",name: "Gränslös",data: "Obegränsad surf",  monthly: 449, badge: "Bäst värde",
      perks: ["Fria samtal & SMS", "Obegränsad data i full fart", "1 streamingtjänst ingår"] }
  ],

  phones: [
    { id: "byo",     name: "Ta med din egen", brand: "Bara SIM", monthly: 0,   color: "green",
      tagline: "Behåll mobilen du har — vi skickar bara ett SIM." },
    { id: "s24",     name: "Galaxy S24",      brand: "Samsung",  monthly: 199, color: "teal",
      tagline: "AI i fickan och en kamera som ser stjärnor." },
    { id: "iphone16",name: "iPhone 16",       brand: "Apple",    monthly: 279, color: "coral",
      tagline: "24 mån delbetalning. Glittrar fint i mörkret." },
    { id: "pixel9",  name: "Pixel 9",         brand: "Google",   monthly: 209, color: "yellow",
      tagline: "Ren Android. Magisk redigering på köpet." }
  ],

  streaming: [
    { id: "netflix", name: "Netflix",  tier: "Standard", monthly: 99,  color: "coral" },
    { id: "hbo",     name: "HBO Max",  tier: "Standard", monthly: 109, color: "teal" },
    { id: "disney",  name: "Disney+",  tier: "Standard", monthly: 99,  color: "green" },
    { id: "spotify", name: "Spotify",  tier: "Premium",  monthly: 119, color: "yellow" },
    { id: "viaplay", name: "Viaplay",  tier: "Total",    monthly: 169, color: "coral" }
  ]
};
