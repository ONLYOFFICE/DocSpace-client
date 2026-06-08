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
import { useTranslation } from "react-i18next";

import { useEncryption } from "@docspace/shared/context/encryption";
import { toastr } from "@docspace/ui-kit/components/toast";
import { CryptoError } from "@docspace/shared/services/encryption/errors";
import { getEncryptionErrorMessage } from "@docspace/shared/services/encryption/error-i18n";
import { getFileEncryptionAccess } from "@docspace/shared/api/files";

import { useEncryptionIdentityStore } from "../_store/EncryptionIdentityStore";
import {
  registerCryptoOperation,
  releaseCryptoOperation,
} from "../_utils/abort-registry";

type DownloadFileArgs = {
  fileId: number;
  roomId: number | string;
  downloadUrl: string;
  originalFileName: string;
  originalFileType: string;
};

type DownloadZipArgs = {
  files: Array<{
    fileId: number;
    downloadUrl: string;
    originalFileName: string;
    originalFileType: string;
  }>;
  roomId: number | string;
  zipFileName?: string;
};

type UseEncryptedDownloadReturn = {
  downloadFile: (args: DownloadFileArgs) => Promise<void>;
  downloadZip: (args: DownloadZipArgs) => Promise<void>;
};

const loadDownloadModule = () =>
  import("@docspace/shared/services/private-room/encrypted-download");
const loadRoomMemberKeysModule = () =>
  import("@docspace/shared/services/private-room/room-member-keys");

export const useEncryptedDownload = (): UseEncryptedDownloadReturn => {
  const { t } = useTranslation(["Common"]);
  const { requireIdentity } = useEncryption();
  const identityStore = useEncryptionIdentityStore();

  const downloadFile = React.useCallback(
    async ({
      fileId,
      roomId,
      downloadUrl,
      originalFileName,
      originalFileType,
    }: DownloadFileArgs) => {
      const userId = identityStore.userKeys?.userId;
      if (!userId) {
        toastr.error(t("Common:EncryptionKeysNotConfigured"));
        return;
      }
      const identity = await requireIdentity();
      if (!identity) return;

      const controller = registerCryptoOperation();
      try {
        const [{ downloadAndDecryptFile, triggerFileDownload }, memberMod] =
          await Promise.all([loadDownloadModule(), loadRoomMemberKeysModule()]);

        const roomMemberKeys = await memberMod.loadRoomMemberKeysSafe(roomId);
        const info = await getFileEncryptionAccess(fileId);
        if (!info?.fileKeys || info.fileKeys.length === 0) {
          throw new Error("File has no encryption ACL — cannot decrypt");
        }

        if (controller.signal.aborted) return;

        const result = await downloadAndDecryptFile({
          fileId,
          downloadUrl,
          fileKeys: info.fileKeys,
          roomMemberKeys,
          userId,
          identity,
          originalFileName,
          originalFileType,
        });

        if (controller.signal.aborted) return;

        if (!result.success || !result.file) {
          toastr.error(result.error || t("Common:UnexpectedError"));
          return;
        }
        triggerFileDownload(result.file, result.file.name);
      } catch (error) {
        if (controller.signal.aborted) return;
        // Typed crypto errors carry precise diagnostic messages; untyped errors
        // (network, ACL, unexpected) surface the operation-level failure key.
        toastr.error(
          error instanceof CryptoError
            ? getEncryptionErrorMessage(t, error)
            : t("Common:EncryptionDownloadFailed"),
        );
      } finally {
        releaseCryptoOperation(controller);
      }
    },
    [requireIdentity, identityStore, t],
  );

  const downloadZip = React.useCallback(
    async ({ files, roomId, zipFileName = "Files.zip" }: DownloadZipArgs) => {
      if (files.length === 0) return;

      const userId = identityStore.userKeys?.userId;
      if (!userId) {
        toastr.error(t("Common:EncryptionKeysNotConfigured"));
        return;
      }
      const identity = await requireIdentity();
      if (!identity) return;

      const controller = registerCryptoOperation();
      try {
        const [
          {
            downloadAndDecryptFileToBuffer,
            createZipFromBuffers,
            deduplicateFileNames,
            triggerFileDownload,
          },
          memberMod,
        ] = await Promise.all([loadDownloadModule(), loadRoomMemberKeysModule()]);

        const roomMemberKeys = await memberMod.loadRoomMemberKeysSafe(roomId);

        const buffers: Array<{ data: Uint8Array; fileName: string }> = [];
        for (const f of files) {
          if (controller.signal.aborted) return;
          const info = await getFileEncryptionAccess(f.fileId);
          if (!info?.fileKeys || info.fileKeys.length === 0) continue;
          const decrypted = await downloadAndDecryptFileToBuffer({
            fileId: f.fileId,
            downloadUrl: f.downloadUrl,
            fileKeys: info.fileKeys,
            roomMemberKeys,
            userId,
            identity,
            originalFileName: f.originalFileName,
            originalFileType: f.originalFileType,
          });
          if (decrypted.success && decrypted.data) {
            buffers.push({ data: decrypted.data, fileName: decrypted.fileName });
          }
        }

        if (controller.signal.aborted) return;
        if (buffers.length === 0) {
          toastr.error(t("Common:UnexpectedError"));
          return;
        }

        const names = deduplicateFileNames(buffers.map((b) => b.fileName));
        const zipBytes = createZipFromBuffers(
          buffers.map((b, i) => ({ data: b.data, name: names[i] })),
        );
        const zipBlob = new Blob([new Uint8Array(zipBytes)], {
          type: "application/zip",
        });
        triggerFileDownload(zipBlob, zipFileName);
      } catch (error) {
        if (controller.signal.aborted) return;
        // Files:DecryptAllFailed is the reference key for zip/decrypt-all failure
        // but the "Files" namespace is not available in the SDK (only "Common" is
        // loaded). Fall back to the generic download failure key which conveys the
        // same intent.
        toastr.error(
          error instanceof CryptoError
            ? getEncryptionErrorMessage(t, error)
            : t("Common:EncryptionDownloadFailed"),
        );
      } finally {
        releaseCryptoOperation(controller);
      }
    },
    [requireIdentity, identityStore, t],
  );

  return { downloadFile, downloadZip };
};
