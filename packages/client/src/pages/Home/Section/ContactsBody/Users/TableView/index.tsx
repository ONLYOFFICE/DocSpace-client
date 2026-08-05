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

import React, { useRef } from "react";
import { inject, observer } from "mobx-react";
import { useNavigate, useLocation } from "react-router";

import {
  TableBody,
  TableContainer,
} from "@docspace/ui-kit/components/table";

import useViewEffect from "@docspace/ui-kit/hooks/useViewEffect";
import { TContactsViewAs } from "SRC_DIR/helpers/contacts";

import EmptyScreen from "../../EmptyScreen";

import TableRow from "./TableRow";
import TableHeader from "./TableHeader";

import {
  TableColumns,
  TableViewProps,
  TableViewStores,
} from "./TableView.types";
import styles from "./TableView.module.scss";

const Table = ({
  peopleList,
  sectionWidth,
  viewAs,
  setViewAs,
  isAdmin,
  isOwner,
  changeType,
  userId,
  infoPanelVisible,
  isUsersEmptyView,
  contactsTab,

  fetchMoreUsers,
  hasMoreUsers,
  filterTotal,
  canChangeUserType,
  currentDeviceType,
  setCurrentGroup,

  typePeopleColumnIsEnabled,
  emailPeopleColumnIsEnabled,
  groupPeopleColumnIsEnabled,
  storagePeopleColumnIsEnabled,

  inviterGuestsColumnIsEnabled,
  emailGuestsColumnIsEnabled,
  invitedDateGuestsColumnIsEnabled,

  typeInsideGroupColumnIsEnabled,
  emailInsideGroupColumnIsEnabled,
  groupInsideGroupColumnIsEnabled,
  storageInsideGroupColumnIsEnabled,

  columnStorageName,
  columnInfoPanelStorageName,
  withContentSelection,
}: TableViewProps) => {
  useViewEffect({
    view: viewAs!,
    setView: (view: string) => {
      setViewAs!(view as TContactsViewAs);
    },
    currentDeviceType: currentDeviceType!,
  });
  const navigate = useNavigate();
  const location = useLocation();

  const [hideColumns, setHideColumns] = React.useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const getEnabledColumns = (): TableColumns => {
    if (contactsTab === "people") {
      return {
        typeColumnIsEnabled: typePeopleColumnIsEnabled ?? false,
        emailColumnIsEnabled: emailPeopleColumnIsEnabled ?? false,
        groupColumnIsEnabled: groupPeopleColumnIsEnabled ?? false,
        storageColumnIsEnabled: storagePeopleColumnIsEnabled ?? false,
        inviterColumnIsEnabled: false,
        invitedDateColumnIsEnabled: false,
      };
    }

    if (contactsTab === "guests") {
      return {
        typeColumnIsEnabled: false,
        emailColumnIsEnabled: emailGuestsColumnIsEnabled ?? false,
        groupColumnIsEnabled: false,
        storageColumnIsEnabled: false,
        inviterColumnIsEnabled: inviterGuestsColumnIsEnabled ?? false,
        invitedDateColumnIsEnabled: invitedDateGuestsColumnIsEnabled ?? false,
      };
    }

    return {
      typeColumnIsEnabled: typeInsideGroupColumnIsEnabled ?? false,
      emailColumnIsEnabled: emailInsideGroupColumnIsEnabled ?? false,
      groupColumnIsEnabled: groupInsideGroupColumnIsEnabled ?? false,
      storageColumnIsEnabled: storageInsideGroupColumnIsEnabled ?? false,
      inviterColumnIsEnabled: false,
      invitedDateColumnIsEnabled: false,
    };
  };

  const enabledColumns = getEnabledColumns();

  return !isUsersEmptyView ? (
    <TableContainer
      className={styles.styledTableContainer}
      noSelect={!withContentSelection}
      useReactWindow
      forwardedRef={ref as React.RefObject<HTMLDivElement>}
      data-testid="contacts_table_users_container"
    >
      <TableHeader
        // rewrite to component did update
        key={contactsTab || "people"}
        columnStorageName={columnStorageName}
        columnInfoPanelStorageName={columnInfoPanelStorageName}
        sectionWidth={sectionWidth!}
        containerRef={ref}
        setHideColumns={setHideColumns}
        navigate={navigate}
        location={location}
        {...enabledColumns}
      />
      <TableBody
        infoPanelVisible={infoPanelVisible}
        columnInfoPanelStorageName={columnInfoPanelStorageName}
        columnStorageName={columnStorageName!}
        fetchMoreFiles={fetchMoreUsers!}
        hasMoreFiles={hasMoreUsers!}
        itemCount={filterTotal!}
        filesLength={peopleList!.length}
        itemHeight={48}
        useReactWindow
        isIndexEditingMode={false}
      >
        {peopleList!.map((item, index) => (
          <TableRow
            key={item.id}
            item={item}
            isAdmin={isAdmin}
            isOwner={isOwner}
            changeUserType={changeType}
            userId={userId}
            canChangeUserType={canChangeUserType}
            hideColumns={hideColumns}
            itemIndex={index}
            setCurrentGroup={setCurrentGroup}
            {...enabledColumns}
            infoPanelVisible={infoPanelVisible}
            contactsTab={contactsTab}
          />
        ))}
      </TableBody>
    </TableContainer>
  ) : (
    <EmptyScreen />
  );
};

