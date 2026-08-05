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
