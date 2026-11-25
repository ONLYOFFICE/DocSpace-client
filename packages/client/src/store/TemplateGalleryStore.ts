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

import TemplateGalleryFilter from "@docspace/shared/api/template-gallery/filter";
import {
  submitToGallery,
  getGalleryLocales,
  getGalleryTemplates,
  getGalleryPurposes,
  TemplateGalleryContractError,
} from "@docspace/shared/api/template-gallery";

import { convertToLanguage } from "@docspace/shared/utils/common";
import { LANGUAGE } from "@docspace/shared/constants";
import { getCookie } from "@onlyoffice/apps-ui-kit/utils/cookie";
import { combineUrl } from "@docspace/shared/utils/combineUrl";

import type { AxiosError, AxiosResponse } from "axios";
import type {
  TGalleryTemplate,
  TGalleryParentCategory,
  TGalleryPurpose,
  TGalleryTemplatesList,
} from "@docspace/shared/api/template-gallery/types";
import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import type { UserStore } from "@docspace/shared/store/UserStore";

type TTreeFoldersStore = {
  isFormRoomRoot: boolean;
};

const myDocumentsFolderId = 2;

class TemplateGalleryStore {
  settingsStore: SettingsStore;

  treeFoldersStore: TTreeFoldersStore;

  // `null!` keeps the original runtime field initializer (null) while the
  // constructor immediately assigns the real store.
  userStore: UserStore = null!;

  galleryTemplates: TGalleryTemplate[] | null = null;

  gallerySelected: TGalleryTemplate | null = null;

  galleryIsLoading = false;

  galleryIsRefetching = false;

  listRequestId = 0;

  purposesRequestId = 0;

  galleryLoadError = false;

  galleryNetworkError = false;

  galleryFilter: TemplateGalleryFilter = TemplateGalleryFilter.getDefault();

  galleryFromFolderId: number | string = myDocumentsFolderId;

  // The whole taxonomy of the CMS, fetched in one request per gallery locale
  // and file type: purpose (Business / Personal) -> parent category ->
  // subcategory.
  purposes: TGalleryPurpose[] = [];

  galleryLocales: string[] | null = null;

  filterGalleryByLocaleIsLoading = false;

  categoryFilterLoaded = false;

  languageFilterLoaded = false;

  galleryTemplatesLoaded = false;

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

  get defaultGalleryLocale() {
    const userLocale = getCookie(LANGUAGE) || this.userStore.user?.cultureName;
    const convertedLocale = convertToLanguage(userLocale);

    // `includes(convertedLocale)` is only true when `convertedLocale` is a
    // string, so the assertions below are safe and keep the original logic.
    const locale = this.galleryLocales?.includes(convertedLocale as string)
      ? (convertedLocale as string)
      : this.galleryLocales?.includes(this.settingsStore.culture)
        ? this.settingsStore.culture
        : "en";

    return locale;
  }

  setGalleryTemplates = (galleryTemplates: TGalleryTemplate[] | null) =>
    (this.galleryTemplates = galleryTemplates);

  setGalleryFilter = (galleryFilter: TemplateGalleryFilter) =>
    (this.galleryFilter = galleryFilter);

  setGalleryFromFolderId = (galleryFromFolderId: number | string) => {
    this.galleryFromFolderId = galleryFromFolderId;
  };

  setGalleryIsLoading = (galleryIsLoading: boolean) =>
    (this.galleryIsLoading = galleryIsLoading);

  setGalleryIsRefetching = (galleryIsRefetching: boolean) =>
    (this.galleryIsRefetching = galleryIsRefetching);

  setGallerySelected = (gallerySelected: TGalleryTemplate | null) => {
    this.gallerySelected = gallerySelected;
  };

  setGalleryLocales = (galleryLocales: string[] | null) =>
    (this.galleryLocales = galleryLocales);

  setFilterGalleryByLocaleIsLoading = (
    filterGalleryByLocaleIsLoading: boolean,
  ) => {
    this.filterGalleryByLocaleIsLoading = filterGalleryByLocaleIsLoading;
  };

  setCategoryFilterLoaded = (categoryFilterLoaded: boolean) => {
    this.categoryFilterLoaded = categoryFilterLoaded;
  };

