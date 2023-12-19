import { makeAutoObservable, runInAction } from "mobx";

import OformsFilter from "@docspace/common/api/oforms/filter";
import { submitToGallery } from "@docspace/common/api/oforms";

import {
  getOformLocales,
  getOforms,
  getCategoryById,
  getCategoryTypes,
  getCategoriesOfCategoryType,
} from "@docspace/common/api/oforms";
import toastr from "@docspace/components/toast/toastr";

import { combineUrl, convertToLanguage } from "@docspace/common/utils";
import { LANGUAGE } from "@docspace/common/constants";
import { getCookie } from "@docspace/components/utils/cookie";

const myDocumentsFolderId = 2;

class OformsStore {
  authStore;

  oformFiles = null;
  gallerySelected = null;
  oformsIsLoading = false;
  oformsLoadError = false;

  oformsFilter = OformsFilter.getDefault();

  oformFromFolderId = myDocumentsFolderId;

  currentCategory = null;
  categoryTitles = [];

  oformLocales = null;
  filterOformsByLocaleIsLoading = false;
  categoryFilterLoaded = false;
  languageFilterLoaded = false;
  oformFilesLoaded = false;

  submitToGalleryTileIsVisible = !localStorage.getItem(
    "submitToGalleryTileIsHidden"
  );

  constructor(authStore) {
    this.authStore = authStore;
    makeAutoObservable(this);
  }

  get defaultOformLocale() {
    const userLocale = convertToLanguage(getCookie(LANGUAGE)) || "en";
    return this.oformLocales?.includes(userLocale) ? userLocale : "en";
  }

  setOformFiles = (oformFiles) => (this.oformFiles = oformFiles);

  setOformsFilter = (oformsFilter) => (this.oformsFilter = oformsFilter);

  setOformsCurrentCategory = (currentCategory) =>
    (this.currentCategory = currentCategory);

  setOformFromFolderId = (oformFromFolderId) => {
    this.oformFromFolderId = oformFromFolderId;
  };

  setOformsIsLoading = (oformsIsLoading) =>
    (this.oformsIsLoading = oformsIsLoading);

  setGallerySelected = (gallerySelected) => {
    this.gallerySelected = gallerySelected;
    this.authStore.infoPanelStore.setSelection(gallerySelected);
  };

  setOformLocales = (oformLocales) => (this.oformLocales = oformLocales);

  setFilterOformsByLocaleIsLoading = (filterOformsByLocaleIsLoading) => {
    this.filterOformsByLocaleIsLoading = filterOformsByLocaleIsLoading;
  };

  setCategoryFilterLoaded = (categoryFilterLoaded) => {
    this.categoryFilterLoaded = categoryFilterLoaded;
  };

  setLanguageFilterLoaded = (languageFilterLoaded) => {
    this.languageFilterLoaded = languageFilterLoaded;
  };

  setOformFilesLoaded = (oformFilesLoaded) => {
    this.oformFilesLoaded = oformFilesLoaded;
  };

  fetchOformLocales = async () => {
    const { uploadDomain, uploadDashboard } =
      this.authStore.settingsStore.formGallery;

    const url = combineUrl(uploadDomain, uploadDashboard, "/i18n/locales");

    try {
      const fetchedLocales = await getOformLocales(url);
      const localeKeys = fetchedLocales.map((locale) => locale.code);
      this.setOformLocales(localeKeys);
    } catch (err) {
      this.setOformLocales([]);

      err?.message !== "Network Error" && toastr.error(err);
    }
  };

  getOforms = async (filter = OformsFilter.getDefault()) => {
    const { domain, path } = this.authStore.settingsStore.formGallery;

    const formName = "&fields[0]=name_form";
    const updatedAt = "&fields[1]=updatedAt";
    const size = "&fields[2]=file_size";
    const filePages = "&fields[3]=file_pages";
    const defaultDescription = "&fields[4]=description_card";
    const templateDescription = "&fields[5]=template_desc";
    const cardPrewiew = "&populate[card_prewiew][fields][6]=url";
    const templateImage = "&populate[template_image][fields][7]=formats";

    const fields = `${formName}${updatedAt}${size}${filePages}${defaultDescription}${templateDescription}${cardPrewiew}${templateImage}`;
    const params = `?${fields}&${filter.toApiUrlParams()}`;

    const apiUrl = combineUrl(domain, path, params);

    try {
      const oforms = await getOforms(apiUrl);
      this.oformsLoadError = false;
      return oforms;
    } catch (err) {
      const status = err?.response?.status;
      const isApiError = status === 404 || status === 500;
      //console.log({ err, isApiError });
      if (isApiError) {
        this.oformsLoadError = true;
      } else {
        toastr.error(err);
      }
    }

    return null;
  };

