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
  getOformPurposes,
} from "@docspace/shared/api/oforms";

import { toastr } from "@docspace/ui-kit/components/toast";

import { convertToLanguage } from "@docspace/shared/utils/common";
import { LANGUAGE } from "@docspace/shared/constants";
import { getCookie } from "@docspace/ui-kit/utils/cookie";
import { combineUrl } from "@docspace/shared/utils/combineUrl";

import type { AxiosError, AxiosResponse } from "axios";
import type {
  TOformCategory,
  TOformFile,
  TOformParentCategory,
  TOformPurpose,
  TOformsFilter,
  TOformsList,
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

  // The whole taxonomy of the CMS, fetched in one request per locale:
  // purpose (Business / Personal) -> parent category -> subcategory.
  purposes: TOformPurpose[] = [];

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

  /**
   * Root of the CMS API. `path` points at the templates collection, while the
   * taxonomy and the locale list live next to it, so the collection segment is
   * dropped: `.../dashboard/api/oforms/` -> `.../dashboard/api`.
   */
  get oformsApiRoot() {
    const { domain, path } = this.settingsStore.formGallery;

    return combineUrl(domain, path.replace(/\/*oforms\/*$/, ""));
  }

  get oformsApiUrl() {
    const { domain, path } = this.settingsStore.formGallery;

    return combineUrl(domain, path);
  }

  fetchOformLocales = async () => {
    const url = combineUrl(this.oformsApiRoot, "/i18n/locales");

    try {
      this.setOformLocales(await getOformLocales(url));
    } catch (err) {
      this.setOformLocales([]);

      (err as AxiosError)?.message !== "Network Error" &&
        toastr.error(err as string);
    }
  };

  getOforms = async (filter: TOformsFilter = OformsFilter.getDefault()) => {
    try {
      const oforms = await getOforms(this.oformsApiUrl, filter);
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

  applyOformsList = (filter: TOformsFilter, oformData: TOformsList | null) => {
    if (oformData) {
      filter.page = oformData.pagination.page;
      filter.total = oformData.pagination.total;
    }

    return oformData?.templates ?? [];
  };

  fetchOforms = async (filter: TOformsFilter = OformsFilter.getDefault()) => {
    const oformData = await this.getOforms(filter);
    const templates = this.applyOformsList(filter, oformData);

    runInAction(() => {
      this.setOformsFilter(filter);
      this.setOformFiles(templates);
    });
  };

  /**
   * A filter change refetches the list in place: the tiles already on screen
   * stay, dimmed, until the answer arrives. The flag also keeps
   * `fetchMoreOforms` from paginating a list that is being replaced.
   */
  refetchOforms = async (filter: TOformsFilter) => {
    this.setOformsIsLoading(true);

    try {
      await this.fetchOforms(filter);
    } finally {
      this.setOformsIsLoading(false);
    }
  };

  fetchMoreOforms = async () => {
    if (!this.hasMoreForms || this.oformsIsLoading) return;
    this.setOformsIsLoading(true);

    const newOformsFilter = this.oformsFilter.clone();
    newOformsFilter.page += 1;

    const oformData = await this.getOforms(newOformsFilter);
    const newForms = this.applyOformsList(newOformsFilter, oformData);

    runInAction(() => {
      this.setOformsFilter(newOformsFilter);
      this.setOformFiles([...(this.oformFiles || []), ...newForms]);
      this.setOformsIsLoading(false);
    });
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

  setPurposes = (purposes: TOformPurpose[]) => {
    this.purposes = purposes;
  };

  /**
   * The category filter is scoped by the selected purpose: with none selected
   * the groups of both purposes are listed, one after the other. Categories
   * without a single template of the current type are left out - the CMS keeps
   * plenty of them, and picking one could only ever end in an empty screen.
   */
  get parentCategories(): TOformParentCategory[] {
    const { purpose } = this.oformsFilter;

    return this.purposes
      .filter(({ key }) => !purpose || key === purpose)
      .flatMap(({ parentCategories }) => parentCategories)
      .map((parentCategory) => ({
        ...parentCategory,
        subcategories: parentCategory.subcategories.filter(
          ({ templatesCount }) => templatesCount > 0,
        ),
      }))
      .filter(({ subcategories }) => subcategories.length > 0);
  }

  fetchPurposes = async () => {
    const url = combineUrl(this.oformsApiRoot, "/purposes");

    try {
      const purposes = await getOformPurposes(
        url,
        this.defaultOformLocale,
        this.oformsFilter.extension,
      );
      this.setPurposes(purposes);
      return purposes;
    } catch (err) {
      (err as AxiosError)?.message !== "Network Error" &&
        toastr.error(err as string);
    }

    return null;
  };

  filterOformsByCategory = (category: TOformCategory | null) => {
    this.currentCategory = category;

    this.oformsFilter.page = 1;
    this.oformsFilter.categoryId = category?.documentId ?? "";
    const newOformsFilter = this.oformsFilter.clone();

    runInAction(() => this.refetchOforms(newOformsFilter));
  };

  // The category groups differ per purpose, so the selected category cannot
  // survive the switch.
  filterOformsByPurpose = (purpose: string) => {
    this.currentCategory = null;

    this.oformsFilter.page = 1;
    this.oformsFilter.purpose = purpose;
    this.oformsFilter.categoryId = "";
    const newOformsFilter = this.oformsFilter.clone();

    runInAction(() => this.refetchOforms(newOformsFilter));
  };

  filterOformsByLocale = async (locale: string) => {
    if (!locale) return;

    if (locale !== this.oformsFilter.locale)
      this.setFilterOformsByLocaleIsLoading(true);

    this.currentCategory = null;

    this.oformsFilter.page = 1;
    this.oformsFilter.locale = locale;
    this.oformsFilter.categoryId = "";
    const newOformsFilter = this.oformsFilter.clone();

    runInAction(() => this.refetchOforms(newOformsFilter));
  };

  filterOformsBySearch = (search: string) => {
    this.oformsFilter.page = 1;
    this.oformsFilter.search = search;
    const newOformsFilter = this.oformsFilter.clone();

    runInAction(() => this.refetchOforms(newOformsFilter));
  };

  initTemplateGallery = async () => {
    await this.fetchOformLocales();

    const firstLoadFilter: TOformsFilter = this.isFormsOnlyGallery
      ? OformsFilter.getDefault()
      : OformsFilter.getDefaultDocx();

    firstLoadFilter.locale = this.defaultOformLocale;

    await this.fetchOforms(firstLoadFilter);
  };

  sortOforms = (sortBy: string, sortOrder: string) => {
    if (!sortBy || !sortOrder) return;

    this.oformsFilter.page = 1;
    this.oformsFilter.sortBy = sortBy;
    this.oformsFilter.sortOrder = sortOrder;
    const newOformsFilter = this.oformsFilter.clone();

    runInAction(() => this.refetchOforms(newOformsFilter));
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
