/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { makeAutoObservable, runInAction } from "mobx";

import OformsFilter from "@docspace/shared/api/oforms/filter";
import {
  submitToGallery,
  getOformLocales,
  getOforms,
  getCategoryById,
  getCategoryTypes,
  getCategoriesOfCategoryType,
} from "@docspace/shared/api/oforms";

import { toastr } from "@docspace/ui-kit/components/toast";

import { convertToLanguage } from "@docspace/shared/utils/common";
import { LANGUAGE } from "@docspace/shared/constants";
import { getCookie } from "@docspace/ui-kit/utils/cookie";
import { combineUrl } from "@docspace/shared/utils/combineUrl";

import type { AxiosError, AxiosResponse } from "axios";
import type {
  TOformCategory,
  TOformCategoryType,
  TOformFile,
  TOformLocale,
  TOformsFilter,
  TOformsListResponse,
} from "@docspace/shared/api/oforms/types";
import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import type { UserStore } from "@docspace/shared/store/UserStore";

import {
  PersistenceKeys,
  hasPersisted,
  setPersistedString,
} from "./utils/persistence";

type TTreeFoldersStore = {
  isFormRoomRoot: boolean;
};

const myDocumentsFolderId = 2;

class OformsStore {
  settingsStore: SettingsStore;

  treeFoldersStore: TTreeFoldersStore;

  // `null!` keeps the original runtime field initializer (null) while the
  // constructor immediately assigns the real store.
  userStore: UserStore = null!;

  oformFiles: TOformFile[] | null = null;

  gallerySelected: TOformFile | null = null;

  oformsIsLoading = false;

  oformsLoadError = false;

  oformsNetworkError = false;

  oformsFilter: TOformsFilter = OformsFilter.getDefault();

  oformFromFolderId: number | string = myDocumentsFolderId;

  currentCategory: TOformCategory | null = null;

  categoryTitles: string[] = [];

  oformLocales: string[] | null = null;

  filterOformsByLocaleIsLoading = false;

  categoryFilterLoaded = false;

  languageFilterLoaded = false;

  oformFilesLoaded = false;

  templateGalleryVisible = false;

  isVisibleInfoPanelTemplateGallery = false;

  currentExtensionGallery = ".docx";

  // Set when the gallery is opened from the Forms section root, where there is
  // no folder to create a file in: picking a template there creates a Form
  // Filling room built around that form instead of a bare file. Constrains the
  // gallery to PDFs, like inside a form room.
  createRoomFromTemplate = false;

  // The template a just-picked Forms-root selection should materialize into,
  // once the room to hold it exists. Read by CreateEditRoomStore right after it
  // creates the room; nothing is requested from the API before that.
  formTemplateForNewRoom: {
    id: number;
    title: string;
    extension: string;
  } | null = null;

  submitToGalleryTileIsVisible = !hasPersisted(
    PersistenceKeys.submitToGalleryTileIsHidden,
  );

  constructor(
    settingsStore: SettingsStore,
    userStore: UserStore,
    treeFoldersStore: TTreeFoldersStore,
  ) {
    this.settingsStore = settingsStore;
    this.userStore = userStore;
    this.treeFoldersStore = treeFoldersStore;
    makeAutoObservable(this);
  }

  get defaultOformLocale() {
    const userLocale = getCookie(LANGUAGE) || this.userStore.user?.cultureName;
    const convertedLocale = convertToLanguage(userLocale);

    // `includes(convertedLocale)` is only true when `convertedLocale` is a
    // string, so the assertions below are safe and keep the original logic.
    const locale = this.oformLocales?.includes(convertedLocale as string)
      ? (convertedLocale as string)
      : this.oformLocales?.includes(this.settingsStore.culture)
        ? this.settingsStore.culture
        : "en";

    return locale;
  }

  setOformFiles = (oformFiles: TOformFile[] | null) =>
    (this.oformFiles = oformFiles);

  setOformsFilter = (oformsFilter: TOformsFilter) =>
    (this.oformsFilter = oformsFilter);

  setOformsCurrentCategory = (currentCategory: TOformCategory | null) =>
    (this.currentCategory = currentCategory);

  setOformFromFolderId = (oformFromFolderId: number | string) => {
    this.oformFromFolderId = oformFromFolderId;
  };

  setOformsIsLoading = (oformsIsLoading: boolean) =>
    (this.oformsIsLoading = oformsIsLoading);

