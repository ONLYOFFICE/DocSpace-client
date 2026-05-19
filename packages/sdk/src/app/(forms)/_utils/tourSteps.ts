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

import { waitForElement } from "./waitForElement";

export type TourStepData = {
  page: string;
  openCompletedFolder?: boolean;
};

export type TourStepCallbacks = {
  openCompletedFolder: () => void;
  getSignal: () => AbortSignal | undefined;
};

export type TourStepFlags = {
  canCreate: boolean;
  showLibrary: boolean;
  showSettings: boolean;
  showMenu: boolean;
  isTouch: boolean;
};

function isAbortError(err: unknown) {
  return err instanceof DOMException && err.name === "AbortError";
}

function silenceNonAbort(err: unknown) {
  if (!isAbortError(err) && process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.warn("[forms tour] waitForElement failed:", err);
  }
}

function openContextMenu(signal?: AbortSignal): Promise<void> {
  const tile = document.querySelector('[data-testid="tile"]') as HTMLElement | null;
  if (!tile) return Promise.resolve();

  const rect = tile.getBoundingClientRect();
  const event = new MouseEvent("contextmenu", {
    bubbles: true,
    cancelable: true,
    clientX: rect.left + rect.width / 2,
    clientY: rect.top + rect.height / 2,
    button: 2,
  });
  tile.dispatchEvent(event);

  return waitForElement("#option_view", 3000, signal)
    .then(() => {})
    .catch(silenceNonAbort);
}

function contextMenuStep(
  targetId: string,
  title: string,
  content: string,
  page: string,
  callbacks?: TourStepCallbacks,
): Step {
  return {
    target: `#${targetId}`,
    spotlightTarget: () => {
      const item = document.querySelector(`#${targetId}`);
      const ul = item?.closest("ul");
      return (ul as HTMLElement) ?? null;
    },
    spotlightPadding: 8,
    placement: "auto" as const,
    content,
    title,
    data: { page } satisfies TourStepData,
    skipBeacon: true,
    before: async () => {
      const signal = callbacks?.getSignal();
      await waitForElement('[data-tour="forms-grid"]', 3000, signal).catch(
        silenceNonAbort,
      );
      if (!document.querySelector(`#${targetId}`)) {
        await openContextMenu(signal);
      }
      await waitForElement(`#${targetId}`, 3000, signal).catch(silenceNonAbort);
      document
        .querySelector(`#${targetId}`)
        ?.classList.add("tour-outline-item");
    },
    after: () => {
      document
        .querySelector(".tour-outline-item")
        ?.classList.remove("tour-outline-item");
    },
  };
}

function navSectionStep(
  section: string,
  title: string,
  content: string,
  showMenu: boolean,
  callbacks?: TourStepCallbacks,
  extraBefore?: (signal?: AbortSignal) => Promise<void>,
): Step {
  const path = `/forms/${section}`;
  const navItemSelector = `#forms-nav-${section}`;
  const anchorSelector = `[data-tour="section-${section}"]`;
  const target = showMenu ? navItemSelector : anchorSelector;

  return {
    target,
    spotlightTarget: showMenu
      ? () => {
          const articleContainer = document.querySelector("#article-container");
          const isTextVisible =
            articleContainer?.getAttribute("data-show-text") === "true";

          if (isTextVisible) {
            const wrapper = document.querySelector(navItemSelector) as HTMLElement | null;
            return (wrapper?.firstElementChild as HTMLElement) ?? wrapper;
          }

          return document.querySelector(anchorSelector) as HTMLElement | null;
        }
      : undefined,
    placement: "auto" as const,
    content,
    title,
    data: { page: path } satisfies TourStepData,
    skipBeacon: true,
    before: async () => {
      const signal = callbacks?.getSignal();
      if (!showMenu) {
        await waitForElement(anchorSelector, 10000, signal).catch(
          silenceNonAbort,
        );
      }
      if (extraBefore) await extraBefore(signal);
      if (showMenu) {
        await waitForElement(navItemSelector, 10000, signal).catch(
          silenceNonAbort,
        );
        document
          .querySelector(navItemSelector)
          ?.classList.add("tour-outline-item");
      }
    },
    after: () => {
      document
        .querySelector(".tour-outline-item")
        ?.classList.remove("tour-outline-item");
    },
  };
}

