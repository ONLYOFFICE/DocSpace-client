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

import React from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

import { Events, RoomsType } from "@docspace/shared/enums";

import CatalogRoomsIcon from "@docspace/ui-kit/assets/icons/16/catalog.rooms.react.svg";
import CatalogFolderIcon from "@docspace/ui-kit/assets/icons/16/catalog.folder.react.svg";
import CatalogDocumentsIcon from "@docspace/ui-kit/assets/icons/16/catalog.documents.react.svg";
import AiAgentsIcon from "@docspace/ui-kit/assets/icons/16/ai-agents.svg";

import type { ModuleItem } from "../sub-components/ModuleCard";

// The dashboard sits outside any folder, so creation is dispatched without a
// parent and each dialog falls back to its section root. `context` matches the
// value the sidebar's own create entry points send.
const DASHBOARD_CREATE_DETAIL = { parentId: null, context: "sidebar" };

// Opens the create-room dialog — the same event/payload contract the Home quick
// actions use, read by GlobalEvents' onCreateRoom and then by CreateRoomEvent.
// With `startRoomType` the dialog opens on that type and locks the chooser;
// without it, on the type chooser, which is what a generic "Create room" wants.
const dispatchCreateRoom = (startRoomType?: RoomsType) => {
  const event = new CustomEvent(Events.ROOM_CREATE, {
    detail: DASHBOARD_CREATE_DETAIL,
  });
  // @ts-expect-error custom payload consumed by GlobalEvents/onCreateRoom
  event.payload = { startRoomType };
  window.dispatchEvent(event);
};

// Opens the create-agent dialog. GlobalEvents' onCreateAgent runs the
// AI-readiness gate itself, showing the activate-AI dialog first when the
// portal isn't set up yet.
const dispatchCreateAgent = () => {
  window.dispatchEvent(
    new CustomEvent(Events.AGENT_CREATE, { detail: DASHBOARD_CREATE_DETAIL }),
  );
};

export type UseModuleItemsProps = {
  isGuest: boolean;
  /** Admins / owners / room admins — the set allowed to create rooms. */
  canCreateRooms: boolean;
  /** `canCreateRooms` plus AI being ready, which agent creation also needs. */
  canCreateAgents: boolean;
  /**
   * Rooms quota is exhausted or the portal is in its grace period. Room and
   * form-set creation then opens the quota warning instead of the create
   * dialog, matching every other create entry point.
   */
  isWarningRoomsDialog: boolean;
  setQuotaWarningDialogVisible: (visible: boolean) => void;
};

/**
 * Builds the app cards for the Dashboard's "Apps" section.
 *
 * Files is an "Open" card — it has nothing to create at the section level. The
 * other three are create-first: their button opens the matching create dialog,
 * which is the point of the card. A user who can't create there gets the plain
 * "Open" behaviour and label instead, so the card still leads somewhere useful.
 */
export const useModuleItems = ({
  isGuest,
  canCreateRooms,
  canCreateAgents,
  isWarningRoomsDialog,
  setQuotaWarningDialogVisible,
}: UseModuleItemsProps): ModuleItem[] => {
  const { t } = useTranslation(["Common"]);
  const navigate = useNavigate();

  return React.useMemo(() => {
    // Wraps a room-flavoured create so an exhausted quota surfaces its own
    // dialog rather than a create dialog that cannot succeed.
    const withQuotaCheck = (create: () => void) => () => {
      if (isWarningRoomsDialog) {
        setQuotaWarningDialogVisible(true);
        return;
      }
      create();
    };

    /**
     * A card whose button creates something, degraded to "Open" for a user
     * without the right: same destination, different verb.
     */
    const createOrOpen = (
      canCreate: boolean,
      href: string,
      createLabel: string,
      create: () => void,
    ) =>
      canCreate
        ? { buttonLabel: createLabel, onAction: create }
        : { buttonLabel: t("Common:Open"), onAction: () => navigate(href) };

    const filesHref = isGuest
      ? "/shared-with-me/filter"
      : "/rooms/personal/filter";

    const items: ModuleItem[] = [
      {
        id: "ai-files",
        icon: <CatalogFolderIcon />,
        title: t("Common:Files"),
        description: t("Common:DashboardFilesDescription"),
        installed: true,
        href: filesHref,
        buttonLabel: t("Common:Open"),
        onAction: () => navigate(filesHref),
      },
      {
        id: "ai-rooms",
        icon: <CatalogRoomsIcon />,
        title: t("Common:Rooms"),
        description: t("Common:DashboardRoomsDescription"),
        installed: true,
        href: "/rooms/shared/filter",
        ...createOrOpen(
          canCreateRooms,
          "/rooms/shared/filter",
          t("Common:CreateRoom"),
          // No preset type: the dialog opens on its room-type chooser.
          withQuotaCheck(() => dispatchCreateRoom()),
        ),
      },
      {
        id: "ai-forms",
        icon: <CatalogDocumentsIcon />,
        title: t("Common:Forms"),
        description: t("Common:DashboardFormsDescription"),
        installed: true,
        href: "/forms/filter",
        // A form set is a form-filling room, so it goes through the same
        // create-room dialog, opened on the FormRoom type.
        ...createOrOpen(
          canCreateRooms,
          "/forms/filter",
          t("Common:CreateFormSet"),
          withQuotaCheck(() => dispatchCreateRoom(RoomsType.FormRoom)),
        ),
      },
      {
        id: "ai-agents",
        icon: <AiAgentsIcon />,
        title: t("Common:AIAgents"),
        description: t("Common:DashboardAIChatAgentsDescription"),
        installed: true,
        href: "/ai-agents/filter",
        ...createOrOpen(
          canCreateAgents,
          "/ai-agents/filter",
          t("Common:CreateAIAgent", { aiAgent: t("Common:AIAgent") }),
          dispatchCreateAgent,
        ),
      },
    ];

    return items.filter((mod) => mod.installed);
  }, [
    t,
    navigate,
    isGuest,
    canCreateRooms,
    canCreateAgents,
    isWarningRoomsDialog,
    setQuotaWarningDialogVisible,
  ]);
};

export default useModuleItems;

