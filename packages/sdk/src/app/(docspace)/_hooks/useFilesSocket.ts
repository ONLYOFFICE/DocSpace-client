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

import { useCallback, useEffect, useRef } from "react";

import { connectFrameSocket } from "@docspace/shared/utils/oauthFrameSocket";
import SocketHelper, {
  SocketCommands,
  SocketEvents,
  type TOptSocket,
  type TEditFileData,
} from "@docspace/ui-kit/utils/socket";

import { useFilesListStore } from "../_store/FilesListStore";

export default function useFilesSocket(
  socketUrl: string,
  folderId: string | number,
  onFilesUpdated?: () => void,
) {
  const isInit = useRef(false);
  const onFilesUpdatedRef = useRef(onFilesUpdated);
  onFilesUpdatedRef.current = onFilesUpdated;

  const filesListStore = useFilesListStore();
  const filesListStoreRef = useRef(filesListStore);
  filesListStoreRef.current = filesListStore;

  useEffect(() => {
    if (!socketUrl || isInit.current) return;

    isInit.current = true;
    void connectFrameSocket(socketUrl, "");
  }, [socketUrl]);

  useEffect(() => {
    if (!socketUrl || !folderId) return;

    const roomParts = [`DIR-${folderId}`];
    SocketHelper?.emit(SocketCommands.Subscribe, { roomParts, individual: true });

    return () => {
      SocketHelper?.emit(SocketCommands.Unsubscribe, { roomParts, individual: true });
    };
  }, [socketUrl, folderId]);

  // Subscribe to FILE-{id} for each file in the current folder so we receive
  // StartEditFile / StopEditFile events for them.
  useEffect(() => {
    if (!socketUrl) return;

    const { items } = filesListStoreRef.current;
    const fileIds = items
      .filter((item) => !item.isFolder)
      .map((item) => `FILE-${item.id}`);

    if (fileIds.length === 0) return;

    SocketHelper?.emit(SocketCommands.Subscribe, {
      roomParts: fileIds,
      individual: true,
    });

    return () => {
      SocketHelper?.emit(SocketCommands.Unsubscribe, {
        roomParts: fileIds,
        individual: true,
      });
    };
  // Re-subscribe whenever the file list changes (new files loaded / folder changed).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketUrl, filesListStore.items]);

  const handleModifyFolder = useCallback((opt?: TOptSocket) => {
    if (!opt?.cmd) return;

    if (opt.cmd === "create" || opt.cmd === "update" || opt.cmd === "delete") {
      onFilesUpdatedRef.current?.();
    }
  }, []);

  const handleStartEditFile = useCallback((data: TEditFileData) => {
    const fileId = typeof data === "object" ? data.fileId : data;
    const pathParts = `FILE-${fileId}`;

    if (!SocketHelper?.socketSubscribers.has(pathParts)) return;

    const editingBy =
      typeof data === "object" ? data.editingBy : undefined;

    filesListStoreRef.current.updateItemEditing(fileId, true);
    filesListStoreRef.current.updateItemActiveEditors(fileId, editingBy);
  }, []);

  const handleStopEditFile = useCallback((data: TEditFileData) => {
    const fileId = typeof data === "object" ? data.fileId : data;
    const pathParts = `FILE-${fileId}`;

    if (!SocketHelper?.socketSubscribers.has(pathParts)) return;

    filesListStoreRef.current.updateItemEditing(fileId, false);
    filesListStoreRef.current.updateItemActiveEditors(fileId, undefined);
  }, []);

  useEffect(() => {
    if (!socketUrl) return;

    SocketHelper?.on(SocketEvents.ModifyFolder, handleModifyFolder);
    SocketHelper?.on(SocketEvents.StartEditFile, handleStartEditFile);
    SocketHelper?.on(SocketEvents.StopEditFile, handleStopEditFile);

    return () => {
      SocketHelper?.off(SocketEvents.ModifyFolder, handleModifyFolder);
      SocketHelper?.off(SocketEvents.StartEditFile, handleStartEditFile);
      SocketHelper?.off(SocketEvents.StopEditFile, handleStopEditFile);
    };
  }, [socketUrl, handleModifyFolder, handleStartEditFile, handleStopEditFile]);
}
