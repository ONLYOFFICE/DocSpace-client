// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import type { Step } from "react-joyride";
import type { TFunction } from "i18next";

import { waitForElement } from "./waitForElement";

export type TourStepData = {
  page: string;
  openCompletedFolder?: boolean;
};

export type TourStepCallbacks = {
  openCompletedFolder: () => void;
  navigate: (path: string) => void;
};

export type TourStepFlags = {
  canCreate: boolean;
  showLibrary: boolean;
  showSettings: boolean;
};

function openContextMenu(): Promise<void> {
  // Find the first tile and right-click it to open context menu
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

  return waitForElement("#option_view")
    .then(() => {})
    .catch(() => {});
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
    content,
    title,
    data: { page } satisfies TourStepData,
    skipBeacon: true,
    before: async () => {
      callbacks?.navigate(page);
      await waitForElement('[data-tour="forms-grid"]', 3000).catch(() => {});
      if (!document.querySelector(`#${targetId}`)) {
        await openContextMenu();
      }
      await waitForElement(`#${targetId}`, 3000).catch(() => {});
    },
  };
}

export function getTourSteps(
  t: TFunction,
  callbacks?: TourStepCallbacks,
  flags?: TourStepFlags,
): Step[] {
  const { canCreate = true, showLibrary = true, showSettings = true } =
    flags ?? {};

  return [
    // My Forms sidebar — always
    {
      target: "#forms-nav-my-forms",
      content: t(
        "Common:TourMyForms",
        "This is your main workspace. All your PDF forms are stored here. Upload new forms or create them from scratch.",
      ),
      title: t("Common:MyForms"),
      data: { page: "/forms/my-forms" } satisfies TourStepData,
      skipBeacon: true,
    },
    // Plus button — only with Create permission
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
    // Context menu — Ask from DB — only with Create permission
    canCreate &&
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
    // 6. In Progress sidebar
    {
      target: "#forms-nav-in-progress",
      content: t(
        "Common:TourInProgress",
        "Each folder corresponds to a specific form and contains draft files from people who started filling but haven't submitted yet.",
      ),
      title: t("Common:InProgress"),
      data: { page: "/forms/in-progress" } satisfies TourStepData,
      skipBeacon: true,
    },
    // Completed Forms sidebar
    {
      target: "#forms-nav-completed-forms",
      content: t(
        "Common:TourCompletedForms",
        "Each folder contains all submitted copies of a specific form, organized by submission.",
      ),
      title: t("Common:CompletedForms"),
      data: { page: "/forms/completed-forms" } satisfies TourStepData,
      skipBeacon: true,
    },
    // Inside completed folder + AI Chat
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
        callbacks?.openCompletedFolder();
        await waitForElement('[data-tour="forms-grid"]');
      },
    },
    // Library sidebar — only if visible
    showLibrary && {
      target: "#forms-nav-library",
      content: t(
        "Common:TourLibrary",
        "Browse ready-made form templates. Pick a template to quickly create a new form without starting from scratch.",
      ),
      title: t("Common:Library"),
      data: { page: "/forms/library" } satisfies TourStepData,
      skipBeacon: true,
    },
    // Settings — Billing — only for Owner/Admin
    showSettings && {
      target: '[data-tour="settings-billing"]',
      content: t(
        "Common:TourBilling",
        "Manage your subscription plan and payment details for this forms room.",
      ),
      title: t("Common:Billing", "Billing"),
      data: { page: "/forms/settings/billing" } satisfies TourStepData,
      skipBeacon: true,
      before: async () => {
        callbacks?.navigate("/forms/settings/billing");
        await waitForElement('[data-tour="settings-billing"]');
      },
    },
    // Settings — AI Agent — only for Owner/Admin
    showSettings && {
      target: '[data-tour="settings-ai-agent"]',
      content: t(
        "Common:TourAiAgent",
        "Enable the AI agent to automatically process submitted forms, extract data, and assist with form review.",
      ),
      title: t("Common:AIAgent"),
      data: { page: "/forms/settings/ai-agent" } satisfies TourStepData,
      skipBeacon: true,
      before: async () => {
        callbacks?.navigate("/forms/settings/ai-agent");
        await waitForElement('[data-tour="settings-ai-agent"]');
      },
    },
    // Settings — Access — only for Owner/Admin
    showSettings && {
      target: '[data-tour="settings-access"]',
      content: t(
        "Common:TourAccess",
        "Manage who can access this forms room. Add Form Admins and Form Managers to control permissions.",
      ),
      title: t("Common:AccessSettings", "Access Settings"),
      data: { page: "/forms/settings/access" } satisfies TourStepData,
      skipBeacon: true,
      before: async () => {
        callbacks?.navigate("/forms/settings/access");
        await waitForElement('[data-tour="settings-access"]');
      },
    },
    // Settings — Collect Data — only for Owner/Admin
    showSettings && {
      target: '[data-tour="settings-collect-data"]',
      content: t(
        "Common:TourCollectData",
        "Set up automatic data collection from completed forms. Export results to XLSX or connect a MySQL database.",
      ),
      title: t("Common:CollectData"),
      data: { page: "/forms/settings/collect-data" } satisfies TourStepData,
      skipBeacon: true,
      before: async () => {
        callbacks?.navigate("/forms/settings/collect-data");
        await waitForElement('[data-tour="settings-collect-data"]');
      },
    },
  ].filter(Boolean) as Step[];
}
