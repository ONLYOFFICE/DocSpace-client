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

import { makeAutoObservable } from "mobx";

import { TUser } from "@docspace/shared/api/people/types";
import { TGroup } from "@docspace/shared/api/groups/types";
import Filter from "@docspace/shared/api/people/filter";
import api from "@docspace/shared/api";
import { removeGroupMembers } from "@docspace/shared/api/groups";

import PeopleStore from "SRC_DIR/store/contacts/PeopleStore";

class EditGroupStore {
  isInit = false;

  group: TGroup | null = null;

  title: string = "";

  manager: TUser | null = null;

  members: TUser[] | null = null;

  addedMembersMap: Map<string, TUser> = new Map();

  removedMembersMap: Map<string, TUser> = new Map();

  initialTotal: number = 0;

  filter = Filter.getDefault();

  peopleStore: PeopleStore;

  constructor(peopleStore: PeopleStore) {
    this.peopleStore = peopleStore;

    makeAutoObservable(this);
  }

  initGroupData = async (group: TGroup) => {
    try {
      this.setGroup(group);
      this.setTitle(group.name);

      if (group.manager) {
        this.setManager(group.manager);
      }

      this.filter.group = group.id;
      this.filter.pageCount = 100;

      await this.loadMembers(0);

      this.setIsInit(true);
    } catch (e) {
      console.log(e);
    }
  };

  resetGroupData = () => {
    this.isInit = false;
    this.group = null;
    this.title = "";
    this.manager = null;
    this.members = null;
    this.addedMembersMap = new Map();
    this.removedMembersMap = new Map();
    this.initialTotal = 0;
    this.filter = Filter.getDefault();
  };

  loadMembers = async (startIndex: number) => {
    try {
      if (!this.group?.id) return;

      this.filter.page = !startIndex ? 0 : this.filter.page + 1;

      const res = await api.people.getUserList(this.filter);

      const membersWithoutManager = res.items.filter(
        (item) =>
          item.id !== this.manager?.id || item.id !== this.group?.manager?.id,
      );

      this.setInitialTotal(res.total);

      if (startIndex === 0 || !this.members) {
        this.setMembers(membersWithoutManager);
      } else {
        this.setMembers([...this.members, ...membersWithoutManager]);
      }
    } catch (e) {
      console.log(e);
    }
  };

  submitChanges = async () => {
    try {
      if (!this.group) return;

      const { updateGroup } = this.peopleStore.groupsStore!;

      const addedIds = Array.from(this.addedMembersMap.keys());
      const removedIds = Array.from(this.removedMembersMap.keys());
      const oldManager = this.group.manager;
      const oldManagerRemovedButRemainsAsMember =
        oldManager &&
        oldManager.id !== this.manager?.id &&
        !this.removedMembersMap.has(oldManager.id);

      // Requires when new group is without manager and old manager moved to members. updateGroup api method doesn't provide possibility to do it without setting new manager
      if (this.manager === null && oldManagerRemovedButRemainsAsMember) {
        await removeGroupMembers(this.group.id, [oldManager.id]);
        addedIds.push(oldManager.id);
      }

      await updateGroup(
        this.group?.id,
        this.title.trim(),
        this.manager?.id,
        addedIds,
        removedIds,
      );
    } catch (e) {
      console.log(e);
    }
  };

  addManager = (manager: TUser) => {
    this.removedMembersMap.delete(manager.id);
    const alreadyMember = manager.groups?.find((g) => g.id === this.group?.id);

    if (!alreadyMember) {
      this.addedMembersMap.set(manager.id, manager);
    }

    if (this.members?.length) {
      this.members = this.members.filter((member) => member.id !== manager.id);
    }

    this.manager = manager;
  };

  removeManager = () => {
    if (!this.manager) return;

    const wasAdded = this.addedMembersMap.delete(this.manager.id);

    if (!wasAdded) {
      this.removedMembersMap.set(this.manager.id, this.manager);
    }

    this.manager = null;
  };

  setIsInit = (value: boolean) => {
    this.isInit = value;
  };

  setGroup = (group: TGroup) => {
    this.group = group;
  };

  setTitle = (title: string) => {
    this.title = title;
  };

  setManager = (manager: TUser | null) => {
    this.manager = manager;
  };

  setMembers = (members: TUser[] | null) => {
    this.members = members;
  };

  addMembers = (members: TUser[]) => {
    members.forEach((member) => {
      const wasRemoved = this.removedMembersMap.delete(member.id);

      if (!wasRemoved) {
        this.addedMembersMap.set(member.id, member);
      }
    });

    this.members = this.members ? [...this.members, ...members] : members;
  };

  removeMember = (member: TUser) => {
    const wasAdded = this.addedMembersMap.delete(member.id);

    if (!wasAdded) {
      this.removedMembersMap.set(member.id, member);
    }

    this.members = this.members?.filter((m) => m.id !== member.id) || null;
  };

  setInitialTotal = (total: number) => {
    this.initialTotal = total;
  };

  get currentTotal() {
    let total =
      this.initialTotal +
      this.addedMembersMap.size -
      this.removedMembersMap.size;

    const prevManager = this.group?.manager;
    const newManager = this.manager;
    const managerWasChanged = prevManager?.id !== newManager?.id;

    if (prevManager && !managerWasChanged) {
      total -= 1;
    }

    if (newManager && managerWasChanged) {
      total -= 1;
    }

    return total;
  }

  get hasChanges() {
    const titleWasChanged = this.title.trim() !== this.group?.name;
    const managerWasChanged = this.group?.manager?.id !== this.manager?.id;

    return (
      titleWasChanged ||
      managerWasChanged ||
      this.addedMembersMap.size ||
      this.removedMembersMap.size
    );
  }
}

export default EditGroupStore;
