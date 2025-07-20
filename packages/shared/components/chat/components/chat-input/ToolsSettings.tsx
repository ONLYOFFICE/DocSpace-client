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

import { changeMCPTools, getMCPTools } from "../../../../api/ai";
import { TMCPTool } from "../../../../api/ai/types";

import { isMobile } from "../../../../utils";

import { DropDown } from "../../../drop-down";
import { DropDownItem } from "../../../drop-down-item";
import { Backdrop } from "../../../backdrop";
import { Text } from "../../../text";

import { useChatStore } from "../../store/chatStore";

import styles from "./ChatInput.module.scss";

const DOCSPACE_MCP = "883da87d-5ae0-49fd-8cb9-2cb82181667e";

type ToolsSettingsProps = {
  isVisible: boolean;
  toggleToolsSettings: VoidFunction;

  forwardedRef: React.RefObject<HTMLDivElement | null>;
};

const ToolsSettings = ({
  isVisible,
  toggleToolsSettings,

  forwardedRef,
}: ToolsSettingsProps) => {
  const { t } = useTranslation(["Common"]);

  const { roomId } = useChatStore();

  const [MCPTools, setMCPTools] = React.useState<Map<string, TMCPTool[]>>(
    new Map(),
  );

  const mobile = isMobile();

  const toggleTool = async (mcpId: string, toolId: string) => {
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
        await changeMCPTools(Number(roomId), mcpId, []);
      } else {
        await changeMCPTools(
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
        await changeMCPTools(
          Number(roomId),
          mcpId,
          disabledTools.filter((tool) => tool !== toolId),
        );
      } else {
        await changeMCPTools(Number(roomId), mcpId, [...disabledTools, toolId]);
      }
    }
  };

  React.useEffect(() => {
    const fetchTools = async () => {
      const tools = await getMCPTools(Number(roomId), DOCSPACE_MCP);

      setMCPTools(new Map([[DOCSPACE_MCP, tools]]));
    };

    fetchTools();
  }, [roomId]);

  if (!isVisible) return;

  return (
    <DropDown
      open={isVisible}
      forwardedRef={mobile ? undefined : forwardedRef}
      isDefaultMode
      clickOutsideAction={toggleToolsSettings}
      directionY="both"
      directionX="right"
      maxHeight={mobile ? undefined : 300}
      manualWidth={mobile ? undefined : "300px"}
      isMobileView={mobile}
      usePortalBackdrop={mobile}
      backDrop={
        mobile && isVisible ? (
          <Backdrop
            visible
            onClick={toggleToolsSettings}
            withBackground
            zIndex={400}
          />
        ) : null
      }
      zIndex={500}
      isNoFixedHeightOptions
    >
      <DropDownItem
        withToggle
        className={styles.toolSettingsItem}
        noHover
        checked={MCPTools.get(DOCSPACE_MCP)?.some((tool) => tool.enabled)}
        onClick={(
          e:
            | React.ChangeEvent<HTMLInputElement>
            | React.MouseEvent<HTMLElement, MouseEvent>,
        ) => {
          if (e.target instanceof HTMLInputElement) {
            toggleTool(DOCSPACE_MCP, "all_tools");
          }
        }}
      >
        <Text fontSize="12px" fontWeight={600} lineHeight="16px" noSelect>
          {t("AllTools")}
        </Text>
      </DropDownItem>
      <DropDownItem isSeparator />
      {MCPTools.get(DOCSPACE_MCP)?.map((tool) => (
        <DropDownItem
          key={tool.name}
          withToggle
          className={styles.toolSettingsItem}
          noHover
          checked={tool.enabled}
          onClick={(
            e:
              | React.ChangeEvent<HTMLInputElement>
              | React.MouseEvent<HTMLElement, MouseEvent>,
          ) => {
            if (e.target instanceof HTMLInputElement) {
              toggleTool(DOCSPACE_MCP, tool.name);
            }
          }}
        >
          <Text fontSize="12px" fontWeight={600} lineHeight="16px" noSelect>
            {tool.name}
          </Text>
        </DropDownItem>
      ))}
    </DropDown>
  );
};

export default observer(ToolsSettings);
