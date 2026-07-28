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

import { Heading } from "@docspace/ui-kit/components/heading";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { ToggleButton } from "@docspace/ui-kit/components/toggle-button";
import { Badge } from "@docspace/ui-kit/components/badge";
import { Text } from "@docspace/ui-kit/components/text";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";

import PluginSettingsIconUrl from "PUBLIC_DIR/images/plugin.settings.react.svg?url";
import PluginDefaultLogoUrl from "PUBLIC_DIR/images/plugin.default-logo.png";

import { getPluginUrl } from "SRC_DIR/helpers/plugins/utils";

import styles from "../Plugins.module.scss";
import { PluginItemProps } from "../Plugins.types";
import classNames from "classnames";
import { getBrandName } from "@docspace/shared/constants/brands";

const PluginItem = ({
  name,
  nameLocale,
  version,
  compatible,
  description,
  descriptionLocale,

  enabled,
  updatePlugin,

  openSettingsDialog,

  image,
  url,
  dataTestId,
  theme,
}: PluginItemProps) => {
  const { t } = useTranslation(["Common"]);

  const imgSrc = image
    ? getPluginUrl(url, `/assets/${image}?hash=${version}`)
    : null;

  const onChangeStatus = () => {
    updatePlugin?.(name, !enabled, undefined, t);
  };

  const onOpenSettingsDialog = () => {
    openSettingsDialog?.(name);
  };

  const incompatibleTooltip = t("WebPlugins:PluginIsNotCompatible", {
    productName: getBrandName("ProductName"),
  });

  const badgeId = `plugin_version_${name}_badge`;

  const badge = (
    <Badge
      label={version}
      fontSize="12px"
      fontWeight={700}
      noHover={compatible}
      backgroundColor={
        compatible
          ? globalColors.mainGreen
          : theme.isBase
            ? globalColors.lightErrorStatus
            : globalColors.darkErrorStatus
      }
      dataTestId={badgeId}
    />
  );


  return (
    <div className={classNames(styles.pluginItem, {
      [styles.noDescription]: !description,
    })} data-testid={dataTestId}>
      <img
        className={styles.pluginLogo}
        src={imgSrc || PluginDefaultLogoUrl}
        alt="Plugin logo"
        data-testid="plugin_logo"
      />
      <div className={styles.pluginInfo}>
        <div className={styles.pluginHeader}>
          <Heading className={styles.pluginName}>{nameLocale}</Heading>
          <div className={styles.pluginControls}>
            <IconButton
              iconName={PluginSettingsIconUrl}
              size={16}
              onClick={onOpenSettingsDialog}
              data-testid="open_settings_icon_button"
            />
            <ToggleButton
              className={styles.pluginToggleButton}
              onChange={onChangeStatus}
              isChecked={enabled}
              dataTestId="enable_plugin_toggle_button"
            />
          </div>
        </div>

        {!compatible ? (
          <div
            data-tooltip-id="system-tooltip"
            data-tooltip-content={incompatibleTooltip}
            data-tooltip-place="bottom"
          >
            {badge}
          </div>
        ) : (
          badge
        )}

        {descriptionLocale ? (
          <Text
            className={styles.pluginDescription}
            fontWeight={400}
            lineHeight="20px"
            title={descriptionLocale}
          >
            {descriptionLocale}
          </Text>
        ) : null}
      </div>
    </div>
  );
};

export default PluginItem;
