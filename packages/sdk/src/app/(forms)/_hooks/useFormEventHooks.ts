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

"use client";

import { useEffect, useRef } from "react";

import SocketHelper, {
  SocketEvents,
  type TOptSocket,
} from "@docspace/ui-kit/utils/socket";

export default function useFormEventHooks(
  aiStore: {
    aiAgentEnabled: boolean;
    folderAgentsMap: Record<
      number,
      { agentId: number; knowledgeFolderId: number | null }
    >;
    syncFolderFiles: (
      folderId: number,
      files: { id: number; title: string }[],
    ) => Promise<void>;
    ensureAgentForNewFolder: (
      folder: { id: number; title: string; parentId: number },
    ) => Promise<void>;
  } | null,
  socketUrl: string,
) {
  const storeRef = useRef(aiStore);
  storeRef.current = aiStore;

  useEffect(() => {
    if (!socketUrl || !storeRef.current) return;

    const handler = (opt?: TOptSocket) => {
      const store = storeRef.current;
      if (!store?.aiAgentEnabled) return;
      if (!opt?.cmd || !opt?.type) return;

      if (opt.cmd === "create" && opt.type === "file" && opt.data) {
        try {
          const file = JSON.parse(opt.data) as {
            id: number;
            title: string;
            folderId: number;
          };

          if (store.folderAgentsMap[file.folderId]) {
            store.syncFolderFiles(file.folderId, [
              { id: file.id, title: file.title },
            ]);
          }
        } catch {
          // ignore parse errors
        }
      }

      if (opt.cmd === "create" && opt.type === "folder" && opt.data) {
        try {
          const folder = JSON.parse(opt.data) as {
            id: number;
            title: string;
            parentId: number;
          };

          store.ensureAgentForNewFolder(folder);
        } catch {
          // ignore parse errors
        }
      }
    };

    SocketHelper?.on(SocketEvents.ModifyFolder, handler);

    return () => {
      SocketHelper?.off(SocketEvents.ModifyFolder, handler);
    };
  }, [socketUrl]);
}
