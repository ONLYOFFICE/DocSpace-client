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


import { getEncryptionKeys, setPrivateItemLink } from "../../api/privacy";
import type { TPrivateLinkTarget } from "../../api/privacy/types";
import type { TFile, TFileLink, TFolder } from "../../api/files/types";
import type { TRoom } from "../../api/rooms/types";
import { FolderType, RoomsType, ShareAccessRights } from "../../enums";
import type { TAvailableShareRights } from "../../types";
import { isFile, isRoom } from "../../utils/typeGuards";
import {
  createLinkKey,
  generateLinkSecret,
  type LinkSecret,
  unwrapLinkSecret,
  wrapLinkSecret,
} from "../encryption/link-key";
import type { IdentityKeyPair } from "../encryption/types";
import { arrayBufferToBase64 } from "../encryption/utils";
import { requireUnlock } from "../encryption/secret-storage";
import { wrapFilesForLink } from "./room-encryption";

type TPrivateLinkItem = TFile | TFolder | TRoom;

/** The end date a link to one file without a password is preset to. */
export const PRIVATE_FILE_LINK_DAYS = 7;

/**
 * How many links a file or a folder of a private room holds. The server
 * reports no link settings with such an entry and counts only when a link is
 * made (`FileSecurity.GetLinksSettings`), so the number is repeated here.
 */
export const PRIVATE_ITEM_LINKS_LIMIT = 6;

/**
 * How many additional links a private Custom room holds next to its primary
 * one (the same table of the server).
 */
export const PRIVATE_ROOM_ADDITIONAL_LINKS_LIMIT = 5;

/**
 * A link of a private item reads only (the server refuses any other access),
 * whatever rights the entry reports: a folder of a private room lists them all.
 */
export const PRIVATE_LINK_RIGHTS = {
  ExternalLink: ["Read"],
  PrimaryExternalLink: ["Read"],
} as TAvailableShareRights;

// The addresses read on this page, by link id: those of the links made here
// and those whose wrapped secret was opened.
const addresses = new Map<string, string>();

export const getPrivateLinkAddress = (linkId: string | number) =>
  addresses.get(String(linkId));

/** The caller's stored key that the unlocked identity belongs to. */
const findOwnKey = async (identity: IdentityKeyPair) => {
  const publicKey = identity.publicKey
    ? arrayBufferToBase64(identity.publicKey)
    : "";
  if (!publicKey) return undefined;
  return (await getEncryptionKeys()).find((key) => key.publicKey === publicKey);
};

/**
 * Whether the address of a link can be given to the caller: it was read on
 * this page, or the server holds its secret wrapped for them.
 *
 * Spec: private-rooms/room-membership, "Address of an existing link is copied by the owner and the managers"
 */
export const canReadPrivateLinkAddress = (link: TFileLink) =>
  addresses.has(String(link.sharedTo.id)) || !!link.sharedTo.linkSecretWrap;

/**
 * The address of a link with its secret after `#`, opened from the wrap the
 * server holds for the caller. Asks for the unlock first; null when it is
 * dismissed, when no wrap was made for the caller's current key, or when the
 * wrap does not open.
 */
// shortcut: only a wrap the caller made opens, since the keys of the other managers are not read here; the room's keys come with the wraps for them (private-rooms-external-links 3.4).
export async function readPrivateLinkAddress(
  link: TFileLink,
  userId: string,
): Promise<string | null> {
  const linkId = String(link.sharedTo.id);
  const known = addresses.get(linkId);
  if (known) return known;

  const { linkSecretWrap, linkPublicKey } = link.sharedTo;
  if (!linkSecretWrap || !linkPublicKey) return null;

  const identity = await requireUnlock(userId);
  if (!identity) return null;

  try {
    const own = await findOwnKey(identity);
    if (!own || own.id !== linkSecretWrap.publicKeyId) return null;

    const { secret } = await unwrapLinkSecret({
      wrap: linkSecretWrap.wrap,
      linkId,
      linkPublicKey,
      recipient: identity,
      recipientUserId: userId,
      senders: [{ userId, publicKey: own.publicKey }],
    });
    const address = `${link.sharedTo.shareLink}#${secret}`;
    addresses.set(linkId, address);
    return address;
  } catch {
    return null;
  }
}

/**
 * Stores the secret of a new link wrapped for its creator, so that the
 * address can be read again after the page is left. The request repeats the
 * settings of the link, which it would otherwise replace. A failure leaves
 * the link as it was made.
 *
 * Spec: private-rooms/encryption-core, "The secret of a link is wrapped for those who manage links"
 */
async function storeOwnSecretWrap(
  item: TPrivateLinkItem,
  link: TFileLink,
  held: LinkSecret,
  userId: string,
  identity: IdentityKeyPair,
): Promise<TFileLink> {
  try {
    const own = await findOwnKey(identity);
    if (!own) return link;

    const wrap = await wrapLinkSecret({
      link: held,
      linkId: String(link.sharedTo.id),
      sender: identity,
      senderUserId: userId,
      recipientPublicKey: own.publicKey,
      recipientUserId: userId,
    });
    return await setPrivateItemLink(getTarget(item), {
      ...linkSettings(link),
      linkSecretWraps: [{ userId, publicKeyId: own.id, wrap }],
    });
  } catch {
    return link;
  }
}

export type TPrivateLinkOptions = {
  password?: string;
  title?: string;
  expirationDate?: string | null;
  internal?: boolean;
  primary?: boolean;
};

