/* =========================================================================
   Halebop — Din resa genom universum (B-version, djupnavigering)
   Ingen vanlig scroll: hjul / piltangenter / "Fortsätt resan" warpar kameran
   djupare in i universum, ett stopp i taget. Vanilla JS, inga beroenden.
   Produkter i data.js. Varje val loggas via track() för snabb A/B-data.
   ========================================================================= */
(function () {
  "use strict";

  var D = window.HALEBOP_DATA;
  var kr = function (n) { return n.toLocaleString("sv-SE"); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var STEPS = D.steps;                       // plan, phone, streaming, summary
  var LAST = STEPS.length - 1;
  var state = { step: 0, plan: null, phone: null, streaming: [] };
  var animating = false;

  var PLANET = { plan: "green", phone: "coral", streaming: "teal", summary: "yellow" };
  var TINT = { green: "", coral: "", teal: "", yellow: "" };

  /* Ankarpunkter för kommande hållplatser längs vägen (% av stage) */
  var WP_ANCHORS = [
    { x: 60, y: 46, k: "Nästa stopp" },
    { x: 71, y: 35, k: "Sedan" },
    { x: 80, y: 26, k: "Därefter" },
    { x: 87, y: 19, k: "Framme" }
  ];

  var els = {
    warp: document.getElementById("warp"),
    dust: document.getElementById("dust"),
    station: document.getElementById("station"),
    waypoints: document.getElementById("waypoints"),
    steps: document.getElementById("steps"),
    nextLabel: document.getElementById("next-label"),
    consoleNext: document.getElementById("console-next"),
    introTitle: document.getElementById("intro-title"),
    statusText: document.getElementById("status-text"),
    sumList: document.getElementById("summary-list"),
    sumTotal: document.getElementById("summary-total"),
    checkout: document.getElementById("btn-checkout"),
    modal: document.getElementById("modal"),
    mTitle: document.getElementById("modal-title"),
    mEyebrow: document.getElementById("modal-eyebrow"),
    mSub: document.getElementById("modal-sub"),
    mBody: document.getElementById("modal-body"),
    mHint: document.getElementById("modal-hint")
  };

  function track(event, payload) {
    (window.__halebopEvents = window.__halebopEvents || []).push({ t: Date.now(), event: event, payload: payload || null });
    if (window.console && console.debug) console.debug("[halebop]", event, payload || "");
  }
  function find(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }

  /* ---- Ikoner ---------------------------------------------------------- */
  function icon(name) {
    var p = {
      sim:   '<path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><rect x="9" y="12" width="6" height="6" rx="1.2"/>',
      phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.4"/><path d="M11 18.5h2"/>',
      play:  '<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M10 8.5l5 3.5-5 3.5Z"/>',
      star:  '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9Z"/>',
      wifi:  '<path d="M5 12.5a10 10 0 0 1 14 0"/><path d="M8 15.5a6 6 0 0 1 8 0"/><circle cx="12" cy="18.5" r="1"/>'
    }[name] || "";
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>';
  }
  function iconFor(id) { return { plan: "sim", phone: "phone", streaming: "play", summary: "star" }[id]; }
  var FACE = '<svg class="planet__face" viewBox="0 0 300 300" aria-hidden="true">' +
    '<circle cx="120" cy="140" r="9" fill="#15241f"/><circle cx="180" cy="140" r="9" fill="#15241f"/>' +
    '<path d="M116 168 Q150 196 184 168" stroke="#15241f" stroke-width="8" fill="none" stroke-linecap="round"/>' +
    '<circle cx="104" cy="160" r="8" fill="rgba(240,138,120,0.5)"/><circle cx="196" cy="160" r="8" fill="rgba(240,138,120,0.5)"/></svg>';

  /* ---- Min-pris per kategori ------------------------------------------ */
  function minPrice(list) { return list.reduce(function (m, x) { return x.monthly > 0 ? Math.min(m, x.monthly) : m; }, Infinity); }

  /* ---- Aktiv station --------------------------------------------------- */
  function renderStation(cls) {
    var step = STEPS[state.step];
    var color = PLANET[step.id];
    var priceHTML, cardHTML;

    if (step.id === "summary") {
      var total = totalSum();
      priceHTML = '<div class="station__price"><small>Total t.o.m.</small><b>' + kr(total) + ' <span>kr/mån</span></b></div>';
      cardHTML =
        '<div class="station__card" data-open="summary">' +
          '<span class="station__num">★</span>' +
          '<h2>Framme: Din resa</h2>' +
          '<p>Snyggt hopplockat! Kika igenom din resa och lyft.</p>' +
          '<span class="station__hand">Vi hänger med ✨</span>' +
        '</div>';
    } else {
      var chosen = step.id === "plan" ? find(D.plans, state.plan)
                 : step.id === "phone" ? find(D.phones, state.phone)
                 : null;
      var from = step.id === "plan" ? minPrice(D.plans)
               : step.id === "phone" ? minPrice(D.phones)
               : minPrice(D.streaming);
      var label = chosen ? (chosen.monthly === 0 ? "Ingår" : kr(chosen.monthly)) : kr(from);
      priceHTML = '<div class="station__price"><small>' + (chosen ? "Vald" : "Från") + '</small><b>' +
        label + ' <span>kr/mån</span></b></div>';
      cardHTML =
        '<div class="station__card" data-open="' + step.id + '">' +
          '<span class="station__num">' + step.n + '</span>' +
          '<h2>' + step.title + '</h2>' +
          '<p>' + step.blurb + '</p>' +
          '<span class="station__hand">' + (chosen ? "Bra val!" : "Tryck och välj") + '</span>' +
        '</div>';
    }

    els.station.className = "station" + (cls ? " " + cls : "");
    els.station.innerHTML =
      '<div class="planet-wrap">' +
        '<span class="planet planet--' + color + '"><span class="planet__spots"></span>' + FACE + '</span>' +
        '<span class="planet__ring"></span>' +
      '</div>' +
      cardHTML + priceHTML +
      '<div class="station__chip c1">' + iconWhite("phone") + '</div>' +
      '<div class="station__chip c2">' + iconWhite("wifi") + '</div>';

    var openId = step.id;
    function trigger() { if (openId === "summary") { flashSummary(); } else { openStep(openId); } }
    var card = els.station.querySelector(".station__card");
    if (card) card.addEventListener("click", trigger);
    var pw = els.station.querySelector(".planet-wrap");
    if (pw) { pw.style.cursor = "pointer"; pw.addEventListener("click", trigger); }
  }
  function iconWhite(n) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' +
    (n === "phone" ? '<rect x="7" y="2.5" width="10" height="19" rx="2.4"/><path d="M11 18.5h2"/>' : '<path d="M5 12.5a10 10 0 0 1 14 0"/><path d="M8 15.5a6 6 0 0 1 8 0"/><circle cx="12" cy="18.5" r="1"/>') +
    '</svg>'; }

  /* ---- Waypoints + HUD-stegspår ---------------------------------------- */
  function renderWaypoints() {
    var html = "";
    var ahead = STEPS.slice(state.step + 1);
    ahead.forEach(function (s, j) {
      if (j >= WP_ANCHORS.length) return;
      var a = WP_ANCHORS[j];
      var k = (j === ahead.length - 1) ? "Framme" : a.k;
      html += '<div class="wp show" style="left:' + a.x + '%;top:' + a.y + '%">' +
        '<span class="wp__dot"></span><div class="wp__k">' + k + '</div><div class="wp__v">' + s.title + '</div></div>';
    });
    els.waypoints.innerHTML = html;
  }

  function renderSteps() {
    var html = "";
    STEPS.forEach(function (s, i) {
      if (i > 0) html += '<span class="steps__line' + (i <= state.step ? " done" : "") + '"></span>';
      var c = i < state.step ? "done" : (i === state.step ? "active" : "");
      html += '<span class="snode ' + c + '">' + (i < state.step ? "✓" : s.n) + '</span>';
    });
    els.steps.innerHTML = html;

    var next = STEPS[state.step + 1];
    if (next) { els.nextLabel.innerHTML = "Nästa stopp: <b>" + next.title + "</b>"; els.consoleNext.style.visibility = "visible"; }
    else { els.nextLabel.innerHTML = "<b>Framme vid din resa</b>"; els.consoleNext.querySelector(".console__arrow").textContent = "★"; }

    els.checkout.innerHTML = (state.step === LAST)
      ? 'Slutför resan <span aria-hidden="true">🚀</span>'
      : 'Fortsätt resan <span aria-hidden="true">→</span>';
    els.introTitle.innerHTML = (state.step === 0) ? "Första stoppet<br>i ditt universum"
      : (state.step === LAST) ? "Framme i<br>ditt universum"
      : "Djupare in i<br>ditt universum";
  }

  /* ---- Djupnavigering (warp) ------------------------------------------- */
  function go(dir) {
    if (animating) return;
    var target = Math.max(0, Math.min(LAST, state.step + dir));
    if (target === state.step) return;
    var forward = dir > 0;
    animating = true;
    track("warp", { from: state.step, to: target });
    warpBurst();

    if (reduce) {
      state.step = target; renderStation(); afterWarp(); animating = false; return;
    }
    els.station.className = "station " + (forward ? "fly-out" : "fly-back-out");
    setTimeout(function () {
      state.step = target;
      renderStation(forward ? "fly-in" : "fly-back-in");
      afterWarp();
    }, 360);
    setTimeout(function () { animating = false; }, 880);
  }
  function afterWarp() { renderWaypoints(); renderSteps(); }

  /* ---- Val (modal) ----------------------------------------------------- */
  function openStep(stepId) {
    var step = find(STEPS, stepId);
    els.mEyebrow.textContent = "Stopp " + step.n;
    els.mTitle.textContent = step.title;
    els.mSub.textContent = step.blurb;
    els.mHint.textContent = stepId === "streaming" ? "Välj så många du vill" : "Välj ett alternativ";
    renderChoices(stepId);
    els.modal.classList.add("is-open");
    track("open_step", { step: stepId });
  }
  function closeModal() { els.modal.classList.remove("is-open"); }

  function renderChoices(stepId) {
    var html = "";
    if (stepId === "plan") {
      html = '<div class="choices choices--4">' + D.plans.map(function (p) {
        return choiceCard({ id: p.id, group: "plan", selected: state.plan === p.id, badge: p.badge,
          body: '<div class="choice__title">' + p.name + '</div><div class="choice__data">' + p.data + '</div>' +
            '<ul class="choice__perks">' + p.perks.map(function (x) { return '<li>' + x + '</li>'; }).join("") + '</ul>' +
            price(p.monthly, "per månad") });
      }).join("") + '</div>';
    } else if (stepId === "phone") {
      html = '<div class="choices choices--4">' + D.phones.map(function (p) {
        return choiceCard({ id: p.id, group: "phone", selected: state.phone === p.id,
          body: '<span class="choice__planet planet planet--' + p.color + '"></span>' +
            '<div class="choice__brand">' + p.brand + '</div><div class="choice__title">' + p.name + '</div>' +
            '<div class="choice__tag">' + p.tagline + '</div>' +
            price(p.monthly, p.monthly === 0 ? "Ingen extra kostnad" : "i 24 mån") });
      }).join("") + '</div>';
    } else if (stepId === "streaming") {
      html = '<div class="choices choices--3">' + D.streaming.map(function (s) {
        return choiceCard({ id: s.id, group: "streaming", selected: state.streaming.indexOf(s.id) !== -1, multi: true,
          body: '<span class="choice__planet planet planet--' + s.color + '"></span>' +
            '<div class="choice__brand">' + s.tier + '</div><div class="choice__title">' + s.name + '</div>' +
            price(s.monthly, "per månad") });
      }).join("") + '</div>';
    }
    els.mBody.innerHTML = html;
    els.mBody.querySelectorAll(".choice").forEach(function (c) {
      c.addEventListener("click", function () { onChoice(c.getAttribute("data-group"), c.getAttribute("data-id"), stepId); });
    });
  }
  function choiceCard(o) {
    return '<button class="choice' + (o.selected ? ' is-selected' : '') + '" data-group="' + o.group + '" data-id="' + o.id + '"' +
      (o.multi ? ' aria-pressed="' + o.selected + '"' : '') + '>' + (o.badge ? '<span class="choice__badge">' + o.badge + '</span>' : '') + o.body + '</button>';
  }
  function price(amount, sub) {
    if (amount === 0) return '<div class="choice__price free">Ingår <small>' + sub + '</small></div>';
    return '<div class="choice__price">' + kr(amount) + ' kr <small>' + sub + '</small></div>';
  }
  function onChoice(group, id, stepId) {
    if (group === "plan") state.plan = (state.plan === id ? null : id);
    else if (group === "phone") state.phone = (state.phone === id ? null : id);
    else if (group === "streaming") {
      var i = state.streaming.indexOf(id);
      if (i === -1) state.streaming.push(id); else state.streaming.splice(i, 1);
    }
    track("select", { group: group, id: id });
    renderChoices(stepId);
    renderStation();          // uppdatera prischipet/“Bra val!”
    updateSummary(true);
  }

  /* ---- Sammanfattning -------------------------------------------------- */
  function lineItems() {
    var items = [];
    var pl = find(D.plans, state.plan);
    if (pl) items.push({ k: "Abonnemang", v: pl.data, amount: pl.monthly, ic: "sim" });
    var ph = find(D.phones, state.phone);
    if (ph) items.push({ k: "Mobil", v: ph.name, amount: ph.monthly, ic: "phone" });
    state.streaming.forEach(function (sid) {
      var s = find(D.streaming, sid);
      if (s) items.push({ k: "Streaming", v: s.name, amount: s.monthly, ic: "play" });
    });
    return items;
  }
  function totalSum() { return lineItems().reduce(function (s, i) { return s + i.amount; }, 0); }

  function updateSummary(bump) {
    var items = lineItems();
    if (!items.length) {
      els.sumList.innerHTML = '<div class="sline sline--empty">Inget valt ännu — tryck på planeten för att börja.</div>';
    } else {
      els.sumList.innerHTML = items.map(function (i) {
        return '<div class="sline"><span class="sline__ic">' + icon(i.ic) + '</span>' +
          '<span class="sline__main"><span class="sline__k">' + i.k + '</span><span class="sline__v">' + i.v + '</span></span>' +
          '<span class="sline__price">' + (i.amount === 0 ? "0 kr" : kr(i.amount) + " kr/mån") + '</span></div>';
      }).join("");
    }
    var total = totalSum();
    els.sumTotal.innerHTML = kr(total) + ' <small>kr</small>';
    document.getElementById("cart-badge").textContent = items.length;
    if (bump && !reduce) { els.sumTotal.classList.remove("bump"); void els.sumTotal.offsetWidth; els.sumTotal.classList.add("bump"); }
  }
  function flashSummary() {
    var s = document.getElementById("summary");
    s.scrollIntoView({ behavior: "smooth", block: "center" });
    s.animate ? s.animate([{ boxShadow: "0 0 0 3px var(--gold)" }, {}], { duration: 900 }) : null;
  }

  /* ---- Canvas-warp (3D-stjärnfält) ------------------------------------- */
  function warpEngine() {
    var c = els.warp, ctx = c.getContext("2d"), stars = [], w, h, dpr, cx, cy;
    var speed = 0.6, idle = 0.6;
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = c.width = innerWidth * dpr; h = c.height = innerHeight * dpr;
      c.style.width = innerWidth + "px"; c.style.height = innerHeight + "px";
      cx = w * 0.72; cy = h * 0.34;                 // fokus mot kärnan
      var n = Math.round((innerWidth * innerHeight) / 5200);
      stars = [];
      for (var i = 0; i < n; i++) stars.push(newStar(true));
    }
    function newStar(spread) {
      return { x: (Math.random() * 2 - 1) * w, y: (Math.random() * 2 - 1) * h,
        z: spread ? Math.random() * w : w, pz: 0,
        col: Math.random() < 0.08 ? "#ffd98a" : (Math.random() < 0.12 ? "#bfeae6" : "#ffffff") };
    }
    function frame() {
      speed += (idle - speed) * 0.05;               // mjuk återgång till idle
      ctx.fillStyle = "rgba(58,112,120,0.24)"; ctx.fillRect(0, 0, w, h);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        s.pz = s.z; s.z -= speed * dpr * 3.2;
        if (s.z < 1) { stars[i] = newStar(false); continue; }
        var k = 160 * dpr, sx = cx + (s.x / s.z) * k, sy = cy + (s.y / s.z) * k;
        var px = cx + (s.x / s.pz) * k, py = cy + (s.y / s.pz) * k;
        if (sx < 0 || sx > w || sy < 0 || sy > h) continue;
        var r = Math.max(0.4, (1 - s.z / w) * 2.4 * dpr);
        ctx.strokeStyle = s.col; ctx.globalAlpha = Math.min(1, (1 - s.z / w) + 0.2);
        ctx.lineWidth = r; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(sx, sy); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    }
    resize();
    window.addEventListener("resize", resize);
    if (!reduce) frame(); else { ctx.fillStyle = "rgba(58,112,120,0.3)"; ctx.fillRect(0, 0, w, h); }
    window.__warp = function () { speed = 30; };     // burst
  }
  function warpBurst() { if (window.__warp) window.__warp(); }

  /* ---- Dekorativt stoft ------------------------------------------------ */
  function buildDust() {
    if (reduce) return;
    var cols = ["#f08a78", "#8cc79a", "#6fc6c0", "#ffd23f", "#ffffff"], html = "";
    for (var i = 0; i < 22; i++) {
      var sz = 4 + Math.random() * 12, x = Math.random() * 100, y = Math.random() * 100;
      var dur = 6 + Math.random() * 10, c = cols[i % cols.length];
      html += '<i style="left:' + x + '%;top:' + y + '%;width:' + sz + 'px;height:' + sz + 'px;background:' + c +
        ';animation-duration:' + dur + 's;animation-delay:' + (-Math.random() * dur) + 's"></i>';
    }
    els.dust.innerHTML = html;
  }

  /* ---- Init ------------------------------------------------------------ */
  els.consoleNext.addEventListener("click", function () { go(1); });
  els.checkout.addEventListener("click", function () {
    if (state.step === LAST) { track("checkout", { state: state, total: totalSum() }); els.checkout.innerHTML = "Vi hänger med… 🚀"; els.checkout.disabled = true; }
    else go(1);
  });
  els.modal.querySelectorAll("[data-close]").forEach(function (b) { b.addEventListener("click", closeModal); });
  document.getElementById("cart").addEventListener("click", function (e) { e.preventDefault(); flashSummary(); });

  document.addEventListener("keydown", function (e) {
    if (els.modal.classList.contains("is-open")) { if (e.key === "Escape") closeModal(); return; }
    if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); go(1); }
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
  });

  // Hjul = djup (debouncad)
  var wheelLock = false;
  document.getElementById("stage").addEventListener("wheel", function (e) {
    if (els.modal.classList.contains("is-open")) return;
    e.preventDefault();
    if (wheelLock || Math.abs(e.deltaY) < 8) return;
    wheelLock = true; setTimeout(function () { wheelLock = false; }, 700);
    go(e.deltaY > 0 ? 1 : -1);
  }, { passive: false });

  warpEngine();
  buildDust();
  renderStation();
  renderWaypoints();
  renderSteps();
  updateSummary(false);
  track("load", { ab: "universe-depth" });
})();
