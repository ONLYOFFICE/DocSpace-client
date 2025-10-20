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

import { useState, useRef } from "react";
import { inject, observer } from "mobx-react";
import styled from "styled-components";
import useViewEffect from "SRC_DIR/Hooks/useViewEffect";
import { injectDefaultTheme } from "@docspace/shared/utils";
import { TableBody, TableContainer } from "@docspace/shared/components/table";
import TableRow from "./TableRow";
import TableHeader from "./TableHeader";
import { TableViewProps } from "../../types";

const TableWrapper = styled(TableContainer).attrs(injectDefaultTheme)`
  margin-top: 16px;

  .header-container-text {
    font-size: 12px;
  }

  .table-container_header {
    position: absolute;
  }

  .table-list-item {
    margin-top: -1px;
    &:hover {
      cursor: pointer;
      background-color: ${(props) =>
        props.theme.filesSection.tableView.row.backgroundActive};

      .table-container_cell {
        margin-top: -1px;
        border-top: ${(props) =>
          `1px solid ${props.theme.filesSection.tableView.row.borderColor}`};

        margin-inline-start: -24px;
        padding-inline-start: 24px;
      }

      .table-container_row-context-menu-wrapper {
        margin-inline-end: -20px;
        padding-inline-end: 20px;
      }
    }
  }
`;

const TABLE_VERSION = "1";
const COLUMNS_SIZE = `apiKeysColumnsSize_ver-${TABLE_VERSION}`;
const INFO_PANEL_COLUMNS_SIZE = `infoPanelApiKeysColumnsSize_ver-${TABLE_VERSION}`;

const emptyAsyncCallback = async () => {};

const TableView = (props: TableViewProps) => {
  const {
    items,
    viewAs,
    sectionWidth,
    setViewAs,
    userId,
    currentDeviceType,
    culture,
    ...rest
  } = props;

  const tableRef = useRef<HTMLDivElement>(null);
  const [hideColumns, setHideColumns] = useState(false);

  useViewEffect({
    view: viewAs!,
    setView: setViewAs!,
    currentDeviceType: currentDeviceType!,
  });

  const columnStorageName = `${COLUMNS_SIZE}=${userId}`;
  const columnInfoPanelStorageName = `${INFO_PANEL_COLUMNS_SIZE}=${userId}`;

  return (
    <TableWrapper
      forwardedRef={tableRef as React.RefObject<HTMLDivElement>}
      useReactWindow
    >
      <TableHeader
        tableRef={tableRef}
        sectionWidth={sectionWidth}
        columnStorageName={columnStorageName}
        setHideColumns={setHideColumns}
        columnInfoPanelStorageName={columnInfoPanelStorageName}
      />
      <TableBody
        itemHeight={49}
        useReactWindow
        infoPanelVisible={false}
        columnStorageName={columnStorageName}
        filesLength={items.length}
        hasMoreFiles={false}
        itemCount={items.length}
        columnInfoPanelStorageName={columnInfoPanelStorageName}
        fetchMoreFiles={emptyAsyncCallback}
      >
        {items.map((item) => (
          <TableRow
            key={item.id}
            culture={culture}
            item={item}
            hideColumns={hideColumns}
            {...rest}
          />
        ))}
      </TableBody>
    </TableWrapper>
  );
};

export default inject(({ setup, settingsStore, userStore }: TStore) => {
  const { viewAs, setViewAs } = setup;
  const { currentDeviceType, culture } = settingsStore;

  return {
    viewAs,
    setViewAs,
    userId: userStore.user!.id,
    currentDeviceType,
    culture,
  };
})(observer(TableView));
