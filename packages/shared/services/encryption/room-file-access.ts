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

// Per-file access helpers built on top of hpke.ts. The list of wrapped DEKs
// stored on the server is keyed by recipient userId; the sender userId is
// embedded in the wrap blob and resolved against roomMemberKeys at unwrap.

import { unwrapDEK, wrapDEK, inspectWrap } from "./hpke";
import { wipeDek } from "./file-keys";
import {
  AuthenticationError,
  KeyCheckUnavailableError,
  NoAccessError,
} from "./errors";
import {
  getKeyMismatchHandler,
  getTofuStore,
  keysEqual,
  type KeyMismatchResolver,
  type TofuKeyEntry,
} from "./tofu-store";
import type { IdentityKeyPair, ServerAccessKeyDto } from "./types";

export type RoomMemberPublicKey = {
  userId: string;
  publicKey: string;
  publicKeyId?: string;
};

const ZERO_KEY_ID = "00000000-0000-0000-0000-000000000000";

/**
 * True when the user's own access entry of a file names a key that the key
 * list of the same answer does not hold. An entry without a key id, or an
 * answer without a key list, is not that case.
 */
// Spec: private-rooms/file-operations, "A file wrapped for a key the user no longer holds is reported as such"
export function isWrappedForReplacedKey(
  info:
    | {
        userKeys?: readonly { id: string }[] | null;
        fileKeys?:
          | readonly { userId: string; publicKeyId?: string | null }[]
          | null;
      }
    | null
    | undefined,
  userId: string,
): boolean {
  const wrapKeyId = info?.fileKeys
    ?.find((k) => String(k.userId) === String(userId))
    ?.publicKeyId?.toLowerCase();
  if (!wrapKeyId || wrapKeyId === ZERO_KEY_ID || !info?.userKeys?.length) {
    return false;
  }
  return !info.userKeys.some((k) => String(k.id).toLowerCase() === wrapKeyId);
}

/** Throws NoAccessError when no entry; AuthenticationError on HPKE-Auth fail
 * or on TOFU mismatch when no resolver accepts the new sender key. */
