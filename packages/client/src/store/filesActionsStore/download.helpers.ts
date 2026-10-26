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
  downloadFiles,
  getFileEncryptionAccess,
  getFolder,
} from "@docspace/shared/api/files";
import FilesFilter from "@docspace/shared/api/files/filter";
import { resolveDisplayTitle } from "@docspace/shared/services/encryption/filename-cache";
import {
  loadRoomMemberKeysSafe,
} from "@docspace/shared/services/private-room/room-member-keys";
import { AnalyticsEvents, UrlActionType } from "@docspace/shared/enums";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import {
  downloadAndDecryptFile,
  downloadAndDecryptFileToBuffer,
  createZipFromBuffers,
  deduplicateFileNames,
  triggerFileDownload,
} from "@docspace/shared/services/private-room/encrypted-download";
import {
  requireUnlock,
} from "@docspace/shared/services/encryption/secret-storage";
import uniqueid from "lodash/uniqueId";
import { OPERATIONS_NAME } from "@docspace/shared/constants";
import { FileOperationStatus } from "@docspace/shared/enums";
import type { Nullable } from "@docspace/shared/types";
import type {
  TFileConvertId,
} from "@docspace/shared/dialogs/download-dialog/DownloadDialog.types";
import type { TFile, TOperation } from "@docspace/shared/api/files/types";
import i18n from "../../i18n";
import type FilesActionStore from "../FilesActionsStore";
import type { TActionItem, TDownloadTranslations } from "../FilesActionsStore";

export const downloadFilesImpl = async (
self: FilesActionStore,
  fileConvertIds: (number | TFileConvertId)[],
  folderIds: number[],
  // downloadAction forwards its `label` string here as
  // `translations`; destructuring a string yields undefined for both keys,
  // exactly as the old JS did.
  translations: TDownloadTranslations | string,

)=> {
  const { clearActiveOperations, secondaryProgressDataStore } =
    self.uploadDataStore;

  const { setSecondaryProgressBarData } = secondaryProgressDataStore;
  const { openUrl } = self.settingsStore;

  const { addActiveItems } = self.filesStore;
  const { label, passwordError } = translations as TDownloadTranslations;
  const {
    setDownloadItems,
    setDownloadDialogVisible,
    downloadItems,
    setSortedPasswordFiles,
  } = self.dialogsStore;

  const operationId = uniqueid("operation_");

  const operationName = OPERATIONS_NAME.download;

  setSecondaryProgressBarData({
    operation: operationName,
    percent: 0,
    operationId,
    operationIds: [...fileConvertIds, ...folderIds] as (string | number)[],
  });

  const fileIds = fileConvertIds.map(
    (f) => (f as TFileConvertId).key || (f as number),
  );
  addActiveItems(fileIds, folderIds);

  const shareKey = self.publicRoomStore.publicRoomKey;

  try {
    // the shared downloadFiles declares shareKey as a
    // required string, but it is null outside of public rooms (the old JS
    // passed null; the API helper only appends it when truthy).
    await downloadFiles(
      fileConvertIds as TFileConvertId[],
      folderIds,
      shareKey as string,
    ).then(
      async (res) => {
        const result = res[0];

        if (result?.error) return Promise.reject(result.error);
        const data = result ?? null;

        if (!data) {
          return Promise.reject();
        }
        const pbData = {
          operation: operationName,
          label,
          operationId,
        };

        const item =
          data?.finished && data?.url
            ? data
            : await self.uploadDataStore.loopFilesOperations(data, pbData);

        clearActiveOperations(fileIds, folderIds);
        setDownloadItems([]);

        const isCanceled =
          item?.status === FileOperationStatus.Canceled ||
          secondaryProgressDataStore.isOperationStopped(
            operationName,
            operationId,
          );

        // loopFilesOperations may resolve to undefined; the
        // old JS crashed here in that case, the `!` keeps that behavior.
        if (item!.url) {
          openUrl(item!.url, UrlActionType.Download, true);

          if (fileConvertIds.length) {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
              event: AnalyticsEvents.FileDownloaded,
              fileIds: fileConvertIds.map(
                (f) => (f as TFileConvertId).key ?? (f as number),
              ),
            });
          }
        }

        if (!isCanceled) {
          setSecondaryProgressBarData({
            operation: operationName,
            alert: !item!.url,
            completed: true,
            operationId,
          });

          !item!.url &&
            toastr.error(
              (translations as TDownloadTranslations).error ||
                i18n.t("Common:UnexpectedError"),
              null,
              0,
              true,
            );
        }
      },
    );
  } catch (err) {
    clearActiveOperations(fileIds, folderIds);

    const isCanceled =
      (err as TOperation)?.status === FileOperationStatus.Canceled ||
      secondaryProgressDataStore.isOperationStopped(operationName, operationId);

    if (!isCanceled) {
      setSecondaryProgressBarData({
        operation: operationName,
        alert: true,
        completed: true,
        operationId,
      });
      const error =
        typeof err === "string" ? err : (err as { error?: string })?.error;

      if (error?.includes("password")) {
        const filesIds = error.match(/\d+/g)?.map(Number) ?? [
          (fileConvertIds[0] as TFileConvertId).key,
        ];

        const passwordArray: typeof downloadItems = [];

        downloadItems.forEach((item) => {
          filesIds.forEach((id) => {
            if (item.id === id) {
              passwordArray.push(item);
            }
          });
        });

        toastr.error(passwordError, null, 0, true);
        setSortedPasswordFiles({ other: [...passwordArray] });
        setDownloadDialogVisible(true);
        return;
      }
      setDownloadItems([]);

      return toastr.error(
        (err as string) || i18n.t("Common:UnexpectedError"),
        null,
        0,
        true,
      );
    }
  }
};


