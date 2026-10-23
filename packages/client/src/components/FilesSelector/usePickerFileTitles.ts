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

import { useCallback, useState } from "react";

import type {
  TFilesSelectorFile,
  TFilesSelectorLoadedFiles,
} from "@onlyoffice/apps-ui-kit/selectors/Files/FilesSelector.types";
import { resolveDisplayTitle } from "@docspace/shared/services/encryption/filename-cache";
import {
  useEncryptedFilenameRecovery,
  useFilenameCacheVersion,
} from "@docspace/shared/hooks/useResolvedFileTitle";

type TLoadedPrivateFiles = {
  files: TFilesSelectorFile[];
  roomId: number | string | null;
};

const NO_FILES: TLoadedPrivateFiles = { files: [], roomId: null };

/**
 * The picker props that list encrypted files by their decrypted names: a
 * cached name at once, the others once recovered while the identity is
 * unlocked.
 * Spec: private-rooms/file-operations, "Pickers show resolved names".
 */
export const usePickerFileTitles = (userId?: string | null) => {
  const [loaded, setLoaded] = useState(NO_FILES);

  useEncryptedFilenameRecovery(loaded.files, {
    userId,
    roomId: loaded.roomId,
  });

  const itemTitlesVersion = useFilenameCacheVersion();

  const resolveItemTitle = useCallback(
    (file: TFilesSelectorFile) =>
      file.encrypted ? resolveDisplayTitle(file) : undefined,
    [],
  );

  const onFilesLoaded = useCallback(
    (
      files: TFilesSelectorFile[],
      { roomId, isInsidePrivateRoom }: TFilesSelectorLoadedFiles,
    ) => {
      setLoaded(
        isInsidePrivateRoom ? { files, roomId: roomId ?? null } : NO_FILES,
      );
    },
    [],
  );

  return { resolveItemTitle, itemTitlesVersion, onFilesLoaded };
};
