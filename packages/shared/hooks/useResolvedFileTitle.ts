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

import { useEffect, useRef, useSyncExternalStore } from "react";

import {
  getCachedEncryptedFilename,
  getFilenameCacheVersion,
  resolveDisplayTitle,
  subscribeFilenameCache,
} from "../services/encryption/filename-cache";
import { useEncryptionOptional } from "../context/encryption/EncryptionContext";
import { SecretStorage } from "../services/encryption/secret-storage";
import { ensureDecryptedFilename } from "../services/private-room/encrypted-filename-recovery";

type ResolvableFile =
  | {
      id?: number | string | null;
      title?: string | null;
      encrypted?: boolean | null;
      viewUrl?: string | null;
    }
  | null
  | undefined;

/** Where the names of encrypted files come from when they are not cached. */
export type TFilenameRecovery = {
  userId?: string | null;
  /** The private room that holds the files. */
  roomId?: number | string | null;
  /** The file's download URL, for an entry that carries none. */
  loadViewUrl?: (
    fileId: number | string,
  ) => Promise<string | null | undefined>;
};

/**
 * Recovers the names of encrypted files missing from the filename cache while
 * the identity is unlocked; a locked identity is left alone, never prompted.
 * Each file is tried once per mounted list.
 * Spec: private-rooms/file-operations, "Feeds show resolved names".
 */
export function useEncryptedFilenameRecovery(
  files: ResolvableFile[],
  recovery?: TFilenameRecovery,
): void {
  const attempted = useRef(new Set<string>());
  const pending = files.filter(
    (file): file is NonNullable<ResolvableFile> =>
      !!file?.encrypted &&
      file.id !== undefined &&
      file.id !== null &&
      !attempted.current.has(String(file.id)) &&
      !getCachedEncryptedFilename(file.id),
  );
  const latest = useRef({ pending, recovery });
  latest.current = { pending, recovery };

  const pendingKey = pending.map((file) => file.id).join(",");
  const userId = recovery?.userId;
  const roomId = recovery?.roomId;
  const isUnlocked = useEncryptionOptional()?.isUnlocked;

  useEffect(() => {
    if (!pendingKey || !userId || roomId === undefined || roomId === null) {
      return;
    }
    const identity = SecretStorage.getCached(userId);
    if (!identity) return;

    const { pending: files, recovery: current } = latest.current;
    for (const file of files) {
      const fileId = file.id as number | string;
      attempted.current.add(String(fileId));
      void (async () => {
        const viewUrl =
          file.viewUrl ??
          (await current?.loadViewUrl?.(fileId).catch(() => null));
        if (!viewUrl) return;
        await ensureDecryptedFilename(
          { id: Number(fileId), viewUrl, encrypted: true },
          userId,
          identity,
          roomId,
        );
      })();
    }
  }, [pendingKey, userId, roomId, isUnlocked]);
}

export function useResolvedFileTitle(
  file: ResolvableFile,
  recovery?: TFilenameRecovery,
): string {
  useEncryptedFilenameRecovery([file], recovery);
  return useSyncExternalStore(
    subscribeFilenameCache,
    () => resolveDisplayTitle(file),
    () => file?.title ?? "",
  );
}

export function useFilenameCacheVersion(): number {
  return useSyncExternalStore(
    subscribeFilenameCache,
    getFilenameCacheVersion,
    () => 0,
  );
}
