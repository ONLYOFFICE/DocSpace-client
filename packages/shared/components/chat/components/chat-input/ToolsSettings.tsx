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
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react";
import classNames from "classnames";
import { useNavigate } from "react-router";

import McpToolReactSvgUrl from "PUBLIC_DIR/images/mcp.tool.svg?url";
import WebSearchIconUrl from "PUBLIC_DIR/images/web.search.svg?url";
import ManageConnectionsReactSvgUrl from "PUBLIC_DIR/images/manage.connection.react.svg?url";

import { openConnectWindow } from "../../../../api/files";
import {
  changeMCPToolsForRoom,
  connectServer,
  disconnectServer,
  getMCPToolsForRoom,
  updateWebSearchInRoom,
} from "../../../../api/ai";
import { ServerType } from "../../../../api/ai/enums";
import { getOAuthToken } from "../../../../utils/common";
import { getServerIcon } from "../../../../utils";
import { useTheme } from "../../../../hooks/useTheme";

import { Text } from "../../../text";
import { ContextMenu, type ContextMenuRefType } from "../../../context-menu";
import { IconButton } from "../../../icon-button";
import { Aside } from "../../../aside";
import { Button, ButtonSize } from "../../../button";
import { Backdrop } from "../../../backdrop";
import { Portal } from "../../../portal";

import { useChatStore } from "../../store/chatStore";
import { useMessageStore } from "../../store/messageStore";

import useToolsSettings from "../../hooks/useToolsSettings";

import styles from "./ChatInput.module.scss";
import { Link, LinkType } from "../../../link";