function settingsStep(
  subSection: "billing" | "ai-agent" | "access" | "collect-data",
  title: string,
  content: string,
  callbacks?: TourStepCallbacks,
): Step {
  const path = `/forms/settings/${subSection}`;
  const pageSelector = `[data-tour="settings-${subSection}"]`;
  const tabSelector = `[data-testid="${subSection}_tab"]`;
  const containerSelector = '[data-tour="settings-spotlight"]';

  return {
    target: containerSelector,
    spotlightPadding: 8,
    placement: "auto" as const,
    content,
    title,
    data: { page: path } satisfies TourStepData,
    skipBeacon: true,
    before: async () => {
      const signal = callbacks?.getSignal();
      await waitForElement(pageSelector, 10000, signal).catch(silenceNonAbort);
      (document.querySelector(tabSelector) as HTMLElement | null)
        ?.setAttribute("data-tour-active", "true");
    },
    after: () => {
      document
        .querySelector(tabSelector)
        ?.removeAttribute("data-tour-active");
    },
  };
}

export function getTourSteps(
  t: TFunction,
  callbacks?: TourStepCallbacks,
  flags?: TourStepFlags,
): Step[] {
  const {
    canCreate = true,
    showLibrary = true,
    showSettings = true,
    showMenu = true,
    isTouch = false,
  } = flags ?? {};

  return [
    navSectionStep(
      "my-forms",
      t("Common:MyForms"),
      t(
        "Common:TourMyForms",
        "This is your main workspace. All your PDF forms are stored here. Upload new forms or create them from scratch.",
      ),
      showMenu,
      callbacks,
    ),
    canCreate && {
      target: '[data-testid="plus-button"]',
      content: t(
        "Common:TourPlusButton",
        "Use this button to upload existing PDF forms or create new ones from scratch.",
      ),
      title: t("Common:TourPlusButtonTitle", "Add forms"),
      data: { page: "/forms/my-forms" } satisfies TourStepData,
      skipBeacon: true,
    },
    canCreate &&
      !isTouch &&
      contextMenuStep(
        "option_ask-from-db",
        t("Common:TourCtxAskFromDBTitle", "Ask from DB"),
        t(
          "Common:TourCtxAskFromDB",
          "Chat with the AI agent about this form using data from a connected database.",
        ),
        "/forms/my-forms",
        callbacks,
      ),
    navSectionStep(
      "in-progress",
      t("Common:InProgress"),
      t(
        "Common:TourInProgress",
        "Each folder corresponds to a specific form and contains draft files from people who started filling but haven't submitted yet.",
      ),
      showMenu,
      callbacks,
    ),
    navSectionStep(
      "completed-forms",
      t("Common:CompletedForms"),
      t(
        "Common:TourCompletedForms",
        "Each folder contains all submitted copies of a specific form, organized by submission.",
      ),
      showMenu,
      callbacks,
    ),
    {
      target: '[data-tour="forms-grid"]',
      content: t(
        "Common:TourCompletedFolder",
        "Each completed file is named with a number, the submitter's name, and the submission date. Use the AI Chat button to ask questions or get summaries about submissions.",
      ),
      title: t("Common:TourCompletedFolderTitle", "Completed submissions"),
      data: {
        page: "/forms/completed-forms",
        openCompletedFolder: true,
      } satisfies TourStepData,
      skipBeacon: true,
      before: async () => {
        const signal = callbacks?.getSignal();
        callbacks?.openCompletedFolder();
        await waitForElement('[data-tour="forms-grid"]', 10000, signal).catch(
          silenceNonAbort,
        );
      },
    },
    showLibrary &&
      navSectionStep(
        "library",
        t("Common:Library"),
        t(
          "Common:TourLibrary",
          "Browse ready-made form templates. Pick a template to quickly create a new form without starting from scratch.",
        ),
        showMenu,
        callbacks,
      ),
    showSettings &&
      settingsStep(
        "billing",
        t("Common:Billing", "Billing"),
        t(
          "Common:TourBilling",
          "Manage your subscription plan and payment details for this forms room.",
        ),
        callbacks,
      ),
    showSettings &&
      settingsStep(
        "ai-agent",
        t("Common:AIAgent"),
        t(
          "Common:TourAiAgent",
          "Enable the AI agent to automatically process submitted forms, extract data, and assist with form review.",
        ),
        callbacks,
      ),
    showSettings &&
      settingsStep(
        "access",
        t("Common:AccessSettings", "Access Settings"),
        t(
          "Common:TourAccess",
          "Manage who can access this forms room. Add Form Admins and Form Managers to control permissions.",
        ),
        callbacks,
      ),
    showSettings &&
      settingsStep(
        "collect-data",
        t("Common:CollectData"),
        t(
          "Common:TourCollectData",
          "Set up automatic data collection from completed forms. Export results to XLSX or connect a MySQL database.",
        ),
        callbacks,
      ),
  ].filter(Boolean) as Step[];
}
