import { makeAutoObservable, runInAction } from "mobx";
import api from "@docspace/common/api";

const { OformsFilter } = api;

class OformsStore {
  authStore;

  oformFiles = null;
  oformsFilter = OformsFilter.getDefault();
  oformsIsLoading = false;
  gallerySelected = null;

  constructor(authStore) {
    this.authStore = authStore;
    makeAutoObservable(this);
  }

  setOformFiles = (oformFiles) => (this.oformFiles = oformFiles);
  setOformsFilter = (oformsFilter) => (this.oformsFilter = oformsFilter);
  setOformsIsLoading = (oformsIsLoading) =>
    (this.oformsIsLoading = oformsIsLoading);
  setGallerySelected = (gallerySelected) => {
    this.gallerySelected = gallerySelected;
    this.authStore.infoPanelStore.setSelection(gallerySelected);
  };

  getOforms = async (filter = OformsFilter.getDefault()) => {
    const oformData = await this.authStore.getOforms(filter);

    const paginationData = oformData?.data?.meta?.pagination;
    if (paginationData) {
      filter.page = paginationData.page;
      filter.total = paginationData.total;
    }

    runInAction(() => {
      this.setOformsFilter(filter);
      this.setOformFiles(oformData?.data?.data ?? []);
    });
  };

  loadMoreForms = async () => {
    console.log("loadmore!!");
    if (!this.hasMoreForms || this.oformsIsLoading) return;
    this.setOformsIsLoading(true);

    const newOformsFilter = this.oformsFilter.clone();
    newOformsFilter.page += 1;

    const oformData = await this.authStore.getOforms(newOformsFilter, true);
    const newForms = oformData?.data?.data ?? [];

    runInAction(() => {
      this.setOformsFilter(newOformsFilter);
      this.setOformFiles([...this.oformFiles, ...newForms]);
      this.setOformsIsLoading(false);
    });
  };

  filterOformsByCategory = (categorizeBy, categoryId) => {
    console.log(categorizeBy, categoryId);
    if (!categorizeBy || !categoryId) return;

    const newOformsFilter = this.oformsFilter.clone();
    newOformsFilter.page = 1;
    newOformsFilter.categorizeBy = categorizeBy;
    newOformsFilter.categoryId = categoryId;

    runInAction(() => {
      this.getOforms(newOformsFilter);
    });
  };

  sortOforms = (sortBy, sortOrder) => {
    if (!sortBy) return;

    const newOformsFilter = this.oformsFilter.clone();
    newOformsFilter.page = 1;
    newOformsFilter.sortBy = sortBy;
    newOformsFilter.sortOrder = sortOrder;

    runInAction(() => {
      this.getOforms(newOformsFilter);
    });
  };

  filterByCategory = async () => {};

  get hasGalleryFiles() {
    return this.oformFiles && !!this.oformFiles.length;
  }

  get oformsFilterTotal() {
    return this.oformsFilter.total;
  }

  get hasMoreForms() {
    return this.oformFiles.length < this.oformsFilterTotal;
  }
}

export default OformsStore;
