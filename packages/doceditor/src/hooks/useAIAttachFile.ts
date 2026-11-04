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

import React from "react";

import type { TSelectedFileInfo } from "@onlyoffice/apps-ui-kit/selectors/Files/FilesSelector.types";

import handleAIAttachFile, { AI_ATTACH_FILE_CHANNEL } from "@/utils/aiAttachFile";

type UseAIAttachFileProps = {
  documentServerUrl: string;
  enabled: boolean;
  requestStorageFile?: () => Promise<TSelectedFileInfo | null>;
};

// Answers the AI plugin's chat ("+" → "Add local file" / "Add file from
// storage"). Its frames are served by the document server, so anything from
// another origin is ignored, and each answer goes back to the very frame that
// asked, at that origin.
const useAIAttachFile = ({
  documentServerUrl,
  enabled,
  requestStorageFile,
}: UseAIAttachFileProps) => {
  // The listener lives as long as the editor; the dialog state behind the
  // picker changes, so it is read through a ref.
  const requestStorageFileRef = React.useRef(requestStorageFile);
  requestStorageFileRef.current = requestStorageFile;

  React.useEffect(() => {
    if (!enabled || !documentServerUrl) return;

    let editorOrigin: string;
    try {
      editorOrigin = new URL(documentServerUrl, window.location.href).origin;
    } catch {
      return;
    }

    const onMessage = (e: MessageEvent) => {
      if (e.origin !== editorOrigin || !e.source) return;
      const envelope = e.data as { channel?: unknown; data?: unknown } | null;
      if (envelope?.channel !== AI_ATTACH_FILE_CHANNEL) return;

      const source = e.source as Window;
      const reply = (data: Record<string, unknown>) =>
        source.postMessage({ channel: AI_ATTACH_FILE_CHANNEL, data }, e.origin);

      handleAIAttachFile(reply, envelope.data, () =>
        requestStorageFileRef.current
          ? requestStorageFileRef.current()
          : Promise.resolve(null),
      );
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [enabled, documentServerUrl]);
};

export default useAIAttachFile;