export const downloadActionImpl = async (
self: FilesActionStore,label: string, item?: Nullable<TActionItem>
)=> {
  const { bufferSelection } = self.filesStore;
  const { openUrl } = self.settingsStore;
  const { id, isFolder } = self.selectedFolderStore;

  const downloadAsArchive = id === item?.id && isFolder === item?.isFolder;

  // with no selection at all the old JS crashed on
  // `null.length` below; the erased cast keeps that behavior.
  const selection = (
    item
      ? [item]
      : self.filesStore.selection.length
        ? self.filesStore.selection
        : bufferSelection
          ? [bufferSelection]
          : null
  ) as TActionItem[];

  if (!selection.length) return;

  const fileIds: number[] = [];
  const folderIds: number[] = [];
  const items: { id: number; fileExst?: string }[] = [];

  if (selection.length === 1 && selection[0].fileExst && !downloadAsArchive) {
    const file = selection[0];

    if (file.encrypted) {
      return self.downloadEncryptedFile(file);
    }

    openUrl(file.viewUrl!, UrlActionType.Download);
    return Promise.resolve();
  }

  const encryptedFiles: TActionItem[] = [];

  selection.forEach((elem) => {
    if (!elem.fileExst && elem.isFolder) {
      folderIds.push(elem.id);
      items.push({ id: elem.id });
    } else if (elem.encrypted) {
      encryptedFiles.push(elem);
    } else {
      fileIds.push(elem.id);
      items.push({ id: elem.id, fileExst: elem.fileExst });
    }
  });

  self.setGroupMenuBlocked(true);

  const promises = [];

  if (encryptedFiles.length > 0) {
    promises.push(self.downloadEncryptedFilesAsZip(encryptedFiles));
  }

  if (fileIds.length > 0 || folderIds.length > 0) {
    promises.push(self.downloadFiles(fileIds, folderIds, label));
  }

  return Promise.all(promises).finally(() => self.setGroupMenuBlocked(false));
};


export const resolveRoomIdForFileImpl = (
self: FilesActionStore,file?: Nullable<TActionItem>
)=> {
  if (file?.originRoomId) return file.originRoomId;
  const navRoom = self.selectedFolderStore.navigationPath?.find(
    (r) => r.isRoom,
  );
  if (navRoom?.id) return navRoom.id;
  if (self.selectedFolderStore.isRoom) return self.selectedFolderStore.id;
  return null;
};


