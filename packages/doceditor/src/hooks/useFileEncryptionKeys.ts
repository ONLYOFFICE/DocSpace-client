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

import { getFileEncryptionAccess } from "@docspace/shared/api/files";
import { useEncryptionOptional } from "@docspace/shared/context/encryption";
import { unwrapDekForCurrentUser } from "@docspace/shared/services/encryption/room-file-access";
import { wipeDek } from "@docspace/shared/services/encryption/file-keys";
import { arrayBufferToBase64 } from "@docspace/shared/services/encryption/utils";
import { loadRoomMemberKeysSafe } from "@docspace/shared/services/private-room/room-member-keys";
import type { TUser } from "@docspace/shared/api/people/types";

import { useEncryptionKeysReady } from "@/components/EncryptionProviderWrapper";
import type { IInitialConfig } from "@/types";

export type TEditorEncryptionKeys = { [key: string]: string | boolean };

export type TFileEncryptionStatus =
  | "off"
  | "loading"
  | "unlocking"
  | "ready"
  | "error";

export type TUseFileEncryptionKeys = {
  status: TFileEncryptionStatus;
  encryptionKeys?: TEditorEncryptionKeys;
};

const useFileEncryptionKeys = (
  config: IInitialConfig | undefined,
  user: TUser | undefined,
): TUseFileEncryptionKeys => {
  const isEncrypted = !!config?.file?.encrypted;

  const [state, setState] = React.useState<TUseFileEncryptionKeys>({
    status: isEncrypted ? "loading" : "off",
  });

  const fileId = config?.file?.id;
  const userId = user?.id;

  const roomId =
    config?.document?.referenceData?.roomId ||
    (config?.file?.originRoomId != null
      ? String(config.file.originRoomId)
      : "") ||
    (config?.file?.folderId != null ? String(config.file.folderId) : "");

  const encryption = useEncryptionOptional();
  const requireIdentity = encryption?.requireIdentity;
  const keysReady = useEncryptionKeysReady();

  React.useEffect(() => {
    if (!isEncrypted) {
      setState({ status: "off" });
      return undefined;
    }

    let cancelled = false;
    let dek: Uint8Array | null = null;

    const acquire = async () => {
      try {
        const currentUserId = userId ? String(userId) : "";
        const numericFileId =
          typeof fileId === "number" ? fileId : Number(fileId);

        if (
          !currentUserId ||
          !Number.isFinite(numericFileId) ||
          numericFileId <= 0
        ) {
          throw new Error("Missing user id or file id for encryption");
        }

        setState({ status: "loading" });

        const info = await getFileEncryptionAccess(numericFileId);
        const hasOwnEntry = info?.fileKeys?.some(
          (k) => String(k.userId) === currentUserId,
        );
        if (!info?.fileKeys || !hasOwnEntry) {
          throw new Error("No encryption access for the current user");
        }

        if (cancelled) return;
        setState({ status: "unlocking" });

        const identity = (await requireIdentity?.()) ?? null;
        if (!identity) {
          if (!cancelled) {
            setState({ status: keysReady ? "error" : "unlocking" });
          }
          return;
        }
        if (cancelled) return;

        const roomMemberKeys = await loadRoomMemberKeysSafe(roomId);

        dek = await unwrapDekForCurrentUser({
          fileKeys: info.fileKeys,
          roomMemberKeys,
          currentUserId,
          currentIdentity: identity,
          fileId: numericFileId,
        });

        const serverCryptoEngineId =
          config?.editorConfig?.encryptionKeys?.cryptoEngineId;

        const encryptionKeys: TEditorEncryptionKeys = {
          dek: arrayBufferToBase64(dek),
        };
        if (typeof serverCryptoEngineId === "string") {
          encryptionKeys.cryptoEngineId = serverCryptoEngineId;
        }

        if (cancelled) return;
        setState({ status: "ready", encryptionKeys });
      } catch (error) {
        console.error("[ENCRYPTION] editor key acquisition failed:", error);
        if (!cancelled) setState({ status: "error" });
      } finally {
        if (dek) {
          wipeDek(dek);
          dek = null;
        }
      }
    };

    acquire();

    return () => {
      cancelled = true;
    };
  }, [isEncrypted, fileId, userId, roomId, requireIdentity, keysReady]);

  return state;
};

export default useFileEncryptionKeys;
