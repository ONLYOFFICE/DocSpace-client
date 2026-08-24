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
import type { TFunction } from "i18next";

import { getBrandName } from "@docspace/shared/constants/brands";

import type { TourStepCallbacks } from "SRC_DIR/components/Tour/useTour";
import {
  navItemStep,
  elementStep,
  elementGroupStep,
  sidebarSelector,
} from "SRC_DIR/components/Tour/stepBuilders";

const LOG_LABEL = "dashboard tour";

/**
 * The dashboard's own anchors, as `data-tour-id` attributes rather than the
 * classes from `Dashboard.module.scss`: CSS module names are hashed at build
 * time, so a selector built from one is a selector that breaks on the next
 * build. Each is set on the outermost node of the region the step is about.
 */
const PROFILE_CARD_SELECTOR = '[data-tour-id="dashboard-profile"]';
const CREATE_SECTION_SELECTOR = '[data-tour-id="dashboard-create"]';
const APPS_SECTION_SELECTOR = '[data-tour-id="dashboard-apps"]';
const INTEGRATIONS_SELECTOR = '[data-tour-id="dashboard-integrations"]';
const DEVTOOLS_SELECTOR = '[data-tour-id="dashboard-devtools"]';

/**
 * One app card, by its own id.
 *
 * Named individually because the grouped spotlight resolves each selector it is
 * given with `querySelector` — one element apiece. A single selector shared by
 * every card would therefore light up the first one alone, which is the whole
 * row reduced to Files.
 */
const appCardSelector = (id: string) => `[data-tour-id="dashboard-app-card-${id}"]`;

/**
 * The Overview item in the sidebar, which is the way back to the page the tour
 * runs on. Its id is the literal "dashboard" (ClientArticleSidebar → NavMenu
 * `data-item-id`), not a folder id — the dashboard is not a folder.
 */
const OVERVIEW_ITEM_SELECTOR = sidebarSelector("dashboard");

export type TourStepFlags = {
  /**
   * Whether the profile card is on the page. It is shown to admins and owners
   * only, and they can dismiss it for good — so it is absent far more often
   * than most tour anchors, and the step goes with it.
   */
  hasProfileCard: boolean;
  /**
   * The ids of the app cards actually on the page, in the order the grid renders
   * them. Every app is `installed: true` today, so this is the full four in
   * practice — it is read rather than assumed because the grid is filtered, and
   * because the grouped spotlight has to name each card it covers individually.
   * Empty means no step.
   */
  appIds: string[];
  /**
   * Whether the integrations card is on the page. It renders unconditionally
   * today, but it is a collapsible card whose anchor sits on a wrapper the tour
   * reads from the DOM like every other — so a future condition on it costs a
   * dropped step rather than a step pointing at nothing.
   */
  hasIntegrations: boolean;
  /**
   * Whether the developer-tools card is on the page. Same shape as
   * `hasIntegrations`: rendered unconditionally today, read from the DOM anyway
   * so a future condition on it costs a dropped step rather than a step
   * pointing at nothing.
   */
  hasDevTools: boolean;
};

/**
 * The dashboard tour: six steps over what is already on the page.
 *
 * Simpler than the section tours by nature, and deliberately so. Those walk a
 * list that has to be fetched, is empty for a new portal, and has to be stood in
 * for — hence `tourDemo`, the reveal hooks, the teardown. The dashboard renders
 * its own content synchronously and looks the same on the first visit as on the
 * hundredth, so every step here is a plain `elementStep` over a region that is
 * either there or isn't.
 *
 * It ends on the sidebar rather than on one of the apps: the tour's job is to
 * hand the user over to the four section tours, each of which is offered by that
 * app's own promo, and the sidebar is what they will use to get there.
 */
export function getTourSteps(
  t: TFunction,
  callbacks: TourStepCallbacks | undefined,
  flags: TourStepFlags,
): Step[] {
  const { hasProfileCard, appIds, hasIntegrations, hasDevTools } = flags;

  return [
    // 1. The profile card: what the details on it actually are. The card is a
    // grid of labelled fields (portal name, name, email, password) that a
    // first-time user has no reason to read, so the step names them.
    hasProfileCard &&
      elementStep(
        PROFILE_CARD_SELECTOR,
        t("DashboardTour:DashboardProfileTitle"),
        t("DashboardTour:DashboardProfile"),
        callbacks,
        LOG_LABEL,
      ),

    // 2. The quick actions, as an invitation rather than a description: create
    // one document here and it lands in your files. That is the shortest path
    // from an empty portal to something in it.
    elementStep(
      CREATE_SECTION_SELECTOR,
      t("DashboardTour:DashboardCreateTitle"),
      t("DashboardTour:DashboardCreate", {
        files: t("Common:Files"),
      }),
      callbacks,
      LOG_LABEL,
    ),

    // 3. The whole row of apps, lit up as one region — every card named
    // individually so the spotlight covers all of them rather than the first
    // (see `appCardSelector`). The tooltip anchors on the section, so the
    // heading above stays out of the spotlight while the text can still speak
    // about the row as a whole: these are the products, and each one is a place
    // to get something done.
    appIds.length > 0 &&
      elementGroupStep(
        APPS_SECTION_SELECTOR,
        appIds.map(appCardSelector),
        t("DashboardTour:DashboardAppsTitle"),
        t("DashboardTour:DashboardApps"),
        callbacks,
        LOG_LABEL,
      ),

    // 4. The integrations card, which reads as an ad and is skipped as one —
    // the step is what says it is not: the same editors, inside a platform the
    // user may already be running, without moving anything into this one.
    hasIntegrations &&
      elementStep(
        INTEGRATIONS_SELECTOR,
        t("DashboardTour:DashboardIntegrationsTitle"),
        t("DashboardTour:DashboardIntegrations"),
        callbacks,
        LOG_LABEL,
      ),

    // 5. The developer tools, which is the one card on the page whose audience
    // is not the person the rest of the tour is addressed to — so the step says
    // who it is for rather than what is in it. A user who does not build
    // anything can read one sentence and move on; the one who does now knows the
    // portal has an API side at all, which is the whole point of stopping here.
    hasDevTools &&
      elementStep(
        DEVTOOLS_SELECTOR,
        t("DashboardTour:DashboardDevToolsTitle"),
        t("DashboardTour:DashboardDevTools", {
          organizationName: getBrandName("OrganizationName"),
          productName: getBrandName("ProductName"),
        }),
        callbacks,
        LOG_LABEL,
      ),

    // 6. The way back. The dashboard is a page users leave and have to be able
    // to return to, and the Overview item is how — worth a step of its own
    // because a page reached from a sidebar item is easy to think of as a
    // landing screen shown once.
    navItemStep(
      OVERVIEW_ITEM_SELECTOR,
      t("DashboardTour:DashboardOverviewTitle"),
      t("DashboardTour:DashboardOverview", { overview: t("Common:Home") }),
      callbacks,
      LOG_LABEL,
    ),
  ].filter(Boolean) as Step[];
}