const ToolsSettings = ({
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
  setWebSearchEnabled,
  isAdmin,
  aiReady,
}: ReturnType<typeof useToolsSettings> & {
  isAdmin?: boolean;
  aiReady: boolean;
}) => {
  const { t } = useTranslation(["Common"]);
  const navigate = useNavigate();

  const { roomId } = useChatStore();
  const {
    setKnowledgeSearchToolName,
    setWebSearchToolName,
    setWebCrawlingToolName,
  } = useMessageStore();
  const { isBase } = useTheme();

  const [showManageConnections, setShowManageConnections] =
    React.useState(false);

  const [isMcpToolsVisible, setIsMcpToolsVisible] = React.useState(false);

  const contextMenuRef = React.useRef<ContextMenuRefType>(null);

  const toggleTool = React.useCallback(
    async (mcpId: string, toolId: string) => {
      const countTools = MCPTools.get(mcpId)?.length ?? 0;
      const disabledTools =
        MCPTools.get(mcpId)
          ?.filter((tool) => !tool.enabled)
          .map((tool) => tool.name) ?? [];

      if (toolId === "all_tools") {
        const enabled = disabledTools.length === countTools;
        const newTools =
          MCPTools.get(mcpId)?.map((tool) => ({
            ...tool,
            enabled,
          })) ?? [];

        if (enabled) {
          await changeMCPToolsForRoom(Number(roomId), mcpId, []);
        } else {
          await changeMCPToolsForRoom(
            Number(roomId),
            mcpId,
            newTools.map((tool) => tool.name),
          );
        }

        setMCPTools(new Map([...MCPTools, [mcpId, newTools]]));
      } else {
        const enabled = disabledTools.includes(toolId);

        const newTools =
          MCPTools.get(mcpId)?.map((tool) => ({
            ...tool,
            enabled: tool.name === toolId ? enabled : tool.enabled,
          })) ?? [];

        setMCPTools(new Map([...MCPTools, [mcpId, newTools]]));

        if (enabled) {
          await changeMCPToolsForRoom(
            Number(roomId),
            mcpId,
            disabledTools.filter((tool) => tool !== toolId),
          );
        } else {
          await changeMCPToolsForRoom(Number(roomId), mcpId, [
            ...disabledTools,
            toolId,
          ]);
        }
      }
    },
    [MCPTools, roomId],
  );

  const onGoToWebSearchPage = () => {
    navigate("/portal-settings/ai-settings/search");
  };

  const openOauthWindow = async (serverId: string, type: string) => {
    const url = await openConnectWindow(type);

    const newWindow = window.open(
      "",
      t("Common:Authorization"),
      "height=600, width=1020",
    );

    if (newWindow) {
      newWindow.location = url;
    }

    getOAuthToken(newWindow)
      .then(async (token) => {
        if (token) {
          try {
            await connectServer(Number(roomId), serverId, token);

            newWindow?.close();

            const newTools = await getMCPToolsForRoom(Number(roomId), serverId);

            if (!newTools) return;

            setMCPTools((prev) => {
              const newMap = new Map(prev);
              newMap.set(serverId, newTools);
              return newMap;
            });
            setServers((prev) => {
              const newServers = [...prev];
              const serverIndex = newServers.findIndex(
                (s) => s.id === serverId,
              );
              newServers[serverIndex].connected = true;
              return newServers;
            });
          } catch (e) {
            console.log(e);
          }
        }
      })
      .catch((e) => console.log(e));
  };

  const disconnectServerAction = async (serverId: string) => {
    try {
      await disconnectServer(Number(roomId), serverId);

      setMCPTools((prev) => {
        const newMap = new Map(prev);
        newMap.delete(serverId);
        return newMap;
      });
      setServers((prev) => {
        const newServers = [...prev];
        const serverIndex = newServers.findIndex((s) => s.id === serverId);
        newServers[serverIndex].connected = false;
        return newServers;
      });
    } catch (e) {
      console.log(e);
    }
  };

  const showMcpTools = (e: React.MouseEvent<HTMLElement>) => {
    if (!aiReady || showManageConnections) return;

    setIsMcpToolsVisible(true);
    contextMenuRef.current?.show(e);
  };

  const hideMcpTools = React.useCallback(() => {
    setIsMcpToolsVisible(false);
  }, []);

  const onWebSearchToggle = React.useCallback(() => {
    if (!webSearchPortalEnabled) return;

    updateWebSearchInRoom(Number(roomId), !webSearchEnabled);
    setWebSearchEnabled(!webSearchEnabled);
  }, [roomId, webSearchEnabled, webSearchPortalEnabled]);

  React.useEffect(() => {
    setKnowledgeSearchToolName(knowledgeSearchToolName);
  }, [knowledgeSearchToolName]);

  React.useEffect(() => {
    setWebSearchToolName(webSearchToolName);
  }, [webSearchToolName]);

  React.useEffect(() => {
    setWebCrawlingToolName(webCrawlingToolName);
  }, [webCrawlingToolName]);

  const model = React.useMemo(() => {
    const serverItems = Array.from(MCPTools.entries()).map(([mcpId, tools]) => {
      const server = servers.find((s) => s.id === mcpId);

      if (!server)
        return {
          key: "",
          label: "",
        };

      const items = [
        {
          key: "all_tools",
          label: "All tools",
          withToggle: true,
          checked: tools.some((tool) => tool.enabled),
          onClick: () => {
            toggleTool(mcpId, "all_tools");
          },
        },
        {
          key: "separator-sub-menu-1",
          isSeparator: true,
        },
        ...tools
          .map((tool) => ({
            key: tool.name,
            label: tool.name,
            withToggle: true,
            checked: tool.enabled,
            onClick: () => {
              toggleTool(mcpId, tool.name);
            },
          }))
          .filter(Boolean),
      ];

      const name =
        server.serverType === ServerType.Portal
          ? `${t("Common:OrganizationName")} ${t("Common:ProductName")}`
          : server.name;

      return {
        key: mcpId,
        label: name,
        icon:
          (server.icon?.icon16 || getServerIcon(server.serverType, isBase)) ??
          "",
        withMCPIcon: true,
        items,
      };
    });

    const showManageConnectionItem = servers.some(
      (server) =>
        server.serverType !== ServerType.Portal &&
        server.serverType !== ServerType.Custom,
    );

    return [
      {
        key: "web-search",
        label: "Web Search",
        icon: WebSearchIconUrl,
        withToggle: true,
        checked: webSearchEnabled && webSearchPortalEnabled,
        onClick: onWebSearchToggle,
        disabled: !webSearchPortalEnabled,
        getTooltipContent: () => (
          <>
            <Text>
              {t("ConnectWebSearch", {
                productName: t("Common:ProductName"),
              })}
            </Text>
            {isAdmin ? (
              <Link
                type={LinkType.action}
                isHovered
                fontWeight={600}
                onClick={onGoToWebSearchPage}
              >
                {t("Common:GoToSettings")}
              </Link>
            ) : null}
          </>
        ),
      },
      ...(showManageConnectionItem || serverItems.length > 0
        ? [{ key: "separator-1", isSeparator: true }]
        : []),
      ...serverItems,
      ...(serverItems.length > 0 && showManageConnectionItem
        ? [{ key: "separator-2", isSeparator: true }]
        : []),
      ...(showManageConnectionItem
        ? [
            {
              key: "manage-connections",
              label: t("ManageConnection"),
              onClick: () => {
                setShowManageConnections(true);
              },
              icon: ManageConnectionsReactSvgUrl,
              disabled: !showManageConnectionItem,
              getTooltipContent: () => <Text>{t("ConnectMCPServers")}</Text>,
            },
          ]
        : []),
    ];
  }, [
    MCPTools,
    isBase,
    servers,
    t,
    toggleTool,
    webSearchEnabled,
    webSearchPortalEnabled,
  ]);

  if (!isFetched) return;

  return (
    <>
      <div
        className={classNames(
          styles.chatInputButton,
          styles.chatInputToolsButton,
          {
            [styles.activeChatInputButton]: isMcpToolsVisible,
            [styles.disabled]: !aiReady,
          },
        )}
        onClick={showMcpTools}
      >
        <IconButton iconName={McpToolReactSvgUrl} size={16} isFill={false} />
        <Text lineHeight="16px" fontSize="13px" fontWeight={600} noSelect>
          {t("Tools")}
        </Text>
        <ContextMenu
          ref={contextMenuRef}
          model={model}
          onHide={hideMcpTools}
          maxHeightLowerSubmenu={360}
          showDisabledItems
        />
      </div>
      {showManageConnections ? (
        <Portal
          visible
          element={
            <>
              <Aside
                header={t("ManageConnection")}
                onClose={() => setShowManageConnections(false)}
                visible={showManageConnections}
              >
                <div className={styles.toolSettingsWrapper}>
                  {servers.map((server) => {
                    if (
                      server.serverType === ServerType.Portal ||
                      server.serverType === ServerType.Custom
                    )
                      return null;

                    return (
                      <div key={server.id} className={styles.toolSettingsItem}>
                        <div className={styles.toolSettingsItemInfo}>
                          <img
                            src={
                              (server.icon?.icon16 ||
                                getServerIcon(server.serverType, isBase)) ??
                              ""
                            }
                            alt={server.name}
                          />
                          <Text
                            fontSize="14px"
                            lineHeight="16px"
                            fontWeight={600}
                          >
                            {server.name}
                          </Text>
                        </div>
                        <Button
                          label={
                            server.connected ? t("Disconnect") : t("Connect")
                          }
                          size={ButtonSize.small}
                          onClick={() => {
                            if (server.connected) {
                              disconnectServerAction(server.id);
                            } else {
                              openOauthWindow(server.id, server.name);
                            }
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </Aside>
              <Backdrop
                isAside
                onClick={() => setShowManageConnections(false)}
                visible={showManageConnections}
                withBackground
              />
            </>
          }
        />
      ) : null}
    </>
  );
};

export default observer(ToolsSettings);
