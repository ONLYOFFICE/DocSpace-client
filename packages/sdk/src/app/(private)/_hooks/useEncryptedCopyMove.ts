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
import {
  getFolder,
  deleteFile,
  startUploadSession,
  uploadChunkSequential,
  finalizeUploadSession,
} from "@docspace/shared/api/files";
import { forgetEncryptedFilename } from "@docspace/shared/services/encryption/filename-cache";
import FilesFilter from "@docspace/shared/api/files/filter";
import type { TGetFolder } from "@docspace/shared/api/files/types";

import { useFilesListStore } from "@/app/(docspace)/_store/FilesListStore";

import { useEncryptionIdentityStore } from "../_store/EncryptionIdentityStore";
import {
  registerCryptoOperation,
  releaseCryptoOperation,
} from "../_utils/abort-registry";
import { resolveEncryptedCopyDest } from "../_utils/encrypted-copy-dest";
import { useEncryptedUpload } from "./useEncryptedUpload";

type EncryptedSourceItem = {
  id: number;
  title: string;
  viewUrl: string;
  contentType?: string;
  fileExst?: string;
};

type DuplicateArgs = {
  item: EncryptedSourceItem;
  roomId: number | string;
  folderId: number | string;
};

type CopyMoveArgs = {
  files: EncryptedSourceItem[];
  destFolderId: number | string;
  // The room the files currently live in — needed to unwrap their DEKs.
  sourceRoomId: number | string;
};

type UseEncryptedCopyMoveReturn = {
  duplicateFile: (args: DuplicateArgs) => Promise<void>;
  copyFiles: (args: CopyMoveArgs) => Promise<void>;
  moveFiles: (args: CopyMoveArgs) => Promise<void>;
};

const loadCopyModule = () =>
  import("@docspace/shared/services/private-room/encrypted-copy");

const PLAINTEXT_CHUNK_SIZE = 10 * 1024 * 1024;

const uploadPlaintextFile = async (
  file: File,
  folderId: number | string,
  signal: AbortSignal,
): Promise<void> => {
  const session = await startUploadSession(
    folderId,
    file.name,
    file.size,
    "",
    false,
    undefined,
    true,
  );
  const sessionId = session?.id;
  if (!sessionId) {
    throw new Error("startUploadSession returned no session id");
  }

  const total = file.size;
  let anyChunkSent = false;
  for (let offset = 0; offset < total; offset += PLAINTEXT_CHUNK_SIZE) {
    if (signal.aborted) return;
    const end = Math.min(offset + PLAINTEXT_CHUNK_SIZE, total);
    const formData = new FormData();
    formData.append("file", file.slice(offset, end), file.name);
    await uploadChunkSequential(folderId, sessionId, formData);
    anyChunkSent = true;
  }

  if (signal.aborted) return;

  if (anyChunkSent) {
    await finalizeUploadSession(folderId, sessionId).catch(() => {});
  } else {
    await finalizeUploadSession(folderId, sessionId);
  }
};