export const downloadEncryptedFileImpl = async (
self: FilesActionStore,file: TActionItem
)=> {
  const { encryptionKeys, user } = self.userStore;

  if (!encryptionKeys || encryptionKeys.length === 0) {
    toastr.error(i18n.t("Common:EncryptionKeysNotConfigured"));
    return Promise.resolve();
  }

  const userId = user?.id;
  if (!userId) {
    return Promise.resolve();
  }

  const { setSecondaryProgressBarData } =
    self.uploadDataStore.secondaryProgressDataStore;
  const operationId = uniqueid("operation_");

  try {
    const encryptionInfo = await getFileEncryptionAccess(file.id);

    if (!encryptionInfo || !encryptionInfo.fileKeys) {
      return Promise.resolve();
    }
    const hasOwnEntry = encryptionInfo.fileKeys.some(
      (k) => String(k.userId) === String(userId),
    );
    if (!hasOwnEntry) {
      return Promise.resolve();
    }

    const identity = await requireUnlock(String(userId));
    if (!identity) {
      return Promise.resolve();
    }

    const roomId = self.resolveRoomIdForFile(file);
    const roomMemberKeys = await loadRoomMemberKeysSafe(roomId);

    setSecondaryProgressBarData({
      operation: OPERATIONS_NAME.download,
      percent: 0,
      operationId,
    });

    // viewUrl is optional on the .js view-model; the old JS
    // passed it through unchecked (fetch would fail at runtime), the `!`
    // keeps that behavior.
    const result = await downloadAndDecryptFile({
      downloadUrl: file.viewUrl!,
      fileId: file.id,
      fileKeys: encryptionInfo.fileKeys,
      roomMemberKeys,
      userId: String(userId),
      identity,
      originalFileName: file.title,
      originalFileType: file.contentType || "application/octet-stream",
      onDownloadProgress: (progress) => {
        setSecondaryProgressBarData({
          operation: OPERATIONS_NAME.download,
          percent: Math.floor(progress * 70),
          label: i18n.t("Files:Downloading"),
          operationId,
        });
      },
      onProgress: (progress) => {
        setSecondaryProgressBarData({
          operation: OPERATIONS_NAME.download,
          percent: 70 + Math.floor(progress * 30),
          label: i18n.t("Files:Decrypting"),
          operationId,
        });
      },
    });

    setSecondaryProgressBarData({
      operation: OPERATIONS_NAME.download,
      percent: 100,
      completed: true,
      alert: !result.success,
      operationId,
    });

    if (result.success && result.file) {
      triggerFileDownload(result.file);
    } else {
      if (result.error) {
        console.error("[ENCRYPTION] downloadEncryptedFile:", result.error);
      }
      toastr.error(i18n.t("Common:EncryptionDownloadFailed"));
    }
  } catch (error) {
    setSecondaryProgressBarData({
      operation: OPERATIONS_NAME.download,
      percent: 100,
      completed: true,
      alert: true,
      operationId,
    });

    console.error("[ENCRYPTION] downloadEncryptedFile threw:", error);
    toastr.error(i18n.t("Common:EncryptionDownloadFailed"));
  }

  return Promise.resolve();
};


const FOLDER_PAGE_SIZE = 100;

type TFolderTreeFile = { file: TFile; dir: string };

/** Every file under a folder, each with the path of its folder inside it. */
const listFolderTree = async (
  folderId: number | string,
  dir = "",
): Promise<TFolderTreeFile[]> => {
  const files: TFolderTreeFile[] = [];
  let loaded = 0;
  for (let page = 0; ; page += 1) {
    const filter = FilesFilter.getDefault();
    filter.page = page;
    filter.pageCount = FOLDER_PAGE_SIZE;

    const data = await getFolder(folderId, filter);
    for (const file of data.files) files.push({ file, dir });
    for (const folder of data.folders) {
      files.push(...(await listFolderTree(folder.id, `${dir}${folder.title}/`)));
    }

    const count = data.files.length + data.folders.length;
    loaded += count;
    if (count === 0 || loaded >= data.total) break;
  }
  return files;
};

