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
