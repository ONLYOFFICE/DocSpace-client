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

import classNames from "classnames";
import { useTranslation } from "react-i18next";

import {
  TableCell,
  TableRow as TableRowComponent,
} from "@onlyoffice/apps-ui-kit/components/table";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { ToggleButton } from "@onlyoffice/apps-ui-kit/components/toggle-button";
import { Tooltip } from "@onlyoffice/apps-ui-kit/components/tooltip";
import { Avatar, AvatarSize } from "@onlyoffice/apps-ui-kit/components/avatar";
import { getCorrectDate } from "@onlyoffice/apps-ui-kit/utils/date/getCorrectDate";
import { Encoder } from "@onlyoffice/apps-ui-kit/utils/encoder";

import PluginDefaultLogoUrl from "PUBLIC_DIR/images/plugin.default-logo.png";

import { getLocalizedText } from "SRC_DIR/helpers/plugins/personal";

import { UsersPluginsItemProps } from "../../Plugins.types";
import { getContextOptions } from "./getContextOptions";
import { getMemberAvatarRole, type THideableColumn } from "./utils";
import styles from "./UsersPluginsList.module.scss";

const TableRow = ({
  plugin,
  language,
  isMe,
  hideColumns,
  hiddenColumns,
  onSwitch,
  onDelete,
}: UsersPluginsItemProps & {
  hideColumns: boolean;
  hiddenColumns: THideableColumn[];
}) => {
  const { t } = useTranslation(["Common"]);

  const userName = Encoder.htmlDecode(plugin.createBy?.displayName ?? "");
  const title = getLocalizedText(plugin.nameLocale, language, plugin.name);
  const description = getLocalizedText(
    plugin.descriptionLocale,
    language,
    plugin.description,
  );
  const tooltipId = `users-plugin-tooltip-${plugin.createBy?.id}-${plugin.name}`;

  const cell = (key: THideableColumn, content: React.ReactNode) =>
    hiddenColumns.includes(key) ? <div /> : content;

  return (
    <TableRowComponent
      className={classNames(styles.tableRow, {
        [styles.hideColumns]: hideColumns,
      })}
      contextOptions={getContextOptions(t, () => onDelete(plugin))}
      hideColumns={hideColumns}
      dataTestId={`user_plugin_${plugin.createBy?.id}_${plugin.name}`}
    >
      <TableCell className={styles.nameCell}>
        <img className={styles.pluginLogo} src={PluginDefaultLogoUrl} alt="" />
        <Text fontWeight={600} truncate data-tooltip-id={tooltipId}>
          {title}
        </Text>
        <Tooltip
          id={tooltipId}
          place="bottom"
          maxWidth="300px"
          getContent={() => (
            <div className={styles.nameTooltip}>
              <Text fontSize="12px" fontWeight={600}>
                {title}
              </Text>
              {description ? (
                <Text fontSize="12px" fontWeight={400}>
                  {description}
                </Text>
              ) : null}
            </div>
          )}
        />
      </TableCell>
      {cell(
        "User",
        <TableCell className={styles.userCell}>
          <Avatar
            size={AvatarSize.min}
            role={getMemberAvatarRole(plugin)}
            userName={userName}
            source={plugin.createBy?.avatarSmall ?? ""}
            noClick
          />
          <Text className={styles.secondaryText} fontWeight={600} truncate>
            {userName}
            {isMe ? (
              <span className={styles.meLabel}>({t("Common:MeLabel")})</span>
            ) : null}
          </Text>
        </TableCell>,
      )}
      {cell(
        "Version",
        <TableCell>
          <Text className={styles.secondaryText} fontWeight={600} truncate>
            {plugin.version}
          </Text>
        </TableCell>,
      )}
      {cell(
        "Domains",
        <TableCell>
          <Text
            className={styles.secondaryText}
            fontWeight={600}
            truncate
            title={plugin.cspDomains || undefined}
          >
            {plugin.cspDomains || "—"}
          </Text>
        </TableCell>,
      )}
      {cell(
        "Uploaded",
        <TableCell>
          <Text className={styles.secondaryText} fontWeight={600} truncate>
            {getCorrectDate(language, plugin.createOn)}
          </Text>
        </TableCell>,
      )}
      {cell(
        "Enabled",
        <TableCell>
          <ToggleButton
            className={classNames(styles.toggleButton, "toggleButton")}
            isChecked={plugin.enabled}
            onChange={() => onSwitch(plugin, !plugin.enabled)}
            dataTestId={`user_plugin_${plugin.name}_toggle_button`}
          />
        </TableCell>,
      )}
    </TableRowComponent>
  );
};

export default TableRow;
