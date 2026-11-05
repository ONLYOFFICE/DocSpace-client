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

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

import type { IClientProps } from "@docspace/shared/utils/oauth/types";
import type { UserStore } from "@docspace/shared/store/UserStore";
import {
  DataTable,
  createLocalStorageWidths,
  type DataTableRowState,
} from "@onlyoffice/apps-ui-kit/components/data-table";

import type OAuthStore from "SRC_DIR/store/OAuthStore";
import sectionTableStyles from "SRC_DIR/components/DataTable/DataTable.module.scss";
import { useStickyHeaderTop } from "SRC_DIR/components/DataTable/useStickyHeaderTop";

import { getOAuthColumns, SCOPE_TAG_WIDTH } from "./oauthColumns";
import type { TableViewProps } from "./TableView.types";
import styles from "./TableView.styled.module.scss";

const COLUMN_WIDTHS = "oauthConfigColumnsWidths_ver-1";

// What a click on these leaves to them: no opening, no clearing.
const NOT_HANDLED = [
  ".checkbox",
  ".table-container_row-checkbox",
  ".advanced-tag",
  ".tag",
].join(",");

// What a click on these leaves to them, clearing the selection instead of
// opening the app.
const CLEARING = [
  ".type-combobox",
  ".table-container_row-context-menu-wrapper",
  ".toggleButton",
].join(",");

const getRowKey = (item: IClientProps) => item.clientId;

/** The portal's OAuth apps on the ui-kit DataTable. */
const TableView = ({
  items,
  selection,
  setSelection,
  setBufferSelection,
  getContextMenuItems,
  userId,
  hasNextPage,
  fetchNextClients,
  isGroupDialogVisible,
}: TableViewProps) => {
  const { t } = useTranslation(["OAuth", "Common", "Files", "Webhooks"]);
  const navigate = useNavigate();

  // How many scope tags fit the scopes column, as the old header's tag ref
  // measured it.
  const [tagCount, setTagCount] = useState(0);
  const scopesHeaderRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return undefined;

    const observer = new ResizeObserver(() => {
      setTagCount(
        Math.floor(node.getBoundingClientRect().width / SCOPE_TAG_WIDTH),
      );
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const columns = useMemo(
    () => getOAuthColumns(t, tagCount, scopesHeaderRef),
    [t, tagCount, scopesHeaderRef],
  );

  const widthStorage = useMemo(
    () => createLocalStorageWidths(`${COLUMN_WIDTHS}=${userId}`),
    [userId],
  );

  // A click anywhere but on a checkbox drops the selection, unless a dialog
  // acting on it is open.
  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (isGroupDialogVisible) return;

      const target = e.target as HTMLElement | null;
      if (
        !target ||
        target.closest(".checkbox") ||
        target.closest(".table-container_row-checkbox") ||
        e.detail === 0
      )
        return;

      setSelection?.("");
    };

    window.addEventListener("click", clickOutside);
    return () => window.removeEventListener("click", clickOutside);
  }, [setSelection, isGroupDialogVisible]);

  useEffect(() => () => setSelection?.(""), [setSelection]);

  // Read here, so that the observer re-renders when the selection, which the
  // store changes in place, or an app changes.
  const selected = selection?.slice() ?? [];
  const rows = items.slice();

  const getRowProps = useCallback(
    (item: IClientProps): DataTableRowState => ({
      checked: selected.includes(item.clientId),
      className: styles.oauthRow,
      testId: `${item.name}_table_row`,
      contextMenu: {
        options: getContextMenuItems?.(t, item) ?? [],
        getModel: () => getContextMenuItems?.(t, item) ?? [],
        onOpen: (isRightClick) => {
          if (isRightClick) return;
          setSelection?.("");
          setBufferSelection?.(item.clientId);
        },
      },
      onClick: (e) => {
        const target = e.target as Element;
        if (target.closest(NOT_HANDLED) || e.detail === 0) return;
        if (target.closest(CLEARING)) {
          setSelection?.("");
          return;
        }
        navigate(`${item.clientId}`);
      },
    }),
    [
      t,
      navigate,
      selected,
      getContextMenuItems,
      setSelection,
      setBufferSelection,
    ],
  );

  const loadMore = useMemo(
    () => ({
      hasMore: !!hasNextPage,
      onLoadMore: () => fetchNextClients?.(rows.length),
    }),
    [hasNextPage, fetchNextClients, rows.length],
  );

  const tableRef = useRef<HTMLDivElement>(null);
  useStickyHeaderTop(tableRef, { belowPinned: true });

  if (!rows.length) return null;

  return (
    <DataTable<IClientProps>
      ref={tableRef}
      ariaLabel={t("OAuth")}
      columns={columns}
      rows={rows}
      getRowKey={getRowKey}
      getRowProps={getRowProps}
      widthStorage={widthStorage}
      virtualize
      loadMore={loadMore}
      className={sectionTableStyles.settingsTable}
    />
  );
};

export default inject(
  ({
    userStore,
    oauthStore,
  }: {
    userStore: UserStore;
    oauthStore: OAuthStore;
  }) => ({
    userId: userStore.user?.id,
    selection: oauthStore.selection,
    setSelection: oauthStore.setSelection,
    setBufferSelection: oauthStore.setBufferSelection,
    getContextMenuItems: oauthStore.getContextMenuItems,
    hasNextPage: oauthStore.hasNextPage,
    fetchNextClients: oauthStore.fetchNextClients,
    isGroupDialogVisible:
      oauthStore.disableDialogVisible || oauthStore.deleteDialogVisible,
  }),
)(observer(TableView)) as unknown as React.ComponentType<
  Pick<TableViewProps, "items">
>;