export async function unwrapDekForCurrentUser(params: {
  fileKeys: ServerAccessKeyDto[];
  roomMemberKeys: RoomMemberPublicKey[];
  currentUserId: string;
  currentIdentity: IdentityKeyPair;
  fileId: number;
  onKeyChange?: KeyMismatchResolver;
  senderDisplayName?: string;
}): Promise<Uint8Array> {
  const {
    fileKeys,
    roomMemberKeys,
    currentUserId,
    currentIdentity,
    fileId,
    onKeyChange,
    senderDisplayName,
  } = params;

  if (!Number.isFinite(fileId) || fileId <= 0) {
    throw new AuthenticationError(
      "fileId must be a positive integer for unwrap",
    );
  }

  // The server keeps at most one entry per (file, user).
  const myEntry = fileKeys.find(
    (k) => String(k.userId) === String(currentUserId),
  );
  if (!myEntry) {
    throw new NoAccessError(currentUserId);
  }

  const inspection = inspectWrap(myEntry.privateKeyEnc);
  const senderUserId = inspection.senderUserId;
  const tofu = getTofuStore(currentUserId);

  // Spec: private-rooms/encryption-core, "Key mismatch on unwrap is refused unless a resolver accepts it"
  const pins = await tofu.readKeys(senderUserId);
  if (pins === null) throw new KeyCheckUnavailableError();

  const live = roomMemberKeys.filter(
    (k) => String(k.userId) === String(senderUserId),
  );
  if (live.length === 0 && pins.length === 0) {
    throw new AuthenticationError(
      `wrap claims sender ${senderUserId} but no public key was provided`,
    );
  }

  const isPinned = (key: string) =>
    pins.some((pin) => keysEqual(pin.publicKey, key));
  // Pinned keys first, those of a sender who left the room included.
  const pinned = live.filter((c) => isPinned(c.publicKey));
  for (const pin of [...pins].sort((a, b) => b.lastSeenAt - a.lastSeenAt)) {
    if (!pinned.some((c) => keysEqual(c.publicKey, pin.publicKey))) {
      pinned.push({ userId: senderUserId, publicKey: pin.publicKey });
    }
  }
  // Then every other listed key: unpinned when the sender has no record,
  // changed when it has one. Each is asked about only once it opened the wrap.
  const candidates = [...pinned, ...live.filter((c) => !isPinned(c.publicKey))];

  let lastError: unknown = null;
  const tryUnwrap = async (candidate: RoomMemberPublicKey) => {
    try {
      return await unwrapDEK({
        wrapped: myEntry.privateKeyEnc,
        recipientPrivateKey: currentIdentity.privateKey,
        recipientUserId: currentUserId,
        expectedSenderPublicKey: decodeBase64(candidate.publicKey),
        expectedSenderUserId: senderUserId,
        fileId,
      });
    } catch (e) {
      lastError = e;
      return null;
    }
  };

  // A changed key is used only once the user accepted it and it is stored.
  // Spec: private-rooms/encryption-core, "Key mismatch on unwrap is refused unless a resolver accepts it"
  const acceptChangedKey = async (known: TofuKeyEntry, newKey: string) => {
    const handler = onKeyChange ?? getKeyMismatchHandler();
    if (!handler) {
      throw new AuthenticationError(
        `sender ${senderUserId} key changed; no resolver registered`,
      );
    }
    let decision: "accept" | "refuse";
    try {
      decision = await handler({
        userId: senderUserId,
        knownKey: known.publicKey,
        newKey,
        knownFirstSeenAt: known.firstSeenAt,
        knownLastSeenAt: known.lastSeenAt,
        displayName: senderDisplayName,
      });
    } catch {
      throw new AuthenticationError(
        `sender ${senderUserId} key change resolver threw`,
      );
    }
    if (decision !== "accept") {
      throw new AuthenticationError(`sender ${senderUserId} key change refused`);
    }
    if (!(await tofu.acceptKey(senderUserId, newKey))) {
      throw new KeyCheckUnavailableError();
    }
  };

  // The key that opened the wrap is released only once its pin is stored or,
  // for a changed key, once the user accepted it and it is stored.
  for (const candidate of candidates) {
    const dek = await tryUnwrap(candidate);
    if (!dek) continue;
    try {
      const result = await tofu.checkKey(senderUserId, candidate.publicKey);
      if (result.kind === "unavailable") throw new KeyCheckUnavailableError();
      if (result.kind === "mismatch") {
        await acceptChangedKey(result.known, candidate.publicKey);
      }
    } catch (e) {
      wipeDek(dek);
      throw e;
    }
    return dek;
  }

  throw lastError instanceof Error
    ? lastError
    : new AuthenticationError("unwrap failed for all matching fileKeys");
}

/**
 * Wraps the file key for each recipient; a recipient whose key cannot be
 * wrapped for is left out of the result and the others still get theirs.
 */
// Spec: private-rooms/encryption-core, "An unusable member key affects only that member"
export async function wrapDekForRecipients(params: {
  dek: Uint8Array;
  senderIdentity: IdentityKeyPair;
  senderUserId: string;
  recipients: RoomMemberPublicKey[];
  fileId: number;
}): Promise<ServerAccessKeyDto[]> {
  const { dek, senderIdentity, senderUserId, recipients, fileId } = params;

  const out: ServerAccessKeyDto[] = [];
  for (const r of recipients) {
    let wrapped: string;
    try {
      wrapped = await wrapDEK({
        dek,
        senderPrivateKey: senderIdentity.privateKey,
        senderPublicKey: senderIdentity.publicKey,
        senderUserId,
        recipientPublicKey: decodeBase64(r.publicKey),
        recipientUserId: r.userId,
        fileId,
      });
    } catch {
      continue;
    }
    out.push({
      userId: r.userId,
      publicKeyId: r.publicKeyId ?? "",
      privateKeyEnc: wrapped,
    });
  }
  return out;
}

function decodeBase64(s: string): Uint8Array {
  const binary = atob(s);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}
