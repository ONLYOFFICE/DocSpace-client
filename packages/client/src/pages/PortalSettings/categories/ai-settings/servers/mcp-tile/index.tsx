/*
 * (c) Copyright Ascensio System SIA 2009-2025
 *
 * This program is a free software product.
 * You can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
 * Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
 * to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
 * any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
 * the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions of the Program must
 * display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product logo when
 * distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
 * trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
 * content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
 * International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 */

import { useTranslation } from "react-i18next";

import type { TServer } from "@docspace/shared/api/ai/types";
import { useTheme } from "@docspace/shared/hooks/useTheme";
import { getServerIcon } from "@docspace/shared/utils";
import { ToggleButton } from "@docspace/shared/components/toggle-button";
import { Text } from "@docspace/shared/components/text";
import { ContextMenuButton } from "@docspace/shared/components/context-menu-button";
import { ServerType } from "@docspace/shared/api/ai/enums";
import { MCPIcon, MCPIconSize } from "@docspace/shared/components/mcp-icon";

import SettingsIcon from "PUBLIC_DIR/images/icons/16/catalog.settings.react.svg?url";
import CatalogTrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.trash.react.svg?url";

import { AiTile } from "../../sub-components/ai-tile";

import styles from "./MCPTile.module.scss";

type MCPTileProps = {
  item: TServer;
  onToggle: (id: TServer["id"], enabled: boolean) => void;
  disableActions?: boolean;

  onSettingsClick?: (item: TServer) => void;
  onDeleteClick?: (id: TServer["id"]) => void;
};

export const MCPTile = ({
  item,
  onToggle,
  onSettingsClick,
  onDeleteClick,
  disableActions,
}: MCPTileProps) => {
  const { isBase } = useTheme();
  const { t } = useTranslation(["Common", "AISettings"]);

  const icon =
    item.icon?.icon48 || (getServerIcon(item.serverType, isBase) ?? "");

  const getContextOptions = () => {
    return [
      {
        key: "settings",
        label: t("Common:Settings"),
        icon: SettingsIcon,
        onClick: () => onSettingsClick?.(item),
      },
      {
        key: "delete",
        label: t("Common:Delete"),
        onClick: () => onDeleteClick?.(item.id),
        icon: CatalogTrashReactSvgUrl,
      },
    ];
  };

  return (
    <AiTile
      icon={
        <MCPIcon title={item.name} imgSrc={icon} size={MCPIconSize.Large} />
      }
      tooltipText={
        disableActions
          ? t("AISettings:ToUseAddProvider", {
              value: t("AISettings:MCPServer"),
            })
          : undefined
      }
    >
      <AiTile.Header title={item.name}>
        <div className={styles.buttonsContainer}>
          <ToggleButton
            className={styles.toggleButton}
            isChecked={item.enabled}
            onChange={() => onToggle(item.id, !item.enabled)}
            isDisabled={disableActions}
          />
          {item.serverType === ServerType.Custom ? (
            <ContextMenuButton
              directionX="right"
              getData={getContextOptions}
              isDisabled={disableActions}
            />
          ) : null}
        </div>
      </AiTile.Header>

      <AiTile.Body>
        <Text className={styles.description}>{item.description}</Text>
      </AiTile.Body>
    </AiTile>
  );
};
