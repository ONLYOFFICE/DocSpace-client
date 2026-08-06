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

"use no memo";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useJoyride, EVENTS, STATUS, ACTIONS, type Step } from "react-joyride";

import type TourStore from "SRC_DIR/store/TourStore";

import TourTooltip from "./TourTooltip";
import {
  isStepTargetPresent,
  removeRevealedControl,
  removeUnionSpotlight,
  NAVIGATION_TARGET_TIMEOUT,
} from "./stepBuilders";

export type TourStepCallbacks = {
  getSignal: () => AbortSignal | undefined;
};

/**
 * react-joyride's own caps on how long it waits for a step's `before` hook and
 * for the step's target.
 *
 * Backstops, not the normal path: the steps are filtered against the DOM at the
 * start of a run, and each `before` hook has a budget of its own
 * (`STEP_TARGET_TIMEOUT`, or `NAVIGATION_TARGET_TIMEOUT` for a step whose
 * reveal changes the route).
 *
 * Both must clear the longest of those budgets, because these caps win:
 * whichever expires first is when the step is laid out, however long the hook
 * was still prepared to wait. Set below the step budget they silently undo it —
 * the tooltip ends up positioned against a target that never arrived, which
 * parks it in the corner of the screen with nothing under the spotlight.
 */
export const JOYRIDE_TIMEOUTS = {
  beforeTimeout: NAVIGATION_TARGET_TIMEOUT + 1000,
  targetWaitTimeout: NAVIGATION_TARGET_TIMEOUT + 1000,
} as const;

/**
 * Shared react-joyride driver for the section onboarding tours. Owns the tour
 * lifecycle (a fresh AbortSignal per step, teardown, and completion on
 * end/skip/close) and returns the portal-ready <Tour/> element plus stable
 * `callbacks` a section's step builder threads into each step's `before` hook.
 *
 * `buildSteps(callbacks)` is called on every render; memoize its inputs in the
 * caller so the steps array is stable.
 */
