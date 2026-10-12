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
    //   rail                 : the sticky desktop column (Scripts + Checklist). Falls back to `banner`. Create a dedicated display unit for it
    //                          (AdSense > Ads > By ad unit) so its earnings show up on their own line in the reports.
    //   notesBar             : strip above the Freeflow text area (falls back to `banner`).
    //   notesSide            : the 20% column beside the Freeflow text area. Pre-filled with your retired rail unit (6965605774); create a fresh display unit
    //                          for it in AdSense if that one was a fixed size, because the column serves 300x600 / 160x600 / 300x250 / 250x250. Empty = column off.
    slots: { end: '7813895425', banner: '5267623137', links: '6500813756', notesBar: '', notesSide: '6965605774', rail: '' },
    endPages: ['checklist'],                                          // end-of-page unit: Checklist only. The Scripts page keeps just the sticky right rail

    // WHEN a unit may load (the RPM part). A box is set aside while it is still off screen, so nothing moves under the agent's pointer, and
    // is requested only while it is really on screen: that is what raises Active View viewability and with it the price advertisers pay.
    gate: {
      viewRatio: 0.5,            // request only while at least this share of the box is on screen...
      dwellMs: 1000,             // ...for this long
      lookaheadPx: 300,          // reserve (blank, labelled "Advertisement") the box this far before it scrolls in. It is NOT requested yet
      requireFocus: true,        // never load into a window that is not focused (agents work split-screen: an unfocused tool is not being looked at)
      idleSec: 90,               // ...or after this long without mouse / keys / scroll / touch
      maxRequestsPerMin: 6,      // sliding-window guard on ALL ad requests from this tab
      giveUpMs: 8000             // blocked or unanswered: remove the blank box
    },

    // Sticky desktop rail: one fixed-size unit in its own column that stays in view while the agent works. Policy conditions are met by layout:
    // it never overlaps content, keeps its label, sits clear of the scrollbar and of other units, and ends where the content ends.
    // size = the first of `sizes` that fits the free height (decided once, never swapped after the request). Below `minViewportW` there is no column.
    // The rail is requested only after it has been seen (gate above). RENEWAL RULE (user-requested refresh, no timer):
    //   1. The agent switches to a DIFFERENT category (Scripts) / checklist. Clicking the open one does nothing.
    //   2. The ad on screen must have been rendered more than `renewMinSec` ago (60 s), otherwise the switch keeps it.
    //   3. The old ad stays until the new creative has arrived (the new unit waits invisibly on top of it). No fill = the old ad stays.
    //   4. While a request is still unanswered (waiting for its turn, or sent and not filled yet) every further switch is DROPPED: nothing is cancelled,
    //      replaced or queued, so a burst of clicks can never produce a second request. A "no fill" answer frees the slot: the next switch asks again.
    // AdSense: "not permitted to refresh a page or an element of a page without the user requesting a refresh". It publishes no minimum interval for
    // user-requested ads, so `renewMinSec` is our own conservative floor. Set enabled:false to switch the rail off.
    // pages: where it appears (Errand-Notes never gets ads: customer data on screen).
    rail: { enabled: true, pages: ['scripts', 'checklist'], minViewportW: 1280, sizes: [[300, 600], [300, 250]], topGapPx: 12, gapPx: 16, renewMinSec: 60 },
    end: { format: 'rectangle', reservePx: 280, boxMaxPx: 336 },     // one unit after the last item (Checklist page)
    links: { format: 'rectangle', reservePx: 280, boxMaxPx: 336 },   // bottom strip of the Links tab

    // Freeflow notes: a strip between the tools and the text area, plus a column at 20% of the width on its right.
    // Only high-demand standard sizes are used, chosen to FIT (never clipped). 200x200 / 180x150 / 468x60 / 320x50 earn very little, so the column
    // simply stays closed on screens too small for a proper size (it opens on full-HD desktops).
    notes: {
      bar: true,  barSizes: [[728, 90], [320, 100]],                                          // first one that fits the width wins
      side: true, sidePct: 20, sideMinPageWidth: 720,                                        // phones: no side column
      sideSizes: [[300, 600], [160, 600], [300, 250], [250, 250]]                            // largest that fits wins
    }
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
