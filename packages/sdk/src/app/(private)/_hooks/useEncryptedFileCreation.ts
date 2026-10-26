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
import { getEncryptedOperationErrorMessage } from "@docspace/shared/services/encryption/error-i18n";
import { selectUserKey } from "@docspace/shared/services/encryption/select-user-key";
import { createEncryptedFile } from "@docspace/shared/services/private-room/encrypted-file-creation";
import { isEncryptedCreateExtension } from "@docspace/shared/services/private-room/encrypted-create-rules";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";

import type { TDocumentExtension } from "@/app/(personal-files)/_hooks/useDocsActions";

import { useEncryptionIdentityStore } from "../_store/EncryptionIdentityStore";

/** Creates empty documents in a private room, encrypted like an upload. */
export const useEncryptedFileCreation = (roomId: number | string) => {
  const { t } = useTranslation(["Common"]);
  const { requireIdentity, suspendAutoLock } = useEncryption();
  const identityStore = useEncryptionIdentityStore();

  const createFile = React.useCallback(
    async (
      folderId: number | string,
      title: string,
      extension: TDocumentExtension,
    ) => {
      if (!isEncryptedCreateExtension(extension)) {
        toastr.error(t("Common:PrivateRoomCreateNotSupported", { extension }));
        return false;
      }

      const userId = identityStore.userKeys?.userId;
      const publicKey = identityStore.userKeys?.publicKey;
      const publicKeyId = selectUserKey(identityStore.keys)?.id ?? null;

      if (!userId || !publicKey || !publicKeyId) {
        toastr.error(t("Common:EncryptionKeysNotConfigured"));
        return false;
      }

      const identity = await requireIdentity();
      if (!identity) return false;

      const releaseAutoLock = suspendAutoLock();
      try {
        await createEncryptedFile({
          extension,
          title,
          folderId,
          roomId,
          identity,
          userId,
          publicKey,
          publicKeyId,
        });
        return true;
      } catch (error) {
        toastr.error(getEncryptedOperationErrorMessage(t, error));
        return false;
      } finally {
        releaseAutoLock();
      }
    },
    [identityStore, requireIdentity, suspendAutoLock, roomId, t],
  );

  return { createFile };
};

export default useEncryptedFileCreation;
