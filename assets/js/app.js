/* =========================================================================
   Halebop — Din resa, ditt universum (B-version)
   Lekfull, ljus journey-konfigurator. Vanilla JS, inga beroenden.
   Produkter i data.js. Varje val loggas via track() för snabb A/B-data.
   ========================================================================= */
(function () {
  "use strict";

  var D = window.HALEBOP_DATA;
  var kr = function (n) { return n.toLocaleString("sv-SE"); };

  var state = { plan: null, phone: null, streaming: [] };

  /* Positioner för noderna på journey-kartan (% av kartan) + planetstorlek */
  var LAYOUT = {
    plan:      { x: 21, y: 61, size: 150 },
    phone:     { x: 45, y: 39, size: 166 },
    streaming: { x: 61, y: 64, size: 146 },
    summary:   { x: 64, y: 20, size: 120 }
  };
  var TINT = { green: "tint-green", coral: "tint-coral", teal: "tint-teal", yellow: "tint-yellow" };

  /* ---- Ikoner ---------------------------------------------------------- */
  function icon(name) {
    var p = {
      sim:   '<path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><rect x="9" y="12" width="6" height="6" rx="1.2"/>',
      phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.4"/><path d="M11 18.5h2"/>',
      play:  '<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M10 8.5l5 3.5-5 3.5Z"/>',
      star:  '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9Z"/>'
    }[name] || "";
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>';
  }
  function iconFor(stepId) { return { plan: "sim", phone: "phone", streaming: "play", summary: "star" }[stepId]; }
  function planetHTML(color, size) {
    var ring = (color === "teal" || color === "yellow") ? '<span class="planet__ring"></span>' : "";
    return '<span class="planet planet--' + color + '" style="width:' + size + 'px;height:' + size + 'px">' + ring + '</span>';
  }

  var els = {
    map: document.getElementById("map"),
    journeyM: document.getElementById("journey-m"),
    sumList: document.getElementById("summary-list"),
    sumTotal: document.getElementById("summary-total"),
    summary: document.getElementById("summary"),
    cartBadge: document.getElementById("cart-badge"),
    modal: document.getElementById("modal"),
    mTitle: document.getElementById("modal-title"),
    mEyebrow: document.getElementById("modal-eyebrow"),
    mSub: document.getElementById("modal-sub"),
    mBody: document.getElementById("modal-body"),
    mHint: document.getElementById("modal-hint")
  };

  /* ---- Eventlogg ------------------------------------------------------- */
  function track(event, payload) {
    (window.__halebopEvents = window.__halebopEvents || []).push({ t: Date.now(), event: event, payload: payload || null });
    if (window.console && console.debug) console.debug("[halebop]", event, payload || "");
  }
  function find(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }

  /* ---- Journey-noder --------------------------------------------------- */
  function buildJourney() {
    var mapHTML = "", mobHTML = "";
    D.steps.forEach(function (s) {
      var L = LAYOUT[s.id];
      var chosen = isChosen(s.id);
      // Desktop-nod
      mapHTML +=
        '<div class="node' + (chosen ? ' is-chosen' : '') + '" data-step="' + s.id + '" style="left:' + L.x + '%;top:' + L.y + '%">' +
          '<button class="node__btn" aria-label="' + s.title + '">' +
            '<span class="node__num">' + s.n + '</span>' +
            planetHTML(s.planet, L.size) +
            '<span class="node__card">' +
              '<span class="ic ' + TINT[s.planet] + '">' + icon(iconFor(s.id)) + '</span>' +
              '<span><h3>' + s.title + '</h3><p>' + s.blurb + '</p></span>' +
              '<span class="arrow">→</span>' +
            '</span>' +
          '</button>' +
        '</div>';
      // Mobil-rad
      mobHTML +=
        '<button class="jm' + (chosen ? ' is-chosen' : '') + '" data-step="' + s.id + '">' +
          '<span class="jm__planet planet planet--' + s.planet + '"><span class="jm__num">' + s.n + '</span></span>' +
          '<span><h3>' + s.title + '</h3><p>' + s.blurb + '</p></span>' +
          '<span class="arrow">→</span>' +
        '</button>';
    });
    // behåll path + maskot, lägg till noder
    els.map.querySelectorAll(".node").forEach(function (n) { n.remove(); });
    els.map.insertAdjacentHTML("beforeend", mapHTML);
    els.journeyM.innerHTML = mobHTML;

    els.map.querySelectorAll(".node").forEach(function (n) {
      n.addEventListener("click", function () { openStep(n.getAttribute("data-step")); });
    });
    els.journeyM.querySelectorAll(".jm").forEach(function (n) {
      n.addEventListener("click", function () { openStep(n.getAttribute("data-step")); });
    });
  }

  function isChosen(stepId) {
    if (stepId === "plan") return !!state.plan;
    if (stepId === "phone") return !!state.phone;
    if (stepId === "streaming") return state.streaming.length > 0;
    return state.plan && state.phone;   // summary "klar" när grunderna är valda
  }

  /* ---- Modal ----------------------------------------------------------- */
  function openStep(stepId) {
    if (stepId === "summary") {
      els.summary.scrollIntoView({ behavior: "smooth", block: "center" });
      els.summary.classList.remove("flash"); void els.summary.offsetWidth; els.summary.classList.add("flash");
      track("open_summary");
      return;
    }
    var step = find(D.steps, stepId);
    els.mEyebrow.textContent = "Stopp " + step.n;
    els.mTitle.textContent = step.title;
    els.mSub.textContent = step.blurb;
    els.mHint.textContent = stepId === "streaming" ? "Välj så många du vill" : "Välj ett alternativ";
    renderChoices(stepId);
    els.modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
    track("open_step", { step: stepId });
  }
  function closeModal() {
    els.modal.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  function renderChoices(stepId) {
    var html = "";
    if (stepId === "plan") {
      html = '<div class="choices choices--4">' + D.plans.map(function (p) {
        return choiceCard({
          id: p.id, group: "plan", selected: state.plan === p.id, badge: p.badge,
          body:
            '<div class="choice__title">' + p.name + '</div>' +
            '<div class="choice__data">' + p.data + '</div>' +
            '<ul class="choice__perks">' + p.perks.map(function (x) { return '<li>' + x + '</li>'; }).join("") + '</ul>' +
            price(p.monthly, "per månad")
        });
      }).join("") + '</div>';
    } else if (stepId === "phone") {
      html = '<div class="choices choices--4">' + D.phones.map(function (p) {
        return choiceCard({
          id: p.id, group: "phone", selected: state.phone === p.id,
          body:
            '<span class="choice__planet planet planet--' + p.color + '"></span>' +
            '<div class="choice__brand">' + p.brand + '</div>' +
            '<div class="choice__title">' + p.name + '</div>' +
            '<div class="choice__tag">' + p.tagline + '</div>' +
            price(p.monthly, p.monthly === 0 ? "Ingen extra kostnad" : "i 24 mån")
        });
      }).join("") + '</div>';
    } else if (stepId === "streaming") {
      html = '<div class="choices choices--3">' + D.streaming.map(function (s) {
        return choiceCard({
          id: s.id, group: "streaming", selected: state.streaming.indexOf(s.id) !== -1, multi: true,
          body:
            '<span class="choice__planet planet planet--' + s.color + '"></span>' +
            '<div class="choice__brand">' + s.tier + '</div>' +
            '<div class="choice__title">' + s.name + '</div>' +
            price(s.monthly, "per månad")
        });
      }).join("") + '</div>';
    }
    els.mBody.innerHTML = html;
    els.mBody.querySelectorAll(".choice").forEach(function (c) {
      c.addEventListener("click", function () { onChoice(c.getAttribute("data-group"), c.getAttribute("data-id"), stepId); });
    });
  }

  function choiceCard(o) {
    return '<button class="choice' + (o.selected ? ' is-selected' : '') + '" data-group="' + o.group + '" data-id="' + o.id + '"' +
      (o.multi ? ' aria-pressed="' + o.selected + '"' : '') + '>' +
      (o.badge ? '<span class="choice__badge">' + o.badge + '</span>' : '') + o.body + '</button>';
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
    updateSummary(true);
    refreshJourneyChosen();
  }

  function refreshJourneyChosen() {
    D.steps.forEach(function (s) {
      var c = isChosen(s.id);
      var d = els.map.querySelector('.node[data-step="' + s.id + '"]');
      var m = els.journeyM.querySelector('.jm[data-step="' + s.id + '"]');
      if (d) d.classList.toggle("is-chosen", c);
      if (m) m.classList.toggle("is-chosen", c);
    });
  }

  /* ---- Sammanfattning -------------------------------------------------- */
  function lineItems() {
    var items = [];
    var pl = find(D.plans, state.plan);
    if (pl) items.push({ k: "Abonnemang", v: pl.data, sub: "Fria samtal & SMS", amount: pl.monthly, color: "green", ic: "sim" });
    var ph = find(D.phones, state.phone);
    if (ph) items.push({ k: "Mobil", v: ph.name, sub: ph.brand, amount: ph.monthly, color: "coral", ic: "phone" });
    state.streaming.forEach(function (sid) {
      var s = find(D.streaming, sid);
      if (s) items.push({ k: "Streaming", v: s.name, sub: s.tier, amount: s.monthly, color: "teal", ic: "play" });
    });
    return items;
  }

  function updateSummary(bump) {
    var items = lineItems();
    if (!items.length) {
      els.sumList.innerHTML = '<div class="sline sline--empty">Inget valt ännu — <button id="start-journey">starta din resa</button>.</div>';
      var sj = document.getElementById("start-journey");
      if (sj) sj.addEventListener("click", function () { openStep("plan"); });
    } else {
      els.sumList.innerHTML = items.map(function (i) {
        return '<div class="sline">' +
          '<span class="sline__ic ' + TINT[i.color] + '">' + icon(i.ic) + '</span>' +
          '<span class="sline__main"><span class="sline__k">' + i.k + '</span>' +
          '<span class="sline__v">' + i.v + '</span></span>' +
          '<span class="sline__price">' + (i.amount === 0 ? "0 kr" : kr(i.amount) + " kr/mån") + '</span>' +
        '</div>';
      }).join("");
    }
    var total = items.reduce(function (s, i) { return s + i.amount; }, 0);
    els.sumTotal.innerHTML = kr(total) + ' <small>kr</small>';
    els.cartBadge.textContent = items.length;
    if (bump) { els.sumTotal.classList.remove("bump"); void els.sumTotal.offsetWidth; els.sumTotal.classList.add("bump"); }
  }

  /* ---- Init ------------------------------------------------------------ */
  els.modal.querySelectorAll("[data-close]").forEach(function (b) { b.addEventListener("click", closeModal); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });
  document.getElementById("btn-checkout").addEventListener("click", function () {
    var btn = this;
    if (!state.plan) { openStep("plan"); return; }
    track("checkout", { state: state });
    btn.textContent = "Vi hänger med… 🚀"; btn.disabled = true;
  });
  document.getElementById("cart").addEventListener("click", function (e) {
    e.preventDefault(); els.summary.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  buildJourney();
  updateSummary(false);
  track("load", { ab: "universe-light" });
})();
