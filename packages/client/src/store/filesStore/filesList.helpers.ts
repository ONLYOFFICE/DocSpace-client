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

import {
  FileType,
  FileStatus,
  FolderType,
  RoomsType,
  RoomsProviderType,
} from "@docspace/shared/enums";
import { resolveDisplayTitle } from "@docspace/shared/services/encryption/filename-cache";
import { getDaysRemaining } from "@docspace/shared/utils/common";

import { isAIAgents } from "SRC_DIR/helpers/plugins/utils";

import type { TFolder } from "@docspace/shared/api/files/types";
import type { TRoom } from "@docspace/shared/api/rooms/types";

import type FilesSettingsStore from "../FilesSettingsStore";
import type { ThirdPartyStore } from "../ThirdPartyStore";
import type PluginStore from "../PluginStore";
import type { default as FilesStore } from "../FilesStore";

import type { TItem } from "./types";

// Everything getFilesListItems reads off `this`, passed explicitly so the
// mapping is a pure function of (items, deps). The FilesStore method stays a
// thin facade that gathers these from its injected stores and own observables
// — preserving MobX reactivity: reading each observable while building `deps`
// registers the dependency in the same reactive context as before.
export type BuildFilesListItemsDeps = {
  fileItemsList: PluginStore["fileItemsList"];
  enablePlugins: boolean;
  aiReadyNeedReset: boolean | undefined;
  getIcon: FilesSettingsStore["getIcon"];
  getThirdPartyIcon: ThirdPartyStore["getThirdPartyIcon"];
  getItemUrl: FilesStore["getItemUrl"];
  getFilesContextOptions: FilesStore["getFilesContextOptions"];
  folders: (TFolder | TRoom)[];
  isRecycleBinFolder: boolean | undefined;
  encryptedFilenameCacheVersion: number;
};

