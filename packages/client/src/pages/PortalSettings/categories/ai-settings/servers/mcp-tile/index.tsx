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

import { useTranslation } from "react-i18next";

import type { TServer } from "@docspace/shared/api/ai/types";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";
import { getServerIconUrl } from "@docspace/shared/utils";
import { ToggleButton } from "@docspace/ui-kit/components/toggle-button";
import { Text } from "@docspace/ui-kit/components/text";
import { ContextMenuButton } from "@docspace/ui-kit/components/context-menu-button";
import { ServerType } from "@docspace/shared/api/ai/enums";
import { MCPIcon, MCPIconSize } from "@docspace/ui-kit/components/mcp-icon";

import SettingsIcon from "PUBLIC_DIR/images/icons/16/catalog.settings.react.svg?url";
import CatalogTrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.trash.react.svg?url";

import { AiTile } from "../../sub-components/ai-tile";

import styles from "./MCPTile.module.scss";
import { getBrandName } from "@docspace/shared/constants/brands";

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
    item.icon?.icon48 || (getServerIconUrl(item.serverType, isBase) ?? "");

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

  const name =
    item.serverType === ServerType.Portal
      ? `${getBrandName("OrganizationName")} ${getBrandName("ProductName")}`
      : item.name;

  const description =
    item.serverType === ServerType.Portal
      ? t("AISettings:MCPProductDescription", {
          organizationName: getBrandName("OrganizationName"),
          productName: getBrandName("ProductName"),
          mcpServer: t("Common:MCPServer"),
        })
      : item.description;

  return (
    <AiTile
      icon={
        <MCPIcon title={item.name} imgSrc={icon} size={MCPIconSize.Large} />
      }
      tooltipText={
        disableActions
          ? t("AISettings:ToUseAddProvider", {
              value: t("Common:MCPServer"),
              aiProvider: t("Common:AIProvider"),
            })
          : undefined
      }
      dataTestId="mcp-tile"
    >
      <AiTile.Header
        title={name}
        hasError={item.needReset}
        getErrorTooltipContent={() => (
          <Text fontSize="12px" lineHeight="16px">
            {t("AISettings:MCPUnavailableError", {
              mcpServer: t("Common:MCPServer"),
            })}
          </Text>
        )}
      >
        <div className={styles.buttonsContainer}>
          <ToggleButton
            className={styles.toggleButton}
            isChecked={item.enabled}
            onChange={() => onToggle(item.id, !item.enabled)}
            isDisabled={disableActions || item.needReset}
            dataTestId="mcp-toggle-button"
          />
          {item.serverType === ServerType.Custom ? (
            <ContextMenuButton
              directionX="right"
              getData={getContextOptions}
              isDisabled={disableActions}
              dropDownClassName={styles.aiContextMenuDropDown}
              testId="mcp-context-menu-button"
            />
          ) : null}
        </div>
      </AiTile.Header>

      <AiTile.Body>
        <Text
          className={styles.description}
          title={disableActions ? undefined : description}
        >
          {description}
        </Text>
      </AiTile.Body>
    </AiTile>
  );
};