export default inject(
  ({
    peopleStore,
    accessRightsStore,
    settingsStore,
    infoPanelStore,
    userStore,
    tableStore,
  }: TableViewStores) => {
    const { usersStore, groupsStore, contactsHotkeysStore, viewAs, setViewAs } =
      peopleStore;

    const { setCurrentGroup } = groupsStore!;

    const {
      peopleList,

      hasMoreUsers,
      fetchMoreUsers,

      filterTotal,

      changeType,

      isUsersEmptyView,

      contactsTab,
    } = usersStore!;

    const { currentDeviceType } = settingsStore;

    const { isVisible: infoPanelVisible } = infoPanelStore;

    const { isAdmin, isOwner, id: userId } = userStore.user!;

    const { canChangeUserType } = accessRightsStore;

    const {
      typePeopleColumnIsEnabled,
      emailPeopleColumnIsEnabled,
      groupPeopleColumnIsEnabled,
      storagePeopleColumnIsEnabled,

      inviterGuestsColumnIsEnabled,
      emailGuestsColumnIsEnabled,
      invitedDateGuestsColumnIsEnabled,

      typeInsideGroupColumnIsEnabled,
      emailInsideGroupColumnIsEnabled,
      groupInsideGroupColumnIsEnabled,
      storageInsideGroupColumnIsEnabled,

      columnStorageName,
      columnInfoPanelStorageName,
    } = tableStore;

    const { withContentSelection } = contactsHotkeysStore!;

    return {
      peopleList,

      viewAs,
      setViewAs,

      isAdmin,
      isOwner,
      userId,

      changeType,
      canChangeUserType,

      isUsersEmptyView,
      contactsTab,

      infoPanelVisible,

      currentDeviceType,

      hasMoreUsers,
      fetchMoreUsers,

      filterTotal,

      setCurrentGroup,

      typePeopleColumnIsEnabled,
      emailPeopleColumnIsEnabled,
      groupPeopleColumnIsEnabled,
      storagePeopleColumnIsEnabled,

      inviterGuestsColumnIsEnabled,
      emailGuestsColumnIsEnabled,
      invitedDateGuestsColumnIsEnabled,

      typeInsideGroupColumnIsEnabled,
      emailInsideGroupColumnIsEnabled,
      groupInsideGroupColumnIsEnabled,
      storageInsideGroupColumnIsEnabled,

      columnStorageName,
      columnInfoPanelStorageName,

      withContentSelection,
    };
  },
)(observer(Table));