export const buildFilesListItems = (
  items: TItem[],
  deps: BuildFilesListItemsDeps,
): TItem[] => {
  const {
    fileItemsList,
    enablePlugins,
    aiReadyNeedReset,
    getIcon,
    getThirdPartyIcon,
    getItemUrl,
    getFilesContextOptions,
    folders,
    isRecycleBinFolder,
    encryptedFilenameCacheVersion,
  } = deps;

  return items.map((item) => {
    const {
      access,
      autoDelete,
      originTitle,
      comment,
      contentLength,
      created,
      createdBy,
      encrypted,
      fileExst,
      filesCount,
      fileStatus,
      fileType,
      folderId,
      foldersCount,
      id,
      logo,
      locked,
      private: isPrivateRoom,
      originId,
      originFolderId,
      originRoomId,
      originRoomTitle,
      parentId,
      pureContentLength,
      rootFolderType,
      rootFolderId,
      shared,
      title,
      type,
      hasDraft,
      updated,
      updatedBy,
      version,
      versionGroup,
      viewUrl,
      webUrl,
      providerKey,
      thumbnailUrl,
      thumbnailStatus,
      canShare,
      canEdit,
      roomType,
      isArchive,
      tags,
      pinned,
      security,
      viewAccessibility,
      mute,
      inRoom,
      requestToken,
      indexing,
      lifetime,
      denyDownload,
      lastOpened,
      quotaLimit,
      usedSpace,
      isCustomQuota,
      providerId,
      order,
      startFilling,
      draftLocation,
      expired,
      external,
      passwordProtected,
      watermark,
      formFillingStatus,
      customFilterEnabled,
      chatSettings,
      customFilterEnabledBy,
      lockedBy,
      location,
      ...rest
    } = item;

    const thirdPartyIcon = getThirdPartyIcon(item.providerKey!, "small");

    // RoomsProviderType is a ui-kit `const enum` and may
    // not be enumerated/indexed dynamically (TS2475/TS2476); the runtime
    // object exists in the babel/esbuild build, so the original lookup is
    // kept under a suppression.
    const providerType =
      RoomsProviderType[
        // @ts-expect-error TS2475/TS2476 — dynamic const enum access.
        Object.keys(RoomsProviderType).find(
          (key) => key === item.providerKey,
        ) as keyof typeof RoomsProviderType
      ];

    const canOpenPlayer =
      item.viewAccessibility?.ImageView || item.viewAccessibility?.MediaView;
    const needConvert = item.viewAccessibility?.MustConvert;
    const isEditing =
      (item.fileStatus! & FileStatus.IsEditing) === FileStatus.IsEditing;

    const previewUrl = canOpenPlayer
      ? getItemUrl(id, false, needConvert, canOpenPlayer)
      : null;

    const contextOptions = getFilesContextOptions(item);
    const isThirdPartyFolder = providerKey && id === rootFolderId;

    const isAIAgent =
      item.rootFolderType === FolderType.AIAgents &&
      item.roomType === RoomsType.AIRoom;

    const newSecurity = {
      ...security,
      EditAccess: item.security?.EditAccess && !aiReadyNeedReset,
      EditRoom: item.security?.EditRoom && !aiReadyNeedReset,
      ChangeOwner: item.security?.ChangeOwner && !aiReadyNeedReset,
    };

    let isFolder = item.isFolder ?? false;
    folders.forEach((x) => {
      if (x.id === item.id && x.parentId === item.parentId) isFolder = true;
    });

    const folderUrl =
      isFolder &&
      getItemUrl(
        id,
        isFolder,
        false,
        false,
        "",
        roomType === RoomsType.AIRoom,
      );

    const docUrl =
      !canOpenPlayer &&
      !isFolder &&
      getItemUrl(id, false, needConvert, false, requestToken);

    const href = isRecycleBinFolder
      ? null
      : previewUrl ||
        (!isFolder
          ? item.fileType === FileType.Archive
            ? item.webUrl
            : docUrl
          : folderUrl);

    const isRoom = !!roomType;
    const isTemplate =
      item.rootFolderType === FolderType.RoomTemplates && isRoom;

    const icon =
      isRoom && logo?.medium
        ? logo?.medium
        : getIcon(
            32,
            fileExst,
            providerKey,
            contentLength,
            roomType,
            isArchive,
            type,
          );

    const defaultRoomIcon = isRoom
      ? getIcon(
          32,
          fileExst,
          providerKey,
          contentLength,
          roomType,
          isArchive,
          type,
        )
      : undefined;

    const pluginOptions: {
      fileTypeName?: string;
      isPlugin?: boolean;
      fileTileIcon?: string;
    } = {};

    if (!isAIAgents() && enablePlugins && fileItemsList) {
      fileItemsList.forEach(({ value }) => {
        if (value.extension === fileExst) {
          if (value.fileTypeName)
            pluginOptions.fileTypeName = value.fileTypeName;
          pluginOptions.isPlugin = true;
          if (value.fileIconTile)
            pluginOptions.fileTileIcon = value.fileIconTile;
        }
      });
    }

    const isForm = fileExst === ".oform";

    // `void` registers the MobX dep — background cache writes re-render.
    void encryptedFilenameCacheVersion;
    const displayTitle = resolveDisplayTitle({ id, title, encrypted });

    return {
      access,
      // getDaysRemaining is typed for Date but receives the
      // API date string at runtime (getDaysLeft accepts both).
      daysRemaining:
        autoDelete && getDaysRemaining(autoDelete as unknown as Date),
      originTitle,
      // checked,
      comment,
      contentLength,
      contextOptions,
      created,
      createdBy,
      encrypted,
      fileExst,
      filesCount,
      fileStatus,
      fileType,
      folderId,
      foldersCount,
      icon,
      defaultRoomIcon,
      id,
      isFolder,
      isPrivateRoom: !!isPrivateRoom,
      logo,
      locked,
      lockedBy,
      new: item.new,
      mute,
      parentId,
      pureContentLength,
      rootFolderType,
      rootFolderId,
      // selectedItem,
      shared,
      title: displayTitle,
      updated,
      updatedBy,
      version,
      versionGroup,
      viewUrl,
      webUrl,
      providerKey,
      canOpenPlayer,
      // canShare,
      canShare,
      canEdit,
      thumbnailUrl,
      thumbnailStatus,
      originId,
      originFolderId,
      originRoomId,
      originRoomTitle,
      previewUrl,
      folderUrl,
      href,
      isThirdPartyFolder,
      isEditing,
      roomType,
      isRoom,
      isTemplate,
      isAIAgent,
      isArchive,
      tags,
      pinned,
      thirdPartyIcon,
      providerType,
      security: isAIAgent ? newSecurity : security,
      viewAccessibility,
      ...pluginOptions,
      inRoom,
      indexing,
      lifetime,
      denyDownload,
      type,
      hasDraft,
      isForm,
      isPDFForm: item.isForm || item.isPDFForm,
      requestToken,
      lastOpened,
      quotaLimit,
      usedSpace,
      isCustomQuota,
      providerId,
      order,
      startFilling,
      draftLocation,
      expired,
      external,
      passwordProtected,
      watermark,
      formFillingStatus,
      customFilterEnabled,
      chatSettings,
      customFilterEnabledBy,
      location,
      ...rest,
    } as TItem;
  });
};
