# ACES upgrade notes (built from AcesUpgradePlan.md)

## What changed
| Phase | Done |
|---|---|
| **P0 Integrity** | App now renders `data/scripts-list.json` and `data/checklist.json` (single source). `scripts-data.js` / `checklist-data.js` are *generated* file:// fallbacks (`node tools/build-data.mjs`). `node tools/verify-text.mjs` checks the SHA-256 baseline on both (passes: 474 entries, 564 cards). The JSON is byte-identical to the upload. |
| **P1 Ads** | Old AdManager, inline ad CSS, dead overlay code and the two 728x90 units removed. New `assets/js/ads.js`: lazy, measured, no polling, no `push` monkey-patch; rail / in-feed / end slots; labelled; reserved height; hidden while searching. **Nothing renders until you paste real unit IDs in `assets/js/config.js`** (the old IDs looked like placeholders). Footer is now static, inside the scroll area. |
| **P2 Tracking** | `assets/js/tracker.js` (local-first, whitelisted props only, no text/PII, honours Do Not Track). `data-track` on static controls; hooks for copy ok / blocked / fail, card click/reset, tabs, search, channel, page load, ad request/fill/viewable. Read it with `acesMetrics.top('scripts.card.copy_ok')` or `acesMetrics.export()` in the console. |
| **P4 UX (lite)** | `assets/css/aces-upgrade.css` token layer (light + dark), solid channel colours, neutral cards with channel edge, no hover shift, 14px body, dashed/solid placeholder states, "2 of 3 fields / Ready" chip, static New/Updated markers, visible two-tone focus ring (+ forced-colors), reduced motion. Keyboard: cards and placeholders are focusable (Enter fills/copies), `/` search, `Esc` clear, `Alt+1..5` pages, `aria-current`, live region for "Copied". `<button><a>` fixed, inputs labelled, logos relative. |
| **P5 (partial)** | Search covers card content (accent/look-alike folding, index copy only) with result count; placeholder aliases (`[Brand]`/`[BRAND]`/`[Brand Name]`/`[our Brand]`, `[Agent name]`...) share one value; unfilled-token warning (`##x##`, `XYZ`, `XX`, `CUSTOMER NAME`); agent name persisted; "new since last visit" replaces the 7-day blink; one shared state manager. |

## UX skills applied
- **ux-audit** (code tier): baseline inventory of the original = 121 colours, 16 font sizes, 13 radii, 33 shadows, 11% token adoption; the plan's findings were adopted as the register.
- **ux-restyle**: scope locked to look, not flows; plan tokens measured. Failing white-text pairs were derived darker: brand `#2c7be5` (4.14:1) -> `#1d63c6` (5.75:1); voice `#0f9d8a` (3.38:1) -> `#0b7a6b` (5.24:1); ok `#1f9d63` (3.46:1) -> `#17784a` (5.49:1). All text/UI pairs in `aces-upgrade.css` measured >= 4.4:1 (UI) / 4.5:1 (text), light and dark.
- **ux-design / ux-review**: card anatomy, states (empty/filled/ready/copied/blocked/loading/error), microcopy.

## Decisions for the content owner (plan §2.5)
1. Refund timing: the JSON says "5", the old JS copy said "6". JSON wins; confirm it is the right policy.
2. The `<strong>` add-on disclaimer on *CEP-Discuss Solution & Gain Agreement* exists only in the old JS copy. It is not in the JSON; add it there if it should return.
3. Curly quotes/dashes are restored in copied text (canonical). Add a paste-safe toggle only if a downstream tool mangles them.

## Account side (cannot be done in code)
Create real ad units and paste IDs in `assets/js/config.js`; keep Auto Ads off or Anchor-only; confirm the `*.netlify.app` host status in AdSense; consent banner (Funding Choices) if EEA/UK visitors; confirm client policy before enabling `errands` in `railPages`.

## Not built in this pass
Admin editor (P3), tab grouping + header rework, favourites/recents, PWA/offline worker, brand auto-fill selector, stats dashboard page, content sanitiser (only needed once an editor exists), step/command tracking inside the checklist. Everything else in the plan is untouched.

## Not verified
Written without a browser. Do a live pass: tab through header -> tabs -> card -> copy, check the dark/light card colours on each page, resize 1440 -> 390 px, and compare clipboard text with the JSON for the NBSP, Cyrillic and `<br>` samples.

## Round 2: layout, tab groups, sidebar, footer, mobile
- **Right-edge white strip**: the header row was wider than the page (the agent-name box spilled out; that was the faint "James"), so Chrome zoomed out to fit it. The header is now a grid that wraps (1 row >=1100px, 2 rows below), the shell is a single-scroller flex column on `100dvh`, and `overflow-x: clip` guards the page.
- **Tab groups**: 25 tabs -> 5 colour-coded menus (Conversation, Changes, Libraries, CEP, Reference). Hover (desktop), click/tap or arrow keys open them; on phones they open as a bottom sheet. Edit the groups in `assets/js/config.js` (`tabs.groups`); unlisted tabs appear under "More". Display only: tab ids and JSON are unchanged.
- **Script headers**: 14px gap between them, filled with their group's colour (the card edge matches); Chat/Voice is a text badge so it never relies on colour alone.
- **Sidebar**: 88px rail with 12px labels and a clear active bar (no tooltips, labels are visible); a bottom tab bar with 44px+ targets on phones. Links item now matches the others; nav buttons have accessible names.
- **Footer**: auto year, "N scripts · updated Mon YYYY" from the data, Back to top, and legal links behind a "Legal" toggle on phones.
- **Mobile**: titles stack above cards, 16px inputs (no iOS zoom), real **Copy / Fill next field** button on every card, errands forms stack, tables scroll, skip link, `viewport-fit=cover` with safe-area padding.
- Not render-tested (no browser here). Colour pairs measured: every group colour passes AA with white text; dark-theme edge colours pass 3:1+.

## Round 3
- **Data**: `scripts-data.js` is now the single, hand-edited, readable source (instructions at the top of the file; one field per line; text in backticks; NBSP shown as `\u00a0`). `data/scripts-list.json` and `tools/verify-text.mjs` are gone. `node tools/check-data.mjs` validates it and a GitHub Action runs it on every change. `node tools/format-data.mjs` re-tidies the layout. Every field was verified identical to the previous data.
- **Footer** is a fixed row of the app grid (36px, 40px on phones); legal links collapse into a pop-up under 900px.
- **Skeleton loader** (tabs + cards) shows until the scripts render; a failed load shows a Retry button.
- **Cards**: the Copy button appears only when every field is filled (no "Fill next field").
- **Motion**: group buttons lift, chevrons rotate, menus fade/scale in with a staggered item reveal; phones get a sliding bottom sheet. Honors reduced-motion.
- **Ads**: Links feed is requested only the first time the Links tab opens. Rotating banner between scripts (config `ads.rotation`): shows 30-45 s, rests 5-8 min, repeats while the Scripts tab is open, the browser tab is visible, the agent is active and not searching/editing. Each placement stays off until its real unit ID is set in `config.js` (`banner`, `links`).
- **AdSense rule**: publisher-timed re-requests are not allowed on AdSense; user-initiated ones are. Default `trigger: 'user'` waits for the agent's next tab/page switch after each rest period. `'timer'` is the literal timed loop (use only on Ad Manager with refresh declared).
- **Freeflow**: autosave (24 h, this device), templates, word/line counts, text size, spacing, high contrast, mono, spellcheck toggle, read aloud, undo clear, shortcuts.
- **Content flags** from the validator (left untouched): two cards have mismatched brackets, `{like baggage, seats, or meals]` (ETG Chat Scripts, "ATC-CXL - non-ref tax") and `[currency}` ("CXL - fare rules").
- Not render-tested (no browser here).

