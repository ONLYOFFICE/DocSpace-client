import { makeAutoObservable, runInAction } from "mobx";

import OformsFilter from "@docspace/common/api/oforms/filter";
import { submitToGallery } from "@docspace/common/api/oforms";

import {
  getCategoryById,
  getCategoryFilterMenuItems,
  getCategoriesByBranch,
  getCategoriesByType,
  getPopularCategories,
} from "@docspace/common/api/oforms";
import { getDefaultOformLocale } from "@docspace/common/utils";

class OformsStore {
  authStore;

  oformFiles = null;
  oformsFilter = OformsFilter.getDefault();
  currentCategory = null;

  oformsIsLoading = false;
  gallerySelected = null;

  submitToGalleryTileIsVisible = !localStorage.getItem(
    "submitToGalleryTileIsHidden"
  );

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

  submitToFormGallery = async (file, formName, language, signal = null) => {
    const url = this.authStore.settingsStore.formGallery.uploadUrl;
    const res = await submitToGallery(url, file, formName, language, signal);
    return res;
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

  fetchCategoryFilterMenuItems = async () => {
    const url = "https://oforms.onlyoffice.com/dashboard/api/menu-translations";
    const locale = getDefaultOformLocale();
    const menuItems = await getCategoryFilterMenuItems(url, locale);
    return menuItems;
  };

  fetchCategoriesByBranch = async () => {
    const url = "https://oforms.onlyoffice.com/dashboard/api/categories";
    const { locale } = this.oformsFilter;
    const categoriesByBranch = await getCategoriesByBranch(url, locale);
    return categoriesByBranch;
  };

  fetchCategoriesByType = async () => {
    const url = "https://oforms.onlyoffice.com/dashboard/api/types";
    const { locale } = this.oformsFilter;
    const categoriesByType = await getCategoriesByType(url, locale);
    return categoriesByType;
  };

  fetchPopularCategories = async () => {
    const url = "https://oforms.onlyoffice.com/dashboard/api/compilations";
    const { locale } = this.oformsFilter;
    const popularCategories = await getPopularCategories(url, locale);
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

    this.currentCategory = null;

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

  resetFilters = () => {
    const newOformsFilter = OformsFilter.getDefault();
    runInAction(() => this.getOforms(newOformsFilter));
  };

  hideSubmitToGalleryTile = () => {
    localStorage.setItem("submitToGalleryTileIsHidden", true);
    this.submitToGalleryTileIsVisible = false;
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
