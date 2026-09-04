/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ReactNode } from "react";
import type { Step } from "react-joyride";

import type { TourStepCallbacks } from "./useTour";
import { waitForElement } from "./waitForElement";

function isAbortError(err: unknown) {
  return err instanceof DOMException && err.name === "AbortError";
}

function silenceNonAbort(logLabel: string) {
  return (err: unknown) => {
    if (!isAbortError(err) && process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(`[${logLabel}] waitForElement failed:`, err);
    }
  };
}

export const sidebarSelector = (id: string) => `[data-item-id="${id}"]`;

/**
 * How long a step's `before` hook waits for its target.
 *
 * `useTour` filters the step list against the DOM the moment the tour starts,
 * so a step that runs at all normally has its target on screen already and the
 * wait resolves on the first tick. The budget is only there for anchors that a
 * `prepare` call reveals — keep it short, because every millisecond of it is a
 * spinner the user stares at when the element never shows up.
 */
export const STEP_TARGET_TIMEOUT = 1500;

/**
 * The budget for a step whose `reveal` navigates rather than opens something
 * already on the page. A route change is a fetch and a re-render of the whole
 * section, which does not fit in the ordinary budget — and overrunning it is
 * not a slow step but a broken one: the wait is swallowed, so joyride lays the
 * step out against a target that never arrived and pins the tooltip to the
 * corner of the screen with nothing under the spotlight.
 */
export const NAVIGATION_TARGET_TIMEOUT = 8000;

/**
 * The pair of hooks a `revealStep` uses to bring its own target on screen, and
 * to put back whatever that took.
 *
 * `navigates` marks a reveal that changes the route — see `revealStep` for why
 * that matters to the wait.
 */
export type RevealHooks = {
  reveal: () => void;
  restore: () => void;
  navigates?: boolean;
};

/**
 * `document.querySelector` that answers "no" to a selector it cannot parse
 * rather than throwing. `isStepTargetPresent` runs over the whole step list
 * during render, so a malformed selector in one step would otherwise take the
 * section down with it instead of costing that step alone. Belt-and-braces —
 * every selector the tours use today parses.
 */
function match(selector: string): Element | null {
  try {
    return document.querySelector(selector);
  } catch {
    return null;
  }
}

/**
 * The widest descendant of `row` that has a box of its own — in a file list,
 * the name column.
 *
 * Descends a level at a time and stops at the first level that measures
 * anything, so the anchor stays as close to the row as the layout allows, and
 * only walks into the nodes that measured nothing themselves. That last part is
 * the point: a file-list row is not one boxless wrapper but two nested ones —
 * the drag-and-drop wrapper carrying `folder_{id}` / `file_{id}`, and ui-kit's
 * own table row inside it, both `display: contents`. Looking a single level
 * down found only the second wrapper, which measures 0×0 exactly like the
 * first, and the step was laid out against that.
 */
function widestMeasurableDescendant(row: HTMLElement): HTMLElement | null {
  let level = Array.from(row.children) as HTMLElement[];

  while (level.length) {
    const boxless: HTMLElement[] = [];
    let best: HTMLElement | null = null;
    let bestWidth = 0;

    for (const node of level) {
      const { width } = node.getBoundingClientRect();

      if (width > 0) {
        if (width > bestWidth) {
          bestWidth = width;
          best = node;
        }
      } else {
        boxless.push(...(Array.from(node.children) as HTMLElement[]));
      }
    }

    if (best) return best;

    level = boxless;
  }

  return null;
}

/**
 * The element a step should be laid out against — `selector`'s match, or the
 * widest descendant that can be measured when that match has no box of its own.
 *
 * A file list's table row is `display: contents`, so the element carrying the
 * row's id reports a 0×0 rect at (0,0) even though its cells are on screen and
 * visible. react-joyride positions both the tooltip and the spotlight from that
 * rect, so pointing a step straight at such a row parks the tooltip in the
 * top-left corner of the viewport with nothing lit up — the row is found, it
 * just cannot be measured. The cells are the part with geometry, so the widest
 * of them (the name column) stands in for the row.
 *
 * Every step that anchors on a file-list row has to go through this, whether it
 * names the row by `data-testid` or by its `folder_{id}` / `file_{id}` id — and
 * the two name different nodes: the id sits on the drag-and-drop wrapper, one
 * boxless level above the `data-testid` row, so the search cannot stop at the
 * first level down.
 */