## Round 4
- **Shell lock**: the app frame is `position: fixed` to the viewport and `html/body` never scroll, with `!important` guards, so header, sidebar, tab bar and footer stay put on every page; only `.main-page` (and the Freeflow text area) scroll. Verified in headless Chromium at 1366x634: container = viewport, footer pinned, Links page fills the screen. `_headers` no longer caches `/assets/*` for an hour (stale CSS could be mixed with new HTML).
- **Scrollbars**: slim pill thumbs with a soft track that brighten and thicken on hover and while scrolling (Chrome/Edge/Safari); thin themed scrollbar in Firefox. Content tab bar now sticks with a solid backing.
- **Ads**: ad units set in `config.js` (`end`, `banner`, `links`); the vertical rail is removed entirely. Every ad container is zero-height and invisible until AdSense reports `filled` (it then expands; unfilled ones stay gone). Links feed now sits under the tiles.
- **Freeflow**: page is a flex column; the text area takes the remaining height and scrolls inside itself.
- Tip: in AdSense turn Auto ads off for this site, otherwise Google may add placements beside your manual units.

## Round 5: Google Analytics 4
- The GA tag is added by Netlify (Site configuration > Build & deploy > Post processing > Snippet injection). Do **not** also paste it into `index.html`.
- `assets/js/ga-bridge.js` listens for the tracker's `aces:track` event and forwards each one to GA4 with `gtag('event', ...)`. Dots in event names become underscores (`scripts.card.copy_ok` -> `scripts_card_copy_ok`). Card events add `card_id` and a readable `card_name` ("Script title #N"). `ads.*` events stay local (see `SKIP` in the file).
- Register these as GA4 custom dimensions (Admin > Data display > Custom definitions, event scope): `card_name`, `tab`, `channel`, `label`, `app_page`, `option`.
- Do Not Track and `window.ACES_TRACK_OFF` still disable events (tracker.js is the single gate). Not tested against a live GA property.

## Round 6 (V4 request)
- **Cards**: the Copy button is gone (markup, CSS and JS). The whole card still copies on click / tap / Enter; the status line now reads "Ready · tap or click to copy". Card padding no longer reserves room for a button.
- **In-feed ads** (`ads.feed` in `config.js`, logic in `assets/js/ads.js`): each click on a *different* category removes the previous category's units and plans a new set, one after every 2-3 cards (re-rolled after each ad). Units are empty labelled boxes at zero height until AdSense fills them, are requested only when near the screen, and only after the agent stays on the category for `dwellMs` (so flipping through tabs requests nothing for the skipped ones). Safeguards: max `maxRequestsPerMin` requests per minute for the whole tab, `maxPerView` units per view (12), `minContentPx` of script content above each ad (very short cards stretch the gap a little), no ad as the last item (the end-of-page unit covers that), hidden while searching, never inside a card. Same category clicked again = no new request. Set `feed.enabled: false` to switch it off. Uses `slots.feed`, falling back to `slots.banner`.
- **Timed rotating banner is now off** (`rotation.enabled: false`): the in-feed units replace it. Turning both on stacks too many ads on one screen.
- **Links tab**: tiles are smaller (about 58px tall, 13px text), laid out in 4 columns (2 under 900px, 1 under 480px) and centred horizontally and vertically in the free space. When the Links ad fills, it takes a strip at the bottom and the tiles re-centre in what is left; if it never fills, nothing is reserved.
- **Freeflow**: title removed (kept as a hidden heading for screen readers), tools sit at the top, then an optional thin strip ad (468x60, or 320x50 on narrow screens), then the text area. A column at 20% of the width sits to its right. The page itself never scrolls (`overflow: hidden`); only the text area scrolls. Ads use fixed standard sizes picked to fit the available box, so they are never clipped; if the window later shrinks so the column no longer fits, it hides instead of overflowing. The column is not used under 720px wide. Config: `ads.notes`; units `slots.notesBar` (falls back to `banner`) and `slots.notesSide`.
- **Auto-update** (`updates` in `config.js`, logic in `assets/js/session.js`): every 10 minutes the app compares the live HTML, JS, CSS and `data/checklist.json` with what it loaded (ETag / Last-Modified, body hash as fallback). Only if something changed, and after a second confirming check, it saves a snapshot to `sessionStorage` (this tab only, never sent anywhere), waits for 4 s without typing or clicking (60 s at most), reloads, restores, and deletes the snapshot. Restored: header names, channel filter, search, edited script placeholders, all Errand-Notes fields, Freeflow text with cursor and scroll, checklist ticks, active category, active page and scroll position. If the snapshot cannot be saved, it does not reload and offers an "Update now" button instead. Never more than one automatic reload per 5 minutes. A literal reload every 10 minutes is available (`reloadEvenIfUnchanged: true`) but not recommended with AdSense.
- **Policy notes** for the new placements: keep Auto ads off for the site; ads stay labelled "Advertisement" and away from tap targets (18px margins in the feed, a bordered strip above the Freeflow text area). The Freeflow and Links pages have little publisher content of their own, which is the weakest spot for AdSense review; to remove those ads, set `ads.notes.bar` and `ads.notes.side` to `false` and `slots.links` to `''`.
- **Ad units**: `notesSide` is pre-filled with the rail unit your V4 config called "no longer used" (6965605774). Create a fresh display unit if that one was a fixed size.
- Tested in headless Chromium (desktop 1366x768 and phone 390x800) with a stubbed AdSense script; not tested against live ads or a live Netlify deploy.

