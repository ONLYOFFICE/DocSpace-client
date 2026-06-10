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
import {
  getActiveKeyId,
  selectActiveKey,
} from "@docspace/shared/services/encryption/active-key-preference";
import { CryptoError } from "@docspace/shared/services/encryption/errors";
import { getEncryptionErrorMessage } from "@docspace/shared/services/encryption/error-i18n";

import { useUploadStore } from "@/app/(docspace)/_store/UploadStore";

import { useEncryptionIdentityStore } from "../_store/EncryptionIdentityStore";
import { usePrivateEncryptedUploadStore } from "../_store/PrivateEncryptedUploadStore";
import {
  registerCryptoOperation,
  releaseCryptoOperation,
} from "../_utils/abort-registry";

type UploadFilesArgs = {
  files: File[];
  folderId: number | string;
  roomId: number | string;
};

type UploadFilesResult = {
  ok: boolean;
};

type UseEncryptedUploadReturn = {
  uploadFiles: (args: UploadFilesArgs) => Promise<UploadFilesResult>;
  isUploading: boolean;
};

// Dynamic import keeps hash-wasm + @hpke out of the initial bundle. The
// orchestrator module pulls in the encryption chunk only on first call.
const loadOrchestrator = () =>
  import(
    "@docspace/shared/services/private-room/encrypted-upload-orchestrator"
  );

export const useEncryptedUpload = (): UseEncryptedUploadReturn => {
  const { t } = useTranslation(["Common", "UploadPanel"]);
  const { requireIdentity, suspendAutoLock } = useEncryption();
  const identityStore = useEncryptionIdentityStore();
  const uploadStore = useUploadStore();
  const privateUploadStore = usePrivateEncryptedUploadStore();
  const [isUploading, setIsUploading] = React.useState(false);

  const uploadFiles = React.useCallback(
    async ({ files, folderId, roomId }: UploadFilesArgs) => {
      if (files.length === 0) return { ok: false };

      const userId = identityStore.userKeys?.userId;
      const publicKey = identityStore.userKeys?.publicKey;
      const keys = identityStore.keys;
      const activeKey = selectActiveKey(keys, getActiveKeyId(userId ?? ""));
      const publicKeyId = activeKey?.id ?? null;

      if (!userId || !publicKey || !publicKeyId) {
        toastr.error(t("Common:EncryptionKeysNotConfigured"));
        return { ok: false };
      }

      // requireIdentity surfaces the PassphraseDialog when locked. A null
      // return means the user cancelled — silently no-op (no toast).
      const identity = await requireIdentity();
      if (!identity) return { ok: false };

      const releaseAutoLock = suspendAutoLock();

      const controller = registerCryptoOperation();
      privateUploadStore.registerController(controller);
      privateUploadStore.setQuotaErrorRaised(false);

      const initItems = files.map((f) => ({
        uniqueId:
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        fileName: f.name,
        fileSize: f.size,
        folderId,
      }));
      uploadStore.startBatch(initItems);
      uploadStore.setPanelVisible(true);

      setIsUploading(true);
      let ok = false;
      try {
        const { orchestrateEncryptedUpload } = await loadOrchestrator();
        const result = await orchestrateEncryptedUpload({
          files,
          folderId,
          roomId,
          identity,
          userId,
          publicKey,
          publicKeyId,
          signal: controller.signal,
          uploadStore: {
            files: [],
            reportProgress: (uploadId, percent) =>
              uploadStore.updateItemProgress(uploadId, percent),
            // Translate the raw phase marker into a localised label before
            // storing it so the orchestrator stays UI-agnostic.
            setItemLabel: (uploadId, phase) =>
              uploadStore.setItemLabel(
                uploadId,
                phase === "encrypting"
                  ? t("Common:EncryptingFile")
                  : undefined,
              ),
          },
          onQuotaError: (error) => {
            privateUploadStore.setQuotaErrorRaised(true);
            // Quota errors are server-side, not crypto: keep the server
            // message when present, fall back to the quota tooltip.
            const msg =
              error instanceof Error
                ? error.message
                : t("UploadPanel:QuotaExceededTooltip");
            toastr.error(msg);
          },
          onFileError: (file, error) => {
            const idx = files.indexOf(file);
            const init = initItems[idx];
            if (init) {
              // Typed crypto errors carry precise diagnostic messages; untyped
              // errors (prepare/wrap/network failures) use the prepare key since
              // we cannot distinguish prepare vs wrap at this callback boundary.
              const msg =
                error instanceof CryptoError
                  ? getEncryptionErrorMessage(t, error)
                  : t("Common:EncryptionPrepareFailed");
              uploadStore.setItemError(init.uniqueId, msg);
            }
          },
          onFileComplete: (file) => {
            const idx = files.indexOf(file);
            const init = initItems[idx];
            if (init) uploadStore.setItemUploaded(init.uniqueId);
          },
        });

        if (result.aborted && !privateUploadStore.quotaErrorRaised) {
          for (const r of result.results) {
            if (r.aborted) uploadStore.setItemCancelled(r.uploadId);
          }
        }

        ok =
          !result.aborted &&
          result.results.length > 0 &&
          result.results.every((r) => r.ok);
      } catch (error) {
        // Typed crypto errors carry precise diagnostic messages; untyped errors
        // (unexpected orchestrator / session failures) use the prepare key since
        // they most likely originate in the pre-upload preparation phase.
        toastr.error(
          error instanceof CryptoError
            ? getEncryptionErrorMessage(t, error)
            : t("Common:EncryptionPrepareFailed"),
        );
      } finally {
        releaseAutoLock();
        privateUploadStore.releaseController(controller);
        releaseCryptoOperation(controller);
        setIsUploading(false);
      }

      return { ok };
    },
    [
      requireIdentity,
      suspendAutoLock,
      identityStore,
      uploadStore,
      privateUploadStore,
      t,
    ],
  );

  return { uploadFiles, isUploading };
};
