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

import { makeAutoObservable, runInAction } from "mobx";

import OformsFilter from "@docspace/shared/api/oforms/filter";
import {
  getGuideLinkByLocale,
  submitToGallery,
  getOformLocales,
  getOforms,
  getCategoryById,
  getCategoryTypes,
  getCategoriesOfCategoryType,
} from "@docspace/shared/api/oforms";

import { toastr } from "@docspace/shared/components/toast";

import { convertToLanguage } from "@docspace/shared/utils/common";
import { LANGUAGE } from "@docspace/shared/constants";
import { getCookie } from "@docspace/shared/utils/cookie";
import { combineUrl } from "@docspace/shared/utils/combineUrl";

const myDocumentsFolderId = 2;

class OformsStore {
  settingsStore;

  userStore = null;

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

  templateGalleryVisible = false;

  isVisibleInfoPanelTemplateGallery = false;

  currentExtensionGallery = ".docx";

  submitToGalleryTileIsVisible = !localStorage.getItem(
    "submitToGalleryTileIsHidden",
  );

  constructor(settingsStore, userStore) {
    this.settingsStore = settingsStore;
    this.userStore = userStore;
    makeAutoObservable(this);
  }

  get defaultOformLocale() {
    const userLocale = getCookie(LANGUAGE) || this.userStore.user?.cultureName;
    const convertedLocale = convertToLanguage(userLocale);

    const locale = this.oformLocales?.includes(convertedLocale)
      ? convertedLocale
      : this.oformLocales?.includes(this.settingsStore.culture)
        ? this.settingsStore.culture
        : "en";

    return locale;
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

  setIsVisibleInfoPanelTemplateGallery = (
    isVisibleInfoPanelTemplateGallery,
  ) => {
    this.isVisibleInfoPanelTemplateGallery = isVisibleInfoPanelTemplateGallery;
  };

  fetchOformLocales = async () => {
    const { uploadDomain, uploadDashboard } = this.settingsStore.formGallery;

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
    const { domain, path } = this.settingsStore.formGallery;

    const formName = "&fields[0]=name_form";
    const updatedAt = "&fields[1]=updatedAt";
    const defaultDescription = "&fields[4]=description_card";
    const templateDescription = "&fields[5]=template_desc";
    const cardPrewiew = "&populate[card_prewiew][fields][6]=url";
    const templateImage = "&populate[template_image][fields][7]=formats";
    const templateSize = "&populate[file_oform][fields][8]=size";

    const fields = `${formName}${updatedAt}${defaultDescription}${templateDescription}${cardPrewiew}${templateImage}${templateSize}`;
    const params = `?${fields}&${filter.toApiUrlParams()}`;

    const apiUrl = combineUrl(domain, path, params);

    try {
      const oforms = await getOforms(apiUrl);
      this.oformsLoadError = false;
      return oforms;
    } catch (err) {
      const status = err?.response?.status;
      const isApiError = status === 404 || status === 500;
      // console.log({ err, isApiError });
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
      this.setOformFiles([...(this.oformFiles || []), ...newForms]);
      this.setOformsIsLoading(false);
    });
  };

  getTypeOfCategory = (category) => {
    if (!category) return;

    const [categoryType] = this.categoryTitles.filter(
      (categoryTitle) => !!category.attributes[categoryTitle],
    );

    return categoryType;
  };

  getCategoryTitle = (category, locale = this.oformsFilter.locale) => {
    if (!category) return "";

    const categoryType = this.getTypeOfCategory(category);
    const categoryTitle = category.attributes[categoryType];

    const localizations = category.attributes.localizations?.data || [];
    const [localizedCategory] = localizations.filter(
      (localization) => localization.attributes.locale === locale,
    );
    return localizedCategory?.attributes[categoryType] || categoryTitle;
  };

  submitToFormGallery = async (file, formName, language, signal = null) => {
    const { uploadDomain, uploadPath } = this.settingsStore.formGallery;

    const res = await submitToGallery(
      combineUrl(uploadDomain, uploadPath),
      file,
      formName,
      language,
      signal,
    );
    return res;
  };

  fetchCurrentCategory = async () => {
    const { uploadDomain, uploadDashboard } = this.settingsStore.formGallery;
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
      locale,
    );