  setGallerySelected = (gallerySelected: TOformFile | null) => {
    this.gallerySelected = gallerySelected;
  };

  setOformLocales = (oformLocales: string[] | null) =>
    (this.oformLocales = oformLocales);

  setFilterOformsByLocaleIsLoading = (
    filterOformsByLocaleIsLoading: boolean,
  ) => {
    this.filterOformsByLocaleIsLoading = filterOformsByLocaleIsLoading;
  };

  setCategoryFilterLoaded = (categoryFilterLoaded: boolean) => {
    this.categoryFilterLoaded = categoryFilterLoaded;
  };

  setLanguageFilterLoaded = (languageFilterLoaded: boolean) => {
    this.languageFilterLoaded = languageFilterLoaded;
  };

  setOformFilesLoaded = (oformFilesLoaded: boolean) => {
    this.oformFilesLoaded = oformFilesLoaded;
  };

  setIsVisibleInfoPanelTemplateGallery = (
    isVisibleInfoPanelTemplateGallery: boolean,
  ) => {
    this.isVisibleInfoPanelTemplateGallery = isVisibleInfoPanelTemplateGallery;
  };

  setCreateRoomFromTemplate = (createRoomFromTemplate: boolean) => {
    this.createRoomFromTemplate = createRoomFromTemplate;
  };

  setFormTemplateForNewRoom = (
    formTemplateForNewRoom: OformsStore["formTemplateForNewRoom"],
  ) => {
    this.formTemplateForNewRoom = formTemplateForNewRoom;
  };

  // The gallery is limited to PDF forms both inside a form room and when it is
  // opened to build a new form space out of a template.
  get isFormsOnlyGallery() {
    return this.treeFoldersStore.isFormRoomRoot || this.createRoomFromTemplate;
  }

  fetchOformLocales = async () => {
    const { uploadDomain, uploadDashboard } = this.settingsStore.formGallery;

    const url = combineUrl(uploadDomain, uploadDashboard, "/i18n/locales");

    try {
      const fetchedLocales = (await getOformLocales(url)) as TOformLocale[];
      const localeKeys = fetchedLocales.map((locale) => locale.code);
      this.setOformLocales(localeKeys);
    } catch (err) {
      this.setOformLocales([]);

      (err as AxiosError)?.message !== "Network Error" &&
        toastr.error(err as string);
    }
  };

  getOforms = async (
    filter: TOformsFilter = OformsFilter.getDefault(),
    // fetchMoreOforms always passed a second `true` argument
    // that the original .js implementation never declared or read — typed as
    // an ignored optional param to keep that call site untouched.
    _fetchMore?: boolean,
  ) => {
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
      const oforms = (await getOforms(
        apiUrl,
      )) as AxiosResponse<TOformsListResponse>;
      this.oformsLoadError = false;
      this.oformsNetworkError = false;
      return oforms;
    } catch (err) {
      const status = (err as AxiosError)?.response?.status;
      const isNetworkError = (err as AxiosError)?.code === "ERR_NETWORK";
      const isApiError = status === 404 || status === 500;

      if (isApiError) {
        this.oformsLoadError = true;
      } else if (isNetworkError) {
        this.oformsNetworkError = true;
      } else {
        toastr.error(err as string);
      }
    }

