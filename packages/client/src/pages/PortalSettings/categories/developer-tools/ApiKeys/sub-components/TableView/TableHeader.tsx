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

import { useState } from "react";
import { TableHeader as TableHeaderComponent } from "@docspace/shared/components/table";

import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { TableHeaderColumn, TableHeaderProps } from "../../types";

const TABLE_VERSION = "1";
const TABLE_COLUMNS = `apiKeysColumns_ver-${TABLE_VERSION}`;

const TableHeader = (props: TableHeaderProps) => {
  const {
    userId,
    tableRef,
    columnStorageName,
    setHideColumns,
    sectionWidth,
    columnInfoPanelStorageName,
  } = props;
  const { t } = useTranslation(["Webhooks", "Common", "Files", "Settings"]);

  const defaultColumns: TableHeaderColumn[] = [
    {
      key: "Name",
      title: t("Common:Label"),
      resizable: true,
      enable: true,
      default: true,
      minWidth: 110,
    },
    {
      key: "SecretKey",
      title: t("SecretKey"),
      enable: true,
      resizable: true,
    },
    {
      key: "Created",
      title: t("Files:ByCreation"),
      enable: true,
      resizable: true,
    },
    {
      key: "LastUsed",
      title: t("Common:LastUsed"),
      enable: true,
      resizable: true,
    },
    {
      key: "CreatedBy",
      title: t("Common:CreatedBy"),
      enable: true,
      resizable: true,
    },
    {
      key: "Permissions",
      title: t("Common:Permissions"),
      enable: true,
      resizable: true,
    },
    {
      key: "State",
      title: t("State"),
      enable: true,
      resizable: true,
    },
  ];

  const getColumns = (
    columnsList: TableHeaderColumn[],
    id: TableHeaderProps["userId"],
  ) => {
    const storageColumns = localStorage.getItem(`${TABLE_COLUMNS}=${id}`);

    if (storageColumns) {
      const splitColumns = storageColumns.split(",");

      const newColumns = columnsList.map((col) => {
        const column = splitColumns.find((key) => key === col.key);
        return { ...(col || {}), enable: !!column };
      });

      return newColumns;
    }
    return columnsList;
  };

  const storageColumns = getColumns(defaultColumns, userId);
  const [columns] = useState<TableHeaderColumn[]>(storageColumns ?? []);

  return (
    <TableHeaderComponent
      containerRef={tableRef}
      sectionWidth={sectionWidth}
      columns={columns}
      columnStorageName={columnStorageName}
      showSettings={false}
      useReactWindow
      setHideColumns={setHideColumns}
      infoPanelVisible={false}
      columnInfoPanelStorageName={columnInfoPanelStorageName}
      withoutWideColumn
    />
  );
};

export default inject(({ userStore }: TStore) => {
  return {
    userId: userStore.user!.id,
  };
})(observer(TableHeader));
