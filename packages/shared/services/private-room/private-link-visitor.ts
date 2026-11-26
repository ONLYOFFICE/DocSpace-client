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

import { getFilePublicKeys, openPrivateLink } from "../../api/privacy";
import type { TValidateShareRoom } from "../../api/rooms/types";
import { ValidationStatus } from "../../enums";
import { wipeDek } from "../encryption/file-keys";
import {
  deriveLinkProof,
  isLinkSecret,
  openLinkKey,
} from "../encryption/link-key";
import {
  type RoomMemberPublicKey,
  unwrapDekForCurrentUser,
} from "../encryption/room-file-access";
import {
  decryptFileNameRaw,
  parseDSE3Header,
} from "../encryption/streaming-encryption";
import type { IdentityKeyPair, ServerAccessKeyDto } from "../encryption/types";
import {
  type DecryptResult,
  downloadAndDecryptFile,
} from "./encrypted-download";
import { fetchHeaderBytes } from "./encrypted-filename-recovery";

/** An opened external link of a private item: its id and its key pair. */
export type TVisitorLink = {
  key: string;
  linkId: string;
  identity: IdentityKeyPair;
};

export type TOpenVisitorLink =
  | { state: "open"; link: TVisitorLink; status: TValidateShareRoom }
  /** The proof did not match: a wrong password, or a secret that is not the link's. */
  | { state: "wrong-proof" }
  /** Too many wrong proofs: the portal refuses the address for a while. */
  | { state: "blocked" }
  /** Revoked, closed by the room or the portal, or never there. */
  | { state: "invalid" }
  | { state: "expired" }
  /** A link for DocSpace users only, opened without signing in. */
  | { state: "sign-in" };

/**
 * The secret of a link, read from the part of an address after `#`. Null
 * when it is missing or is not 43 characters of the alphabet: the address
 * was copied incompletely, and nothing is asked of the server.
 *
 * Spec: private-rooms/encryption-core, "The secret of a link is encoded for an address"
 */
export const readLinkSecret = (hash: string): string | null => {
  const value = hash.charAt(0) === "#" ? hash.slice(1) : hash;
  return isLinkSecret(value) ? value : null;
};

/**
 * Opens a link for its visitor: sends the proof derived from the secret, and
 * from the password when the link has one, and opens the sealed key the
 * server answers. The secret and the password leave the page in no request.
 *
 * Spec: private-rooms/file-operations, "A visitor opens an external link without an account"
 */
export async function openVisitorLink(
  key: string,
  secret: string,
  password?: string,
): Promise<TOpenVisitorLink> {
  let status: TValidateShareRoom;
  try {
    status = await openPrivateLink(
      key,
      await deriveLinkProof(secret, password),
    );
  } catch (error) {
    const code = (error as { response?: { status?: number } })?.response
      ?.status;
    if (code === 403) return { state: "blocked" };
    throw error;
  }

  switch (status.status) {
    case ValidationStatus.Ok:
      break;
    case ValidationStatus.Expired:
      return { state: "expired" };
    case ValidationStatus.ExternalAccessDenied:
      return { state: "sign-in" };
    case ValidationStatus.Password:
    case ValidationStatus.InvalidPassword:
      return { state: "wrong-proof" };
    default:
      return { state: "invalid" };
  }

  if (!status.linkPrivateKeyEnc) return { state: "invalid" };
  try {
    const identity = await openLinkKey(
      { linkPrivateKeyEnc: status.linkPrivateKeyEnc },
      secret,
      password,
    );
    return {
      state: "open",
      link: { key, linkId: status.linkId ?? status.id, identity },
      status,
    };
  } catch {
    return { state: "wrong-proof" };
  }
}

type TVisitorFileKeys = {
  fileKeys: ServerAccessKeyDto[];
  roomMemberKeys: RoomMemberPublicKey[];
};

/**
 * The wrap of a file key made for the link, with the keys of the members it
 * may come from. Null when no member has made the wrap yet: the file is not
 * available through the link.
 */
async function readVisitorFileKeys(
  link: TVisitorLink,
  fileId: number,
): Promise<TVisitorFileKeys | null> {
  const keys = (await getFilePublicKeys(fileId)) ?? [];
  const own = keys.find((key) => key.isLink && key.fileKeyEnc);
  if (!own?.fileKeyEnc) return null;

  return {
    fileKeys: [
      {
        userId: link.linkId,
        publicKeyId: own.id,
        privateKeyEnc: own.fileKeyEnc,
      },
    ],
    roomMemberKeys: keys
      .filter((key) => !key.isLink && key.userId && key.publicKey)
      .map((key) => ({
        userId: String(key.userId),
        publicKey: key.publicKey,
        publicKeyId: key.id,
      })),
  };
}

/**
 * The key of a file reached through a link, opened with the key of the link,
 * for the editor that shows the document. `not-ready` when the link has no
 * key of the file yet. The caller wipes the key after use.
 */
export async function readVisitorFileDek(
  link: TVisitorLink,
  fileId: number,
): Promise<Uint8Array | "not-ready"> {
  const keys = await readVisitorFileKeys(link, fileId);
  if (!keys) return "not-ready";
  return unwrapDekForCurrentUser({
    ...keys,
    currentUserId: link.linkId,
    currentIdentity: link.identity,
    fileId,
    onKeyChange: async () => "refuse",
  });
}

export type TVisitorFile = {
  id: number;
  title: string;
  viewUrl?: string;
};

/**
 * The real name of a file reached through a link, decrypted from the head of
 * the stored file. `not-ready` when the link has no key of the file yet;
 * null when the name cannot be read, and the title of the server stands.
 *
 * Spec: private-rooms/file-operations, "A visitor opens an external link without an account"
 */
export async function readVisitorFileName(
  link: TVisitorLink,
  file: TVisitorFile,
): Promise<string | null | "not-ready"> {
  const keys = await readVisitorFileKeys(link, file.id);
  if (!keys) return "not-ready";
  if (!file.viewUrl) return null;

  const headerBytes = await fetchHeaderBytes(file.viewUrl);
  if (!headerBytes) return null;

  let dek: Uint8Array | null = null;
  try {
    const header = parseDSE3Header(headerBytes);
    if (!header.encryptedName) return null;
    dek = await unwrapDekForCurrentUser({
      ...keys,
      currentUserId: link.linkId,
      currentIdentity: link.identity,
      fileId: file.id,
      onKeyChange: async () => "refuse",
    });
    return await decryptFileNameRaw(
      header.encryptedName,
      dek,
      header.fileNonce,
    );
  } catch {
    return null;
  } finally {
    if (dek) wipeDek(dek);
  }
}

/**
 * Downloads a file reached through a link and decrypts it in the page.
 * `not-ready` when the link has no key of the file yet.
 */
export async function decryptVisitorFile(
  link: TVisitorLink,
  file: TVisitorFile,
  onProgress?: (progress: number) => void,
): Promise<DecryptResult | "not-ready"> {
  const keys = await readVisitorFileKeys(link, file.id);
  if (!keys) return "not-ready";
  if (!file.viewUrl) return { success: false, error: "The file has no address" };

  return downloadAndDecryptFile({
    ...keys,
    downloadUrl: file.viewUrl,
    fileId: file.id,
    userId: link.linkId,
    identity: link.identity,
    originalFileName: file.title,
    originalFileType: "",
    onDownloadProgress: onProgress,
  });
}
