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

import type { Step } from "react-joyride";

import type { TourStepCallbacks } from "./useTour";
import { waitForElement } from "./waitForElement";
import { stepContent, type StepBody } from "./stepContent";

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

    return presence ? !!document.querySelector(presence) : true;
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
    element = document.querySelector(target);
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
 */
export function navItemStep(
  selector: string,
  title: string,
  body: StepBody,
  callbacks: TourStepCallbacks | undefined,
  logLabel: string,
  spotlightList = false,
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
    content: stepContent(body),
    title,
    skipBeacon: true,
    before: async () => {
      const signal = callbacks?.getSignal();
      await waitForElement(selector, STEP_TARGET_TIMEOUT, signal).catch(
        silenceNonAbort(logLabel),
      );
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
  body: StepBody,
  callbacks: TourStepCallbacks | undefined,
  logLabel: string,
  spotlightPadding = 6,
  prepare?: () => void,
): Step {
  return {
    target,
    spotlightPadding,
    placement: "auto" as const,
    content: stepContent(body),
    title,
    skipBeacon: true,
    before: async () => {
      const signal = callbacks?.getSignal();
      prepare?.();
      await waitForElement(target, STEP_TARGET_TIMEOUT, signal).catch(
        silenceNonAbort(logLabel),
      );
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
  const anchor = document.querySelector<HTMLElement>(anchorSelector);

  const rects = selectors
    .map((selector) => document.querySelector(selector))
    .filter((element): element is Element => !!element && isVisible(element))
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
  body: StepBody,
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
  body: StepBody,
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
    content: stepContent(body),
    title,
    skipBeacon: true,
    // The menu only exists while this step runs, so the start-of-run DOM check
    // has to leave it alone (see `isStepTargetPresent`).
    data: { revealsTarget: true },
    before: async () => {
      const signal = callbacks?.getSignal();
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
  body: StepBody,
  callbacks: TourStepCallbacks | undefined,
  logLabel: string,
  spotlightPadding = 4,
): Step {
  return {
    target,
    spotlightPadding,
    placement: "auto" as const,
    content: stepContent(body),
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
  body: StepBody,
  callbacks: TourStepCallbacks | undefined,
  logLabel: string,
): Step {
  const widestChild = (row: HTMLElement) => {
    const children = Array.from(row.children) as HTMLElement[];
    let best: HTMLElement | null = null;
    let bestWidth = 0;
    for (const child of children) {
      const { width } = child.getBoundingClientRect();
      if (width > bestWidth) {
        bestWidth = width;
        best = child;
      }
    }
    return best;
  };

  const resolve = () => {
    const row = document.querySelector<HTMLElement>(rowSelector);
    if (!row) return null;
    // A `display: contents` wrapper reports a zero-size rect; fall back to its
    // widest cell, which is the file-name column.
    const { width, height } = row.getBoundingClientRect();
    if (width > 0 && height > 0) return row;
    return widestChild(row);
  };

  return {
    target: resolve,
    spotlightTarget: resolve,
    spotlightPadding: 4,
    placement: "auto" as const,
    content: stepContent(body),
    title,
    skipBeacon: true,
    before: async () => {
      const signal = callbacks?.getSignal();
      await waitForElement(rowSelector, STEP_TARGET_TIMEOUT, signal).catch(
        silenceNonAbort(logLabel),
      );
    },
  };
}

/**
 * Reveal all quick-action tiles by clicking the banner's "Show more" overlay.
 * With more than four tiles the grid is clipped to the first row, so a tile in
 * the second row would be spotlighted while visually hidden. No-op when the
 * banner isn't collapsed.
 */
export function expandQuickActions() {
  const showMore = document.querySelector<HTMLButtonElement>(
    '[data-testid="quick-actions-show-more"]',
  );
  showMore?.click();
}