/** Zip entry names, with clashes renamed inside their own folder only. */
const toZipEntries = (
  entries: { dir: string; name: string; data: Uint8Array }[],
) => {
  const byDir = new Map<string, number[]>();
  entries.forEach(({ dir }, index) => {
    byDir.set(dir, [...(byDir.get(dir) ?? []), index]);
  });

  const names: string[] = new Array(entries.length);
  for (const [dir, indexes] of byDir) {
    deduplicateFileNames(indexes.map((i) => entries[i].name)).forEach(
      (name, k) => {
        names[indexes[k]] = `${dir}${name}`;
      },
    );
  }
  return entries.map(({ data }, i) => ({ name: names[i], data }));
};

type TDecryptedZipEntry = {
  file: Pick<
    TActionItem,
    "id" | "title" | "encrypted" | "viewUrl" | "contentType"
  >;
  dir: string;
  roomId: ReturnType<FilesActionStore["resolveRoomIdForFile"]>;
};

const resolveRoomIdForFolder = (self: FilesActionStore, folder: TActionItem) =>
  folder.isRoom || folder.roomType
    ? folder.id
    : self.resolveRoomIdForFile(null);

/** The files under a folder, each with its path inside the zip. */
const listFolderEntries = async (
  self: FilesActionStore,
  folder: TActionItem,
  dir = "",
): Promise<TDecryptedZipEntry[]> => {
  const roomId = resolveRoomIdForFolder(self, folder);
  const tree = await listFolderTree(folder.id, dir);
  return tree.map((entry) => ({ ...entry, roomId }));
};

/**
 * Decrypts the listed files on the client and saves them as one zip, each
 * under its directory; plain files of the list are added as they are.
 */