/**
 * Whether the user manages the external links of the items of a private room.
 * The server checks a link of a file or a folder against the room
 * (`FileSharingHelper.CanSetLinkAsync`) and reports no right with the item
 * itself, so the room answers: its owner and its room managers, outside the
 * archive.
 *
 * Spec: private-rooms/room-membership, "No public sharing for private rooms"
 */
export const canManagePrivateLinks = (
  room: Pick<TRoom, "private" | "security" | "rootFolderType"> | null | undefined,
): boolean =>
  !!room &&
  room.private === true &&
  room.security?.EditAccess === true &&
  room.rootFolderType !== FolderType.Archive;

/**
 * Whether the private room takes links to itself, which only a Custom room
 * does: a Collaboration room and a Virtual Data Room have links to their
 * files and folders only.
 *
 * Spec: private-rooms/room-membership, "External link of a private item keeps the link model of the portal"
 */
export const canManagePrivateRoomLinks = (
  room:
    | Pick<TRoom, "private" | "security" | "rootFolderType" | "roomType">
    | null
    | undefined,
): boolean =>
  canManagePrivateLinks(room) && room?.roomType === RoomsType.CustomRoom;

/**
 * What a link of a private item lacks: a password, which a link to a folder
 * or a room always carries, or an end date, which stands in for the password
 * of a link to one file.
 *
 * Spec: private-rooms/room-membership, "A link without a password is limited to one file to view"
 */
export const getPrivateLinkNeed = (
  item: TPrivateLinkItem,
  { password, expirationDate }: Pick<TPrivateLinkOptions, "password" | "expirationDate">,
): "password" | "end-date" | null => {
  if (password) return null;
  if (!isFile(item)) return "password";
  return expirationDate ? null : "end-date";
};

/** The settings of a link as a change of it sends them again. */
const linkSettings = (link: TFileLink) => ({
  linkId: String(link.sharedTo.id),
  access: ShareAccessRights.ReadOnly,
  title: link.sharedTo.title,
  expirationDate: link.sharedTo.expirationDate ?? null,
  internal: link.sharedTo.internal,
  primary: link.sharedTo.primary,
});

const getTarget = (item: TPrivateLinkItem): TPrivateLinkTarget => {
  if (isRoom(item)) return { roomId: item.id };
  return isFile(item) ? { fileId: item.id } : { folderId: item.id };
};

/**
 * Creates an external link of a private item: asks for the unlock, makes the
 * key pair of the link and sends the server its public key, its sealed
 * private key and the hash of the proof. The secret and the password stay in
 * the browser; the address returned carries the secret after `#` and is the
 * only place it is kept. Resolves to null when the unlock is dismissed.
 *
 * The keys of the files the link covers are wrapped for it before the
 * address is returned; `missingFileIds` names the files that got no wrap
 * (null when they could not be listed), which the backfill covers later.
 *
 * Spec: private-rooms/room-membership, "External link of a private item keeps the link model of the portal"
 */
export async function createPrivateItemLink(
  item: TPrivateLinkItem,
  userId: string,
  options: TPrivateLinkOptions = {},
): Promise<{
  link: TFileLink;
  address: string;
  missingFileIds: number[] | null;
} | null> {
  const password = options.password || undefined;

  // A link to one file with no password and no word on its end date gets the
  // preset one; a date cleared on purpose (null) is left for the check below.
  const expirationDate =
    !password && isFile(item) && options.expirationDate === undefined
      ? new Date(
          Date.now() + PRIVATE_FILE_LINK_DAYS * 24 * 60 * 60 * 1000,
        ).toISOString()
      : options.expirationDate;

  const need = getPrivateLinkNeed(item, { password, expirationDate });
  if (need) throw new Error(`A link of a private item needs ${need}`);

  const identity = await requireUnlock(userId);
  if (!identity) return null;

  const secret = generateLinkSecret();
  const { keyPair, material } = await createLinkKey(secret, password);

  const created = await setPrivateItemLink(getTarget(item), {
    access: ShareAccessRights.ReadOnly,
    title: options.title,
    expirationDate,
    internal: options.internal,
    primary: options.primary,
    passwordRequired: !!password,
    ...material,
  });

  const address = `${created.sharedTo.shareLink}#${secret}`;
  addresses.set(String(created.sharedTo.id), address);

  const link = await storeOwnSecretWrap(
    item,
    created,
    { secret, keyPair },
    userId,
    identity,
  );

  const { missingFileIds } = await wrapFilesForLink(
    { id: Number(item.id), isFile: isFile(item) },
    { id: String(link.sharedTo.id), publicKey: material.linkPublicKey },
    { currentUserId: userId, identity },
  );

  return { link, address, missingFileIds };
}

/**
 * Changes the title, the end date and the audience of a link of a private
 * item. It sends no key material and no password: the server keeps both.
 */
export const editPrivateItemLink = (item: TPrivateLinkItem, link: TFileLink) =>
  setPrivateItemLink(getTarget(item), linkSettings(link));

/** Spec: private-rooms/room-membership, "Revoking an external link" */
export const revokePrivateItemLink = async (
  item: TPrivateLinkItem,
  link: TFileLink,
) => {
  const revoked = await setPrivateItemLink(getTarget(item), {
    linkId: String(link.sharedTo.id),
    access: ShareAccessRights.None,
  });
  addresses.delete(String(link.sharedTo.id));

  return revoked;
};
