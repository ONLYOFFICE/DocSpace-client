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
import { inject, observer } from "mobx-react";

import { TableContainer, TableBody } from "@docspace/ui-kit/components/table";
import { UserStore } from "@docspace/shared/store/UserStore";

import OAuthStore from "SRC_DIR/store/OAuthStore";

import Row from "./Row";
import Header from "./Header";

import { TableViewProps } from "./TableView.types";
import styles from "../../authorized-apps.module.scss";

const TABLE_VERSION = "1";
const COLUMNS_SIZE = `consentColumnsSize_ver-${TABLE_VERSION}`;

const TableView = ({
  items,
  sectionWidth,
  selection,
  activeClients,
  setSelection,
  getContextMenuItems,
  changeClientStatus,
  userId,
  hasNextPage,
  itemCount,
  fetchNextConsents,
}: TableViewProps) => {
  const tableRef = React.useRef<HTMLDivElement>(null);

  const clickOutside = React.useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest(".checkbox") ||
        target.closest(".table-container_row-checkbox") ||
        e.detail === 0
      ) {
        return;
      }

      setSelection?.("");
    },
    [setSelection],
  );

  React.useEffect(() => {
    window.addEventListener("click", clickOutside);

    return () => {
      window.removeEventListener("click", clickOutside);
    };
  }, [clickOutside, setSelection]);

  const columnStorageName = `${COLUMNS_SIZE}=${userId}`;

  const fetchMoreFiles = React.useCallback(
    async ({ startIndex }: { startIndex: number; stopIndex: number }) => {
      await fetchNextConsents?.(startIndex);
    },
    [fetchNextConsents],
  );

  return (
    <TableContainer
      className={styles.tableWrapper}
      forwardedRef={tableRef as React.RefObject<HTMLDivElement>}
      useReactWindow
    >
      <Header
        sectionWidth={sectionWidth}
        tableRef={tableRef.current}
        columnStorageName={columnStorageName}
      />
      <TableBody
        itemHeight={49}
        useReactWindow
        columnStorageName={columnStorageName}
        columnInfoPanelStorageName=" "
        filesLength={items.length}
        fetchMoreFiles={fetchMoreFiles}
        hasMoreFiles={hasNextPage || false}
        itemCount={itemCount || 0}
        isIndexEditingMode={false}
      >
        {items.map((item, index) => (
          <Row
            key={item.clientId}
            item={item}
            isChecked={selection?.includes(item.clientId) || false}
            inProgress={activeClients?.includes(item.clientId) || false}
            setSelection={setSelection}
            changeClientStatus={changeClientStatus}
            getContextMenuItems={getContextMenuItems}
            dataTestId={`auth_row_${index}`}
          />
        ))}
      </TableBody>
    </TableContainer>
  );
};

export default inject(
  ({
    userStore,
    oauthStore,
  }: {
    userStore: UserStore;
    oauthStore: OAuthStore;
  }) => {
    const userId = userStore.user?.id;

    const {
      viewAs,
      setViewAs,
      selection,
      setSelection,
      setBufferSelection,
      changeClientStatus,
      getContextMenuItems,
      activeClients,
      consentHasNextPage,
      consentItemCount,
      fetchNextConsents,
    } = oauthStore;

    return {
      viewAs,
      setViewAs,
      userId,
      changeClientStatus,
      selection,
      setSelection,
      setBufferSelection,
      activeClients,
      getContextMenuItems,
      hasNextPage: consentHasNextPage,
      itemCount: consentItemCount,
      fetchNextConsents,
    };
  },
)(observer(TableView));
