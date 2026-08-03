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

import { makeAutoObservable } from "mobx";

import { TUser } from "@docspace/shared/api/people/types";
import { TGroup } from "@docspace/shared/api/groups/types";
import Filter from "@docspace/shared/api/people/filter";
import api from "@docspace/shared/api";

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
        await api.groups.removeGroupMembers(this.group.id, [oldManager.id]);
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
