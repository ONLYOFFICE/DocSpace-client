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

import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";
import classNames from "classnames";

import { Events } from "@docspace/shared/enums";
import useViewEffect from "@onlyoffice/apps-ui-kit/hooks/useViewEffect";
import {
  DataTable,
  createLocalStorageWidths,
  type DataTableRenderRowProps,
  type DataTableSort,
} from "@onlyoffice/apps-ui-kit/components/data-table";

import type { TContactsViewAs } from "SRC_DIR/helpers/contacts";
import { setPersistedString } from "SRC_DIR/store/utils/persistence";
import { useStickyHeaderTop } from "SRC_DIR/components/DataTable/useStickyHeaderTop";
import sectionTableStyles from "SRC_DIR/components/DataTable/DataTable.module.scss";

import EmptyScreen from "../../EmptyScreen";
import { CONTACTS_DATA_TABLE_LIST_CLASS } from "../../listClass";
import type {
  TableHeaderStores,
  TableViewStores,
  TItem,
} from "./UsersDataTableView.types";

import {
  NAME_SORT_KEY,
  getUsersColumnIds,
  getUsersColumns,
  usersColumnsRecord,
  type TUsersColumnFlags,
  type TUsersColumnsOptions,
  type TUsersTab,
} from "./usersColumns";
import UsersDataTableRow from "./UsersDataTableRow";

const VIRTUALIZE = { innerClassName: CONTACTS_DATA_TABLE_LIST_CLASS };

/** The tableStore scope of each tab, under which its keys are resolved. */
const TAB_SCOPES: Record<TUsersTab, string> = {
  people: "people",
  guests: "guests",
  inside_group: "insideGroup",
};

type TStores = TableViewStores &
  Pick<TableHeaderStores, "clientLoadingStore" | "currentQuotaStore">;

type InjectedProps = {
  peopleList: TItem[];
  viewAs: string;
  setViewAs: (viewAs: TContactsViewAs) => void;
  currentDeviceType: TStores["settingsStore"]["currentDeviceType"];
  isUsersEmptyView: boolean;
  tab: TUsersTab;
  /** tableStore resolves this tab's keys, not those of the tab being left. */
  inTabScope: boolean;
  hasMoreUsers: boolean;
  fetchMoreUsers: () => Promise<unknown>;
  changeType: TStores["peopleStore"]["usersStore"]["changeType"];
  canChangeUserType: TStores["accessRightsStore"]["canChangeUserType"];
  filter: TStores["peopleStore"]["usersStore"]["filter"];
  setFilter: TStores["peopleStore"]["usersStore"]["setFilter"];
  setIsLoading: (isLoading: boolean) => void;
  flags: TUsersColumnFlags;
  showStorageInfo: boolean;
  showAISpendingInfo: boolean;
  isDefaultUsersQuotaSet: boolean;
  isRoomAdmin: boolean;
  getColumns: TStores["tableStore"]["getColumns"];
  setColumnEnable: TStores["tableStore"]["setColumnEnable"];
  tableStorageName: string;
  columnWidthsStorageName: string;
  withContentSelection: boolean;
};

const getRowKey = (item: TItem) => item.id;

/**
 * The Contacts users list (People, Guests, a group's members) on the ui-kit
 * DataTable. Visible columns stay in `tableStore`, in the record format the
 * old table kept; widths go to the DataTable's own record, one per tab.
 */
