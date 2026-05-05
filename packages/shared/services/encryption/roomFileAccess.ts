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

// Per-file access helpers built on top of hpke.ts. The list of wrapped DEKs
// stored on the server is keyed by recipient userId; the sender userId is
// embedded in the wrap blob and resolved against roomMemberKeys at unwrap.

import { unwrapDEK, wrapDEK, inspectWrap } from "./hpke";
import { NoAccessError, AuthenticationError } from "./errors";
import type { IdentityKeyPair, ServerAccessKeyDto } from "./types";

export type RoomMemberPublicKey = {
  userId: string;
  /** Base64-encoded raw 32-byte X25519 public key. */
  publicKey: string;
  publicKeyId?: string;
};

/** Throws NoAccessError when no entry; AuthenticationError on HPKE-Auth fail. */
export async function unwrapDekForCurrentUser(params: {
  fileKeys: ServerAccessKeyDto[];
  roomMemberKeys: RoomMemberPublicKey[];
  currentUserId: string;
  currentIdentity: IdentityKeyPair;
  fileId: number;
}): Promise<Uint8Array> {
  const {
    fileKeys,
    roomMemberKeys,
    currentUserId,
    currentIdentity,
    fileId,
  } = params;

  if (!Number.isFinite(fileId) || fileId <= 0) {
    throw new AuthenticationError(
      "fileId must be a positive integer for unwrap",
    );
  }

  const myEntry = fileKeys.find(
    (k) => String(k.userId) === String(currentUserId),
  );
  if (!myEntry) {
    throw new NoAccessError(currentUserId);
  }

  const inspection = inspectWrap(myEntry.privateKeyEnc);
  const senderUserId = inspection.senderUserId;

  const senderEntry = roomMemberKeys.find(
    (k) => String(k.userId) === String(senderUserId),
  );
  if (!senderEntry) {
    throw new AuthenticationError(
      `wrap claims sender ${senderUserId} but no public key was provided`,
    );
  }

  const senderPubBytes = decodeBase64(senderEntry.publicKey);

  return unwrapDEK({
    wrapped: myEntry.privateKeyEnc,
    recipientPrivateKey: currentIdentity.privateKey,
    recipientUserId: currentUserId,
    expectedSenderPublicKey: senderPubBytes,
    expectedSenderUserId: senderUserId,
    fileId,
  });
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