  fetchOforms = async (filter = OformsFilter.getDefault()) => {
    const oformData = await this.getOforms(filter);

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

  fetchMoreOforms = async () => {
    if (!this.hasMoreForms || this.oformsIsLoading) return;
    this.setOformsIsLoading(true);

    const newOformsFilter = this.oformsFilter.clone();
    newOformsFilter.page += 1;

    const oformData = await this.getOforms(newOformsFilter, true);
    const newForms = oformData?.data?.data ?? [];

    runInAction(() => {
      this.setOformsFilter(newOformsFilter);
      this.setOformFiles([...this.oformFiles, ...newForms]);
      this.setOformsIsLoading(false);
    });
  };

  getTypeOfCategory = (category) => {
    if (!category) return;

    const [categoryType] = this.categoryTitles.filter(
      (categoryTitle) => !!category.attributes[categoryTitle]
    );

    return categoryType;
  };

  getCategoryTitle = (category, locale = this.defaultOformLocale) => {
    if (!category) return "";

    const categoryType = this.getTypeOfCategory(category);
    const categoryTitle = category.attributes[categoryType];

    const [localizedCategory] = category.attributes.localizations?.data.filter(
      (localization) => localization.attributes.locale === locale
    );
    return localizedCategory?.attributes[categoryType] || categoryTitle;
  };

  submitToFormGallery = async (file, formName, language, signal = null) => {
    const { uploadDomain, uploadPath } =
      this.authStore.settingsStore.formGallery;

    const res = await submitToGallery(
      combineUrl(uploadDomain, uploadPath),
      file,
      formName,
      language,
      signal
    );
    return res;
  };

  fetchCurrentCategory = async () => {
    const { uploadDomain, uploadDashboard } =
      this.authStore.settingsStore.formGallery;
    const { categorizeBy, categoryId } = this.oformsFilter;
    const locale = this.defaultOformLocale;

    if (!categorizeBy || !categoryId) {
      this.currentCategory = null;
      return;
    }

    const fetchedCategory = await getCategoryById(
      combineUrl(uploadDomain, uploadDashboard),
      categorizeBy,
      categoryId,
      locale
    );

    this.currentCategory = fetchedCategory;
  };

  fetchCategoryTypes = async () => {
    const { uploadDomain, uploadDashboard } =
      this.authStore.settingsStore.formGallery;

    const url = combineUrl(uploadDomain, uploadDashboard, "/menu-translations");
    const locale = this.defaultOformLocale;

    try {
      const menuItems = await getCategoryTypes(url, locale);
      this.categoryTitles = menuItems.map(
        (item) => item.attributes.categoryTitle
      );
      return menuItems;
    } catch (err) {
      err?.message !== "Network Error" && toastr.error(err);
    }

    return null;
  };

  fetchCategoriesOfCategoryType = async (categoryTypeId) => {
    const { uploadDomain, uploadDashboard } =
      this.authStore.settingsStore.formGallery;

    const url = combineUrl(uploadDomain, uploadDashboard, `/${categoryTypeId}`);

    const categories = await getCategoriesOfCategoryType(
      url,
      this.oformsFilter.locale
    );
    return categories;
  };

  filterOformsByCategory = (categorizeBy, categoryId) => {
    if (!categorizeBy || !categoryId) this.currentCategory = null;

    this.oformsFilter.page = 1;
    this.oformsFilter.categorizeBy = categorizeBy;
    this.oformsFilter.categoryId = categoryId;
    const newOformsFilter = this.oformsFilter.clone();

    runInAction(() => this.fetchOforms(newOformsFilter));
  };

  filterOformsByLocale = async (locale) => {
    if (!locale) return;

    if (locale !== this.oformsFilter.locale)
      this.setFilterOformsByLocaleIsLoading(true);

    this.currentCategory = null;

    this.oformsFilter.page = 1;
    this.oformsFilter.locale = locale;
    this.oformsFilter.categorizeBy = "";
    this.oformsFilter.categoryId = "";
    const newOformsFilter = this.oformsFilter.clone();

    runInAction(() => this.fetchOforms(newOformsFilter));
  };

  filterOformsBySearch = (search) => {
    this.oformsFilter.page = 1;
    this.oformsFilter.search = search;
    const newOformsFilter = this.oformsFilter.clone();

    runInAction(() => this.fetchOforms(newOformsFilter));
  };

  sortOforms = (sortBy, sortOrder) => {
    if (!sortBy || !sortOrder) return;

    this.oformsFilter.page = 1;
    this.oformsFilter.sortBy = sortBy;
    this.oformsFilter.sortOrder = sortOrder;
    const newOformsFilter = this.oformsFilter.clone();

    runInAction(() => this.fetchOforms(newOformsFilter));
  };

  resetFilters = () => {
    this.currentCategory = null;
    const newOformsFilter = OformsFilter.getDefault();
    newOformsFilter.locale = this.defaultOformLocale;

    runInAction(() => this.fetchOforms(newOformsFilter));
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
