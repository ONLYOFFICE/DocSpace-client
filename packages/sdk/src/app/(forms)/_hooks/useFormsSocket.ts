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

import SocketHelper, {
  SocketCommands,
  SocketEvents,
  type TOptSocket,
} from "@docspace/ui-kit/utils/socket";

export default function useFormsSocket(
  socketUrl: string,
  folderIds: (string | number)[],
  fileIds: (string | number)[],
  onFilesUpdated?: () => void,
  onMutationExpectingThumbnail?: () => void,
) {
  const isInit = useRef(false);
  const onFilesUpdatedRef = useRef(onFilesUpdated);
  onFilesUpdatedRef.current = onFilesUpdated;
  const onMutationRef = useRef(onMutationExpectingThumbnail);
  onMutationRef.current = onMutationExpectingThumbnail;

  useEffect(() => {
    if (!socketUrl || isInit.current) return;

    isInit.current = true;

    const doConnect = () => SocketHelper?.connect(socketUrl, "");
    const win = window as Window & {
      requestIdleCallback?: (
        cb: () => void,
        opts?: { timeout: number },
      ) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (win.requestIdleCallback) {
      const id = win.requestIdleCallback(doConnect, { timeout: 1000 });
      return () => win.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(doConnect, 500);
    return () => window.clearTimeout(id);
  }, [socketUrl]);

  const folderIdsKey = folderIds.filter(Boolean).join(",");

  useEffect(() => {
    if (!socketUrl || !folderIdsKey) return;

    const roomParts = folderIdsKey.split(",").map((id) => `DIR-${id}`);
    SocketHelper?.emit(SocketCommands.Subscribe, { roomParts, individual: true });

    return () => {
      SocketHelper?.emit(SocketCommands.Unsubscribe, { roomParts, individual: true });
    };
  }, [socketUrl, folderIdsKey]);

  const fileIdsKey = fileIds.filter(Boolean).join(",");

  useEffect(() => {
    if (!socketUrl || !fileIdsKey) return;

    const roomParts = fileIdsKey.split(",").map((id) => `FILE-${id}`);
    SocketHelper?.emit(SocketCommands.Subscribe, { roomParts, individual: true });

    return () => {
      SocketHelper?.emit(SocketCommands.Unsubscribe, { roomParts, individual: true });
    };
  }, [socketUrl, fileIdsKey]);

  const handleModifyFolder = useCallback((opt?: TOptSocket) => {
    if (!opt?.cmd || !opt?.type) return;

    if (opt.cmd === "create" || opt.cmd === "update") {
      (onMutationRef.current ?? onFilesUpdatedRef.current)?.();
    } else if (opt.cmd === "delete") {
      onFilesUpdatedRef.current?.();
    }
  }, []);

  const handleModifyRoom = useCallback((opt?: TOptSocket) => {
    if (!opt?.cmd) return;

    if ((opt.cmd as string) === "create-form") {
      (onMutationRef.current ?? onFilesUpdatedRef.current)?.();
    }
  }, []);

  const handleStartEdit = useCallback(() => {
    onFilesUpdatedRef.current?.();
  }, []);

  const handleStopEdit = useCallback(() => {
    (onMutationRef.current ?? onFilesUpdatedRef.current)?.();
  }, []);

  useEffect(() => {
    if (!socketUrl) return;

    SocketHelper?.on(SocketEvents.ModifyFolder, handleModifyFolder);
    SocketHelper?.on(SocketEvents.ModifyRoom, handleModifyRoom);
    SocketHelper?.on(SocketEvents.StartEditFile, handleStartEdit);
    SocketHelper?.on(SocketEvents.StopEditFile, handleStopEdit);

    return () => {
      SocketHelper?.off(SocketEvents.ModifyFolder, handleModifyFolder);
      SocketHelper?.off(SocketEvents.ModifyRoom, handleModifyRoom);
      SocketHelper?.off(SocketEvents.StartEditFile, handleStartEdit);
      SocketHelper?.off(SocketEvents.StopEditFile, handleStopEdit);
    };
  }, [socketUrl, handleModifyFolder, handleModifyRoom, handleStartEdit, handleStopEdit]);
}
