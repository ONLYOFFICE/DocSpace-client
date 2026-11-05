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

import type { TGroup } from "@docspace/shared/api/groups/types";
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

import EmptyScreenGroups from "../../EmptyScreenGroups";
import { CONTACTS_DATA_TABLE_LIST_CLASS } from "../../listClass";

import {
  MANAGER_COLUMN,
  MEMBERS_COLUMN,
  getGroupsColumns,
  groupsColumnsRecord,
  type TGroupsColumnFlags,
} from "./groupsColumns";
import GroupsDataTableRow from "./GroupsDataTableRow";

const VIRTUALIZE = { innerClassName: CONTACTS_DATA_TABLE_LIST_CLASS };

type TStores = Pick<
  TStore,
  "peopleStore" | "settingsStore" | "tableStore" | "clientLoadingStore"
>;
type TGroupsStore = NonNullable<TStores["peopleStore"]["groupsStore"]>;

type InjectedProps = {
  groups: TGroup[];
  selection: TGroup[];
  viewAs: string;
  setViewAs: (viewAs: TContactsViewAs) => void;
  currentDeviceType: TStores["settingsStore"]["currentDeviceType"];
  hasMoreGroups: boolean;
  fetchMoreGroups: () => Promise<unknown>;
  filter: TGroupsStore["groupsFilter"];
  setFilter: TGroupsStore["setGroupsFilter"];
  setIsLoading: (isLoading: boolean) => void;
  /** tableStore resolves the groups' keys, not those of the tab being left. */
  inGroupsScope: boolean;
  membersEnabled: boolean;
  managerEnabled: boolean;
  getColumns: TStores["tableStore"]["getColumns"];
  setColumnEnable: TStores["tableStore"]["setColumnEnable"];
  tableStorageName: string;
  columnWidthsStorageName: string;
  withContentSelection: boolean;
};

const getRowKey = (group: TGroup) => group.id;

/**
 * The Contacts groups list on the ui-kit DataTable. Visible columns stay in
 * `tableStore`, in the record format the old table kept; widths go to the
 * DataTable's own record.
 */
const GroupsDataTableView = ({
  groups,
  selection,
  viewAs,
  setViewAs,
  currentDeviceType,
  hasMoreGroups,
  fetchMoreGroups,
  filter,
  setFilter,
  setIsLoading,
  inGroupsScope,
  membersEnabled,
  managerEnabled,
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

  // What the old header did on mount: read the stored visible columns into
  // tableStore. Not while tableStore still resolves another tab's keys.
  useLayoutEffect(() => {
    if (inGroupsScope) getColumns([]);
  }, [tableStorageName, inGroupsScope]);

  const flags: TGroupsColumnFlags = useMemo(
    () => ({
      [MEMBERS_COLUMN]: membersEnabled,
      [MANAGER_COLUMN]: managerEnabled,
    }),
    [membersEnabled, managerEnabled],
  );

  const columns = useMemo(() => getGroupsColumns(t, flags), [t, flags]);

  const widthStorage = useMemo(
    () => createLocalStorageWidths(columnWidthsStorageName),
    [columnWidthsStorageName],
  );

  const sort: DataTableSort = useMemo(
    () => ({
      key: filter.sortBy ?? "",
      desc: filter.sortOrder === "descending",
    }),
    [filter.sortBy, filter.sortOrder],
  );

  // The old header's onFilter: a new sort key, or the other order of this one.
  const onSortChange = useCallback(
    (sortBy: string) => {
      const newFilter = filter.clone();

      if (newFilter.sortBy === sortBy) {
        newFilter.sortOrder =
          newFilter.sortOrder === "ascending" ? "descending" : "ascending";
      } else {
        newFilter.sortBy = sortBy as typeof newFilter.sortBy;
      }

      setIsLoading(true);
      setFilter(newFilter);
      navigate(`${location.pathname}?${newFilter.toUrlParams()}`);
    },
    [filter, setIsLoading, setFilter, navigate, location.pathname],
  );

  const onColumnVisibilityChange = useCallback(
    (id: string, visible: boolean) => {
      if (!(id in flags) || flags[id as keyof TGroupsColumnFlags] === visible)
        return;

      setColumnEnable(id);
      setPersistedString(
        tableStorageName,
        groupsColumnsRecord({ ...flags, [id]: visible }),
      );

      window.dispatchEvent(new Event(Events.CHANGE_COLUMN));
    },
    [flags, setColumnEnable, tableStorageName],
  );

  const loadMore = useMemo(
    () => ({ hasMore: hasMoreGroups, onLoadMore: fetchMoreGroups }),
    [hasMoreGroups, fetchMoreGroups],
  );

  const renderRow = useCallback(
    ({ row, index, rowProps }: DataTableRenderRowProps<TGroup>) => (
      <GroupsDataTableRow
        item={row}
        index={index}
        checked={selection.includes(row)}
        rowProps={rowProps}
      />
    ),
    [selection],
  );

  const tableRef = useRef<HTMLDivElement>(null);
  useStickyHeaderTop(tableRef);

  if (!groups.length) return <EmptyScreenGroups />;

  return (
    <DataTable<TGroup>
      id="table-container"
      headerId="table-container_caption-header"
      // The old table's test ids, which the client's specs scope to; its
      // container was `table-container` whatever test id it was given.
      testId="table-container"
      headerTestId="table-header"
      bodyTestId="table-body"
      ariaLabel={t("Common:Groups")}
      columns={columns}
      rows={groups}
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

export default inject(
  ({ peopleStore, settingsStore, tableStore, clientLoadingStore }: TStores) => {
    const { groupsStore, contactsHotkeysStore, viewAs, setViewAs } =
      peopleStore;
    const {
      groups,
      selection,
      hasMoreGroups,
      fetchMoreGroups,
      groupsFilter,
      setGroupsFilter,
    } = groupsStore!;

    return {
      groups: groups ?? [],
      selection,
      viewAs,
      setViewAs,
      currentDeviceType: settingsStore.currentDeviceType,
      hasMoreGroups,
      fetchMoreGroups,
      filter: groupsFilter,
      setFilter: setGroupsFilter,
      setIsLoading: clientLoadingStore.setIsSectionBodyLoading,
      inGroupsScope: tableStore.tableScope === "groups",
      membersEnabled: tableStore.peopleGroupsColumnIsEnabled,
      managerEnabled: tableStore.managerGroupsColumnIsEnabled,
      getColumns: tableStore.getColumns,
      setColumnEnable: tableStore.setColumnEnable,
      tableStorageName: tableStore.tableStorageName,
      columnWidthsStorageName: tableStore.columnWidthsStorageName,
      withContentSelection: contactsHotkeysStore!.withContentSelection,
    };
  },
)(observer(GroupsDataTableView)) as unknown as React.ComponentType;
