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

import { getFileConversationProgress } from "@docspace/shared/api/files";
import { wipeDek } from "@docspace/shared/services/encryption/file-keys";
import { suspendAutoLock } from "@docspace/shared/services/encryption/secret-storage";

import type { TFile } from "@docspace/shared/api/files/types";
import type { ItemUploadContext } from "@docspace/shared/services/private-room/encrypted-upload";

export type TUploadBrowserFile = File & {
  parentFolderId?: number | string;
  encrypted?: boolean;
  uploadContext?: ItemUploadContext;
  lastModifiedDate?: Date;
};

export type TUploadFile = {
  file: TUploadBrowserFile;
  uniqueId: string;
  fileId: number | null;
  toFolderId?: number | string | null;
  action?: "upload" | "uploaded" | "convert" | "converted";
  error?: string | null;
  fileInfo: TFile | null;
  cancel?: boolean;
  needConvert?: boolean;
  encrypted?: boolean;
  encryptionRoomId?: number | string | null;
  reimportRealName?: string | null;
  percent: number;
  inAction?: boolean;
  inConversion?: boolean;
  isQuotaError?: boolean;
  errorShown?: boolean;
  isCalculated?: boolean;
  needPassword?: boolean;
  convertProgress?: number;
  path?: number[];
  password?: string | null;
  format?: string | null;
  index?: number;
};

export type TConversionProgress = {
  progress?: number;
  result?: TFile | "password" | null;
  error?: string | null;
};

export const removeDuplicate = <T extends { uniqueId?: string }>(
  items: T[],
): T[] => {
  const obj: Record<string, boolean> = {};
  return items.filter((x) => {
    if (obj[x.uniqueId as string]) return false;
    obj[x.uniqueId as string] = true;
    return true;
  });
};

const dekByFileEntry = new WeakMap<object, Uint8Array | null>();

let uploadAutoLockRelease: (() => void) | null = null;

export function setFileDek(
  entry: TUploadFile | null | undefined,
  dek: Uint8Array | null,
) {
  if (!entry) return;
  const previous = dekByFileEntry.get(entry);
  if (previous && previous !== dek) {
    wipeDek(previous);
  }
  dekByFileEntry.set(entry, dek);
}

export function takeFileDek(entry: TUploadFile | null | undefined) {
  if (!entry) return null;
  const dek = dekByFileEntry.get(entry);
  if (dek) {
    dekByFileEntry.delete(entry);
    return dek;
  }
  return null;
}

export function hasFileDek(entry: TUploadFile | null | undefined) {
  return !!entry && dekByFileEntry.has(entry);
}

export const acquireUploadAutoLockSuspension = () => {
  if (uploadAutoLockRelease) return;
  try {
    uploadAutoLockRelease = suspendAutoLock();
  } catch {
    uploadAutoLockRelease = null;
  }
};

export const releaseUploadAutoLockSuspension = () => {
  if (!uploadAutoLockRelease) return;
  try {
    uploadAutoLockRelease();
  } catch {
    //
  }
  uploadAutoLockRelease = null;
};

export const getConversationProgress = async (fileId: number | null) => {
  const promise = new Promise<TConversionProgress[]>((resolve, reject) => {
    setTimeout(() => {
      // getFileConversationProgress is untyped in shared/api;
      // fileId is only null before the upload session has assigned one.
      (
        getFileConversationProgress(fileId as number) as Promise<
          TConversionProgress[]
        >
      )
        .then((res) => {
          // console.log(`getFileConversationProgress fileId:${fileId}`, res);
          resolve(res);
        })
        .catch((error) => {
          // console.error("getFileConversationProgress error", error);
          reject(error);
        });
    }, 1000);
  });

  return promise;
};
