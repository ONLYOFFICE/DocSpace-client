import { makeAutoObservable } from "mobx";

import Filter from "@docspace/common/api/people/filter";
import RoomsFilter from "@docspace/common/api/rooms/filter";
import { getPortal, getPortalUsersCount } from "@docspace/common/api/portal";
import { getFilesUsedSpace } from "@docspace/common/api/files";
import toastr from "@docspace/components/toast/toastr";

const FILTER_COUNT = 5;
class StorageManagement {
  isInit = false;
  portalInfo = null;
  activeUsersCount = null;
  filesUsedSpace = {};

  constructor(filesStore, peopleStore) {
    this.filesStore = filesStore;
    this.peopleStore = peopleStore;
    makeAutoObservable(this);
  }

  init = async () => {
    const { fetchRooms } = this.filesStore;
    const { usersStore } = this.peopleStore;
    const { getUsersList } = usersStore;

    const userFilterData = Filter.getDefault();
    userFilterData.pageCount = FILTER_COUNT;

    const roomFilterData = RoomsFilter.getDefault();
    roomFilterData.pageCount = FILTER_COUNT;

    try {
      [this.portalInfo, this.activeUsersCount, this.filesUsedSpace] =
        await Promise.all([
          getPortal(),
          getPortalUsersCount(),
          getFilesUsedSpace(),
          getUsersList(userFilterData),
          fetchRooms(null, roomFilterData),
        ]);

      this.isInit = true;
    } catch (e) {
      toastr.error(e);
    }
  };
}

export default StorageManagement;
