import { makeAutoObservable, runInAction } from "mobx";
import api from "@docspace/common/api";
import { OformCategoryType } from "@docspace/client/src/helpers/constants";

const { OformsFilter } = api;

import {
  getCategoryById,
  getCategoriesByBranch,
  getCategoriesByType,
  getPopularCategories,
} from "@docspace/common/api/oforms";

class OformsStore {
  authStore;

  oformFiles = null;
  oformsFilter = OformsFilter.getDefault();
  currentCategory = null;

  oformsIsLoading = false;
  gallerySelected = null;

  constructor(authStore) {
    this.authStore = authStore;
    makeAutoObservable(this);
  }

  setOformFiles = (oformFiles) => (this.oformFiles = oformFiles);
  setOformsFilter = (oformsFilter) => (this.oformsFilter = oformsFilter);
  setOformsCurrentCategory = (currentCategory) =>
    (this.currentCategory = currentCategory);
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

  fetchCurrentCategory = async () => {
    const { categorizeBy, categoryId } = this.oformsFilter;
    if (!categorizeBy || !categoryId) {
      this.setOformsCurrentCategory(null);
      return;
    }

    const fetchedCategory = await getCategoryById(categorizeBy, categoryId);

    runInAction(() => {
      this.setOformsCurrentCategory(fetchedCategory);
    });
  };

  fetchCategoriesByBranch = async () => {
    const { locale } = this.oformsFilter;
    const categoriesByBranch = await getCategoriesByBranch(locale);
    return categoriesByBranch;
  };

  fetchCategoriesByType = async () => {
    const { locale } = this.oformsFilter;
    const categoriesByType = await getCategoriesByType(locale);
    return categoriesByType;
  };

  fetchPopularCategories = async () => {
    const { locale } = this.oformsFilter;
    const popularCategories = await getPopularCategories(locale);
    return popularCategories;
  };

  filterOformsByCategory = (categorizeBy, categoryId) => {
    this.oformsFilter.page = 1;
    this.oformsFilter.categorizeBy = categorizeBy;
    this.oformsFilter.categoryId = categoryId;
    const newOformsFilter = this.oformsFilter.clone();

    runInAction(() => {
      this.getOforms(newOformsFilter);
    });
  };

  filterOformsByLocale = async (locale) => {
    if (!locale) return;

    this.oformsFilter.page = 1;
    this.oformsFilter.locale = locale;
    this.oformsFilter.categorizeBy = "";
    this.oformsFilter.categoryId = "";
    const newOformsFilter = this.oformsFilter.clone();

    runInAction(() => this.getOforms(newOformsFilter));
  };

  filterOformsBySearch = (search) => {
    this.oformsFilter.page = 1;
    this.oformsFilter.search = search;
    const newOformsFilter = this.oformsFilter.clone();

    runInAction(() => this.getOforms(newOformsFilter));
  };

  sortOforms = (sortBy, sortOrder) => {
    if (!sortBy || !sortOrder) return;

    this.oformsFilter.page = 1;
    this.oformsFilter.sortBy = sortBy;
    this.oformsFilter.sortOrder = sortOrder;
    const newOformsFilter = this.oformsFilter.clone();

    runInAction(() => this.getOforms(newOformsFilter));
  };

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
