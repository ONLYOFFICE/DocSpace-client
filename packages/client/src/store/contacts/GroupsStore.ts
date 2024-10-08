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

import { makeAutoObservable, runInAction } from "mobx";
import { TFunction } from "i18next";
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
import api from "@docspace/shared/api";
import { TGroup } from "@docspace/shared/api/groups/types";
import { openingNewTab } from "@docspace/shared/utils/openingNewTab";
import { getContactsUrl } from "./../../helpers/contacts/utils";

class GroupsStore {
  authStore;

  peopleStore;

  infoPanelStore;

  clientLoadingStore;

  groups: any[] | undefined;

  selection: TGroup[] = [];

  bufferSelection = null;

  groupName = "";

  selected = "none";

  groupsFilter = GroupsFilter.getDefault();

  isLoading = false;

  groupsIsIsLoading = false;

  insideGroupIsLoading = false;

  currentGroup: TGroup | null = null;

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
      combineUrl(window.ClientConfig?.proxy?.url, config.homepage, newPath),
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

  setGroupName = (name: string) => {
    this.groupName = name;
  };

  setIsLoading = (isLoading: boolean) => {
    this.isLoading = isLoading;
  };

  get groupsFilterTotal() {
    return this.groupsFilter.total;
  }

  get hasMoreGroups() {
    return this.groups.length < this.groupsFilterTotal;
  }