const UsersDataTableView = ({
  peopleList,
  viewAs,
  setViewAs,
  currentDeviceType,
  isUsersEmptyView,
  tab,
  inTabScope,
  hasMoreUsers,
  fetchMoreUsers,
  changeType,
  canChangeUserType,
  filter,
  setFilter,
  setIsLoading,
  flags: injectedFlags,
  showStorageInfo,
  showAISpendingInfo,
  isDefaultUsersQuotaSet,
  isRoomAdmin,
  getColumns,
  setColumnEnable,
  tableStorageName,
  columnWidthsStorageName,
  withContentSelection,
}: InjectedProps) => {
  const { t } = useTranslation(["People", "Common", "PeopleTranslations"]);
  const navigate = useNavigate();
  const location = useLocation();

  useViewEffect({
    view: viewAs,
    setView: (view: string) => setViewAs(view as TContactsViewAs),
    currentDeviceType,
  });

  // The injector hands a new object on every render; the columns are rebuilt
  // only when a flag actually changes.
  const flagsKey = JSON.stringify(injectedFlags);
  const flags = useMemo(
    () => JSON.parse(flagsKey) as TUsersColumnFlags,
    [flagsKey],
  );

  const options: TUsersColumnsOptions = useMemo(
    () => ({
      t,
      tab,
      flags,
      showStorageInfo,
      showAISpendingInfo,
      isDefaultUsersQuotaSet,
      isRoomAdmin,
    }),
    [
      t,
      tab,
      flags,
      showStorageInfo,
      showAISpendingInfo,
      isDefaultUsersQuotaSet,
      isRoomAdmin,
    ],
  );

  // What the old header did on mount: read the stored visible columns into
  // tableStore. Not while tableStore still resolves another tab's keys.
  useLayoutEffect(() => {
    if (inTabScope) getColumns([]);
  }, [tableStorageName, inTabScope]);

  const columns = useMemo(() => getUsersColumns(options), [options]);

  const widthStorage = useMemo(
    () => createLocalStorageWidths(columnWidthsStorageName),
    [columnWidthsStorageName],
  );

  const sortBy =
    filter.sortBy === "displayname" ? NAME_SORT_KEY : filter.sortBy;
  const sortDesc = filter.sortOrder === "descending";
  const sort: DataTableSort = useMemo(
    () => ({ key: sortBy ?? "", desc: sortDesc }),
    [sortBy, sortDesc],
  );

  // The old header's onFilter: a new sort key, or the other order of this one.
  const onSortChange = useCallback(
    (nextSortBy: string) => {
      const newFilter = filter.clone();
      const current =
        newFilter.sortBy === "displayname" ? NAME_SORT_KEY : newFilter.sortBy;

      if (current === nextSortBy) {
        newFilter.sortOrder =
          newFilter.sortOrder === "ascending" ? "descending" : "ascending";
      } else {
        newFilter.sortBy = (
          nextSortBy === NAME_SORT_KEY ? "displayname" : nextSortBy
        ) as typeof newFilter.sortBy;
      }

      setIsLoading(true);
      setFilter(newFilter);
      navigate(`${location.pathname}?${newFilter.toUrlParams()}`);
    },
    [filter, setIsLoading, setFilter, navigate, location.pathname],
  );

  const onColumnVisibilityChange = useCallback(
    (id: string, visible: boolean) => {
      if (!getUsersColumnIds(options).includes(id) || !!flags[id] === visible)
        return;

      setColumnEnable(id);
      setPersistedString(
        tableStorageName,
        usersColumnsRecord(options, { ...flags, [id]: visible }),
      );

      window.dispatchEvent(new Event(Events.CHANGE_COLUMN));
    },
    [options, flags, setColumnEnable, tableStorageName],
  );

  const loadMore = useMemo(
    () => ({ hasMore: hasMoreUsers, onLoadMore: fetchMoreUsers }),
    [hasMoreUsers, fetchMoreUsers],
  );

  const renderRow = useCallback(
    ({ row, index, rowProps }: DataTableRenderRowProps<TItem>) => (
      <UsersDataTableRow
        item={row}
        index={index}
        itemIndex={index}
        rowProps={rowProps}
        contactsTab={tab}
        changeUserType={changeType}
        canChangeUserType={canChangeUserType}
      />
    ),
    [tab, changeType, canChangeUserType],
  );

  const tableRef = useRef<HTMLDivElement>(null);
  useStickyHeaderTop(tableRef);

  if (isUsersEmptyView) return <EmptyScreen />;

  return (
    <DataTable<TItem>
      id="table-container"
      headerId="table-container_caption-header"
      // The old table's test ids, which the client's specs scope to; its
      // container was `table-container` whatever test id it was given.
      testId="table-container"
      headerTestId="table-header"
      bodyTestId="table-body"
      ariaLabel={t("Common:Contacts")}
      columns={columns}
      rows={peopleList}
      getRowKey={getRowKey}
      sort={sort}
      onSortChange={onSortChange}
      onColumnVisibilityChange={onColumnVisibilityChange}
      widthStorage={widthStorage}
      renderRow={renderRow}
      virtualize={VIRTUALIZE}
      loadMore={loadMore}
      ref={tableRef}
      className={classNames(sectionTableStyles.sectionTable, {
        [sectionTableStyles.noSelect]: !withContentSelection,
      })}
    />
  );
};

