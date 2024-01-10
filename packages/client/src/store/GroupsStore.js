import { makeAutoObservable } from "mobx";
import api from "@docspace/common/api";

class GroupsStore {
  peopleStore;

  groups = [];
  currentGroup = null;

  constructor(peopleStore) {
    this.peopleStore = peopleStore;
    makeAutoObservable(this);
  }

  setCurrentGroup = (currentGroup) => {
    this.currentGroup = currentGroup;
  };

  createGroup = async (groupName, groupManager, members) => {
    const res = await api.groups.createGroup(groupName, groupManager, members);
    return res;
  };

  getGroups = async () => {
    const res = await api.groups.getGroups();
    this.groups = res;
  };

  getGroupById = async (groupId) => {
    const res = await api.groups.getGroupById(groupId);
    return res;
  };

  deleteGroup = async (id) => {
    const { filter } = this.peopleStore.filterStore;
    await api.groups.deleteGroup(id);
    const newData = this.groups.filter((g) => g.id !== id);
    this.groups = newData;
    await this.peopleStore.usersStore.getUsersList(filter);
  };

  updateGroup = async (id, groupName, groupManager, members) => {
    const res = await api.groups.updateGroup(
      id,
      groupName,
      groupManager,
      members
    );
    this.peopleStore.selectedGroupStore.resetGroup();
    await this.getGroupList();
    return Promise.resolve(res);
  };

  getGroupContextOptions = (t, options, item) => {
    const contextMenu = options.map((option) => {
      switch (option) {
        case "profile":
        // return {
        //   id: "option_profile",
        //   key: option,
        //   icon: ProfileReactSvgUrl,
        //   label: t("Common:Profile"),
        //   onClick: this.peopleStore.profileActionsStore.onProfileClick,
        // };
        default:
          return undefined;
      }
    });

    return contextMenu;
  };
}

export default GroupsStore;