  get insideGroupFilterTotal() {
    return this.insideGroupFilter.total;
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
      combineUrl(window.ClientConfig?.proxy?.url, config.homepage, newPath),
    );
  };

  setInsideGroupFilterParams = (filter = InsideGroupFilter.getDefault()) => {
    this.setInsideGroupFilter(filter);
    this.setInsideGroupFilterUrl(filter);
  };

  setCurrentGroup = (currentGroup: TGroup | null = null) => {
    console.log("set", currentGroup);
    this.currentGroup = currentGroup;
  };

  setInsideGroupLoading = (value: boolean) => {
    this.insideGroupIsLoading = value;
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
    if (!this.hasMoreGroups || this.groupsIsIsLoading) return;
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

  getGroupById = async (groupId) => {
    const res = await groupsApi.getGroupById(groupId);
    return res;
  };

  updateCurrentGroup = async (groupId: string) => {
    const group = await groupsApi.getGroupById(groupId);

    if (group) this.setCurrentGroup(group);
  };

  setSelection = (selection: TGroup[]) => (this.selection = selection);

  setBufferSelection = (bufferSelection: any) =>
    (this.bufferSelection = bufferSelection);

  setSelected = (selected: "all" | "none") => {
    this.bufferSelection = null;
    this.selected = selected;
    this.setSelection(this.getGroupsBySelected(selected));

    this.peopleStore.contactsHotkeysStore.setHotkeyCaret(null);
    return selected;
  };

  selectAll = () => {
    this.bufferSelection = null;

    if (this.groups?.length) this.setSelection(this.groups);
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

  onDeleteClick = (name: string) => {
    this.setGroupName(name);
    this.peopleStore.dialogStore.setDeleteGroupDialogVisible(true);
  };

  onDeleteGroup = async (t, groupId) => {
    const { getIsInsideGroup, setInfoPanelSelectedGroup } = this.infoPanelStore;
    const isDeletingCurrentGroup =
      getIsInsideGroup() && this.currentGroup?.id === groupId;

    this.setIsLoading(true);

    if (!groupId) {
      this.setIsLoading(false);
      return;
    }

    try {
      await groupsApi.deleteGroup(groupId);
      toastr.success(t("PeopleTranslations:SuccessDeleteGroup"));
      this.setSelection([]);
      this.getGroups(this.groupsFilter, true);
      this.infoPanelStore.setInfoPanelSelection(null);
      this.setIsLoading(false);
      this.peopleStore.dialogStore.setDeleteGroupDialogVisible(false);

      if (isDeletingCurrentGroup) {
        setInfoPanelSelectedGroup(null);
        this.setBufferSelection(null);
        window.DocSpace.navigate(`accounts/groups`);
      }
    } catch (err) {
      toastr.error(err.message);
      console.error(err);
      this.setIsLoading(false);
      this.peopleStore.dialogStore.setDeleteGroupDialogVisible(false);
    }
  };

  onDeleteAllGroups = (t) => {
    this.setIsLoading(true);

    try {
      Promise.all(
        this.selection.map(async (group) => groupsApi.deleteGroup(group.id)),
      ).then(() => {
        toastr.success(t("PeopleTranslations:SuccessDeleteGroups"));
        this.setSelection([]);
        this.getGroups(this.groupsFilter, true);
        this.setIsLoading(false);
        this.peopleStore.dialogStore.setDeleteGroupDialogVisible(false);
      });
    } catch (err) {
      toastr.error(err.message);
      console.error(err);
      this.setIsLoading(false);
      this.peopleStore.dialogStore.setDeleteGroupDialogVisible(false);
    }
  };

  get hasGroupsToRemove() {
    if (this.peopleStore.userStore.user.isRoomAdmin) {
      return false;
    }

    const noLdapItems = this.selection.filter((item) => !item?.isLDAP);

    return noLdapItems.length > 0;
  }

  getMultipleGroupsContextOptions = (t: TFunction) => {
    const { setDeleteGroupDialogVisible } = this.peopleStore.dialogStore;

    return [
      {
        id: "info",
        key: "group-info",
        className: "group-menu_drop-down",
        label: t("Common:Info"),
        title: t("Common:Info"),
        icon: InfoReactSvgUrl,
        onClick: () => this.infoPanelStore.setIsVisible(true),
      },
      {
        key: "separator",
        isSeparator: true,
        disabled: !this.hasGroupsToRemove,
      },
      {
        id: "delete-group",
        key: "delete-group",
        className: "group-menu_drop-down",
        label: t("Common:Delete"),
        title: t("Common:Delete"),
        icon: TrashReactSvgUrl,
        onClick: () => setDeleteGroupDialogVisible(true),
        disabled: !this.hasGroupsToRemove,
      },
    ];
  };

  deleteGroup = (item: TGroup, forInsideGroup: boolean) => {
    if (forInsideGroup) {
      this.setBufferSelection(item);
    }
    this.onDeleteClick(item.name);
  };

  editGroup = (item: TGroup) => {
    const event: Event & { item?: TGroup } = new Event(Events.GROUP_EDIT);
    event.item = item;
    window.dispatchEvent(event);
  };

  getGroupContextOptions = (
    t,
    item,
    forInfoPanel = false,
    forInsideGroup = false,
  ) => {
    const { isRoomAdmin } = this.peopleStore.userStore.user;

    return [
      !isRoomAdmin &&
        !item?.isLDAP && {
          id: "edit-group",
          key: "edit-group",
          className: "group-menu_drop-down",
          label: t("PeopleTranslations:EditGroup"),
          title: t("PeopleTranslations:EditGroup"),
          icon: PencilReactSvgUrl,
          onClick: () => this.editGroup(item),
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
            if (this.selection.length < 1) {
              this.setBufferSelection(item);
            }
          } else {
            this.peopleStore.usersStore.setSelection([]);
            this.peopleStore.usersStore.setBufferSelection(null);
          }
          this.infoPanelStore.setIsVisible(true);
        },
      },
      !isRoomAdmin &&
        !item?.isLDAP && {
          key: "separator",
          isSeparator: true,
        },
      !isRoomAdmin &&
        !item?.isLDAP && {
          id: "delete-group",
          key: "delete-group",
          className: "group-menu_drop-down",
          label: t("Common:Delete"),
          title: t("Common:Delete"),
          icon: TrashReactSvgUrl,
          onClick: () => this.deleteGroup(item, forInsideGroup),
        },
    ];
  };

  getModel = (t: TFunction, item: TGroup) => {
    return this.selection.length > 1
      ? this.getMultipleGroupsContextOptions(t)
      : this.getGroupContextOptions(t, item);
  };

  openGroupAction = (
    groupId: string,
    withBackURL: boolean,
    tempTitle: string,
    e: React.MouseEvent<Element, MouseEvent>,
  ) => {
    const { setIsSectionBodyLoading, setIsSectionFilterLoading } =
      this.clientLoadingStore;

    const insideGroupUrl = getContactsUrl("inside_group", groupId);

    if (openingNewTab(insideGroupUrl, e)) return;

    this.setSelection([]);
    this.setBufferSelection(null);
    this.setCurrentGroup(null);
    this.setInsideGroupTempTitle(tempTitle);

    setIsSectionFilterLoading(true);
    setIsSectionBodyLoading(true);

    if (withBackURL) {
      const url = `${window.location.pathname}${window.location.search}`;
      this.setInsideGroupBackUrl(url);
    }

    window.DocSpace.navigate(insideGroupUrl);
  };

  updateGroup = async (
    groupId: string,
    groupName: string,
    groupManagerId: string | undefined,
    membersToAdd: string[],
    membersToRemove: string[],
  ) => {
    const {
      infoPanelSelection,
      setInfoPanelSelection,
      setInfoPanelSelectedGroup,
      getIsInsideGroup,
    } = this.peopleStore.infoPanelStore;

    try {
      const res = await groupsApi.updateGroup(
        groupId,
        groupName,
        groupManagerId,
        membersToAdd,
        membersToRemove,
      );

      if (this.groups && this.groups.length > 0) {
        this.groups = this.groups.map((g) => (g.id === groupId ? res : g));
      }

      if (getIsInsideGroup() && this.currentGroup?.id === groupId) {
        const filter = this.insideGroupFilter.clone();

        this.setCurrentGroup(res);
        const members = await api.people.getUserList(filter);
        filter.total = members.total;
        this.setInsideGroupFilter(filter);
        this.peopleStore.usersStore.setUsers(members.items);
        this.setInsideGroupTempTitle(res.name);
      }

      if (infoPanelSelection?.id === res.id) {
        setInfoPanelSelection(res);
        setInfoPanelSelectedGroup(res);
      }
    } catch (err: any) {
      toastr.error(err.message);
    }
  };

  selectGroup = (group: TGroup) => {
    this.setSelection([...this.selection, group]);
  };

  deselectGroup = (group: TGroup) => {
    const newSelection = this.selection.filter((s) => s.id !== group.id);

    this.setSelection(newSelection);
  };

  changeGroupSelection = (group: TGroup, isSelected: boolean) => {
    if (this.bufferSelection) {
      this.setBufferSelection(null);
    }

    if (isSelected) {
      this.deselectGroup(group);
    } else {
      this.selectGroup(group);
    }
  };

  selectRow = (group: TGroup) => {
    const isGroupSelected = !!this.selection.find((s) => s.id === group.id);
    const isSingleSelected = isGroupSelected && this.selection.length === 1;

    this.peopleStore.usersStore.setBufferSelection(null);

    if (this.bufferSelection) {
      this.setBufferSelection(null);
    }

    if (isSingleSelected) {
      this.deselectGroup(group);
    } else {
      this.setSelection([]);
      this.selectGroup(group);
    }
  };

  singleContextMenuAction = (group: TGroup) => {
    if (this.selection.length) {
      this.setSelection([]);
    }

    this.setBufferSelection(group);
  };

  multipleContextMenuAction = (group: TGroup) => {
    const isGroupSelected = !!this.selection.find((s) => s.id === group.id);
    const isSingleSelected = isGroupSelected && this.selection.length === 1;

    if (!isGroupSelected || isSingleSelected) {
      this.setSelection([]);
      this.setBufferSelection(group);
    }
  };

  changeGroupContextSelection = (group: TGroup, isSingleMenu: boolean) => {
    this.peopleStore.usersStore.setBufferSelection(null);

    if (isSingleMenu) {
      this.singleContextMenuAction(group);
    } else {
      this.multipleContextMenuAction(group);
    }
  };
}

export default GroupsStore;
