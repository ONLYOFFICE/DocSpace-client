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
import { selectUserKey } from "@docspace/shared/services/encryption/select-user-key";
import { CryptoError } from "@docspace/shared/services/encryption/errors";
import { getEncryptionErrorMessage } from "@docspace/shared/services/encryption/error-i18n";
import type {
  EncryptedUploadRetryItem,
  OrchestrateResult,
} from "@docspace/shared/services/private-room/encrypted-upload-orchestrator";
import type { SkippedMemberKey } from "@docspace/shared/services/private-room/member-key-verification";
import type { TFile } from "@docspace/shared/api/files/types";

import { useUploadStore } from "@/app/(docspace)/_store/UploadStore";
import { useFilesListStore } from "@/app/(docspace)/_store/FilesListStore";

import { useEncryptionIdentityStore } from "../_store/EncryptionIdentityStore";
import { usePrivateEncryptedUploadStore } from "../_store/PrivateEncryptedUploadStore";
import { usePrivateDialogsStore } from "../_store/PrivateDialogsStore";
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

const newUploadId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export const useEncryptedUpload = (): UseEncryptedUploadReturn => {
  const { t } = useTranslation(["Common"]);
  const { requireIdentity, suspendAutoLock } = useEncryption();
  const identityStore = useEncryptionIdentityStore();
  const uploadStore = useUploadStore();
  const filesListStore = useFilesListStore();
  const privateUploadStore = usePrivateEncryptedUploadStore();
  const privateDialogs = usePrivateDialogsStore();
  const [isUploading, setIsUploading] = React.useState(false);
  const sendRef = React.useRef<
    (items: EncryptedUploadRetryItem[], isRetry: boolean) => Promise<boolean>
  >(async () => false);

  const reportSkippedMembers = React.useCallback(
    async (
      skipped: SkippedMemberKey[],
      nameSkippedMembers: (
        members: SkippedMemberKey[],
      ) => Promise<SkippedMemberKey[]>,
    ) => {
      const reported = privateUploadStore.reportedSkippedMemberIds;
      const fresh = (await nameSkippedMembers(skipped)).filter(
        (member) => !reported.has(member.userId),
      );
      if (fresh.length === 0) return;
      for (const member of fresh) reported.add(member.userId);
      toastr.warning(
        t("Common:EncryptedUploadNotSharedWith", {
          names: fresh.map((m) => m.displayName ?? m.userId).join(", "),
        }),
      );
    },
    [privateUploadStore, t],
  );

  const send = React.useCallback(
    async (items: EncryptedUploadRetryItem[], isRetry: boolean) => {
      const releaseAutoLock = suspendAutoLock();
      const controller = registerCryptoOperation();
      privateUploadStore.registerController(controller);
      privateUploadStore.setQuotaErrorRaised(false);
      setIsUploading(true);

      const fail = (uploadId: string, message: string, isQuota = false) => {
        if (isQuota) uploadStore.setItemQuotaError(uploadId, message);
        else uploadStore.setItemError(uploadId, message);
        const item = items.find((i) => i.uploadId === uploadId);
        if (!item) return;
        uploadStore.setItemRetry(uploadId, () => {
          uploadStore.resetItemForRetry(uploadId);
          void sendRef.current([item], true);
        });
      };
      const quotaMessage = (error: unknown) =>
        (error as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message || t("Common:QuotaExceededTooltip");

      try {
        const orchestrator = await loadOrchestrator();
        const options = {
          userId: identityStore.userKeys?.userId,
          publicKey: identityStore.userKeys?.publicKey,
          publicKeyId: selectUserKey(identityStore.keys)?.id ?? null,
          requireIdentity,
          signal: controller.signal,
          fileSignal: (uploadId: string) =>
            uploadStore.items.find((i) => i.uniqueId === uploadId)
              ?.abortController.signal,
          uploadStore: {
            files: [],
            reportProgress: (uploadId: string, percent: number) =>
              uploadStore.updateItemProgress(uploadId, percent),
            // Translate the raw phase marker into a localised label before
            // storing it so the orchestrator stays UI-agnostic.
            setItemLabel: (uploadId: string, phase: string | undefined) =>
              uploadStore.setItemLabel(
                uploadId,
                phase === "encrypting"
                  ? t("Common:EncryptingFile")
                  : undefined,
              ),
            markRefused: (
              uploadId: string,
              refusal: Parameters<
                typeof orchestrator.getEncryptedUploadRefusalMessage
              >[1],
            ) =>
              fail(
                uploadId,
                orchestrator.getEncryptedUploadRefusalMessage(t, refusal),
              ),
            markQuotaError: (uploadId: string, error: unknown) =>
              fail(uploadId, quotaMessage(error), true),
          },
          onQuotaError: (error: unknown) => {
            privateUploadStore.setQuotaErrorRaised(true);
            toastr.error(quotaMessage(error));
          },
          onFileError: (_file: File, error: unknown, uploadId: string) =>
            fail(uploadId, orchestrator.getEncryptedUploadErrorMessage(t, error)),
          onFileComplete: (
            _file: File,
            fileResult: { uploadId: string; file?: TFile },
          ) => {
            uploadStore.setItemUploaded(fileResult.uploadId);
            if (fileResult.file) filesListStore.addStoredFile(fileResult.file);
          },
          onNameClash: (clashes: { file: File }[]) =>
            privateDialogs.askNameClash(clashes.map(({ file }) => file.name)),
        };

        const result: OrchestrateResult = isRetry
          ? await orchestrator.retryEncryptedUploads({ ...options, items })
          : await orchestrator.orchestrateEncryptedUpload({
              ...options,
              files: items.map((i) => i.file),
              uploadIds: items.map((i) => i.uploadId),
              folderId: items[0].folderId,
              roomId: items[0].roomId,
            });

        if (result.refused) {
          const notice = orchestrator.getEncryptedUploadRefusalNotice(
            t,
            result.refused,
          );
          if (notice) toastr.info(notice);
        }

        if (result.aborted && !privateUploadStore.quotaErrorRaised) {
          for (const r of result.results) {
            if (r.aborted) uploadStore.setItemCancelled(r.uploadId);
          }
        }

        if (result.skippedMembers.length > 0) {
          await reportSkippedMembers(
            result.skippedMembers,
            orchestrator.nameSkippedMembers,
          );
        }

        return (
          !result.aborted &&
          !result.refused &&
          result.results.length > 0 &&
          result.results.every((r) => r.ok)
        );
      } catch (error) {
        // Typed crypto errors carry precise diagnostic messages; untyped errors
        // (unexpected orchestrator / session failures) use the prepare key since
        // they most likely originate in the pre-upload preparation phase.
        const message =
          error instanceof CryptoError
            ? getEncryptionErrorMessage(t, error)
            : t("Common:EncryptionPrepareFailed");
        toastr.error(message);
        for (const { uploadId } of items) {
          const row = uploadStore.items.find((i) => i.uniqueId === uploadId);
          if (row?.status === "uploading") fail(uploadId, message);
        }
        return false;
      } finally {
        releaseAutoLock();
        privateUploadStore.releaseController(controller);
        releaseCryptoOperation(controller);
        setIsUploading(false);
      }
    },
    [
      requireIdentity,
      suspendAutoLock,
      identityStore,
      uploadStore,
      filesListStore,
      privateUploadStore,
      privateDialogs,
      reportSkippedMembers,
      t,
    ],
  );
  sendRef.current = send;

  const uploadFiles = React.useCallback(
    async ({ files, folderId, roomId }: UploadFilesArgs) => {
      if (files.length === 0) return { ok: false };

      const items = files.map((file) => ({
        file,
        uploadId: newUploadId(),
        folderId,
        roomId,
      }));
      uploadStore.startBatch(
        items.map(({ file, uploadId }) => ({
          uniqueId: uploadId,
          fileName: file.name,
          fileSize: file.size,
          folderId,
        })),
      );
      uploadStore.setPanelVisible(true);

      return { ok: await send(items, false) };
    },
    [uploadStore, send],
  );

  return { uploadFiles, isUploading };
};
