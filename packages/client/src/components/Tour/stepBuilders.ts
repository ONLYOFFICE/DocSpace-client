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

import { createElement, type ReactNode } from "react";
import { ACTIONS, STATUS, type Step } from "react-joyride";

import TourList from "./TourList";
import type { TourStepCallbacks } from "./useTour";
import { throughSectionFade } from "./sectionFade";
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

/** Waits for an anchor; a missing one costs its step, not the tour. */
const awaitAnchor = (
  selector: string,
  timeout: number,
  signal: AbortSignal | undefined,
  logLabel: string,
) => waitForElement(selector, timeout, signal).catch(silenceNonAbort(logLabel));

export const sidebarSelector = (id: string) => `[data-item-id="${id}"]`;

/**
 * How long a step waits for an anchor a `prepare` call reveals. Anchors that
 * were already on the page resolve on the first tick, so keep this short: the
 * user stares at a spinner for whatever it is set to.
 */
export const STEP_TARGET_TIMEOUT = 1500;

/**
 * The budget for a reveal that navigates or re-fetches. Overrunning it is not a
 * slow step but a broken one: joyride lays the step out against a target that
 * never arrived, pinning the tooltip to the corner of the screen.
 */
export const NAVIGATION_TARGET_TIMEOUT = 8000;

/** How a `revealStep` brings its target on screen, and puts it back. */
export type RevealHooks = {
  reveal: () => void;
  restore: () => void;
  /** The target arrives on a round trip, which buys it the longer budget. */
  navigates?: boolean;
  /** The reveal swaps the list, so the section is faded through it. */
  swapsList?: boolean;
  /**
   * What `reveal` reads before it can do its job — the room row the info panel
   * is opened *on*, for instance. Waited for, so a step walked back into while
   * the list is still coming back opens on it rather than on nothing.
   */
  awaitBefore?: string;
};

/**
 * `querySelector` that answers "no" to a selector it cannot parse. The step
 * list is filtered during render, so one bad selector would take the section
 * down rather than cost its own step.
 */
function match(selector: string): Element | null {
  try {
    return document.querySelector(selector);
  } catch {
    return null;
  }
}

/**
 * The widest descendant of `row` with a box of its own — in a file list, the
 * name column. Descends level by level, and only into nodes that measured
 * nothing: a row is two nested `display: contents` wrappers, so stopping at
 * the first level finds another 0x0 box.
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
 * What a step is laid out against: the match itself, or a descendant of it that
 * can be measured. A `display: contents` row reports a 0x0 rect at (0,0), and
 * joyride would park the tooltip in the corner with nothing lit up.
 */
function measurableTarget(selector: string): HTMLElement | null {
  const element = match(selector) as HTMLElement | null;
  if (!element) return null;

  const { width, height } = element.getBoundingClientRect();
  if (width > 0 && height > 0) return element;

  // A leaf that measures nothing is still a better anchor than none.
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

/** What ui-kit's `Scrollbar` actually moves when a section scrolls. */
const SCROLLER_SELECTOR = ".scroller";

/**
 * The band at the top and bottom of the scroll container that an anchor is not
 * left sitting in: closer than that and the spotlight around it is cut in half,
 * further in and it is left exactly where the user last saw it.
 */
const COMFORTABLE_MARGIN_RATIO = 0.2;

/** The box a target has to be visible inside, or the viewport when it has none. */
function scrollBounds(element: HTMLElement) {
  const container = element.closest(SCROLLER_SELECTOR);

  if (container) {
    const { top, bottom, height } = container.getBoundingClientRect();

    return { top, bottom, height };
  }

  return { top: 0, bottom: window.innerHeight, height: window.innerHeight };
}

/**
 * Brings a step's anchor on screen before joyride lays the step out. joyride's
 * own scrolling is off (`skipScroll`): it over-scrolls inside ui-kit's
 * `Scrollbar` by the container's distance from the top of the viewport, which
 * drags the anchor out through the top while the spotlight keeps drawing it.
 *
 * Synchronous on purpose: joyride measures as soon as this returns, and waiting
 * a frame would hang every step on the browser getting round to painting.
 */
export function scrollTargetIntoView(
  selector: string,
  signal?: AbortSignal,
): void {
  // The step has been left while its hook waited, so scrolling now would move
  // the page under whatever came next.
  if (signal?.aborted) return;

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
  // A step that reveals its own target cannot be judged by the page as it is;
  // `presence` stands in for it where the step named one.
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
 * A sidebar item, or the whole list around it. `prepare` runs before the target
 * is awaited and must be idempotent: a step walked back into runs it again.
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
      await awaitAnchor(selector, STEP_TARGET_TIMEOUT, signal, logLabel);
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
 * A sidebar item whose step reads as a bulleted list: the spotlight covers the
 * whole sub-list, and the body is built from already-translated lines.
 */
export function sidebarListStep(
  anchorId: string,
  title: string,
  items: string[],
  callbacks: TourStepCallbacks | undefined,
  logLabel: string,
  prepare?: () => void,
): Step {
  return navItemStep(
    sidebarSelector(anchorId),
    title,
    createElement(TourList, { items }),
    callbacks,
    logLabel,
    true,
    prepare,
  );
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
      await awaitAnchor(target, STEP_TARGET_TIMEOUT, signal, logLabel);
      scrollTargetIntoView(target, signal);
    },
  };
}

