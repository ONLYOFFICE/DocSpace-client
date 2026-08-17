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

import { FileStatus, FolderType, RoomsType } from "@docspace/shared/enums";
import { isLockedSharedRoom } from "@docspace/shared/utils";
import { EMPTY_ARRAY } from "@docspace/shared/constants";

import { removeOptions, removeSeparator } from "SRC_DIR/helpers/filesUtils";
import { PluginFileType } from "SRC_DIR/helpers/plugins/enums";

import type { TRoom } from "@docspace/shared/api/rooms/types";

import type { default as FilesStore } from "../FilesStore";

import type { TClientConfigWithPdfViewer, TItem } from "./types";

// Everything getFilesContextOptions reads off `this`, passed as live store
// references so the branch logic is a pure function of (item, optionsToRemove,
// deps). The FilesStore method stays a thin facade — reading each store while
// building `deps` and the reads inside this function happen in the same
// reactive context, so MobX reactivity is unchanged. Indexed access types
// keep each dep exactly in sync with the FilesStore field it mirrors.
export type BuildContextOptionsDeps = {
  treeFoldersStore: FilesStore["treeFoldersStore"];
  selectedFolderStore: FilesStore["selectedFolderStore"];
  settingsStore: FilesStore["settingsStore"];
  accessRightsStore: FilesStore["accessRightsStore"];
  publicRoomStore: FilesStore["publicRoomStore"];
  pluginStore: FilesStore["pluginStore"];
  userStore: FilesStore["userStore"];
  filesSettingsStore: FilesStore["filesSettingsStore"];
  dialogsStore: FilesStore["dialogsStore"];
  roomsFilter: FilesStore["roomsFilter"];
  filterType: FilesStore["filterType"];
  filterSearch: FilesStore["filterSearch"];
};

