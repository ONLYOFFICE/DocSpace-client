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

import CrossReactSvgUrl from "PUBLIC_DIR/images/icons/12/cross.react.svg?url";

import React from "react";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";
import { AddButton } from "@docspace/ui-kit/components/add-button";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { MCPIcon, MCPIconSize } from "@docspace/ui-kit/components/mcp-icon";

import type { TAgentParams } from "@docspace/shared/utils/aiAgents";
import type { TSelectorItem } from "@docspace/ui-kit/components/selector";

import { StyledParam } from "../../../CreateEditDialogParams/StyledParam";

interface MCPSettingsProps {
  agentParams: TAgentParams;
  setAgentParams: (value: Partial<TAgentParams>) => void;
  portalMcpServerId?: string;
  onClickAction?: () => void;
  selectedServers?: TSelectorItem[];
  setSelectedServers?: React.Dispatch<React.SetStateAction<TSelectorItem[]>>;
}

const MCPSettings = ({
  agentParams,
  setAgentParams,
  portalMcpServerId,
  onClickAction,
  selectedServers,
  setSelectedServers,
}: MCPSettingsProps) => {
  const { t } = useTranslation(["AIRoom", "Common"]);

  return (
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
            {t("MCPDescriptionServers", {
              mcpServers: t("Common:MCPSettingTitle"),
            })}
          </Text>
        </div>
        <div className="ai-mcp-group">
          <AddButton onClick={onClickAction} />

          {selectedServers?.map((server) => (
            <div
              className="ai-mcp-item"
              key={server.id}
              data-testid="ai-mcp-item"
            >
              <MCPIcon
                title={server.label}
                imgSrc={server.icon as string | undefined}
                size={MCPIconSize.Small}
              />
              <Text fontSize="12px" fontWeight={600} lineHeight="16px" noSelect>
                {server.label}
              </Text>

              <IconButton
                iconName={CrossReactSvgUrl}
                size={12}
                onClick={() => {
                  setSelectedServers?.((prev) =>
                    prev.filter((item) => item.id !== server.id),
                  );
                  if (portalMcpServerId && server.id === portalMcpServerId) {
                    setAgentParams({
                      attachDefaultTools: false,
                    });
                  }
                }}
                dataTestId="remove-mcp-button"
              />
            </div>
          ))}
        </div>
      </div>
    </StyledParam>
  );
};

export default MCPSettings;