function measurableTarget(selector: string): HTMLElement | null {
  const element = match(selector) as HTMLElement | null;
  if (!element) return null;

  const { width, height } = element.getBoundingClientRect();
  if (width > 0 && height > 0) return element;

  // The element itself when it has no cell to stand in for it — a leaf that
  // measures nothing is no worse an anchor than nothing at all, and giving up
  // here would drop a step whose target is on the page.
  return widestMeasurableDescendant(element) ?? element;
}

/** Mirrors react-joyride's own visibility test (display/visibility chain). */
function isVisible(element: Element): boolean {
  let node: Element | null = element;

  while (node && node !== document.body) {
    if (node instanceof HTMLElement) {
      const { display, visibility } = getComputedStyle(node);
      if (display === "none" || visibility === "hidden") return false;
    }
    node = node.parentElement;
  }

  return element.isConnected;
}

/**
 * The element ui-kit's `Scrollbar` hands its content to — the node that
 * actually moves when a section scrolls (`Scrollbar.tsx`, `.scroller`).
 */
const SCROLLER_SELECTOR = ".scroller";

/**
 * The share of the scroll container's height, at the top and at the bottom,
 * that a step's anchor is not left sitting in. Mirrors the margin react-joyride
 * uses for the same judgement.
 *
 * It buys two things at once: an anchor already well inside the container is
 * left exactly where the user last saw it, because a tour that re-centres the
 * page on every step moves the ground under the reader for nothing; and an
 * anchor that is only just inside the edge is still scrolled, because the
 * spotlight around it would be cut in half by the container's edge.
 */
const COMFORTABLE_MARGIN_RATIO = 0.2;

/**
 * The box a target has to be visible inside: its scroll container, or the
 * viewport for a target that is not in one (the sidebar's own items on a narrow
 * screen, anything a section renders outside its `Scrollbar`).
 */
function scrollBounds(element: HTMLElement) {
  const container = element.closest(SCROLLER_SELECTOR);

  if (container) {
    const { top, bottom, height } = container.getBoundingClientRect();

    return { top, bottom, height };
  }

  return { top: 0, bottom: window.innerHeight, height: window.innerHeight };
}

/**
 * Bring a step's anchor on screen, before react-joyride lays the step out.
 *
 * joyride's own scrolling is switched off (`skipScroll` in `useTour`) and cannot
 * be used for these sections. For a target inside a custom scroll container it
 * derives the container's `scrollTop` from the target's *viewport* top
 * (react-joyride's `modules/dom.ts`, `getScrollTo`), which is the same number
 * only while the container's box starts at the top of the viewport. The branch
 * that measures the target against the container instead is gated on the
 * container having a non-zero `offsetTop`, and ui-kit's `Scrollbar` renders its
 * `.scroller` as `position: absolute; top: 0` inside an absolutely positioned
 * wrapper — so it is always zero here, and that branch never runs.
 *
 * What that costs is an over-scroll by exactly the container's distance from the
 * top of the viewport, so everything standing above the section (the main bar's
 * email-activation notice, a campaign banner, on a section the header and the
 * filter) is added to the scroll and drags the anchor up and out through the top
 * of the container. Nothing clips the spotlight — it is an SVG over the whole
 * page — so it goes on drawing the anchor's box where the anchor now is: over
 * the banner, with the row or card it belongs to no longer on screen.
 *
 * `scrollIntoView` sidesteps the arithmetic: the browser scrolls every ancestor
 * scroll box that needs it, the document included, and it is the same call
 * whether the section scrolls itself or the page does.
 *
 * Synchronous, and deliberately so: the scroll offsets are set by the call
 * itself, and the next `getBoundingClientRect` — joyride's, when it lays the step
 * out — reads the settled layout. Waiting a frame first was the obvious thing to
 * do and the wrong one: a frame is only produced when the browser gets round to
 * painting, so every step of every tour would hang on the machine being idle.
 */
