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
    //   end / links / banner : as before.      feed      : in-feed units between script cards (falls back to `banner`).
    //   rail                 : the sticky desktop column (Scripts + Checklist). Falls back to `feed`, then `banner`. Create a dedicated display unit for it
    //                          (AdSense > Ads > By ad unit) so its earnings show up on their own line in the reports.
    //   notesBar             : strip above the Freeflow text area (falls back to `banner`).
    //   notesSide            : the 20% column beside the Freeflow text area. Pre-filled with your retired rail unit (6965605774); create a fresh display unit
    //                          for it in AdSense if that one was a fixed size, because the column serves 300x600 / 160x600 / 300x250 / 250x250. Empty = column off.
    slots: { end: '7813895425', banner: '5267623137', links: '6500813756', feed: '', notesBar: '', notesSide: '6965605774', rail: '' },
    endPages: ['scripts', 'checklist'],

    // WHEN a unit may load (the RPM part). A box is set aside while it is still off screen, so nothing moves under the agent's pointer, and
    // is requested only while it is really on screen: that is what raises Active View viewability and with it the price advertisers pay.
    gate: {
      viewRatio: 0.5,            // request only while at least this share of the box is on screen...
      dwellMs: 1000,             // ...for this long
      lookaheadPx: 300,          // reserve (blank, labelled "Advertisement") the box this far before it scrolls in. It is NOT requested yet
      requireFocus: true,        // never load into a window that is not focused (agents work split-screen: an unfocused tool is not being looked at)
      idleSec: 90,               // ...or after this long without mouse / keys / scroll / touch
      minGapMs: 5000,            // minimum time between two in-feed requests
      maxRequestsPerMin: 6,      // sliding-window guard on ALL ad requests from this tab
      giveUpMs: 8000             // blocked or unanswered: remove the blank box
    },

    // In-feed ads between script cards. Every click on a DIFFERENT category starts a fresh view: the old units are removed and new ones are planned.
    // Rectangles (300x250 / 336x280) are the highest-demand display sizes; the box is capped at boxMaxPx wide so AdSense answers with a rectangle
    // instead of a low-value leaderboard. Spacing follows content height so ads never outweigh the scripts around them.
    feed: {
      enabled: true,
      format: 'rectangle',
      boxMaxPx: 336,
      reservePx: 280,            // height set aside for the creative
      firstCards: [2, 3],        // FIRST unit of a category view: after 2-3 cards...
      firstCardsMobile: [1, 2],  // ...on phones, whose cards are tall: after the first 1-2
      firstAfterPx: 280,         // ...but not before this much script content (it must land inside the opening screen: unseen units earn nothing)
      firstAfterPxMobile: 200,
      everyCards: [3, 4],        // later units: after every 3 or 4 cards...
      minContentPx: 520,         // ...and never before this much script content sits above them (about one screen of scripts per ad)
      minContentPxMobile: 640,   // same rule on screens up to 768px wide
      maxPerView: 6,             // hard cap per category view (0 = no cap)
      maxPerViewWithRail: 4,     // ...and this cap instead while the sticky rail is on that page (the screen already has a permanent unit)
      initialView: true          // also fill the first category shown on page load
    },
    // Sticky desktop rail: one fixed-size unit in its own column that stays in view while the agent works. Policy conditions are met by layout:
    // it never overlaps content, keeps its label, sits clear of the scrollbar and of other units, and ends where the content ends.
    // size = the first of `sizes` that fits the free height (decided once, never swapped after the request). Below `minViewportW` there is no column.
    // The rail is requested only after it has been seen (gate above) and renewed only after a user action (another category / checklist), at most
    // every `renewMinSec`. Set enabled:false to switch it off. pages: where it appears (Errand-Notes never gets ads: customer data on screen).
    rail: { enabled: true, pages: ['scripts', 'checklist'], minViewportW: 1280, sizes: [[300, 600], [300, 250]], topGapPx: 12, gapPx: 16, renewMinSec: 90 },
    end: { format: 'rectangle', reservePx: 280 },                    // one unit after the last card
    links: { format: 'rectangle', reservePx: 280 },                  // bottom strip of the Links tab

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