/** Id of the stand-in node that carries a multi-element spotlight rect. */
const UNION_SPOTLIGHT_ID = "tour-spotlight-union";

/**
 * An empty node covering the union of `selectors`' boxes, so a spotlight can
 * cover a run of siblings without the container they share. joyride resolves
 * `spotlightTarget` to one element and reads its rect, so the rect needs a node
 * of its own; it is recomputed on every call, because joyride re-resolves the
 * target on scroll and resize.
 */
function unionSpotlight(selectors: string[], anchorSelector: string) {
  // The fallback when nothing measurable is on the page: the whole region the
  // step is about, rather than a degenerate rect in the viewport corner.
  const anchor = match(anchorSelector) as HTMLElement | null;

  const rects = selectors
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
      // The trigger, not the menu: a dropdown floats above the scroll
      // container, so scrolling to it would drag the trigger out from under it.
      scrollTargetIntoView(triggerSelector, signal);
      if (!isOpen()) toggle();
      await awaitAnchor(menuSelector, STEP_TARGET_TIMEOUT, signal, logLabel);
    },
    after: () => {
      if (isOpen()) toggle();
      removeUnionSpotlight();
    },
  };
}

/**
 * A step whose target is brought on screen through the stores rather than by a
 * click: the info panel opened on an item, the empty screen a reload brings up.
 * The hooks come from the tour's host, the only place with the stores in hand.
 *
 * `presence` names something whose being on the page proves the step is worth
 * running — the target itself is not there when the tour starts, so the
 * start-of-run check cannot look at it.
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
    // Resolved, not handed over as a selector: a reveal can land on a row with
    // no box of its own (see `measurableTarget`).
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

      if (hooks.awaitBefore) {
        await awaitAnchor(hooks.awaitBefore, timeout, signal, logLabel);
      }

      const showTarget = async () => {
        hooks.reveal();
        await awaitAnchor(target, timeout, signal, logLabel);
        scrollTargetIntoView(target, signal);
      };

      if (hooks.swapsList) {
        await throughSectionFade(showTarget);
      } else {
        await showTarget();
      }
    },
    after: (data) => {
      // `restore` is for a step another one follows, forward or back. Ending on
      // this step leaves what the reveal did standing: the status is still
      // `running` here, so the last step has to be recognised by its index.
      const continues =
        data.action === ACTIONS.PREV || data.index + 1 < data.size;

      if (data.status === STATUS.RUNNING && continues) hooks.restore();
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
      await awaitAnchor(target, STEP_TARGET_TIMEOUT, signal, logLabel);
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
 * The first row of a file list. Both the anchor and the spotlight are resolved
 * through `measurableTarget`: in the table view the row wrapper has no box of
 * its own, and joyride reads them separately.
 */
export function fileItemStep(
  rowSelector: string,
  title: string,
  body: ReactNode,
  callbacks: TourStepCallbacks | undefined,
  logLabel: string,
  prepare?: () => void,
  // `NAVIGATION_TARGET_TIMEOUT` when `prepare` changes the route.
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
      await awaitAnchor(rowSelector, timeout, signal, logLabel);
      scrollTargetIntoView(rowSelector, signal);
    },
  };
}

// The scroll port inside the banner, named by the ui-kit component itself.
const QUICK_ACTIONS_TRACK_SELECTOR = '[data-testid="quick-actions-track"]';

/**
 * Brings a quick-action tile into the banner's scroll port: past the fold it is
 * measurable but out of sight, so joyride would spotlight bare strip.
 *
 * The track's own `scrollLeft` is moved rather than `scrollIntoView`, which
 * walks every scrollable ancestor and shifts the whole page sideways.
 */
export function revealQuickActionTile(selector: string) {
  return () => {
    const tile = document.querySelector(selector);
    const track = tile?.closest(QUICK_ACTIONS_TRACK_SELECTOR);

    if (!tile || !track) return;

    const tileBox = tile.getBoundingClientRect();
    const trackBox = track.getBoundingClientRect();

    const tileCentre = tileBox.left + tileBox.width / 2;
    const trackCentre = trackBox.left + trackBox.width / 2;

    // Assignment rather than `scrollTo`, so the jump is instant: joyride
    // measures as soon as this hook resolves and a smooth scroll cannot be
    // awaited. Out-of-range values are clamped by the browser.
    track.scrollLeft += tileCentre - trackCentre;
  };
}

/**
 * Rewind the quick-actions carousel to its first tile, for steps that spotlight
 * a group spanning the start of the strip rather than one tile.
 */
export function rewindQuickActions() {
  document
    .querySelector(QUICK_ACTIONS_TRACK_SELECTOR)
    ?.scrollTo({ left: 0, behavior: "instant" });
}
