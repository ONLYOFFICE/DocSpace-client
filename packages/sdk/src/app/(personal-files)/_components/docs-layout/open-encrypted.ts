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

import type { TFileItem } from "@/app/(docspace)/_hooks/useItemList";
import type { TFilesSettings } from "@docspace/shared/api/files/types";
import { isEncryptedEditingAvailable } from "@docspace/shared/services/private-room/editor-capability";

/**
 * Whether the private page keeps an encrypted file out of the editor, the
 * Document Server being unable to edit it; the user is told instead.
 */
// Spec: private-rooms/editor-integration, "SDK opens encrypted files only with the Document Server capability"
export const refusesEncryptedOpen = (
  isPrivate: boolean | undefined,
  file: Pick<TFileItem, "encrypted">,
  filesSettings:
    | Pick<TFilesSettings, "docServiceEncryptionSupported">
    | null
    | undefined,
): boolean =>
  !!isPrivate &&
  !!file.encrypted &&
  !isEncryptedEditingAvailable(filesSettings);

/**
 * What opening a file of the list does: the conversion dialog, the editor,
 * or a message when an encrypted file can be neither converted nor edited.
 */
export const makeOpenFile =
  ({
    isPrivate,
    filesSettings,
    t,
    info,
    requestConvert,
    openFileInEditor,
  }: {
    isPrivate: boolean | undefined;
    filesSettings: Parameters<typeof refusesEncryptedOpen>[2];
    t: (key: string) => string;
    info: (message: string) => void;
    requestConvert: (file: TFileItem) => void;
    openFileInEditor: (file: TFileItem, preview?: boolean) => void;
  }) =>
  (file: TFileItem, preview?: boolean) => {
    // Spec: private-rooms/sdk-surface, "SDK does not send an encrypted file to conversion"
    if (file.encrypted && file.viewAccessibility?.MustConvert) {
      info(t("Common:PrivateRoomConvertNotSupported"));
      return;
    }
    if (refusesEncryptedOpen(isPrivate, file, filesSettings)) {
      info(t("Common:PrivateRoomEditorNotSupported"));
      return;
    }
    if (!preview && file.viewAccessibility?.MustConvert) {
      requestConvert(file);
      return;
    }
    openFileInEditor(file, preview);
  };
