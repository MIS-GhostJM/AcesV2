(() => {
  'use strict';
  // AdSense placement tuned for viewable, higher-value impressions (policy-safe: no refresh, no overlay, every unit labelled).
  //
  // Right-hand skyscraper container ("rail"): Scripts, Checklist, Free-flow and the tool pages (/FDCalc, /FRprompt). It fills the free height of the page (the
  // space between the category bar and the footer), never scrolls, and holds ONE responsive unit with data-ad-format="auto" so AdSense can choose the best-paying
  // size that fits the column. There are no horizontal (in-feed / end-of-page) units between or after the script cards.
  // The rail asks for a NEW ad when the agent switches to a different category (a user-requested refresh, the only kind AdSense allows), but only if
  // the ad on screen was rendered more than `rail.renewMinSec` ago, and never on a timer. The old ad stays until the new one has arrived. A switch
  // while an earlier request is still unanswered sends nothing (it is dropped, not queued); only a "no fill" answer lets the next switch ask again.
  //
  // Narrow windows (< rail.minViewportW, where the rail does not fit): ONE floating bar, docked in the app grid between the content and the footer.
  // It follows the rail's rules exactly (requested once seen; renewed when the agent switches category / checklist / section, subject to the
  // renewMinSec floor; old ad kept until the new one arrives; switches while a request is unanswered are dropped).
  //
  // Round 15: (1) the first ad of a page loads sooner (sticky units need 250 ms on screen, not 1 s; a visible window is enough, focus is only needed for renewals);
  // (2) a box with no width waits instead of throwing "availableWidth=0"; (3) the container hugs the creative that arrived (fit); (4) a first request with no ad
  // does not kill the container for the visit: the next explicit user action brings it back and asks again (retryEmpty, capped); (5) more explicit user
  // actions can request a new ad (userAction: channel filter, search cleared, optionally Free-flow template / FR Prompt generate); (6) renewal floor 30 s.
  // Life of a slot:  planned (zero size)  ->  reserved (blank labelled box, set aside while it is still off screen, so nothing moves later)
  //                  ->  requested (only while >= viewRatio of the box is on screen for dwellMs, the window is focused and the agent is active)
  //                  ->  filled (box keeps its reserved height, so nothing moves when the creative arrives) or empty (box disappears).
  // So almost every impression that is counted was on screen when it loaded, instead of rendering 400px below the fold.
  const $ = s => document.querySelector(s);
  const cfg = (window.ACES_CONFIG || {}).ads || {}, S = cfg.slots || {};
  const G = Object.assign({ viewRatio: .5, dwellMs: 1000, dwellFixedMs: 250, tickMs: 200, lookaheadPx: 300, requireFocus: true, requireFocusFirst: false, idleSec: 90, maxRequestsPerMin: 6, giveUpMs: 12000 }, cfg.gate);
  const A = Object.assign({ channel: true, search: true, template: false, generate: false }, cfg.actions);          // explicit user actions that may request a new ad (see config.js)
  const RE = Object.assign({ max: 3, minGapSec: 15 }, cfg.retryEmpty);                                              // empty-container recovery
  const FIT = cfg.fit !== false;                                                                                      // container hugs the creative
  const E = Object.assign({ format: 'rectangle', reservePx: 280, boxMaxPx: 336 }, cfg.end);
  const L = Object.assign({ format: 'rectangle', reservePx: 280, boxMaxPx: 336 }, cfg.links);
  const R = Object.assign({ enabled: true, pages: ['scripts', 'checklist', 'notes', 'fdcalc', 'frprompt'], minViewportW: 1280, widthPx: 300, minHeightPx: 250, topGapPx: 12, bottomGapPx: 12, gapPx: 16, renewMinSec: 30 }, cfg.rail);
  const F = Object.assign({ enabled: true, pages: ['scripts', 'checklist', 'links', 'notes', 'fdcalc', 'frprompt'], sizes: [[728, 90], [320, 100]], minViewportH: 560 }, cfg.float);
  const IS_APP = !!$('.script-nav-container');          // the Scripts app (index.html); the tool pages (/FDCalc, /FRprompt) have no category bar
  const track = (n, p) => window.acesTrack?.(n, p), page = () => document.body.dataset.page || 'scripts';
  const pick = ([a, b]) => a + Math.floor(Math.random() * (b - a + 1));
  const CHROME = 44;                        // label + padding + border around a responsive box, in px

  // A slot is an empty labelled box until its request: the <ins> is created inside request(), right before adsbygoogle.push().
  // AdSense fills the FIRST unprocessed <ins> in the page, so having exactly one at push time guarantees the right box gets the ad.
  //   fill: true  = the skyscraper container: the box takes the height the page gives it (CSS: --adr-h) and the unit is a responsive "auto" unit inside it.
  const make = (cls, key, id, { fmt = 'auto', size, reserve = 0, boxMax, fill = false } = {}) => {
    const a = document.createElement('aside'); a.className = `ad-slot ${cls}`; a.dataset.slot = key; a.dataset.unit = id;
    if (size) a.dataset.size = size.join('x'); else a.dataset.fmt = fmt;
    if (fill) a.dataset.fill = '1';
    if (cls === 'ad-rail' || cls === 'ad-float') a.dataset.sticky = '1';                      // always on screen: a short dwell is enough before the request
    a.style.setProperty('--ad-reserve', (size ? size[1] : reserve) + 'px');
    if (boxMax) a.style.setProperty('--ad-box-max', boxMax + 'px');
    a.setAttribute('aria-label', 'Advertisement');
    a.innerHTML = '<span class="ad-label">Advertisement</span>' + (size ? '' : '<div class="ad-box"></div>');
    return a;
  };
  const insFor = slot => {
    const ins = document.createElement('ins'); ins.className = 'adsbygoogle';
    ins.setAttribute('data-ad-client', cfg.client); ins.setAttribute('data-ad-slot', slot.dataset.unit);
    if (slot.dataset.size) { const [w, h] = slot.dataset.size.split('x'); ins.style.cssText = `display:inline-block;width:${w}px;height:${h}px`; ins.dataset.fixed = '1'; }
    else if (slot.dataset.fill) {                                      // skyscraper container: the unit is as wide and as tall as the container, format auto. Not full-width-responsive: it must stay inside its column
      ins.style.cssText = 'display:block;width:100%;height:100%'; ins.setAttribute('data-ad-format', 'auto'); ins.setAttribute('data-full-width-responsive', 'false');
    } else {                                                            // rectangles stay rectangles (300x250 / 336x280): no stretching to a leaderboard
      ins.style.display = 'block'; ins.setAttribute('data-ad-format', slot.dataset.fmt);
      ins.setAttribute('data-full-width-responsive', slot.dataset.fmt === 'rectangle' ? 'false' : 'true');
    }
    return ins;
  };

  // ---- request gates ----
  const stamps = [];
  const rateOk = () => { const now = Date.now(); while (stamps.length && now - stamps[0] > 60000) stamps.shift(); return stamps.length < G.maxRequestsPerMin; };
  let lastInput = Date.now();
  ['pointerdown', 'pointermove', 'keydown', 'scroll', 'wheel', 'touchstart'].forEach(ev => addEventListener(ev, () => { lastInput = Date.now(); }, { passive: true, capture: true }));
  // visible tab, focused window (agents work split-screen: an unfocused tool is not being looked at) and recent activity
  // first = the FIRST ad of a page view (page-load fill): a visible tab is enough. Renewals also need the window focused.
  const engaged = first => {
    if (document.visibilityState !== 'visible' || Date.now() - lastInput >= G.idleSec * 1000) return false;
    return !(first ? G.requireFocusFirst : G.requireFocus) || document.hasFocus();
  };

  const inView = new Map();                  // slot -> time it first had >= viewRatio on screen
  let near, view, viewV, ticker;                // viewV: same job as `view` for units outside .main-page (the floating bar), measured against the window
  function setup() {
    const root = $('.main-page');
    near = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { near.unobserve(e.target); reserve(e.target); } }), { root, rootMargin: `${G.lookaheadPx}px 0px` });
    const seen = es => es.forEach(e => {
      if (e.isIntersecting && e.intersectionRatio >= G.viewRatio) { if (!inView.has(e.target)) inView.set(e.target, Date.now()); } else inView.delete(e.target);
    });
    view = new IntersectionObserver(seen, { root, threshold: [0, .25, G.viewRatio, .75, 1] });
    viewV = new IntersectionObserver(seen, { root: null, threshold: [0, .25, G.viewRatio, .75, 1] });
    ticker = setInterval(tick, G.tickMs);
  }
  const watch = slot => {
    if (!near) setup();
    near.observe(slot);
    // A unit inserted inside the look-ahead zone (e.g. the first one, in the opening screen) sets its box aside NOW, in the same frame it is
    // inserted. Waiting for the observer would paint the cards first and push them down a frame later, which is a layout shift.
    const m = $('.main-page').getBoundingClientRect(), r = slot.getBoundingClientRect();
    if (r.top < m.bottom + G.lookaheadPx && r.bottom > m.top - G.lookaheadPx) { near.unobserve(slot); reserve(slot); }
  };
  const forget = slot => { near?.unobserve(slot); view?.unobserve(slot); viewV?.unobserve(slot); inView.delete(slot); slot._fitRO?.disconnect(); };

  function reserve(slot) {                   // set the box aside while it is still off screen (or the moment it appears), then wait for it to be seen
    if (slot.dataset.requested || !slot.isConnected) return;
    slot.classList.add('is-reserved');
    slot.dispatchEvent(new CustomEvent('ad:reserved'));
    (slot.dataset.root === 'viewport' ? viewV : view).observe(slot);
  }
  function tick() {                          // one request per tick at most, never a burst
    if (!inView.size || !rateOk()) return;
    const now = Date.now();
    for (const [slot, since] of inView) {
      if (!slot.isConnected) { inView.delete(slot); continue; }
      if (!engaged(!slot.classList.contains('is-staged'))) continue;                    // first ad of a page view: visible tab is enough; renewals: focused window too
      if (now - since < (slot.dataset.sticky ? G.dwellFixedMs : G.dwellMs)) continue;     // the sticky rail / bar is on screen the whole time: 250 ms, not 1 s
      // A box with no width makes AdSense throw "No slot size for availableWidth=0" and the container ends up empty for nothing. Wait until it has one.
      if ((slot.querySelector('.ad-box') || slot).getBoundingClientRect().width < 40) continue;
      const r = slot.getBoundingClientRect(), root = slot.dataset.root === 'viewport' ? { top: 0, bottom: innerHeight } : $('.main-page').getBoundingClientRect();
      const shown = Math.max(0, Math.min(r.bottom, root.bottom) - Math.max(r.top, root.top)) / (r.height || 1);
      forget(slot); request(slot, Math.round(shown * 100));
      return;
    }
  }

  function request(slot, shownPct) {
    if (slot.dataset.requested) return;
    slot.dataset.requested = '1'; slot.dataset.reqAt = Date.now(); stamps.push(Date.now());
    const ins = insFor(slot); (slot.querySelector('.ad-box') || slot).append(ins);
    const settle = s => {
      slot.classList.remove('is-empty', 'is-filled'); slot.classList.add(s === 'filled' ? 'is-filled' : 'is-empty');
      track('ads.slot.' + s, { slot: slot.dataset.slot, page: page() });
      slot.dispatchEvent(new CustomEvent('ad:status', { detail: s }));
      if (s === 'filled') { watchViewable(slot); fit(slot); }           // the box keeps its reserved height until the creative size is known, then hugs it (fit)
    };
    new MutationObserver((_, mo) => { const s = ins.getAttribute('data-ad-status'); if (s === 'filled' || s === 'unfilled') { mo.disconnect(); clearTimeout(slot._giveUp); settle(s); } })
      .observe(ins, { attributes: true, attributeFilter: ['data-ad-status'] });
    slot._giveUp = setTimeout(() => { if (!slot.classList.contains('is-filled')) settle('unfilled'); }, G.giveUpMs);   // blocked or never answered: do not leave a blank box
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); track('ads.slot.requested', { slot: slot.dataset.slot, page: page(), value: shownPct }); }
    catch { clearTimeout(slot._giveUp); settle('unfilled'); }
  }
  // Container fit: a responsive unit decides its own creative size (300x250, 300x600, 250x250 ...). Once it has arrived the container shrinks / grows to exactly
  // that size, so there is no empty frame around it. Only for containers where nothing beside or below can move: the rail (its own column) and the Checklist end unit
  // (last thing on the page). Re-measured a few times because a responsive creative may resize itself after load.
  function fit(slot) {
    if (!FIT || !(slot.dataset.fill || slot.classList.contains('ad-end'))) return;
    const ins = slot.querySelector('ins.adsbygoogle'); if (!ins) return;
    const measure = () => {
      if (!slot.isConnected) return;
      const fr = ins.querySelector('iframe'); if (!fr) return;
      const b = fr.getBoundingClientRect(), w = Math.round(b.width || +fr.getAttribute('width') || 0), h = Math.round(b.height || +fr.getAttribute('height') || 0);
      if (w < 50 || h < 30 || (+slot.dataset.fitW === w && +slot.dataset.fitH === h)) return;
      slot.dataset.fitW = w; slot.dataset.fitH = h; slot.dataset.fit = '1';
      slot.style.setProperty('--ad-fit-w', w + 'px'); slot.style.setProperty('--ad-fit-h', h + 'px');
      track('ads.slot.fit', { slot: slot.dataset.slot, page: page(), value: h });
      slot.dispatchEvent(new CustomEvent('ad:fit'));
    };
    requestAnimationFrame(() => requestAnimationFrame(measure));
    [300, 1000, 2500].forEach(t => setTimeout(measure, t));
    slot._fitRO?.disconnect(); slot._fitRO = new ResizeObserver(measure); slot._fitRO.observe(ins);
  }
  function watchViewable(slot) {             // own "viewable" proxy: >=50% visible for 1 s (kept as an event so you can compare it with AdSense's Active View)
    let t; const v = new IntersectionObserver(([e]) => { clearTimeout(t); if (e.isIntersecting) t = setTimeout(() => { track('ads.slot.viewable', { slot: slot.dataset.slot, page: page() }); v.disconnect(); }, 1000); }, { threshold: .5 });
    v.observe(slot);
  }

  // ---- Links: one unit at the bottom of the page, box reserved the moment the tab opens so the tiles never jump ----
  let linksDone = false;
  function linksFeed() {
    const pg = document.getElementById('links-page');
    if (linksDone || !S.links || !pg) return;
    linksDone = true;
    const el = make('ad-links', 'links', S.links, { fmt: L.format, reserve: L.reservePx, boxMax: L.boxMaxPx }); pg.append(el); watch(el);
  }

  // ---- Scripts: the rail is the only unit. A different category = a user-requested refresh of the rail ----
  const activeTab = () => $('.script-nav-container .nav-btn.active')?.dataset.tab || null;
  let lastTab = null;
  function viewChanged() {                                           // runs after the clicked category is on screen
    const t = activeTab();
    if (t === lastTab) return;                                       // same category clicked again: no new request
    lastTab = t; renewRail('scripts'); renewFloat();
  }


  // ---- Sticky rail (desktop): ONE fixed-size unit in its own column that stays in view while the agent works through scripts / the checklist ----
  // Why a column and not position:fixed: Google's sticky-ad conditions (vertical sticky must never overlap or underlap content, stay clear of
  // navigation and scrollbars, keep its label visible) are met by construction: the unit sits in a grid column of the content, `position:sticky`
  // only keeps it inside that column while the page scrolls, and it ends where the content ends.
  // Lifecycle: mounted synchronously (before the first paint of the page, so nothing reflows), size chosen ONCE from the free height, requested
  // when seen (same gate as every other unit), renewed only after a user action (new category / checklist) and at most every renewMinSec.
  // `canvas` = the grid that gets the extra column, `bar` = the sticky bar above it (its height is subtracted), `flow` = the page does not scroll (Free-flow):
  // the column simply spans the height of the text area instead of sticking.
  const RAIL = {
    scripts:   { canvas: '.script-canvas',                bar: '.script-nav-container' },
    checklist: { canvas: '.checklist-canvas',             bar: '.check-list-nav-container' },
    notes:     { canvas: '#notes-page .freeflow-body',    bar: null, flow: true },
    fdcalc:    { canvas: '.tool-canvas',                  bar: null },
    frprompt:  { canvas: '.tool-canvas',                  bar: null }
  };
  const rails = {};
  const RAIL_CHROME = 44;                   // label + padding + border around the unit inside the container, in px
  // Unit ID per page: Free-flow may have its own (slots.notesSide), the tool pages may have their own (slots.tools); everything else uses slots.rail. All fall back to `banner`.
  const railId = pg => (pg === 'notes' && S.notesSide) || ((pg === 'fdcalc' || pg === 'frprompt') && S.tools) || S.rail || S.banner;

  // Container height = the free height of the page: from the top of the rail (just under the category bar) down to the footer, less the gaps.
  // Re-measured whenever the window, the bar or the page changes; the unit inside is NOT re-requested, the box just follows the space (the creative stays inside it).
  function railLayout(r) {
    const main = $('.main-page'), cv = r.canvas;
    if (!main || !main.clientHeight || !cv.offsetParent) return;      // page hidden: nothing to measure yet (re-run when it is shown)
    const cs = getComputedStyle(cv), pt = parseFloat(cs.paddingTop) || 0, pb = parseFloat(cs.paddingBottom) || 0;
    cv.style.setProperty('--adr-col', R.widthPx + 14 + 'px');
    cv.style.setProperty('--adr-gap', R.gapPx + 'px');
    cv.style.setProperty('--adr-gap-top', R.topGapPx + 'px');
    let free;
    if (r.flow) free = cv.clientHeight - pt - pb;                        // Free-flow: the box spans the text area
    else {
      // top of the canvas measured from the top of the scroll area at scrollTop 0, so the rail sits at the same place whether it is stuck or not (no jump when scrolling starts)
      const top = cv.getBoundingClientRect().top - main.getBoundingClientRect().top + main.scrollTop + pt + R.topGapPx;
      cv.style.setProperty('--adr-top', Math.round(top) + 'px');
      free = main.clientHeight - top - R.bottomGapPx;
    }
    r.free = Math.floor(free); cv.style.setProperty('--adr-h', r.free + 'px');
    r.fits = r.free >= R.minHeightPx + RAIL_CHROME;                      // too little room for even a 300x250: hand the column back
    r.sync?.();
  }
  function mountRail(page) {
    const id = railId(page), spec = RAIL[page];
    if (!R.enabled || !id || !spec || rails[page] || !(R.pages || []).includes(page) || window.ACES_ADS_BLOCKED || innerWidth < R.minViewportW) return;
    const canvas = $(spec.canvas), bar = spec.bar ? $(spec.bar) : null;
    if (!canvas || (spec.bar && !bar) || !canvas.firstElementChild) return;
    const r = { page, canvas, bar, id, host: canvas, cls: 'ad-rail', key: 'rail', fill: true, flow: !!spec.flow, free: 0, fits: false, release: () => canvas.classList.remove('has-rail'), el: null, next: null, shownAt: 0, dead: false };
    const mq = matchMedia(`(min-width:${R.minViewportW}px)`);            // a window dragged narrower gives the column back (the box is hidden, never swapped)
    r.sync = () => canvas.classList.toggle('has-rail', mq.matches && !r.dead && !r.collapsed && r.fits);
    r.layout = () => railLayout(r);
    railLayout(r); if (!r.fits) return;                                  // no room: do not mount (it can mount later, see syncFloat)
    rails[page] = r;
    mq.addEventListener('change', r.sync);
    const ro = new ResizeObserver(r.layout); ro.observe($('.main-page')); if (bar) ro.observe(bar); if (r.flow) ro.observe(canvas);
    attachRail(r, make('ad-rail', 'rail', id, { fill: true }));
    track('ads.rail.mounted', { page, value: r.free });
  }
  function attachRail(r, el) {                                       // the FIRST unit of a page (replacements go through stageRail)
    r.el = el; r.host.append(el); r.sync?.();
    if (!near) setup();
    reserve(el);                                                     // set the box aside this frame; AdSense is asked only once it has been seen (gate)
    el.addEventListener('ad:status', e => {
      if (e.detail === 'filled') { r.shownAt = Date.now(); r.tries = 0; }   // "rendered" = the moment the creative arrived
      else collapseRail(r);                                          // this request found no ad (or it is blocked): give the column back NOW, but keep the right to ask again (retryEmpty)
    });
    requestAnimationFrame(() => { if (el.isConnected && !el.offsetHeight && !r.hidden?.()) unmountRail(r); });   // a blocker's cosmetic filter hid the box
  }
  function unmountRail(r) {
    r.dead = true; cancelNext(r, 'unmounted');
    if (r.el) { forget(r.el); r.el.remove(); }
    r.release(); track('ads.rail.unmounted', { page: r.page });
  }
  // A first request with no ad: the container is handed back (no blank column) but NOT given up. The next explicit user action (userAction / renewRail / renewFloat)
  // brings it back and asks again: at most RE.max retries per page view, RE.minGapSec apart, never on a timer. After that, or if a blocker is detected, it is gone for the visit.
  function collapseRail(r) {
    if (r.dead) return;
    r.tries = (r.tries || 0) + 1; r.emptyAt = Date.now();
    if (r.tries > RE.max) { unmountRail(r); return; }
    r.collapsed = true;
    if (r.el) { forget(r.el); r.el.remove(); r.el = null; }
    r.release(); r.sync?.();
    track('ads.rail.collapsed', { page: r.page, value: r.tries });
  }
  function retryEmpty(r) {
    if (!r || r.dead || !r.collapsed || window.ACES_ADS_BLOCKED) return;
    if (Date.now() - r.emptyAt < RE.minGapSec * 1000) { track('ads.rail.retry_skipped', { page: r.page, label: 'gap' }); return; }
    r.collapsed = false;
    if (r === fl) { if (!floatAllowed()) { r.collapsed = true; return; } mountFloat(); if (!fl.el) { r.collapsed = true; return; } }
    else {
      railLayout(r);
      if (!r.fits) { r.collapsed = true; return; }                                   // still no room: stay collapsed (does not count as a try)
      attachRail(r, make('ad-rail', 'rail', r.id, { fill: true }));
    }
    track('ads.rail.retry_empty', { page: r.page, value: r.tries });
  }

  // Renewal = a NEW unit is staged on top of the current one (same grid cell, same size, invisible until AdSense fills it). The current ad stays on
  // screen the whole time. Only when the new creative has arrived does it replace the old one; if nothing comes back, the old ad simply stays.
  function cancelNext(r, why) {                                      // used when the rail is taken away (narrow window, blocked): drop a staged unit that has NOT been sent yet
    const n = r.next; if (!n) return;
    r.next = null; forget(n); n.remove();
    track('ads.rail.cancelled', { page: r.page, label: why });
  }
  function stageRail(r) {
    const size = r.fill ? null : (r.pickSize ? r.pickSize() : r.size); if (!r.fill && !size) return;   // the floating bar re-picks its size for the window it is in now; the container takes whatever height the page gives it
    if (size) r.size = size;
    const fresh = make(r.cls, r.key, r.id, r.fill ? { fill: true } : { size });
    if (r.viewport) fresh.dataset.root = 'viewport';
    fresh.classList.add('is-staged'); r.next = fresh;
    fresh.addEventListener('ad:status', e => {
      if (r.next !== fresh) return;                                  // cancelled or unmounted in the meantime
      r.next = null;
      if (e.detail !== 'filled') {                                   // no fill / blocked: keep the ad that is already there; the NEXT switch may ask again (the old ad is already past the floor)
        forget(fresh); fresh.remove(); track('ads.rail.renew_unfilled', { page: r.page }); return;
      }
      const old = r.el; r.el = fresh; r.shownAt = Date.now();
      fresh.classList.remove('is-staged');
      setTimeout(() => { if (old) { forget(old); old.remove(); } }, 400);   // short overlap so the column is never blank while the new creative paints
    });
    r.host.append(fresh);                                            // after the current unit in the DOM = painted on top of it
    reserve(fresh);                                                  // AdSense is asked only once it has been seen (gate), like every other unit
    track('ads.rail.renew', { page: r.page });
  }
  function renewRail(page) { const r = rails[page]; if (!r) return; r.collapsed ? retryEmpty(r) : renewUnit(r); }   // called after a user switched to a DIFFERENT category / checklist
  function renewUnit(r) {
    if (r.dead || !r.el) return; const page = r.page;
    // A request that has not been answered yet (waiting for its turn, or sent and not filled / unfilled yet) is never cancelled or replaced: the new
    // switch sends NOTHING. Only an answer frees the slot: "no fill" lets the next switch ask again, "filled" starts the renewMinSec clock.
    if (r.next || (r.el.dataset.requested && !r.shownAt)) { track('ads.rail.renew_skipped', { page, label: 'pending' }); return; }
    if (!r.el.dataset.requested) return;                             // first unit not requested yet: it will be, for this very view
    if (Date.now() - r.shownAt < R.renewMinSec * 1000) { track('ads.rail.renew_skipped', { page, label: 'min_age' }); return; }   // current ad rendered < renewMinSec ago: keep it
    stageRail(r);
  }

  // ---- Floating bar (windows narrower than rail.minViewportW, where the sidebar rail does not fit) ----
  // Docked, not overlaid: the bar is its own row of the app grid, between the content and the footer. It never moves with the scroll, and because the
  // content area simply ends above it, the last script card always stops above the bar and nothing is ever covered or underlapped (Google's sticky-ad
  // condition). No bar = no row = no space taken. Same lifecycle as the rail: requested once seen, renewed by the same rules (renewUnit).
  const fl = { page: 'float', cls: 'ad-float', key: 'float', viewport: true, host: null, el: null, next: null, shownAt: 0, dead: false, size: null, id: null };
  const floatId = () => S.float || S.rail || S.banner;
  const floatAllowed = () => F.enabled && !fl.dead && !window.ACES_ADS_BLOCKED && innerWidth < R.minViewportW && (F.pages || []).includes(page());
  fl.pickSize = () => { const w = $('.main-page').clientWidth; return innerHeight < F.minViewportH ? null : (F.sizes || []).find(s => s[0] + 24 <= w) || null; };
  fl.hidden = () => document.body.classList.contains('search-active') || !!fl.host?.classList.contains('no-float');
  fl.release = () => floatVars();
  function floatVars() {                                             // toasts sit above the bar, not on it
    const h = fl.el && !fl.dead && fl.el.offsetHeight ? fl.el.offsetHeight + 6 : 0;
    document.documentElement.style.setProperty('--float-h', h + 'px');
  }
  function mountFloat() {
    const id = floatId(), host = $('.app-body');
    if (!id || !host || fl.el || fl.dead || fl.collapsed) return;
    const size = fl.pickSize(); if (!size) return;
    fl.host = host; fl.id = id; fl.size = size;
    const el = make('ad-float', 'float', id, { size }); el.dataset.root = 'viewport';
    attachRail(fl, el);
    el.addEventListener('ad:status', () => requestAnimationFrame(floatVars));
    new ResizeObserver(floatVars).observe(el);
    track('ads.rail.mounted', { page: 'float', value: size[1] });
  }
  function syncFloat() {                                             // after a page change, a resize or a width-breakpoint change
    const on = floatAllowed();
    if (RAIL[page()]) { mountRail(page()); rails[page()]?.layout(); }   // a window enlarged past the breakpoint (or tall enough again) gets its column
    if (on && !fl.el && !fl.collapsed) mountFloat();
    ($('.app-body')).classList.toggle('no-float', !on);               // hides the bar and any waiting unit (CSS)
    if (fl.el) fl.el.classList.toggle('is-oversize', +fl.el.dataset.size.split('x')[0] + 24 > $('.main-page').clientWidth);   // never clip a creative
    floatVars();
  }
  const renewFloat = () => { if (!floatAllowed()) return; if (fl.collapsed) retryEmpty(fl); else if (fl.el) renewUnit(fl); };

  // ---- Explicit user actions that replace the content beside the ad = a user-requested refresh (the only kind AdSense allows) ----
  // Never called from a timer, from typing, from copy clicks, from focus / visibility changes or from scrolling. The gates (seen, focused, active, renewMinSec,
  // requests per minute) still apply to the request that follows: userAction only STAGES the unit, it does not send anything by itself.
  function userAction(kind) {
    if (!cfg.enabled || window.ACES_CONSENT?.ads === false) return;
    if (kind in A && !A[kind]) return;
    if ((kind === 'channel' || kind === 'search') && page() !== 'scripts') return;      // those two only change the Scripts list
    renewRail(page()); renewFloat();
    track('ads.action', { label: kind, page: page() });
  }

  let lastList = null;
  function showFor() {
    const p = page();
    document.querySelectorAll('.ad-end').forEach(s => { s.hidden = !(cfg.endPages || []).includes(p); });
    if (p === 'links') linksFeed();
    if (RAIL[p]) requestAnimationFrame(() => {                       // first visit (also after a restore that opened another page), or back again: mount, or just re-measure
      mountRail(p); rails[p]?.layout(); if (rails[p]?.collapsed) retryEmpty(rails[p]);
      if (p === 'checklist') lastList = $('.listnav-btn.active')?.id || null;
    });
    requestAnimationFrame(() => { syncFloat(); renewFloat(); });      // a different section = new content = a user-requested renewal of the floating bar
  }

  window.AcesAds = {
    action: userAction,                                                // other scripts may report an explicit user action: AcesAds.action('template')
    init() {
      if (!cfg.enabled || window.ACES_CONSENT?.ads === false) return;
      if (S.end && IS_APP) { const end = make('ad-end', 'end', S.end, { fmt: E.format, reserve: E.reservePx, boxMax: E.boxMaxPx }); $('.main-page').append(end); watch(end); }
      showFor();
      document.addEventListener('aces:page', showFor);
      $('.script-nav-container')?.addEventListener('click', e => {     // runs after the tab's own handlers, so the new category is already active
        if (!e.target.closest('.nav-btn')) return;
        requestAnimationFrame(() => requestAnimationFrame(viewChanged));
      });
      $('.check-list-nav-container')?.addEventListener('click', e => {   // a different checklist = new content = a user-requested renewal of the rail
        if (!e.target.closest('button')) return;
        requestAnimationFrame(() => { const a = $('.listnav-btn.active')?.id || null; if (a !== lastList) { lastList = a; renewRail('checklist'); renewFloat(); } });
      });
      let raf = 0; addEventListener('resize', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(syncFloat); });
      matchMedia(`(min-width:${R.minViewportW}px)`).addEventListener('change', syncFloat);
      $('#channel-selection')?.addEventListener('change', () => requestAnimationFrame(() => userAction('channel')));            // All / Chat / Voice: the list is replaced
      let wasSearching = document.body.classList.contains('search-active');                                                      // search cleared: the full list comes back
      new MutationObserver(() => { const on = document.body.classList.contains('search-active'); if (wasSearching && !on) requestAnimationFrame(() => userAction('search')); wasSearching = on; })
        .observe(document.body, { attributes: true, attributeFilter: ['class'] });
      $('#notes-page')?.addEventListener('change', e => { if (e.target.id === 'ff-tpl' && e.target.value) userAction('template'); }, true);   // Free-flow: Insert template (off by default). Capture phase: freeflow.js resets the select before the event bubbles
      document.getElementById('promptForm')?.addEventListener('submit', () => userAction('generate'));                           // /FRprompt: Generate (off by default)
      lastTab = activeTab();
      if (page() === 'scripts' || !IS_APP) mountRail(page());          // synchronously, so the column exists before the content is first painted
    }
  };
  // The tool pages (/FDCalc, /FRprompt) have no script renderer to call init() for them: <body data-ads-auto> starts it as soon as the page is parsed.
  if (document.body.hasAttribute('data-ads-auto')) window.AcesAds.init();
})();
