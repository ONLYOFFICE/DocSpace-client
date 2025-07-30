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

import React, { useRef } from "react";
import { inject, observer } from "mobx-react";
import { useNavigate, useLocation } from "react-router";

import { TableBody } from "@docspace/shared/components/table";

import useViewEffect from "SRC_DIR/Hooks/useViewEffect";
import { TContactsViewAs } from "SRC_DIR/helpers/contacts";

import EmptyScreen from "../../EmptyScreen";

import TableRow from "./TableRow";
import TableHeader from "./TableHeader";

import {
  TableColumns,
  TableViewProps,
  TableViewStores,
} from "./TableView.types";
import { StyledTableContainer } from "./TableView.styled";

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
    <StyledTableContainer
      noSelect
      useReactWindow
      forwardedRef={ref as React.RefObject<HTMLDivElement>}
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
    </StyledTableContainer>
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
    const { usersStore, groupsStore, viewAs, setViewAs } = peopleStore;

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
    };
  },
)(observer(Table));
