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

import { inject, observer } from "mobx-react";

import useViewEffect from "SRC_DIR/Hooks/useViewEffect";
import { TContactsViewAs } from "SRC_DIR/helpers/contacts";

import EmptyScreen from "../../EmptyScreen";

import SimpleUserRow from "./SimpleUserRow";
import { StyledRowContainer } from "./RowView.styled";
import { RowViewProps, RowViewStores } from "./RowView.types";

const PeopleRowContainer = ({
  peopleList,
  sectionWidth,
  viewAs,
  setViewAs,
  fetchMoreUsers,
  hasMoreUsers,
  filterTotal,
  currentDeviceType,
  isUsersEmptyView,
  contactsTab,
  showStorageInfo,
  isDefaultUsersQuotaSet,
  isRoomAdmin,
  withContentSelection,
}: RowViewProps) => {
  useViewEffect({
    view: viewAs!,
    setView: (view: string) => {
      setViewAs!(view as TContactsViewAs);
    },
    currentDeviceType: currentDeviceType!,
  });

  return !isUsersEmptyView ? (
    <StyledRowContainer
      className="people-row-container"
      useReactWindow
      fetchMoreFiles={fetchMoreUsers!}
      hasMoreFiles={hasMoreUsers!}
      itemCount={filterTotal!}
      filesLength={peopleList!.length}
      itemHeight={58}
      onScroll={() => {}}
      noSelect={!withContentSelection}
    >
      {peopleList!.map((item, index) => (
        <SimpleUserRow
          key={item.id}
          item={item}
          itemIndex={index}
          sectionWidth={sectionWidth!}
          contactsTab={contactsTab!}
          showStorageInfo={showStorageInfo}
          isDefaultUsersQuotaSet={isDefaultUsersQuotaSet}
          isRoomAdmin={isRoomAdmin}
        />
      ))}
    </StyledRowContainer>
  ) : (
    <EmptyScreen />
  );
};

export default inject(
  ({
    peopleStore,
    settingsStore,
    currentQuotaStore,
    userStore,
  }: RowViewStores) => {
    const { usersStore, viewAs, setViewAs, contactsHotkeysStore } = peopleStore;

    const {
      peopleList,

      hasMoreUsers,
      fetchMoreUsers,

      filterTotal,

      isUsersEmptyView,
      contactsTab,
    } = usersStore!;

    const { currentDeviceType } = settingsStore;

    const { showStorageInfo, isDefaultUsersQuotaSet } = currentQuotaStore;

    const { isRoomAdmin } = userStore.user!;
    const { withContentSelection } = contactsHotkeysStore!;

    return {
      viewAs,
      setViewAs,

      peopleList,

      fetchMoreUsers,
      hasMoreUsers,
      filterTotal,
      currentDeviceType,
      isUsersEmptyView,
      contactsTab,
      showStorageInfo,
      isDefaultUsersQuotaSet,
      isRoomAdmin,
      withContentSelection,
    };
  },
)(observer(PeopleRowContainer));
