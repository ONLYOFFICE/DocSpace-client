// (c) Copyright Ascensio System SIA 2009-2025
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

import React from "react";
import { TableHeader } from "@docspace/shared/components/table";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";

const TABLE_VERSION = "5";
const TABLE_COLUMNS = `auditTableColumns_ver-${TABLE_VERSION}`;

class AuditTableHeader extends React.Component {
  constructor(props) {
    super(props);

    const { t } = props;

    const defaultColumns = [
      {
        key: "User",
        title: t("Common:User"),
        resizable: true,
        enable: true,
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
        key: "Room",
        title: t("Common:Location"),
        enable: true,
        resizable: true,
        onChange: this.onColumnChange,
      },
      {
        key: "Action",
        title: t("Common:Action"),
        enable: true,
        resizable: true,
        default: true,
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
})(withTranslation(["Common", "Translations"])(observer(AuditTableHeader)));
