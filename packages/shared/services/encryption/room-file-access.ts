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
import { NoAccessError, AuthenticationError } from "./errors";
import {
  getKeyMismatchHandler,
  getTofuStore,
  type KeyMismatchResolver,
} from "./tofu-store";
import type { TofuKeyEntry } from "./tofu-store";
import type { IdentityKeyPair, ServerAccessKeyDto } from "./types";

export type RoomMemberPublicKey = {
  userId: string;
  publicKey: string;
  publicKeyId?: string;
};

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
  currentPublicKeyId?: string;
}): Promise<Uint8Array> {
  const {
    fileKeys,
    roomMemberKeys,
    currentUserId,
    currentIdentity,
    fileId,
    onKeyChange,
    senderDisplayName,
    currentPublicKeyId,
  } = params;

  if (!Number.isFinite(fileId) || fileId <= 0) {
    throw new AuthenticationError(
      "fileId must be a positive integer for unwrap",
    );
  }

  const myEntries = fileKeys.filter(
    (k) => String(k.userId) === String(currentUserId),
  );
  if (myEntries.length === 0) {
    throw new NoAccessError(currentUserId);
  }

  const ordered = currentPublicKeyId
    ? [...myEntries].sort(
        (a, b) =>
          Number(b.publicKeyId === currentPublicKeyId) -
          Number(a.publicKeyId === currentPublicKeyId),
      )
    : myEntries;

  let lastError: unknown = null;

  const tryCandidates = async (
    myEntry: ServerAccessKeyDto,
    senderUserId: string,
    candidates: RoomMemberPublicKey[],
  ): Promise<Uint8Array | null> => {
    for (const candidate of candidates) {
      const senderPubBytes = decodeBase64(candidate.publicKey);

      let dek: Uint8Array;
      try {
        dek = await unwrapDEK({
          wrapped: myEntry.privateKeyEnc,
          recipientPrivateKey: currentIdentity.privateKey,
          recipientUserId: currentUserId,
          expectedSenderPublicKey: senderPubBytes,
          expectedSenderUserId: senderUserId,
          fileId,
        });
      } catch (e) {
        lastError = e;
        continue;
      }

      try {
        await verifySenderKeyAgainstTofu(
          currentUserId,
          senderUserId,
          candidate.publicKey,
          onKeyChange,
          senderDisplayName,
        );
      } catch (e) {
        wipeDek(dek);
        lastError = e;
        continue;
      }

      return dek;
    }
    return null;
  };

  for (const myEntry of ordered) {
    const inspection = inspectWrap(myEntry.privateKeyEnc);
    const senderUserId = inspection.senderUserId;

    const liveCandidates = roomMemberKeys.filter(
      (k) => String(k.userId) === String(senderUserId),
    );

    const dek = await tryCandidates(myEntry, senderUserId, liveCandidates);
    if (dek) return dek;

    // A sender who left the room disappears from both live key sources while
    // their wraps stay valid; keys this device already trusts still apply.
    const tofuCandidates = await loadTofuSenderCandidates(
      currentUserId,
      senderUserId,
      liveCandidates,
    );
    if (liveCandidates.length === 0 && tofuCandidates.length === 0) {
      lastError = new AuthenticationError(
        `wrap claims sender ${senderUserId} but no public key was provided`,
      );
      continue;
    }

    const tofuDek = await tryCandidates(myEntry, senderUserId, tofuCandidates);
    if (tofuDek) return tofuDek;
  }

  throw lastError instanceof Error
    ? lastError
    : new AuthenticationError("unwrap failed for all matching fileKeys");
}

async function loadTofuSenderCandidates(
  scopeUserId: string,
  senderUserId: string,
  alreadyTried: RoomMemberPublicKey[],
): Promise<RoomMemberPublicKey[]> {
  let keys: TofuKeyEntry[];
  try {
    keys = await getTofuStore(scopeUserId).getKeys(senderUserId);
  } catch {
    return [];
  }
  const tried = new Set(alreadyTried.map((c) => c.publicKey));
  return keys
    .filter((k) => !tried.has(k.publicKey))
    .sort((a, b) => b.lastSeenAt - a.lastSeenAt)
    .map((k) => ({ userId: senderUserId, publicKey: k.publicKey }));
}

async function verifySenderKeyAgainstTofu(
  scopeUserId: string,
  senderUserId: string,
  senderPublicKey: string,
  resolver: KeyMismatchResolver | undefined,
  displayName: string | undefined,
): Promise<void> {
  const tofu = getTofuStore(scopeUserId);
  const result = await tofu.checkKey(senderUserId, senderPublicKey);
  if (result.kind === "first-seen" || result.kind === "match") return;

  const handler = resolver ?? getKeyMismatchHandler();
  if (!handler) {
    throw new AuthenticationError(
      `sender ${senderUserId} key changed; no resolver registered`,
    );
  }

  let decision: "accept" | "refuse";
  try {
    decision = await handler({
      userId: senderUserId,
      knownKey: result.known.publicKey,
      newKey: result.submitted,
      knownFirstSeenAt: result.known.firstSeenAt,
      knownLastSeenAt: result.known.lastSeenAt,
      displayName,
    });
  } catch {
    throw new AuthenticationError(
      `sender ${senderUserId} key change resolver threw`,
    );
  }

  if (decision !== "accept") {
    throw new AuthenticationError(
      `sender ${senderUserId} key change refused`,
    );
  }
  await tofu.acceptKey(senderUserId, senderPublicKey);
}

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
    const recipientPubBytes = decodeBase64(r.publicKey);
    const wrapped = await wrapDEK({
      dek,
      senderPrivateKey: senderIdentity.privateKey,
      senderPublicKey: senderIdentity.publicKey,
      senderUserId,
      recipientPublicKey: recipientPubBytes,
      recipientUserId: r.userId,
      fileId,
    });
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