export const buildContextOptions = (
  item: TItem,
  optionsToRemove: string[] = [],
  deps: BuildContextOptionsDeps,
) => {
  const isFile = !!item.fileExst || item.contentLength;
  const isRoom = !!item.roomType;
  const isTemplate =
    item.rootFolderType === FolderType.RoomTemplates && isRoom;
  const isAIAgent =
    item.rootFolderType === FolderType.AIAgents &&
    item.roomType === RoomsType.AIRoom;

  // the non-null assertions in this method keep the old
  // unchecked reads of optional item fields (new/fileStatus/security/
  // viewAccessibility) — the original .js relied on them being present
  // (or on JS falsy/NaN semantics) for the item kinds that reach each
  // branch.
  const hasNew =
    item.new! > 0 ||
    (item.fileStatus! & FileStatus.IsNew) === FileStatus.IsNew;
  const canConvert = item.viewAccessibility?.CanConvert;
  const mustConvert = item.viewAccessibility?.MustConvert;
  const isEncrypted = item.encrypted;
  const isDocuSign = false; // TODO: need this prop;
  const isEditing = false; // (item.fileStatus & FileStatus.IsEditing) === FileStatus.IsEditing;

  const {
    isRecycleBinFolder,
    isMy,
    isArchiveFolder,
    isRecentFolder,
    isFavoritesFolder,
    isPrivacyFolder,
    isFormRoomRoot,
  } = deps.treeFoldersStore;
  const { security } = deps.selectedFolderStore;

  const { enablePlugins } = deps.settingsStore;

  // Plugins receive only an item id and fetch the content themselves, so they
  // can neither decrypt it nor be trusted with it: nothing from an encrypted
  // room may be offered to them, whether it is a file, a folder or the room.
  const isFormRoomContent =
    isFormRoomRoot || item.parentRoomType === FolderType.FormRoom;

  const arePluginsAllowed =
    enablePlugins &&
    !isEncrypted &&
    !isPrivacyFolder &&
    !item.private &&
    !isFormRoomContent;

  const isThirdPartyFolder =
    item.providerKey && item.id === item.rootFolderId;

  const isMyFolder = isMy(item.rootFolderType!);

  const isRoomsSection =
    item.rootFolderType === FolderType.Rooms ||
    item.rootFolderType === FolderType.Archive;

  const { isDesktopClient } = deps.settingsStore;

  const canRenameItem = item.security?.Rename;

  const canMove = deps.accessRightsStore.canMoveItems({
    ...item,
    ...{ editing: isEditing },
  });

  const canDelete = !isEditing && item.security?.Delete;

  const canCopy = item.security?.Copy;
  const canCopyLink = item.security?.CopyLink;
  const canDuplicate = item.security?.Duplicate;
  const canDownload =
    item.security?.Download || isLockedSharedRoom(item as TRoom);
  const canEmbed = item.security?.Embed;
  const canSetUpCustomFilter = item.security?.CustomFilter;

  if (isFile) {
    const shouldFillForm = item.viewAccessibility!.WebRestrictedEditing;
    const canLockFile = item.security?.Lock;
    const canChangeVersionFileHistory =
      !isEditing && item.security?.EditHistory;

    const canViewVersionFileHistory = item.security?.ReadHistory;
    const canFillForm = item.security?.FillForms;

    const canSubmitToFormGallery = item.security?.SubmitToFormGallery;

    const canEditFile =
      item.security!.Edit && item.viewAccessibility!.WebEdit;
    const canOpenPlayer =
      item.viewAccessibility!.ImageView || item.viewAccessibility!.MediaView;
    const canViewFile = item.viewAccessibility!.WebView;

    const isOldForm =
      item.fileExst === ".docxf" || item.fileExst === ".oform"; // TODO: Remove after change security options
    const isPdf = item.fileExst === ".pdf";

    const extsCustomFilter =
      deps.filesSettingsStore?.extsWebCustomFilterEditing || EMPTY_ARRAY;
    const extsWebEdited =
      deps.filesSettingsStore?.extsWebEdited || EMPTY_ARRAY;
    const isExtsCustomFilter = extsCustomFilter.includes(item.fileExst!);
    const isExtsWebEdited = extsWebEdited.includes(item.fileExst!);
    const canShowCustomFilter =
      canSetUpCustomFilter && isExtsCustomFilter && isExtsWebEdited;

    const isSharedWithMeFolderSection =
      deps.treeFoldersStore.sharedWithMeFolderId === item.rootFolderId &&
      item.rootFolderType === FolderType.SHARE;

    let fileOptions = [
      // "open",
      "select",
      "fill-form",
      "edit",
      "open-pdf",
      "vectorization",
      "preview",
      "view",
      "pdf-view",
      "make-form",
      "edit-pdf",
      "update-xlsx-data",
      "separator0",
      "ask-ai",
      "separator6",
      "filling-status",
      "start-filling",
      "reset-and-start-filling",
      "submit-to-gallery",
      "separator-SubmitToGallery",
      "link-for-room-members",
      "sharing-settings",
      "copy-shared-link",
      "manage-links",
      "create-room-separator",
      "create-room",
      "embedding-settings",
      // "external-link",
      // "owner-change",
      // "link-for-portal-users",
      "send-by-email",
      "docu-sign",
      "version", // category
      //   "finalize-version",
      "show-version-history",
      "custom-filter",
      "show-info",
      "block-unblock-version", // need split
      "separator1",

      "open-location",
      "mark-read",
      "mark-as-favorite",
      "remove-from-favorites",
      "download",
      "download-as",
      "convert",
      "move", // category
      "move-to",
      "copy-to",
      "duplicate",
      "restore",
      "rename",
      "edit-index",
      "separator2",
      // "unsubscribe",
      "separator5",
      "delete",
      "remove-from-recent",
      "remove-shared-folder-or-file",
      "copy-general-link",
      "separate-stop-filling",
      "stop-filling",
    ];

    const noAskAi =
      !item?.security?.AskAi || isPrivacyFolder || item.private || isEncrypted;

    if (noAskAi) {
      fileOptions = removeOptions(fileOptions, ["ask-ai", "separator6"]);
    }

    if (item.external && item.isLinkExpired) {
      fileOptions = ["select", "separator0", "remove-shared-folder-or-file"];
    }

    if (optionsToRemove.length) {
      fileOptions = removeOptions(fileOptions, optionsToRemove);
    }

    if (!isSharedWithMeFolderSection) {
      fileOptions = removeOptions(fileOptions, [
        "remove-shared-folder-or-file",
      ]);
    }

    if (!item.security?.UpdateXlsx) {
      fileOptions = removeOptions(fileOptions, ["update-xlsx-data"]);
    }

    if (deps.publicRoomStore.isPublicRoom) {
      fileOptions = removeOptions(fileOptions, [
        "separator0",
        "sharing-settings",
        "send-by-email",
        "show-info",
        "separator1",
        "create-room-separator",
        "create-room",
        "separator2",
        "remove-from-recent",
        "copy-general-link",
        "mark-as-favorite",
        "remove-from-favorites",
        "copy-to",
        "ask-ai",
        "separator6",
      ]);

      if (!canMove && !canDuplicate) {
        fileOptions = removeOptions(fileOptions, ["move"]);
      }
    }

    if (!item.security?.FillingStatus) {
      fileOptions = removeOptions(fileOptions, ["filling-status"]);
    }

    if (!item.security?.StartFilling) {
      fileOptions = removeOptions(fileOptions, ["start-filling"]);
    }
    if (!item.security?.ResetFilling) {
      fileOptions = removeOptions(fileOptions, ["reset-and-start-filling"]);
    }

    if (!item.security?.StopFilling) {
      fileOptions = removeOptions(fileOptions, [
        "separate-stop-filling",
        "stop-filling",
      ]);
    }

    if (!canShowCustomFilter) {
      fileOptions = removeOptions(fileOptions, ["custom-filter"]);
    }

    if (!canDownload) {
      fileOptions = removeOptions(fileOptions, ["download"]);
    }

    if (
      !isPdf ||
      (shouldFillForm && canFillForm) ||
      isRecycleBinFolder ||
      !item.security?.OpenForm
    ) {
      fileOptions = removeOptions(fileOptions, ["open-pdf"]);
    }

    if (
      !isPdf ||
      !item.security!.EditForm ||
      item.startFilling ||
      !item.isForm
    ) {
      fileOptions = removeOptions(fileOptions, ["edit-pdf"]);
    }

    if (
      !isPdf ||
      !(window.ClientConfig as TClientConfigWithPdfViewer)?.pdfViewer ||
      isRecycleBinFolder
    ) {
      fileOptions = removeOptions(fileOptions, ["pdf-view"]);
    }

    if (!canLockFile) {
      fileOptions = removeOptions(fileOptions, ["block-unblock-version"]);
    }

    if (!canChangeVersionFileHistory) {
      fileOptions = removeOptions(fileOptions, ["finalize-version"]);
    }

    if (!canViewVersionFileHistory) {
      fileOptions = removeOptions(fileOptions, ["show-version-history"]);
    }

    if (!canChangeVersionFileHistory && !canViewVersionFileHistory) {
      fileOptions = removeOptions(fileOptions, ["version"]);
      if (item.rootFolderType === FolderType.Archive) {
        fileOptions = removeOptions(fileOptions, ["separator0"]);
      }
    }

    if (!canRenameItem) {
      fileOptions = removeOptions(fileOptions, ["rename"]);
    }

    if (canOpenPlayer || !canEditFile) {
      fileOptions = removeOptions(fileOptions, ["edit"]);
    }

    if (!(shouldFillForm && canFillForm) || !item.isForm) {
      fileOptions = removeOptions(fileOptions, ["fill-form"]);
    }

    if (!canDelete) {
      fileOptions = removeOptions(fileOptions, ["delete"]);
    }

    if (!canMove) {
      fileOptions = removeOptions(fileOptions, ["move-to"]);
    }

    if (!canCopy && !isEncrypted) {
      fileOptions = removeOptions(fileOptions, ["copy-to"]);
    }

    if (!canDuplicate) {
      fileOptions = removeOptions(fileOptions, ["duplicate"]);
    }

    if (!canMove && !canCopy && !canDuplicate && !isEncrypted) {
      fileOptions = removeOptions(fileOptions, ["move"]);
    }

    if (!(isOldForm && canDuplicate))
      fileOptions = removeOptions(fileOptions, ["make-form"]);

    if (!canSubmitToFormGallery || isOldForm) {
      fileOptions = removeOptions(fileOptions, [
        "submit-to-gallery",
        "separator-SubmitToGallery",
      ]);
    }

    if (item.rootFolderType === FolderType.Archive) {
      fileOptions = removeOptions(fileOptions, [
        "mark-read",
        "mark-as-favorite",
      ]);
    }

    if (!canConvert) {
      fileOptions = removeOptions(fileOptions, ["download-as"]);
    }

    if (!mustConvert || isEncrypted) {
      fileOptions = removeOptions(fileOptions, ["convert"]);
    }

    if (!canViewFile || isRecycleBinFolder) {
      fileOptions = removeOptions(fileOptions, ["preview"]);
    }

    if (!canOpenPlayer || isRecycleBinFolder) {
      fileOptions = removeOptions(fileOptions, ["view"]);
    }

    if (!isDocuSign) {
      fileOptions = removeOptions(fileOptions, ["docu-sign"]);
    }

    if (
      isEditing ||
      item.rootFolderType === FolderType.Archive ||
      (isFavoritesFolder && !item?.isFavorite) ||
      isFavoritesFolder ||
      isRecentFolder
    )
      fileOptions = removeOptions(fileOptions, ["separator2"]);

    if (item?.isFavorite) {
      fileOptions = removeOptions(fileOptions, ["mark-as-favorite"]);
    } else {
      fileOptions = removeOptions(fileOptions, ["remove-from-favorites"]);
    }

    if (isFavoritesFolder) {
      fileOptions = removeOptions(fileOptions, ["mark-as-favorite"]);
      fileOptions = removeOptions(fileOptions, ["delete"]);
    }

    if (isRecycleBinFolder) {
      fileOptions = removeOptions(fileOptions, [
        "mark-as-favorite",
        "remove-from-favorites",
      ]);
    }

    if (isEncrypted) {
      fileOptions = removeOptions(fileOptions, [
        "link-for-room-members",
        "sharing-settings",
        "copy-shared-link",
        "manage-links",
        "copy-general-link",
        "send-by-email",
        "create-room",
        "create-room-separator",
        "ask-ai",
        "separator6",
        "make-form",
        "submit-to-gallery",
        "separator-SubmitToGallery",
        "docu-sign",
        "custom-filter",
        "update-xlsx-data",
        "vectorization",
        "embedding-settings",
        "convert",
        "download-as",
        "mark-as-favorite",
        "rename",
        "edit-index",
        "show-version-history",
        "finalize-version",
        "version",
        "fill-form",
        "filling-status",
        "start-filling",
        "reset-and-start-filling",
        "separate-stop-filling",
        "stop-filling",
        "block-unblock-version",
      ]);

      fileOptions.push("download-encrypted");

      // Conversion runs on the server, which only ever sees ciphertext here,
      // so such a file cannot be opened from a private room by any route.
      if (mustConvert) {
        fileOptions = removeOptions(fileOptions, [
          "view",
          "pdf-view",
          "preview",
          "edit",
          "open-pdf",
          "edit-pdf",
        ]);
      }

      const userKeys = deps.userStore?.encryptionKeys;
      const hasEncryptionKeys =
        Array.isArray(userKeys) && userKeys.length > 0;

      if (!hasEncryptionKeys) {
        fileOptions = removeOptions(fileOptions, [
          "view",
          "pdf-view",
          "download",
          "preview",
          "edit",
          "open-pdf",
          "edit-pdf",
        ]);
      }
    }

    // if (isFavoritesFolder || isRecentFolder) {
    //   fileOptions = removeOptions(fileOptions, [
    //     //"unsubscribe",
    //   ]);
    // }

    if (!isRecycleBinFolder) {
      fileOptions = removeOptions(fileOptions, ["restore"]);

      if (arePluginsAllowed) {
        if (
          !item.viewAccessibility!.MediaView &&
          !item.viewAccessibility!.ImageView
        ) {
          const pluginFilesKeys = deps.pluginStore.getContextMenuKeysByType(
            PluginFileType.file,
            item.fileExst,
            security,
            item.security,
            item.id,
          );

          pluginFilesKeys &&
            pluginFilesKeys.forEach((key) => fileOptions.push(key));
        }

        if (
          !item.viewAccessibility!.MediaView &&
          item.viewAccessibility!.ImageView
        ) {
          const pluginFilesKeys = deps.pluginStore.getContextMenuKeysByType(
            PluginFileType.image,
            item.fileExst,
            security,
            item.security,
            item.id,
          );

          pluginFilesKeys &&
            pluginFilesKeys.forEach((key) => fileOptions.push(key));
        }

        if (
          item.viewAccessibility!.MediaView &&
          !item.viewAccessibility!.ImageView
        ) {
          const pluginFilesKeys = deps.pluginStore.getContextMenuKeysByType(
            PluginFileType.video,
            item.fileExst,
            security,
            item.security,
            item.id,
          );

          pluginFilesKeys &&
            pluginFilesKeys.forEach((key) => fileOptions.push(key));
        }
      }
    }

    if (!hasNew) {
      fileOptions = removeOptions(fileOptions, ["mark-read"]);
    }

    if (
      !(
        isRecentFolder ||
        isFavoritesFolder ||
        ((isMyFolder || isRoomsSection) &&
          (deps.filterType || deps.filterSearch))
      )
    ) {
      fileOptions = removeOptions(fileOptions, ["open-location"]);
    }

    if (isMyFolder || isRecycleBinFolder || !canCopyLink) {
      fileOptions = removeOptions(fileOptions, ["link-for-room-members"]);
    }

    if (deps.publicRoomStore.isPublicRoom || !canEmbed) {
      fileOptions = removeOptions(fileOptions, ["embedding-settings"]);
    }

    fileOptions = removeSeparator(fileOptions);

    return fileOptions;
  }
  if (isTemplate) {
    let templateOptions = [
      "select",
      "open",
      "separator0",
      "create-room-from-template",
      "edit-template",
      "access-settings",
      "link-for-room-members",
      "room-info",
      "separator1",
      "download",
      "delete",
    ];

    if (optionsToRemove.length) {
      templateOptions = removeOptions(templateOptions, optionsToRemove);
    }

    return templateOptions;
  } else if (isAIAgent) {
    const canInviteUserInAgent =
      item.security?.EditAccess &&
      !deps.settingsStore.aiConfig?.aiReadyNeedReset;
    const canRemoveAgent = item.security?.Delete;

    const canPinAgent = item.security?.Pin;

    const canEditAgent =
      item.security?.EditRoom &&
      !deps.settingsStore.aiConfig?.aiReadyNeedReset;

    const canViewAgentInfo = item.security?.Read;
    const canMuteAgent = item.security?.Mute;

    const canChangeOwner =
      item.security?.ChangeOwner &&
      !deps.settingsStore.aiConfig?.aiReadyNeedReset;

    let agentOptions = [
      "select",
      "open",
      "separator0",
      "edit-agent",
      "invite-users-to-room",
      "link-for-room-members",
      "room-info",
      "pin-room",
      "unpin-room",
      "mute-room",
      "unmute-room",
      "separator1",
      "duplicate-room",
      "download",
      "change-agent-owner",
      "leave-room",
      "delete",
    ];

    if (optionsToRemove.length) {
      agentOptions = removeOptions(agentOptions, optionsToRemove);
    }

    if (!canEditAgent) {
      agentOptions = removeOptions(agentOptions, ["edit-agent"]);
    }

    if (!canInviteUserInAgent) {
      agentOptions = removeOptions(agentOptions, ["invite-users-to-room"]);
    }

    if (!canChangeOwner) {
      agentOptions = removeOptions(agentOptions, ["change-agent-owner"]);
    }

    if (!canRemoveAgent) {
      agentOptions = removeOptions(agentOptions, ["delete"]);
    }

    if (!canDuplicate) {
      agentOptions = removeOptions(agentOptions, ["duplicate-room"]);
    }

    if (!canDownload) {
      agentOptions = removeOptions(agentOptions, ["download"]);
    }

    if (!canPinAgent) {
      agentOptions = removeOptions(agentOptions, ["unpin-room", "pin-room"]);
    } else {
      agentOptions = item.pinned
        ? removeOptions(agentOptions, ["pin-room"])
        : removeOptions(agentOptions, ["unpin-room"]);
    }

    if (!canMuteAgent) {
      agentOptions = removeOptions(agentOptions, [
        "unmute-room",
        "mute-room",
      ]);
    } else {
      agentOptions = item.mute
        ? removeOptions(agentOptions, ["mute-room"])
        : removeOptions(agentOptions, ["unmute-room"]);
    }

    if (!canViewAgentInfo) {
      agentOptions = removeOptions(agentOptions, ["room-info"]);
    }

    agentOptions = removeSeparator(agentOptions);

    return agentOptions;
  }
  if (isRoom) {
    const canInviteUserInRoom = item.private
      ? item.security?.EditRoom
      : item.security?.EditAccess;
    const canRemoveRoom = item.security?.Delete;

    const canArchiveRoom = item.security?.Move;
    const canPinRoom = item.security?.Pin;

    const canEditRoom = item.security?.EditRoom;

    const canViewRoomInfo =
      item.security?.Read || isLockedSharedRoom(item as TRoom);
    const canMuteRoom = item.security?.Mute && item.inRoom;

    const canChangeOwner = item.security?.ChangeOwner;

    const isPublicRoomType =
      item.roomType === RoomsType.PublicRoom ||
      item.roomType === RoomsType.FormRoom ||
      item.roomType === RoomsType.CustomRoom;

    let roomOptions = [
      "select",
      "open",
      "separator0",
      "link-for-room-members",
      "reconnect-storage",
      "edit-room",
      "invite-users-to-room",
      "external-link",
      "embedding-settings",
      "room-info",
      "create-group",
      "add-to-group",
      "remove-from-group",
      "pin-room",
      "unpin-room",
      "mute-room",
      "unmute-room",
      "edit-index",
      "short-tour",
      "export-room-index",
      "save-as-template",
      "separator1",
      "duplicate-room",
      "download",
      "download-encrypted",
      "change-room-owner",
      "archive-room",
      "unarchive-room",
      "leave-room",
      "delete",
      "remove-shared-room",
    ];

    if (!item.private) {
      roomOptions = removeOptions(roomOptions, ["download-encrypted"]);
    }

    if (!item.external) {
      roomOptions = removeOptions(roomOptions, ["remove-shared-room"]);
    }

    if (optionsToRemove.length) {
      roomOptions = removeOptions(roomOptions, optionsToRemove);
    }

    if (isArchiveFolder) {
      roomOptions = removeOptions(roomOptions, [
        "external-link",
        "link-for-room-members",
      ]);
    }

    if (!isPublicRoomType || deps.publicRoomStore.isPublicRoom) {
      roomOptions = removeOptions(roomOptions, ["external-link"]);
    }

    if (item.private) {
      roomOptions = removeOptions(roomOptions, [
        "external-link",
        "link-for-room-members",
        "embedding-settings",
        "edit-index",
        "export-room-index",
        "short-tour",
        "save-as-template",
        "duplicate-room",
        "download",
      ]);
    }

    if (!canEditRoom) {
      roomOptions = removeOptions(roomOptions, [
        "edit-room",
        "save-as-template",
        "reconnect-storage",
      ]);
    }

    if (!canInviteUserInRoom) {
      roomOptions = removeOptions(roomOptions, ["invite-users-to-room"]);
    }

    if (!canChangeOwner) {
      roomOptions = removeOptions(roomOptions, ["change-room-owner"]);
    }

    if (!canArchiveRoom) {
      roomOptions = removeOptions(roomOptions, [
        "archive-room",
        "unarchive-room",
      ]);
    }

    if (item.roomType === RoomsType.FormRoom) {
      roomOptions = removeOptions(roomOptions, ["archive-room"]);
    }

    if (!canRemoveRoom) {
      roomOptions = removeOptions(roomOptions, ["delete"]);
    }

    if (!canDuplicate) {
      roomOptions = removeOptions(roomOptions, ["duplicate-room"]);
    }

    if (!canDownload) {
      roomOptions = removeOptions(roomOptions, ["download"]);
    }

    if (!item.providerKey) {
      roomOptions = removeOptions(roomOptions, ["reconnect-storage"]);
    }

    if (!canPinRoom) {
      roomOptions = removeOptions(roomOptions, ["unpin-room", "pin-room"]);
    } else {
      item.pinned
        ? (roomOptions = removeOptions(roomOptions, ["pin-room"]))
        : (roomOptions = removeOptions(roomOptions, ["unpin-room"]));
    }

    if (!canMuteRoom) {
      roomOptions = removeOptions(roomOptions, ["unmute-room", "mute-room"]);
    } else {
      item.mute
        ? (roomOptions = removeOptions(roomOptions, ["mute-room"]))
        : (roomOptions = removeOptions(roomOptions, ["unmute-room"]));
    }

    if (deps.publicRoomStore.isPublicRoom || !canEmbed) {
      roomOptions = removeOptions(roomOptions, ["embedding-settings"]);
    }

    if (!canViewRoomInfo) {
      roomOptions = removeOptions(roomOptions, ["room-info"]);
    }

    const { organizeRoomsGrouping } = deps.filesSettingsStore;
    // dialogsStore is attached post-construction in
    // store/index.js; the non-null assertion keeps the old unchecked read.
    const { roomGroups } = deps.dialogsStore!;
    const currentGroupId = deps.roomsFilter?.groupId;
    if (
      !organizeRoomsGrouping ||
      isArchiveFolder ||
      item.rootFolderType === FolderType.Archive ||
      deps.treeFoldersStore.isAIAgentsFolder
    ) {
      roomOptions = removeOptions(roomOptions, [
        "create-group",
        "add-to-group",
        "remove-from-group",
      ]);
    } else if (!roomGroups || roomGroups.length === 0) {
      roomOptions = removeOptions(roomOptions, [
        "add-to-group",
        "remove-from-group",
      ]);
    } else if (!currentGroupId) {
      roomOptions = removeOptions(roomOptions, ["remove-from-group"]);
    }

    if (isArchiveFolder || item.rootFolderType === FolderType.Archive) {
      roomOptions = removeOptions(roomOptions, ["archive-room"]);
    } else {
      roomOptions = removeOptions(roomOptions, ["unarchive-room"]);

      if (arePluginsAllowed) {
        const pluginRoomsKeys = deps.pluginStore.getContextMenuKeysByType(
          PluginFileType.room,
          null,
          security,
          item.security,
          item.id,
        );

        pluginRoomsKeys &&
          pluginRoomsKeys.forEach((key) => roomOptions.push(key));
      }
    }

    roomOptions = removeSeparator(roomOptions);

    return roomOptions;
  }

  const isSharedWithMeFolderSection =
    deps.treeFoldersStore.sharedWithMeFolderId === item.rootFolderId &&
    item.rootFolderType === FolderType.SHARE;

  let folderOptions = [
    "select",
    "open",
    // "separator0",
    "update-xlsx-data",
    "sharing-settings",
    "copy-shared-link",
    "manage-links",
    "create-room-separator",
    "create-room",
    "link-for-room-members",
    // "owner-change",
    "show-info",
    // "link-for-portal-users",
    "separator1",
    "open-location",
    "mark-as-favorite",
    "remove-from-favorites",
    "download",
    "move", // category
    "move-to",
    "copy-to",
    "duplicate",
    "mark-read",
    "restore",
    "edit-index",
    "rename",
    // "change-thirdparty-info",
    "separator2",
    // "unsubscribe",
    "remove-shared-folder-or-file",
    "delete",
  ];

  if (item.external && item.isLinkExpired) {
    folderOptions = ["select", "separator0", "remove-shared-folder-or-file"];
  }

  if (!item.security?.UpdateXlsx) {
    folderOptions = removeOptions(folderOptions, ["update-xlsx-data"]);
  }

  if (!isSharedWithMeFolderSection) {
    folderOptions = removeOptions(folderOptions, [
      "remove-shared-folder-or-file",
    ]);
  }

  if (optionsToRemove.length) {
    folderOptions = removeOptions(folderOptions, optionsToRemove);
  }

  if (deps.publicRoomStore.isPublicRoom) {
    folderOptions = removeOptions(folderOptions, [
      "show-info",
      "sharing-settings",
      "copy-shared-link",
      "manage-links",
      "create-room-separator",
      "separator1",
      "create-room",
      "mark-as-favorite",
      "remove-from-favorites",
      "copy-to",
    ]);

    if (!canMove && !canDuplicate) {
      folderOptions = removeOptions(folderOptions, ["move"]);
    }
  }

  if (!canDownload) {
    folderOptions = removeOptions(folderOptions, ["download"]);
  }

  if (!canRenameItem) {
    folderOptions = removeOptions(folderOptions, ["rename"]);
  }

  if (!canDelete) {
    folderOptions = removeOptions(folderOptions, ["delete"]);
  }
  if (!canMove) {
    folderOptions = removeOptions(folderOptions, ["move-to"]);
  }

  if (!canCopy) {
    folderOptions = removeOptions(folderOptions, ["copy-to"]);
  }

  if (!canDuplicate) {
    folderOptions = removeOptions(folderOptions, ["duplicate"]);
  }

  if (!canMove && !canCopy && !canDuplicate) {
    folderOptions = removeOptions(folderOptions, ["move"]);
  }

  // if (item.rootFolderType === FolderType.Archive) {
  //   folderOptions = removeOptions(folderOptions, [
  //     "change-thirdparty-info",
  //     "separator2",
  //   ]);
  // }

  if (isPrivacyFolder || item.private) {
    folderOptions = removeOptions(folderOptions, [
      "sharing-settings",
      "copy-shared-link",
      "manage-links",
      "link-for-room-members",
      "create-room-separator",
      "create-room",
      "mark-as-favorite",
      "remove-from-favorites",
      "edit-index",
      "copy-to",
      "duplicate",
      "download",
    ]);

    if (!canMove) {
      folderOptions = removeOptions(folderOptions, ["move", "move-to"]);
    }

    if (canDownload) {
      folderOptions.push("download-encrypted");
    }
  }

  if (isRecycleBinFolder) {
    folderOptions = removeOptions(folderOptions, [
      "open",
      "link-for-room-members",
      // "link-for-portal-users",
      // "sharing-settings",
      "mark-read",
      "separator0",
      "separator1",
      "mark-as-favorite",
      "remove-from-favorites",
    ]);
  } else {
    folderOptions = removeOptions(folderOptions, ["restore"]);

    if (arePluginsAllowed) {
      const pluginFoldersKeys = deps.pluginStore.getContextMenuKeysByType(
        PluginFileType.folder,
        null,
        security,
        item.security,
        item.id,
      );

      pluginFoldersKeys &&
        pluginFoldersKeys.forEach((key) => folderOptions.push(key));
    }
  }

  if (!hasNew) {
    folderOptions = removeOptions(folderOptions, ["mark-read"]);
  }

  if (isThirdPartyFolder && isDesktopClient)
    folderOptions = removeOptions(folderOptions, ["separator2"]);

  // if (!isThirdPartyFolder)
  //   folderOptions = removeOptions(folderOptions, [
  //     "change-thirdparty-info",
  //   ]);

  // if (isThirdPartyItem) {

  //   if (isSharedWithMeFolder) {
  //     folderOptions = removeOptions(folderOptions, [
  //       "change-thirdparty-info",
  //     ]);
  //   } else {
  //     if (isDesktopClient) {
  //       folderOptions = removeOptions(folderOptions, [
  //         "change-thirdparty-info",
  //       ]);
  //     }

  //     folderOptions = removeOptions(folderOptions, ["remove"]);

  //     if (!item) {
  //       //For damaged items
  //       folderOptions = removeOptions(folderOptions, [
  //         "open",
  //         "download",
  //       ]);
  //     }
  //   }
  // } else {
  //   folderOptions = removeOptions(folderOptions, [
  //     "change-thirdparty-info",
  //   ]);
  // }

  if (
    !(
      isRecentFolder ||
      isFavoritesFolder ||
      ((isMyFolder || isRoomsSection) &&
        (deps.filterType || deps.filterSearch))
    )
  ) {
    folderOptions = removeOptions(folderOptions, ["open-location"]);
  }

  if (isMyFolder) {
    folderOptions = removeOptions(folderOptions, ["link-for-room-members"]);
  }

  if (item?.isFavorite) {
    folderOptions = removeOptions(folderOptions, ["mark-as-favorite"]);
  } else {
    folderOptions = removeOptions(folderOptions, ["remove-from-favorites"]);
  }

  if (isFavoritesFolder) {
    folderOptions = removeOptions(folderOptions, ["mark-as-favorite"]);
    folderOptions = removeOptions(folderOptions, ["delete"]);
  }

  folderOptions = removeSeparator(folderOptions);

  return folderOptions;
};
