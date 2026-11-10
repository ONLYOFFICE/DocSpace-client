---
paths:
  - "**/*.scss"
  - "**/*.css"
  - "common/tests/test/css-selectors*"
---

# Selectors that restyle the whole page

A selector is not only what it matches but what the browser has to recheck when
the DOM changes. Chromium keeps, for every selector, the features that can
change its result - a class, an id, an attribute name - and on each mutation
restyles only the elements that carry one. Two kinds of selector defeat that,
and both have cost these screens real frame time.

## Never match on the `class` or `style` attribute

`[class*="buttonsContainer"]`, `[class^="icon"]`, `[class="x"]`,
`[style*="display: none"]` - any operator. The feature the browser keeps for
them is the attribute *name*, and every element with a class has that
attribute, so a change that touches the rule marks every one of them for a
restyle.

- `.headerContainer:has(.projectChatToolbar) [class*="buttonsContainer"]` in
  `packages/shared/styles/SectionHeader.module.scss` restyled the whole table
  on each row a scrolled list mounted: about 900 elements a time, 0.8 s of style
  work over one scroll of the API keys list, and most of a frame on Files,
  Rooms and People. Matching ui-kit's `navigation-buttons-container` instead
  took it to 0.16 s.
- ui-kit's `Section` had `:has(.chat-container:not([style*="display: none"]))`,
  which re-ran on every inline-style write in a section - a column drag writes
  one per frame.

They are fragile as well: `[class*="Navigation_box"]` reaches into a ui-kit
CSS module's generated name, which a ui-kit rename or build setting changes
with nothing failing here.

**What to do instead.** Match a class the element has on purpose. An element
of this repository: give it one. An element of ui-kit: use the plain global
class it carries (`navigation-buttons-container`, `navigation_button`,
`table-container_row`, ...), and when there is none, add one in ui-kit and
name it in the component's README rather than matching the module name. State a stylesheet has
to read goes in a class or a `data-*` attribute, not in an inline style.

## `:has()` re-runs on every change below its subject

A `:has()` is re-evaluated whenever anything inside the element it is attached
to changes in a way its argument could see, and whatever follows it in the
selector is then restyled.

- Attach it to the smallest element that answers the question, not to a page
  container or a scroller: under a scroller, every row a virtual list mounts
  counts as a change.
- After the `)`, match classes only. `:has(...) [class*=...]` and
  `:has(...) *` turn each of those re-runs into a restyle of everything below.
- A `:has()` that reads a pseudo-class that flips often (`:hover`,
  `:focus-visible`) on a large subtree re-runs on every pointer move or focus
  change; keep its subject small.

## How this is checked

`common/tests/test/css-selectors.test.js` (pre-push, `npm --prefix
./common/tests run test:css-selectors` on its own) fails on a selector on
`class` or `style` in any `.scss`/`.css` of the workspaces, comments aside.
`css-selectors-allowlist.json` beside it maps the files that still do it to
how many lines each; it only shrinks. Most of today's entries are SDK layouts
matching ui-kit module names (`Navigation_box`, `Navigation_text`) - each one
goes once ui-kit gives that element a class of its own. The same check runs in
ui-kit as `pnpm check:css-selectors`.

`:has()` is not checked mechanically - whether one is cheap depends on where
its subject sits in the page. Review it by the rules above.

## How to find one

Measure before and after, on the stand:

- a Chromium trace with
  `disabled-by-default-devtools.timeline.invalidationTracking`: a long
  `UpdateLayoutTree` whose `elementCount` is the size of a whole table or page,
  scheduled by a `has` or `class` invalidation, is this problem;
- or delete candidate rules from `document.styleSheets` in the page and compare
  `RecalcStyleDuration` (CDP `Performance.getMetrics`) over the same
  interaction. Halving the candidates finds the one rule quickly.