export function scrollTargetIntoView(
  selector: string,
  signal?: AbortSignal,
): void {
  // The step has been left (walked back out of, or the tour closed) while its
  // hook was waiting for the anchor: scrolling the section now would move the
  // page under whatever came next.
  if (signal?.aborted) return;

  // Through `measurableTarget`, so a `display: contents` file-list row is
  // scrolled by the cell that has the geometry rather than by a 0x0 rect at
  // (0,0), which would read as off-screen and scroll to the top of the list.
  const element = measurableTarget(selector);

  if (!element) return;

  const rect = element.getBoundingClientRect();
  const bounds = scrollBounds(element);
  const margin = bounds.height * COMFORTABLE_MARGIN_RATIO;

  if (
    rect.top >= bounds.top + margin &&
    rect.bottom <= bounds.bottom - margin
  ) {
    return;
  }

  element.scrollIntoView({
    block: "center",
    inline: "nearest",
    // Instant, not smooth: joyride lays the step out as soon as the hook this
    // runs in resolves, and there is no reliable way to await a smooth scroll.
    // The backdrop is already up, so the jump happens under it.
    behavior: "instant",
  });
}

/**
 * Whether a step's target resolves to a visible element right now. Handles
 * both selector and resolver targets, so `useTour` can drop steps whose anchor
 * isn't on the page — an empty file list, a control this role never sees —
 * instead of stalling on them and then killing the tour.
 */
export function isStepTargetPresent(step: Step): boolean {
  // A step that reveals its own target — a menu it clicks open, a control the
  // row only shows on hover — can't be judged by how the page looks now. When
  // it names something whose mere presence proves it is worth running, that is
  // what gets checked (existence only: the target is hidden, not absent).
  if (step.data?.revealsTarget) {
    const { presence } = step.data as { presence?: string };

    return presence ? !!match(presence) : true;
  }

  const { target } = step;
  let element: Element | null = null;

  if (typeof target === "function") {
    try {
      element = target();
    } catch {
      return false;
    }
  } else if (typeof target === "string") {
    element = match(target);
  } else if (target instanceof HTMLElement) {
    element = target;
  } else if (target && "current" in target) {
    element = target.current;
  }

  return !!element && isVisible(element);
}

/**
 * Spotlight a sidebar NavMenu item (or the whole list containing it, for a
 * nested "quick access" block). Adds/removes the accent outline class.
 *
 * `prepare` runs before the target is awaited, like `elementStep`'s — a tour
 * that walked into a room needs a way to walk back out before pointing at the
 * sidebar again. It must be idempotent: a step's `before` hook runs again when
 * the user steps back into it.
 */
export function navItemStep(
  selector: string,
  title: string,
  body: ReactNode,
  callbacks: TourStepCallbacks | undefined,
  logLabel: string,
  spotlightList = false,
  prepare?: () => void,
): Step {
  return {
    target: selector,
    spotlightTarget: spotlightList
      ? () => {
          const el = document.querySelector(selector);
          return (el?.closest("ul") as HTMLElement) ?? (el as HTMLElement);
        }
      : undefined,
    spotlightPadding: 4,
    placement: "auto" as const,
    content: body,
    title,
    skipBeacon: true,
    before: async () => {
      const signal = callbacks?.getSignal();
      prepare?.();
      await waitForElement(selector, STEP_TARGET_TIMEOUT, signal).catch(
        silenceNonAbort(logLabel),
      );
      scrollTargetIntoView(selector, signal);
      if (!spotlightList) {
        document.querySelector(selector)?.classList.add("tour-outline-item");
      }
    },
    after: () => {
      document
        .querySelector(".tour-outline-item")
        ?.classList.remove("tour-outline-item");
    },
  };
}

/**
 * Spotlight an arbitrary element by CSS selector (filter controls, banners).
 *
 * `prepare` runs before the target is awaited — use it when the target only
 * becomes visible after some UI is revealed (e.g. expanding a collapsed
 * banner). It must be idempotent: a step's `before` hook may run again when
 * the user steps back.
 */
