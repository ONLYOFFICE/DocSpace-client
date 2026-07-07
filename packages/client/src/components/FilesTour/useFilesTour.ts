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

import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useJoyride, EVENTS, STATUS, ACTIONS } from "react-joyride";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";

import type FilesTourStore from "SRC_DIR/store/FilesTourStore";

import {
  getTourSteps,
  type TourStepCallbacks,
  type TourStepFlags,
} from "./tourSteps";
import TourTooltip from "./TourTooltip";

export default function useFilesTour(
  tourStore: FilesTourStore,
  flags: TourStepFlags,
  isMobileView: boolean,
) {
  const { isBase } = useTheme();
  const { t } = useTranslation(["FilesTour", "Common"]);

  const stepAbortRef = useRef<AbortController | null>(null);
  const freshStepSignal = () => {
    stepAbortRef.current?.abort();
    const ctrl = new AbortController();
    stepAbortRef.current = ctrl;
    return ctrl.signal;
  };
  const currentSignalRef = useRef<AbortSignal | undefined>(undefined);

  const tourCallbacks = useMemo<TourStepCallbacks>(
    () => ({
      getSignal: () => currentSignalRef.current,
    }),
    [],
  );

  const steps = useMemo(
    () => getTourSteps(t, tourCallbacks, flags),
    [t, tourCallbacks, flags],
  );

  const { on, Tour } = useJoyride({
    continuous: true,
    steps,
    run: isMobileView ? false : tourStore.isRunning,
    scrollToFirstStep: false,
    tooltipComponent: TourTooltip,
    options: {
      arrowColor: isBase ? globalColors.white : globalColors.black,
      arrowBase: 18,
      arrowSize: 8,
      overlayColor: "rgba(0, 0, 0, 0.5)",
      overlayClickAction: "close",
      blockTargetInteraction: true,
      skipScroll: true,
      zIndex: 10000,
      beforeTimeout: 15000,
      targetWaitTimeout: 15000,
    },
    locale: {
      back: t("Common:Back"),
      close: t("Common:CloseButton"),
      last: t("Common:Done"),
      next: t("Common:Next"),
      skip: t("Common:Skip"),
    },
  });

  useEffect(() => {
    if (isMobileView && tourStore.isRunning) {
      tourStore.completeTour();
    }
  }, [isMobileView, tourStore]);

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

  useEffect(() => {
    const clearOutline = () => {
      document
        .querySelector(".tour-outline-item")
        ?.classList.remove("tour-outline-item");
    };

    const stopTour = () => {
      stepAbortRef.current?.abort();
      stepAbortRef.current = null;
      currentSignalRef.current = undefined;
      clearOutline();
      tourStore.completeTour();
    };

    const unsubBeforeHook = on(EVENTS.STEP_BEFORE_HOOK, () => {
      currentSignalRef.current = freshStepSignal();
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

    const unsubTargetNotFound = on(EVENTS.TARGET_NOT_FOUND, (data) => {
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.warn(
          "[files tour] target not found, ending tour:",
          data.step?.target,
        );
      }
      stopTour();
    });

    return () => {
      unsubBeforeHook();
      unsubAfter();
      unsubEnd();
      unsubStatus();
      unsubTargetNotFound();
    };
  }, [on, tourStore]);

  return { Tour: isMobileView ? null : Tour };
}
