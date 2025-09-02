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
import MCPServersSelector from "@docspace/shared/selectors/MCPServers";
import { TSelectorItem } from "@docspace/shared/components/selector";
import { IconButton } from "@docspace/shared/components/icon-button";
import { TRoomParams } from "@docspace/shared/utils/rooms";
import { getServersListForRoom } from "@docspace/shared/api/ai";
import { getServerIcon } from "@docspace/shared/utils";
import { useTheme } from "@docspace/shared/hooks/useTheme";

import CrossReactSvgUrl from "PUBLIC_DIR/images/icons/12/cross.react.svg?url";

import { StyledParam } from "../Params/StyledParam";

interface MCPSettingsProps {
  roomParams: TRoomParams;
  setRoomParams: (value: TRoomParams) => void;
}

const MCPSettings = ({ roomParams, setRoomParams }: MCPSettingsProps) => {
  const { t } = useTranslation(["AIRoom", "Common"]);

  const { isBase } = useTheme();

  const [isSelectorVisible, setIsSelectorVisible] = React.useState(false);

  const [selectedServers, setSelectedServers] = React.useState<TSelectorItem[]>(
    [],
  );
  const [initialServers, setInitialServers] = React.useState<TSelectorItem[]>(
    [],
  );

  const onClickAction = () => setIsSelectorVisible(true);

  const onClose = () => setIsSelectorVisible(false);

  const onSubmit = (servers: TSelectorItem[]) => {
    setSelectedServers(servers);
  };

  const roomId = roomParams.roomId;

  React.useEffect(() => {
    if (roomId) {
      getServersListForRoom(roomId).then((res) => {
        if (res) {
          const items = res.map((item) => ({
            key: item.id,
            id: item.id,
            label: item.name,
            icon: getServerIcon(item.serverType, isBase) ?? "",
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
  }, [roomId]);

  React.useEffect(() => {
    setRoomParams({
      ...roomParams,
      mcpServers: selectedServers
        .map((server) => server.id?.toString() || "")
        .filter((id) => id !== ""),
      mcpServersInitial: initialServers
        .map((server) => server.id?.toString() || "")
        .filter((id) => id !== ""),
    });
  }, [selectedServers]);

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
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </StyledParam>

      {isSelectorVisible ? (
        <MCPServersSelector onSubmit={onSubmit} onClose={onClose} />
      ) : null}
    </>
  );
};

export default MCPSettings;
