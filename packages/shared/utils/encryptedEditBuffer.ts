// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import type { FileEncryptionMetadata } from "../services/encryption/types";

import { IndexedDBHelper } from "./indexedDBHelper";

const DB_NAME = "docspace_encrypted_edit";
const STORE_NAME = "buffers";

const dbHelper = new IndexedDBHelper();
let initialized = false;

async function ensureInit(): Promise<void> {
  if (initialized && dbHelper.getDB()) return;
  await dbHelper.init(DB_NAME, [STORE_NAME]);
  initialized = true;
}

export type EncryptedEditEntry = {
  id: string;
  fileId: number | string;
  buffer: ArrayBuffer;
  fileName: string;
  fileType: string;
  userPublicKey: string;
  encryptionMetadata: FileEncryptionMetadata;
  userId: string;
  createdAt: number;
};

export function generateEditSessionId(fileId: number | string): string {
  return `encrypted_edit_${fileId}_${Date.now()}`;
}

export async function storeEditBuffer(
  entry: EncryptedEditEntry,
): Promise<void> {
  await ensureInit();
  await dbHelper.putItem(STORE_NAME, entry);
}

export async function getEditBuffer(
  sessionId: string,
): Promise<EncryptedEditEntry | null> {
  await ensureInit();
  const result = await dbHelper.getItem(STORE_NAME, sessionId);
  return (result as EncryptedEditEntry) ?? null;
}

export async function deleteEditBuffer(sessionId: string): Promise<void> {
  await ensureInit();
  await dbHelper.deleteItem(STORE_NAME, sessionId);
}

export async function cleanupStaleBuffers(
  maxAgeMs: number = 3600000,
): Promise<void> {
  await ensureInit();
  const cutoff = Date.now() - maxAgeMs;
  const items = (await dbHelper.getAllItems(
    STORE_NAME,
  )) as EncryptedEditEntry[];

  for (const entry of items) {
    if (entry.createdAt < cutoff) {
      await dbHelper.deleteItem(STORE_NAME, entry.id);
    }
  }
}
