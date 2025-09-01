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

import { ReactSVG } from "react-svg";

import { ContextMenuButton } from "@docspace/shared/components/context-menu-button";
import { Heading, HeadingLevel } from "@docspace/shared/components/heading";
import { Text } from "@docspace/shared/components/text";
import { ToggleButton } from "@docspace/shared/components/toggle-button";
import type { TServer } from "@docspace/shared/api/ai/types";
import { getServerIcon } from "@docspace/shared/utils/getServerIcon";
import { useTheme } from "@docspace/shared/hooks/useTheme";

import SettingsIcon from "PUBLIC_DIR/images/icons/16/catalog.settings.react.svg?url";
import CatalogTrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.trash.react.svg?url";

import styles from "./AiTile.module.scss";

export enum AiTileVariant {
  AiProvider = "ai-provider",
  MCPServer = "mcp-server",
}

type AiProviderTileProps = {
  variant: AiTileVariant.AiProvider;
  item: { company: string; apiUrl: string };
};

type MCPTileProps = {
  variant: AiTileVariant.MCPServer;
  item: TServer;
};

type AiTileProps = AiProviderTileProps | MCPTileProps;

const getContextOptions = () => {
  return [
    {
      key: "settings",
      label: "Common:Settings",
      icon: SettingsIcon,
      onClick: () => {},
    },
    {
      key: "delete",
      label: "Common:Delete",
      onClick: () => {},
      icon: CatalogTrashReactSvgUrl,
    },
  ];
};

export const AiTile = (props: AiTileProps) => {
  const { variant, item } = props;

  const { isBase } = useTheme();

  const actionButton =
    variant === AiTileVariant.AiProvider ? (
      <ContextMenuButton directionX="right" getData={getContextOptions} />
    ) : (
      <ToggleButton
        className={styles.toggleButton}
        isChecked={item.enabled}
        onChange={() => {}}
      />
    );

  const bodyContent =
    variant === AiTileVariant.AiProvider ? (
      <>
        <Text className={styles.companyTitle} truncate>
          Anthropic
        </Text>
        <Text className={styles.apiUrl} truncate>
          https://api.anthropic.com/v1
        </Text>
      </>
    ) : (
      <Text className={styles.description}>{item.description}</Text>
    );

  const icon =
    variant === AiTileVariant.MCPServer
      ? (getServerIcon(item.serverType, isBase) ?? "")
      : "";

  return (
    <div className={styles.aiTile}>
      <div className={styles.icon}>
        <ReactSVG src={icon} />
      </div>
      <div className={styles.content}>
        <div className={styles.header}>
          <Heading
            className={styles.heading}
            level={HeadingLevel.h3}
            fontSize="16px"
            fontWeight={700}
            lineHeight="22px"
            truncate
          >
            {variant === AiTileVariant.AiProvider
              ? "ai provider name"
              : item.name}
          </Heading>
          {actionButton}
        </div>
        <div className={styles.body}>{bodyContent}</div>
      </div>
    </div>
  );
};
