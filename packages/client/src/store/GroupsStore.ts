import { makeAutoObservable } from "mobx";
import api from "@docspace/common/api";

class GroupsStore {
  peopleStore;

  groups = [];
  selection = [];
  currentGroup = null;

  constructor(peopleStore) {
    this.peopleStore = peopleStore;
    makeAutoObservable(this);
  }

  setCurrentGroup = (currentGroup) => (this.currentGroup = currentGroup);

  getGroups = async () => {
    const res = await api.groups.getGroups();
    this.groups = res;
  };

  getGroupById = async (groupId) => {
    const res = await api.groups.getGroupById(groupId);
    return res;
  };
}

export default GroupsStore;
