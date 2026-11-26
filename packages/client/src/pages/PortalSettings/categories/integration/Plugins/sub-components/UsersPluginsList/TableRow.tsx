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

import { useState } from "react";
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

import PluginDefaultLogoUrl from "PUBLIC_DIR/images/plugin.default-logo.png";

import { getLocalizedText } from "SRC_DIR/helpers/plugins/locale";

import { UsersPluginsItemProps } from "../../Plugins.types";
import { getContextOptions } from "./getContextOptions";
import {
  getMemberAvatarRole,
  getMemberName,
  getMemberPluginKey,
  type THideableColumn,
} from "./utils";
import styles from "./UsersPluginsList.module.scss";

const TableRow = ({
  plugin,
  language,
  isMe,
  hideColumns,
  hiddenColumns,
  isSwitching,
  onSwitch,
  onDelete,
}: UsersPluginsItemProps & {
  hideColumns: boolean;
  hiddenColumns: THideableColumn[];
}) => {
  const { t } = useTranslation(["Common"]);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const userName = getMemberName(plugin);
  const role = getMemberAvatarRole(plugin);
  const title = getLocalizedText(plugin.nameLocale, language, plugin.name);
  const description = getLocalizedText(
    plugin.descriptionLocale,
    language,
    plugin.description,
  );
  const key = getMemberPluginKey(plugin);
  const tooltipId = `users-plugin-tooltip-${key}`;
  const toggleId = `users-plugin-toggle-${key}`;
  const switching = isSwitching(plugin);
  const onToggle = () => onSwitch(plugin, !plugin.enabled);

  const cell = (key: THideableColumn, content: React.ReactNode) =>
    hiddenColumns.includes(key) ? <div /> : content;

  return (
    <TableRowComponent
      className={classNames(styles.tableRow, {
        [styles.hideColumns]: hideColumns,
      })}
      contextOptions={getContextOptions(
        t,
        plugin.enabled,
        switching,
        onToggle,
        () => onDelete(plugin),
      )}
      hideColumns={hideColumns}
      dataTestId={`user_plugin_${plugin.createBy?.id}_${plugin.name}`}
    >
      <TableCell className={styles.nameCell}>
        <img className={styles.pluginLogo} src={PluginDefaultLogoUrl} alt="" />
        <div
          className={styles.nameTitle}
          tabIndex={0}
          data-tooltip-id={tooltipId}
          data-testid={`plugin_title_${plugin.createBy?.id}_${plugin.name}`}
          onFocus={() => setIsTooltipOpen(true)}
          onBlur={() => setIsTooltipOpen(false)}
        >
          <Text fontWeight={600} truncate>
            {title}
          </Text>
        </div>
        <Tooltip
          id={tooltipId}
          isOpen={isTooltipOpen}
          setIsOpen={setIsTooltipOpen}
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
            role={role}
            dataTestId={`member_avatar_${role}`}
            userName={userName}
            source={plugin.createBy?.avatarSmall ?? ""}
            noClick
          />
          <Text className={styles.secondaryText} fontWeight={600} truncate>
            {userName}
          </Text>
          {isMe ? (
            <Text
              className={classNames(styles.secondaryText, styles.meLabel)}
              fontWeight={600}
            >
              ({t("Common:MeLabel")})
            </Text>
          ) : null}
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
          <label className={styles.visuallyHidden} htmlFor={toggleId}>
            {`${title}, ${userName}`}
          </label>
          <ToggleButton
            className={classNames(styles.toggleButton, "toggleButton")}
            inputId={toggleId}
            isChecked={plugin.enabled}
            isLoading={switching}
            onChange={onToggle}
            dataTestId={`user_plugin_${plugin.createBy?.id}_${plugin.name}_toggle_button`}
          />
        </TableCell>,
      )}
    </TableRowComponent>
  );
};

export default TableRow;
