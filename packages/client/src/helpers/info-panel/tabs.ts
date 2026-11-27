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

import { FolderType } from "@docspace/shared/enums";
import { getAgentRights, type TAgentRightsSource } from "../agentRights";
import {
  isFile as isFileUtil,
  isRoom as isRoomUtil,
} from "@docspace/shared/utils/typeGuards";
import { isMetadataSupported } from "@docspace/shared/utils/metadata";
import type { TRoom } from "@docspace/shared/api/rooms/types";
import type { TFile, TFolder } from "@docspace/shared/api/files/types";

import { PluginFileType } from "SRC_DIR/helpers/plugins/enums";
import type { IInfoPanelItemClient } from "SRC_DIR/helpers/plugins/types";
import { pluginRoomTypes } from "SRC_DIR/helpers/plugins/react/utils";
import type { InfoPanelViewType } from "SRC_DIR/store/InfoPanelStore";
import { isAgent } from "SRC_DIR/helpers/aiWorkspace";

import { InfoPanelView } from "./index";

type TSelection = TRoom | TFolder | TFile | null | (TRoom | TFolder | TFile)[];

type TPluginItem = { key: string; value: IInfoPanelItemClient };

export type TGetAvailableInfoPanelTabsParams = {
  selection: TSelection;
  isTrash: boolean;
  // `undefined` is allowed because TreeFoldersStore.isRecentFolder is
  // `boolean | undefined`; the flag is only used for truthiness checks.
  isRecentFolder: boolean | undefined;
  /** TreeFoldersStore.isPrivacyFolder: the open folder is in a private room. */
  isPrivacyFolder: boolean;
  enablePlugins: boolean;
  infoPanelItemsList: TPluginItem[];
  /** The id of the agent whose page (its chat) is open: that agent gets the Content tab. */
  aiChatProjectId?: number | null;
  /**
   * A template of the Agents list's Templates tab is selected: the panel
   * shows it instead of the selection, which is the list's own folder there.
   */
  isAiTemplate?: boolean;
};

/**
 * Whether the caller may list, re-role and remove the members of an agent:
 * the right the server gives the owner and Agent managers to change the
 * room's members (`EditAccess`, the right "Share agent" goes by), held as
 * a member. A DocSpace admin who is not one is offered no member changes.
 *
 * It is the `share` right of `getAgentRights`.
 *
 * Spec: ai-agent-access, "What an Agent manager is offered"
 */
export const canManageAgentMembers = (selection: object): boolean => {
  const agent = selection as TAgentRightsSource;
  // A selection that does not say whether the caller is in the agent (no
  // `inRoom`) is one the caller opened as a member.
  return getAgentRights({ ...agent, inRoom: agent.inRoom !== false }).share;
};

export type TInfoPanelTabsResult = {
  tabs: InfoPanelViewType[];
  useRoomsView: boolean;
};

/**
 * Returns the ordered list of valid tab IDs for the current Info Panel context
 * and whether roomsView (true) or fileView (false) should be used as the raw
 * preferred tab. Callers validate the stored view against tabs[]:
 *   const raw = useRoomsView ? roomsView : fileView;
 *   const currentView = tabs.includes(raw) ? raw : tabs[0];
 */