export function elementStep(
  target: string,
  title: string,
  body: ReactNode,
  callbacks: TourStepCallbacks | undefined,
  logLabel: string,
  spotlightPadding = 6,
  prepare?: () => void,
): Step {
  return {
    target,
    spotlightPadding,
    placement: "auto" as const,
    content: body,
    title,
    skipBeacon: true,
    before: async () => {
      const signal = callbacks?.getSignal();
      prepare?.();
      await waitForElement(target, STEP_TARGET_TIMEOUT, signal).catch(
        silenceNonAbort(logLabel),
      );
      scrollTargetIntoView(target, signal);
    },
  };
}

/** Id of the stand-in node that carries a multi-element spotlight rect. */
const UNION_SPOTLIGHT_ID = "tour-spotlight-union";

/**
 * An empty node covering the union of `selectors`' boxes, so a spotlight can
 * cover a run of siblings — the four create tiles — without lighting up the
 * whole container they share with something the tour highlights separately.
 * react-joyride resolves `spotlightTarget` down to one element and reads its
 * rect, so the rect has to belong to a real node.
 *
 * Positioned `fixed`, which is both what `getBoundingClientRect` measures and
 * what joyride's own fixed-target path expects. Recomputed on every call:
 * joyride re-resolves the target on scroll and resize.
 *
 * Falls back to the anchor when nothing measurable is on the page, so a
 * degenerate rect never sends the spotlight to the viewport corner.
 */
function unionSpotlight(selectors: string[], anchorSelector: string) {
  // The last-resort fallback stays the anchor element itself: it is the whole
  // region the step is about, and descending into a child of it would narrow
  // the spotlight rather than widen it.
  const anchor = match(anchorSelector) as HTMLElement | null;

  const rects = selectors
    // Through `measurableTarget`, so a member that is a `display: contents`
    // file-list row contributes its cells' box rather than a 0×0 rect the
    // filter below would drop.
    .map((selector) => measurableTarget(selector))
    .filter((element): element is HTMLElement => !!element && isVisible(element))
    .map((element) => element.getBoundingClientRect())
    .filter((rect) => rect.width > 0 && rect.height > 0);

  if (!rects.length) return anchor;

  const top = Math.min(...rects.map((rect) => rect.top));
  const left = Math.min(...rects.map((rect) => rect.left));
  const height = Math.max(...rects.map((rect) => rect.bottom)) - top;
  const width = Math.max(...rects.map((rect) => rect.right)) - left;

  let node = document.getElementById(UNION_SPOTLIGHT_ID);

  if (!node) {
    node = document.createElement("div");
    node.id = UNION_SPOTLIGHT_ID;
    node.setAttribute("aria-hidden", "true");
    node.style.position = "fixed";
    node.style.pointerEvents = "none";
    document.body.appendChild(node);
  }

  node.style.top = `${top}px`;
  node.style.left = `${left}px`;
  node.style.width = `${width}px`;
  node.style.height = `${height}px`;

  return node;
}

/** Drops the stand-in node once its step is done with it. */
export function removeUnionSpotlight() {
  document.getElementById(UNION_SPOTLIGHT_ID)?.remove();
}

/**
 * Like `elementStep`, but the spotlight covers only the `members` inside the
 * target. The tooltip still anchors on `target`, so a group of siblings can be
 * highlighted without the container around them.
 */
export function elementGroupStep(
  target: string,
  members: string[],
  title: string,
  body: ReactNode,
  callbacks: TourStepCallbacks | undefined,
  logLabel: string,
  spotlightPadding = 6,
  prepare?: () => void,
): Step {
  return {
    ...elementStep(
      target,
      title,
      body,
      callbacks,
      logLabel,
      spotlightPadding,
      prepare,
    ),
    spotlightTarget: () => unionSpotlight(members, target),
    after: removeUnionSpotlight,
  };
}

/**
 * Spotlight a menu the step opens itself: `before` clicks the trigger, `after`
 * clicks it again to put the menu away.
 *
 * Both hooks check whether the menu is up first. The trigger toggles, and a
 * step's hooks run again when the user walks back through the tour — a blind
 * second click would close the very menu the step is about to spotlight.
 */
