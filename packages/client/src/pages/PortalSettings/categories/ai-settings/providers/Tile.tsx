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

import { Text } from "@docspace/ui-kit/components/text";
import { ContextMenuButton } from "@docspace/ui-kit/components/context-menu-button";
import type { TAiProvider } from "@docspace/shared/api/ai/types";
import { ProviderType } from "@docspace/shared/api/ai/enums";
import {
  getAiProviderIcon,
  getAiProviderLabel,
  getLogoUrl,
} from "@docspace/shared/utils";

import SettingsIcon from "PUBLIC_DIR/images/icons/16/catalog.settings.react.svg?url";
import CatalogTrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.trash.react.svg?url";

import { AiTile } from "../sub-components/ai-tile";
import styles from "../AISettings.module.scss";
import { WhiteLabelLogoType } from "@docspace/ui-kit/enums";
import { useTheme } from "@docspace/ui-kit/context";

type AiProviderTileProps = {
  item: TAiProvider;
  onDeleteClick: (id: TAiProvider["id"]) => void;
  onSettingsClick: (provider: TAiProvider) => void;
  isAvailable?: boolean;
  enabled?: boolean;
  dataTestId?: string;
};

export const AiProviderTile = ({
  item,
  onDeleteClick,
  onSettingsClick,
  isAvailable = true,
  enabled = true,
  dataTestId = "ai-provider-tile",
}: AiProviderTileProps) => {
  const { t } = useTranslation(["Common", "AISettings"]);

  const icon = getAiProviderIcon(item.type) ?? "";
  const companyLabel = getAiProviderLabel(item.type, t, enabled);

  const getContextOptions = () => {
    return [
      {
        key: "settings",
        label: t("Common:Settings"),
        icon: SettingsIcon,
        onClick: () => onSettingsClick(item),
      },
      {
        key: "delete",
        label: t("Common:Delete"),
        onClick: () => onDeleteClick(item.id),
        icon: CatalogTrashReactSvgUrl,
      },
    ];
  };

  const getErrorTooltipContent = () => {
    return (
      <Text fontSize="12px" lineHeight="16px">
        {t("AISettings:ProviderUnavailableError", {
          aiProvider: t("Common:AIProvider"),
        })}
      </Text>
    );
  };

  return (
    <AiTile icon={icon} dataTestId={dataTestId}>
      <AiTile.Header
        title={item.title}
        hasError={!isAvailable}
        getErrorTooltipContent={getErrorTooltipContent}
      >
        {item.type !== ProviderType.PortalAi ? (
          <ContextMenuButton
            directionX="right"
            directionY="both"
            getData={getContextOptions}
            dropDownClassName={styles.aiContextMenuDropDown}
          />
        ) : null}
      </AiTile.Header>

      <AiTile.Body>
        <Text lineHeight="20px" className={styles.truncate2Lines}>
          {companyLabel}
        </Text>
        <Text lineHeight="20px" className={styles.truncate2Lines}>
          {item.url}
        </Text>
      </AiTile.Body>
    </AiTile>
  );
};

