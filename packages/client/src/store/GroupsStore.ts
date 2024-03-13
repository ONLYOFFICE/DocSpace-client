import { makeAutoObservable, runInAction } from "mobx";
import * as groupsApi from "@docspace/shared/api/groups";
import { Events } from "@docspace/shared/enums";
import { toastr } from "@docspace/shared/components/toast";
import Filter from "@docspace/shared/api/groups/filter";
import InsideGroupFilter from "@docspace/shared/api/people/filter";
import GroupsFilter from "@docspace/shared/api/groups/filter";
import PencilReactSvgUrl from "PUBLIC_DIR/images/pencil.react.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/trash.react.svg?url";
import InfoReactSvgUrl from "PUBLIC_DIR/images/info.outline.react.svg?url";
import config from "PACKAGE_FILE";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import AccountsFilter from "@docspace/shared/api/people/filter";
import api from "@docspace/shared/api";

class GroupsStore {
  authStore;

  peopleStore;

  infoPanelStore;

  clientLoadingStore;

  groups: any[] | undefined;

  selection = [];

  bufferSelection = null;

  selected = "none";

  groupsFilter = GroupsFilter.getDefault();

  groupsIsIsLoading = false;

  currentGroup = null;

  insideGroupFilter = InsideGroupFilter.getDefault();

  insideGroupBackUrl: string | null = null;

  insideGroupTempTitle: string | null = null;

  constructor(
    authStore: any,
    peopleStore: any,
    infoPanelStore: any,
    clientLoadingStore: any,
  ) {
    this.authStore = authStore;
    this.peopleStore = peopleStore;
    this.infoPanelStore = infoPanelStore;
    this.clientLoadingStore = clientLoadingStore;
    makeAutoObservable(this);
  }

  // Groups Filter

  setGroupsFilter = (filter = GroupsFilter.getDefault()) => {
    const key = `GroupsFilter=${this.peopleStore.userStore.user.id}`;
    const value = `${filter.sortBy},${filter.pageCount},${filter.sortOrder}`;
    localStorage.setItem(key, value);

    this.groupsFilter = filter;
  };

  setGroupsFilterUrl = (filter = GroupsFilter.getDefault()) => {
    const urlFilter = filter.toUrlParams();

    const newPath = combineUrl(`/accounts/groups/filter?${urlFilter}`);
    const currentPath = window.location.pathname + window.location.search;

    if (currentPath === newPath) return;

    window.history.replaceState(
      "",
      "",
      combineUrl(window.DocSpaceConfig?.proxy?.url, config.homepage, newPath),
    );
  };

  setFilterParams = (filter = GroupsFilter.getDefault()) => {
    this.setGroupsFilterUrl(filter);
    this.setGroupsFilter(filter);
  };

  resetGroupsFilter = () => {
    const filter = GroupsFilter.getDefault();

    window.DocSpace.navigate(`accounts/groups/filter?${filter.toUrlParams()}`);
  };

  get groupsFilterTotal() {
    return this.groupsFilter.total;
  }

  get hasMoreGroups() {
    return this.groups.length < this.groupsFilterTotal;
  }

  get groupsIsFiltered() {
    if (this.groupsFilter.search !== "") return true;
    if (this.groupsFilter.userId !== null) return true;
    return false;
  }

  // Inside Group Filter

  setInsideGroupFilter = (filter) => {
    const key = `InsideGroupFilter=${this.peopleStore.userStore.user.id}`;
    const value = `${filter.sortBy},${filter.pageCount},${filter.sortOrder}`;
    localStorage.setItem(key, value);

    this.insideGroupFilter = filter;
  };

  setInsideGroupFilterUrl = (filter = InsideGroupFilter.getDefault()) => {
    if (!filter.group) return;
    const urlFilter = filter.toUrlParams();

    const newPath = combineUrl(
      `/accounts/groups/${filter.group}/filter?${urlFilter}`,
    );
    const currentPath = window.location.pathname + window.location.search;

    if (currentPath === newPath) return;

    window.history.replaceState(
      "",
      "",
      combineUrl(window.DocSpaceConfig?.proxy?.url, config.homepage, newPath),
    );
  };