export function getAvailableInfoPanelTabs({
  selection,
  isTrash,
  isRecentFolder,
  isPrivacyFolder,
  enablePlugins,
  infoPanelItemsList,
  aiChatProjectId,
  isAiTemplate,
}: TGetAvailableInfoPanelTabsParams): TInfoPanelTabsResult {
  const detailsOnly: TInfoPanelTabsResult = {
    tabs: [InfoPanelView.infoDetails],
    useRoomsView: false,
  };

  // A template of an agent: what it is and what it brings, as an agent has.
  if (isAiTemplate)
    return {
      tabs: [InfoPanelView.infoDetails, InfoPanelView.infoContext],
      useRoomsView: true,
    };

  if (!selection || Array.isArray(selection)) return detailsOnly;

  if (isTrash) return detailsOnly;

  const isTemplate =
    "rootFolderType" in selection &&
    selection.rootFolderType === FolderType.RoomTemplates;

  if (isTemplate) {
    return {
      tabs: [InfoPanelView.infoMembers, InfoPanelView.infoDetails],
      useRoomsView: true,
    };
  }

  // An agent (an AI project): its details and what it draws on. The server
  // marks no room as one, so the room type decides for a selection of the
  // list or of the agent's page. On the agent's own page, where its chat is
  // open, the files of the conversation on screen follow. Those who may
  // change its members (the owner and Agent managers) get them last, on
  // the room's members list, where they are re-roled and removed.
  if (isAgent(selection)) {
    const tabs: InfoPanelViewType[] = [
      InfoPanelView.infoDetails,
      InfoPanelView.infoContext,
    ];
    if (aiChatProjectId != null && Number(selection.id) === aiChatProjectId)
      tabs.push(InfoPanelView.infoContent);
    if (canManageAgentMembers(selection)) tabs.push(InfoPanelView.infoMembers);
    return { tabs, useRoomsView: true };
  }

  const isRoomsType =
    !isRecentFolder &&
    isRoomUtil(selection) &&
    "rootFolderType" in selection &&
    (selection.rootFolderType === FolderType.Rooms ||
      selection.rootFolderType === FolderType.Archive ||
      selection.rootFolderType === FolderType.AiHub);

  const useRoomsView = isRoomsType;

  const tabs: InfoPanelViewType[] = [];

  const isPrivateItem =
    ("private" in selection && selection.private === true) ||
    ("encrypted" in selection && selection.encrypted === true);

  if (useRoomsView) {
    tabs.push(InfoPanelView.infoMembers);
  } else if (
    "canShare" in selection &&
    selection.canShare &&
    !isRoomUtil(selection) &&
    !isPrivateItem &&
    // Spec: private-rooms/room-membership, "Share tab hidden for private items"
    !isPrivacyFolder &&
    // No external links to files in the AI rooms (the server refuses them).
    !(
      "rootFolderType" in selection &&
      selection.rootFolderType === FolderType.AiHub
    )
  ) {
    tabs.push(InfoPanelView.infoShare);
  }

  tabs.push(InfoPanelView.infoHistory, InfoPanelView.infoDetails);

  // Nothing of the AI section (its rooms, their folders and files) has a
  // Metadata tab.
  const isInAiSection =
    "rootFolderType" in selection &&
    selection.rootFolderType === FolderType.AiHub;

  if (isMetadataSupported(selection) && !isInAiSection) {
    tabs.push(InfoPanelView.infoMetadata);
  }

  // Spec: private-rooms/room-membership, "AI and plugin actions withheld"
  const pluginsWithheld = isPrivateItem || isPrivacyFolder;

  if (enablePlugins && infoPanelItemsList.length > 0 && !pluginsWithheld) {
    const isRoomSelection = isRoomUtil(selection);
    const isFileSelection = isFileUtil(selection);

    const fileExst = "fileExst" in selection ? (selection.fileExst ?? "") : "";

    const viewAccessibility =
      isFileSelection && "viewAccessibility" in selection
        ? selection.viewAccessibility
        : null;

    const isImage =
      !!viewAccessibility &&
      !viewAccessibility.MediaView &&
      viewAccessibility.ImageView;

    const isVideo =
      !!viewAccessibility &&
      viewAccessibility.MediaView &&
      !viewAccessibility.ImageView;

    const security = selection.security as
      | Partial<Record<string, boolean>>
      | undefined;

    const roomType = isRoomSelection
      ? pluginRoomTypes[selection.roomType]
      : undefined;

    for (const item of infoPanelItemsList) {
      if (
        item.value.itemSecurity &&
        !item.value.itemSecurity.every((key) => security?.[key])
      ) {
        continue;
      }

      // A plugin may list a numeric id as a string.
      if (
        item.value.itemId &&
        !item.value.itemId.some((id) => String(id) === String(selection.id))
      ) {
        continue;
      }

      if (
        isRoomSelection &&
        item.value.roomType &&
        !(roomType && item.value.roomType.includes(roomType))
      ) {
        continue;
      }

      if (!item.value.filesType) {
        tabs.push(`info_plugin-${item.key}`);
        continue;
      }

      if (isRoomSelection) {
        if (item.value.filesType.includes(PluginFileType.room)) {
          tabs.push(`info_plugin-${item.key}`);
        }
        continue;
      }

      if (isImage && item.value.filesType.includes(PluginFileType.image)) {
        tabs.push(`info_plugin-${item.key}`);
        continue;
      }

      if (isVideo && item.value.filesType.includes(PluginFileType.video)) {
        tabs.push(`info_plugin-${item.key}`);
        continue;
      }

      if (
        isFileSelection &&
        item.value.filesType.includes(PluginFileType.file)
      ) {
        if (
          item.value.filesExsts &&
          !item.value.filesExsts.includes(fileExst)
        ) {
          continue;
        }
        tabs.push(`info_plugin-${item.key}`);
        continue;
      }

      if (
        !isFileSelection &&
        item.value.filesType.includes(PluginFileType.folder)
      ) {
        tabs.push(`info_plugin-${item.key}`);
      }
    }
  }

  return { tabs, useRoomsView };
}
