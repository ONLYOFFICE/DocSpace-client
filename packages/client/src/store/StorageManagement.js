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

import { makeAutoObservable } from "mobx";

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
import { SortByFieldName } from "SRC_DIR/helpers/constants";

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
    const requests = [
      getPortal(),
      getPortalUsersCount(),
      getFilesUsedSpace(),
      getQuotaSettings(),
    ];

    if (!isFreeTariff || standalone) {
      requests.push(
        getUserList(this.userFilterData),
        getRooms(this.roomFilterData),
      );
    }

    try {
      if (isInit) this.needRecalculating = await checkRecalculateQuota();

      let roomsList, accountsList;
      [
        this.portalInfo,
        this.activeUsersCount,
        this.filesUsedSpace,
        this.quotaSettings,
        accountsList,
        roomsList,
      ] = await Promise.all(requests);

      if (roomsList) this.rooms = getFilesListItems(roomsList?.folders);

      if (accountsList)
        this.accounts = accountsList.items.map((user) =>
          getPeopleListItem(user),
        );

      if (!this.quotaSettings.lastRecalculateDate && isInit) {
        await recalculateQuota();
        this.getIntervalCheckRecalculate();
        return;
      }

      if (this.needRecalculating) this.getIntervalCheckRecalculate();
    } catch (e) {
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
    const { getTenantExtra } = this.authStore;
    const { getFilesListItems } = this.filesStore;
    const { usersStore } = this.peopleStore;
    const { getPeopleListItem } = usersStore;

    const userFilterData = Filter.getDefault();
    userFilterData.pageCount = FILTER_COUNT;

    const roomFilterData = RoomsFilter.getDefault();
    roomFilterData.pageCount = FILTER_COUNT;

    const requests = [getTenantExtra()];

    type === "user"
      ? requests.push(getUserList(userFilterData))
      : requests.push(getRooms(roomFilterData));

    try {
      const [, items] = await Promise.all(requests);

      if (type === "user") {
        this.accounts = items.items.map((user) => getPeopleListItem(user));
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
