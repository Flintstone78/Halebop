/* =========================================================================
   Halebop — Kometresan (B-version)
   Stegbaserad resa genom solsystemet. Vanilla JS, inga beroenden.
   Tanken: en ny variant ska kunna skjutas ut snabbt — all copy/logik här,
   produkterna i data.js. Varje val loggas (track()) så att A/B-data kan samlas.
   ========================================================================= */
(function () {
  "use strict";

  var D = window.HALEBOP_DATA;
  var kr = function (n) { return n.toLocaleString("sv-SE"); };

  /* ---- Tillstånd ------------------------------------------------------ */
  var state = {
    step: 0,
    phone: null,        // id
    plan: null,         // id
    broadband: "bb_none",
    streaming: []       // ids
  };

  var els = {
    scene: document.getElementById("scene"),
    rail: document.getElementById("rail-planets"),
    comet: document.getElementById("comet"),
    tally: document.getElementById("tally"),
    prev: document.getElementById("btn-prev"),
    next: document.getElementById("btn-next")
  };

  /* ---- Enkel event-logg (här skulle riktig analytics kopplas in) ------ */
  function track(event, payload) {
    var entry = { t: Date.now(), event: event, payload: payload || null };
    (window.__halebopEvents = window.__halebopEvents || []).push(entry);
    if (window.console && console.debug) console.debug("[halebop]", event, payload || "");
  }

  /* ---- Prisuträkning -------------------------------------------------- */
  function find(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }

  function lineItems() {
    var items = [];
    var p = find(D.phones, state.phone);
    if (p) items.push({ label: "Telefon · " + p.name, amount: p.monthly });
    var pl = find(D.plans, state.plan);
    if (pl) items.push({ label: "Abonnemang · " + pl.name + " (" + pl.data + ")", amount: pl.monthly });
    var bb = find(D.broadband, state.broadband);
    if (bb && bb.monthly > 0) items.push({ label: "Bredband · " + bb.speed, amount: bb.monthly });
    state.streaming.forEach(function (sid) {
      var s = find(D.streaming, sid);
      if (s) items.push({ label: "Streaming · " + s.name, amount: s.monthly });
    });
    return items;
  }
  function total() { return lineItems().reduce(function (sum, i) { return sum + i.amount; }, 0); }

  /* ---- Stegdefinitioner (render-funktioner) --------------------------- */
  var steps = [renderStart, renderPhone, renderPlan, renderBroadband, renderStreaming, renderSummary];

  function renderStart() {
    return '' +
      '<section class="step is-active hero">' +
        '<div>' +
          '<p class="eyebrow">Halebop · sedan kometen 1997</p>' +
          '<h1>Bygg ditt abonnemang —<br><em>en planet i taget.</em></h1>' +
          '<p class="lead">Halebop är uppkallat efter en komet. Så vi tänkte: varför klicka i ett tråkigt formulär när du kan följa kometen genom solsystemet och plocka ihop telefon, surf, bredband och streaming på vägen? Inga konstigheter, ingen bindningstid.</p>' +
          '<div class="hero__stats">' +
            stat("5G", "i hela Telias nät") +
            stat("0 kr", "i bindningstid") +
            stat("6", "stopp på resan") +
          '</div>' +
        '</div>' +
        '<div class="hero__art" aria-hidden="true">' +
          '<div class="orbit-ring"></div>' +
          '<div class="orbit-ring r2"></div>' +
          '<div class="orbit-ring r3"></div>' +
          '<div class="hero__sun"></div>' +
        '</div>' +
      '</section>';
  }
  function stat(b, s) { return '<div class="hero__stat"><b>' + b + '</b><span>' + s + '</span></div>'; }

  function renderPhone() {
    var cards = D.phones.map(function (p) {
      return card({
        id: p.id, group: "phone", selected: state.phone === p.id,
        body:
          '<div class="card__emoji">' + p.emoji + '</div>' +
          '<div class="card__brand">' + p.brand + '</div>' +
          '<div class="card__title">' + p.name + '</div>' +
          '<div class="card__tag">' + p.tagline + '</div>' +
          priceTag(p.monthly, p.monthly === 0 ? "Ingen extra kostnad" : "i 24 mån")
      });
    }).join("");
    return stepShell("Stopp 1 · Merkurius", "Vilken <em>lur</em> följer med?",
      "Närmast solen, snabbast i omloppsbana. Ta med din egen telefon eller plocka en ny på smidig delbetalning.",
      '<div class="grid grid--phones">' + cards + '</div>');
  }

  function renderPlan() {
    var cards = D.plans.map(function (p) {
      return card({
        id: p.id, group: "plan", selected: state.plan === p.id, badge: p.badge,
        body:
          (p.badge ? '' : '') +
          '<div class="card__title">' + p.name + '</div>' +
          '<div class="card__data">' + p.data + '</div>' +
          '<ul class="perks">' + p.perks.map(function (x) { return '<li>' + x + '</li>'; }).join("") + '</ul>' +
          priceTag(p.monthly, "per månad")
      });
    }).join("");
    return stepShell("Stopp 2 · Venus", "Hur mycket <em>surf</em> behöver du?",
      "Den ljusstarkaste planeten. Välj abonnemanget som matchar din värld — allt utan bindningstid.",
      '<div class="grid grid--plans">' + cards + '</div>');
  }

  function renderBroadband() {
    var cards = D.broadband.map(function (b) {
      return card({
        id: b.id, group: "broadband", selected: state.broadband === b.id,
        body:
          '<div class="card__emoji">' + b.emoji + '</div>' +
          '<div class="card__title">' + b.name + '</div>' +
          '<div class="card__data">' + b.speed + '</div>' +
          priceTag(b.monthly, b.monthly === 0 ? "Klart utan" : "per månad")
      });
    }).join("");
    return stepShell("Stopp 3 · Mars", "Vill du ha <em>bredband</em> hemma?",
      "Den röda planeten — frivilligt stopp. Lägg till fiber hemma, eller flyg vidare. Du väljer.",
      '<div class="grid grid--bb">' + cards + '</div>');
  }

  function renderStreaming() {
    var cards = D.streaming.map(function (s) {
      return card({
        id: s.id, group: "streaming", selected: state.streaming.indexOf(s.id) !== -1, multi: true,
        body:
          '<div class="card__emoji">' + s.emoji + '</div>' +
          '<div class="card__title">' + s.name + '</div>' +
          '<div class="card__tag">' + s.tier + '</div>' +
          priceTag(s.monthly, "per månad")
      });
    }).join("");
    return stepShell("Stopp 4 · Jupiter", "Lägg till <em>streaming</em>",
      "Solsystemets gigant rymmer allt. Plocka så många tjänster du vill — allt samlat på en faktura.",
      '<div class="grid grid--stream">' + cards + '</div>');
  }

  function renderSummary() {
    var items = lineItems();
    var rows = items.length
      ? items.map(function (i) {
          return '<div class="receipt__row"><span>' + i.label + '</span><b>' +
            (i.amount === 0 ? "0 kr" : kr(i.amount) + " kr") + '</b></div>';
        }).join("")
      : '<div class="receipt__row muted"><span>Inget valt ännu — flyg tillbaka och plocka ihop din resa.</span><b>—</b></div>';

    var summary =
      '<div class="summary">' +
        '<div class="receipt">' +
          '<h3>Din färdplan</h3>' +
          rows +
          '<div class="receipt__total"><b>' + kr(total()) + ' kr</b><span>/mån totalt</span></div>' +
        '</div>' +
        '<div class="cta-panel">' +
          '<p>Snyggt hopplockat. Allt på ett SIM och en faktura — och fortfarande noll bindningstid. Klicka vidare så tar vi dig till kassan (här skulle affiliate-länken ligga).</p>' +
          '<button class="btn btn--primary btn--lg" id="cta-checkout">Sätt fart 🚀</button>' +
        '</div>' +
      '</div>';

    return stepShell("Sista stoppet · Saturnus", "Din <em>resa</em> i en ring",
      "Ringarna håller ihop allt du valt. Kika igenom, justera om du vill — annars är du redo att lyfta.",
      summary);
  }

  function stepShell(eyebrow, title, lead, content) {
    return '' +
      '<section class="step is-active">' +
        '<p class="eyebrow">' + eyebrow + '</p>' +
        '<h1>' + title + '</h1>' +
        '<p class="lead">' + lead + '</p>' +
        content +
      '</section>';
  }

  function priceTag(amount, sub) {
    if (amount === 0) return '<div class="card__price free">' + sub + '</div>';
    return '<div class="card__price">' + kr(amount) + ' kr <small>' + sub + '</small></div>';
  }

  function card(o) {
    return '' +
      '<button class="card' + (o.selected ? ' is-selected' : '') + '" ' +
        'data-group="' + o.group + '" data-id="' + o.id + '" ' +
        (o.multi ? 'aria-pressed="' + o.selected + '"' : '') + '>' +
        (o.badge ? '<span class="badge">' + o.badge + '</span>' : '') +
        o.body +
      '</button>';
  }

  /* ---- Val ------------------------------------------------------------ */
  function onCardClick(group, id) {
    if (group === "phone") state.phone = (state.phone === id ? null : id);
    else if (group === "plan") state.plan = id;
    else if (group === "broadband") state.broadband = id;
    else if (group === "streaming") {
      var i = state.streaming.indexOf(id);
      if (i === -1) state.streaming.push(id); else state.streaming.splice(i, 1);
    }
    track("select", { group: group, id: id });
    renderStep();        // rita om aktuellt steg (uppdaterar markeringar)
    updateTally(true);
  }

  /* ---- Rendering av steg + rail --------------------------------------- */
  function renderStep() {
    els.scene.innerHTML = steps[state.step]();
    els.scene.scrollTop = 0;

    // koppla kortklick
    Array.prototype.forEach.call(els.scene.querySelectorAll(".card"), function (c) {
      c.addEventListener("click", function () {
        onCardClick(c.getAttribute("data-group"), c.getAttribute("data-id"));
      });
    });
    var checkout = document.getElementById("cta-checkout");
    if (checkout) checkout.addEventListener("click", function () {
      track("checkout", { total: total(), state: state });
      checkout.textContent = "Lyfter… 🛰️";
      checkout.disabled = true;
    });

    updateRail();
    updateNav();
  }

  function buildRail() {
    els.rail.innerHTML = D.planets.map(function (p, i) {
      return '<button class="planet-dot" data-body="' + bodyFor(p.body) + '" data-step="' + i + '" ' +
        'title="' + p.hint + '"><span class="planet-dot__label">' + p.name + '</span></button>';
    }).join("");
    Array.prototype.forEach.call(els.rail.querySelectorAll(".planet-dot"), function (dot) {
      dot.addEventListener("click", function () { goTo(parseInt(dot.getAttribute("data-step"), 10)); });
    });
  }
  function bodyFor(b) { return b === "sol" ? "sun" : b; }

  function updateRail() {
    var dots = els.rail.querySelectorAll(".planet-dot");
    Array.prototype.forEach.call(dots, function (dot, i) {
      dot.classList.toggle("is-active", i === state.step);
      dot.classList.toggle("is-done", i < state.step);
    });
    // flytta kometen till aktiv planet
    var active = dots[state.step];
    if (active) {
      var railRect = els.rail.getBoundingClientRect();
      var r = active.getBoundingClientRect();
      var y = r.top - railRect.top + r.height / 2;
      els.comet.style.top = y + "px";
    }
  }

  /* ---- Navigering ----------------------------------------------------- */
  function canAdvance() {
    if (state.step === 1) return !!state.phone;   // måste välja telefon/SIM
    if (state.step === 2) return !!state.plan;    // måste välja abonnemang
    return true;
  }

  function updateNav() {
    els.prev.style.visibility = state.step === 0 ? "hidden" : "visible";
    var last = state.step === steps.length - 1;
    els.next.style.visibility = last ? "hidden" : "visible";
    els.next.disabled = !canAdvance();
    els.next.innerHTML = state.step === 0
      ? 'Starta resan <span aria-hidden="true">🚀</span>'
      : (state.step === steps.length - 2
          ? 'Till färdplanen <span aria-hidden="true">→</span>'
          : 'Fortsätt <span aria-hidden="true">→</span>');
  }

  function goTo(i) {
    i = Math.max(0, Math.min(steps.length - 1, i));
    if (i === state.step) return;
    // tillåt bara att hoppa förbi obligatoriska steg om de är ifyllda
    if (i > state.step) {
      if (state.step >= 1 && !state.phone) return;
      if (i > 2 && !state.plan) return;
    }
    state.step = i;
    track("step", { step: i, planet: D.planets[i].id });
    renderStep();
  }

  /* ---- Löpande summa -------------------------------------------------- */
  function updateTally(bump) {
    els.tally.innerHTML = kr(total()) + ' <span>kr/mån</span>';
    if (bump) {
      els.tally.classList.remove("bump");
      void els.tally.offsetWidth;       // reflow för att starta om animationen
      els.tally.classList.add("bump");
    }
  }

  /* ---- Stjärnfält (canvas) ------------------------------------------- */
  function starfield() {
    var c = document.getElementById("starfield");
    var ctx = c.getContext("2d");
    var stars = [], shooting = null, w, h, dpr;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = c.width = innerWidth * dpr; h = c.height = innerHeight * dpr;
      c.style.width = innerWidth + "px"; c.style.height = innerHeight + "px";
      var count = Math.round((innerWidth * innerHeight) / 7000);
      stars = [];
      for (var i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w, y: Math.random() * h,
          r: (Math.random() * 1.3 + 0.2) * dpr,
          tw: Math.random() * Math.PI * 2,
          sp: Math.random() * 0.02 + 0.004,
          drift: (Math.random() * 0.12 + 0.02) * dpr
        });
      }
    }

    function spawnShooting() {
      if (reduce) return;
      shooting = {
        x: Math.random() * w * 0.6, y: Math.random() * h * 0.4,
        len: (Math.random() * 120 + 80) * dpr, life: 0,
        max: 60, vx: (Math.random() * 4 + 5) * dpr, vy: (Math.random() * 2 + 1.5) * dpr
      };
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        s.tw += s.sp; s.y += s.drift;
        if (s.y > h) s.y = 0;
        var a = 0.45 + Math.sin(s.tw) * 0.4;
        ctx.globalAlpha = Math.max(0.05, a);
        ctx.fillStyle = i % 11 === 0 ? "#ffd36e" : (i % 7 === 0 ? "#ff8ac0" : "#ffffff");
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (shooting) {
        var sh = shooting; sh.life++;
        sh.x += sh.vx; sh.y += sh.vy;
        var grad = ctx.createLinearGradient(sh.x, sh.y, sh.x - sh.len, sh.y - sh.len * (sh.vy / sh.vx));
        grad.addColorStop(0, "rgba(255,45,135,0.9)");
        grad.addColorStop(1, "rgba(255,45,135,0)");
        ctx.strokeStyle = grad; ctx.lineWidth = 2 * dpr; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(sh.x, sh.y);
        ctx.lineTo(sh.x - sh.len, sh.y - sh.len * (sh.vy / sh.vx)); ctx.stroke();
        if (sh.life > sh.max || sh.x > w) shooting = null;
      }
      requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", function () { resize(); updateRail(); });
    if (!reduce) {
      frame();
      setInterval(function () { if (!shooting && Math.random() > 0.4) spawnShooting(); }, 3200);
    } else {
      frame(); // en statisk ruta
    }
  }

  /* ---- Init ----------------------------------------------------------- */
  els.next.addEventListener("click", function () { goTo(state.step + 1); });
  els.prev.addEventListener("click", function () { goTo(state.step - 1); });
  document.addEventListener("keydown", function (e) {
    if (e.target && /^(INPUT|TEXTAREA|BUTTON)$/.test(e.target.tagName)) return;
    if (e.key === "ArrowRight") { if (canAdvance()) goTo(state.step + 1); }
    if (e.key === "ArrowLeft") goTo(state.step - 1);
  });

  buildRail();
  renderStep();
  updateTally(false);
  starfield();
  track("load", { ab: "comet-b" });
})();
