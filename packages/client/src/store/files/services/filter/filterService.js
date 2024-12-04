import { runInAction } from "mobx";
import { CategoryType } from "SRC_DIR/helpers/constants";

class FilterService {
  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  setFilter(filter) {
    filter.pageCount = 100;
    this.rootStore.filter = filter;
  }

  setRoomsFilter(filter) {
    filter.pageCount = 100;

    const isArchive = this.rootStore.categoryType === CategoryType.Archive;

    const key = isArchive
      ? `UserRoomsArchivedFilter=${this.rootStore.userStore.user?.id}`
      : `UserRoomsSharedFilter=${this.rootStore.userStore.user?.id}`;

    const sharedStorageFilter = JSON.parse(localStorage.getItem(key));
    if (sharedStorageFilter) {
      sharedStorageFilter.sortBy = filter.sortBy;
      sharedStorageFilter.sortOrder = filter.sortOrder;

      const value = toJSON(sharedStorageFilter);
      localStorage.setItem(key, value);
    }

    this.rootStore.roomsFilter = filter;

    runInAction(() => {
      if (filter && this.rootStore.isHidePagination) {
        this.rootStore.isHidePagination = false;
      }
    });

    runInAction(() => {
      if (filter && this.rootStore.isLoadingFilesFind) {
        this.rootStore.isLoadingFilesFind = false;
      }
    });
  }
}

export default FilterService;