/** Each tab's flags in tableStore, by the old header's column keys. */
const readFlags = (
  tableStore: TStores["tableStore"],
  tab: TUsersTab,
): TUsersColumnFlags => {
  if (tab === "guests")
    return {
      Mail: tableStore.emailGuestsColumnIsEnabled,
      Inviter: tableStore.inviterGuestsColumnIsEnabled,
      InvitedDate: tableStore.invitedDateGuestsColumnIsEnabled,
    };

  if (tab === "inside_group")
    return {
      Type: tableStore.typeInsideGroupColumnIsEnabled,
      Department: tableStore.groupInsideGroupColumnIsEnabled,
      Mail: tableStore.emailInsideGroupColumnIsEnabled,
      Storage: tableStore.storageInsideGroupColumnIsEnabled,
      AISpending: tableStore.aiSpendingInsideGroupColumnIsEnabled,
    };

  return {
    Type: tableStore.typePeopleColumnIsEnabled,
    Department: tableStore.groupPeopleColumnIsEnabled,
    Mail: tableStore.emailPeopleColumnIsEnabled,
    Storage: tableStore.storagePeopleColumnIsEnabled,
    AISpending: tableStore.aiSpendingPeopleColumnIsEnabled,
  };
};

export default inject(
  ({
    peopleStore,
    accessRightsStore,
    settingsStore,
    userStore,
    tableStore,
    clientLoadingStore,
    currentQuotaStore,
  }: TStores) => {
    const { usersStore, contactsHotkeysStore, viewAs, setViewAs } = peopleStore;
    const {
      peopleList,
      hasMoreUsers,
      fetchMoreUsers,
      changeType,
      isUsersEmptyView,
      contactsTab,
      showAISpendingInfo,
      filter,
      setFilter,
    } = usersStore!;

    const tab: TUsersTab =
      contactsTab === "guests" || contactsTab === "inside_group"
        ? contactsTab
        : "people";

    return {
      peopleList,
      viewAs,
      setViewAs,
      currentDeviceType: settingsStore.currentDeviceType,
      isUsersEmptyView,
      tab,
      inTabScope: tableStore.tableScope === TAB_SCOPES[tab],
      hasMoreUsers,
      fetchMoreUsers,
      changeType,
      canChangeUserType: accessRightsStore.canChangeUserType,
      filter,
      setFilter,
      setIsLoading: clientLoadingStore.setIsSectionBodyLoading,
      flags: readFlags(tableStore, tab),
      showStorageInfo: currentQuotaStore.showStorageInfo,
      showAISpendingInfo,
      isDefaultUsersQuotaSet: currentQuotaStore.isDefaultUsersQuotaSet,
      isRoomAdmin: !!userStore.user?.isRoomAdmin,
      getColumns: tableStore.getColumns,
      setColumnEnable: tableStore.setColumnEnable,
      tableStorageName: tableStore.tableStorageName,
      columnWidthsStorageName: tableStore.columnWidthsStorageName,
      withContentSelection: contactsHotkeysStore!.withContentSelection,
    };
  },
)(observer(UsersDataTableView)) as unknown as React.ComponentType;
