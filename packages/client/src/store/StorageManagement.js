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
import axios from "axios";

import Filter from "@docspace/shared/api/people/filter";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import { getPortal, getPortalUsersCount } from "@docspace/shared/api/portal";
import { getFilesUsedSpace } from "@docspace/shared/api/files";
import { toastr } from "@docspace/shared/components/toast";
import {
  checkRecalculateQuota,
  getQuotaSettings,
  recalculateQuota,
} from "@docspace/shared/api/settings";
import { getRooms } from "@docspace/shared/api/rooms";
import { getUserList } from "@docspace/shared/api/people";
import { SortByFieldName, RoomsProviderType } from "@docspace/shared/enums";
import { getAIAgents } from "@docspace/shared/api/ai";

const FILTER_COUNT = 6;

class StorageManagement {
  isInit = false;

  portalInfo = {};

  activeUsersCount = null;

  filesUsedSpace = {};

  quotaSettings = {};

  intervalId = null;

  rooms = [];

  accounts = [];

  aIAgents = [];

  needRecalculating = false;

  isRecalculating = false;

  userFilterData = Filter.getDefault();

  roomFilterData = RoomsFilter.getDefault();

  constructor(
    filesStore,
    peopleStore,
    authStore,
    currentQuotaStore,
    settingsStore,
  ) {
    this.filesStore = filesStore;
    this.peopleStore = peopleStore;
    this.authStore = authStore;
    this.currentQuotaStore = currentQuotaStore;
    this.settingsStore = settingsStore;
    makeAutoObservable(this);
  }

  basicRequests = async (isInit) => {
    const { getFilesListItems } = this.filesStore;
    const { usersStore } = this.peopleStore;
    const { getPeopleListItem } = usersStore;
    const { isFreeTariff } = this.currentQuotaStore;
    const { standalone } = this.settingsStore;

    this.userFilterData.pageCount = FILTER_COUNT;
    this.userFilterData.sortBy = SortByFieldName.UsedSpace;
    this.userFilterData.sortOrder = "descending";

    this.roomFilterData.pageCount = FILTER_COUNT;
    this.roomFilterData.sortBy = SortByFieldName.UsedSpace;
    this.roomFilterData.sortOrder = "descending";
    this.roomFilterData.provider = RoomsProviderType.Storage;

    const portalAbortRequests = new AbortController();
    const portalUsersCountAbortRequests = new AbortController();
    const filesUsedSpaceAbortRequests = new AbortController();
    const quotaSettingsAbortRequests = new AbortController();

    const userAbortRequests = new AbortController();
    const roomAbortRequests = new AbortController();

    const checkRecalculateQuotaAbortRequests = new AbortController();
    const recalculateQuotaAbortRequests = new AbortController();

    this.settingsStore.addAbortControllers([
      portalAbortRequests,
      portalUsersCountAbortRequests,
      filesUsedSpaceAbortRequests,
      quotaSettingsAbortRequests,

      userAbortRequests,
      roomAbortRequests,

      checkRecalculateQuotaAbortRequests,
      recalculateQuotaAbortRequests,
    ]);

    this.needRecalculating = false;

    try {
      if (isInit)
        this.needRecalculating = await checkRecalculateQuota(
          checkRecalculateQuotaAbortRequests.signal,
        );

      if (!this.needRecalculating && this.isRecalculating)
        this.setIsRecalculating(false);

      let roomsList;
      let accountsList;
      let aIAgentsList;

      const requests = [
        getPortal(portalAbortRequests.signal),
        getPortalUsersCount(portalUsersCountAbortRequests.signal),
        getFilesUsedSpace(filesUsedSpaceAbortRequests.signal),
        getQuotaSettings(quotaSettingsAbortRequests.signal),
      ];
      if (!isFreeTariff || standalone) {
        requests.push(
          getUserList(this.userFilterData, userAbortRequests.signal),
          getRooms(this.roomFilterData, roomAbortRequests.signal),
          getAIAgents(this.roomFilterData, roomAbortRequests.signal),
        );
      }

      [
        this.portalInfo,
        this.activeUsersCount,
        this.filesUsedSpace,
        this.quotaSettings,
        accountsList,
        roomsList,
        aIAgentsList,
      ] = await Promise.all(requests);

      if (roomsList) this.rooms = getFilesListItems(roomsList?.folders);

      if (aIAgentsList)
        this.aIAgents = getFilesListItems(aIAgentsList?.folders);

      if (accountsList)
        this.accounts = accountsList.items.map((user) =>
          getPeopleListItem(user),
        );

      if (!this.quotaSettings.lastRecalculateDate && isInit) {
        this.setIsRecalculating(true);

        try {
          await recalculateQuota(recalculateQuotaAbortRequests.signal);

          this.getIntervalCheckRecalculate();
        } catch (e) {
          if (axios.isCancel(e)) return;
          toastr.error(e);

          this.setIsRecalculating(false);
        }

        return;
      }

      if (this.needRecalculating) {
        this.setIsRecalculating(true);
        this.getIntervalCheckRecalculate();
      }
    } catch (e) {
      if (axios.isCancel(e)) return;
      toastr.error(e);
    }
  };

  init = async () => {
    try {
      await this.basicRequests(true);

      this.isInit = true;
    } catch (e) {
      toastr.error(e);
    }
  };

  updateQuotaInfo = async (type) => {
    const { fetchPortalQuota } = this.currentQuotaStore;
    const { getFilesListItems } = this.filesStore;
    const { usersStore } = this.peopleStore;
    const { getPeopleListItem } = usersStore;

    const userFilterData = Filter.getDefault();
    userFilterData.pageCount = FILTER_COUNT;

    const roomFilterData = RoomsFilter.getDefault();
    roomFilterData.pageCount = FILTER_COUNT;

    const requests = [fetchPortalQuota()];

    type === "user"
      ? requests.push(getUserList(userFilterData))
      : type === "agent"
        ? requests.push(getAIAgents(roomFilterData))
        : requests.push(getRooms(roomFilterData));

    try {
      const [, items] = await Promise.all(requests);

      if (type === "user") {
        this.accounts = items.items.map((user) => getPeopleListItem(user));
        return;
      }
      if (type === "agent") {
        console.log("agent", items.folders);
        this.aIAgents = getFilesListItems(items.folders);
        return;
      }

      this.rooms = getFilesListItems(items.folders);
    } catch (e) {
      toastr.error(e);
    }
  };

  setIsRecalculating = (isRecalculating) => {
    this.isRecalculating = isRecalculating;
  };

  getIntervalCheckRecalculate = () => {
    let isWaitRequest = false;

    if (this.intervalId) return;

    this.intervalId = setInterval(async () => {
      try {
        if (isWaitRequest) {
          return;
        }

        isWaitRequest = true;

        const result = await checkRecalculateQuota();
        !this.isRecalculating && this.setIsRecalculating(true);

        if (result === false) {
          this.clearIntervalCheckRecalculate();

          this.setIsRecalculating(false);

          try {
            await this.basicRequests();
          } catch (e) {
            toastr.error(e);
          }
          return;
        }

        isWaitRequest = false;
      } catch (e) {
        toastr.error(e);

        this.clearIntervalCheckRecalculate();

        this.setIsRecalculating(false);
      }
    }, 2000);
  };

  clearIntervalCheckRecalculate = () => {
    this.intervalId && clearInterval(this.intervalId);

    this.intervalId = null;
  };
}

export default StorageManagement;
