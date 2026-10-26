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

/**
 * What the menus of a private room withhold, named by what an entry does;
 * each app maps an intent to its own menu keys.
 */
export type TPrivateMenuIntent =
  | "share"
  | "external-link"
  | "create-room"
  | "ai"
  | "forms"
  | "docu-sign"
  | "custom-filter"
  | "spreadsheet-data"
  | "convert"
  | "download-as"
  | "favorites"
  | "rename"
  | "index"
  | "versions"
  | "plugins"
  | "open"
  | "download"
  | "copy"
  | "duplicate"
  | "embedding"
  | "room-template";

/**
 * Withheld for every encrypted file: the server only ever holds its
 * ciphertext, and nothing it would hand to a third party may leave the
 * browser.
 * Spec: private-rooms/file-operations, "Context-menu entries withheld for encrypted files".
 */
export const ENCRYPTED_FILE_WITHHELD: ReadonlySet<TPrivateMenuIntent> = new Set(
  [
    "share",
    "create-room",
    "ai",
    "forms",
    "docu-sign",
    "custom-filter",
    "spreadsheet-data",
    "convert",
    "download-as",
    "favorites",
    "rename",
    "index",
    "versions",
    "plugins",
  ],
);

/** Withheld for an encrypted file, given whether it can be opened at all. */
export const getEncryptedFileWithheld = ({
  mustConvert,
  hasKeys,
}: {
  /** The file opens only after a server conversion. */
  mustConvert?: boolean;
  /** The user has an encryption key on the server. */
  hasKeys: boolean;
}): ReadonlySet<TPrivateMenuIntent> => {
  const withheld = new Set<TPrivateMenuIntent>(ENCRYPTED_FILE_WITHHELD);
  // Conversion runs on the server, which only ever holds the ciphertext.
  if (mustConvert || !hasKeys) withheld.add("open");
  if (!hasKeys) withheld.add("download");
  return withheld;
};

/**
 * Withheld for a folder inside a private room.
 * Spec: private-rooms/file-operations, "Context-menu entries withheld for folders in private rooms".
 */
export const PRIVATE_FOLDER_WITHHELD: ReadonlySet<TPrivateMenuIntent> =
  new Set([
    "share",
    "create-room",
    "favorites",
    "index",
    "copy",
    "duplicate",
    "plugins",
  ]);

/**
 * Withheld for a private room itself.
 * Spec: private-rooms/room-membership, "Room-level operations withheld for private rooms".
 */
export const PRIVATE_ROOM_WITHHELD: ReadonlySet<TPrivateMenuIntent> = new Set([
  "share",
  "external-link",
  "embedding",
  "index",
  "room-template",
  "duplicate",
  "plugins",
]);

/** The menu keys of the withheld intents, through an app's own key table. */
export const withheldMenuKeys = (
  withheld: ReadonlySet<TPrivateMenuIntent>,
  keys: Partial<Record<TPrivateMenuIntent, readonly string[]>>,
): string[] => Array.from(withheld).flatMap((intent) => keys[intent] ?? []);
