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

import FileActionsOwnerReactSvgUrl from "PUBLIC_DIR/images/file.actions.owner.react.svg?url";
import HistoryReactSvgUrl from "PUBLIC_DIR/images/history.react.svg?url";
import HistoryFinalizedReactSvgUrl from "PUBLIC_DIR/images/history-finalized.react.svg?url";
import MoveReactSvgUrl from "PUBLIC_DIR/images/icons/16/move.react.svg?url";
import BackupSvgUrl from "PUBLIC_DIR/images/icons/16/backup.svg?url";
import CheckBoxReactSvgUrl from "PUBLIC_DIR/images/check-box.react.svg?url";
import FolderReactSvgUrl from "PUBLIC_DIR/images/folder.react.svg?url";
import ReconnectSvgUrl from "PUBLIC_DIR/images/reconnect.svg?url";
import SettingsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.settings.react.svg?url";
import FolderLocationReactSvgUrl from "PUBLIC_DIR/images/folder.location.react.svg?url";
import TickRoundedSvgUrl from "PUBLIC_DIR/images/tick.rounded.svg?url";
import FavoritesReactSvgUrl from "PUBLIC_DIR/images/favorite.react.svg?url";
import FavoritesFillReactSvgUrl from "PUBLIC_DIR/images/favorite.fill.react.svg?url";
import DownloadReactSvgUrl from "PUBLIC_DIR/images/icons/16/download.react.svg?url";
import CircleCrossSvgUrl from "PUBLIC_DIR/images/icons/16/circle.cross.svg?url";
import DownloadAsReactSvgUrl from "PUBLIC_DIR/images/download-as.react.svg?url";
import RenameReactSvgUrl from "PUBLIC_DIR/images/rename.react.svg?url";
import RemoveSvgUrl from "PUBLIC_DIR/images/remove.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/trash.react.svg?url";
import LockedReactSvgUrl from "PUBLIC_DIR/images/icons/16/locked.react.svg?url";
import CopyReactSvgUrl from "PUBLIC_DIR/images/icons/16/copy.react.svg?url";
import DuplicateReactSvgUrl from "PUBLIC_DIR/images/icons/16/duplicate.react.svg?url";
import FormFillRectSvgUrl from "PUBLIC_DIR/images/form.fill.rect.svg?url";
import AccessEditReactSvgUrl from "PUBLIC_DIR/images/access.edit.react.svg?url";
import EyeReactSvgUrl from "PUBLIC_DIR/images/eye.react.svg?url";
import FormPlusReactSvgUrl from "PUBLIC_DIR/images/form.plus.react.svg?url";
import PersonReactSvgUrl from "PUBLIC_DIR/images/person.react.svg?url";
import InfoOutlineReactSvgUrl from "PUBLIC_DIR/images/info.outline.react.svg?url";
import ShareReactSvgUrl from "PUBLIC_DIR/images/share.react.svg?url";
import InvitationLinkReactSvgUrl from "PUBLIC_DIR/images/invitation.link.react.svg?url";
import EditIndexReactSvgUrl from "PUBLIC_DIR/images/edit.index.react.svg?url";
import TabletLinkReactSvgUrl from "PUBLIC_DIR/images/tablet-link.react.svg?url";
import RoomArchiveSvgUrl from "PUBLIC_DIR/images/room.archive.svg?url";
import LeaveRoomSvgUrl from "PUBLIC_DIR/images/logout.react.svg?url";
import CatalogRoomsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.rooms.react.svg?url";
import RemoveOutlineSvgUrl from "PUBLIC_DIR/images/remove.react.svg?url";
import CodeReactSvgUrl from "PUBLIC_DIR/images/code.react.svg?url";
import ExportRoomIndexSvgUrl from "PUBLIC_DIR/images/icons/16/export-room-index.react.svg?url";
import AccessNoneReactSvgUrl from "PUBLIC_DIR/images/access.none.react.svg?url";
import HelpCenterReactSvgUrl from "PUBLIC_DIR/images/help.center.react.svg?url";
import CustomFilterReactSvgUrl from "PUBLIC_DIR/images/icons/16/custom-filter.react.svg?url";
import RefreshReactSvgUrl from "PUBLIC_DIR/images/icons/16/refresh.react.svg?url";
import AISvgUrl from "PUBLIC_DIR/images/icons/16/AI.svg?url";
import spreadsheetUrl from "PUBLIC_DIR/images/icons/16/spreadsheet.svg?url";
import DotsHorizontalUrl from "PUBLIC_DIR/images/icons/16/dots-horizontal.react.svg?url";
import CreateTemplateSvgUrl from "PUBLIC_DIR/images/template.react.svg?url";
import CreateRoomReactSvgUrl from "PUBLIC_DIR/images/create.room.react.svg?url";
import CreateGroupReactSvgUrl from "PUBLIC_DIR/images/folder.react.svg?url";
import AddToGroupReactSvgUrl from "PUBLIC_DIR/images/folder.location.react.svg?url";
import copy from "copy-to-clipboard";
import { isMobile, isTablet } from "react-device-detect";
import { toastr } from "@docspace/ui-kit/components/toast";
import type { ContextMenuModel } from "@docspace/ui-kit/components/context-menu";
import type { TTranslation } from "@docspace/shared/types";
import type { TRoom } from "@docspace/shared/api/rooms/types";
import {
  isMobile as isMobileUtils,
  isLockedSharedRoom,
  trimSeparator,
} from "@docspace/shared/utils";
import {
  connectedCloudsTypeTitleTranslation,
  removeOptions,
} from "SRC_DIR/helpers/filesUtils";
import {
  AnalyticsEvents,
  RoomsType,
  Events,
  FolderType,
  UrlActionType,
  FilesSelectorFilterTypes,
  FilterType,
  FileExtensions,
  ShareAccessRights,
  FormFillingManageAction,
} from "@docspace/shared/enums";
import {
  FILLING_STATUS_ID,
  SHARED_WITH_ME_PATH,
} from "@docspace/shared/constants";
import {
  isFile as isFileUtil,
  isFolder,
  isFolder as isFolderUtil,
  isRoom as isRoomUtil,
} from "@docspace/shared/utils/typeGuards";
import { getBrandName } from "@docspace/shared/constants/brands";
import {
  createMenuGroup,
  filterModel,
  onClickEditAgent,
  onClickEditRoom as onClickEditRoomHelper,
  onClickLinkForPortal,
  onEditRoomTemplate,
  onShowEditingToast,
  onShowInfoPanel as onShowInfoPanelHelper,
  onShowWaitOperationToast,
  onSuggestOformChanges,
  onUploadAction,
  placePlugins,
  systemFolders,
} from "./helpers";
import type {
  TContextItem,
  TContextItemSecurity,
  TContextOption,
  TMenuGroupConfig,
  TStoreCustomEvent,
} from "./helpers";
import type ContextOptionsStore from "../ContextOptionsStore";