    this.currentCategory = fetchedCategory;
  };

  fetchCategoryTypes = async () => {
    const { uploadDomain, uploadDashboard } = this.settingsStore.formGallery;

    const url = combineUrl(uploadDomain, uploadDashboard, "/menu-translations");
    const locale = this.defaultOformLocale;

    try {
      const menuItems = await getCategoryTypes(url, locale);
      this.categoryTitles = menuItems.map(
        (item) => item.attributes.categoryTitle,
      );
      return menuItems;
    } catch (err) {
      err?.message !== "Network Error" && toastr.error(err);
    }

    return null;
  };

  fetchCategoriesOfCategoryType = async (categoryTypeId) => {
    const { uploadDomain, uploadDashboard } = this.settingsStore.formGallery;

    const url = combineUrl(uploadDomain, uploadDashboard, `/${categoryTypeId}`);

    const categories = await getCategoriesOfCategoryType(
      url,
      this.oformsFilter.locale,
    );
    return categories;
  };

  fetchGuideLink = async (locale = this.defaultOformLocale) => {
    const { uploadDomain, uploadDashboard } = this.settingsStore.formGallery;
    const url = combineUrl(uploadDomain, uploadDashboard, `/blog-links`);
    const guideLink = await getGuideLinkByLocale(url, locale);
    return guideLink;
  };

  filterOformsByCategory = (categorizeBy, categoryId) => {
    if (!categorizeBy || !categoryId) this.currentCategory = null;

    this.oformsFilter.page = 1;
    this.oformsFilter.categorizeBy = categorizeBy;
    this.oformsFilter.categoryId = categoryId;
    const newOformsFilter = this.oformsFilter.clone();

    runInAction(() => this.fetchOforms(newOformsFilter));
  };

  filterOformsByLocale = async (locale, icon) => {
    if (!locale) return;

    if (locale !== this.oformsFilter.locale)
      this.setFilterOformsByLocaleIsLoading(true);

    this.currentCategory = null;

    this.oformsFilter.page = 1;
    this.oformsFilter.locale = locale;
    this.oformsFilter.categorizeBy = "";
    this.oformsFilter.categoryId = "";
    this.oformsFilter.icon = icon;
    const newOformsFilter = this.oformsFilter.clone();

    runInAction(() => this.fetchOforms(newOformsFilter));
  };

  filterOformsBySearch = (search) => {
    this.oformsFilter.page = 1;
    this.oformsFilter.search = search;
    const newOformsFilter = this.oformsFilter.clone();

    runInAction(() => this.fetchOforms(newOformsFilter));
  };

  initTemplateGallery = async () => {
    await this.fetchOformLocales();

    const firstLoadFilter = OformsFilter.getDefaultDocx();
    firstLoadFilter.locale = this.defaultOformLocale;

    await Promise.all([
      this.fetchOforms(firstLoadFilter),
      this.fetchCurrentCategory(),
    ]);
  };

  sortOforms = (sortBy, sortOrder) => {
    if (!sortBy || !sortOrder) return;

    this.oformsFilter.page = 1;
    this.oformsFilter.sortBy = sortBy;
    this.oformsFilter.sortOrder = sortOrder;
    const newOformsFilter = this.oformsFilter.clone();

    runInAction(() => this.fetchOforms(newOformsFilter));
  };

  resetFilters = async (ext) => {
    this.currentCategory = null;

    const defaultFilter =
      ext === ".docx"
        ? OformsFilter.getDefaultDocx()
        : ext === ".xlsx"
          ? OformsFilter.getDefaultSpreadsheet()
          : ext === ".pptx"
            ? OformsFilter.getDefaultPresentation()
            : OformsFilter.getDefault();

    defaultFilter.locale = this.defaultOformLocale;
    await this.fetchOforms(defaultFilter);
  };

  hideSubmitToGalleryTile = () => {
    localStorage.setItem("submitToGalleryTileIsHidden", true);
    this.submitToGalleryTileIsVisible = false;
  };

  setTemplateGalleryVisible = (templateGalleryVisible) => {
    this.templateGalleryVisible = templateGalleryVisible;
  };

  setCurrentExtensionGallery = (extension) => {
    this.currentExtensionGallery = extension;
  };

  get hasGalleryFiles() {
    return this.oformFiles && !!this.oformFiles.length;
  }

  get oformsFilterTotal() {
    return this.oformsFilter.total;
  }

  get hasMoreForms() {
    return this.oformFiles && this.oformFiles.length < this.oformsFilterTotal;
  }
}

export default OformsStore;
