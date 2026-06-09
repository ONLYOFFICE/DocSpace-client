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

// Lives in (personal-files) so DocsLayout can import without inverting the
// (personal-files) → (private) dependency direction.
export const PRIVATE_FILE_CONTEXT_OPTIONS: ReadonlySet<string> = new Set([
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
]);

// Members without encryption keys cannot decrypt files, so hide every action
// that triggers a decrypt path (view/preview/open PDF/download). They keep
// "download without decryption" (downloadEncrypted). Reference: client
// FilesStore.js:3169-3175.
export const PRIVATE_FILE_CONTEXT_OPTIONS_NO_KEYS: ReadonlySet<string> = new Set(
  [...PRIVATE_FILE_CONTEXT_OPTIONS].filter(
    (key) =>
      key !== AVAILABLE_CONTEXT_ITEMS.view &&
      key !== AVAILABLE_CONTEXT_ITEMS.preview &&
      key !== AVAILABLE_CONTEXT_ITEMS.openPDF &&
      key !== AVAILABLE_CONTEXT_ITEMS.download,
  ),
);

// Folders inside a private room must not expose "duplicate": the server would
// create an unencrypted copy of the folder tree. Reference: client
// FilesActionsStore.js duplicateAction — silent return for folders in a
// privacy folder.
export const PRIVATE_FOLDER_CONTEXT_OPTIONS: ReadonlySet<string> = new Set(
  [...PRIVATE_FILE_CONTEXT_OPTIONS].filter(
    (key) => key !== AVAILABLE_CONTEXT_ITEMS.duplicate,
  ),
);

export const PRIVATE_ARCHIVE_FILE_CONTEXT_OPTIONS: ReadonlySet<string> = new Set([
  AVAILABLE_CONTEXT_ITEMS.select,
  AVAILABLE_CONTEXT_ITEMS.showInfo,
  AVAILABLE_CONTEXT_ITEMS.download,
  AVAILABLE_CONTEXT_ITEMS.delete,
]);
