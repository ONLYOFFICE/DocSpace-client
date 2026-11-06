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
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import { CryptoError } from "@docspace/shared/services/encryption/errors";
import { getEncryptionErrorMessage } from "@docspace/shared/services/encryption/error-i18n";
import {
  resolveFolderTarget,
  type TUploadTarget,
} from "@docspace/shared/services/private-room/upload-target";
import { sameRoomCopyNames } from "@docspace/shared/services/private-room/private-transfer";

import { useEncryptionIdentityStore } from "../_store/EncryptionIdentityStore";
import {
  registerCryptoOperation,
  releaseCryptoOperation,
} from "../_utils/abort-registry";
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
  /** The standard upload, with its conflict check, for decrypted copies. */
  uploadDecrypted: (files: File[], folderId: number | string) => Promise<void>;
};

type UseEncryptedCopyMoveReturn = {
  duplicateFile: (args: DuplicateArgs) => Promise<void>;
  copyFiles: (args: CopyMoveArgs) => Promise<void>;
};

const loadCopyModule = () =>
  import("@docspace/shared/services/private-room/encrypted-copy");

const renamed = (file: File, name: string | undefined) =>
  new File([file], name ?? file.name, {
    type: file.type || "application/octet-stream",
  });

export const useEncryptedCopyMove = (): UseEncryptedCopyMoveReturn => {
  const { t } = useTranslation(["Common"]);
  const { requireIdentity } = useEncryption();
  const identityStore = useEncryptionIdentityStore();
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
        const { decryptEncryptedItemToFile } = await loadCopyModule();

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

        const copyNames = await sameRoomCopyNames(
          [{ item, file: decrypted }],
          folderId,
          roomId,
          userId,
          identity,
        );

        if (controller.signal.aborted) return;

        await uploadFiles({
          files: [renamed(decrypted, copyNames.get(item))],
          folderId,
          roomId,
        });
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

  const copyFiles = React.useCallback(
    async ({
      files,
      destFolderId,
      sourceRoomId,
      uploadDecrypted,
    }: CopyMoveArgs) => {
      if (files.length === 0) return;

      const userId = identityStore.userKeys?.userId;
      if (!userId) {
        toastr.error(t("Common:EncryptionKeysNotConfigured"));
        return;
      }

      // Spec: private-rooms/sdk-surface, "Copy and move destination resolved fail-closed"
      let dest: TUploadTarget;
      try {
        dest = await resolveFolderTarget({ id: destFolderId });
      } catch {
        toastr.error(
          t("Common:EncryptedCopyFailed", {
            names: files.map((f) => f.title).join(", "),
          }),
        );
        return;
      }

      const identity = await requireIdentity();
      if (!identity) {
        toastr.error(t("Common:EncryptionLockedAddMembers"));
        return;
      }

      const controller = registerCryptoOperation();
      const failed: { title: string; error: unknown }[] = [];
      const decryptedOut: File[] = [];
      const decryptedIn: { item: EncryptedSourceItem; file: File }[] = [];
      try {
        const { decryptEncryptedItemToFile } = await loadCopyModule();

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

            if (dest.isPrivate) decryptedIn.push({ item, file: decrypted });
            else decryptedOut.push(decrypted);
          } catch (error) {
            if (controller.signal.aborted) return;
            failed.push({ title: item.title, error });
          }
        }

        if (controller.signal.aborted) return;

        if (decryptedOut.length > 0) {
          await uploadDecrypted(decryptedOut, destFolderId);
        }

        const destRoomId = dest.encryptionRoomId as number | string;
        const copyNames =
          decryptedIn.length > 0 &&
          String(destRoomId) === String(sourceRoomId)
            ? await sameRoomCopyNames(
                decryptedIn,
                destFolderId,
                destRoomId,
                userId,
                identity,
              )
            : new Map<EncryptedSourceItem, string>();

        for (const { item, file } of decryptedIn) {
          if (controller.signal.aborted) return;

          try {
            const uploadResult = await uploadFiles({
              files: [renamed(file, copyNames.get(item))],
              folderId: destFolderId,
              roomId: destRoomId,
            });

            if (controller.signal.aborted) return;

            if (!uploadResult.ok) {
              failed.push({ title: item.title, error: null });
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
    [requireIdentity, identityStore, uploadFiles, t],
  );

  return { duplicateFile, copyFiles };
};
