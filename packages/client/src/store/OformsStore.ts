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
  OformsContractError,
} from "@docspace/shared/api/oforms";

import { convertToLanguage } from "@docspace/shared/utils/common";
import { LANGUAGE } from "@docspace/shared/constants";
import { getCookie } from "@onlyoffice/apps-ui-kit/utils/cookie";
import { combineUrl } from "@docspace/shared/utils/combineUrl";

import type { AxiosError, AxiosResponse } from "axios";
import type {
  TOformFile,
  TOformParentCategory,
  TOformPurpose,
  TOformsList,
} from "@docspace/shared/api/oforms/types";
import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import type { UserStore } from "@docspace/shared/store/UserStore";

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

  oformsIsRefetching = false;

  listRequestId = 0;

  oformsLoadError = false;

  oformsNetworkError = false;

  oformsFilter: OformsFilter = OformsFilter.getDefault();

  oformFromFolderId: number | string = myDocumentsFolderId;

  // The whole taxonomy of the CMS, fetched in one request per gallery locale
  // and file type: purpose (Business / Personal) -> parent category ->
  // subcategory.
  purposes: TOformPurpose[] = [];

  oformLocales: string[] | null = null;

  filterOformsByLocaleIsLoading = false;

  categoryFilterLoaded = false;

  languageFilterLoaded = false;

  oformFilesLoaded = false;

  templateGalleryVisible = false;

  isVisibleInfoPanelTemplateGallery = false;

  filterPanelVisible = false;

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

  constructor(
    settingsStore: SettingsStore,
    userStore: UserStore,
    treeFoldersStore: TTreeFoldersStore,
  ) {
    this.settingsStore = settingsStore;
    this.userStore = userStore;
    this.treeFoldersStore = treeFoldersStore;
    makeAutoObservable(this, { listRequestId: false });
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

  setOformsFilter = (oformsFilter: OformsFilter) =>
    (this.oformsFilter = oformsFilter);

  setOformFromFolderId = (oformFromFolderId: number | string) => {
    this.oformFromFolderId = oformFromFolderId;
  };

  setOformsIsLoading = (oformsIsLoading: boolean) =>
    (this.oformsIsLoading = oformsIsLoading);

  setOformsIsRefetching = (oformsIsRefetching: boolean) =>
    (this.oformsIsRefetching = oformsIsRefetching);

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
    } catch {
      // An empty list is the answer the language filter renders from; the
      // failure itself reaches the user through the error screen the list
      // request raises, so it is not toasted on top of it.
      this.setOformLocales([]);
    }
  };

  getOforms = async (filter: OformsFilter = OformsFilter.getDefault()) => {
    try {
      const oforms = await getOforms(this.oformsApiUrl, filter);
      this.oformsLoadError = false;
      this.oformsNetworkError = false;
      return oforms;
    } catch (err) {
      // Every way the catalog can fail ends on the same error screen: a
      // status this code does not enumerate (403 from the CDN in front of the
      // CMS, 401, 429) used to fall through to a toast, leaving the gallery
      // on skeletons that never resolve.
      const isNetworkError = (err as AxiosError)?.code === "ERR_NETWORK";

      if (isNetworkError) {
        this.oformsNetworkError = true;
      } else {
        this.oformsLoadError = true;
      }
    }

    return null;
  };

  // A failed request leaves no list to paginate: keeping the previous total
  // would make `hasMoreForms` true against an empty list and let the grid
  // retry the same failing page on every scroll.
  applyOformsList = (filter: OformsFilter, oformData: TOformsList | null) => {
    if (oformData) {
      filter.page = oformData.pagination.page;
      filter.total = oformData.pagination.total;
    } else {
      filter.total = 0;
    }

    return oformData?.templates ?? [];
  };

  fetchOforms = async (filter: OformsFilter = OformsFilter.getDefault()) => {
    this.listRequestId += 1;
    const requestId = this.listRequestId;

    const oformData = await this.getOforms(filter);
    if (requestId !== this.listRequestId) return false;

    const templates = this.applyOformsList(filter, oformData);

    runInAction(() => {
      this.setOformsFilter(filter);
      this.setOformFiles(templates);
      this.setOformsIsLoading(false);
      this.setOformsIsRefetching(false);
    });

    return true;
  };

  /**
   * A filter change refetches the list in place: the tiles already on screen
   * stay, dimmed, until the answer arrives. The loading flag also keeps
   * `fetchMoreOforms` from paginating a list that is being replaced.
   *
   * Both flags are cleared by whichever `fetchOforms` turns out to be the
   * latest one, not here: a superseded refetch must leave them raised for the
   * request that replaced it, and that request can just as well come from an
   * entry point that never went through `refetchOforms` (a tab switch, the
   * first load).
   */
  refetchOforms = async (filter: OformsFilter) => {
    this.setOformsIsLoading(true);
    this.setOformsIsRefetching(true);

    await this.fetchOforms(filter);
  };

  fetchMoreOforms = async () => {
    if (!this.hasMoreForms || this.oformsIsLoading) return;
    this.setOformsIsLoading(true);

    const requestId = this.listRequestId;
    const newOformsFilter = this.oformsFilter.clone();
    newOformsFilter.page += 1;

    const oformData = await this.getOforms(newOformsFilter);

    runInAction(() => {
      // A page of a list that has already been replaced is dropped whole,
      // the loading flag included: it now belongs to the request that
      // replaced the list, and clearing it here would let the grid paginate
      // that list while it is still being fetched.
      if (requestId !== this.listRequestId) return;

      const newForms = this.applyOformsList(newOformsFilter, oformData);
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
   * the groups of both purposes are listed together, in alphabetical order -
   * the CMS answers them in no meaningful one. Categories without a single
   * template of the current type are left out - the CMS keeps plenty of them,
   * and picking one could only ever end in an empty screen.
   */
  get parentCategories(): TOformParentCategory[] {
    const { purpose, locale } = this.oformsFilter;

    return this.purposes
      .filter(({ key }) => !purpose || key === purpose)
      .flatMap(({ parentCategories }) => parentCategories)
      .map((parentCategory) => ({
        ...parentCategory,
        subcategories: parentCategory.subcategories.filter(
          ({ templatesCount }) => templatesCount > 0,
        ),
      }))
      .filter(({ subcategories }) => subcategories.length > 0)
      .sort((a, b) => a.name.localeCompare(b.name, locale ?? undefined));
  }

  get selectedCategories(): TOformParentCategory[] {
    const { categoryIds } = this.oformsFilter;

    return this.parentCategories.filter(({ documentId }) =>
      categoryIds.includes(documentId),
    );
  }

  get selectedPurpose(): TOformPurpose | null {
    const { purpose } = this.oformsFilter;

    return this.purposes.find(({ key }) => key === purpose) ?? null;
  }

  get isLocaleChanged() {
    const { locale } = this.oformsFilter;

    return !!locale && locale !== this.defaultOformLocale;
  }

  get isOformsFilterChanged() {
    return (
      this.isLocaleChanged ||
      !!this.oformsFilter.purpose ||
      this.oformsFilter.categoryIds.length > 0
    );
  }

  getAvailableCategoryIds = (categoryIds: string[], purpose: string) => {
    const available = this.purposes
      .filter(({ key }) => !purpose || key === purpose)
      .flatMap(({ parentCategories }) => parentCategories)
      .filter(({ subcategories }) =>
        subcategories.some(({ templatesCount }) => templatesCount > 0),
      )
      .map(({ documentId }) => documentId);

    return categoryIds.filter((id) => available.includes(id));
  };

  fetchPurposes = async (locale: string, extension: string) => {
    const url = combineUrl(this.oformsApiRoot, "/purposes");

    try {
      this.setPurposes(await getOformPurposes(url, locale, extension));
    } catch {
      // Same as the locales: the taxonomy fails together with the list it
      // filters, and the error screen speaks for both.
      this.setPurposes([]);
    } finally {
      this.setCategoryFilterLoaded(true);
    }
  };

  fetchOformsWithPurposes = (filter: OformsFilter) =>
    Promise.all([
      this.fetchOforms(filter),
      this.fetchPurposes(
        filter.locale ?? this.defaultOformLocale,
        filter.extension,
      ),
    ]);

  filterOformsByCategories = (categoryIds: string[]) => {
    this.oformsFilter.page = 1;
    this.oformsFilter.categoryIds = categoryIds;
    const newOformsFilter = this.oformsFilter.clone();

    runInAction(() => this.refetchOforms(newOformsFilter));
  };

  toggleOformsCategory = (categoryId: string) => {
    const { categoryIds } = this.oformsFilter;

    this.filterOformsByCategories(
      categoryIds.includes(categoryId)
        ? categoryIds.filter((id) => id !== categoryId)
        : [...categoryIds, categoryId],
    );
  };

  removeOformsCategory = (categoryId: string) => {
    const { categoryIds } = this.oformsFilter;
    if (!categoryIds.includes(categoryId)) return;

    this.filterOformsByCategories(
      categoryIds.filter((id) => id !== categoryId),
    );
  };

  // Every purpose owns its own category groups, so only the selected
  // categories of the new purpose survive the switch.
  filterOformsByPurpose = (purpose: string) => {
    this.oformsFilter.page = 1;
    this.oformsFilter.categoryIds = this.getAvailableCategoryIds(
      this.oformsFilter.categoryIds,
      purpose,
    );
    this.oformsFilter.purpose = purpose;
    const newOformsFilter = this.oformsFilter.clone();

    runInAction(() => this.refetchOforms(newOformsFilter));
  };

  filterOformsByLocale = async (locale: string) => {
    if (!locale) return;

    if (locale !== this.oformsFilter.locale)
      this.setFilterOformsByLocaleIsLoading(true);

    this.oformsFilter.page = 1;
    this.oformsFilter.locale = locale;
    const newOformsFilter = this.oformsFilter.clone();

    try {
      if (!newOformsFilter.categoryIds.length) {
        await Promise.all([
          this.fetchPurposes(locale, newOformsFilter.extension),
          this.refetchOforms(newOformsFilter),
        ]);
        return;
      }

      await this.fetchPurposes(locale, newOformsFilter.extension);

      newOformsFilter.categoryIds = this.getAvailableCategoryIds(
        newOformsFilter.categoryIds,
        newOformsFilter.purpose,
      );
      runInAction(() => {
        this.oformsFilter.categoryIds = newOformsFilter.categoryIds;
      });

      await this.refetchOforms(newOformsFilter);
    } finally {
      this.setFilterOformsByLocaleIsLoading(false);
    }
  };

  clearOformsFilter = async () => {
    if (!this.isOformsFilterChanged || this.filterOformsByLocaleIsLoading)
      return;

    const locale = this.defaultOformLocale;

    if (this.isLocaleChanged) {
      this.oformsFilter.purpose = "";
      this.oformsFilter.categoryIds = [];
      await this.filterOformsByLocale(locale);
      return;
    }

    this.oformsFilter.page = 1;
    this.oformsFilter.purpose = "";
    this.oformsFilter.categoryIds = [];

    await this.refetchOforms(this.oformsFilter.clone());
  };

  filterOformsBySearch = (search: string) => {
    this.oformsFilter.page = 1;
    this.oformsFilter.search = search;
    const newOformsFilter = this.oformsFilter.clone();

    runInAction(() => this.refetchOforms(newOformsFilter));
  };

  initTemplateGallery = async () => {
    await this.fetchOformLocales();

    const firstLoadFilter = this.isFormsOnlyGallery
      ? OformsFilter.getDefault()
      : OformsFilter.getDefaultDocx();

    firstLoadFilter.locale = this.defaultOformLocale;

    await this.fetchOformsWithPurposes(firstLoadFilter);
  };

  resetFilters = async (ext?: string) => {
    this.filterPanelVisible = false;

    const defaultFilter =
      ext === ".docx"
        ? OformsFilter.getDefaultDocx()
        : ext === ".xlsx"
          ? OformsFilter.getDefaultSpreadsheet()
          : ext === ".pptx"
            ? OformsFilter.getDefaultPresentation()
            : OformsFilter.getDefault();

    defaultFilter.locale = this.defaultOformLocale;

    // Switching a tab and clearing a filter both replace the list in place,
    // so they dim the tiles the same way a filter change does.
    this.setOformsIsLoading(true);
    this.setOformsIsRefetching(true);

    await this.fetchOformsWithPurposes(defaultFilter);
  };

  setTemplateGalleryVisible = (templateGalleryVisible: boolean) => {
    // Closing always drops the room-from-template mode: the flag is opt-in per
    // opening, so any other entry point (in-room gallery, "+" menu) keeps
    // creating plain files even if a Forms-root opening was abandoned.
    if (!templateGalleryVisible) {
      this.createRoomFromTemplate = false;
      this.filterPanelVisible = false;
    }

    this.templateGalleryVisible = templateGalleryVisible;
  };

  setFilterPanelVisible = (filterPanelVisible: boolean) => {
    this.filterPanelVisible = filterPanelVisible;
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