const downloadDecryptedZipImpl = async (
  self: FilesActionStore,
  zipName: string,
  listEntries: () => Promise<TDecryptedZipEntry[]>,
  partialWarning: (fileNames: string) => string,
) => {
  const { encryptionKeys, user } = self.userStore;

  if (!encryptionKeys || encryptionKeys.length === 0) {
    toastr.error(i18n.t("Common:EncryptionKeysNotConfigured"));
    return;
  }

  const userId = user?.id;
  if (!userId) return;

  const { setSecondaryProgressBarData } =
    self.uploadDataStore.secondaryProgressDataStore;
  const operationId = uniqueid("operation_");
  const finish = (alert: boolean) =>
    setSecondaryProgressBarData({
      operation: OPERATIONS_NAME.download,
      percent: 100,
      completed: true,
      alert,
      operationId,
    });

  try {
    const identity = await requireUnlock(String(userId));
    if (!identity) return;

    setSecondaryProgressBarData({
      operation: OPERATIONS_NAME.download,
      percent: 0,
      label: i18n.t("Common:ArchivingData"),
      operationId,
    });

    const entries = await listEntries();
    const total = entries.length;
    const results: { dir: string; name: string; data: Uint8Array }[] = [];
    const failures: string[] = [];
    const roomMemberKeysCache = new Map<
      string,
      Awaited<ReturnType<typeof loadRoomMemberKeysSafe>>
    >();

    for (let i = 0; i < total; i++) {
      const { file, dir, roomId } = entries[i];
      const shownName = resolveDisplayTitle(file);
      const fileShare = 100 / total;
      const fileBase = fileShare * i;
      const counter = `(${i + 1}/${total})`;

      setSecondaryProgressBarData({
        operation: OPERATIONS_NAME.download,
        percent: Math.floor(fileBase),
        label: `${i18n.t("Files:Downloading")} ${counter}`,
        operationId,
      });

      try {
        // viewUrl is optional on the .js view-model; files always carry it.
        if (!file.encrypted) {
          const response = await fetch(file.viewUrl!);
          if (!response.ok) throw new Error(`${response.status}`);
          results.push({
            dir,
            name: file.title,
            data: new Uint8Array(await response.arrayBuffer()),
          });
          continue;
        }

        const encryptionInfo = await getFileEncryptionAccess(file.id);
        const hasOwnEntry = !!encryptionInfo?.fileKeys?.some(
          (k) => String(k.userId) === String(userId),
        );
        if (!hasOwnEntry) {
          failures.push(`${dir}${shownName}`);
          continue;
        }

        let roomMemberKeys = roomMemberKeysCache.get(String(roomId));
        if (!roomMemberKeys) {
          roomMemberKeys = await loadRoomMemberKeysSafe(roomId);
          roomMemberKeysCache.set(String(roomId), roomMemberKeys);
        }

        const result = await downloadAndDecryptFileToBuffer({
          downloadUrl: file.viewUrl!,
          fileId: file.id,
          fileKeys: encryptionInfo.fileKeys!,
          roomMemberKeys,
          userId: String(userId),
          identity,
          originalFileName: shownName,
          originalFileType: file.contentType || "application/octet-stream",
          onDownloadProgress: (progress) => {
            setSecondaryProgressBarData({
              operation: OPERATIONS_NAME.download,
              percent: Math.floor(fileBase + progress * fileShare * 0.6),
              label: `${i18n.t("Files:Downloading")} ${counter}`,
              operationId,
            });
          },
          onProgress: (progress) => {
            setSecondaryProgressBarData({
              operation: OPERATIONS_NAME.download,
              percent: Math.floor(
                fileBase + fileShare * 0.6 + progress * fileShare * 0.3,
              ),
              label: `${i18n.t("Files:Decrypting")} ${counter}`,
              operationId,
            });
          },
        });

        if (result.success && result.data) {
          results.push({ dir, name: result.fileName, data: result.data });
        } else {
          failures.push(`${dir}${shownName}`);
        }
      } catch {
        failures.push(`${dir}${shownName}`);
      }
    }

    if (results.length === 0 && failures.length > 0) {
      finish(true);
      toastr.error(i18n.t("Files:DecryptAllFailed"));
      return;
    }

    setSecondaryProgressBarData({
      operation: OPERATIONS_NAME.download,
      percent: 95,
      label: i18n.t("Files:CompressingFiles"),
      operationId,
    });

    // Decrypted names can clash where the opaque server titles did not.
    const zipData = createZipFromBuffers(toZipEntries(results));
    triggerFileDownload(
      new Blob([zipData as unknown as BlobPart], { type: "application/zip" }),
      zipName,
    );
    finish(failures.length > 0);

    if (failures.length > 0) {
      toastr.warning(partialWarning(failures.join(", ")), null, 0, true);
    }
  } catch (error) {
    finish(true);
    console.error("[ENCRYPTION] downloadDecryptedZip threw:", error);
    toastr.error(i18n.t("Common:EncryptionDownloadFailed"));
  }
};

/**
 * Downloads the selected encrypted files, and the selected folders of a
 * private room with their subtrees, as one decrypted Files.zip.
 */
export const downloadEncryptedFilesAsZipImpl = async (
  self: FilesActionStore,
  encryptedFiles: TActionItem[],
  folders: TActionItem[] = [],
) =>
  downloadDecryptedZipImpl(
    self,
    "Files.zip",
    async () => {
      const entries: TDecryptedZipEntry[] = encryptedFiles.map((file) => ({
        file,
        dir: "",
        roomId: self.resolveRoomIdForFile(file),
      }));
      for (const folder of folders) {
        entries.push(
          ...(await listFolderEntries(self, folder, `${folder.title}/`)),
        );
      }
      return entries;
    },
    (fileNames) => i18n.t("Files:DecryptPartialFailed", { fileNames }),
  );

/**
 * Downloads a folder of a private room, or the room itself, as one zip of
 * its decrypted files, keeping their paths inside it.
 * Spec: private-rooms/file-operations, "Decrypted folder download".
 */
export const downloadEncryptedFolderImpl = async (
  self: FilesActionStore,
  folder: TActionItem,
) =>
  downloadDecryptedZipImpl(
    self,
    `${folder.title}.zip`,
    () => listFolderEntries(self, folder),
    (fileNames) => i18n.t("Common:EncryptedDownloadPartial", { fileNames }),
  );
