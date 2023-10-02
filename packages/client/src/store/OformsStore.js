import { makeAutoObservable, runInAction } from "mobx";

import OformsFilter from "@docspace/common/api/oforms/filter";
import { submitToGallery } from "@docspace/common/api/oforms";

import {
  getCategoryById,
  getCategoryTypes,
  getCategoriesOfCategoryType,
} from "@docspace/common/api/oforms";

import { getCookie } from "@docspace/common/utils";
import { LANGUAGE } from "@docspace/common/constants";

const myDocumentsFolderId = 2;

class OformsStore {
  authStore;

  oformFiles = null;
  gallerySelected = null;
  oformsIsLoading = false;

  oformsFilter = OformsFilter.getDefault();

  oformFromFolderId = myDocumentsFolderId;

  currentCategory = null;
  // categoryIds = ["categories", "types", "compilations"];
  categoryTypeTitles = ["categorie", "type", "compilation"];

  oformLocales = ["en", "zh", "it", "fr", "es", "de", "ja"];

  submitToGalleryTileIsVisible = !localStorage.getItem(
    "submitToGalleryTileIsHidden"
  );

  constructor(authStore) {
    this.authStore = authStore;
    makeAutoObservable(this);
  }

  get defaultOformLocale() {
    const userLocale = getCookie(LANGUAGE) || "en";
    return this.oformLocales.includes(userLocale) ? userLocale : "en";
  }

  setOformFiles = (oformFiles) => (this.oformFiles = oformFiles);

  setOformsFilter = (oformsFilter) => (this.oformsFilter = oformsFilter);

  setOformsCurrentCategory = (currentCategory) =>
    (this.currentCategory = currentCategory);

  setOformFromFolderId = (oformFromFolderId) => {
    if (!oformFromFolderId) return;
    this.oformFromFolderId = oformFromFolderId;
  };

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

  getCategoryTitle = (category, locale = this.defaultOformLocale) => {
    if (!category) return "";

    const categoryType = this.categoryTypeTitles.filter(
      (categoryTitle) => !!category.attributes[categoryTitle]
    );
    const categoryTitle = category.attributes[categoryType];

    const [localizedCategory] = category.attributes.localizations?.data.filter(
      (localization) => localization.attributes.locale === locale
    );
    return localizedCategory?.attributes[categoryType] || categoryTitle;
  };

  submitToFormGallery = async (file, formName, language, signal = null) => {
    const url = this.authStore.settingsStore.formGallery.uploadUrl;
    const res = await submitToGallery(url, file, formName, language, signal);
    return res;
  };

  fetchCurrentCategory = async () => {
    const url = "https://oforms.onlyoffice.com/dashboard/api";
    const { categorizeBy, categoryId } = this.oformsFilter;
    const locale = this.defaultOformLocale;

    if (!categorizeBy || !categoryId) {
      this.setOformsCurrentCategory(null);
      return;
    }

    const fetchedCategory = await getCategoryById(
      url,
      categorizeBy,
      categoryId,
      locale
    );

    runInAction(() => {
      this.setOformsCurrentCategory(fetchedCategory);
    });
  };

  fetchCategoryTypes = async () => {
    const url = "https://oforms.onlyoffice.com/dashboard/api/menu-translations";
    const locale = this.defaultOformLocale;

    const menuItems = await getCategoryTypes(url, locale);
    // this.categoryTypeTitles = menuItems.map((item) => item.attributes.categoryTitle);
    // this.locales = menuItems.map((item) => item.attributes.categoryTitle);
    this.categoryTypeTitles = ["categorie", "type", "compilation"];
    this.oformLocales = ["en", "zh", "it", "fr", "es", "de", "ja"];

    return menuItems;
  };

  fetchCategoriesOfCategoryType = async (categoryTypeId) => {
    const url = `https://oforms.onlyoffice.com/dashboard/api/${categoryTypeId}`;

    const categories = await getCategoriesOfCategoryType(
      url,
      this.defaultOformLocale
    );
    return categories;
  };

  filterOformsByCategory = (categorizeBy, categoryId) => {
    if (!categorizeBy || !categoryId) this.currentCategory = null;

    this.oformsFilter.page = 1;
    this.oformsFilter.categorizeBy = categorizeBy;
    this.oformsFilter.categoryId = categoryId;
    const newOformsFilter = this.oformsFilter.clone();

    runInAction(() => this.getOforms(newOformsFilter));
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
    this.currentCategory = null;
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
