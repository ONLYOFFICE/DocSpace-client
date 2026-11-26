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

import type { ShareAccessRights } from "../../enums";

export type TPrivacyRoomRequest = {
  id?: string;
  publicKey: string;
  privateKeyEnc: string;
};

export type TEncryptionKeyPair = {
  id: string;
  privateKeyEnc: string;
  publicKey: string;
  userId: string;
  date?: string;
  cryptoEngineId?: string;
};

/**
 * A key in the key set of a room or a file (`EncryptionKeyDto`): the private
 * half comes back only on the caller's own entries and is absent on another
 * member's, since the server does not write a null property.
 *
 * An entry with `isLink` is an external link of the room or of an item in it,
 * a recipient of file keys and not a member: `id` and `userId` are the id of
 * the link. To a visitor of a link the entry of that link carries
 * `fileKeyEnc`, the wrap of the file key made for it, or null when no member
 * has made one.
 */
export type TMemberEncryptionKey = Omit<TEncryptionKeyPair, "privateKeyEnc"> & {
  privateKeyEnc?: string;
  isLink?: boolean;
  fileKeyEnc?: string | null;
};

/** A key of a prospective member: the answer never carries the private half. */
export type TRoomCandidateKey = Omit<TEncryptionKeyPair, "privateKeyEnc">;

/** The room, the folder or the file of a private room a link belongs to. */
export type TPrivateLinkTarget =
  | { roomId: number | string }
  | { folderId: number | string }
  | { fileId: number | string };

/**
 * An external link of a private item. The key material comes with a new link
 * and with a new password; `access: ShareAccessRights.None` with the `linkId`
 * revokes the link. The password itself is never sent.
 */
export type TPrivateLinkRequest = {
  linkId?: string;
  access?: ShareAccessRights;
  title?: string;
  expirationDate?: string | null;
  internal?: boolean;
  primary?: boolean;
  passwordRequired?: boolean;
  linkPublicKey?: string;
  linkPrivateKeyEnc?: string;
  linkProofHash?: string;
};

/**
 * `RoomMissingFileKeysDto`: a user and the encrypted files of a room that
 * hold no key for them. With `isLink`, `userId` is the id of an external link
 * and the files are those the link covers.
 */
export type TRoomMissingFileKeys = {
  userId: string;
  fileIds: number[];
  isLink?: boolean;
};