    return null;
  };

  fetchOforms = async (filter: TOformsFilter = OformsFilter.getDefault()) => {
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

  getTypeOfCategory = (category: TOformCategory | null | undefined) => {
    if (!category) return;

    const [categoryType] = this.categoryTitles.filter(
      (categoryTitle) => !!category.attributes[categoryTitle],
    );

    return categoryType;
  };

  getCategoryTitle = (
    category: TOformCategory | null | undefined,
    locale: string | null = this.oformsFilter.locale,
  ) => {
    if (!category) return "";

    const categoryType = this.getTypeOfCategory(category);
    // the category title lives under a dynamic Strapi key
    // named by `categoryType`; when no category type matches,
    // `categoryType` is `undefined` and the original .js resolved
    // `attributes[undefined]` to `undefined` — the assertions keep that
    // exact runtime lookup (the method may still return `undefined`).
    const categoryTitle = category.attributes[categoryType as string] as string;

    const localizations = category.attributes.localizations?.data || [];
    const [localizedCategory] = localizations.filter(
      (localization) => localization.attributes.locale === locale,
    );
    return (
      (localizedCategory?.attributes[categoryType as string] as
        | string
        | undefined) || categoryTitle
    );
  };

  submitToFormGallery = async (
    file: File,
    formName: string,
    language: string,
    signal: AbortSignal | null = null,
  ) => {
    const { uploadDomain, uploadPath } = this.settingsStore.formGallery;

    const res = (await submitToGallery(
      combineUrl(uploadDomain, uploadPath),
      file,
      formName,
      language,
      signal,
    )) as AxiosResponse<unknown>;
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

    const fetchedCategory = (await getCategoryById(
      combineUrl(uploadDomain, uploadDashboard),
      categorizeBy,
      categoryId,
      locale,
    )) as TOformCategory | null;

    this.currentCategory = fetchedCategory;
  };

  fetchCategoryTypes = async () => {
    const { uploadDomain, uploadDashboard } = this.settingsStore.formGallery;

    const url = combineUrl(uploadDomain, uploadDashboard, "/menu-translations");
    const locale = this.defaultOformLocale;

    try {
      const menuItems = (await getCategoryTypes(
        url,
        locale,
      )) as TOformCategoryType[];
      this.categoryTitles = menuItems.map(
        (item) => item.attributes.categoryTitle,
      );
      return menuItems;
    } catch (err) {
      (err as AxiosError)?.message !== "Network Error" &&
        toastr.error(err as string);
    }

    return null;
  };

  fetchCategoriesOfCategoryType = async (categoryTypeId: string) => {
    const { uploadDomain, uploadDashboard } = this.settingsStore.formGallery;

    const url = combineUrl(uploadDomain, uploadDashboard, `/${categoryTypeId}`);

    const categories = (await getCategoriesOfCategoryType(
      url,
      // the untyped API helper declares `locale = "en"`, but the original
      // .js passed the (possibly null) filter locale through unchanged
      this.oformsFilter.locale as string,
    )) as TOformCategory[];
    return categories;
  };

  filterOformsByCategory = (categorizeBy: string, categoryId: string) => {
    if (!categorizeBy || !categoryId) this.currentCategory = null;

    this.oformsFilter.page = 1;
    this.oformsFilter.categorizeBy = categorizeBy;
    this.oformsFilter.categoryId = categoryId;
    const newOformsFilter = this.oformsFilter.clone();

    runInAction(() => this.fetchOforms(newOformsFilter));
  };

  filterOformsByLocale = async (locale: string, icon?: string) => {
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

  filterOformsBySearch = (search: string) => {
    this.oformsFilter.page = 1;
    this.oformsFilter.search = search;
    const newOformsFilter = this.oformsFilter.clone();

    runInAction(() => this.fetchOforms(newOformsFilter));
  };

  initTemplateGallery = async () => {
    await this.fetchOformLocales();

    const firstLoadFilter: TOformsFilter = this.isFormsOnlyGallery
      ? OformsFilter.getDefault()
      : OformsFilter.getDefaultDocx();

    firstLoadFilter.locale = this.defaultOformLocale;

    await Promise.all([
      this.fetchOforms(firstLoadFilter),
      this.fetchCurrentCategory(),
    ]);
  };

  sortOforms = (sortBy: string, sortOrder: string) => {
    if (!sortBy || !sortOrder) return;

    this.oformsFilter.page = 1;
    this.oformsFilter.sortBy = sortBy;
    this.oformsFilter.sortOrder = sortOrder;
    const newOformsFilter = this.oformsFilter.clone();

    runInAction(() => this.fetchOforms(newOformsFilter));
  };

  resetFilters = async (ext?: string) => {
    this.currentCategory = null;

    const defaultFilter: TOformsFilter =
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
    setPersistedString(PersistenceKeys.submitToGalleryTileIsHidden, "true");
    this.submitToGalleryTileIsVisible = false;
  };

  setTemplateGalleryVisible = (templateGalleryVisible: boolean) => {
    // Closing always drops the room-from-template mode: the flag is opt-in per
    // opening, so any other entry point (in-room gallery, "+" menu) keeps
    // creating plain files even if a Forms-root opening was abandoned.
    if (!templateGalleryVisible) this.createRoomFromTemplate = false;

    this.templateGalleryVisible = templateGalleryVisible;
  };

  setCurrentExtensionGallery = (extension: string) => {
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