## Round 7: ungrouped two-row script tabs
- **Ungrouped**: the five group buttons and their drop-down menus are gone. All 25 tabs are individual chips (`.tab-btn`, same `.nav-btn` nodes, so `script.js` handlers, ids and `data-tab` are untouched). Each chip is filled with its group's colour (`--g-flow`, `--g-changes`, ... in `aces-upgrade.css`, the same variables the script headers and card edges use). The group name is in the chip's tooltip and screen-reader label ("Refunds, Changes"). `tabs.rail.order: 'group'` keeps each colour together (data order inside a group); `'data'` uses the file order.
- **Size**: chips are 20px tall (half of the old 40px buttons; 22px on screens up to 768px wide, half of 44px), 12px semibold text, 8px side padding. Width follows the label, so it is not literally halved: the old buttons averaged about 120px, the chips about 111px, but they now carry a full tab name instead of "group · current tab". On phones up to 480px wide: 11px text and 6px padding. Knobs on `.script-nav-container`: `--tb-h`, `--tb-px`, `--tb-font`, `--tb-gap`, `--tb-row-gap`, and `--tb-max` (maximum chip width, default 240px; set about 110px to truncate long labels with an ellipsis and get a much narrower rail).
- **Two rows + auto-expand** (`assets/js/tabs.js`): two rows are always visible. When the chips need more rows, a `+N` button appears at the right end and the rail opens downward over the page by exactly the missing rows (the measured height of all rows, never a fixed number), 0.38s ease-out, with the revealed chips dropping in one after another. The page below does not move (the rail is an overlay and the bar keeps its height). Open with: mouse hover (140ms delay, closes 300ms after the pointer leaves), the `+N` button (touch, keyboard, mouse), or Enter/Space on it. It folds back after a tab is picked, on Esc, on a tap outside, or when focus leaves. On very short screens the open rail is capped at 60% of the window height and scrolls inside.
- **Current tab stays visible**: while closed, the two-row window slides by whole rows so the active chip is always inside it (picking "Exchange and Cancellation Tips" from the third row slides the window down one row; it does not move again when you pick a chip that is already visible). The active chip has a white ring and bolder text, so it does not rely on colour alone.
- **Accessibility**: clipped chips are `inert` (not focusable or read out) until the rail opens; Left/Right/Home/End move between chips and Up/Down jump to the row above/below; the toggle has `aria-expanded`/`aria-controls` and an updating label ("Show 5 more script categories"). On touch screens each chip gets an invisible hit area of about 32-34px; the visible chip stays at half size. Reduced-motion users get no animation. Contrast of white 12px text on the group colours: 5.0:1 to 7.1:1.
- **Other changes**: skeleton loader now shows two rows of small chips; ad requests that hit the per-minute cap for the one-per-page units (Links, Free-flow strip and column) now wait for the window to clear instead of being dropped, only in-feed units are dropped.
- Tested in headless Chromium at 1920, 1366, 1024 and 390px wide (stub ad script): 2 rows with no toggle at 1920, 3 rows (+5) at 1366, 4 rows (+11) at 1024, 12 rows on a phone; no layout shift when opening; colour of every chip checked against its group; keyboard, hover, tab pick from a hidden row, update-and-restore, and in-feed ads all re-checked. Not tested on a real device or live Netlify deploy.

## Round 8: RPM leak fix (ads)
**What the AdSense table (Oct 3-9) showed.** Revenue tracks *viewable* impressions, not total impressions: multiplying impressions by Active View viewable gives about 15,250 viewable impressions for $17.09, i.e. about $1.05 per 1,000 viewable on every full day (Oct 3 $1.03, Oct 5 $1.04, Oct 7 $1.08, Oct 8 $1.05). The other ~19,600 impressions (56%) were rendered but not seen and earned almost nothing. Viewable fell from 98.9% (Oct 3) to 33.5% (Oct 8) as impressions per page view rose from 0.65 to 1.8-5.1, and impression RPM fell from $0.99 to $0.35 with it. Page RPM spikes on Oct 5-6 are click-driven (17 and 7 clicks).

