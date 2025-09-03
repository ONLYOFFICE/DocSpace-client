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

import { makeAutoObservable, runInAction } from "mobx";
import { TFunction } from "i18next";

import * as groupsApi from "@docspace/shared/api/groups";
import GroupsFilter from "@docspace/shared/api/groups/filter";
import { TGroup } from "@docspace/shared/api/groups/types";
import { toastr } from "@docspace/shared/components/toast";
import { openingNewTab } from "@docspace/shared/utils/openingNewTab";
import { UserStore } from "@docspace/shared/store/UserStore";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { Nullable } from "@docspace/shared/types";
import {
  getUserFilter,
  setUserFilter,
} from "@docspace/shared/utils/userFilterUtils";
import { FILTER_GROUPS } from "@docspace/shared/utils/filterConstants";
import SocketHelper, { SocketEvents } from "@docspace/shared/utils/socket";

import api from "@docspace/shared/api";

import PencilReactSvgUrl from "PUBLIC_DIR/images/pencil.react.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/trash.react.svg?url";
import InfoReactSvgUrl from "PUBLIC_DIR/images/info.outline.react.svg?url";

import {
  editGroup,
  getContactsUrl,
  setContactsGroupsFilterUrl,
} from "SRC_DIR/helpers/contacts";
import { showInfoPanel } from "SRC_DIR/helpers/info-panel";

import ClientLoadingStore from "../ClientLoadingStore";

import DialogStore from "./DialogStore";

class GroupsStore {
  groups: TGroup[] = [];

  selection: TGroup[] = [];

  bufferSelection: Nullable<TGroup> = null;

  groupName = "";

  selected: "all" | "none" = "none";

  groupsFilter = GroupsFilter.getDefault();

  isLoading = false;

  groupsIsIsLoading = false;

  isGroupsFetched = false;

  currentGroup: TGroup | null = null;

  insideGroupBackUrl: string | null = null;

  insideGroupTempTitle: string | null = null;

  abortController: Nullable<AbortController> = null;

  constructor(
    public peopleStore: TStore["peopleStore"],
    public clientLoadingStore: ClientLoadingStore,
    public userStore: UserStore,
    public settingsStore: SettingsStore,
    public dialogStore: DialogStore,
  ) {
    this.peopleStore = peopleStore;
    this.clientLoadingStore = clientLoadingStore;
    this.userStore = userStore;
    this.settingsStore = settingsStore;
    this.dialogStore = dialogStore;

    makeAutoObservable(this);

    SocketHelper.on(
      SocketEvents.AddGroup,
      async (value: { id: string; data: any }) => {
        const { contactsTab } = this.peopleStore.usersStore;

        if (contactsTab !== "groups") return;

        const { id, data } = value;

        if (!data || !id) return;

        const group = await api.groups.getGroupById(id, true);

        runInAction(() => {
          const idx = this.groups.findIndex((x) => x.id === group.id);

          if (idx !== -1) {
            runInAction(() => {
              this.groups[idx] = group;
              this.updateSelection();
            });
            return;
          }

          this.groups = [group, ...this.groups];
          this.groupsFilter.total += 1;
        });
      },
    );

    SocketHelper.on(
      SocketEvents.UpdateGroup,
      async (value: { id: string; data: any }) => {
        const { contactsTab } = this.peopleStore.usersStore;

        const { id, data } = value;

        if (!data || !id) return;

        const idx = this.groups.findIndex((x) => x.id === id);

        if (idx === -1) return;

        const group = await api.groups.getGroupById(id, true);

        if (contactsTab !== "groups") {
          if (this.currentGroup?.id !== group.id) return;

          this.currentGroup = group;
          return;
        }

        runInAction(() => {
          this.groups[idx] = group;

          this.updateSelection();
        });
      },
    );

    SocketHelper.on(SocketEvents.DeleteGroup, (id: string) => {
      const { contactsTab } = this.peopleStore.usersStore;

      if (contactsTab !== "groups") {
        if (this.currentGroup?.id !== id) return;

        window.DocSpace.navigate("/accounts/groups/filter");
        return;
      }

      runInAction(() => {
        this.groups = this.groups.filter((x) => x.id !== id);
        this.groupsFilter.total -= 1;
        this.updateSelection();
      });
    });
  }

  setIsGroupsFetched = (isGroupsFetched: boolean) => {
    this.isGroupsFetched = isGroupsFetched;
  };

  // Groups Filter

  setGroupsFilter = (filter = GroupsFilter.getDefault()) => {
    const key = `${FILTER_GROUPS}=${this.userStore.user!.id}`;

    const value = {
      sortBy: filter.sortBy,
      pageCount: filter.pageCount,
      sortOrder: filter.sortOrder,
    };

    setUserFilter(key, value);

    this.groupsFilter = filter;
  };