  setInsideGroupFilterParams = (filter = InsideGroupFilter.getDefault()) => {
    this.setInsideGroupFilter(filter);
    this.setInsideGroupFilterUrl(filter);
  };

  resetInsideGroupFilter = () => {
    const groupId = this.currentGroup?.id;
    if (!groupId) return;

    const filter = InsideGroupFilter.getDefault();
    filter.group = groupId;

    window.DocSpace.navigate(
      `/accounts/groups/${groupId}/filter?${filter.toUrlParams()}`,
    );
  };

  setCurrentGroup = (currentGroup = null) => {
    this.currentGroup = currentGroup;
  };

  setInsideGroupBackUrl = (url: string) => {
    this.insideGroupBackUrl = url;
  };

  setInsideGroupTempTitle = (title: string | null) => {
    this.insideGroupTempTitle = title;
  };

  getGroups = async (
    filter = GroupsFilter.getDefault(),
    updateFilter = false,
    withFilterLocalStorage = false,
  ) => {
    this.clientLoadingStore.setIsSectionBodyLoading(true);
    const filterData = filter ? filter.clone() : Filter.getDefault();

    const filterStorageItem = localStorage.getItem(
      `GroupsFilter=${this.peopleStore.userStore.user?.id}`,
    );

    if (filterStorageItem && withFilterLocalStorage) {
      const splitFilter = filterStorageItem.split(",");
      filterData.sortBy = splitFilter[0];
      filterData.pageCount = +splitFilter[1];
      filterData.sortOrder = splitFilter[2];
    }

    if (!this.authStore.settingsStore.withPaging) {
      const isCustomCountPage =
        filter && filter.pageCount !== 100 && filter.pageCount !== 25;

      if (!isCustomCountPage) {
        filterData.page = 0;
        filterData.pageCount = 100;
      }
    }

    const res = await groupsApi.getGroups(filterData);
    filterData.total = res.total;

    if (updateFilter) this.setFilterParams(filterData);

    this.clientLoadingStore.setIsSectionBodyLoading(false);
    this.groups = res.items || [];
  };

  fetchMoreGroups = async () => {
    if (!this.hasMoreAccounts || this.groupsIsIsLoading) return;
    this.groupsIsIsLoading = true;

    const newFilter = this.groupsFilter.clone();
    newFilter.page += 1;
    this.setFilterParams(newFilter);

    const res = await groupsApi.getGroups(newFilter);

    runInAction(() => {
      this.groups = [...this.groups, ...res.items];
      this.groupsFilter = newFilter;
      this.groupsIsIsLoading = false;
    });
  };

  get hasMoreAccounts() {
    return this.groups.length < this.groupsFilter.total;
  }

  getGroupById = async (groupId) => {
    const res = await groupsApi.getGroupById(groupId);
    return res;
  };

  fetchGroup = async (
    groupId,
    filter,
    updateFilter = false,
    withFilterLocalStorage = false,
  ) => {
    const filterData = filter ? filter.clone() : AccountsFilter.getDefault();
    filterData.group = groupId;

    if (!this.authStore.settingsStore.withPaging) {
      filterData.page = 0;
      filterData.pageCount = 100;
    }

    const filterStorageItem = localStorage.getItem(
      `InsideGroupFilter=${this.peopleStore.userStore.user?.id}`,
    );

    if (filterStorageItem && withFilterLocalStorage) {
      const splitFilter = filterStorageItem.split(",");

      filterData.sortBy = splitFilter[0];
      filterData.pageCount = +splitFilter[1];
      filterData.sortOrder = splitFilter[2];
    }

    const requests = [];

    requests.push(api.people.getUserList(filterData));

    if (groupId !== this.currentGroup?.id) {
      requests.push(groupsApi.getGroupById(groupId));
    }

    const [filteredMembersRes, group] = await Promise.all(requests);
    filterData.total = filteredMembersRes.total;

    group && this.setCurrentGroup(group);
    this.peopleStore.usersStore.setUsers(filteredMembersRes.items);

    if (updateFilter) {
      this.setInsideGroupFilterParams(filterData);
    }

    return Promise.resolve(filteredMembersRes.items);
  };