**Where V6 leaked.** Units were requested 400px *before* they scrolled in (half of V6's requests in the test were fully off-screen); the in-feed format was `horizontal` full-width (leaderboard-shaped, low demand); one ad per 2-3 cards put ads at about 1:1 with scripts; Freeflow used 468x60 / 320x50 / 200x200 / 180x150 (lowest-demand sizes); nothing stopped requests into a window that was not focused or an idle tab (agents work split-screen); ads grew from zero height when they filled, moving cards under the pointer.

**What V7 does** (`assets/js/ads.js`, `ads` in `config.js`, "Round 8" block in `aces-upgrade.css`):
- **Request only what will be seen.** A box is set aside (blank, labelled "Advertisement") up to 300px before it scrolls in, but AdSense is asked only while at least 50% of the box is on screen for 1 s, the window has focus and the agent was active in the last 90 s. In the same agent workflow, the share of requests made while the ad was on screen went from 50% (V6) to 100% (V7).
- **Nothing moves.** The reserved box keeps its height when the creative arrives (0px motion in the test), 24px clear of the click-to-copy cards, so a tap meant for a script cannot land on an ad. Links and Freeflow reserve their boxes the moment the page opens. A blocked or unanswered request removes the blank box after 8 s.
- **Higher-demand sizes.** In-feed, end and Links units are `rectangle` (300x250 / 336x280) in a box capped at 336px; Freeflow uses 728x90 (320x100 on narrow screens) for the strip and 300x600 / 160x600 / 300x250 / 250x250 for the column. 468x60, 320x50, 200x200 and 180x150 are gone, so the column now opens on large screens only (it did not fit a proper size on 1366x768 laptops).
- **Density by content, not by count.** The first unit of a category view lands inside the opening screen (after 2-3 cards, or 1-2 on phones); later units are about one screen of scripts apart (3-4 cards, at least 520px desktop / 640px phone), at most 6 per view. In the test the first unit was inside the opening screen in 8 of 8 views that have one on 1366x768 and 1920x1080; on phones it depends on scrolling because one script card can fill the screen.
- **Fewer, steadier requests.** At least 5 s between in-feed requests, at most 6 requests per minute per tab, one request per tick.
- **Removed:** the timed rotating banner (`rotation`) and its code. A timer that requests new ads is exactly what AdSense's no-refresh rule forbids. New ads are requested only after a user action (opening a category, scrolling, opening a tab).

**Policy checklist (all kept):** no refresh, no overlays or sticky custom ads, every unit labelled, units never inside cards or beside controls, ads hidden while searching, nothing requested on skeleton / error states, requests only from a visible, focused, active window.

**Measure it (3-7 days, AdSense > Reports):** Active View viewable (target well above the 43.76% average; it was 77-99% when each page had one unit), impressions per page view (expect it to settle around 1-2.5; fewer is fine), impression RPM, page RPM. Use *By ad unit* and *By ad size* to see which sizes pay. Note impressions will drop: that is intended, because the dropped ones were not viewable.

**Account-side items (cannot be fixed in code):**
1. AdSense > Sites > ads.txt must read "Authorized"; fix it first, a missing/unauthorized ads.txt lowers bids.
2. Create dedicated display ad units (responsive) for `feed`, `links`, `notesBar` and `notesSide`, paste the IDs into `slots`, and stop sharing `banner` / the retired rail unit. Per-placement reporting needs this.
3. Auto ads: leave Anchor / Vignette off here, the page has a fixed footer and its own placements. Test Auto ads on a separate copy before turning anything on.
4. Check Ads > Ad review center and Blocking controls: block categories that pay under the floor and watch for large drops in CPM.
5. Early clicks look unusual: Oct 3 5 clicks on 88 impressions (5.7%), Oct 4 9 on 429 (2.1%), Oct 5 17 on 2,099 (0.8%), against 0.03-0.06% on Oct 6-8. If any came from testing, do not click your own ads (invalid activity can be discounted or reviewed). Ads that load and push content under the pointer cause accidental clicks; V7 removes that cause.
6. Traffic location sets a ceiling on CPM (see Reports > Countries). Code cannot change it.

Tested in headless Chromium (1366x768, 1920x1080, 390x800 and other phone sizes) with a stubbed ad script; not tested against live AdSense. Tab rail, update-and-restore, Freeflow scroll lock and Links layout were re-checked.

## Round 9: sticky rail, layout-shift fixes, Auto ads decision (AdSense audit)

**Audit result.** The ad lifecycle this repo needs already existed (Round 6-8): units are planned per category view, reserved before they scroll in, requested only when seen / focused / active, re-requested only after a user action, rate-capped, labelled, and never inside Errand-Notes. Nothing in `tabs.js` needed a new "refresh hook". What was missing, and is now in:

| # | Change | Where | Why |
|---|---|---|---|
| 1 | **Sticky desktop rail** (300x600, or 300x250 when the screen is short), Scripts + Checklist | `assets/js/ads.js` (`mountRail`, `renewRail`), `assets/css/aces-upgrade.css` ("Round 9"), `ads.rail` + `slots.rail` in `assets/js/config.js` | A unit that stays on screen is the highest-viewability placement the page can offer. It sits in its own grid column, so it never overlaps content (see policy notes). Ships **on**; `rail.enabled: false` removes it. |
| 2 | **Header layout shift fixed** | `index.html` (theme toggle is now static markup), `assets/js/app.js` (reuses it) | `app.js` injected the theme button into the header grid after first paint, which pushed every header item one column right. Measured in headless Chromium (no FontAwesome/CDN there, so read it as relative): CLS 0.18 -> 0.016 at 1366px and 0.186 -> 0.002 at 1100px. |
| 3 | **Ad boxes open instantly** | `aces-upgrade.css` (`.ad-slot.is-reserved { transition:none }`), `ads.js` (`watch()` reserves synchronously when a unit is inserted inside the look-ahead zone) | Boxes used to grow over 0.5 s, which pushed cards down frame by frame. |
| 4 | **Preconnect** to the three AdSense hosts; `onerror` flag on the AdSense `<script>` | `index.html` | Earlier first request; if the library is blocked no ad column is reserved. |
| 5 | **Feed cap with a rail** | `ads.feed.maxPerViewWithRail` (4) | The screen already carries a permanent unit. |

**Rail behaviour (all in `ads.js`).** Mounted synchronously before the first paint, so nothing reflows. Size is chosen once from the free height (never swapped after a request). Requested through the same gate as every other unit (>=50% visible for 1 s, window focused, agent active). Renewed only when the agent opens a different category / checklist, and at most every `renewMinSec` (90 s). First request unfilled or library blocked -> the column is handed back at once. A later renewal that is unfilled hides the box but keeps the column, so nothing reflows under the agent. Hidden while searching, while the tab overlay is open, and below `minViewportW` (1280 px). Not available on phones, Errand-Notes, Free-flow (it has its own column) or Links.

**Policy notes (checked against Google's pages on 12 Oct 2026).**
- *Refresh.* "Publishers are not permitted to refresh a page or an element of a page without the user requesting a refresh" (AdSense > Ad placement policies). Every re-request here follows a click on a different category / checklist. There is no timer anywhere.
- *Sticky.* AdSense's own policy pages do not mention sticky units. Google's published sticky-ads guide offers a fixed-position unit as an AdSense option and lists the conditions: a vertical sticky unit must never overlap or underlap content, stay clear of navigation and scrollbars and other ads, show its label at all times, and scroll out where the content ends. The column layout satisfies these by construction; the guide also says to A/B test and that dynamic pages may not suit it. After deploying, watch AdSense > Policy center for a week, and compare viewability / RPM with the rail on and off (`rail.enabled`).
- *Accidental clicks.* Google asks publishers to be careful with buttons, navigation and applications near ads. Script cards copy on click, so units stay 24 px clear of them. Do **not** put ads next to cards, copy actions or the tab chips.
- *Private communication / customer data.* Keep Errand-Notes ad-free.
- *Links tab.* It is a grid of link tiles with an ad strip under it. Ads that can be mistaken for links or navigation are a policy risk, and the page has almost no publisher content. Consider `slots.links: ''`.

**Auto ads: leave them OFF for this site.**
- *Anchor* and *Side rails* are overlay formats: they sit on top of the page. This app is a fixed-viewport shell with its own footer (and a bottom tab bar on phones), so an anchor would cover navigation, and side rails would cover content: accidental-click risk.
- *Vignettes* are tied to page navigations that use real links (`<a href>`), not JavaScript routing. Tab switches here are buttons, so they would not fire "between tool steps"; they could fire on a full load or on the footer's legal links, and an interstitial in front of an agent who is mid-conversation costs far more than it earns.
- *In-page* Auto ads would add units next to the manual ones and cannot be told where the cards are. If you want to test any Auto ads format, do it on a separate copy of the site.
- *Multiplex / matched content* is a grid of recommended-content tiles for sites with articles to recommend. There is nothing here for it to sit beside, and on the Links tab it would look like more link tiles.

**Account side (the biggest levers, not code).**
1. AdSense > Sites: ads.txt must read "Authorized".
2. Create dedicated display units for `rail`, `feed`, `notesBar`, `notesSide` and paste the IDs into `slots` (today `rail` and `feed` fall back to `banner`, which blends them in reports).
3. Auto ads: OFF for this site (Ads > By site).
4. If you ever get EEA/UK traffic: turn on the consent message (Privacy & messaging); `window.ACES_CONSENT.ads === false` already stops all units.
5. Read Reports > By ad unit and By ad size after 3-7 days: Active View viewable, impressions per page view, impression RPM, page RPM. Traffic location sets a ceiling on CPM that no layout change can lift.

**Tested** in headless Chromium with a stubbed ad script (not live AdSense, no CDN fonts): 1920x1080, 1366x768, 1280x720, 1100x800, 390x800; rail present / sticky / scrolls out at the end of the content; search, tab overlay, resize, renewal gap, blocked library, no-fill, checklist, other pages. Every request in the run was made with the box >=50% on screen. Not tested on a live Netlify deploy or with real creatives.


## Round 10: Scripts page = sticky right rail only; new ad on every category switch
**Changed**
- **Horizontal ads removed from the Scripts page.** The in-feed units between script cards (Round 6-8 `ads.feed`) are gone from the code, config and CSS, and the end-of-page unit no longer shows on Scripts (`ads.endPages` is now `['checklist']`). Everything that described in-feed units in Rounds 6-9 above is superseded by this round.
- **Kept:** the sticky right-hand rail (300x600, or 300x250 on short screens; desktop >= 1280 px wide), unchanged in layout and size rules.
- **Rail renewal rule (first version; refined in Round 11 below)** (`assets/js/ads.js`, `ads.rail.renewMinSec` in `assets/js/config.js`): every time the agent switches to a *different* category, the rail drops its old unit and requests a new one. It still has to be on screen >= 50% for 1 s with the window focused and the agent active before AdSense is asked, so the request is always for an ad that will be seen. If the previous rail request was less than `renewMinSec` ago (now **30 s**, was 90 s), the switch keeps the current ad and logs `ads.rail.renew_skipped`; the next switch after the floor renews. Clicking the category that is already open requests nothing. There is no timer anywhere.
- The same renewal rule applies to the Checklist rail when a different checklist is opened (shared setting).
- Removed from config: `slots.feed`, `ads.feed`, `gate.minGapMs`. `end` and `links` gained `boxMaxPx: 336` (it used to come from the feed block).

**Policy basis (checked 12 Oct 2026).** AdSense: "Publishers are not permitted to refresh a page or an element of a page without the user requesting a refresh" (AdSense > Ad placement policies). Switching category is the user's request. AdSense publishes no minimum interval for user-requested ads. Google Ad Manager sets "No minimum" for user-action refresh and 30 s for time / event refresh, so 30 s is our own conservative floor, not a number from AdSense. Raise `renewMinSec` (e.g. 45-60) if AdSense > Policy center ever flags request frequency.

**Side effects to know**
- Below 1280 px wide (and on phones) the rail does not render, so the Scripts page now has no ad at all there. If you want a fallback on small screens, it needs a separate decision (a single in-content unit, for example).
- The rail still falls back to the `banner` unit ID because `slots.rail` is empty. Create a dedicated display unit and paste its ID into `slots.rail` so the rail shows as its own line in AdSense reports.
- Impressions per Scripts page view will drop (one unit instead of up to four plus the end unit); watch RPM and Active View viewable, not impression count.

**Tested.** Logic test in jsdom with a stubbed ad script and observers (no real browser or live AdSense): rail mounts, no `.ad-feed` anywhere, end unit hidden on Scripts and shown on Checklist, first request once seen, switch inside 30 s = no request, switch after 30 s = fresh unit + one request, same category = nothing, only one rail unit and one `<ins>` on the page. `node tools/check-data.mjs` still passes (474 entries, 564 cards). Not tested on a real device, live Netlify deploy or live ads: do a quick pass at 1366x768 (open a few categories, confirm the rail swaps and nothing jumps).

## Round 11: keep the old ad until the new one arrives; cancel duplicates; 60 s rule
**Rail renewal now works like this** (`assets/js/ads.js`: `renewRail`, `stageRail`, `cancelNext`; `ads.rail.renewMinSec` = **60** in `assets/js/config.js`; CSS "Round 11" lines in `assets/css/aces-upgrade.css`):
1. The agent switches to a *different* category (or checklist). Clicking the open one does nothing.
2. If the ad on screen was **rendered less than 60 s ago**, the switch keeps it and requests nothing (`ads.rail.renew_skipped`, label `min_age`). "Rendered" = the moment the creative arrived. The 60 s also counts from the last request, so a no-fill cannot be retried on every click.
3. Otherwise a replacement unit is **staged on top of the current ad** (same grid cell, same size, invisible until filled). **The old ad stays on screen the whole time.** When the new creative arrives it replaces the old one (0.4 s overlap, so the column is never blank). If nothing comes back (no fill / blocked) the old ad simply stays (`ads.rail.renew_unfilled`).
4. **(Superseded by Round 12.) Switching again while the new request is still waiting** (the gate needs the unit on screen ~1 s, focused window, active agent) **cancels it** (`ads.rail.cancelled`) and the newest switch takes its place, so a burst of clicks produces one request, not several.
5. **(Kept in Round 12.) Once the request has been sent to AdSense it cannot be recalled.** Switches during that time (until the answer or the 8 s give-up) are ignored (`ads.rail.renew_skipped`, label `in_flight`) so a second request is never sent; the ad that arrives is shown.
Same rule on the Checklist rail when a different checklist is opened. The first ad of a page is unchanged (requested once the rail has been seen).

**Freeflow: does typing count as a user-requested refresh? No, so nothing was changed there.** The policy asks for the *user requesting a refresh* of the page or element. Switching category does that (new content is requested); typing in the text area only adds the agent's own text, and nothing is refreshed. Counting keystrokes would make a new request on any agent who simply keeps typing: that is a refresh that happens while the user is present, not one the user asked for, and the ad would load next to a text area the agent is looking at, not the ad. The Freeflow bar and column therefore keep their single request per page open, as before. Actions that *do* replace the content on screen (Clear, loading a template) are arguably user requests, but that is a judgement call; they are not wired to ads.

**Tested** in jsdom with a stubbed ad script and observers (not a real browser, not live AdSense): first ad; switch under 60 s keeps it; after 60 s a unit is staged with the old ad still connected; second switch before the request is sent cancels it and one request results; slow answer: old ad stays, switches during the wait send nothing, new ad replaces the old one on arrival; no fill: old ad stays and no retry inside the floor; same category requests nothing; one `<ins>` in the page. **Still to check by eye at 1366x768:** that the staged unit sits exactly over the old one (CSS grid overlap + sticky) and there is no flicker at the swap.

## Round 12: drop switches while a request is unanswered (no cancel / replace)
**Why.** Cancel-and-replace (Round 11, point 4) meant a quick run of switches kept tearing down and re-creating the waiting unit, and the request kept being pushed back by the 1 s gate.
**Now** (`renewRail` in `assets/js/ads.js`):
- While a rail request is **unanswered** (staged and waiting for its turn, or sent and not yet filled / unfilled), any further switch is **dropped**: nothing is cancelled, replaced or queued, and the waiting unit goes out on its own schedule (`ads.rail.renew_skipped`, label `pending`). A burst of switches therefore produces exactly one request.
- The answer frees the slot. **Filled**: the new ad replaces the old one and the 60 s clock (`renewMinSec`) starts from that moment; switches before it ends keep the ad (`min_age`). **No fill** (or the 8 s give-up): the old ad stays and the **next switch sends a request straight away**; no extra wait (the old ad is already past 60 s). The global cap of 6 ad requests per minute per tab still applies.
- Unchanged: the old ad stays on screen until the new one arrives; the same category again requests nothing; Checklist rail uses the same rule; Freeflow is not touched (typing is not a refresh request).
- `lastReqAt` and the cancel-on-switch path are gone. `cancelNext` is now only used when the rail is taken away.
**Note.** If AdSense never answers and the 8 s give-up fires, the next switch may send a new request while a very late answer to the first could still arrive; the late one is ignored.
**Tested** in jsdom (stubbed ads, not a real browser): burst of 3 switches while waiting = 1 request, same staged element throughout; slow answer = no second request, new ad replaces the old on arrival; no fill = old ad stays and the next switch sends a request; 60 s floor and same-category cases unchanged.

## Round 13: floating ad bar above the footer for windows too narrow for the rail
**What it is.** When the window is narrower than `ads.rail.minViewportW` (1280 px: tablets, phones, split-screen), the sidebar rail does not fit. A single floating bar is shown instead, **fixed above the footer**, in every section except Errand-Notes. It does not move with the scroll. At 1280 px and wider nothing changes: rail only, no bar.
**How it is built** (`assets/js/ads.js` "Floating bar"; `ads.float` + `slots.float` in `assets/js/config.js`; "Round 13" in `assets/css/aces-upgrade.css`):
- It is a **row of the app grid** (`.app-body`, area `bar`) between the content and the footer, not a `position:fixed` overlay. The content area therefore ends above the bar: **the last script card scrolls to just above it and is never covered** (no extra padding needed, nothing under or behind the ad, which is also what Google's sticky-ad conditions ask for). No bar = no row = no space taken. A 6 px gap separates it from the footer buttons, and the toasts now sit above it (`--float-h`).
- Size: 728x90 when the content is >= 752 px wide, otherwise 320x100 (`float.sizes`). Re-chosen at each renewal. No bar when the window is shorter than `float.minViewportH` (560 px) or when the content is narrower than the chosen ad (never clipped). Hidden while search results are shown, like the rail.
- **Same request / refresh logic as the rail** (one shared code path, `renewUnit`): first request only after it has been seen (>= 50% for 1 s, window focused, agent active); renewed when the agent switches category (Scripts), checklist, **or section** (Scripts / Checklist / Links / Freeflow), only if the ad on screen was rendered > 60 s ago; the old ad stays until the new one arrives; switches while a request is unanswered are dropped; a no-fill lets the next switch ask again; the first request unfilled removes the bar and gives the row back.
- Dragging a window across 1280 px swaps rail and bar (the other one is hidden, never both).
**Sections.** `float.pages` = scripts, checklist, links, notes. **Errand-Notes is left out** (customer data on screen, same decision as for the rail); add `'errands'` to `pages` only after checking that against the client's policy.
**Check before shipping.** (1) Links and Freeflow keep their own units, so in narrow windows those two pages now show two ads (the strip / bar plus the floating bar). If you want only the floating bar there, set `ads.notes.bar:false` and `slots.links:''`. (2) The bar reuses the `rail` / `banner` unit ID until `slots.float` is filled; create a dedicated unit to get its own report line.
**Tested** in jsdom (stubbed ads, not a real browser, not live AdSense): wide window = rail only; narrow = one bar docked in the app grid; first request once seen; renewal rules (60 s floor, staged on top, burst dropped, new ad replaces old); section switch renews; Errand-Notes hides the bar; too-narrow content hides it; wide/narrow drag swaps rail and bar; first request unfilled removes it; short window = no bar. **Still to check by eye:** phone portrait (320x100 above the footer, above the bottom tabs) and a 1024 px tablet (728x90).

## Round 14: FD Calculator + FR Prompt merged in, full-height skyscraper container, shared footer and ads
**Routes.** `/FDCalc` (Fare Difference Calculator) and `/FRprompt` (GDS Fare Rules AI Prompt Generator) are now folders of this repo (`FDCalc/`, `FRprompt/`), served by Netlify as `/FDCalc` and `/FRprompt` (it redirects to the trailing slash). The header **FD Calculator** button now points to `/FDCalc`; a new **FR Prompt** link sits **below Links** in the left sidebar and points to `/FRprompt`. Both open in a new tab (as FD Calculator always did), so the agent's scripts and inputs are untouched. FR Prompt is an `<a class="nav-ext">`, deliberately **not** a `.nav-item`: `script.js` binds every `.nav-item` as an in-page tab and reads its `<button>`, so a link with that class would break page switching.

**Right-hand ad container ("skyscraper").** Scripts, Checklist, Free-flow, `/FDCalc` and `/FRprompt` now share one container (`assets/js/ads.js` `mountRail` / `railLayout`, `assets/css/ads.css`):
- Its **height is the free height of the page**: from 12 px under the category bar (Scripts / Checklist; nothing above it on the other pages) down to 12 px above the footer. Measured with a ResizeObserver, so it follows window resizes. Verified at 1280x520, 1280x600, 1366x768, 1440x900 and 1920x1080: the bottom edge is always 12 px above the footer.
- **Never scrolls** (`overflow:hidden`). On Scripts and Checklist it stays in place while the cards scroll; Free-flow and the tool pages do not scroll, so it simply spans the page. A short page (FDCalc / FRprompt) gets no scrollbar from it.
- The unit inside is **one responsive unit, `data-ad-format="auto"`**, `data-full-width-responsive="false"`, as wide and as tall as the container (column = `rail.widthPx` 300 px). AdSense picks the best-paying size that fits. The box keeps its full height whatever size arrives, so nothing moves when the ad loads. The old fixed 300x600 / 300x250 sizes are gone.
- Same behaviour rules as before: first request only once seen (>= 50 % for 1 s, window focused, agent active); new ad on a category / checklist switch (60 s floor, old ad stays until the new one fills); column handed back if the first request is unfilled or the library is blocked; hidden during search results; below 1280 px wide or with less than 294 px free there is no column.
- **Free-flow:** the horizontal strip above the text area and the 20 % side column are removed; Free-flow uses the same container. `ads.notes` (bar / side) no longer exists; `slots.notesBar` is gone, `slots.notesSide` is kept (its unit is used first, then `rail`, then `banner`). Because the strip is gone and `float.pages` no longer lists `notes`, **Free-flow in a window narrower than 1280 px shows no ad**. Put `'notes'` back into `ads.float.pages` if you want the floating bar there.
- Checklist keeps its end-of-list unit (`slots.end`) as before; only its right-hand column changed.

**Shared files (one source for all three pages).**
| File | What |
|---|---|
| `assets/css/site-footer.css` + `assets/js/site-footer.js` | The ACES footer (year, Back to top, Legal pop-up under 900 px). Moved out of `aces-upgrade.css` / `app.js`; computed styles of every footer element were compared with the previous build at 5 window widths: **0 differences**. |
| `assets/css/ads.css` | All ad-slot CSS (moved out of `aces-upgrade.css`), now colour-themeable (`--ad-ink`, `--ad-line`, ...). |
| `assets/css/tools-shell.css` | The app shell of the tool pages (non-scrolling page, `.main-page` scroll area, footer row, floating-bar row, two-column grid when the ad column is on). |
| `assets/js/ads.js`, `assets/js/config.js` | One ad engine and one config for all pages. Tool pages start it with `<body data-ads-auto data-page="fdcalc|frprompt">`. New `slots.tools` (empty = use `rail`, then `banner`). `ads.rail`: `sizes` replaced by `widthPx`, `minHeightPx`, `bottomGapPx`; `pages` now also lists `notes`, `fdcalc`, `frprompt`. |

**FDCalc and FRprompt were converted to the same shell as Aces.** Both load the AdSense library once (FDCalc loaded it three times) with the `onerror` block flag, the same `preconnect`s, `tracker.js` and `ga-bridge.js` (ad events are tracked the same way; GA4 comes from the Netlify snippet as on the Scripts page), the shared footer (legal links point at the site-wide `/privacy-policy.html`, `/terms-conditions.html`, `/cookie-policy.html`, `/adsense-disclaimer.html`) and the right-hand container. Narrow windows get the floating bar, as on Aces. FDCalc's two hard-coded 160x600 units (both with the same slot ID `1292927956`) and its own footer were removed; FDCalc's `script.js` is unchanged. FRprompt was split from one file into `index.html`, `styles.css`, `script.js` (code unchanged; same input gives a byte-identical prompt); its toast moved to bottom-left above the footer so it never covers the ad; under 768 px its two cards stack and the page scrolls. `ads.txt` is identical to FDCalc's, so there is nothing to merge.

**Check before shipping.**
1. **Responsive units.** `data-ad-format="auto"` only works on a *responsive* display unit. `rail`, `tools` and `banner` fall back to `5267623137`, which was already serving this slot, but confirm in AdSense that it (and `6965605774` for Free-flow) are responsive; if one was created as a fixed size, create a responsive unit and paste it into `slots.rail` / `slots.notesSide` / `slots.tools`. The old FDCalc unit `1292927956` is a fixed 160x600; it is not used. A dedicated unit per area also gives separate report lines.
2. **What "auto" delivers.** The container is reserved at full height, but AdSense chooses the creative: it may serve a 300x250 in a 584 px box. That is expected; the box does not shrink or move.
3. **Left ad column of FDCalc dropped.** FDCalc had a left and a right skyscraper; it now has one right-hand container like every other page.
4. **Old FDCalc legal pages** (`privacy-policy.html`, `terms-and-condition.html` from FDCalc-main) are not in this repo: the shared footer links to the site-wide ones. They are still in the FDCalc repo if you want them.
5. `FDCalc/index.html` has a few duplicate element IDs from the original (`Penaltysummary`, `Servicefeesummary` each used twice); left as they were because `script.js` looks them up.
6. Round 13's text above about `float.pages` including `notes` and `ads.notes.bar:false` is superseded by this round.

**Tested** in headless Chromium with a stubbed AdSense script (real layout, **not** live AdSense): rail geometry on Scripts, Checklist, Free-flow, `/FDCalc`, `/FRprompt` at 5 window sizes; stays put while scrolling; window resize wide -> narrow -> wide swaps rail and floating bar; unfilled first request hands the column back; search hides it and clearing restores it; a category switch requests a fresh unit and removes the old one once the new one fills; every sidebar page still switches; the FR Prompt link opens `/FRprompt`; FD Calculator link is `/FDCalc`; phone bottom bar keeps its 60 px height with six tabs; FDCalc calculates and FRprompt generates; no console errors or failed requests on any page.


## Round 15: ad fill, request timing, container fit, empty-container recovery (policy-checked)
*Parts of this round are superseded by Round 16 below: the "container fit" logic (#4) is replaced by fixed skyscraper sizes, and Free-flow (#8) no longer gets the bottom bar.*
Touched: `assets/js/ads.js`, `assets/js/config.js`, `assets/css/ads.css`. Nothing else (data, cards, layout, tabs, footer, FDCalc / FRprompt markup are unchanged).

**What changed**
| # | Change | Effect (headless Chromium, stub AdSense, 1440x900) |
|---|---|---|
| 1 | Sticky units (rail, floating bar) need **250 ms** on screen before the first request (was 1000 ms); gate tick 200 ms (was 400) | First request **0.63-0.73 s** after navigation (old build: 1.47-2.22 s) |
| 2 | The **first** ad of a page view needs a visible tab, not a focused window (`gate.requireFocusFirst:false`). Renewals still need focus + an active agent | A split-screen window that is visible but not clicked into now loads its page-load ad |
| 3 | A box with **no width** waits instead of calling `push` (AdSense throws "availableWidth=0" and the container stays empty for nothing) | No request in any test was made with width < 40 px |
| 4 | **Container fit** (`ads.fit`): the rail / Checklist end unit shrinks or grows to the creative that arrived; re-measured after load | 300x250 creative: container **289 px** (old: 716 px, 466 px of empty frame). 300x600: 639 px. Swap 250 -> 600 refits |
| 5 | **Empty-container recovery** (`ads.retryEmpty`): a first request with no ad hands the column back (no blank space) but no longer kills the container for the visit. The next explicit user action brings it back and asks again: max **3** retries per page view, >= 15 s apart, under the 6/min cap | Tested: no-fill, then category click = column back and filled; always-no-fill = exactly 4 requests for 8 clicks; nothing on a timer |
| 6 | **Renewal floor 30 s** (`rail.renewMinSec`, was 60) | See the policy note below |
| 7 | More **explicit user actions** may request a new ad (`ads.actions`): All/Chat/Voice filter change and search cleared are on; Free-flow template and FR Prompt "Generate" exist but are **off** (gray area) | Tested on/off |
| 8 | Floating bar also on **Free-flow** in windows < 1280 px (it had no ad there) | Tested at 1024 px |
| 9 | `giveUpMs` 8 s -> 12 s | A slow office network no longer loses a late answer |
| 10 | Bug fix: an unfilled replacement waiting on top of the visible ad **no longer swallows clicks** meant for that ad (`pointer-events:none` until it fills) | Tested with `elementFromPoint` |

**Policy basis (re-read 13 Oct 2026).** AdSense > Ad placement policies: "Publishers aren't permitted to refresh a page or an element of a page without the user requesting a refresh. This includes placing ads on pages or in placements that auto-redirect or auto-refresh." So every request here is either the first one of a page view or follows an explicit user action that replaces the content beside the ad. AdSense publishes **no minimum interval** for user-requested ads; 30 s is the lowest interval Google publishes anywhere (Ad Manager, time-based refresh), so it is the floor, not an AdSense-given number. Do not go lower, and raise it (45-60) if Policy center ever flags request frequency.

**Asked for, not done as asked, and the workaround**
| Request | Why not | Workaround built / suggested |
|---|---|---|
| "Aggressive" fill requests for unfilled containers (repeat until filled) | Re-requesting on a loop or a timer is a refresh the user did not request; also invalid-traffic risk | Event-driven retries (#5), capped. Real no-fill is usually demand, blocker, geography or low traffic quality: see Reports > By ad unit, "ad requests vs impressions" |
| New request on every agent action (typing, copy, scroll, tab focus, resize) | None of these is a user asking for new content | Only content-replacing actions (#7). Copy / typing / focus can never trigger; `AcesAds.action()` only accepts the kinds in `ads.actions` |
| Free-flow template / FR Prompt Generate as ad triggers | Judgement call: the user did ask for new output, but the ad is not part of it | Off by default. Turn on (`actions.template` / `actions.generate: true`) only after a clean week in Policy center |
| Overlay containers over content | Custom ads laid over content / controls are the accidental-click and "covers content" risk; the app has click-to-copy cards and a fixed shell | The docked rail and the docked bar are the compliant equivalent: always on screen (viewability) but never over content. For true Google-managed overlays (anchor / vignette) use an Auto ads test on a **separate copy** of the site, not this one (see Round 9) |
| Stack more units to "fully occupy" a tall column | Ad density beyond content, esp. on the tool pages | Container now hugs the creative (#4). The remaining column is empty page space, not ad space |
| In-feed units back on Scripts | Round 10 decision: ads next to click-to-copy cards | Unchanged |
| Errand-Notes | Customer data on screen | Stays ad-free |

**Account side (code cannot do these)**: `slots.rail`, `slots.float`, `slots.tools` are still empty and fall back to `banner` (5267623137): create dedicated **responsive** display units so each placement has its own report line and `data-ad-format="auto"` is valid. ads.txt must read "Authorized". Keep Auto ads off for this site. Never click your own ads when testing.

**Tested** in headless Chromium with a stubbed AdSense script (24 behaviour checks + geometry at 1920x1080, 1366x768, 1280x720, 1024x768, 390x800; `/FDCalc`, `/FRprompt`; zero page errors). **Not tested** against live AdSense or a live Netlify deploy: real responsive units may return other sizes or answer slower; the fit logic reads the creative's iframe, so check on the live site that a 300x250 / 300x600 sits snugly, and compare Active View viewable / impressions per page view / RPM for a week.


## Round 16: skyscraper on the right only (Free-flow, Checklist), no bottom ads there, Free-flow layout lock
Touched: `assets/js/ads.js`, `assets/js/config.js`, `assets/css/ads.css`, `assets/css/aces-upgrade.css` (one grid line). No data, card, tab or footer change.

**Asked:** fix Free-flow notes (text area collapsed to a sliver, ads at the bottom); ads there must be the right-hand skyscraper; remove the Checklist ad at the bottom; always the right-hand skyscraper.

**Done**
| # | Change | Where |
|---|---|---|
| 1 | **Checklist end-of-list (bottom) unit removed**: code, CSS, `slots.end` (unit `7813895425` is now unused), `endPages`, `ads.end`. Checklist = right-hand skyscraper only | `ads.js`, `config.js`, `ads.css` |
| 2 | **No bottom bar on Free-flow or Checklist** (`ads.float.pages` no longer lists `notes` / `checklist`). The Free-flow bar was added in Round 15; it is gone | `config.js` |
| 3 | **Skyscraper stays on the right in narrower windows**: Free-flow and Checklist get the column from **1000 px** wide (`rail.minViewportWByPage`; Scripts and the tool pages keep 1280). Below 1000 px those two pages have **no ad** (never a bottom one) | `config.js`, `ads.js` (`railMinW`) |
| 4 | **Fixed skyscraper sizes** (`rail.sizes`: **300x600**, else **300x250**), picked from the free height of the page (first that fits, plus 40 px frame). The container is exactly the size of the ad: nothing clipped, nothing taller than the page, nothing moves on load. This replaces the Round 14 "auto" unit and the Round 15 fit logic (an auto unit could return a 600 px creative into a 400 px box and clip it; Google asks that ads are not cut off) | `ads.js` (`pickRailSize`), `ads.css` |
| 5 | **Free-flow layout lock**: the grid has one row of exactly the free height (`grid-template-rows:minmax(0,1fr)`) and the text area is stretched to it, so nothing in the ad column, or anything an ad network injects beside it, can change the text area's height | `aces-upgrade.css`, `ads.css` |
| 6 | **Late mount**: if the first measurement of a page is taken before it has finished laying out (seen at 1000-1024 px wide, short window: 247 px instead of 353 px) the rail is no longer abandoned; it mounts as soon as the page has room | `ads.js` (`watchLate`) |
| 7 | **Window shrinks after the ad is up**: the column is handed back (never clips the ad) and returns when there is room again, with no new request. The next explicit user action (30 s floor still applies) swaps the hidden ad for the size that fits now | `ads.js` (`refitRail`) |
| 8 | **Diagnostic for Google Auto ads**: if AdSense inserts its own containers (`.google-auto-placed`, anchor, vignette), it is logged as `ads.auto_detected` (`acesMetrics.top('ads.auto_detected')`, or GA4 `ads_auto_detected`). Nothing Google serves is hidden or moved | `ads.js` (`watchAutoAds`) |

**What the 600 px skyscraper needs.** About 644 px of free height (page height minus header, toolbars and footer). Full HD windows get 300x600. A 1366x768 laptop, or your 615 px-high screenshot, gets the 300x250 in the same right-hand column: a 600 px creative physically cannot fit there, and cropping it is not allowed. No code change can make a 600 px ad fit a 400 px box.

**About the collapsed text area in the screenshot.** I could not reproduce the sliver in a clean run (stubbed ads, 1371x615, with and without a filled ad, old and new build). The fixes above remove the ways this build could cause it (bottom bar taking height, oversize creative, a late measurement), and #5 makes the text area independent of the ad column. If it still shows, the likeliest cause is **AdSense Auto ads** (Ads > By site > Auto ads: switch OFF): Google then injects its own ad blocks into the page, and in that case `ads.auto_detected` will appear in the metrics. Also check Netlify's "Powered by Netlify" badge: it is injected by Netlify, not ACES, and sits at the bottom-right where the bottom of the skyscraper ends.

**Not changed (said so you can decide):** Scripts, Links and the tool pages still show the docked bar below 1280 px wide. If you want them skyscraper-only too, remove them from `ads.float.pages` and set `rail.minViewportWByPage` for them.

**Account side:** unit `7813895425` (old Checklist end unit) is unused: if it is a display unit you can paste it into `slots.rail` to give the skyscraper its own report line. `slots.rail` / `float` / `tools` still fall back to `banner`. The skyscraper no longer needs a *responsive* unit: it sends fixed sizes (as the floating bar already did).

**Tested** in headless Chromium with a stubbed AdSense script: 70 checks across three suites, zero page errors. Free-flow at 1920x1080, 1371x615, 1366x768, 1100x700, 1024x768, 1000x640 and 900x700; Checklist at 1440x900 and 1100x700 (also scrolled to the end); a window shrunk and re-enlarged after the ad loaded; a 300 px block injected into the Free-flow grid; renewal after a shrink; plus the Round 15 suites (empty-container recovery, actions, no-timer proof, tool pages, phone). **Not tested** against live AdSense or a live Netlify deploy.
