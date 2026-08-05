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

import React from "react";
import classNames from "classnames";
import { inject, observer } from "mobx-react";

import { TableRow, TableCell } from "@docspace/ui-kit/components/table";
import { Text } from "@docspace/ui-kit/components/text";
import { getCorrectDate } from "@docspace/ui-kit/utils/date/getCorrectDate";

import styles from "./TableRow.module.scss";

const PeopleTableRow = (props) => {
  const { item, contextOptionsProps, isSettingNotPaid, locale } = props;
  const { email, position } = item;
  const dateStr = getCorrectDate(locale, item.date);

  const className = classNames(styles["people-row"], {
    [styles.unavailable]: isSettingNotPaid,
  });

  return (
    <TableRow key={item.id} className={className} {...contextOptionsProps}>
      <TableCell>
        <Text
          type="page"
          title={position}
          fontSize="12px"
          fontWeight={600}
          truncate
          className="settings_unavailable"
        >
          {item.user}
        </Text>
      </TableCell>
      <TableCell>
        <Text
          type="page"
          title={position}
          fontSize="12px"
          fontWeight={600}
          truncate
          className="settings_unavailable"
        >
          {dateStr}
        </Text>
      </TableCell>
      <TableCell>
        <Text
          type="page"
          title={email}
          fontSize="12px"
          fontWeight={600}
          className="settings_unavailable"
        >
          {item.context}
        </Text>
      </TableCell>

      <TableCell>
        <Text
          type="page"
          title={email}
          fontSize="12px"
          fontWeight={600}
          className="settings_unavailable"
        >
          {item.action}
        </Text>
      </TableCell>
    </TableRow>
  );
};

export default inject(({ settingsStore, userStore }) => {
  const { culture } = settingsStore;
  const { user } = userStore;
  const locale = (user && user.cultureName) || culture || "en";

  return {
    locale,
  };
})(observer(PeopleTableRow));
