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

// Eager recovery of encrypted-file display names. Invoked after identity
// unlock; for each visible encrypted file lacking a cached name we range-
// fetch the DSE3 header, decrypt only the encryptedName field, and write
// the result to the session-wide filename cache.

import { getFileEncryptionAccess } from "@docspace/shared/api/files";
import {
  parseDSE3Header,
  decryptFileNameRaw,
} from "@docspace/shared/services/encryption/streamingEncryption";
import { unwrapDekForCurrentUser } from "@docspace/shared/services/encryption/roomFileAccess";
import { wipeDek } from "@docspace/shared/services/encryption/fileKeys";
import {
  rememberEncryptedFilename,
  getCachedEncryptedFilename,
} from "@docspace/shared/services/encryption/filenameCache";
import type { IdentityKeyPair } from "@docspace/shared/services/encryption/types";

export type RecoveryCandidate = {
  id: number;
  viewUrl: string;
};

const HEADER_FETCH_BYTES = 4096;
const MAX_PARALLEL = 5;

async function fetchHeaderBytes(url: string): Promise<Uint8Array | null> {
  try {
    const response = await fetch(url, {
      headers: { Range: `bytes=0-${HEADER_FETCH_BYTES - 1}` },
    });
    if (!response.ok) return null;
    const buf = await response.arrayBuffer();
    return new Uint8Array(buf);
  } catch {
    return null;
  }
}

async function recoverOne(
  file: RecoveryCandidate,
  userId: string,
  identity: IdentityKeyPair,
): Promise<void> {
  if (getCachedEncryptedFilename(file.id)) return;

  const headerBytes = await fetchHeaderBytes(file.viewUrl);
  if (!headerBytes) return;

  let header: ReturnType<typeof parseDSE3Header>;
  try {
    header = parseDSE3Header(headerBytes);
  } catch {
    return;
  }
  if (!header.encryptedName) return;

  let dek: Uint8Array | null = null;
  try {
    const info = await getFileEncryptionAccess(file.id);
    if (!info?.fileKeys || info.fileKeys.length === 0) return;
    dek = await unwrapDekForCurrentUser({
      fileKeys: info.fileKeys,
      roomMemberKeys: info.userKeys ?? [],
      currentUserId: userId,
      currentIdentity: identity,
      fileId: file.id,
    });
    const name = await decryptFileNameRaw(
      header.encryptedName,
      dek,
      header.fileNonce,
    );
    if (name) rememberEncryptedFilename(file.id, name);
  } catch {
    // Swallow — recovery is best-effort; UI still has the obfuscated name.
  } finally {
    if (dek) wipeDek(dek);
  }
}

/**
 * Concurrent over MAX_PARALLEL slots; rejects nothing. Caller fires-and-
 * forgets — the cache writes propagate via subscribeFilenameCache.
 */
export async function recoverEncryptedFilenames(
  candidates: RecoveryCandidate[],
  userId: string,
  identity: IdentityKeyPair,
): Promise<void> {
  if (candidates.length === 0) return;

  const queue = candidates.slice();
  const workers: Promise<void>[] = [];
  for (let i = 0; i < Math.min(MAX_PARALLEL, queue.length); i++) {
    workers.push(
      (async () => {
        while (queue.length > 0) {
          const next = queue.shift();
          if (!next) return;
          await recoverOne(next, userId, identity);
        }
      })(),
    );
  }
  await Promise.all(workers);
}