export function menuStep(
  triggerSelector: string,
  menuSelector: string,
  title: string,
  body: ReactNode,
  callbacks: TourStepCallbacks | undefined,
  logLabel: string,
  // Extra selectors the spotlight takes in alongside the menu — pass the button
  // that opens it to light up the pair as one region.
  spotlightWith: string[] = [],
  spotlightPadding = 4,
): Step {
  const isOpen = () => !!document.querySelector(menuSelector);
  const toggle = () =>
    document.querySelector<HTMLElement>(triggerSelector)?.click();

  return {
    target: menuSelector,
    spotlightTarget: spotlightWith.length
      ? () => unionSpotlight([menuSelector, ...spotlightWith], menuSelector)
      : undefined,
    spotlightPadding,
    placement: "auto" as const,
    content: body,
    title,
    skipBeacon: true,
    // The menu only exists while this step runs, so the start-of-run DOM check
    // has to leave it alone (see `isStepTargetPresent`).
    data: { revealsTarget: true },
    before: async () => {
      const signal = callbacks?.getSignal();
      // The trigger is what gets scrolled into view, not the menu, and it is
      // scrolled before the menu is opened.
      //
      // A dropdown is positioned against its trigger and floats above the scroll
      // container rather than inside it, so scrolling to the menu itself either
      // does nothing (it is already wherever the trigger put it) or drags the
      // trigger out from under it. Centring the trigger keeps the pair together,
      // and the menu opens on screen because the thing it hangs off is.
      scrollTargetIntoView(triggerSelector, signal);
      if (!isOpen()) toggle();
      await waitForElement(menuSelector, STEP_TARGET_TIMEOUT, signal).catch(
        silenceNonAbort(logLabel),
      );
    },
    after: () => {
      if (isOpen()) toggle();
      removeUnionSpotlight();
    },
  };
}

/**
 * Spotlight something the step brings on screen itself through the stores
 * rather than through the DOM — the info panel is opened by selecting an item
 * and switching a tab, an empty screen is brought back by reloading a section.
 * Neither is a click on a single element the way `menuStep`'s trigger is.
 *
 * `reveal`/`restore` come from the tour's host component, which is the only
 * place with the stores in hand. `restore` has to put back whatever `reveal`
 * changed, because the user can walk back out of the step as easily as
 * forward; pass a no-op when the step is meant to leave its change standing.
 *
 * `presence` names an element whose being on the page proves the step is worth
 * running at all (a room row, for a panel that describes a room) — the target
 * itself is not on screen when the tour starts, so it cannot be the thing
 * checked. Leave it out for a step that is always worth running.
 *
 * `hooks.navigates` says the reveal is a route change rather than something
 * opened on the page already, which buys the target a much longer wait. It sits
 * on the hooks rather than in a parameter of its own because it is a fact about
 * the reveal, and the alternative is every caller passing a run of `undefined`s
 * to reach a trailing argument.
 */
export function revealStep(
  target: string,
  title: string,
  body: ReactNode,
  callbacks: TourStepCallbacks | undefined,
  logLabel: string,
  hooks: RevealHooks,
  // Extra selectors the spotlight takes in alongside the panel — pass the row
  // the panel is describing to light up the pair as one region.
  spotlightWith: string[] = [],
  presence?: string,
  spotlightPadding = 4,
): Step {
  const timeout = hooks.navigates
    ? NAVIGATION_TARGET_TIMEOUT
    : STEP_TARGET_TIMEOUT;

  return {
    // Resolved rather than handed over as a selector: a reveal can land on a
    // file-list row, whose wrapper is `display: contents` and has no box for
    // joyride to lay the tooltip against (see `measurableTarget`). An ordinary
    // element comes back from it untouched.
    target: () => measurableTarget(target),
    spotlightTarget: spotlightWith.length
      ? () => unionSpotlight([target, ...spotlightWith], target)
      : () => measurableTarget(target),
    spotlightPadding,
    placement: "auto" as const,
    content: body,
    title,
    skipBeacon: true,
    // The panel is only up while this step runs, so the start-of-run DOM check
    // has to look at `presence` instead (see `isStepTargetPresent`).
    data: { revealsTarget: true, presence },
    before: async () => {
      const signal = callbacks?.getSignal();
      hooks.reveal();
      await waitForElement(target, timeout, signal).catch(
        silenceNonAbort(logLabel),
      );
      scrollTargetIntoView(target, signal);
    },
    after: () => {
      hooks.restore();
      removeUnionSpotlight();
    },
  };
}

