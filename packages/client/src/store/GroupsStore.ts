import { makeAutoObservable } from "mobx";
import * as groupsApi from "@docspace/shared/api/groups";

class GroupsStore {
  peopleStore;

  groups = [];
  selection = [];
  currentGroup = null;

  constructor(peopleStore: any) {
    this.peopleStore = peopleStore;
    makeAutoObservable(this);
  }

  setCurrentGroup = (currentGroup) => (this.currentGroup = currentGroup);

  getGroups = async () => {
    const res = await groupsApi.getGroups();
    this.groups = res;
  };

  getGroupById = async (groupId) => {
    const res = await groupsApi.getGroupById(groupId);
    return res;
  };

  setSelection = (selection) => (this.selection = selection);

  addGroupToSelection = (group) =>
    (this.selection = [...this.selection, group]);

  setSelections = (added, removed, clear = false) => {
    if (clear) this.selection = [];

    console.log(added, removed);

    let newSelections = [...this.selection];

    for (let row of added) {
      if (!row) return;

      const [element] = row.getElementsByClassName("group-item");
      const groupId = element?.getAttribute("value");
      if (!groupId) return;

      const isNotSelected =
        this.selection.findIndex((g) => g.id === groupId) === -1;
      if (isNotSelected) {
        const group = this.groups.find((g) => g.id === groupId);
        newSelections.push(group);
      }
    }

    for (let row of removed) {
      if (!row) return;

      const [element] = row.getElementsByClassName("group-item");
      const groupId = element?.getAttribute("value");
      if (!groupId) return;

      const isSelected =
        newSelections.findIndex((g) => g.id === groupId) !== -1;
      if (isSelected) {
        newSelections = newSelections.filter((g) => g.id !== groupId);
      }
    }

    console.log(newSelections);
    this.setSelection(newSelections);
  };
}

export default GroupsStore;
