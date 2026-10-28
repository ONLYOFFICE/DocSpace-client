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

import { AVAILABLE_CONTEXT_ITEMS } from "@/app/(docspace)/_enums/context-items";
import {
  getEncryptedFileWithheld,
  PRIVATE_FOLDER_WITHHELD,
  withheldMenuKeys,
  type TPrivateMenuIntent,
} from "@docspace/shared/services/private-room/private-menu-rules";

// Lives in (personal-files) so DocsLayout can import without inverting the
// (personal-files) → (private) dependency direction.

/** The SDK menu keys of the entries a private room withholds. */
export const PRIVATE_MENU_KEYS: Partial<
  Record<TPrivateMenuIntent, readonly string[]>
> = {
  share: [AVAILABLE_CONTEXT_ITEMS.share, AVAILABLE_CONTEXT_ITEMS.copyLink],
  ai: [AVAILABLE_CONTEXT_ITEMS.vectorization],
  forms: [AVAILABLE_CONTEXT_ITEMS.fillForm],
  "custom-filter": [AVAILABLE_CONTEXT_ITEMS.customFilter],
  "download-as": [AVAILABLE_CONTEXT_ITEMS.downloadAs],
  favorites: [
    AVAILABLE_CONTEXT_ITEMS.markAsFavorite,
    AVAILABLE_CONTEXT_ITEMS.removeFromFavorites,
  ],
  rename: [AVAILABLE_CONTEXT_ITEMS.rename],
  versions: [
    AVAILABLE_CONTEXT_ITEMS.showVersionHistory,
    AVAILABLE_CONTEXT_ITEMS.blockUnblockVersion,
  ],
  open: [
    AVAILABLE_CONTEXT_ITEMS.view,
    AVAILABLE_CONTEXT_ITEMS.pdfView,
    AVAILABLE_CONTEXT_ITEMS.preview,
    AVAILABLE_CONTEXT_ITEMS.openPDF,
    AVAILABLE_CONTEXT_ITEMS.edit,
    AVAILABLE_CONTEXT_ITEMS.editPDF,
  ],
  download: [AVAILABLE_CONTEXT_ITEMS.download],
  copy: [AVAILABLE_CONTEXT_ITEMS.copy],
  duplicate: [AVAILABLE_CONTEXT_ITEMS.duplicate],
};

/**
 * What the SDK offers at all for an item of a private room; the light client
 * leaves editing, sharing and forms out.
 */
const PRIVATE_LIGHT_CLIENT_OPTIONS = [
  AVAILABLE_CONTEXT_ITEMS.select,
  AVAILABLE_CONTEXT_ITEMS.open,
  AVAILABLE_CONTEXT_ITEMS.openLocation,
  AVAILABLE_CONTEXT_ITEMS.view,
  AVAILABLE_CONTEXT_ITEMS.preview,
  AVAILABLE_CONTEXT_ITEMS.openPDF,
  AVAILABLE_CONTEXT_ITEMS.download,
  AVAILABLE_CONTEXT_ITEMS.downloadEncrypted,
  AVAILABLE_CONTEXT_ITEMS.showInfo,
  AVAILABLE_CONTEXT_ITEMS.copy,
  AVAILABLE_CONTEXT_ITEMS.duplicate,
  AVAILABLE_CONTEXT_ITEMS.moveTo,
  AVAILABLE_CONTEXT_ITEMS.rename,
  AVAILABLE_CONTEXT_ITEMS.delete,
];

const offeredWithout = (
  withheld: ReadonlySet<TPrivateMenuIntent>,
): ReadonlySet<string> => {
  const keys = new Set(withheldMenuKeys(withheld, PRIVATE_MENU_KEYS));
  return new Set(PRIVATE_LIGHT_CLIENT_OPTIONS.filter((key) => !keys.has(key)));
};

const PRIVATE_FILE_CONTEXT_OPTIONS = new Map<string, ReadonlySet<string>>();

// Spec: private-rooms/sdk-surface, "Archive follows the active-room rules"
export const getPrivateFileContextOptions = ({
  mustConvert,
  hasKeys,
}: {
  mustConvert?: boolean;
  hasKeys: boolean;
}): ReadonlySet<string> => {
  const key = `${!!mustConvert}:${hasKeys}`;
  let options = PRIVATE_FILE_CONTEXT_OPTIONS.get(key);
  if (!options) {
    options = offeredWithout(getEncryptedFileWithheld({ mustConvert, hasKeys }));
    PRIVATE_FILE_CONTEXT_OPTIONS.set(key, options);
  }
  return options;
};

// Spec: private-rooms/sdk-surface, "Folder operations use the server path"
export const PRIVATE_FOLDER_CONTEXT_OPTIONS = offeredWithout(
  PRIVATE_FOLDER_WITHHELD,
);