type TSelectionItem = TContextItem & {
  contextOptions: string[];
  security: TContextItemSecurity;
};

export const getFilesContextOptionsImpl = (
  self: ContextOptionsStore,
  item: TContextItem,
  t: TTranslation,
  isInfoPanel?: boolean,
  isHeader?: boolean,
): ContextMenuModel[] => {
  const optionsToRemove = isInfoPanel
    ? ["select", "open", "room-info", "show-info"]
    : isHeader
      ? ["select"]
      : [];

  if (!item.contextOptions) {
    const contextOptions = self.filesStore.getFilesContextOptions(
      item,
      optionsToRemove,
    );
    item = { ...item, contextOptions };
  } else {
    // removeOptions lives in the untyped filesUtils.js
    // helper — the cast restores the string[] type of the filtered list.
    item.contextOptions = removeOptions(
      item.contextOptions,
      optionsToRemove,
    ) as string[];
  }

  const { isPublicRoom } = self.publicRoomStore;

  // contextOptions is guaranteed by the branch above — the
  // cast keeps the original unchecked destructuring.
  const { contextOptions, isEditing } = item as TSelectionItem;

  const isRootThirdPartyFolder =
    item.providerKey && item.id === item.rootFolderId;

  // const isShareable = self.treeFoldersStore.isPersonalRoom
  //   ? item.canShare || (item.isFolder && item.security?.CreateRoomFrom)
  //   : false;

  const isMedia =
    item.viewAccessibility?.ImageView || item.viewAccessibility?.MediaView;

  const hasInfoPanel = contextOptions.includes("show-info");

  const withAI = contextOptions.includes("ask-ai");

  // const emailSendIsDisabled = true;
  const showSeparator0 =
    item.inRoom &&
    (hasInfoPanel ||
      !isMedia ||
      (item.external && item.isLinkExpired) ||
      withAI); // || !emailSendIsDisabled;

  const separator0 = showSeparator0
    ? {
        key: "separator0",
        isSeparator: true,
      }
    : false;

  const onlyShowVersionHistory =
    !contextOptions.includes("finalize-version") &&
    contextOptions.includes("show-version-history");

  const versionActions = onlyShowVersionHistory
    ? [
        {
          id: "option_show-version-history",
          key: "show-version-history",
          label: t("Common:ShowVersionHistory"),
          icon: HistoryReactSvgUrl,
          onClick: () =>
            self.showVersionHistory(
              item.id,
              item.security,
              item?.requestToken,
            ),
          disabled: false,
        },
      ]
    : [
        {
          id: "option_version",
          key: "version",
          label: t("VersionHistory"),
          icon: HistoryFinalizedReactSvgUrl,
          items: [
            {
              id: "option_finalize-version",
              key: "finalize-version",
              label: t("FinalizeVersion"),
              icon: HistoryFinalizedReactSvgUrl,
              onClick: () =>
                isEditing
                  ? onShowEditingToast(t)
                  : self.finalizeVersion(item.id, item.security),
              disabled: false,
            },
            {
              id: "option_version-history",
              key: "show-version-history",
              label: t("Common:ShowVersionHistory"),
              icon: HistoryReactSvgUrl,
              onClick: () =>
                self.showVersionHistory(
                  item.id,
                  item.security,
                  item?.requestToken,
                ),
              disabled: false,
            },
          ],
        },
      ];

  const moveActions = [
    {
      id: "option_move-or-copy",
      key: "move",
      label: t("Common:MoveOrCopy"),
      icon: CopyReactSvgUrl,
      items: [
        {
          id: "option_move-to",
          key: "move-to",
          label: t("Common:MoveTo"),
          icon: MoveReactSvgUrl,
          onClick: isEditing
            ? () => onShowEditingToast(t)
            : () => self.onMoveAction(item),
          disabled: false,
        },
        {
          id: "option_copy-to",
          key: "copy-to",
          label: t("Common:Copy"),
          icon: CopyReactSvgUrl,
          onClick: () => self.onCopyAction(item),
          disabled: false,
        },
        {
          id: "option_create-duplicate",
          key: "duplicate",
          label: t("Common:Duplicate"),
          icon: DuplicateReactSvgUrl,
          onClick: () => self.onDuplicate(item, t),
          disabled: false,
        },
      ],
    },
  ];

  const { pinOptions, muteOptions } = self.getRoomsRootContextOptions(
    item,
    t,
  );

  let withOpen = item.id !== self.selectedFolderStore.id;
  const isPublicRoomType =
    item.roomType === RoomsType.PublicRoom ||
    item.roomType === RoomsType.FormRoom ||
    item.roomType === RoomsType.CustomRoom;

  const { navigationPath } = self.selectedFolderStore;

  if (item.isRoom && withOpen) {
    withOpen = navigationPath.findIndex((f) => f.id === item.id) === -1;
  }

  const isArchive = item.rootFolderType === FolderType.Archive;
  const isFormRoom = item.roomType === RoomsType.FormRoom;
  const isAIAgent =
    item.isAIAgent ??
    (item.rootFolderType === FolderType.AIAgents &&
      item.roomType === RoomsType.AIRoom);

  const isKnowledgeOrResult =
    item.isAIAgent && (item.isInsideKnowledge || item.isInsideResultStorage);

  const hasShareLinkRights = isPublicRoom
    ? item.security?.Read
    : item.shared
      ? item.security?.CopySharedLink
      : item.security?.EditAccess;

  const { isFiltered } = self.filesStore;
  const { isIndexedFolder, security } = self.selectedFolderStore;

  const indexOptions = {
    id: "option_edit-index",
    key: "edit-index",
    label: t("Common:EditIndex"),
    icon: EditIndexReactSvgUrl,
    onClick: () => self.onEditIndex(),
    disabled: !security?.EditRoom || !isIndexedFolder || isFiltered,
  };

  const isTemplateOwner =
    item.access === ShareAccessRights.None ||
    item.access === ShareAccessRights.FullAccess;

  const isRoomAdmin =
    item.access === ShareAccessRights.RoomManager ||
    item.access === ShareAccessRights.None;

  const optionsModel: (TContextOption | false)[] = [
    {
      id: "option_select",
      key: "select",
      label: t("Common:SelectAction"),
      icon: CheckBoxReactSvgUrl,
      onClick: () => self.onSelect(item),
      disabled: false,
    },
    withOpen && {
      id: "option_open",
      key: "open",
      label: t("Common:Open"),
      icon: FolderReactSvgUrl,
      onClick: () => self.onOpenFolder(item, t),
      disabled:
        !self.treeFoldersStore.isFavoritesFolder &&
        !self.treeFoldersStore.isRecentFolder &&
        Boolean(item.external && item.isLinkExpired),
    },
    {
      id: "option_sync_xlsx_data",
      key: "update-xlsx-data",
      label: t("Common:SyncXlsxData"),
      icon: spreadsheetUrl,
      onClick: () => self.onSyncXlsxData(item, t),
      disabled: false,
    },
    {
      id: "option_fill-form",
      key: "fill-form",
      label: t("Common:FillFormButton"),
      icon: FormFillRectSvgUrl,
      onClick: () => self.onClickLinkFillForm(item),
      disabled: false,
    },
    {
      id: "option_open-pdf",
      key: "open-pdf",
      label: t("Common:Open"),
      icon: EyeReactSvgUrl,
      onClick: () => self.gotoDocEditor(item, false),
      disabled: false,
    },
    {
      id: "option_edit-pdf",
      key: "edit-pdf",
      label: t("Common:EditButton"),
      icon: AccessEditReactSvgUrl,
      onClick: () => {
        if (isMobile) {
          toastr.info(t("Common:MobileEditPdfNotAvailableInfo"));
          return;
        }
        self.onOpenPDFEditDialog(item.id);
      },
      disabled: false,
    },
    {
      id: "option_edit",
      key: "edit",
      label: t("Common:EditButton"),
      icon: AccessEditReactSvgUrl,
      onClick: () => {
        const isPDF = item.fileExst === ".pdf";

        if (isPDF && isMobile) {
          toastr.info(t("Common:MobileEditPdfNotAvailableInfo"));
          return;
        }
        self.onClickLinkEdit(item);
      },
      disabled: false,
    },
    {
      id: "option_vectorization",
      key: "vectorization",
      label: t("Common:Vectorization"),
      icon: RefreshReactSvgUrl,
      onClick: () => self.filesActionsStore.retryVectorization([item]),
      disabled: !item.security?.Vectorization,
    },
    {
      id: "option_preview",
      key: "preview",
      label:
        self.treeFoldersStore.isRecentFolder ||
        self.treeFoldersStore.isFavoritesFolder
          ? t("Common:Open")
          : t("Common:Preview"),
      icon: EyeReactSvgUrl,
      onClick: () =>
        self.treeFoldersStore.isRecentFolder ||
        self.treeFoldersStore.isFavoritesFolder
          ? self.gotoDocEditor(item)
          : self.onPreviewClick(item),
      disabled: false,
    },
    separator0,
    {
      id: "option_view",
      key: "view",
      label:
        self.treeFoldersStore.isRecentFolder ||
        self.treeFoldersStore.isFavoritesFolder
          ? t("Common:Open")
          : t("Common:View"),
      icon: EyeReactSvgUrl,
      onClick: (fileId) => self.onMediaFileClick(fileId, item),
      disabled: false,
    },
    {
      id: "option_pdf-view",
      key: "pdf-view",
      label: "Pdf viewer",
      icon: EyeReactSvgUrl,
      onClick: (fileId) => self.onMediaFileClick(fileId, item),
      disabled: false,
    },
    {
      id: "option_make-form",
      key: "make-form",
      label: t("Common:MakeForm"),
      icon: FormPlusReactSvgUrl,
      onClick: () => self.onClickMakeForm(item, t),
      disabled: false,
    },
    ...pinOptions,
    ...muteOptions,
    {
      key: "separator1",
      isSeparator: true,
    },
    {
      id: "option_edit-room",
      key: "edit-room",
      label: t("Common:EditRoom"),
      icon: SettingsReactSvgUrl,
      onClick: () => self.onClickEditRoom(item),
      disabled: false,
    },
    {
      id: "option_edit-agent",
      key: "edit-agent",
      label: t("Common:EditAgent"),
      icon: SettingsReactSvgUrl,
      onClick: () => onClickEditAgent(item),
      disabled: false,
    },
    {
      id: "option_invite-users-to-room",
      key: "invite-users-to-room",
      label: t("Common:InviteContacts"),
      icon: PersonReactSvgUrl,
      onClick: () => self.onClickInviteUsers(item.id, item.roomType),
      disabled: false,
    },
    {
      id: "option_link-for-room-members",
      key: "link-for-room-members",
      label: t("Common:CopyLink"),
      icon: InvitationLinkReactSvgUrl,
      onClick: () => self.onCopyLink(item, t),
      disabled: item.isTemplate
        ? false
        : (!item.isRoom && item.canShare) ||
          (isPublicRoomType && hasShareLinkRights) ||
          Boolean(
            item.external && (item.isLinkExpired || item.passwordProtected),
          ),
    },
    {
      id: "option_ask-ai",
      key: "ask-ai",
      label: t("Common:AskAI"),
      icon: AISvgUrl,
      onClick: () => self.askAI(item),
      disabled: false,
    },
    {
      key: "separator6",
      isSeparator: true,
    },
    {
      id: "option_start-filling",
      key: "start-filling",
      label: t("Common:StartFilling"),
      icon: FormFillRectSvgUrl,
      onClick: () => self.onClickStartFilling(item, t),
      disabled: false,
    },
    {
      id: "option_reset-and-start-filling",
      key: "reset-and-start-filling",
      label: t("Common:ResetAndStartFilling"),
      icon: BackupSvgUrl,
      onClick: () => self.onClickResetAndStartFilling(item),
      disabled: false,
    },
    {
      id: "option_filling-status",
      key: "filling-status",
      label: t("Common:FillingStatus"),
      icon: FormFillRectSvgUrl,
      onClick: () => self.onFillingStatus(item),
      disabled: false,
    },
    {
      key: "separator-SubmitToGallery",
      isSeparator: true,
    },
    {
      id: "option_reconnect-storage",
      key: "reconnect-storage",
      label: t("Common:ReconnectStorage"),
      icon: ReconnectSvgUrl,
      onClick: () => self.onClickReconnectStorage(item, t),
      disabled: !item.security?.Reconnect || !item.security?.EditRoom,
    },
    {
      id: "option_create-room",
      key: "create-room-from-template",
      label: t("Common:CreateRoom"),
      icon: CreateRoomReactSvgUrl,
      onClick: () => self.filesActionsStore.onCreateRoomFromTemplate(item),
      disabled: false,
    },
    {
      id: "option_edit-room",
      key: "edit-template",
      label: t("EditTemplate"),
      icon: SettingsReactSvgUrl,
      onClick: () => onEditRoomTemplate(item),
      disabled: !isTemplateOwner,
    },
    {
      id: "option_save-as-template",
      key: "save-as-template",
      label: t("SaveAsTemplate"),
      icon: CreateTemplateSvgUrl,
      onClick: () => self.onSaveAsTemplate(item),
      // the original .js uses the providerKey string itself
      // as the truthy "disabled" value — TContextOption allows it.
      disabled: !item.security?.Create || item.providerKey,
    },
    {
      id: "option_create-duplicate-room",
      key: "duplicate-room",
      label: t("Common:Duplicate"),
      icon: DuplicateReactSvgUrl,
      onClick: () => self.onDuplicate(item, t),
      disabled: !item.security?.Duplicate,
    },
    {
      id: "option_reconnect-storage",
      key: "reconnect-storage",
      label: t("Common:ReconnectStorage"),
      icon: ReconnectSvgUrl,
      onClick: () => self.onClickReconnectStorage(item, t),
      disabled: !item.security?.Reconnect || !item.security?.EditRoom,
    },
    {
      id: "option_access-settings",
      key: "access-settings",
      label: t("AccessSettingsTitle"),
      icon: PersonReactSvgUrl,
      onClick: () => self.onOpenTemplateAccessOptions(),
      disabled: !isTemplateOwner,
    },
    // {
    //   id: "option_copy-general-link",
    //   key: "copy-general-link",
    //   label: t("Common:CopySharedLink"),
    //   icon: TabletLinkReactSvgUrl,
    //   disabled: !isShareable,
    //   onClick: () => self.getManageLink(item, t),
    // },
    {
      id: "option_copy-shared-link",
      key: "copy-shared-link",
      label: t("Common:CopySharedLink"),
      icon: TabletLinkReactSvgUrl,
      onClick: () => self.handleCopyPrimaryLink(item, t),
      disabled: !item.canShare,
    },
    {
      id: "option_manage-links",
      key: "manage-links",
      label: t("Common:SharingSettings"),
      icon: SettingsReactSvgUrl,
      onClick: () => self.onClickShare(item),
      disabled: !item.canShare,
    },
    {
      id: "option_copy-external-link",
      key: "external-link",
      label: t("Common:CopySharedLink"),
      icon: TabletLinkReactSvgUrl,
      disabled:
        !hasShareLinkRights || Boolean(item.external && item.isLinkExpired),
      onClick: () => self.onCreateAndCopySharedLink(item, t),
      // onLoad: () => self.onLoadLinks(t, item),
    },
    {
      id: "option_download",
      key: "download",
      label: t("Common:Download"),
      icon: DownloadReactSvgUrl,
      onClick: () => {
        if (isLockedSharedRoom(item as TRoom))
          return self.dialogsStore.setPasswordEntryDialog(
            true,
            item as TRoom,
            true,
          );

        self.onClickDownload(item, t);
      },
      disabled:
        (!item.security?.Download && !isLockedSharedRoom(item as TRoom)) ||
        Boolean(item.external && item.isLinkExpired),
    },
    {
      id: "option_download-encrypted",
      key: "download-encrypted",
      label: t("Common:DownloadWithoutDecryption"),
      icon: DownloadReactSvgUrl,
      onClick: () => self.onClickDownloadEncrypted(item, t),
      disabled: !item.security?.Download,
    },
    {
      id: "option_room-info",
      key: "room-info",
      label: item.isAIAgent ? t("Common:AgentInfo") : t("Common:RoomInfo"),
      icon: InfoOutlineReactSvgUrl,
      onClick: () => self.onShowInfoPanel(item),
      disabled: isPublicRoom || Boolean(item.external && item.isLinkExpired),
    },
    {
      id: "option_create-group",
      key: "create-group",
      label: t("GroupingRooms:CreateAGroup"),
      icon: CreateGroupReactSvgUrl,
      onClick: () =>
        self.dialogsStore.setEditRoomGroupsDialogVisible(true, [item.id]),
      disabled: false,
    },
    {
      id: "option_add-to-group",
      key: "add-to-group",
      label: t("GroupingRooms:AddToGroup"),
      icon: AddToGroupReactSvgUrl,
      items: self.dialogsStore.roomGroups.map((group) => {
        let groupIcon = CreateGroupReactSvgUrl;
        if (typeof group.icon === "string" && group.icon) {
          groupIcon = group.icon;
        } else if (
          typeof group.icon === "object" &&
          group.icon?.data?.small
        ) {
          groupIcon = `data:image/svg+xml;utf8,${encodeURIComponent(group.icon.data.small)}`;
        }
        return {
          id: `option_add-to-group-${group.id}`,
          key: `add-to-group-${group.id}`,
          label: group.name,
          icon: groupIcon,
          onClick: () =>
            self.onAddRoomsToGroup([item.id], group.id, t, group.name),
        };
      }),
      disabled: false,
    },
    {
      id: "option_export-room-index",
      key: "export-room-index",
      label: t("Files:ExportRoomIndex"),
      icon: ExportRoomIndexSvgUrl,
      onClick: () => self.onExportRoomIndex(t, item.id),
      disabled: !item.indexing || !item.security?.IndexExport,
    },
    {
      id: "option_embedding-setting",
      key: "embedding-settings",
      label: t("Common:Embed"),
      icon: CodeReactSvgUrl,
      onClick: () => self.onOpenEmbeddingSettings(item),
      disabled: !item.security?.Embed,
    },
    {
      key: "create-room-separator",
      isSeparator: true,
      disabled: !item.security?.CreateRoomFrom,
    },
    {
      id: "option_create_room",
      key: "create-room",
      label: t("Common:CreateRoom"),
      icon: CatalogRoomsReactSvgUrl,
      onClick: () => self.onCreateRoom(item, true),
      disabled: !item.security?.CreateRoomFrom,
    },
    {
      id: "option_owner-change",
      key: "owner-change",
      label: t("Common:OwnerChange"),
      icon: FileActionsOwnerReactSvgUrl,
      onClick: self.onOwnerChange,
      disabled: false,
    },
    {
      id: "option_link-for-portal-users",
      key: "link-for-portal-users",
      label: t("LinkForPortalUsers", {
        productName: getBrandName("ProductName"),
      }),
      icon: InvitationLinkReactSvgUrl,
      onClick: () => onClickLinkForPortal(item, t),
      disabled: false,
    },
    // {
    //   id: "option_send-by-email",
    //   key: "send-by-email",
    //   label: t("SendByEmail"),
    //   icon: MailReactSvgUrl,
    //   disabled: emailSendIsDisabled,
    // },

    {
      id: "option_show-info",
      key: "show-info",
      label: item.isFolder ? t("Common:FolderInfo") : t("Common:FileInfo"),
      icon: InfoOutlineReactSvgUrl,
      onClick: () => self.onShowInfoPanel(item),
      disabled: false,
    },
    {
      id: "option_change-room-owner",
      key: "change-room-owner",
      label: t("Common:ChangeRoomOwner"),
      icon: ReconnectSvgUrl,
      onClick: self.onChangeRoomOwner,
      disabled: isAIAgent,
    },
    {
      id: "option_remove-from-group",
      key: "remove-from-group",
      label: t("GroupingRooms:RemoveFromGroup"),
      icon: RemoveOutlineSvgUrl,
      onClick: () => self.onRemoveRoomsFromGroup([item.id], t),
      disabled: false,
    },
    ...versionActions,
    {
      id: "option_custom-filter",
      key: "custom-filter",
      label: item.customFilterEnabled
        ? t("Common:CustomFilterDisable")
        : t("Common:CustomFilterEnable"),
      icon: CustomFilterReactSvgUrl,
      onClick: () => self.onSetUpCustomFilter(item, t),
      disabled: Boolean(
        !isRoomAdmin &&
        item.customFilterEnabled &&
        item.customFilterEnabledBy &&
        item.customFilterEnabledBy !== self.userStore?.user?.displayName,
      ),
    },
    {
      id: "option_block-unblock-version",
      key: "block-unblock-version",
      label: item.locked ? t("Common:UnblockFile") : t("Common:BlockFile"),
      icon: LockedReactSvgUrl,
      onClick: () => self.lockFile(item, t),
      disabled: false,
    },
    {
      id: "option_open-location",
      key: "open-location",
      label: t("Common:OpenLocation"),
      icon: FolderLocationReactSvgUrl,
      onClick: () => self.onOpenLocation(item),
      disabled: !!item.requestToken,
    },
    {
      key: "separator1",
      isSeparator: true,
    },
    {
      id: "option_mark-read",
      key: "mark-read",
      label: t("MarkRead"),
      icon: TickRoundedSvgUrl,
      onClick: () => self.onClickMarkRead(item),
      disabled: false,
    },
    {
      id: "option_mark-as-favorite",
      key: "mark-as-favorite",
      label: t("Common:MarkAsFavorite"),
      icon: FavoritesReactSvgUrl,
      onClick: () => self.onClickFavorite("mark", [item], t),
      disabled: false,
    },
    {
      id: "option_create-duplicate-room",
      key: "duplicate-room",
      label: t("Common:Duplicate"),
      icon: DuplicateReactSvgUrl,
      onClick: () => self.onDuplicate(item, t),
      disabled: !item.security?.Duplicate,
    },
    {
      id: "option_remove-shared-room",
      key: "remove-shared-room",
      label: t("Common:RemoveFromList"),
      icon: CircleCrossSvgUrl,
      onClick: () => self.onRemoveSharedFilesOrFolder([item]),
      disabled:
        self.userStore?.user?.isAdmin ||
        self.userStore?.user?.isOwner ||
        !item.external,
    },
    {
      id: "option_download-as",
      key: "download-as",
      label: t("Common:DownloadAs"),
      icon: DownloadAsReactSvgUrl,
      onClick: self.onClickDownloadAs,
      disabled: !item.security?.Download,
    },
    ...moveActions,
    {
      id: "option_restore",
      key: "restore",
      label: t("Common:Restore"),
      icon: MoveReactSvgUrl,
      onClick: self.onRestoreAction,
      disabled: false,
    },
    indexOptions,
    {
      id: "option_rename",
      key: "rename",
      label: t("Common:Rename"),
      icon: RenameReactSvgUrl,
      onClick: () => self.onClickRename(item),
      disabled: false,
    },
    {
      key: "separator3",
      isSeparator: true,
    },
    {
      id: "option_unsubscribe",
      key: "unsubscribe",
      label: t("Common:RemoveFromList"),
      icon: RemoveSvgUrl,
      onClick: self.onClickUnsubscribe,
      disabled: false,
    },
    {
      id: "option_change-thirdparty-info",
      key: "change-thirdparty-info",
      label: t("Translations:ThirdPartyInfo"),
      icon: AccessEditReactSvgUrl,
      onClick: () => self.onChangeThirdPartyInfo(item.providerKey),
      disabled: false,
    },
    {
      id: "option_short-tour",
      key: "short-tour",
      label: t("FormFillingTipsDialog:WelcomeStartTutorial"),
      icon: HelpCenterReactSvgUrl,
      onClick: () => self.onEnableFormFillingGuid(t, item.roomType),
      disabled:
        isArchive ||
        !isFormRoom ||
        isMobileUtils() ||
        item.id !== self.selectedFolderStore.id,
    },
    {
      id: "option_change-room-owner",
      key: "change-agent-owner",
      label: t("Common:OwnerChange"),
      icon: ReconnectSvgUrl,
      onClick: self.onChangeRoomOwner,
      disabled: !isAIAgent,
    },
    {
      id: "option_leave-room",
      key: "leave-room",
      label: isAIAgent ? t("Common:LeaveTheAgent") : t("Common:LeaveTheRoom"),
      icon: LeaveRoomSvgUrl,
      onClick: self.onLeaveRoom,
      disabled: isKnowledgeOrResult
        ? false
        : isArchive || !item.inRoom || isPublicRoom || Boolean(item.external),
    },
    {
      id: "option_archive-room",
      key: "archive-room",
      label: t("Common:MoveToArchive"),
      icon: RoomArchiveSvgUrl,
      onClick: () => self.onClickArchive("archive"),
      disabled: false,
    },
    {
      id: "option_unarchive-room",
      key: "unarchive-room",
      label: t("Common:Restore"),
      icon: MoveReactSvgUrl,
      onClick: (e) => self.onClickArchive("unarchive"),
      disabled: false,
    },
    {
      key: "separator5",
      isSeparator: true,
    },
    {
      id: "option_remove-from-favorites",
      key: "remove-from-favorites",
      label: t("Common:RemoveFromFavorites"),
      icon: FavoritesFillReactSvgUrl,
      onClick: () => self.onClickFavorite("remove", [item], t),
      disabled: false,
    },
    {
      id: "option_delete",
      key: "delete",
      label: isRootThirdPartyFolder
        ? t("Common:Disconnect")
        : isAIAgent
          ? t("Common:DeleteAgent")
          : item.isTemplate
            ? t("Files:DeleteTemplateAction")
            : item.isRoom
              ? t("Common:DeleteRoom")
              : t("Common:Delete"),
      icon:
        item.isRoom && !isAIAgent ? RemoveOutlineSvgUrl : TrashReactSvgUrl,
      onClick: () => self.onDelete(item, t),
      disabled: item.isTemplate ? !isTemplateOwner : false,
    },
    {
      id: "option_remove-from-recent",
      key: "remove-from-recent",
      label: t("Common:RemoveFromList"),
      icon: RemoveOutlineSvgUrl,
      onClick: () => self.onClickRemoveFromRecent(item, t),
      disabled: !self.treeFoldersStore.isRecentFolder,
    },
    {
      id: "option_remove-shared-file-or-folder",
      key: "remove-shared-folder-or-file",
      label: t("Common:RemoveFromList"),
      icon: CircleCrossSvgUrl,
      onClick: () => {
        self.dialogsStore.setUnsubscribe(true);
        self.dialogsStore.setDeleteDialogVisible(true);
      },
      disabled:
        // FIXME: temporary hack — backend should expose a flag to disable this
        typeof window !== "undefined"
          ? !window?.location?.pathname.includes(SHARED_WITH_ME_PATH)
          : false,
    },
    {
      key: "separate-stop-filling",
      isSeparator: true,
    },
    {
      id: "option_stop-filling",
      key: "stop-filling",
      label: t("Common:StopFilling"),
      icon: AccessNoneReactSvgUrl,
      onClick: () =>
        self.dialogsStore.setStopFillingDialogVisible(true, item.id),
      disabled: false,
    },
  ];
  // `false` entries are skipped by filterModel's key lookup
  // exactly as in the original .js — the cast keeps that behavior.
  const options = filterModel(
    optionsModel as TContextOption[],
    contextOptions,
  );

  const pluginItems = self.onLoadPlugins(item);

  if (pluginItems.length > 0) {
    pluginItems.forEach((plugin) => {
      options.push({
        id: `option_${plugin.key}`,
        key: plugin.key,
        label: plugin.label,
        icon: plugin.icon,
        disabled: false,
        onClick: plugin.onClick,
        items: plugin.items,
      });
    });
  }

  const { isCollaborator } = self.userStore?.user || {
    isCollaborator: false,
  };

  let newOptions = options.filter(
    (option, index) =>
      !(index === 0 && option.key === "separator1") &&
      !(isCollaborator && option.key === "create-room"),
  );

  let minItemsCount = 3;
  if (item.isAIAgent && item.inRoom) {
    if (self.userStore?.user?.isAdmin || self.userStore?.user?.isOwner) {
      if (
        item.access === ShareAccessRights.RoomManager ||
        item.access === ShareAccessRights.None
      ) {
        minItemsCount = 1;
      }
    } else if (
      item.access === ShareAccessRights.RoomManager ||
      item.access === ShareAccessRights.None
    ) {
      minItemsCount = 1;
    }
  }

  const showInfoOption = newOptions.find(
    (option) => option.key === "show-info",
  );
  const showVersionHistoryOption = newOptions.find(
    (option) => option.key === "show-version-history",
  );

  const moreOptionsItemKeys: { key: string }[][] = [
    [
      { key: "save-as-template" },
      { key: "duplicate-room" },
      { key: "download" },
      { key: "room-info" },
      { key: "embedding-settings" },
      { key: "reconnect-storage" },
      { key: "export-room-index" },
    ],
    [{ key: "change-room-owner" }, { key: "change-agent-owner" }],
  ];

  const menuGroupsConfig: TMenuGroupConfig[] = [
    {
      groupKey: "more-options",
      groupLabel: t("Common:MoreOptions"),
      groupIcon: DotsHorizontalUrl,
      itemKeys: moreOptionsItemKeys,
      needsGrouping: true,
      minItemsCount,
    },
  ];

  if (!item.isRoom) {
    menuGroupsConfig.push({
      groupKey: "share",
      groupLabel: t("Common:Share"),
      groupIcon: ShareReactSvgUrl,
      itemKeys: [
        [
          { key: "link-for-room-members" },
          { key: "copy-shared-link" },
          { key: "manage-links" },
        ],
        [{ key: "create-room" }],
      ],
      needsGrouping: true,
      minItemsCount: 1,
    });
  }

  const downloadOption = newOptions.find(
    (option) => option.key === "download",
  );
  const downloadAsOption = newOptions.find(
    (option) => option.key === "download-as",
  );

  const downloadEncryptedOption = newOptions.find(
    (option) => option.key === "download-encrypted",
  );

  if (downloadOption && (downloadAsOption || downloadEncryptedOption)) {
    const originalDownloadOption = {
      ...downloadOption,
      key: "download-original",
      label: t("Common:OriginalFormat"),
    };

    newOptions = [
      ...newOptions.filter((option) => option.key !== "download"),
      originalDownloadOption,
    ];

    const downloadItemKeys: string[] = ["download-original"];
    if (downloadEncryptedOption) downloadItemKeys.push("download-encrypted");
    if (downloadAsOption) downloadItemKeys.push("download-as");

    menuGroupsConfig.push({
      groupKey: "download",
      groupLabel: downloadOption.label,
      groupIcon: downloadOption.icon,
      itemKeys: downloadItemKeys,
      needsGrouping: false,
      minItemsCount: 1,
    });
  }

  if (showInfoOption && showVersionHistoryOption) {
    menuGroupsConfig.push({
      groupKey: "info",
      groupLabel: t("Common:MoreOptions"),
      groupIcon: DotsHorizontalUrl,
      itemKeys: [
        [
          { key: "show-version-history" },
          { key: "show-info" },
          { key: "embedding-settings" },
        ],
      ],
      needsGrouping: true,
      minItemsCount: 1,
    });
  }

  const menuGroups: TContextOption[] = [];
  let keysToRemove: string[] = [];

  menuGroupsConfig.forEach((configItem) => {
    const { group, keysToRemove: groupKeysToRemove } = createMenuGroup(
      newOptions,
      configItem,
    );
    if (group) {
      menuGroups.push(group);
    }
    if (groupKeysToRemove && groupKeysToRemove.length > 0) {
      keysToRemove = [...keysToRemove, ...groupKeysToRemove];
    }
  });

  if (downloadOption && (downloadAsOption || downloadEncryptedOption)) {
    keysToRemove.push("download-original");
  }

  const resultOptions = newOptions.filter(
    (option) => !keysToRemove.includes(option.key),
  );

  if (menuGroups.length > 0) {
    const copySharedLinkIndex = resultOptions.findIndex(
      (option) => option.key === "external-link",
    );
    const copyLinkIndex = resultOptions.findIndex(
      (option) => option.key === "link-for-room-members",
    );

    const menuIndex =
      copySharedLinkIndex === -1 ? copyLinkIndex : copySharedLinkIndex;

    const insertIndex =
      menuIndex !== -1
        ? menuIndex + 1
        : (() => {
            const separatorIndex = resultOptions.findIndex((option) =>
              withAI
                ? option.key === "separator6"
                : option.key === "separator0",
            );
            return separatorIndex !== -1 ? separatorIndex + 1 : 1;
          })();

    resultOptions.splice(insertIndex, 0, ...menuGroups);
  }

  if (pluginItems.length > 0) {
    const pluginKeys = pluginItems.map((p) => p.key);

    // Remove all plugin items from resultOptions first
    for (let i = resultOptions.length - 1; i >= 0; i--) {
      if (pluginKeys.includes(resultOptions[i].key))
        resultOptions.splice(i, 1);
    }

    const defaultPlugins = pluginItems.filter((p) => !p.placement);

    // default — existing "more-options" logic unchanged
    if (defaultPlugins.length > 0) {
      const moreOptionsGroup =
        resultOptions.find((o) => o.key === "more-options") ||
        resultOptions.find((o) => o.key === "info");
      if (moreOptionsGroup) {
        // menu groups are always created with an items
        // array — the non-null assertions keep the original unchecked
        // access.
        moreOptionsGroup.items!.push({
          key: "separator-before-plugins",
          isSeparator: true,
        });
        defaultPlugins.forEach((p) => moreOptionsGroup.items!.push(p));
      } else {
        const externalLinkIdx = resultOptions.findIndex(
          (o) => o.key === "external-link",
        );
        const roomMembersLinkIdx = resultOptions.findIndex(
          (o) => o.key === "link-for-room-members",
        );
        const menuIdx =
          externalLinkIdx !== -1 ? externalLinkIdx : roomMembersLinkIdx;
        const pluginInsertIdx = menuIdx !== -1 ? menuIdx + 1 : 1;

        resultOptions.splice(pluginInsertIdx, 0, {
          id: "option_more-options",
          key: "more-options",
          label: t("Common:MoreOptions"),
          icon: DotsHorizontalUrl,
          items: defaultPlugins,
        });
      }
    }
  }

  const downloadGroupIndex = resultOptions.findIndex(
    (option) => option.key === "download",
  );
  const moveIndex = resultOptions.findIndex(
    (option) => option.key === "move" || option.key === "copy-to",
  );

  if (!item.isRoom) {
    const groups = item.isFolder
      ? [
          ["select", "open", "mark-read", "open-location"],
          [
            "update-xlsx-data",
            "share",
            "move",
            "copy-to",
            "download",
            "download-encrypted",
            "rename",
          ],
          ["mark-as-favorite", "show-info"],
          ["restore"],
          ["remove-from-favorites", "remove-shared-folder-or-file", "delete"],
        ]
      : [
          [
            "select",
            "view",
            "open-pdf",
            "fill-form",
            "edit",
            "start-filling",
            "vectorization",
            "preview",
            "mark-read",
            "open-location",
          ],
          ["filling-status", "reset-and-start-filling"],
          ["ask-ai"],
          [
            "update-xlsx-data",
            "share",
            "move",
            "copy-to",
            "download",
            "download-encrypted",
            "edit-index",
            "rename",
          ],
          [
            "mark-as-favorite",
            "block-unblock-version",
            "custom-filter",
            "info",
            "show-info",
          ],
          ["restore"],
          [
            "remove-from-favorites",
            "remove-shared-folder-or-file",
            "stop-filling",
            "delete",
          ],
        ];

    const items = resultOptions.filter((opt) => !opt.isSeparator);
    const result: TContextOption[] = [];
    let folderSeparatorIndex = 0;

    groups.forEach((group) => {
      const groupItems: TContextOption[] = [];

      group.forEach((key) => {
        const option = items.find((opt) => opt.key === key);
        if (option) groupItems.push(option);
      });

      if (groupItems.length > 0) {
        const isDeleteGroup = group.includes("delete");
        const shouldAddSeparator =
          result.length > 0 && (groupItems.length >= 2 || isDeleteGroup);

        if (group.includes("restore") || group.includes("ask-ai")) {
          result.push({
            key: `separator${folderSeparatorIndex++}`,
            isSeparator: true,
          });
        }

        if (shouldAddSeparator) {
          result.push({
            key: `separator${folderSeparatorIndex++}`,
            isSeparator: true,
          });
        }
        result.push(...groupItems);
      }
    });

    items.forEach((option) => {
      const isInGroups = groups.flat().includes(option.key);
      if (!isInGroups) {
        if (result.length > 0 && !result[result.length - 1].isSeparator) {
          result.push({
            key: `separator${folderSeparatorIndex++}`,
            isSeparator: true,
          });
        }
        result.push(option);
      }
    });

    // Insert plugin items according to their placement
    const newResult = placePlugins(result, pluginItems);

    return trimSeparator(newResult as ContextMenuModel[]);
  }

  if (downloadGroupIndex !== -1 && moveIndex !== -1) {
    // If download group is already before move, do nothing
    if (
      downloadGroupIndex < moveIndex &&
      moveIndex - downloadGroupIndex > 1
    ) {
      // If there are other items between them, move download right before move
      const downloadGroup = resultOptions.splice(downloadGroupIndex, 1)[0];
      resultOptions.splice(moveIndex - 1, 0, downloadGroup);
    } else if (downloadGroupIndex > moveIndex) {
      // If download is after move, move it before move
      const downloadGroup = resultOptions.splice(downloadGroupIndex, 1)[0];
      resultOptions.splice(moveIndex, 0, downloadGroup);
    }
  }

  const newResult = placePlugins(resultOptions, pluginItems);

  return trimSeparator(newResult as ContextMenuModel[]);
};