/**
 * The class that stands in for a pointer the tour cannot fake, paired with the
 * rule in TourTooltip.module.scss.
 */
const REVEAL_CLASS = "tour-reveal-hidden-control";

/**
 * Spotlight a control a row only shows while the pointer is over it — ui-kit's
 * table row keeps the "share" button at `display: none` outside `:hover`, and
 * `:hover` cannot be simulated from script. The step marks the control instead,
 * and the paired CSS rule reveals it for as long as the step is up.
 */
export function hoverRevealStep(
  target: string,
  title: string,
  body: ReactNode,
  callbacks: TourStepCallbacks | undefined,
  logLabel: string,
  spotlightPadding = 4,
): Step {
  return {
    target,
    spotlightPadding,
    placement: "auto" as const,
    content: body,
    title,
    skipBeacon: true,
    // Hidden rather than absent: the DOM check has to look for it, not at it.
    data: { revealsTarget: true, presence: target },
    before: async () => {
      const signal = callbacks?.getSignal();
      document.querySelector(target)?.classList.add(REVEAL_CLASS);
      await waitForElement(target, STEP_TARGET_TIMEOUT, signal).catch(
        silenceNonAbort(logLabel),
      );
      scrollTargetIntoView(target, signal);
    },
    after: () => {
      removeRevealedControl();
    },
  };
}

/** Puts a control revealed by `hoverRevealStep` back the way it was. */
export function removeRevealedControl() {
  document.querySelector(`.${REVEAL_CLASS}`)?.classList.remove(REVEAL_CLASS);
}

/**
 * Spotlight the first item of a file list.
 *
 * `rowSelector` must match the row wrapper. In the table view that wrapper is
 * `display: contents` (see the callers' notes), so it has no geometry of its
 * own: both the spotlight and the tooltip's anchor fall back to the row's
 * widest cell (the file-name column). react-joyride anchors the tooltip on
 * `target`, not on `spotlightTarget`, so both have to be resolved — otherwise
 * the tooltip floats at the viewport corner. In the row/tile views the wrapper
 * is a normal box and is used as-is.
 */
export function fileItemStep(
  rowSelector: string,
  title: string,
  body: ReactNode,
  callbacks: TourStepCallbacks | undefined,
  logLabel: string,
  // Same contract as `elementStep`'s: runs before the row is awaited, and has
  // to be idempotent.
  prepare?: () => void,
  // As on `revealStep`: pass `NAVIGATION_TARGET_TIMEOUT` when `prepare` changes
  // the route, so the list has time to come back before the row is given up on.
  timeout = STEP_TARGET_TIMEOUT,
): Step {
  const resolve = () => measurableTarget(rowSelector);

  return {
    target: resolve,
    spotlightTarget: resolve,
    spotlightPadding: 4,
    placement: "auto" as const,
    content: body,
    title,
    skipBeacon: true,
    before: async () => {
      const signal = callbacks?.getSignal();
      prepare?.();
      await waitForElement(rowSelector, timeout, signal).catch(
        silenceNonAbort(logLabel),
      );
      scrollTargetIntoView(rowSelector, signal);
    },
  };
}

const QUICK_ACTIONS_SELECTOR = '[data-testid="quick-actions"]';

/**
 * Bring a quick-action tile into the banner's scroll port.
 *
 * The banner is a carousel, so a tile past the fold is mounted and measurable
 * but scrolled out of sight — joyride would spotlight an empty patch of the
 * strip. `block: "nearest"` keeps this to the horizontal axis: the vertical
 * position is `scrollTargetIntoView`'s job, and moving both here would fight it.
 *
 * Instant rather than smooth, for the same reason as `scrollTargetIntoView`:
 * joyride measures as soon as the hook resolves, and a smooth scroll cannot be
 * awaited.
 */
export function revealQuickActionTile(selector: string) {
  return () => {
    const tile = document.querySelector(selector);

    tile?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "instant",
    });
  };
}

/**
 * Rewind the quick-actions carousel to its first tile, for steps that spotlight
 * a group spanning the start of the strip rather than one tile.
 */
export function rewindQuickActions() {
  const track = document.querySelector(QUICK_ACTIONS_SELECTOR)
    ?.firstElementChild;

  track?.scrollTo({ left: 0, behavior: "instant" });
}
