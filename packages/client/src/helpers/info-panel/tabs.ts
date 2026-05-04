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

import { FolderType } from "@docspace/shared/enums";
import { isRoom as isRoomUtil } from "@docspace/shared/utils/typeGuards";
import type { TRoom } from "@docspace/shared/api/rooms/types";
import type { TFile, TFolder } from "@docspace/shared/api/files/types";

import { PluginFileType } from "SRC_DIR/helpers/plugins/enums";
import type { InfoPanelViewType } from "SRC_DIR/store/InfoPanelStore";

import { InfoPanelView } from "./index";

type TSelection =
  | TRoom
  | TFolder
  | TFile
  | null
  | (TRoom | TFolder | TFile)[];

type TPluginItem = {
  key: string;
  value: {
    filesType?: PluginFileType[];
    filesExsts?: string[];
    subMenu: { name: string };
  };
};

export type TGetAvailableInfoPanelTabsParams = {
  selection: TSelection;
  isTrash: boolean;
  isRecentFolder: boolean;
  enablePlugins: boolean;
  infoPanelItemsList: TPluginItem[];
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
  enablePlugins,
  infoPanelItemsList,
}: TGetAvailableInfoPanelTabsParams): TInfoPanelTabsResult {
  const detailsOnly: TInfoPanelTabsResult = {
    tabs: [InfoPanelView.infoDetails],
    useRoomsView: false,
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

  const isRoomsType =
    !isRecentFolder &&
    isRoomUtil(selection) &&
    "rootFolderType" in selection &&
    (selection.rootFolderType === FolderType.Rooms ||
      selection.rootFolderType === FolderType.Archive);

  const isAgentType =
    !isRecentFolder &&
    "rootFolderType" in selection &&
    "roomType" in selection &&
    !!selection.roomType &&
    selection.rootFolderType === FolderType.AIAgents;

  const isAIAgentsSection =
    "rootFolderType" in selection &&
    selection.rootFolderType === FolderType.AIAgents;

  const useRoomsView = isRoomsType || isAgentType;

  const tabs: InfoPanelViewType[] = [];

  if (useRoomsView) {
    tabs.push(InfoPanelView.infoMembers);
  } else if (
    "canShare" in selection &&
    selection.canShare &&
    !isRoomUtil(selection)
  ) {
    tabs.push(InfoPanelView.infoShare);
  }

  tabs.push(InfoPanelView.infoHistory, InfoPanelView.infoDetails);

  if (!isAIAgentsSection && enablePlugins && infoPanelItemsList.length > 0) {
    const hasRoomType = "roomType" in selection && !!selection.roomType;
    const fileExst = "fileExst" in selection ? (selection.fileExst ?? "") : "";

    for (const item of infoPanelItemsList) {
      if (!item.value.filesType) {
        tabs.push(`info_plugin-${item.key}`);
        continue;
      }

      if (hasRoomType && item.value.filesType.includes(PluginFileType.room)) {
        tabs.push(`info_plugin-${item.key}`);
        continue;
      }

      if (fileExst && item.value.filesType.includes(PluginFileType.file)) {
        if (
          item.value.filesExsts &&
          !item.value.filesExsts.includes(fileExst)
        ) {
          continue;
        }
        tabs.push(`info_plugin-${item.key}`);
        continue;
      }

      if (item.value.filesType.includes(PluginFileType.folder)) {
        tabs.push(`info_plugin-${item.key}`);
      }
    }
  }

  return { tabs, useRoomsView };
}
