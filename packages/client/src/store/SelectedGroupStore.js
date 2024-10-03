// (c) Copyright Ascensio System SIA 2009-2024
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

import { action, computed, makeObservable, observable } from "mobx";
import { getGroup } from "@docspace/shared/api/groups";

class SelectedGroupStore {
  selectedGroup = null;
  targetedGroup = null;

  constructor(peopleStore) {
    this.peopleStore = peopleStore;
    makeObservable(this, {
      selectedGroup: observable,
      targetedGroup: observable,
      setSelectedGroup: action,
      setTargetedGroup: action,
      resetGroup: action,
      selectGroup: action,
      group: computed,
      isEmptyGroup: computed,
    });
  }

  selectGroup = (groupId) => {
    const { clearSelection } = this.peopleStore.usersStore;
    const { getUsersList, filter } = this.peopleStore.usersStore;

    let newFilter = filter.clone();
    newFilter.group = groupId;

    clearSelection();
    getUsersList(newFilter);
  };

  setSelectedGroup = (groupId) => {
    this.selectedGroup = groupId;
  };

  setTargetedGroup = async (groupId) => {
    const res = await getGroup(groupId);
    this.targetedGroup = res;
  };

  resetGroup = () => {
    return (this.targetedGroup = null);
  };

  get group() {
    const { groups } = this.peopleStore.groupsStore;
    return groups.find((g) => g.id === this.selectedGroup);
  }

  get isEmptyGroup() {
    const { groups } = this.peopleStore.groupsStore;
    const { filter } = this.peopleStore.usersStore;

    const { group, search, role, activationStatus, employeeStatus } = filter;

    let countMembers;
    groups.filter(async (el) => {
      if (el.id === group) {
        if (!el.members) {
          const currGroup = await getGroup(el.id);
          countMembers = currGroup.members.length; // TODO: simplify after fixing server issues with getGroupListFull
        } else {
          countMembers = el.members.length;
        }
      }
    });

    const filterIsClear =
      !search && !role && !activationStatus && !employeeStatus;

    if (countMembers === 0 && filterIsClear && group) return true;
    return false;
  }
}

export default SelectedGroupStore;
