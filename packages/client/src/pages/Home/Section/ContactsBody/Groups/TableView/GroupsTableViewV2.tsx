// (c) Copyright Ascensio System SIA 2009-2026
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

import React, { useMemo, useCallback, useRef, useState } from "react";
import { inject, observer } from "mobx-react";
import { useNavigate, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components";

import type {
  ColumnDef,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";

import {
  TanStackTableContainer,
  TanStackTableHeader,
  TanStackTableBody,
} from "@docspace/ui-kit/components/tanstack-table";
import { TableSettings } from "@docspace/ui-kit/components/table/sub-components/table-settings";
import { Link } from "@docspace/ui-kit/components/link";
import { Text } from "@docspace/ui-kit/components/text";
import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@docspace/ui-kit/components/avatar";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import {
  ContextMenu,
  type ContextMenuRefType,
} from "@docspace/ui-kit/components/context-menu";
import {
  ContextMenuButton,
  ContextMenuButtonDisplayType,
} from "@docspace/ui-kit/components/context-menu-button";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { TGroup } from "@docspace/shared/api/groups/types";

import useViewEffect from "SRC_DIR/Hooks/useViewEffect";
import GroupsStore from "SRC_DIR/store/contacts/GroupsStore";
import PeopleStore from "SRC_DIR/store/contacts/PeopleStore";
import InfoPanelStore from "SRC_DIR/store/InfoPanelStore";
import TableStore from "SRC_DIR/store/TableStore";
import ContactsHotkeysStore from "SRC_DIR/store/contacts/ContactsHotkeysStore";
import { TContactsViewAs } from "SRC_DIR/helpers/contacts";

import Badges from "../../Badges";
import EmptyScreenGroups from "../../EmptyScreenGroups";

const COLUMN_KEYS = ["Name", "People", "Head of Group"];

type GroupsTableViewV2Props = {
  groups?: GroupsStore["groups"];
  selection?: GroupsStore["selection"];
  bufferSelection?: GroupsStore["bufferSelection"];
  fetchMoreGroups?: GroupsStore["fetchMoreGroups"];
  hasMoreGroups?: GroupsStore["hasMoreGroups"];
  groupsFilterTotal?: GroupsStore["groupsFilterTotal"];
  groupsFilter?: GroupsStore["groupsFilter"];
  setGroupsFilter?: GroupsStore["setGroupsFilter"];
  openGroupAction?: GroupsStore["openGroupAction"];
  getGroupContextOptions?: GroupsStore["getGroupContextOptions"];
  getModel?: GroupsStore["getModel"];
  selectRow?: GroupsStore["selectRow"];
  changeGroupSelection?: GroupsStore["changeGroupSelection"];
  changeGroupContextSelection?: GroupsStore["changeGroupContextSelection"];

  sectionWidth?: number;
  viewAs?: PeopleStore["viewAs"];
  setViewAs?: PeopleStore["setViewAs"];

  infoPanelVisible?: InfoPanelStore["isVisible"];
  currentDeviceType?: SettingsStore["currentDeviceType"];

  peopleGroupsColumnIsEnabled?: TableStore["peopleGroupsColumnIsEnabled"];
  managerGroupsColumnIsEnabled?: TableStore["managerGroupsColumnIsEnabled"];
  columnStorageName?: TableStore["columnStorageName"];
  columnInfoPanelStorageName?: TableStore["columnInfoPanelStorageName"];
  setColumnEnable?: TableStore["setColumnEnable"];

  withContentSelection?: ContactsHotkeysStore["withContentSelection"];
  setIsSectionBodyLoading?: (loading: boolean) => void;
};

const GroupsTableViewV2 = ({
  groups,
  selection,
  bufferSelection,
  sectionWidth,
  viewAs,
  setViewAs,
  infoPanelVisible,
  currentDeviceType,
  fetchMoreGroups,
  hasMoreGroups,
  groupsFilterTotal,
  groupsFilter,
  setGroupsFilter,
  openGroupAction,
  getGroupContextOptions,
  getModel,
  selectRow,
  changeGroupSelection,
  changeGroupContextSelection,
  peopleGroupsColumnIsEnabled,
  managerGroupsColumnIsEnabled,
  columnStorageName,
  columnInfoPanelStorageName,
  setColumnEnable,
  withContentSelection,
  setIsSectionBodyLoading,
}: GroupsTableViewV2Props) => {
  const { t } = useTranslation(["People", "Common", "PeopleTranslations"]);
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<ContextMenuRefType>(null);
  const [contextMenuModel, setContextMenuModel] = useState<ContextMenuModel[]>(
    [],
  );

  useViewEffect({
    view: viewAs!,
    setView: (view: string) => {
      setViewAs!(view as TContactsViewAs);
    },
    currentDeviceType: currentDeviceType!,
  });

  // Sorting (controlled externally via filter)
  const onSort = useCallback(
    (sortBy: string) => {
      if (!groupsFilter || !setGroupsFilter) return;
      const newFilter = groupsFilter.clone();
      const reverseSortOrder =
        newFilter.sortOrder === "ascending" ? "descending" : "ascending";

      if (newFilter.sortBy === sortBy && sortBy !== "AZ") {
        newFilter.sortOrder = reverseSortOrder;
      } else {
        newFilter.sortBy = sortBy;
        if (sortBy === "AZ") newFilter.sortOrder = reverseSortOrder;
      }

      setIsSectionBodyLoading?.(true);
      setGroupsFilter(newFilter);
      navigate(`${location.pathname}?${newFilter.toUrlParams()}`);
    },
    [
      groupsFilter,
      setGroupsFilter,
      setIsSectionBodyLoading,
      navigate,
      location.pathname,
    ],
  );

  // Column definitions
  const columns = useMemo<ColumnDef<TGroup, unknown>[]>(
    () => [
      {
        id: "Name",
        accessorKey: "name",
        header: t("Common:Title"),
        minSize: 210,
        enableResizing: true,
        meta: {
          legacyKey: "Name",
          sortBy: "title",
          isDefault: true,
          onClick: (sortBy: string) => onSort(sortBy),
        },
      },
      {
        id: "People",
        accessorKey: "membersCount",
        header: t("Common:Members"),
        enableResizing: true,
        meta: {
          legacyKey: "People",
          sortBy: "membersCount",
          isDefault: false,
          onClick: (sortBy: string) => onSort(sortBy),
          onChange: () => setColumnEnable?.("People"),
        },
      },
      {
        id: "Head of Group",
        accessorFn: (row: TGroup) => row.manager?.displayName ?? "",
        header: t("Common:HeadOfGroup"),
        enableResizing: true,
        meta: {
          legacyKey: "Head of Group",
          sortBy: "manager",
          isDefault: false,
          onClick: (sortBy: string) => onSort(sortBy),
          onChange: () => setColumnEnable?.("Head of Group"),
        },
      },
    ],
    [t, onSort],
  );

  // Column visibility from MobX store
  const initialVisibility = useMemo<VisibilityState>(
    () => ({
      Name: true,
      People: peopleGroupsColumnIsEnabled ?? true,
      "Head of Group": managerGroupsColumnIsEnabled ?? true,
    }),
    [peopleGroupsColumnIsEnabled, managerGroupsColumnIsEnabled],
  );

  const onColumnVisibilityChange = useCallback(
    (visibility: VisibilityState) => {
      // Sync with legacy TableStore
      if (visibility.People !== peopleGroupsColumnIsEnabled) {
        setColumnEnable?.("People");
      }
      if (
        visibility["Head of Group"] !== managerGroupsColumnIsEnabled
      ) {
        setColumnEnable?.("Head of Group");
      }
    },
    [
      peopleGroupsColumnIsEnabled,
      managerGroupsColumnIsEnabled,
      setColumnEnable,
    ],
  );

  // Persistence config
  const persistenceConfig = useMemo(
    () => ({
      columnStorageName: columnStorageName ?? "",
      columnInfoPanelStorageName,
      infoPanelVisible,
    }),
    [columnStorageName, columnInfoPanelStorageName, infoPanelVisible],
  );

  // Props for the virtual row container (className, onClick, data-testid)
  const getRowContainerProps = useCallback(
    (rowIndex: number): Record<string, unknown> => {
      if (!groups || rowIndex >= groups.length) return {};
      const item = groups[rowIndex];
      const isChecked = selection?.includes(item) ?? false;
      const isActive = bufferSelection?.id === item.id;

      return {
        className: `group-item table-row ${
          isChecked || isActive ? "table-row-selected" : ""
        }`,
        onClick: (e: React.MouseEvent) => {
          if (withContentSelection) return;
          const target = e.target as Element;
          if (
            target?.tagName === "SPAN" ||
            target?.tagName === "A" ||
            target.closest(".checkbox") ||
            target.closest(".table-container_row-checkbox") ||
            target.closest(".expandButton") ||
            e.detail === 0
          )
            return;
          selectRow?.(item);
        },
        onContextMenu: (e: React.MouseEvent) => {
          changeGroupContextSelection?.(item, true);
          const model = getModel?.(t, item) ?? [];
          setContextMenuModel(model);
          contextMenuRef.current?.show(e);
        },
        "data-testid": `contacts_groups_row_${rowIndex}`,
      };
    },
    [groups, selection, bufferSelection, withContentSelection, selectRow, changeGroupContextSelection, getModel, t],
  );

  // Row cell renderer — returns cells as direct grid children (no wrapper div)
  const renderRow = useCallback(
    (rowIndex: number) => {
      if (!groups || rowIndex >= groups.length) return null;
      const item = groups[rowIndex];
      const isChecked = selection?.includes(item) ?? false;

      const onOpenGroup = (e: React.MouseEvent) => {
        openGroupAction?.(item.id, true, item.name, e);
      };

      return (
        <>
          {/* Name cell — matches OLD structure exactly */}
          <div className="table-container_cell table-container_group-title-cell">
            <div className={`table-container_row-checkbox-wrapper${isChecked ? " checked" : ""}`}>
              <div className="table-container_element">
                <Avatar
                  className="avatar"
                  size={AvatarSize.min}
                  userName={item.name}
                  isGroup
                  role={AvatarRole.user}
                  source=""
                />
              </div>
              <Checkbox
                className="table-container_row-checkbox"
                onChange={() => changeGroupSelection?.(item, isChecked)}
                isChecked={isChecked}
              />
            </div>
            <Link
              onClick={onOpenGroup}
              title={item.name}
              fontWeight="600"
              fontSize="13px"
              isTextOverflow
              className="table-cell_group-title"
              truncate
            >
              {item.name}
            </Link>
            <Badges isLDAP={item.isLDAP} />
          </div>

          {/* Members cell */}
          <div
            className="table-container_cell"
            style={{ display: "flex", alignItems: "center" }}
          >
            {peopleGroupsColumnIsEnabled ? (
              <Text
                title={item.membersCount.toString()}
                fontWeight="600"
                fontSize="13px"
                color={theme.filesSection.tableView.row.sideColor}
              >
                {item.membersCount}
              </Text>
            ) : null}
          </div>

          {/* Manager cell */}
          <div
            className="table-container_cell"
            style={{ display: "flex", alignItems: "center", overflow: "hidden" }}
          >
            {managerGroupsColumnIsEnabled ? (
              <Text
                title={item.manager?.displayName}
                fontWeight="600"
                fontSize="13px"
                color={globalColors.gray}
                dir="auto"
                truncate
              >
                {item.manager?.displayName}
              </Text>
            ) : null}
          </div>

          {/* Context menu button */}
          <div
            className="table-container_row-context-menu-wrapper"
            style={{ height: "49px", boxSizing: "border-box" }}
          >
            <ContextMenuButton
              className="expandButton"
              isFill
              getData={() => {
                changeGroupContextSelection?.(item, false);
                return (
                  getGroupContextOptions?.(t, item) ?? []
                ) as ContextMenuModel[];
              }}
              directionX="right"
              displayType={ContextMenuButtonDisplayType.toggle}
              onClick={(e: React.MouseEvent) => {
                changeGroupContextSelection?.(item, false);
                const model = getModel?.(t, item) ?? [];
                setContextMenuModel(model);
                contextMenuRef.current?.show(e);
              }}
            />
          </div>
        </>
      );
    },
    [
      groups,
      selection,
      bufferSelection,
      withContentSelection,
      selectRow,
      openGroupAction,
      changeGroupSelection,
      peopleGroupsColumnIsEnabled,
      managerGroupsColumnIsEnabled,
      theme,
      t,
      changeGroupContextSelection,
      getGroupContextOptions,
      getModel,
    ],
  );

  if (!groups?.length) return <EmptyScreenGroups />;

  return (
    <TanStackTableContainer
      data={groups}
      columns={columns}
      columnKeys={COLUMN_KEYS}
      persistenceConfig={persistenceConfig}
      initialVisibility={initialVisibility}
      onColumnVisibilityChange={onColumnVisibilityChange}
      columnResizeDirection="ltr"
      forwardedRef={containerRef}
    >
      <TanStackTableHeader
        showSettings
        activeSortBy={groupsFilter?.sortBy}
        activeSortOrder={groupsFilter?.sortOrder as "ascending" | "descending"}
        renderSettings={() => (
          <TableSettings
            columns={[
              {
                key: "People",
                title: t("Common:Members"),
                enable: peopleGroupsColumnIsEnabled ?? true,
                sortBy: "membersCount",
                onChange: () => setColumnEnable?.("People"),
              },
              {
                key: "Head of Group",
                title: t("Common:HeadOfGroup"),
                enable: managerGroupsColumnIsEnabled ?? true,
                sortBy: "manager",
                onChange: () => setColumnEnable?.("Head of Group"),
              },
            ]}
          />
        )}
      />
      <TanStackTableBody
        itemHeight={48}
        hasMore={hasMoreGroups}
        fetchMore={fetchMoreGroups}
        renderRow={renderRow}
        getRowContainerProps={getRowContainerProps}
        totalCount={groupsFilterTotal}
      />
      {/* Shared context menu — positioned by ContextMenu component */}
      <ContextMenu
        ref={contextMenuRef}
        model={contextMenuModel}
        withBackdrop
      />
    </TanStackTableContainer>
  );
};

export default inject(
  ({
    peopleStore,
    settingsStore,
    infoPanelStore,
    tableStore,
    clientLoadingStore,
  }: TStore) => {
    const { groupsStore, contactsHotkeysStore, viewAs, setViewAs } =
      peopleStore;

    return {
      groups: groupsStore!.groups,
      selection: groupsStore!.selection,
      bufferSelection: groupsStore!.bufferSelection,
      fetchMoreGroups: groupsStore!.fetchMoreGroups,
      hasMoreGroups: groupsStore!.hasMoreGroups,
      groupsFilterTotal: groupsStore!.groupsFilterTotal,
      groupsFilter: groupsStore!.groupsFilter,
      setGroupsFilter: groupsStore!.setGroupsFilter,
      openGroupAction: groupsStore!.openGroupAction,
      getGroupContextOptions: groupsStore!.getGroupContextOptions,
      getModel: groupsStore!.getModel,
      selectRow: groupsStore!.selectRow,
      changeGroupSelection: groupsStore!.changeGroupSelection,
      changeGroupContextSelection:
        groupsStore!.changeGroupContextSelection,

      viewAs,
      setViewAs,

      infoPanelVisible: infoPanelStore.isVisible,
      currentDeviceType: settingsStore.currentDeviceType,

      peopleGroupsColumnIsEnabled: tableStore.peopleGroupsColumnIsEnabled,
      managerGroupsColumnIsEnabled: tableStore.managerGroupsColumnIsEnabled,
      columnStorageName: tableStore.columnStorageName,
      columnInfoPanelStorageName: tableStore.columnInfoPanelStorageName,
      setColumnEnable: tableStore.setColumnEnable,

      withContentSelection: contactsHotkeysStore!.withContentSelection,
      setIsSectionBodyLoading:
        clientLoadingStore.setIsSectionBodyLoading,
    };
  },
)(observer(GroupsTableViewV2));
