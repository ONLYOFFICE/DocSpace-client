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

import MoveReactSvgUrl from "PUBLIC_DIR/images/icons/16/move.react.svg?url";
import DownloadReactSvgUrl from "PUBLIC_DIR/images/icons/16/download.react.svg?url";
import TabletLinkReactSvgUrl from "PUBLIC_DIR/images/tablet-link.react.svg?url";
import ClearTrashReactSvgUrl from "PUBLIC_DIR/images/clear.trash.react.svg?url";
import copy from "copy-to-clipboard";
import { toastr } from "@docspace/ui-kit/components/toast";
import type {
  ContextMenuModel,
} from "@docspace/ui-kit/components/context-menu";
import type { TTranslation } from "@docspace/shared/types";
import type { TFile, TFolder } from "@docspace/shared/api/files/types";
import {
  canShowManageLink,
} from "@docspace/shared/components/share/Share.helpers";
import { isRoom as isRoomUtil } from "@docspace/shared/utils/typeGuards";
import {
  getInfoPanelOpen,
  openMembersTab,
  openShareTab,
} from "SRC_DIR/helpers/info-panel";
import type { TContextItem } from "./helpers";
import type ContextOptionsStore from "../ContextOptionsStore";

export const getHeaderOptionsImpl = (
self: ContextOptionsStore,
  t: TTranslation,
  item: TContextItem,

): ContextMenuModel[]=> {
  const {
    isRecycleBinFolder,
    isArchiveFolder,
    isTemplatesFolder,
    isPersonalReadOnly,
  } = self.treeFoldersStore;
  const { roomsForDelete, roomsForRestore } = self.filesStore;

  const canRestoreAll = roomsForRestore.length > 0;
  const canDeleteAll = roomsForDelete.length > 0;

  if (self.publicRoomStore.isPublicRoom) {
    return [
      {
        key: "public-room_share",
        label: t("Common:CopySharedLink"),
        icon: TabletLinkReactSvgUrl,
        onClick: () => {
          copy(window.location.href);
          toastr.success(t("Common:LinkCopySuccess"));
        },
        disabled: self.settingsStore.isFrame,
      },
      {
        key: "separator0",
        isSeparator: true,
        disabled: !item.security?.Download || self.settingsStore.isFrame,
      },
      {
        key: "public-room_edit",
        label: t("Common:Download"),
        icon: DownloadReactSvgUrl,
        onClick: () => {
          self.onClickDownload(item, t);
        },
        disabled: !item.security?.Download,
      },
    ];
  }

  if (isRecycleBinFolder) {
    return [
      {
        id: "header_option_empty-trash",
        key: "empty-trash",
        label: t("Common:EmptySection", {
          sectionName: t("Common:TrashSection"),
        }),
        onClick: self.onEmptyTrashAction,
        icon: ClearTrashReactSvgUrl,
        disabled: false,
      },
      {
        id: "header_option_restore-all",
        key: "restore-all",
        label: t("Common:RestoreAll"),
        onClick: self.onRestoreAllAction,
        icon: MoveReactSvgUrl,
        disabled: false,
      },
    ];
  }

  if (isArchiveFolder) {
    return [
      {
        id: "header_option_empty-archive",
        key: "empty-archive",
        label: t("ArchiveAction"),
        onClick: self.onEmptyTrashAction,
        disabled: !canDeleteAll,
        icon: ClearTrashReactSvgUrl,
      },
      {
        id: "header_option_restore-all",
        key: "restore-all",
        label: t("Common:RestoreAll"),
        onClick: self.onRestoreAllArchiveAction,
        disabled: !canRestoreAll,
        icon: MoveReactSvgUrl,
      },
    ];
  }

  if (isTemplatesFolder) {
    return [];
  }

  if (isPersonalReadOnly) {
    return [
      {
        id: "header_option_download-all",
        key: "download-all",
        label: t("Files:DownloadAll"),
        onClick: self.onDownloadAllAction,
        icon: MoveReactSvgUrl,
        disabled: false,
      },
      {
        id: "header_option_empty-section",
        key: "empty-section",
        label: t("Common:EmptySection", {
          sectionName: t("Common:Files"),
        }),
        onClick: self.onEmptyPersonalAction,
        icon: ClearTrashReactSvgUrl,
        disabled: false,
      },
    ];
  }

  return self.getFilesContextOptions(item, t, false, true);
};


export const getManageLinkOptionsImpl = (
self: ContextOptionsStore,item: TContextItem
)=> {
  const isRoom = isRoomUtil(item);

  const openTab = () => {
    if (isRoom) return openMembersTab();

    openShareTab();
  };

  const infoView = isRoom
    ? self.infoPanelStore.roomsView
    : self.infoPanelStore.fileView;

  const { infoPanelSelection } = self.infoPanelStore;

  // canShowManageLink expects TFile | TFolder while items
  // here are .js view-models — the casts keep the original unchecked call.
  return {
    canShowLink: canShowManageLink(
      item as TFile | TFolder,
      infoPanelSelection as TFile | TFolder | null,
      getInfoPanelOpen(),
      infoView,
    ),
    onClickLink: () => {
      self.filesStore.setSelection([]);
      self.filesStore.setBufferSelection(item);
      openTab();
    },
  };
};

