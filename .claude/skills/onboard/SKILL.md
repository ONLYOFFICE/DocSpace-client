---
name: onboard
description: Build an interactive onboarding page (Artifact) for a large product feature — roles, states, flows and rules in plain human language, illustrated with real product screens, for non-developer readers. Invoked without arguments it offers a menu of documented areas to pick from. With `changes` after the subject it builds a release-delta page instead — what changed in the area since the last release — published as a separate artifact. With `for=external` it builds the short page for readers outside the team — what the feature gives, how to start, where it ends — as its own artifact next to the full one. Use for whole feature areas (billing, rooms, backup), never for a single control or small fix.
argument-hint: "[<feature or area>] [changes] [for=external] [.claude/rules/<rule>.md] [lang=<code>]"
---

# Onboarding page

## 0. Choosing the subject

Called with no subject, do not guess — offer a menu:

- list every file in `.claude/rules/` with a one-line gist of what it
  covers (take it from the rule's title and opening paragraph, in the
  conversation's language);
- mark which of them already have a published onboarding page (check
  the artifact gallery via the Artifact tool's `list` action) — those
  are "update" candidates rather than new pages;
- mention that an area without a rule is also possible — it just starts
  with a code survey first;
- let the user pick. **The menu must be complete** — every rule file
  appears exactly once, including areas that already have a page
  (offered as "update …") and the narrow tooling rules.
- The interactive option dialog fits at most 4 options, so use it only
  when the whole menu fits into one question. A longer menu is a
  numbered list in plain text; the user answers with a number or a
  name. Never squeeze a long menu into option dialogs and never offer a
  curated subset.

Called with a subject, skip the menu and go straight to the scope
question below.

**Then settle the scope — a whole area is not always what is wanted.**
Once the subject is fixed, ask what to cover **before doing any
research**, with the interactive option dialog:

- Options name concrete threads the area really contains, taken from
  its rule file or a quick look at the code — for billing: "the whole
  area", "how the tariff plan works", "wallet and top-ups", "add-ons
  and services". Never abstract sizes ("full version" / "short
  version").
- "The whole area" is always offered, and goes first when nothing in
  the request hints at a narrower interest.
- Skip every question the invocation or the conversation has already
  answered: a scope already named in the invocation
  (`/onboard <subject> <narrower topic>`), an explicit
  "give me a file" / "just the link" — each IS the answer. Ask only
  what is genuinely open; when nothing is, ask nothing.
- Ask every open question in ONE dialog (it takes up to four): scope,
  the profile (§0a), how the result is delivered, and in changes mode
  the comparison base (§8). Never spend two round-trips on questions.
  Language is never one of them — see §3.
- **Delivery is one of those questions**: a published Artifact (a
  private link the user shares when they choose) or a standalone HTML
  file they can attach to a message — some recipients cannot open an
  artifact link at all. "Both" is a valid answer; the artifact goes
  first as the default. §7 has the mechanics of each.
- A narrower scope changes the page, not merely its length: only the
  sections that thread needs, the same components as always, and a
  title naming the thread rather than the whole area. State in the
  reply what was deliberately left out, so the user can ask for a
  second page on the rest.

### 0a. Two profiles

The same facts serve two readers who ask different questions, so a
feature has up to two pages, each its own artifact with its own title:

| Profile    | Argument        | Reader's question                          | Size            |
|------------|-----------------|--------------------------------------------|-----------------|
| full       | (default)       | how it behaves in every state and role     | all sections    |
| external   | `for=external`  | what it gives, how to start, where it ends | about a third   |

The full profile is everything below. The **external** profile (a
reader outside the team, named by the question they bring, never by a
job title) is not the full page cut short — it answers its own question
with its own section plan:

| #  | Section                          | Component                                   |
|----|----------------------------------|---------------------------------------------|
| 01 | What it is                       | three value chips + one screen of the thing |
| 02 | The concepts the reader must own | concept cards + one schematic               |
| 03 | How to start                     | one step rail, one screen per step at most  |
| 04 | What stays usual, what is gone   | two comparison cards                        |
| 05 | What it protects and what not    | two comparison cards + a row list of limits |
| 06 | When something is lost           | one card per recovery path                  |

Whole states, per-role permissions, error texts, timers, devices and
editor internals stay on the full page. Extra language rules for the
external profile, on top of §3:

- only words that appear on screen — no internal terms (envelope,
  access record, wrapped key, hotspot);
- error and refusal strings are not quoted unless the reader will
  surely meet them (a lost passphrase);
- at most one screenshot per section; the start rail may carry one
  per step;
- the facts are the full page's facts from the same rule: the short
  page simplifies the wording, never the truth ("nobody can restore the
  phrase" stays).

The profile is asked in the §0 dialog when `for=` is absent and the
request does not name the reader; the full profile goes first.

Publishes a private Artifact page that explains how a feature behaves —
for people who do not read code. The result is a stable URL the user can
share; every revision republishes to the same URL.

Before writing the page, load the `artifact-design` skill; load
`artifact-diagramming` before drawing any schematic.

## 1. Sources

- A rule file in `.claude/rules/` is the spec — when one covers the
  area, the page is a repackaging of it, not new research.
- No rule → run an Explore survey of the area first (like the one a
  rule would be written from). Offer to also distill the survey into a
  draft `.claude/rules/<area>.md` — the page and the rule come from the
  same material, and the rule keeps the next run of this skill (and
  every future session) cheap.
- Exact UI wording comes from the `en` locale files — quote strings as
  the product shows them ("Only the Payer can manage this section"),
  never retell them approximately.

## 2. Structure

- **Start from `template.html` next to this skill.** It carries the
  tokens, every component and the scripts that encode the rules below —
  copy it and fill the content. Never re-derive the CSS, never invent a
  parallel component when the template already has one for that content
  type.
- Hero: feature name, a one-sentence lead listing the questions the
  page answers, and three parallel fact chips. Never name the target
  audience on the page itself — that is meta noise; the content shows
  who it is for.
- Numbered sections (01, 02, …) with a sticky table of contents that
  scroll-highlights; the numbers repeat in the TOC.
- Section building blocks, picked per content type:
  - role/concept cards (3-up grid) for "who is who";
  - an action list with a pill-button role filter for permissions —
    **every who-may-do-what matrix renders as this component, never as
    a table** — roles are cumulative (the top role lights up everything
    below it). On
    selection, actions outside the picked role are dimmed (reduced
    opacity), never hidden: the reader keeps seeing the full list and
    what exactly the role is denied. Nothing may jump on toggle: status
    labels keep the same wording in every state (denial is the
    grey/dimmed style, never different text), and there is no
    per-selection summary line above the list — everything a role can
    or cannot do lives in the rows themselves. State is never
    color-only: a status pill also carries an aria-label ("allowed" /
    "not allowed" in the page language) for screen readers;
  - tab panels for branching flows (payment scenarios) and for state
    machines (paid / grace / unpaid), one panel per branch. Every tab
    group carries an appended "expand all" toggle: hidden panels are
    invisible to find-in-page and to printing, and the toggle lifts
    both limits (expanded panels show their tab name as a heading).
    The toggle is a text control with a dashed underline, left-aligned
    after the tabs (never pushed to the right edge, where it floats
    alone when the tabs wrap), never another pill — a pill reads as
    one more tab;
  - step rails (numbered dots + actor chips) for step-by-step flows;
  - comparison cards for two-way forks. Four cards take the `two`
    modifier (two rows of two): on three columns the fourth card drops
    alone into the next row.
  - a row list (`.pill-list`) for a flat set of facts without
    structure (limits, what is missing): one bordered item per line,
    each as wide as its text, never stretched across the column. Never a
    cloud of chips — chips wrap unpredictably and a long one reads as a
    button.

## 3. Language

- Page language: the `lang=` argument when given (a bare language code
  in the invocation, like `en`, counts as `lang=en`); otherwise the
  language the request was written in — the same rule as answering in
  chat. Never ask about it. The language of pages already in the
  gallery changes nothing — an existing page in another language is a
  translation someone requested, never a convention to follow. The one
  exception: a republish of an existing page keeps that page's language
  unless a new `lang=` says otherwise. UI strings stay verbatim in the
  product's language regardless of the page language.
- When the same feature is needed in two languages, publish two
  artifacts (one per language) rather than mixing languages on one
  page; give each a localized title so the gallery tells them apart.
- No code identifiers, getter names, file paths or route globs in the
  page text — HTTP status codes included ("401" is code; "the no-access
  error page" is behavior) — describe behavior, not implementation.
- **Observations, not assurances.** The page states what each audience
  sees and what happens on a direct link; engineering guarantees and
  their reasoning ("hiding a link is not access control") belong to the
  rules, not the page. A fact that only reassures a developer does not
  reach the page.
- **Prose is the last resort.** The page's default forms are components
  — cards, rails, diagrams, action lists, figures; running text carries
  only what no component can. A section gets at most one short intro
  paragraph; when a second paragraph accumulates, its content wants a
  component instead.
- Any enumeration of three or more facts is a component (cards, a list,
  a diagram) — never a prose paragraph. Brevity cuts words, never
  evidence: screenshots and diagrams are outside the prose budget.
- Callouts hold at most two sentences; captions at most one.
- **No instructions to the reader.** The page reports what the product
  does; it never advises the audience what to do with their own
  materials ("update your knowledge-base articles", "retest this
  area"). If a change invalidates old wording, state the rename — the
  reader draws their own conclusions.
- Editorial pass before publishing: active voice, one thought per
  sentence, no clerical phrasing ("the purchase was performed by" →
  "paid"), a single form of address throughout, parallel structure in
  chips and list items. Captions direct attention ("Payer: the buttons
  are active"), they do not describe the image.
- **No invented imagery.** Page copy names the product's own things and
  actions (wallet, card, plan, charge, schedule). A metaphor that does
  not exist in the product ("secure checkout box", "rescue path") is a
  defect, not style — when a sentence needs an image to sound finished,
  rewrite it to state the mechanism plainly.
- **No meta-labels about the text itself.** Never announce a sentence's
  genre — "in one line:", "rule of thumb:", "TL;DR:". The sentence must
  carry itself; a callout's bold lead names the subject ("Who becomes
  the payer."), never the format.
- **No coined shorthand.** Every term is either the product's own word
  or one the page has already introduced. A compressed reference a cold
  reader cannot resolve ("in the refusals") is a defect — name the
  thing: "in the messages shown when an action is refused".
- **A non-English page is written from the facts**, never by
  translating the English page sentence by sentence — literal
  translation is where calques and strained phrasing come from. Reuse
  the structure and the verbatim UI strings; write the prose anew in
  the target language.
- **Final copy pass on plain text, per language, before the first
  publish** — the copy review in §7 step 2: the scanner measures, the
  `onboard-judge` agent proposes rewrites for the clear failures, the
  user approves them, and you reread the plain text yourself — no
  layout, no images to hide behind. Rewrite
  every sentence that needs a second read, leans on a coined image, or
  reads like a translation. Only then publish.
- **Never embellish behavior.** Describe exactly what the mechanism
  does and nothing more: a `mailto:` link "opens the mail client with
  the address prefilled" — not "opens a ready letter".
- Every behavioral claim on the page must be backed by the rule, the
  code or a verbatim UI string.
- Unverified behavior: verify it, or write the weaker statement that is
  certainly true.
- Plain wording may simplify — it may never upgrade what the product
  does.

## 4. Screenshots

- First source: E2E baselines in
  `packages/client/__tests__/screenshots/**` — free, current, already
  split by role and state.
- Missing states are captured on demand: a throwaway Playwright spec in
  `packages/client/__tests__/` against the local test build
  (`pnpm test:build` once, mocks can fake any tariff/role), saving
  `page.screenshot` PNGs into the scratchpad. Name it
  `onboard-shots.tmp.spec.ts` so it cannot be mistaken for a real
  suite; it contains no assertions — it only captures screens. Delete
  it right after the run and confirm with `git status` that nothing is
  left behind — it must never be committed. Tell the user up front that
  a temporary capture script will appear and vanish.
- Look at every captured PNG (Read it) before embedding — never publish
  an unseen image.
- Embed images with `embed-images.mjs` next to this skill
  (`node .claude/skills/onboard/embed-images.mjs <src> <out> key=path…`)
  — it replaces the `@@IMG:key@@` markers and refuses oversized images.
  Never paste base64 into the file by hand.
- **Quantize every screenshot before embedding**
  (`python3 .claude/skills/onboard/quantize-png.py <files>`; 256-color
  PNG, no dither — visually lossless for flat product UI) and keep each
  embedded image under 50KB. Oversized data URIs have rendered as blank
  boxes in the artifact viewer while the same HTML was fine in a plain
  browser — the embed script's cap is the guard, do not raise it to
  squeeze an image through.
- **Visually distinct states are shown, not listed.** When enumerated
  cases each have their own screen (a special tariff page, a
  sales-request block, a non-profit variant), they render as tabs or
  framed shots — take the baseline, or capture the state per this
  section. A text list of states that look different is a coverage
  gap, not brevity.
- Frame each screenshot with a browser-chrome bar naming the route, and
  a caption that says what to notice. The zoom badge sits in the bar,
  never over the screenshot.
- **Never above real size.** A raster screenshot stretched past 1:1 only
  blurs; the frame keeps the column width and a small shot sits centered
  on the ground tone inside it, a crop is capped at its own width. A
  shot too small for its row is recaptured larger, not scaled up.
  `ux-check.cjs` fails the publish on a stretched shot. (Tried and
  rejected on 2026-11-24: full-width stretching, soft; a frame shrunk to
  the shot, uneven rows.)
- **Crop to the content.** A full-page capture of a list with one row or
  of an empty state is mostly blank canvas; cut it below the last
  element (a `.crop` with its own `--ch`). The check flags a shot that
  is more than half flat rows.
- **Pairs share one height.** Frames of a pair sit in one subgrid row
  and captions in the next, so a two-line caption cannot shorten its
  frame: frames end level, the shorter shot is centered, captions start
  on one line. When the heights differ by more than half (a dialog next
  to a toast) the check flags the pair; give each its own row or
  recapture to similar heights.
- Screenshots enlarge on click: a simple lightbox overlay (zoom-in
  cursor on the thumbnail; click or Esc closes) — inline thumbnails
  stay compact, details stay readable.
- **On desktop a screenshot shows at 0.6 of its real size or more** —
  below that, the product's ~13px interface text renders under 8px and
  a reader who only scrolls cannot read the evidence. A full-width frame
  (1440px) takes its own row; side by side, each frame is cropped to at
  most ~700 source pixels wide. The lightbox does not excuse a smaller
  inline frame. `ux-check.cjs` enforces this (§7 step 3).

## 5. Schematics

- A mechanism, a branch or a lifecycle is **drawn by default** (how the
  payer appears, a renewal cycle, a fork in refusal texts) — prose
  describes it only where a diagram genuinely cannot carry it. The old
  guard still holds: if one sentence says it faster, keep the sentence.
- One visual language for every diagram on the page: card nodes,
  labeled arrows; state nodes tinted (ok / off) so status reads before
  the words do.
- Do not add a schematic next to an already-interactive block — one
  form of relief per section.
- Two related flow strips live in **one** grid, so their columns align
  row to row — separate grids resolve to different widths and read as
  sloppy.
- A schematic replaces the prose that says the same thing: fold the
  text into the section intro or the node captions instead of stacking
  a bullet card above the diagram.

## 6. Layout

- Running text wraps at the measure (`--measure`, ~70 characters a
  line); cards, panels, figures and callout boxes keep the full column —
  a callout wraps its text at the measure through its right padding, so
  no narrow box stands against wide ones. Lines of 100+ characters,
  which full-width paragraphs produced on the ~1240px shell, are hard to
  track back to the next line. Keep the shell at ~1240px: it is what
  keeps screenshots at a legible scale.
- Font sizes come only from the type-scale tokens (`--fs-label` …
  `--fs-h2`); running and secondary text never go below 16px. A new
  size is a new token, never a one-off pixel value.
- No inline styles: shared classes for panels, headings and lists, one
  spacing rhythm.
- Chips, pills and diagram nodes placed inside a card take the page
  ground tone (one surface step away from the card), never the card's
  own surface — same-on-same blends into the background in both themes.
- Stacked cards always get explicit vertical spacing (a `card + card`
  margin or a grid gap) — two grey cards must never sit flush. A card
  grid (`.roles`) counts as a card here: a diagram card followed by a
  three-card row needs the same margin. Scope
  that margin to direct section-level siblings only: inside a grid
  (comparison pairs, role cards) the gap owns the spacing, and a broad
  `card + card` selector shifts grid children out of line.
- Both themes via CSS tokens (`:root`, the guarded
  `prefers-color-scheme` block, `[data-theme="dark"]`), body background
  from a token.

## 7. Publish and iterate

**The deliverable is the published Artifact URL**, plus a standalone
HTML file when §0 said the user wants one. What is never a deliverable
is the working copy: a run that ends by pointing at the scratchpad
path, a `file://` or localhost link, or a screenshot of a local render
*instead of* delivering is a failed run. The strict sequence:

1. Author the HTML as wrapper content (no `<!doctype>`, `<html>`,
   `<head>` or `<body>` tags of your own) in the scratchpad directory,
   and embed the images with the embed script.
2. **Copy review**, on the source HTML (before embedding), per page:
   1. Keep a copy of the source as `copy-before.html`, then run
      `node .claude/skills/onboard/naturalness.mjs <src> --lang=<page language> --text=<s>/copy.txt --json=<s>/copy-before.json > <s>/copy-report.txt`.
      It reports rhythm, density, repeats, this skill's structure rules
      (callout over two sentences, caption over one, a second loose
      paragraph). It holds no word lists, so it works the same for a
      page in any language — never add one; language patterns belong in
      the judge's rubric as concepts. Numbers are compared between
      versions of one page, never across languages.
   2. Spawn the `onboard-judge` agent (`subagent_type: "onboard-judge"`;
      its file pins a model other than the author's) with the text
      path, the page language and the report path — nothing from the
      conversation. If the type is missing (agent files load at session
      start), spawn `general-purpose` with `model: "sonnet"` and tell it
      to follow the body of `.claude/agents/onboard-judge.md`.
   3. Check every severity-2 rewrite against the rule or the code — the
      judge sees only text, so a rewrite that adds a referent or shifts
      the meaning is corrected or dropped here. `rewrite: null` is a
      question about facts — answer it from the rule or the code and
      propose your own fix, or leave the sentence and say so. The
      scanner's structure issues (callout over two sentences, caption
      over one, a second loose paragraph) get proposed fixes too — they
      are this skill's rules.
   4. **Ask before applying — never skipped.** List every proposed change
      as "was → became", one line each, with the rule in brackets and a
      mark on those you corrected; below it, the severity-1 findings as
      report-only (not part of the question). Then one option dialog:
      "Apply all (recommended)" / "Let me pick" / "Don't apply". "Let me
      pick" → a follow-up multi-select when the list fits in four
      options, otherwise a numbered list the user answers with numbers.
   5. Apply what was approved: replace the quoted span in the source,
      keeping the markup around `⟦ ⟧` UI strings intact. Rerun the
      scanner with `--protect=<s>/copy-before.html
      --baseline=<s>/copy-before.json`. A nonzero exit means a UI string
      or a number changed — undo that rewrite. The reply that delivers
      the page names the numbers that moved.
3. **Silent smoke-test** — an internal check, never shown or announced
   to the user, never their preview, and **never a visible browser
   window**: drive a headless browser from a script
   (`chromium.launch()` — require the repo's own Playwright, e.g.
   `require("<repo>/packages/client/node_modules/@playwright/test")`),
   never the interactive browser tools — nothing may open on the user's
   screen. Serve the scratchpad over localhost
   (`python3 -m http.server`; `file://` is blocked in the
   test browser), open the embedded page, verify every `.frame img` has
   a nonzero `naturalWidth`, glance at one screenshot per theme
   (element screenshots read back with the Read tool), click
   the tabs and the role filter. Kill the server afterwards. This is a
   functional check only — design is judged on the published artifact
   (a local render lacks the artifact wrapper and is not how the page
   really looks).
   Then run `node .claude/skills/onboard/ux-check.cjs <embedded page>`
   (headless too; it renders desktop light and dark, 375px and 320px).
   Every "must fix" line — contrast below WCAG AA, horizontal scroll on
   a phone, a click target under 24px, a screenshot under 0.6 of its
   real size on desktop — is fixed before publishing; a nonzero exit
   blocks the publish. The report lines (line length, text runs, font
   sizes) are fixed when marked ⚠, otherwise only read.
4. The footer names the provenance in one line: the source rule (or
   "code survey"), the month and year, a scope note when the page
   narrows the area (e.g. SaaS only), and the model that assembled the
   page — the name of the model actually running the session, never one
   guessed or copied from an example or an earlier page.
5. Publish with the Artifact tool (private; the user shares the link
   when they choose) and give the user the artifact URL. Keep one page
   per feature and profile (§0a) and republish to the same URL with a
   short version `label`; never fork a second artifact for a revision.
6. Iterate with the user section by section — copy, layout and visuals
   are their calls; apply each request, rerun steps 1–4 (step 2 only
   when the copy changed), same URL.
7. **Standalone HTML file** — only when asked for one. Wrap the same
   embedded content in a complete document: `<!doctype html>`, `<html>`,
   a `<head>` carrying `<meta charset>`, `<meta name="viewport">`, the
   page's `<title>` hoisted into it and a minimal body reset — opened
   on its own the file has no artifact wrapper to supply those, and
   without them it renders broken and non-responsive. Everything else
   is already self-contained (images are data URIs, fonts degrade to
   the fallback stack), so one file works offline in any browser, keeps
   the tabs and the role filter alive, and prints to PDF through the
   print styles. Write it where the user can find and attach it (their
   Downloads folder, or a path they name) — never the scratchpad,
   never inside the repository — and open it once to confirm it renders
   before handing it over.

If the user reports blank images that the smoke test showed fine, the
fault is the artifact viewer surface, not the page: known triggers are
`loading="lazy"` on inline images (never use it) and oversized data
URIs (the embed script's cap guards this). Compare the normal artifact
view against the auto-preview surface before rewriting any HTML.

## 8. Changes mode (`<area> changes`)

The subject followed by `changes` builds a **release-delta page**: what
changed in the area between the last release and the current state
(committed and uncommitted). Everything above still applies except where
this section says otherwise.

- **Separate artifact, own URL** — never a section on the area's main
  onboarding page and never a republish of it. One changes page per
  area per release; revisions of that page republish to its own URL.
  Take the release name from the current branch (`release/v4.0.0` →
  "4.0.0"); title the page "<Area> changes in <version>".
- **Raw material comes from the collector script**, not from ad-hoc git
  spelunking:

  ```bash
  node .claude/skills/onboard/collect-changes.mjs \
    [--base master] [--locales <en-json,...>] [--key-filter <regex>] \
    [--uikit <path,...>] [--uikit-src <path>] <client pathspec>...
  ```

  Resolve the area's pathspecs from its rule file or a quick survey.
  Pass the area's `en` namespaces via `--locales`; for shared
  namespaces (`Common`) always add a `--key-filter`, or the digest
  drowns in unrelated keys.
- **ui-kit is a separate repository**, consumed here as a tarball, so
  its half of the digest comes from a clone of `docspace-ui-kit-react`
  on disk. The script finds it through
  `.claude/scripts/ui-kit/locate.mjs` (`--uikit-src`, then
  `DOCSPACE_UI_KIT_SRC`, then its gitignored `config.local.json`, then
  `../../docspace-ui-kit-react` next to this repo) and walks the same
  base ref name there — the two repositories mirror branch names. The
  digest's ui-kit section opens with the clone's path, its branch, the
  client's branch and a `status:` line; two statuses need the user, and
  both are asked with the interactive option dialog, never in prose:
  - **clone not found** — ask where the `docspace-ui-kit-react` clone
    is: "enter the path" first, "continue without ui-kit (the page will
    cover the client only)" second. Rerun with `--uikit-src <path>` and
    offer to remember it with
    `node .claude/scripts/ui-kit/locate.mjs --save <path>` (local,
    never committed).
  - **`status: MISMATCH`** — the clone sits on another release line
    than the client (`master` vs `release/v4.0.0`), so its history
    would describe the wrong release. Ask: "use the clone as it is",
    "switch the clone to <client line>", "point to another clone".
    Switch only on that explicit choice, and only when the status line
    says the clone is clean — a dirty clone is never checked out from
    under the user; say so and offer the other two options.

  The page's changes section names the clone's path and branch in its
  first line, so the reader knows which ui-kit history it reflects.
  `--uikit <path,...>` scopes the ui-kit log to folders inside the
  clone (`billing`, `components/...`).
- **The base is the state users actually run** — usually
  `origin/master` or the latest release tag, never a local `master`
  (may be years stale) and never the previous release *branch* taken on
  faith: an unreleased staging branch may already carry the next
  release's features, and diffing against it silently swallows them —
  a major change that shipped in the previous release simply never
  appears on the page. When the shipped release cannot be
  established from the repo with certainty, **ask before running the
  digest, with the interactive option dialog** — never guess silently
  and never bury the question in prose. Each option names the candidate
  ref with its version and date and states the consequence of picking
  it ("changes already shipped in X will not appear on the page"); the
  recommended candidate goes first, marked "(Recommended)". State in
  the question what limits your own knowledge (e.g. fetch unavailable,
  local refs stale). After the digest, still sanity-check: the biggest
  change the user names must show up in it — if it does not, the base
  is wrong.
- **Read the hotspot diffs.** The digest lists the most-churned files
  in both repos; read those diffs (or rerun with `--deep`) before
  clustering themes — a rewritten payment rail, a new guard, a moved
  flow rarely leaves a commit subject or a locale key behind.
- **The script gathers, the page judges.** Cluster the digest into
  human themes: new ability, changed behavior, moved/renamed with no
  behavior change, fixes. Verify every theme against the actual diff
  (`git show`/`git diff`) before writing it — commit subjects lie by
  omission. Refactors, tooling and merge plumbing do not reach the
  page.
- The page describes **old behavior → new behavior**, never commits: no
  hashes, no dates-per-item, no author names. Locale key deltas are the
  best source of exact new UI wording — quote it verbatim per §1/§3.
- Illustrations: an **added** baseline is a ready "after" shot; a
  **modified** baseline also has its "before" via
  `git show <base>:<path>`. When git has no before-image, describe the
  old state in words; building the base ref just for screenshots is
  heavy and happens only when the user asks.
- **Render a before/after pair as two frames side by side**
  (`.shots-2`): the same screen on the same route in the same state —
  the release is the only variable. Each frame's bar carries the
  version and the route ("3.8.0 · /rooms/shared/filter" /
  "4.0.0 · /rooms/shared/filter"); the captions open with parallel
  bold leads ("Before:" / "After:" in the page language) and point at
  the exact elements that moved or changed, not at the picture in
  general.
- Structure: hero states the release and the area, one numbered section
  per theme, comparison cards for before/after, the same components as
  §2 otherwise. Do **not** add a "what did not change" section by
  default: a rename that could mislead is noted inline, in the theme it
  belongs to. Offer such a section in one line after publishing and add
  it only when the user asks.
- A who-does-what section in changes mode is still the §2 permissions
  component — the pill-button role filter with dimming, never a
  filterless list; the release delta lives in each row's note ("was
  payer-only until 4.0.0"). When rights are not cumulative (an owner
  without the Payer role cannot pay), replace the cumulative map with
  an explicit per-role visibility map.
