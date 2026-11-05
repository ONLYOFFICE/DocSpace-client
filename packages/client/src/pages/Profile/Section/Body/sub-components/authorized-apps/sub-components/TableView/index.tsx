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

import type React from "react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import type { IClientProps } from "@docspace/shared/utils/oauth/types";
import type { UserStore } from "@docspace/shared/store/UserStore";
import {
  DataTable,
  createLocalStorageWidths,
  type DataTableRowState,
} from "@onlyoffice/apps-ui-kit/components/data-table";
import { getCookie } from "@onlyoffice/apps-ui-kit/utils/cookie";

import type OAuthStore from "SRC_DIR/store/OAuthStore";
import sectionTableStyles from "SRC_DIR/components/DataTable/DataTable.module.scss";
import { useStickyHeaderTop } from "SRC_DIR/components/DataTable/useStickyHeaderTop";

import { getAuthorizedAppsColumns } from "./authorizedAppsColumns";
import type { InjectedTableViewProps, TableViewProps } from "./TableView.types";

const COLUMN_WIDTHS = "consentColumnsWidths_ver-1";

const getRowKey = (item: IClientProps) => item.clientId;

/** The apps the user granted access to, on the ui-kit DataTable. */
const TableView = ({
  items,
  userId,
  selection,
  setSelection,
  getContextMenuItems,
  hasNextPage,
  fetchNextConsents,
}: InjectedTableViewProps) => {
  const { t } = useTranslation(["OAuth", "Common", "Files"]);

  // A click anywhere but on a checkbox, or one the keyboard made, clears the
  // selection.
  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest(".checkbox") ||
        target.closest(".table-container_row-checkbox") ||
        e.detail === 0
      )
        return;

      setSelection("");
    };

    window.addEventListener("click", clickOutside);
    return () => window.removeEventListener("click", clickOutside);
  }, [setSelection]);

  const locale = getCookie("asc_language") || "";

  const columns = useMemo(
    () => getAuthorizedAppsColumns(t, locale),
    [t, locale],
  );

  const widthStorage = useMemo(
    () => createLocalStorageWidths(`${COLUMN_WIDTHS}=${userId}`),
    [userId],
  );

  // The store changes the selection in place: its contents are the key.
  const selectionKey = selection.join("\n");
  const selected = useMemo(
    () => new Set(selectionKey ? selectionKey.split("\n") : []),
    [selectionKey],
  );

  const getRowProps = useCallback(
    (item: IClientProps, index: number): DataTableRowState => {
      const getModel = () => getContextMenuItems(t, item, false, false);

      return {
        checked: selected.has(item.clientId),
        testId: `auth_row_${index}`,
        contextMenu: {
          options: getModel(),
          getModel,
          title: t("Common:Actions"),
        },
      };
    },
    [t, getContextMenuItems, selected],
  );

  const loadMore = useMemo(
    () => ({
      hasMore: hasNextPage,
      onLoadMore: () => fetchNextConsents(items.length),
    }),
    [hasNextPage, fetchNextConsents, items.length],
  );

  const tableRef = useRef<HTMLDivElement>(null);
  useStickyHeaderTop(tableRef, { belowPinned: true });

  return (
    <DataTable<IClientProps>
      ref={tableRef}
      ariaLabel={t("OAuth:AuthorizedApps")}
      columns={columns}
      rows={items}
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
    getContextMenuItems: oauthStore.getContextMenuItems,
    hasNextPage: oauthStore.consentHasNextPage,
    fetchNextConsents: oauthStore.fetchNextConsents,
  }),
)(observer(TableView)) as unknown as React.ComponentType<TableViewProps>;
