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

import { useCallback, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { DeviceType } from "@docspace/shared/enums";

import type DashboardTourStore from "SRC_DIR/store/DashboardTourStore";
import useTour, {
  type TourStepCallbacks,
} from "SRC_DIR/components/Tour/useTour";

import { getTourSteps, type TourStepFlags } from "./tourSteps";

/**
 * How long to let the dashboard settle before starting.
 *
 * The same reason as `usePendingTour`'s delay of the same length: `useTour`
 * freezes its step list against the DOM the moment the tour starts, dropping the
 * steps whose anchor isn't there, so the start has to wait out the painting the
 * loader flag doesn't cover.
 */
const SETTLE_DELAY = 300;

type DashboardTourProps = {
  dashboardTourStore: DashboardTourStore;
  userId?: string;
  currentDeviceType: DeviceType;
  isFrame: boolean;
  isDashboardReady: boolean;
};

/**
 * Host for the dashboard's own tour.
 *
 * The one section tour that starts where it was asked for. The others are armed
 * from the dashboard and run on a route the request had to survive, which is what
 * `usePendingTour` and the persisted pending flag are for; here the welcome modal
 * and the tour are on the same page, so the request is spent on the render after
 * it is made and the start is a plain "is the page up yet" check.
 *
 * Nothing to tear down either — no stand-in list, no borrowed panel, no config
 * the tour pretends about — so `useTour`'s own cleanup is the whole of it.
 */
const DashboardTour = ({
  dashboardTourStore,
  userId,
  currentDeviceType,
  isFrame,
  isDashboardReady,
}: DashboardTourProps) => {
  const { t } = useTranslation(["DashboardTour", "Common"]);
  const isMobileView = currentDeviceType === DeviceType.mobile;

  /**
   * Which of the page's optional regions are actually on it.
   *
   * Read from the DOM rather than from the stores, which is the opposite of how
   * the section tours decide this — and right here, because what can be missing
   * is missing for reasons the stores do not answer: the profile card is
   * dismissed into component state of its own. The alternative is lifting that
   * state out of the component that owns it so a tour can ask about it, which is
   * a worse trade than one query per run.
   *
   * Only read when a tour is about to start, and `useTour` re-checks every
   * anchor itself before freezing the step list — so a region that goes away
   * between this and that costs a dropped step, not a broken one.
   */
  const readFlags = useCallback((): TourStepFlags => {
    // Each card carries its own id in the attribute, which the apps step needs
    // one selector per card (a shared value would spotlight only the first).
    const appIds = Array.from(
      document.querySelectorAll<HTMLElement>(
        '[data-tour-id^="dashboard-app-card-"]',
      ),
    )
      .map((node) => node.dataset.tourId?.replace("dashboard-app-card-", ""))
      .filter((id): id is string => !!id);

    return {
      hasProfileCard: !!document.querySelector(
        '[data-tour-id="dashboard-profile"]',
      ),
      appIds,
      hasIntegrations: !!document.querySelector(
        '[data-tour-id="dashboard-integrations"]',
      ),
      hasDevTools: !!document.querySelector(
        '[data-tour-id="dashboard-devtools"]',
      ),
    };
  }, []);

  // Sampled once per run rather than tracked: the step list is frozen for the
  // length of a tour anyway (see `useTour`), so a flag that changed mid-run
  // would have nowhere to land.
  const flags = useMemo(
    () => (dashboardTourStore.isRunning ? readFlags() : null),
    [dashboardTourStore.isRunning, readFlags],
  );

  const buildSteps = useCallback(
    (callbacks: TourStepCallbacks) =>
      flags ? getTourSteps(t, callbacks, flags) : [],
    [t, flags],
  );

  const { Tour } = useTour(
    dashboardTourStore,
    buildSteps,
    isMobileView,
    "dashboard tour",
  );

  // The request is made on this page, so there is nothing to hydrate — but it
  // can still be made while the page is not ready to be walked through (the
  // welcome is shown as soon as the user loads, the cards a frame later).
  useEffect(() => {
    if (!dashboardTourStore.isPending || dashboardTourStore.isRunning) return;

    // No tour on mobile — `useTour` refuses to run there. Drop the request
    // rather than leave it armed for a desktop visit that may never come; the
    // welcome is not offered on mobile either, so nothing armed it on purpose.
    if (isMobileView) {
      dashboardTourStore.completeTour();
      return undefined;
    }

    if (!isDashboardReady) return undefined;

    const timer = setTimeout(() => {
      dashboardTourStore.startTour();
    }, SETTLE_DELAY);

    return () => clearTimeout(timer);
  }, [
    dashboardTourStore,
    dashboardTourStore.isPending,
    dashboardTourStore.isRunning,
    isDashboardReady,
    isMobileView,
  ]);

  if (isFrame || !userId) return null;

  return Tour ? createPortal(Tour, document.body) : null;
};

export default inject(
  ({ userStore, settingsStore, clientLoadingStore, dashboardTourStore }: TStore) => {
    return {
      dashboardTourStore,
      userId: userStore?.user?.id,
      currentDeviceType: settingsStore.currentDeviceType,
      isFrame: settingsStore.isFrame,
      // The dashboard has no content of its own to fetch; the only thing it
      // waits for is the sidebar's own init, which is what `DashboardLoader`
      // stands in for and what the anchors are behind.
      isDashboardReady: !clientLoadingStore.showArticleLoader,
    };
  },
)(observer(DashboardTour));
