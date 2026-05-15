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
import { TableHeader } from "@docspace/ui-kit/components/table";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";

const TABLE_VERSION = "3";
const TABLE_COLUMNS = `historyTableColumns_ver-${TABLE_VERSION}`;

class PeopleTableHeader extends React.Component {
  constructor(props) {
    super(props);

    const { t } = props;

    const defaultColumns = [
      {
        key: "User",
        title: t("Common:User"),
        resizable: true,
        enable: true,
        default: true,
        sortBy: "AZ",
        active: true,
        minWidth: 210,
      },
      {
        key: "Date",
        title: t("Common:Date"),
        enable: true,
        resizable: true,
        onChange: this.onColumnChange,
      },
      {
        key: "Action",
        title: t("Common:Action"),
        enable: true,
        resizable: true,
        onChange: this.onColumnChange,
      },
    ];

    const columns = this.getColumns(defaultColumns);

    this.state = { columns };
  }

  getColumns = (defaultColumns) => {
    const { userId } = this.props;

    const storageColumns = localStorage.getItem(`${TABLE_COLUMNS}=${userId}`);

    if (storageColumns) {
      const splitColumns = storageColumns.split(",");

      const columns = defaultColumns.map((col) => {
        const column = splitColumns.find((key) => key === col.key);
        return { ...(col || {}), enable: !!column };
      });
      return columns;
    }
    return defaultColumns;
  };

  onColumnChange = (key) => {
    const { columns } = this.state;
    const { userId } = this.props;
    const columnIndex = columns.findIndex((c) => c.key === key);

    if (columnIndex === -1) return;

    columns[columnIndex].enable = !columns[columnIndex].enable;
    this.setState({ columns });

    const tableColumns = columns.map((c) => c.enable && c.key);
    localStorage.setItem(`${TABLE_COLUMNS}=${userId}`, tableColumns);
  };

  render() {
    const { columns } = this.state;
    const {
      containerRef,
      sectionWidth,
      columnStorageName,
      columnInfoPanelStorageName,
    } = this.props;

    return (
      <TableHeader
        checkboxSize="48px"
        containerRef={containerRef}
        columns={columns}
        columnStorageName={columnStorageName}
        columnInfoPanelStorageName={columnInfoPanelStorageName}
        sectionWidth={sectionWidth}
        checkboxMargin="12px"
        showSettings={false}
      />
    );
  }
}

export default inject(({ userStore }) => {
  return {
    userId: userStore.user.id,
  };
})(withTranslation(["Common", "Translations"])(observer(PeopleTableHeader)));