  setLanguageFilterLoaded = (languageFilterLoaded: boolean) => {
    this.languageFilterLoaded = languageFilterLoaded;
  };

  setGalleryTemplatesLoaded = (galleryTemplatesLoaded: boolean) => {
    this.galleryTemplatesLoaded = galleryTemplatesLoaded;
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
    formTemplateForNewRoom: TemplateGalleryStore["formTemplateForNewRoom"],
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
  get galleryApiRoot() {
    const { domain, path } = this.settingsStore.templateGallery;

    return combineUrl(domain, path.replace(/\/*oforms\/*$/, ""));
  }

  get galleryApiUrl() {
    const { domain, path } = this.settingsStore.templateGallery;

    return combineUrl(domain, path);
  }

  fetchGalleryLocales = async () => {
    const url = combineUrl(this.galleryApiRoot, "/i18n/locales");

    try {
      this.setGalleryLocales(await getGalleryLocales(url));
    } catch {
      // An empty list is the answer the language filter renders from; the
      // failure itself reaches the user through the error screen the list
      // request raises, so it is not toasted on top of it.
      this.setGalleryLocales([]);
    }
  };

  requestGalleryTemplates = async (
    filter: TemplateGalleryFilter = TemplateGalleryFilter.getDefault(),
  ) => {
    try {
      const templates = await getGalleryTemplates(this.galleryApiUrl, filter);
      this.galleryLoadError = false;
      this.galleryNetworkError = false;
      return templates;
    } catch (err) {
      // Every way the catalog can fail ends on the same error screen: a
      // status this code does not enumerate (403 from the CDN in front of the
      // CMS, 401, 429) used to fall through to a toast, leaving the gallery
      // on skeletons that never resolve.
      const isNetworkError = (err as AxiosError)?.code === "ERR_NETWORK";

      if (isNetworkError) {
        this.galleryNetworkError = true;
      } else {
        this.galleryLoadError = true;
      }
    }

    return null;
  };

  // A failed request leaves no list to paginate: keeping the previous total
  // would make `hasMoreForms` true against an empty list and let the grid
  // retry the same failing page on every scroll.
  applyGalleryTemplatesList = (
    filter: TemplateGalleryFilter,
    galleryData: TGalleryTemplatesList | null,
  ) => {
    if (galleryData) {
      filter.page = galleryData.pagination.page;
      filter.total = galleryData.pagination.total;
    } else {
      filter.total = 0;
    }

    return galleryData?.templates ?? [];
  };

  fetchGalleryTemplates = async (
    filter: TemplateGalleryFilter = TemplateGalleryFilter.getDefault(),
  ) => {
    this.listRequestId += 1;
    const requestId = this.listRequestId;

    const galleryData = await this.requestGalleryTemplates(filter);
    if (requestId !== this.listRequestId) return false;

    const templates = this.applyGalleryTemplatesList(filter, galleryData);

    runInAction(() => {
      this.setGalleryFilter(filter);
      this.setGalleryTemplates(templates);
      this.setGalleryIsLoading(false);
      this.setGalleryIsRefetching(false);
    });

    return true;
  };

  /**
   * A filter change refetches the list in place: the tiles already on screen
   * stay, dimmed, until the answer arrives. The loading flag also keeps
   * `fetchMoreGalleryTemplates` from paginating a list that is being replaced.
   *
   * Both flags are cleared by whichever `fetchGalleryTemplates` turns out to be
   * the latest one, not here: a superseded refetch must leave them raised for
   * the request that replaced it, and that request can just as well come from
   * an entry point that never went through `refetchGalleryTemplates` (a tab
   * switch, the first load).
   */
  refetchGalleryTemplates = async (filter: TemplateGalleryFilter) => {
    this.setGalleryIsLoading(true);
    this.setGalleryIsRefetching(true);

    await this.fetchGalleryTemplates(filter);
  };

  fetchMoreGalleryTemplates = async () => {
    if (!this.hasMoreForms || this.galleryIsLoading) return;
    this.setGalleryIsLoading(true);

    const requestId = this.listRequestId;
    const newGalleryFilter = this.galleryFilter.clone();
    newGalleryFilter.page += 1;

    const galleryData = await this.requestGalleryTemplates(newGalleryFilter);

    runInAction(() => {
      // A page of a list that has already been replaced is dropped whole,
      // the loading flag included: it now belongs to the request that
      // replaced the list, and clearing it here would let the grid paginate
      // that list while it is still being fetched.
      if (requestId !== this.listRequestId) return;

      const newForms = this.applyGalleryTemplatesList(
        newGalleryFilter,
        galleryData,
      );
      this.setGalleryFilter(newGalleryFilter);
      this.setGalleryTemplates([...(this.galleryTemplates || []), ...newForms]);
      this.setGalleryIsLoading(false);
    });
  };

  submitToFormGallery = async (
    file: File,
    formName: string,
    language: string,
    signal: AbortSignal | null = null,
  ) => {
    const { uploadDomain, uploadPath } = this.settingsStore.templateGallery;

    const res = (await submitToGallery(
      combineUrl(uploadDomain, uploadPath),
      file,
      formName,
      language,
      signal,
    )) as AxiosResponse<unknown>;
    return res;
  };

  setPurposes = (purposes: TGalleryPurpose[]) => {
    this.purposes = purposes;
  };

  /**
   * The category filter is scoped by the selected purpose: with none selected
   * the groups of both purposes are listed together, in alphabetical order -
   * the CMS answers them in no meaningful one. Categories without a single
   * template of the current type are left out - the CMS keeps plenty of them,
   * and picking one could only ever end in an empty screen.
   */
  get parentCategories(): TGalleryParentCategory[] {
    const { purpose, locale } = this.galleryFilter;

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

  get selectedCategories(): TGalleryParentCategory[] {
    const { categoryIds } = this.galleryFilter;

    return this.parentCategories.filter(({ documentId }) =>
      categoryIds.includes(documentId),
    );
  }

  get selectedPurpose(): TGalleryPurpose | null {
    const { purpose } = this.galleryFilter;

    return this.purposes.find(({ key }) => key === purpose) ?? null;
  }

  get isLocaleChanged() {
    const { locale } = this.galleryFilter;

    return !!locale && locale !== this.defaultGalleryLocale;
  }

  get isGalleryFilterChanged() {
    return (
      this.isLocaleChanged ||
      !!this.galleryFilter.purpose ||
      this.galleryFilter.categoryIds.length > 0
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
    const url = combineUrl(this.galleryApiRoot, "/purposes");

    this.purposesRequestId += 1;
    const requestId = this.purposesRequestId;

    let purposes: TGalleryPurpose[] = [];

    try {
      purposes = await getGalleryPurposes(url, locale, extension);
    } catch {
      // Same as the locales: the taxonomy fails together with the list it
      // filters, and the error screen speaks for both.
    }

    // A tab or language switched mid-flight answers for another type or
    // locale, so only the latest request may replace the categories.
    if (requestId !== this.purposesRequestId) return;

    runInAction(() => {
      this.setPurposes(purposes);
      this.setCategoryFilterLoaded(true);
    });
  };

  fetchGalleryTemplatesWithPurposes = (filter: TemplateGalleryFilter) =>
    Promise.all([
      this.fetchGalleryTemplates(filter),
      this.fetchPurposes(
        filter.locale ?? this.defaultGalleryLocale,
        filter.extension,
      ),
    ]);

  filterGalleryByCategories = (categoryIds: string[]) => {
    this.galleryFilter.page = 1;
    this.galleryFilter.categoryIds = categoryIds;
    const newGalleryFilter = this.galleryFilter.clone();

    runInAction(() => this.refetchGalleryTemplates(newGalleryFilter));
  };

  toggleGalleryCategory = (categoryId: string) => {
    const { categoryIds } = this.galleryFilter;

    this.filterGalleryByCategories(
      categoryIds.includes(categoryId)
        ? categoryIds.filter((id) => id !== categoryId)
        : [...categoryIds, categoryId],
    );
  };

  removeGalleryCategory = (categoryId: string) => {
    const { categoryIds } = this.galleryFilter;
    if (!categoryIds.includes(categoryId)) return;

    this.filterGalleryByCategories(
      categoryIds.filter((id) => id !== categoryId),
    );
  };

  // Every purpose owns its own category groups, so only the selected
  // categories of the new purpose survive the switch.
  filterGalleryByPurpose = (purpose: string) => {
    this.galleryFilter.page = 1;
    this.galleryFilter.categoryIds = this.getAvailableCategoryIds(
      this.galleryFilter.categoryIds,
      purpose,
    );
    this.galleryFilter.purpose = purpose;
    const newGalleryFilter = this.galleryFilter.clone();

    runInAction(() => this.refetchGalleryTemplates(newGalleryFilter));
  };

  filterGalleryByLocale = async (locale: string) => {
    if (!locale) return;

    if (locale !== this.galleryFilter.locale)
      this.setFilterGalleryByLocaleIsLoading(true);

    this.galleryFilter.page = 1;
    this.galleryFilter.locale = locale;
    const newGalleryFilter = this.galleryFilter.clone();

    try {
      if (!newGalleryFilter.categoryIds.length) {
        await Promise.all([
          this.fetchPurposes(locale, newGalleryFilter.extension),
          this.refetchGalleryTemplates(newGalleryFilter),
        ]);
        return;
      }

      await this.fetchPurposes(locale, newGalleryFilter.extension);

      newGalleryFilter.categoryIds = this.getAvailableCategoryIds(
        newGalleryFilter.categoryIds,
        newGalleryFilter.purpose,
      );
      runInAction(() => {
        this.galleryFilter.categoryIds = newGalleryFilter.categoryIds;
      });

      await this.refetchGalleryTemplates(newGalleryFilter);
    } finally {
      this.setFilterGalleryByLocaleIsLoading(false);
    }
  };

  clearGalleryFilter = async () => {
    if (!this.isGalleryFilterChanged || this.filterGalleryByLocaleIsLoading)
      return;

    const locale = this.defaultGalleryLocale;

    if (this.isLocaleChanged) {
      this.galleryFilter.purpose = "";
      this.galleryFilter.categoryIds = [];
      await this.filterGalleryByLocale(locale);
      return;
    }

    this.galleryFilter.page = 1;
    this.galleryFilter.purpose = "";
    this.galleryFilter.categoryIds = [];

    await this.refetchGalleryTemplates(this.galleryFilter.clone());
  };

  filterGalleryBySearch = (search: string) => {
    this.galleryFilter.page = 1;
    this.galleryFilter.search = search;
    const newGalleryFilter = this.galleryFilter.clone();

    runInAction(() => this.refetchGalleryTemplates(newGalleryFilter));
  };

  initTemplateGallery = async () => {
    await this.fetchGalleryLocales();

    const firstLoadFilter = this.isFormsOnlyGallery
      ? TemplateGalleryFilter.getDefault()
      : TemplateGalleryFilter.getDefaultDocx();

    firstLoadFilter.locale = this.defaultGalleryLocale;

    await this.fetchGalleryTemplatesWithPurposes(firstLoadFilter);
  };

  resetFilters = async (ext?: string) => {
    this.filterPanelVisible = false;

    const defaultFilter =
      ext === ".docx"
        ? TemplateGalleryFilter.getDefaultDocx()
        : ext === ".xlsx"
          ? TemplateGalleryFilter.getDefaultSpreadsheet()
          : ext === ".pptx"
            ? TemplateGalleryFilter.getDefaultPresentation()
            : TemplateGalleryFilter.getDefault();

    defaultFilter.locale = this.defaultGalleryLocale;

    // Switching a tab and clearing a filter both replace the list in place,
    // so they dim the tiles the same way a filter change does.
    this.setGalleryIsLoading(true);
    this.setGalleryIsRefetching(true);

    await this.fetchGalleryTemplatesWithPurposes(defaultFilter);
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
    return this.galleryTemplates && !!this.galleryTemplates.length;
  }

  get galleryFilterTotal() {
    return this.galleryFilter.total;
  }

  get hasMoreForms() {
    return (
      this.galleryTemplates &&
      this.galleryTemplates.length < this.galleryFilterTotal
    );
  }
}

export default TemplateGalleryStore;