export default function useTour(
  tourStore: TourStore,
  buildSteps: (callbacks: TourStepCallbacks) => Step[],
  isMobileView: boolean,
  logLabel: string,
) {
  const { t } = useTranslation(["Common"]);

  const stepAbortRef = useRef<AbortController | null>(null);
  const currentSignalRef = useRef<AbortSignal | undefined>(undefined);

  const freshStepSignal = () => {
    stepAbortRef.current?.abort();
    const ctrl = new AbortController();
    stepAbortRef.current = ctrl;
    currentSignalRef.current = ctrl.signal;
    return ctrl.signal;
  };

  const callbacks = useMemo<TourStepCallbacks>(
    () => ({ getSignal: () => currentSignalRef.current }),
    [],
  );

  const liveSteps = buildSteps(callbacks);

  // The step list handed to react-joyride is frozen for the length of a run.
  //
  // On the transition into `isRunning` every step is checked against the DOM
  // and the ones whose anchor isn't there are dropped — an empty file list has
  // no row to spotlight, a guest has no Trash item. Without that they would be
  // handed to joyride anyway, and each missing anchor costs a spinner while the
  // `before` hook waits it out before the step is abandoned.
  //
  // Freezing matters as much as filtering: the flags feeding `buildSteps` keep
  // changing while the tour runs (the list finishes loading, the view switches),
  // and a step list that grows or shrinks mid-run shifts joyride's index, which
  // lands the user on a different step than the one they clicked Next for.
  const stepsRef = useRef<Step[]>(liveSteps);
  const wasRunningRef = useRef(false);

  if (tourStore.isRunning !== wasRunningRef.current) {
    wasRunningRef.current = tourStore.isRunning;
    stepsRef.current = tourStore.isRunning
      ? liveSteps.filter(isStepTargetPresent)
      : liveSteps;
  } else if (!tourStore.isRunning) {
    stepsRef.current = liveSteps;
  }

  const steps = stepsRef.current;

  const { controls, on, state, Tour } = useJoyride({
    continuous: true,
    steps,
    run: isMobileView ? false : tourStore.isRunning,
    scrollToFirstStep: false,
    tooltipComponent: TourTooltip,
    // The tooltip reads as a free-floating card, so it carries no arrow toward
    // its anchor — the spotlight is what ties it to the target.
    floatingOptions: { hideArrow: true },
    options: {
      overlayColor: "rgba(0, 0, 0, 0.5)",
      // A click on the backdrop does nothing: the tour is a few steps long and
      // losing it to a stray click beside the tooltip is worse than having to
      // aim for the close button. Esc still ends it (`dismissKeyAction`).
      overlayClickAction: false,
      blockTargetInteraction: true,
      skipScroll: true,
      zIndex: 10000,
      ...JOYRIDE_TIMEOUTS,
    },
    locale: {
      back: t("Common:Back"),
      close: t("Common:CloseButton"),
      last: t("Common:Done"),
      next: t("Common:Next"),
    },
  });

  useEffect(() => {
    if (isMobileView && tourStore.isRunning) {
      tourStore.completeTour();
    }
  }, [isMobileView, tourStore]);

  // Keyboard walking: the arrows step back and forth, which is what a keyboard
  // user reaches for first. Enter and Space already work — the focus trap puts
  // them on the tooltip's own Next button — and Esc closes the tour through
  // joyride's `dismissKeyAction`, so neither is handled here.
  useEffect(() => {
    if (!tourStore.isRunning) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.metaKey) return;

      if (event.key === "ArrowRight") {
        event.preventDefault();
        controls.next();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        controls.prev();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => document.removeEventListener("keydown", onKeyDown);
  }, [controls, tourStore.isRunning]);

  // Every anchor was filtered out, so there is nothing to show. react-joyride
  // never starts on an empty step list, which would leave the tour flagged as
  // running forever — close it out instead.
  useEffect(() => {
    if (tourStore.isRunning && steps.length === 0) {
      tourStore.completeTour();
    }
  }, [tourStore, tourStore.isRunning, steps.length]);

  useEffect(() => {
    if (!tourStore.isRunning) {
      stepAbortRef.current?.abort();
      stepAbortRef.current = null;
      currentSignalRef.current = undefined;
    }
  }, [tourStore.isRunning]);

  useEffect(() => {
    return () => {
      stepAbortRef.current?.abort();
      stepAbortRef.current = null;
    };
  }, []);

  // Whatever the steps put on the page for their own sake: the accent outline
  // on a sidebar item, the stand-in node a grouped spotlight measures into,
  // the class standing in for a hover. A step's `after` hook normally takes
  // its own down, but a tour that ends on the step — closed, skipped, anchor
  // gone — never gets there.
  const clearStepArtifacts = useCallback(() => {
    document
      .querySelector(".tour-outline-item")
      ?.classList.remove("tour-outline-item");
    removeUnionSpotlight();
    removeRevealedControl();
  }, []);

  const stopTour = useCallback(() => {
    stepAbortRef.current?.abort();
    stepAbortRef.current = null;
    currentSignalRef.current = undefined;
    clearStepArtifacts();
    tourStore.completeTour();
  }, [clearStepArtifacts, tourStore]);

  // The close button (and Esc) route through `controls.close()`, which only
  // sets `action: CLOSE` and bumps the index — it leaves the status RUNNING
  // unless the × was hit on the last step. So TOUR_END does not fire, and the
  // STEP_AFTER that would carry the CLOSE action is itself gated on the step
  // having reached the TOOLTIP lifecycle: close during a `before` hook, a
  // reposition or a navigation and neither event arrives. Nothing would then
  // lower `isRunning`, and a section that stood its list in for the tour
  // (FilesTour's demo files) would never be handed back.
  //
  // The store state changes on every close regardless of lifecycle, so it is
  // the one signal that always lands.
  useEffect(() => {
    if (!tourStore.isRunning) return;
    if (state.action === ACTIONS.CLOSE) stopTour();
  }, [state.action, tourStore.isRunning, stopTour]);

  useEffect(() => {
    const unsubBeforeHook = on(EVENTS.STEP_BEFORE_HOOK, () => {
      freshStepSignal();
    });

    const unsubAfter = on(EVENTS.STEP_AFTER, (data) => {
      stepAbortRef.current?.abort();
      stepAbortRef.current = null;
      currentSignalRef.current = undefined;

      if (data.action === ACTIONS.CLOSE) {
        stopTour();
      }
    });

    const unsubEnd = on(EVENTS.TOUR_END, stopTour);

    const unsubStatus = on(EVENTS.TOUR_STATUS, (data) => {
      if (data.status === STATUS.SKIPPED) {
        stopTour();
      }
    });

    // An anchor that was on screen when the tour started has gone (a list
    // reloaded, a panel closed, the view switched). react-joyride moves on to
    // the next step by itself, and walks off the end into TOUR_END if none of
    // the remaining ones resolve either — so the only job here is to drop the
    // outline the abandoned step left behind and let the tour carry on.
    // Ending the tour on the user because one step lost its anchor is exactly
    // what this must not do.
    const unsubTargetNotFound = on(EVENTS.TARGET_NOT_FOUND, (data) => {
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.warn(
          `[${logLabel}] target not found, skipping step:`,
          data.step?.target,
        );
      }

      stepAbortRef.current?.abort();
      stepAbortRef.current = null;
      currentSignalRef.current = undefined;
      clearStepArtifacts();
    });

    return () => {
      unsubBeforeHook();
      unsubAfter();
      unsubEnd();
      unsubStatus();
      unsubTargetNotFound();
    };
  }, [on, logLabel, stopTour, clearStepArtifacts]);

  return { Tour: isMobileView ? null : Tour };
}
