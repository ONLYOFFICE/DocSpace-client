// (c) Copyright Ascensio System SIA 2009-2026
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
    productName: t("ProductName"),
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