  setFilterParams = (filter = GroupsFilter.getDefault()) => {
    setContactsGroupsFilterUrl(filter);
    this.setGroupsFilter(filter);
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
    if (this.clientLoadingStore.isLoading || this.groupsIsIsLoading)
      return false;

    return this.groups.length < this.groupsFilterTotal;
  }

  get groupsIsFiltered() {
    if (this.groupsFilter.search !== "") return true;
    if (this.groupsFilter.userId !== null) return true;
    return false;
  }

  setCurrentGroup = (currentGroup: TGroup | null = null) => {
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
    this.abortController?.abort();

    this.abortController = new AbortController();

    this.clientLoadingStore.setIsSectionBodyLoading(true);
    const filterData = filter ? filter.clone() : GroupsFilter.getDefault();

    this.setSelection([]);
    this.setBufferSelection(null);

    if (withFilterLocalStorage) {
      const filterObj = getUserFilter(
        `${FILTER_GROUPS}=${this.userStore.user?.id}`,
      );

      if (filterObj?.sortBy) filterData.sortBy = filterObj.sortBy;
      if (filterObj?.pageCount) filterData.pageCount = filterObj.pageCount;
      if (filterObj?.sortOrder) filterData.sortOrder = filterObj.sortOrder;
    }

    const isCustomCountPage =
      filter && filter.pageCount !== 100 && filter.pageCount !== 25;

    if (!isCustomCountPage) {
      filterData.page = 0;
      filterData.pageCount = 100;
    }

    const res = await groupsApi.getGroups(
      filterData,
      this.abortController?.signal,
    );
    filterData.total = res.total;

    this.setIsGroupsFetched(true);

    if (updateFilter) this.setFilterParams(filterData);

    this.clientLoadingStore.setIsLoading("body", false);
    this.clientLoadingStore.setIsLoading("header", false);

    runInAction(() => {
      this.groups = res.items || [];
      this.abortController = null;
    });
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

  updateCurrentGroup = async (groupId: string) => {
    const group = await groupsApi.getGroupById(groupId);

    if (group) this.setCurrentGroup(group);
  };

  setSelection = (selection: TGroup[]) => (this.selection = selection);

  setBufferSelection = (bufferSelection: Nullable<TGroup>) => {
    this.bufferSelection = bufferSelection;
  };

  setSelected = (selected: "all" | "none") => {
    const { hotkeyCaret, setHotkeyCaret } =
      this.peopleStore.contactsHotkeysStore!;

    this.bufferSelection = null;
    this.selected = selected;

    setHotkeyCaret(this.selection.at(-1) ?? hotkeyCaret);
    this.setSelection(this.getGroupsBySelected(selected));

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

  setSelections = (added: Element[], removed: Element[], clear = false) => {
    if (clear) this.selection = [];

    let newSelections: TGroup[] = [...this.selection];

    added.forEach((row) => {
      if (!row) return;

      const [element] = row.getElementsByClassName("group-item");
      const value = element?.getAttribute("value");

      if (!value) return;

      const splitValue = value.split("_");
      const groupId = splitValue.slice(1, -3).join("_");

      if (!groupId) return;

      const isNotSelected =
        this.selection.findIndex((g) => g.id === groupId) === -1;
      if (isNotSelected) {
        const group = this.groups.find((g) => g.id === groupId);
        if (group) newSelections.push(group);
      }
    });

    removed.forEach((row) => {
      if (!row) return;

      const [element] = row.getElementsByClassName("group-item");
      const value = element?.getAttribute("value");

      if (!value) return;

      const splitValue = value.split("_");
      const groupId = splitValue.slice(1, -3).join("_");

      if (!groupId) return;

      const isSelected =
        newSelections.findIndex((g) => g.id === groupId) !== -1;
      if (isSelected) {
        newSelections = newSelections.filter((g) => g.id !== groupId);
      }
    });

    this.setSelection(newSelections);
  };

  updateSelection = () => {
    if (this.bufferSelection) {
      this.bufferSelection =
        this.groups.find((g) => g.id === this.bufferSelection?.id) ?? null;
    }

    if (this.selection) {
      this.selection = this.selection
        .map((g) => this.groups.find((g2) => g2.id === g.id) ?? null)
        .filter(Boolean) as TGroup[];
    }
  };

  onDeleteClick = (name: string) => {
    this.setGroupName(name);
    this.dialogStore.setDeleteGroupDialogVisible(true);
  };

  onDeleteGroup = async (t: TFunction, groupId: string) => {
    const isDeletingCurrentGroup =
      this.peopleStore.usersStore!.contactsTab === "inside_group" &&
      this.currentGroup?.id === groupId;

    this.setIsLoading(true);

    if (!groupId) {
      this.setIsLoading(false);
      return;
    }

    try {
      await groupsApi.deleteGroup(groupId);
      toastr.success(
        t(
          "PeopleTranslations:SuccessDeleteGroup",
        ) as unknown as React.ReactNode,
      );
      this.setSelection([]);
      this.getGroups(this.groupsFilter, true);
      this.setIsLoading(false);
      this.dialogStore.setDeleteGroupDialogVisible(false);

      if (isDeletingCurrentGroup) {
        this.setBufferSelection(null);
        window.DocSpace.navigate(`accounts/groups`);
      }
    } catch (err) {
      toastr.error((err as unknown as { message: string }).message);
      this.setIsLoading(false);
      this.dialogStore.setDeleteGroupDialogVisible(false);
    }
  };

  onDeleteAllGroups = (t: TFunction) => {
    this.setIsLoading(true);

    try {
      Promise.all(
        this.selection.map(async (group) => groupsApi.deleteGroup(group.id)),
      ).then(() => {
        toastr.success(
          t(
            "PeopleTranslations:SuccessDeleteGroups",
          ) as unknown as React.ReactNode,
        );
        this.setSelection([]);
        this.getGroups(this.groupsFilter, true);
        this.setIsLoading(false);
        this.dialogStore.setDeleteGroupDialogVisible(false);
      });
    } catch (err) {
      toastr.error((err as unknown as { message: string }).message);
      this.setIsLoading(false);
      this.dialogStore.setDeleteGroupDialogVisible(false);
    }
  };

  get hasGroupsToRemove() {
    if (this.userStore.user!.isRoomAdmin) {
      return false;
    }

    const noLdapItems = this.selection.filter((item) => !item?.isLDAP);

    return noLdapItems.length > 0;
  }

  getMultipleGroupsContextOptions = (t: TFunction) => {
    const { setDeleteGroupDialogVisible } = this.dialogStore;

    return [
      {
        id: "info",
        key: "group-info",
        className: "group-menu_drop-down",
        label: t("Common:Info"),
        title: t("Common:Info"),
        icon: InfoReactSvgUrl,
        onClick: showInfoPanel,
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

  getGroupContextOptions = (
    t: TFunction,
    item: TGroup,
    forInfoPanel = false,
    forInsideGroup = false,
  ) => {
    const { isRoomAdmin, isCollaborator } = this.userStore.user!;

    const options = [];

    if (!isRoomAdmin && !isCollaborator && !item?.isLDAP)
      options.push({
        id: "edit-group",
        key: "edit-group",
        className: "group-menu_drop-down",
        label: t("PeopleTranslations:EditGroup"),
        title: t("PeopleTranslations:EditGroup"),
        icon: PencilReactSvgUrl,
        onClick: () => editGroup(item),
      });

    if (!forInfoPanel)
      options.push({
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
            this.peopleStore.usersStore!.setSelection([]);
            this.peopleStore.usersStore!.setBufferSelection(null);
          }
          showInfoPanel();
        },
      });

    if (!isRoomAdmin && !isCollaborator && !item?.isLDAP) {
      options.push({
        key: "separator",
        isSeparator: true,
      });
      options.push({
        id: "delete-group",
        key: "delete-group",
        className: "group-menu_drop-down",
        label: t("Common:Delete"),
        title: t("Common:Delete"),
        icon: TrashReactSvgUrl,
        onClick: () => this.deleteGroup(item, forInsideGroup),
      });
    }

    return options as ContextMenuModel[];
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
    e?: React.MouseEvent<Element, MouseEvent>,
  ) => {
    const { setIsSectionBodyLoading } = this.clientLoadingStore;

    const insideGroupUrl = getContactsUrl("inside_group", groupId);

    if (openingNewTab(insideGroupUrl, e)) return;

    this.setSelection([]);
    this.setBufferSelection(null);
    this.setCurrentGroup(null);
    this.setInsideGroupTempTitle(tempTitle);

    setIsSectionBodyLoading(true, false);

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

      if (
        this.peopleStore.usersStore!.contactsTab === "inside_group" &&
        this.currentGroup?.id === groupId
      ) {
        this.setCurrentGroup(res);
        this.setInsideGroupTempTitle(res.name);
        this.peopleStore.usersStore!.getUsersList();
      }
    } catch (err: unknown) {
      toastr.error((err as { message: string }).message);
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

    this.peopleStore.usersStore!.setBufferSelection(null);

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
    this.peopleStore.usersStore!.setBufferSelection(null);

    if (isSingleMenu) {
      this.singleContextMenuAction(group);
    } else {
      this.multipleContextMenuAction(group);
    }
  };
}

export default GroupsStore;
