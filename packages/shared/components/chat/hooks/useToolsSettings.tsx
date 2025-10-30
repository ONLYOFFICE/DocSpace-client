// (c) Copyright Ascensio System SIA 2009-2025
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

import React from "react";

import socket, { SocketEvents, TOptSocket } from "../../../utils/socket";

import {
  getMCPToolsForRoom,
  getServersListForRoom,
  getAIConfig,
  getWebSearchInRoom,
} from "../../../api/ai";
import { TMCPTool, TServer } from "../../../api/ai/types";

const useToolsSettings = ({ roomId }: { roomId: string | number }) => {
  const [servers, setServers] = React.useState<TServer[]>([]);
  const [MCPTools, setMCPTools] = React.useState<Map<string, TMCPTool[]>>(
    new Map(),
  );
  const [webSearchPortalEnabled, setWebSearchPortalEnabled] =
    React.useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = React.useState(false);
  const [isFetched, setIsFetched] = React.useState(false);
  const [knowledgeSearchToolName, setKnowledgeSearchToolName] =
    React.useState("");
  const [webSearchToolName, setWebSearchToolName] = React.useState("");
  const [webCrawlingToolName, setWebCrawlingToolName] = React.useState("");

  const fetchServerTools = React.useCallback(
    async (res: TServer[], roomId: string | number) => {
      const enabledServers = res.filter((server) => server.connected);

      const actions = await Promise.all(
        enabledServers.map((server) =>
          getMCPToolsForRoom(Number(roomId), server.id),
        ),
      );

      const serverTools: [string, TMCPTool[]][] = enabledServers.map(
        (item, index) => [item.id, actions[index] ?? []],
      );

      setMCPTools(new Map(serverTools));
      setIsFetched(true);
    },
    [],
  );

  const fetchTools = React.useCallback(async () => {
    const res = await getServersListForRoom(Number(roomId));

    if (!res) return;

    setServers(res);
    fetchServerTools(res, roomId);
  }, [roomId]);

  const initTools = React.useCallback(async () => {
    if (!roomId) return;

    const [aiConfig, webSearchInRoom] = await Promise.all([
      getAIConfig(),
      getWebSearchInRoom(Number(roomId)),
      fetchTools(),
    ]);
    if (aiConfig) {
      setKnowledgeSearchToolName(aiConfig.knowledgeSearchToolName);
      setWebSearchToolName(aiConfig.webSearchToolName);
      setWebCrawlingToolName(aiConfig.webCrawlingToolName);
    }
    setWebSearchPortalEnabled(aiConfig?.webSearchEnabled ?? false);
    setWebSearchEnabled(webSearchInRoom?.webSearchEnabled ?? false);
  }, [fetchTools, roomId]);

  const onModifyFolder = React.useCallback(
    (data?: TOptSocket) => {
      if (!data) return;

      if (
        data.type === "folder" &&
        data.id &&
        Number(data.id) === Number(roomId) &&
        data.cmd !== "delete"
      ) {
        fetchTools();
      }
    },
    [fetchTools, roomId],
  );

  React.useEffect(() => {
    socket?.on(SocketEvents.ModifyFolder, onModifyFolder);

    return () => {
      socket?.off(SocketEvents.ModifyFolder, onModifyFolder);
    };
  }, [onModifyFolder]);

  return {
    servers,
    MCPTools,
    webSearchPortalEnabled,
    webSearchEnabled,
    isFetched,
    knowledgeSearchToolName,
    webSearchToolName,
    webCrawlingToolName,
    setServers,
    setMCPTools,
    setWebSearchPortalEnabled,
    setWebSearchEnabled,
    setIsFetched,
    fetchTools,
    initTools,
  };
};

export default useToolsSettings;
