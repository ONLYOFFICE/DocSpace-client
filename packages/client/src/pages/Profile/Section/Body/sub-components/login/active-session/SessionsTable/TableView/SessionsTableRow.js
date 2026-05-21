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

import { inject, observer } from "mobx-react";

import { TableRow, TableCell } from "@docspace/ui-kit/components/table";
import { Text } from "@docspace/ui-kit/components/text";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { getCorrectDate } from "@docspace/ui-kit/utils/date/getCorrectDate";
import RemoveSessionSvgUrl from "PUBLIC_DIR/images/remove.session.svg?url";
import TickSvgUrl from "PUBLIC_DIR/images/tick.svg?url";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";
import styles from "../../active-sessions.module.scss";

const SessionsTableRow = (props) => {
  const {
    item,
    hideColumns,
    currentSession,
    setPlatformModalData,
    setLogoutDialogVisible,
    locale,
  } = props;

  const { platform, browser, date, country, city, ip } = item;

  const showRemoveIcon = currentSession !== item.id;
  const showTickIcon = currentSession === item.id;

  const onRemoveClick = () => {
    setLogoutDialogVisible(true);
    setPlatformModalData({
      id: item?.id,
      platform: item?.platform,
      browser: item?.browser,
    });
  };

  return (
    <TableRow
      key={item.id}
      hideColumns={hideColumns}
      dataTestId={`session_row_${item.id}`}
    >
      <TableCell>
        <Text className={styles.sessionPlatform} dataTestId="session_platform">
          {platform}
        </Text>
        <Text
          className={styles.sessionInfo}
          dataTestId="session_browser"
        >{`(${browser})`}</Text>
        {showTickIcon ? (
          <IconButton
            size={12}
            className={styles.tickIcon}
            color={globalColors.tickColor}
            iconName={TickSvgUrl}
          />
        ) : null}
      </TableCell>

      <TableCell>
        <Text className={styles.sessionInfo} truncate dataTestId="session_date">
          {getCorrectDate(locale, date)}
        </Text>
      </TableCell>

      <TableCell>
        <Text
          className={styles.sessionInfo}
          truncate
          dataTestId="session_location"
        >
          {country || city ? (
            <>
              {country}
              {country && city ? ", " : null}
              {city}
              {ip ? <span className={styles.rowDivider} /> : null}
            </>
          ) : null}
          {ip}
        </Text>
      </TableCell>

      {showRemoveIcon ? (
        <TableCell className={styles.removeCell}>
          <IconButton
            size={20}
            iconName={RemoveSessionSvgUrl}
            isClickable
            onClick={onRemoveClick}
            dataTestId="session_remove_icon_button"
          />
        </TableCell>
      ) : null}
    </TableRow>
  );
};

export default inject(({ setup, settingsStore, userStore }) => {
  const { currentSession, setLogoutDialogVisible, setPlatformModalData } =
    setup;
  const { culture } = settingsStore;
  const { user } = userStore;
  const locale = (user && user.cultureName) || culture || "en";

  return {
    locale,
    currentSession,
    setLogoutDialogVisible,
    setPlatformModalData,
  };
})(observer(SessionsTableRow));