export const useEncryptedCopyMove = (): UseEncryptedCopyMoveReturn => {
  const { t } = useTranslation(["Common"]);
  const { requireIdentity } = useEncryption();
  const identityStore = useEncryptionIdentityStore();
  const filesListStore = useFilesListStore();
  const { uploadFiles } = useEncryptedUpload();

  const duplicateFile = React.useCallback(
    async ({ item, roomId, folderId }: DuplicateArgs) => {
      const userId = identityStore.userKeys?.userId;
      if (!userId) {
        toastr.error(t("Common:EncryptionKeysNotConfigured"));
        return;
      }
      const identity = await requireIdentity();
      if (!identity) {
        toastr.error(t("Common:EncryptionLockedAddMembers"));
        return;
      }

      const controller = registerCryptoOperation();
      try {
        const { decryptEncryptedItemToFile, addCopySuffix } =
          await loadCopyModule();

        const decrypted = await decryptEncryptedItemToFile(
          {
            id: item.id,
            title: item.title,
            viewUrl: item.viewUrl,
            contentType: item.contentType,
            fileExst: item.fileExst,
          },
          userId,
          identity,
          roomId,
        );

        if (controller.signal.aborted) return;

        const copyFile = new File([decrypted], addCopySuffix(decrypted.name), {
          type: decrypted.type || "application/octet-stream",
        });

        await uploadFiles({ files: [copyFile], folderId, roomId });
      } catch (error) {
        if (controller.signal.aborted) return;
        // Typed crypto errors carry precise diagnostic messages; untyped errors
        // (network, ACL, unexpected) surface the operation-level failure key.
        toastr.error(
          error instanceof CryptoError
            ? getEncryptionErrorMessage(t, error)
            : t("Common:EncryptedCopyFailed", { names: item.title }),
        );
      } finally {
        releaseCryptoOperation(controller);
      }
    },
    [requireIdentity, identityStore, uploadFiles, t],
  );

  const runCopyMove = React.useCallback(
    async (
      { files, destFolderId, sourceRoomId }: CopyMoveArgs,
      isMove: boolean,
    ) => {
      if (files.length === 0) return;

      const userId = identityStore.userKeys?.userId;
      if (!userId) {
        toastr.error(t("Common:EncryptionKeysNotConfigured"));
        return;
      }
      const identity = await requireIdentity();
      if (!identity) {
        toastr.error(t("Common:EncryptionLockedAddMembers"));
        return;
      }

      const controller = registerCryptoOperation();
      const failed: { title: string; error: unknown }[] = [];
      try {
        const destFolderData = (await getFolder(
          destFolderId as number,
          FilesFilter.getDefault(),
        )) as TGetFolder;
        const dest = resolveEncryptedCopyDest(destFolderData);

        if (dest.mode === "blocked") {
          toastr.error(t("Common:UnexpectedError"));
          return;
        }

        const { decryptEncryptedItemToFile, addCopySuffix } =
          await loadCopyModule();

        for (const item of files) {
          if (controller.signal.aborted) return;

          try {
            const decrypted = await decryptEncryptedItemToFile(
              {
                id: item.id,
                title: item.title,
                viewUrl: item.viewUrl,
                contentType: item.contentType,
                fileExst: item.fileExst,
              },
              userId,
              identity,
              sourceRoomId,
            );

            if (controller.signal.aborted) return;

            let uploaded = false;
            if (dest.mode === "plaintext") {
              await uploadPlaintextFile(
                decrypted,
                destFolderId,
                controller.signal,
              );
              uploaded = !controller.signal.aborted;
            } else {
              const sameRoom = String(dest.roomId) === String(sourceRoomId);
              const fileToUpload =
                !isMove && sameRoom
                  ? new File([decrypted], addCopySuffix(decrypted.name), {
                      type: decrypted.type || "application/octet-stream",
                    })
                  : decrypted;

              const uploadResult = await uploadFiles({
                files: [fileToUpload],
                folderId: destFolderId,
                roomId: dest.roomId,
              });
              uploaded = uploadResult.ok;
            }

            if (controller.signal.aborted) return;

            if (!uploaded) {
              failed.push({ title: item.title, error: null });
              continue;
            }

            if (isMove && dest.mode !== "plaintext") {
              await deleteFile(item.id, false, true);
              forgetEncryptedFilename(item.id);
              filesListStore.removeItem(item.id);
            }
          } catch (error) {
            if (controller.signal.aborted) return;
            failed.push({ title: item.title, error });
          }
        }

        if (controller.signal.aborted) return;

        if (failed.length === 1 && failed[0].error instanceof CryptoError) {
          toastr.error(getEncryptionErrorMessage(t, failed[0].error));
        } else if (failed.length > 0) {
          toastr.error(
            t("Common:EncryptedCopyFailed", {
              names: failed.map((f) => f.title).join(", "),
            }),
          );
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        toastr.error(
          error instanceof CryptoError
            ? getEncryptionErrorMessage(t, error)
            : t("Common:EncryptedCopyFailed", {
                names: files.map((f) => f.title).join(", "),
              }),
        );
      } finally {
        releaseCryptoOperation(controller);
      }
    },
    [requireIdentity, identityStore, uploadFiles, filesListStore, t],
  );

  const copyFiles = React.useCallback(
    (args: CopyMoveArgs) => runCopyMove(args, false),
    [runCopyMove],
  );

  const moveFiles = React.useCallback(
    (args: CopyMoveArgs) => runCopyMove(args, true),
    [runCopyMove],
  );

  return { duplicateFile, copyFiles, moveFiles };
};