  setSelection = (selection) => (this.selection = selection);

  setBufferSelection = (bufferSelection: any) =>
    (this.bufferSelection = bufferSelection);

  setSelected = (selected: "all" | "none") => {
    this.bufferSelection = null;
    this.selected = selected;
    this.setSelection(this.getGroupsBySelected(selected));
    return selected;
  };

  getGroupsBySelected = (selected: "all" | "none") => {
    if (selected === "all" && this.groups) return [...this.groups];
    return [];
  };

  setSelections = (added, removed, clear = false) => {
    if (clear) this.selection = [];

    let newSelections = [...this.selection];

    // eslint-disable-next-line no-restricted-syntax
    for (const row of added) {
      if (!row) return;

      const [element] = row.getElementsByClassName("group-item");
      const value = element?.getAttribute("value");

      const splitValue = value && value.split("_");
      const groupId = splitValue.slice(1, -3).join("_");

      if (!groupId) return;

      const isNotSelected =
        this.selection.findIndex((g) => g.id === groupId) === -1;
      if (isNotSelected) {
        const group = this.groups.find((g) => g.id === groupId);
        newSelections.push(group);
      }
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const row of removed) {
      if (!row) return;

      const [element] = row.getElementsByClassName("group-item");
      const value = element?.getAttribute("value");

      const splitValue = value && value.split("_");
      const groupId = splitValue.slice(1, -3).join("_");
      if (!groupId) return;

      const isSelected =
        newSelections.findIndex((g) => g.id === groupId) !== -1;
      if (isSelected) {
        newSelections = newSelections.filter((g) => g.id !== groupId);
      }
    }

    this.setSelection(newSelections);
  };

  getGroupContextOptions = (
    t,
    item,
    forInfoPanel = false,
    forInsideGroup = false,
  ) => {
    return [
      {
        id: "edit-group",
        key: "edit-group",
        className: "group-menu_drop-down",
        label: t("PeopleTranslations:EditGroup"),
        title: t("PeopleTranslations:EditGroup"),
        icon: PencilReactSvgUrl,
        onClick: () => {
          const event = new Event(Events.GROUP_EDIT);
          event.item = item;
          window.dispatchEvent(event);
        },
      },
      !forInfoPanel && {
        id: "info",
        key: "group-info",
        className: "group-menu_drop-down",
        label: t("Common:Info"),
        title: t("Common:Info"),
        icon: InfoReactSvgUrl,
        onClick: () => {
          if (!forInsideGroup) {
            this.selection = [item];
          } else {
            this.peopleStore.selectionStore.setSelection([]);
            this.peopleStore.selectionStore.setBufferSelection(null);
          }
          this.infoPanelStore.setIsVisible(true);
        },
      },
      {
        key: "separator",
        isSeparator: true,
      },
      {
        id: "delete-group",
        key: "delete-group",
        className: "group-menu_drop-down",
        label: t("Common:Delete"),
        title: t("Common:Delete"),
        icon: TrashReactSvgUrl,
        onClick: async () => {
          const groupId = item.id;
          groupsApi
            .deleteGroup(groupId)!
            .then(() => {
              toastr.success(t("PeopleTranslations:SuccessDeleteGroup"));
              this.setSelection([]);
              this.getGroups(this.groupsFilter, true);
              this.infoPanelStore.setInfoPanelSelection(null);
            })
            .catch((err) => {
              toastr.error(err.message);
              console.error(err);
            });
        },
      },
    ];
  };

  clearInsideGroup = () => {
    this.currentGroup = null;
    this.insideGroupBackUrl = null;
    this.insideGroupTempTitle = null;
    this.peopleStore.usersStore.setUsers([]);
  };

  openGroupAction = (
    groupId: string,
    withBackURL: boolean,
    tempTitle: string,
  ) => {
    this.setCurrentGroup(null);
    this.setInsideGroupTempTitle(tempTitle);

    if (withBackURL) {
      const url = `${window.location.pathname}${window.location.search}`;
      this.setInsideGroupBackUrl(url);
    }

    window.DocSpace.navigate(`/accounts/groups/${groupId}`);
  };
}

export default GroupsStore;
