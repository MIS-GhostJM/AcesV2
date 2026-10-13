// Site switches. Ads render only for slots that have a real AdSense unit ID.
window.ACES_CONFIG = {
  // Display-only tab grouping. Tab ids (and the JSON) are untouched; unlisted tabs land in "More" so a new tab never disappears.
  tabs: {
    groups: [
      { key: 'flow',    label: 'Conversation', ids: ['Opening', 'Closing', 'Handling Objections', 'Payment'] },
      { key: 'changes', label: 'Changes',      ids: ['Change', 'Cancel', 'Refunds', 'Refund Delays', 'Schedule Change', 'Name Correction'] },
      { key: 'library', label: 'Libraries',    ids: ['ETG Chat Scripts', 'B.COM Chat Scripts', 'ETG Voice Scripts'] },
      { key: 'cep',     label: 'CEP',          prefix: 'CEP-', ids: ['>>>>>>>>>>    C-SAT SCRIPTS    <<<<<<<<<<'] },
      { key: 'ref',     label: 'Reference',    ids: ['Helpful Scripts', 'General Scripts', 'Exchange and Cancellation Tips'] }
    ],
    other: { key: 'more', label: 'More' },
    // Tab rail: every tab is its own chip (colour = its group). `rows` rows are always visible; any further rows open downward on hover
    // (mouse), on the +N button (touch / keyboard) and fold back after a pick. order: 'group' keeps each colour together, 'data' = file order.
    rail: { rows: 2, order: 'group', hoverOpen: true, openDelayMs: 140, closeDelayMs: 300 },
    labels: { '>>>>>>>>>>    C-SAT SCRIPTS    <<<<<<<<<<': 'C-SAT Scripts' }
  },
  ads: {
    enabled: true,
    client: 'ca-pub-6978764838614552',
    // Paste real ad-unit IDs (AdSense > Ads > By ad unit). An empty ID keeps that placement switched off.
    //   end / links / banner : as before.      (The Scripts page has no horizontal units any more: no `feed`, and `end` is Checklist-only, see endPages.)
    //   float                : the floating bar of narrow windows (see `float` below). Falls back to `rail`, then `banner`. A dedicated unit gives it its own report line.
    //   rail                 : the right-hand skyscraper container (Scripts + Checklist). Falls back to `banner`. Create a dedicated RESPONSIVE display unit for it
    //                          (AdSense > Ads > By ad unit): the container uses data-ad-format="auto", which only works on a responsive unit, and a dedicated
    //                          unit shows its earnings on their own line in the reports.
    //   notesSide            : the same container beside the Free-flow text area (falls back to `rail`, then `banner`). Pre-filled with your retired rail unit
    //                          (6965605774); if that one was created as a FIXED size, create a responsive unit and paste it here (or empty it to use `rail`).
    //   tools                : the same container on /FDCalc and /FRprompt (falls back to `rail`, then `banner`). The old FDCalc repo used a fixed 160x600 unit
    //                          (1292927956): paste it here only if it is a responsive unit.
    slots: { end: '7813895425', banner: '5267623137', links: '6500813756', notesSide: '6965605774', rail: '', tools: '', float: '' },
    endPages: ['checklist'],                                          // end-of-page unit: Checklist only. The Scripts page keeps just the sticky right rail

    // WHEN a unit may load (the RPM part). A box is set aside while it is still off screen, so nothing moves under the agent's pointer, and
    // is requested only while it is really on screen: that is what raises Active View viewability and with it the price advertisers pay.
    gate: {
      viewRatio: 0.5,            // request only while at least this share of the box is on screen...
      dwellMs: 1000,             // ...for this long (units the agent scrolls past: Checklist end, Links)
      dwellFixedMs: 250,         // ...and for this long for the sticky rail / floating bar, which are on screen the whole time: the first ad of a page loads ~0.75 s sooner
      tickMs: 200,               // how often the gate looks for a unit that is ready (was 400)
      lookaheadPx: 300,          // reserve (blank, labelled "Advertisement") the box this far before it scrolls in. It is NOT requested yet
      requireFocus: true,        // RENEWALS never load into a window that is not focused (agents work split-screen: an unfocused tool is not being looked at)...
      requireFocusFirst: false,  // ...but the FIRST ad of a page view only needs a visible tab: a visible split-screen window is on screen, so the page-load request is not held back until the agent clicks into it
      idleSec: 90,               // ...and nothing loads after this long without mouse / keys / scroll / touch
      maxRequestsPerMin: 6,      // sliding-window guard on ALL ad requests from this tab
      giveUpMs: 12000            // blocked or unanswered: treat as unfilled (was 8 s: slow office networks answered after the box had already been removed)
    },

    // WHICH user actions may ask for a new ad (AdSense: only a refresh the USER requests). Each is an explicit request that replaces the content beside the ad,
    // so a fresh ad is fair. Every one still goes through the same gates: seen >= 50 %, focused window, active agent, `rail.renewMinSec`, 6 requests / min / tab.
    //   Always on (not switchable): a different Scripts category, a different checklist, a different section (Scripts / Checklist / Links / Free-flow).
    //   channel   : the All / Chat / Voice filter is changed (the list of scripts is replaced).
    //   search    : the search is cleared and the full list comes back (the ad was hidden while the results were shown).
    //   template  : Free-flow, "Insert template" (replaces the note).                    GRAY AREA: off until you decide, see UPGRADE-NOTES Round 15.
    //   generate  : /FRprompt, "Generate Optimized Prompt" (new output on screen).         GRAY AREA: off until you decide.
    // NOT possible by design: timers, typing, copy clicks, tab focus / visibility changes, scrolling, window resize (none of them is a user asking for new content).
    actions: { channel: true, search: true, template: false, generate: false },

    // Empty container recovery ("aggressive fill" that stays inside policy). A first request that gets no ad hands the column back, but the container is NOT
    // given up for the rest of the visit: the next explicit user action above (never a timer) puts it back and asks again, at most `max` times per page view,
    // at least `minGapSec` apart, and only while the global per-minute cap allows. Set max:0 for the old behaviour (one try, then gone).
    retryEmpty: { max: 3, minGapSec: 15 },

    // Container fit: when a creative arrives, the container shrinks / grows to exactly the creative (no empty frame around a 300x250 inside a 600 px column).
    // The rail is a separate column, so nothing beside it moves. Checklist end unit too (nothing below it). Links keeps its reserved box (its tiles re-centre).
    fit: true,

    // Right-hand skyscraper container: ONE unit in its own column. Its HEIGHT is the free space of the page: from just under the category bar down to the
    // footer (minus `topGapPx` / `bottomGapPx`), re-measured on every resize. It never scrolls (overflow hidden) and holds a responsive unit with
    // data-ad-format="auto", so AdSense picks the best-paying size that fits the column (`widthPx` wide). The box keeps the whole height whatever size
    // arrives (the creative sits inside it), so nothing moves when it loads. On Scripts and Checklist it sticks while the cards scroll; Free-flow and the
    // tool pages do not scroll, so it simply spans the page. Policy conditions are met by layout: it never overlaps content, keeps its label, sits clear of
    // the scrollbar and of other units, and ends where the content ends. Below `minViewportW`, or with less than `minHeightPx` (+44 px of frame) free, there is no column.
    // The rail is requested only after it has been seen (gate above). RENEWAL RULE (user-requested refresh, no timer):
    //   1. The agent switches to a DIFFERENT category (Scripts) / checklist. Clicking the open one does nothing.
    //   2. The ad on screen must have been rendered more than `renewMinSec` ago (30 s), otherwise the switch keeps it. AdSense publishes NO minimum for user-requested
    //      ads; 30 s is the lowest interval Google publishes anywhere (Ad Manager, time-based refresh), so it is the floor used here. Do not go below it.
    //   3. The old ad stays until the new creative has arrived (the new unit waits invisibly on top of it). No fill = the old ad stays.
    //   4. While a request is still unanswered (waiting for its turn, or sent and not filled yet) every further switch is DROPPED: nothing is cancelled,
    //      replaced or queued, so a burst of clicks can never produce a second request. A "no fill" answer frees the slot: the next switch asks again.
    // AdSense: "not permitted to refresh a page or an element of a page without the user requesting a refresh". It publishes no minimum interval for
    // user-requested ads, so `renewMinSec` is our own conservative floor. Set enabled:false to switch the rail off.
    // pages: where it appears (Errand-Notes never gets ads: customer data on screen). Free-flow and the tool pages never renew it (typing / calculating is not a refresh request).
    rail: { enabled: true, pages: ['scripts', 'checklist', 'notes', 'fdcalc', 'frprompt'], minViewportW: 1280, widthPx: 300, minHeightPx: 250, topGapPx: 12, bottomGapPx: 12, gapPx: 16, renewMinSec: 30 },
    // Floating bar for windows narrower than rail.minViewportW (the rail does not fit there): ONE unit docked between the content and the footer,
    // always visible, never moving with the scroll. It is a row of the app grid, so the content area ends above it: the last script card stops above
    // the bar and nothing is covered. Same request / renewal rules as the rail (renewMinSec above). Errand-Notes stays ad-free (customer data on screen):
    // add 'errands' to `pages` only after checking that against the client's policy. Links keeps its own unit; set `slots.links:''` if you want only the floating bar there.
    // Free-flow ('notes') is listed again (Round 15): below `rail.minViewportW` it gets the bar, so it is no longer ad-free in narrow windows.
    //   sizes: tried in order, first one that fits the content width.      minViewportH: below this window height no bar (it would eat the screen).
    float: { enabled: true, pages: ['scripts', 'checklist', 'links', 'notes', 'fdcalc', 'frprompt'], sizes: [[728, 90], [320, 100]], minViewportH: 560 },
    end: { format: 'rectangle', reservePx: 280, boxMaxPx: 336 },     // one unit after the last item (Checklist page)
    links: { format: 'rectangle', reservePx: 280, boxMaxPx: 336 },   // bottom strip of the Links tab
  },

  // Version check + safe refresh. Every `checkEveryMin` minutes the app compares the live files with the ones it loaded.
  // If something changed it saves every input (sessionStorage, this tab only), waits for a quiet moment, reloads and puts everything back.
  updates: {
    enabled: true,
    checkEveryMin: 10,
    quietMs: 4000,               // reload only after this long without typing/clicking...
    maxWaitMs: 60000,            // ...but never wait longer than this once a new version is found (inputs are restored anyway)
    reloadEvenIfUnchanged: false // true = literal reload every 10 min. Not recommended with AdSense (automatic reloads = extra page views / ad requests)
  }
};
