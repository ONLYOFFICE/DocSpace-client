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

"use client";

import React from "react";
import { observer } from "mobx-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { toastr } from "@docspace/ui-kit/components/toast";

import type {
  TFilesSettings,
  TGetFolder,
} from "@docspace/shared/api/files/types";
import type { TSettings } from "@docspace/shared/api/settings/types";
import type { TUser } from "@docspace/shared/api/people/types";
import { Loader, LoaderTypes } from "@docspace/ui-kit/components/loader";

import { OpenFolderContext } from "@/app/(docspace)/_contexts/OpenFolderContext";
import {
  EncryptedFileActionsContext,
  type EncryptedFileActions,
  type TFileItem,
} from "@/app/(docspace)/_contexts/EncryptedFileActionsContext";
import { useNavigationStore } from "@/app/(docspace)/_store/NavigationStore";
import DocsLayout from "@/app/(personal-files)/_components/docs-layout";

import { usePrivateRoomsPageInit } from "../../_hooks/usePrivateRoomsPageInit";
import { usePrivateRoomFilesStore } from "../../_store/PrivateRoomFilesStore";
import { useEncryptionIdentityStore } from "../../_store/EncryptionIdentityStore";
import { useEncryptedUpload } from "../../_hooks/useEncryptedUpload";
import { useEncryptedDownload } from "../../_hooks/useEncryptedDownload";
import { useEncryptedCopyMove } from "../../_hooks/useEncryptedCopyMove";
import {
  PrivateInfoPanelBody,
  PrivateInfoPanelHeader,
} from "../../_components/info-panel";

type PrivateRoomFilesPageProps = {
  authToken: string;
  filesSettings: TFilesSettings;
  folderData: TGetFolder;
  portalSettings: TSettings;
  filesFilter: string;
  user?: TUser;
  roomId: string;
  /** True when this room lives in the Archive section (read-only). */
  isArchive?: boolean;
};

const PrivateRoomFilesPage: React.FC<PrivateRoomFilesPageProps> = ({
  authToken,
  filesSettings,
  folderData,
  portalSettings,
  filesFilter,
  user,
  roomId,
  isArchive = false,
}) => {
  const router = useRouter();
  const { t } = useTranslation(["Common"]);
  const filesStore = usePrivateRoomFilesStore();
  const identityStore = useEncryptionIdentityStore();
  const navigationStore = useNavigationStore();
  const { uploadFiles } = useEncryptedUpload();
  const { downloadFile: decryptAndSaveFile, downloadZip: decryptAndSaveZip } =
    useEncryptedDownload();
  const {
    duplicateFile: duplicateEncryptedFile,
    copyFiles: copyEncryptedFiles,
    moveFiles: moveEncryptedFiles,
  } = useEncryptedCopyMove();

  const isReady = usePrivateRoomsPageInit({
    authToken,
    filesSettings,
    portalSettings,
    user,
  });

  React.useEffect(() => {
    const isPrivate = folderData?.current?.private === true;
    const canEditRoom = folderData?.current?.security?.EditRoom === true;
    filesStore.setRoomContext(roomId, isPrivate, canEditRoom);
    return () => filesStore.reset();
  }, [
    filesStore,
    roomId,
    folderData?.current?.private,
    folderData?.current?.security?.EditRoom,
  ]);

  const warnedRoomRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (!isReady) return;
    if (folderData?.current?.private !== true) return;
    if (identityStore.keys === null) return;
    if (identityStore.hasKeys) return;
    if (warnedRoomRef.current === roomId) return;
    warnedRoomRef.current = roomId;
    toastr.warning(t("Common:EncryptionKeysNotConfigured"));
  }, [
    isReady,
    roomId,
    identityStore.keys,
    identityStore.hasKeys,
    folderData?.current?.private,
    t,
  ]);

  const handleOpenFolder = React.useCallback(
    (folderId: number | string) => {
      const roomsRootId = folderData.pathParts?.[0]?.id;
      if (roomsRootId !== undefined && folderId === roomsRootId) {
        router.push("/private");
        return true;
      }
      return false;
    },
    [router, folderData.pathParts],
  );

  // folderId is read at call time so subfolder navigation keeps working.
  const handleEncryptedUpload = React.useCallback(
    async (input: FileList | File[]) => {
      const fileArray = Array.from(input);
      if (fileArray.length === 0) return;
      const folderId =
        navigationStore.currentFolderId ?? folderData.current?.id;
      if (folderId === undefined || folderId === null) return;
      await uploadFiles({ files: fileArray, folderId, roomId });
    },
    [uploadFiles, navigationStore, folderData.current?.id, roomId],
  );

  const encryptedFileActions = React.useMemo<EncryptedFileActions>(
    () => ({
      downloadFile: (item) =>
        decryptAndSaveFile({
          fileId: Number(item.id),
          roomId,
          downloadUrl: item.viewUrl,
          originalFileName: item.title,
          originalFileType: item.fileExst ?? "",
        }),
      downloadZip: (items) =>
        decryptAndSaveZip({
          roomId,
          files: items.map((item: TFileItem) => ({
            fileId: Number(item.id),
            downloadUrl: item.viewUrl,
            originalFileName: item.title,
            originalFileType: item.fileExst ?? "",
          })),
        }),
      duplicateFile: (item) =>
        duplicateEncryptedFile({
          item: {
            id: Number(item.id),
            title: item.title,
            viewUrl: item.viewUrl,
            fileExst: item.fileExst ?? "",
          },
          roomId,
          folderId: navigationStore.currentFolderId ?? folderData.current?.id ?? roomId,
        }),
      copyFiles: (items, destFolderId) =>
        copyEncryptedFiles({
          files: items.map((it: TFileItem) => ({
            id: Number(it.id),
            title: it.title,
            viewUrl: it.viewUrl,
            fileExst: it.fileExst ?? "",
          })),
          destFolderId,
          sourceRoomId: roomId,
        }),
      moveFiles: (items, destFolderId) =>
        moveEncryptedFiles({
          files: items.map((it: TFileItem) => ({
            id: Number(it.id),
            title: it.title,
            viewUrl: it.viewUrl,
            fileExst: it.fileExst ?? "",
          })),
          destFolderId,
          sourceRoomId: roomId,
        }),
    }),
    [
      decryptAndSaveFile,
      decryptAndSaveZip,
      duplicateEncryptedFile,
      copyEncryptedFiles,
      moveEncryptedFiles,
      navigationStore,
      folderData.current?.id,
      roomId,
    ],
  );

  if (!isReady) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
        }}
      >
        <Loader type={LoaderTypes.dualRing} size="40px" />
      </div>
    );
  }

  const { folders, files, total, current, pathParts } = folderData;

  return (
    <OpenFolderContext.Provider value={handleOpenFolder}>
      <EncryptedFileActionsContext.Provider value={encryptedFileActions}>
        <DocsLayout
          folders={folders}
          files={files}
          total={total}
          current={current}
          pathParts={pathParts}
          filesSettings={filesSettings}
          portalSettings={portalSettings}
          filesFilter={filesFilter}
          withoutFavorite
          isPrivate
          isArchive={isArchive}
          hasEncryptionKeys={identityStore.hasKeys}
          uploadFilesToFolder={
            isArchive ? undefined : handleEncryptedUpload
          }
          currentRoomId={roomId}
          infoPanelHeader={<PrivateInfoPanelHeader />}
          infoPanelBody={<PrivateInfoPanelBody />}
        />
      </EncryptedFileActionsContext.Provider>
    </OpenFolderContext.Provider>
  );
};

export default observer(PrivateRoomFilesPage);
