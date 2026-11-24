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


import { setPrivateItemLink } from "../../api/privacy";
import type { TPrivateLinkTarget } from "../../api/privacy/types";
import type { TFile, TFileLink, TFolder } from "../../api/files/types";
import type { TRoom } from "../../api/rooms/types";
import { FolderType, ShareAccessRights } from "../../enums";
import { isFile, isRoom } from "../../utils/typeGuards";
import { createLinkKey, generateLinkSecret } from "../encryption/link-key";
import { requireUnlock } from "../encryption/secret-storage";

type TPrivateLinkItem = TFile | TFolder | TRoom;

/** The end date a link to one file without a password is preset to. */
export const PRIVATE_FILE_LINK_DAYS = 7;

/**
 * How many links a file or a folder of a private room holds. The server
 * reports no link settings with such an entry and counts only when a link is
 * made (`FileSecurity.GetLinksSettings`), so the number is repeated here.
 */
export const PRIVATE_ITEM_LINKS_LIMIT = 6;

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
 * The keys of the files the link covers are wrapped for it once the server
 * lists links among the recipients of file keys (task 3.3 of
 * `private-rooms-external-links`).
 *
 * Spec: private-rooms/room-membership, "External link of a private item keeps the link model of the portal"
 */
export async function createPrivateItemLink(
  item: TPrivateLinkItem,
  userId: string,
  options: TPrivateLinkOptions = {},
): Promise<{ link: TFileLink; address: string } | null> {
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

  if (!(await requireUnlock(userId))) return null;

  const secret = generateLinkSecret();
  const { material } = await createLinkKey(secret, password);

  const link = await setPrivateItemLink(getTarget(item), {
    access: ShareAccessRights.ReadOnly,
    title: options.title,
    expirationDate,
    internal: options.internal,
    primary: options.primary,
    passwordRequired: !!password,
    ...material,
  });

  return { link, address: `${link.sharedTo.shareLink}#${secret}` };
}

/**
 * Changes the title, the end date and the audience of a link of a private
 * item. It sends no key material and no password: the server keeps both.
 */
export const editPrivateItemLink = (item: TPrivateLinkItem, link: TFileLink) =>
  setPrivateItemLink(getTarget(item), {
    linkId: String(link.sharedTo.id),
    access: ShareAccessRights.ReadOnly,
    title: link.sharedTo.title,
    expirationDate: link.sharedTo.expirationDate ?? null,
    internal: link.sharedTo.internal,
    primary: link.sharedTo.primary,
  });

/** Spec: private-rooms/room-membership, "Revoking an external link" */
export const revokePrivateItemLink = (
  item: TPrivateLinkItem,
  link: TFileLink,
) =>
  setPrivateItemLink(getTarget(item), {
    linkId: String(link.sharedTo.id),
    access: ShareAccessRights.None,
  });
