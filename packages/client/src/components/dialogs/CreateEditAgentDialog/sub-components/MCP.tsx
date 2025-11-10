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

import { Text } from "@docspace/shared/components/text";
import { SelectorAddButton } from "@docspace/shared/components/selector-add-button";
import type { TSelectorItem } from "@docspace/shared/components/selector";
import { IconButton } from "@docspace/shared/components/icon-button";
import type { TAgentParams } from "@docspace/shared/utils/aiAgents";
import {
  getMCPServerById,
  getServersListForRoom,
} from "@docspace/shared/api/ai";
import { getServerIcon } from "@docspace/shared/utils";
import { useTheme } from "@docspace/shared/hooks/useTheme";

import CrossReactSvgUrl from "PUBLIC_DIR/images/icons/12/cross.react.svg?url";

import { StyledParam } from "../../../CreateEditDialogParams/StyledParam";

interface MCPSettingsProps {
  agentParams: TAgentParams;
  setAgentParams: (value: Partial<TAgentParams>) => void;
  portalMcpServerId?: string;
  onOpenMCPSelector?: VoidFunction;
}

const MCPSettings = ({
  agentParams,
  setAgentParams,
  portalMcpServerId,
  onOpenMCPSelector,
}: MCPSettingsProps) => {
  const { t } = useTranslation(["AIRoom", "Common"]);

  const { isBase } = useTheme();

  const [selectedServers, setSelectedServers] = React.useState<TSelectorItem[]>(
    [],
  );
  const [initialServers, setInitialServers] = React.useState<TSelectorItem[]>(
    [],
  );

  const onClickAction = () => {
    if (onOpenMCPSelector) {
      onOpenMCPSelector();
    }
  };

  const agentId = agentParams.agentId;

  React.useEffect(() => {
    if (agentId) {
      getServersListForRoom(agentId).then((res) => {
        if (res) {
          const items = res.map((item) => ({
            key: item.id,
            id: item.id,
            label: item.name,
            icon:
              (item.icon?.icon24 || getServerIcon(item.serverType, isBase)) ??
              "",
            isInputItem: false,
            onAcceptInput: () => {},
            onCancelInput: () => {},
            defaultInputValue: "",
            placeholder: "",
          }));

          setSelectedServers(items);
          setInitialServers(items);
        }
      });
    }
  }, [agentId, isBase]);

  React.useEffect(() => {
    setAgentParams({
      mcpServers: selectedServers
        .map((server) => server.id?.toString() || "")
        .filter((id) =>
          portalMcpServerId ? id !== portalMcpServerId && id !== "" : id !== "",
        ),
      mcpServersInitial: initialServers
        .map((server) => server.id?.toString() || "")
        .filter((id) =>
          portalMcpServerId ? id !== portalMcpServerId && id !== "" : id !== "",
        ),
    });
  }, [selectedServers, initialServers, portalMcpServerId, setAgentParams]);

  React.useEffect(() => {
    const initBaseMcpServers = async () => {
      if (!portalMcpServerId) return;

      const portalMcpServer = await getMCPServerById(portalMcpServerId);

      setSelectedServers([
        {
          key: portalMcpServer.id,
          id: portalMcpServer.id,
          label: portalMcpServer.name,
          icon:
            (portalMcpServer.icon?.icon24 ||
              getServerIcon(portalMcpServer.serverType, isBase)) ??
            "",
          isInputItem: false,
          onAcceptInput: () => {},
          onCancelInput: () => {},
          defaultInputValue: "",
          placeholder: "",
        },
      ]);
    };

    if (portalMcpServerId) {
      initBaseMcpServers();
    }
  }, [portalMcpServerId, isBase]);

  return (
    <>
      <StyledParam increaseGap>
        <div className=" set_room_params-info">
          <div>
            <Text fontSize="13px" lineHeight="20px" fontWeight={600} noSelect>
              {t("MCP")}
            </Text>
            <Text
              fontSize="12px"
              lineHeight="16px"
              fontWeight={400}
              className="set_room_params-info-description"
              noSelect
            >
              {t("MCPDescription")}
            </Text>
          </div>
          <div className="ai-mcp-group">
            <SelectorAddButton onClick={onClickAction} />

            {selectedServers.map((server) => (
              <div className="ai-mcp-item" key={server.id}>
                <img src={server.icon} alt="DocSpace" />
                <Text
                  fontSize="12px"
                  fontWeight={600}
                  lineHeight="16px"
                  noSelect
                >
                  {server.label}
                </Text>

                <IconButton
                  iconName={CrossReactSvgUrl}
                  size={12}
                  onClick={() => {
                    setSelectedServers((prev) =>
                      prev.filter((item) => item.id !== server.id),
                    );

                    const updatedServerIds = selectedServers
                      .filter((item) => item.id !== server.id)
                      .map((item) => item.id?.toString() || "")
                      .filter((id) => id !== "");

                    setAgentParams({
                      mcpServers: updatedServerIds,
                      ...(portalMcpServerId && server.id === portalMcpServerId
                        ? { attachDefaultTools: false }
                        : {}),
                    });
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </StyledParam>
    </>
  );
};

export default MCPSettings;
