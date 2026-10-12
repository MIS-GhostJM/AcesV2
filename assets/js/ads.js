(() => {
  'use strict';
  // AdSense placement tuned for viewable, higher-value impressions (policy-safe: no refresh, no overlay, every unit labelled).
  //
  // Scripts page: ONE unit, the sticky right-hand rail. There are no horizontal (in-feed / end-of-page) units between or after the script cards.
  // The rail asks for a NEW ad when the agent switches to a different category (a user-requested refresh, the only kind AdSense allows), but only if
  // the ad on screen was rendered more than `rail.renewMinSec` ago, and never on a timer. The old ad stays until the new one has arrived. A switch
  // while an earlier request is still unanswered sends nothing (it is dropped, not queued); only a "no fill" answer lets the next switch ask again.
  //
  // Life of a slot:  planned (zero size)  ->  reserved (blank labelled box, set aside while it is still off screen, so nothing moves later)
  //                  ->  requested (only while >= viewRatio of the box is on screen for dwellMs, the window is focused and the agent is active)
  //                  ->  filled (box keeps its reserved height, so nothing moves when the creative arrives) or empty (box disappears).
  // So almost every impression that is counted was on screen when it loaded, instead of rendering 400px below the fold.
  const cfg = (window.ACES_CONFIG || {}).ads || {}, S = cfg.slots || {};
  const G = Object.assign({ viewRatio: .5, dwellMs: 1000, lookaheadPx: 300, requireFocus: true, idleSec: 90, maxRequestsPerMin: 6, giveUpMs: 8000 }, cfg.gate);
  const E = Object.assign({ format: 'rectangle', reservePx: 280, boxMaxPx: 336 }, cfg.end);
  const L = Object.assign({ format: 'rectangle', reservePx: 280, boxMaxPx: 336 }, cfg.links);
  const N = Object.assign({ bar: true, barSizes: [[728, 90], [320, 100]], side: true, sidePct: 20, sideMinPageWidth: 720, sideSizes: [[300, 600], [160, 600], [300, 250], [250, 250]] }, cfg.notes);
  const R = Object.assign({ enabled: true, pages: ['scripts', 'checklist'], minViewportW: 1280, sizes: [[300, 600], [300, 250]], topGapPx: 12, gapPx: 16, renewMinSec: 60 }, cfg.rail);
  const track = (n, p) => window.acesTrack?.(n, p), page = () => document.body.dataset.page || 'scripts';
  const $ = s => document.querySelector(s);
  const pick = ([a, b]) => a + Math.floor(Math.random() * (b - a + 1));
  const CHROME = 44;                        // label + padding + border around a responsive box, in px

  // A slot is an empty labelled box until its request: the <ins> is created inside request(), right before adsbygoogle.push().
  // AdSense fills the FIRST unprocessed <ins> in the page, so having exactly one at push time guarantees the right box gets the ad.
  const make = (cls, key, id, { fmt = 'auto', size, reserve = 0, boxMax } = {}) => {
    const a = document.createElement('aside'); a.className = `ad-slot ${cls}`; a.dataset.slot = key; a.dataset.unit = id;
    if (size) a.dataset.size = size.join('x'); else a.dataset.fmt = fmt;
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
    else {                                                            // rectangles stay rectangles (300x250 / 336x280): no stretching to a leaderboard
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
  const engaged = () => document.visibilityState === 'visible' && (!G.requireFocus || document.hasFocus()) && Date.now() - lastInput < G.idleSec * 1000;

  const inView = new Map();                  // slot -> time it first had >= viewRatio on screen
  let near, view, ticker;
  function setup() {
    const root = $('.main-page');
    near = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { near.unobserve(e.target); reserve(e.target); } }), { root, rootMargin: `${G.lookaheadPx}px 0px` });
    view = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting && e.intersectionRatio >= G.viewRatio) { if (!inView.has(e.target)) inView.set(e.target, Date.now()); } else inView.delete(e.target);
    }), { root, threshold: [0, .25, G.viewRatio, .75, 1] });
    ticker = setInterval(tick, 400);
  }
  const watch = slot => {
    if (!near) setup();
    near.observe(slot);
    // A unit inserted inside the look-ahead zone (e.g. the first one, in the opening screen) sets its box aside NOW, in the same frame it is
    // inserted. Waiting for the observer would paint the cards first and push them down a frame later, which is a layout shift.
    const m = $('.main-page').getBoundingClientRect(), r = slot.getBoundingClientRect();
    if (r.top < m.bottom + G.lookaheadPx && r.bottom > m.top - G.lookaheadPx) { near.unobserve(slot); reserve(slot); }
  };
  const forget = slot => { near?.unobserve(slot); view?.unobserve(slot); inView.delete(slot); };

  function reserve(slot) {                   // set the box aside while it is still off screen (or the moment it appears), then wait for it to be seen
    if (slot.dataset.requested || !slot.isConnected) return;
    slot.classList.add('is-reserved');
    slot.dispatchEvent(new CustomEvent('ad:reserved'));
    view.observe(slot);
  }
  function tick() {                          // one request per tick at most, never a burst
    if (!inView.size || !engaged() || !rateOk()) return;
    const now = Date.now();
    for (const [slot, since] of inView) {
      if (!slot.isConnected) { inView.delete(slot); continue; }
      if (now - since < G.dwellMs) continue;
      const r = slot.getBoundingClientRect(), root = $('.main-page').getBoundingClientRect();
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
      if (s === 'filled') watchViewable(slot);                          // the box keeps its reserved height: nothing moves when the creative arrives
    };
    new MutationObserver((_, mo) => { const s = ins.getAttribute('data-ad-status'); if (s === 'filled' || s === 'unfilled') { mo.disconnect(); clearTimeout(slot._giveUp); settle(s); } })
      .observe(ins, { attributes: true, attributeFilter: ['data-ad-status'] });
    slot._giveUp = setTimeout(() => { if (!slot.classList.contains('is-filled')) settle('unfilled'); }, G.giveUpMs);   // blocked or never answered: do not leave a blank box
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); track('ads.slot.requested', { slot: slot.dataset.slot, page: page(), value: shownPct }); }
    catch { clearTimeout(slot._giveUp); settle('unfilled'); }
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
    lastTab = t; renewRail('scripts');
  }


  // ---- Sticky rail (desktop): ONE fixed-size unit in its own column that stays in view while the agent works through scripts / the checklist ----
  // Why a column and not position:fixed: Google's sticky-ad conditions (vertical sticky must never overlap or underlap content, stay clear of
  // navigation and scrollbars, keep its label visible) are met by construction: the unit sits in a grid column of the content, `position:sticky`
  // only keeps it inside that column while the page scrolls, and it ends where the content ends.
  // Lifecycle: mounted synchronously (before the first paint of the page, so nothing reflows), size chosen ONCE from the free height, requested
  // when seen (same gate as every other unit), renewed only after a user action (new category / checklist) and at most every renewMinSec.
  const RAIL = { scripts: { canvas: '.script-canvas', bar: '.script-nav-container' }, checklist: { canvas: '.checklist-canvas', bar: '.check-list-nav-container' } };
  const rails = {};
  const RAIL_CHROME = 44;                   // label + padding + border around a fixed-size unit, in px
  const railId = () => S.rail || S.banner;
  function railSize(bar) {
    const free = $('.main-page').clientHeight - bar.offsetHeight - R.topGapPx * 2 - RAIL_CHROME;
    return (R.sizes || []).find(s => s[1] <= free) || null;
  }
  function mountRail(page) {
    const id = railId(), spec = RAIL[page];
    if (!R.enabled || !id || !spec || rails[page] || !(R.pages || []).includes(page) || window.ACES_ADS_BLOCKED || innerWidth < R.minViewportW) return;
    const canvas = $(spec.canvas), bar = $(spec.bar);
    if (!canvas || !bar || !canvas.firstElementChild) return;
    const size = railSize(bar); if (!size) return;
    const r = rails[page] = { page, canvas, bar, size, id, el: null, next: null, shownAt: 0, dead: false };
    canvas.style.setProperty('--rail-col', size[0] + 14 + 'px');
    canvas.style.setProperty('--rail-gap', R.gapPx + 'px');
    const top = () => canvas.style.setProperty('--rail-top', Math.round(bar.getBoundingClientRect().height) + R.topGapPx + 'px');
    top(); new ResizeObserver(top).observe(bar);
    const mq = matchMedia(`(min-width:${R.minViewportW}px)`);        // a window dragged narrower gives the column back (the box is hidden, never swapped)
    const sync = () => canvas.classList.toggle('has-rail', mq.matches && !r.dead);
    mq.addEventListener('change', sync);
    r.sync = sync;
    attachRail(r, make('ad-rail', 'rail', id, { size }));
    track('ads.rail.mounted', { page, value: size[1] });
  }
  function attachRail(r, el) {                                       // the FIRST unit of a page (replacements go through stageRail)
    r.el = el; r.canvas.append(el); r.sync();
    if (!near) setup();
    reserve(el);                                                     // set the box aside this frame; AdSense is asked only once it has been seen (gate)
    el.addEventListener('ad:status', e => {
      if (e.detail === 'filled') r.shownAt = Date.now();             // "rendered" = the moment the creative arrived
      else unmountRail(r);                                           // the first request found no ad (or it is blocked): give the column back, once, early
    });
    requestAnimationFrame(() => { if (el.isConnected && !el.offsetHeight) unmountRail(r); });   // a blocker's cosmetic filter hid the box
  }
  function unmountRail(r) {
    r.dead = true; cancelNext(r, 'unmounted');
    if (r.el) { forget(r.el); r.el.remove(); }
    r.canvas.classList.remove('has-rail'); track('ads.rail.unmounted', { page: r.page });
  }

  // Renewal = a NEW unit is staged on top of the current one (same grid cell, same size, invisible until AdSense fills it). The current ad stays on
  // screen the whole time. Only when the new creative has arrived does it replace the old one; if nothing comes back, the old ad simply stays.
  function cancelNext(r, why) {                                      // used when the rail is taken away (narrow window, blocked): drop a staged unit that has NOT been sent yet
    const n = r.next; if (!n) return;
    r.next = null; forget(n); n.remove();
    track('ads.rail.cancelled', { page: r.page, label: why });
  }
  function stageRail(r) {
    const fresh = make('ad-rail', 'rail', r.id, { size: r.size });
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
    r.canvas.append(fresh);                                          // after the current unit in the DOM = painted on top of it
    reserve(fresh);                                                  // AdSense is asked only once it has been seen (gate), like every other unit
    track('ads.rail.renew', { page: r.page });
  }
  function renewRail(page) {                                         // called after a user switched to a DIFFERENT category / checklist
    const r = rails[page]; if (!r || r.dead || !r.el) return;
    // A request that has not been answered yet (waiting for its turn, or sent and not filled / unfilled yet) is never cancelled or replaced: the new
    // switch sends NOTHING. Only an answer frees the slot: "no fill" lets the next switch ask again, "filled" starts the renewMinSec clock.
    if (r.next || (r.el.dataset.requested && !r.shownAt)) { track('ads.rail.renew_skipped', { page, label: 'pending' }); return; }
    if (!r.el.dataset.requested) return;                             // first unit not requested yet: it will be, for this very view
    if (Date.now() - r.shownAt < R.renewMinSec * 1000) { track('ads.rail.renew_skipped', { page, label: 'min_age' }); return; }   // current ad rendered < renewMinSec ago: keep it
    stageRail(r);
  }

  // ---- Freeflow notes: strip above the text area + a column at 20% width on its right (high-demand sizes only) ----
  let notesDone = false;
  function notesAds() {
    const body = document.querySelector('#notes-page .freeflow-body');
    if (notesDone || !body) return;
    const box = body.getBoundingClientRect(); if (!box.width) return;
    notesDone = true;
    const barId = S.notesBar || S.banner, sideId = S.notesSide;
    let barH = 0;
    if (N.bar && barId) {
      const sz = (N.barSizes || []).find(s => s[0] + 24 <= box.width);
      if (sz) { const el = make('ad-ff-bar', 'notes-bar', barId, { size: sz }); body.before(el); barH = sz[1] + 14; watch(el); }
    }
    if (N.side && sideId && box.width >= N.sideMinPageWidth) {
      const colW = (box.width - 32) * N.sidePct / 100 - 12 - 14;     // 20% of the content box, minus the gap to the text area, slot padding and border
      const colH = box.height - barH - 24 - 14 - 24;                 // minus the bar, body padding, slot padding, label
      const sz = (N.sideSizes || []).find(s => s[0] <= colW && s[1] <= colH);
      if (sz) {
        const el = make('ad-ff-side', 'notes-side', sideId, { size: sz }); body.append(el);
        el.addEventListener('ad:reserved', () => body.classList.add('has-side'));                       // the column opens with the reserved box, so the text never reflows later
        el.addEventListener('ad:status', e => { if (e.detail !== 'filled') body.classList.remove('has-side'); });
        const fit = () => {                                            // never clip a creative: if it no longer fits, hide the whole column
          const c = el.getBoundingClientRect(), ins = el.querySelector('ins'); if (!ins) return;
          const over = ins.offsetHeight + 40 > c.height + 1 || ins.offsetWidth > c.width;
          el.classList.toggle('is-oversize', over); body.classList.toggle('has-side', !over);
        };
        new ResizeObserver(() => { if (el.classList.contains('is-filled')) fit(); }).observe(body);
        watch(el);
      }
    }
  }

  let lastList = null;
  function showFor() {
    const p = page();
    document.querySelectorAll('.ad-end').forEach(s => { s.hidden = !(cfg.endPages || []).includes(p); });
    if (p === 'scripts') requestAnimationFrame(() => mountRail('scripts'));   // first visit after a restore that opened another page
    if (p === 'links') linksFeed();
    if (p === 'checklist') requestAnimationFrame(() => { mountRail('checklist'); lastList = $('.listnav-btn.active')?.id || null; });
    if (p === 'notes') requestAnimationFrame(notesAds);
  }

  window.AcesAds = {
    init() {
      if (!cfg.enabled || window.ACES_CONSENT?.ads === false) return;
      if (S.end) { const end = make('ad-end', 'end', S.end, { fmt: E.format, reserve: E.reservePx, boxMax: E.boxMaxPx }); $('.main-page').append(end); watch(end); }
      showFor();
      document.addEventListener('aces:page', showFor);
      $('.script-nav-container').addEventListener('click', e => {      // runs after the tab's own handlers, so the new category is already active
        if (!e.target.closest('.nav-btn')) return;
        requestAnimationFrame(() => requestAnimationFrame(viewChanged));
      });
      $('.check-list-nav-container')?.addEventListener('click', e => {   // a different checklist = new content = a user-requested renewal of the rail
        if (!e.target.closest('button')) return;
        requestAnimationFrame(() => { const a = $('.listnav-btn.active')?.id || null; if (a !== lastList) { lastList = a; renewRail('checklist'); } });
      });
      lastTab = activeTab();
      if (page() === 'scripts') mountRail('scripts');                  // synchronously, so the column exists before the cards are first painted
    }
  };
})();
