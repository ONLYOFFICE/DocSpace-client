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

import { inject, observer } from "mobx-react";

import useViewEffect from "@docspace/ui-kit/hooks/useViewEffect";
import { TContactsViewAs } from "SRC_DIR/helpers/contacts";

import { RowContainer } from "@docspace/ui-kit/components/rows";

import EmptyScreen from "../../EmptyScreen";

import SimpleUserRow from "./SimpleUserRow";
import styles from "./RowView.module.scss";
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
  isMe,
}: RowViewProps) => {
  useViewEffect({
    view: viewAs!,
    setView: (view: string) => {
      setViewAs!(view as TContactsViewAs);
    },
    currentDeviceType: currentDeviceType!,
  });

  return !isUsersEmptyView ? (
    <RowContainer
      className={`${styles.styledRowContainer} people-row-container`}
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
          isMe={isMe}
        />
      ))}
    </RowContainer>
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
      isMe: userStore.isMe,
    };
  },
)(observer(PeopleRowContainer));
