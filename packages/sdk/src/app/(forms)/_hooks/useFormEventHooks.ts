// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

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
