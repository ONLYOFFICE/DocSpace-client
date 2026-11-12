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

import { useCallback } from "react";

import KitMediaViewer from "@onlyoffice/apps-ui-kit/media-viewer/MediaViewer";
import type { DecryptFileParams } from "@onlyoffice/apps-ui-kit/media-viewer/MediaViewer.types";

import {
  getDocumentServiceLocation,
  getFileEncryptionAccess,
} from "../../api/files";
import { decryptFile as decryptFileContent } from "../../services/encryption/file-keys";
import { resolveDisplayTitle } from "../../services/encryption/filename-cache";
import { unwrapDekForCurrentUser } from "../../services/encryption/room-file-access";
import { requireUnlock } from "../../services/encryption/secret-storage";
import { loadRoomMemberKeysSafe } from "../../services/private-room/room-member-keys";
import { combineUrl } from "../../utils/combineUrl";

import type { MediaViewerProps } from "./MediaViewer.types";

const getPdfViewerScriptUrl = async () => {
  const { docServiceUrl } = await getDocumentServiceLocation();

  return combineUrl(docServiceUrl, window.ClientConfig?.pdfViewerUrl);
};

const MediaViewer = ({ userId, ...props }: MediaViewerProps) => {
  const decryptFile = useCallback(
    async ({ src, fileId, roomId, signal }: DecryptFileParams) => {
      if (!userId) {
        throw new Error("User ID not available for decryption");
      }

      const encryptionInfo = await getFileEncryptionAccess(fileId);
      if (signal.aborted) return null;
      if (!encryptionInfo?.fileKeys) {
        throw new Error("You don't have access to decrypt this file");
      }

      const identity = await requireUnlock(String(userId));
      if (signal.aborted || !identity) return null;

      const response = await fetch(src, { signal });

      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status}`);
      }

      const encryptedData = await response.arrayBuffer();
      if (signal.aborted) return null;

      const roomMemberKeys = await loadRoomMemberKeysSafe(roomId);
      if (signal.aborted) return null;

      const dek = await unwrapDekForCurrentUser({
        fileKeys: encryptionInfo.fileKeys,
        roomMemberKeys,
        currentUserId: String(userId),
        currentIdentity: identity,
        fileId,
      });
      if (signal.aborted) return null;

      const { data, fileName } = await decryptFileContent(encryptedData, dek, {
        cacheFilenameForFileId: fileId,
      });

      return { data, fileName: fileName ?? undefined };
    },
    [userId],
  );

  return (
    <KitMediaViewer
      {...props}
      decryptFile={decryptFile}
      resolveTitle={resolveDisplayTitle}
      getPdfViewerScriptUrl={getPdfViewerScriptUrl}
    />
  );
};

export default MediaViewer;
