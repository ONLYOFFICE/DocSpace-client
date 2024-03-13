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
import { SortByFieldName } from "SRC_DIR/helpers/enums";

const FILTER_COUNT = 6;

class StorageManagement {
  isInit = false;
  portalInfo = null;
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
