// (c) Copyright Ascensio System SIA 2009-2024
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

import isEmpty from "lodash/isEmpty";

import { RoomSearchArea } from "../../enums";
import {
  getObjectByLocation,
  toUrlParams,
  tryParseArray,
} from "../../utils/common";
import { TSortOrder, TSortBy, Nullable } from "../../types";

const DEFAULT_EXCLUDE_SUBJECT: Nullable<string | boolean> = false;
const DEFAULT_FILTER_VALUE: Nullable<string> = null;
const DEFAULT_PAGE = 0;
const DEFAULT_PAGE_COUNT = 25;
const DEFAULT_PROVIDER: Nullable<string> = null;
const DEFAULT_QUOTA_FILTER: Nullable<string> = null;
const DEFAULT_SEARCH_AREA: RoomSearchArea | string = RoomSearchArea.Active;
const DEFAULT_SEARCH_IN_CONTENT: Nullable<boolean> = null;
const DEFAULT_SEARCH_TYPE: Nullable<string | boolean> = null;
const DEFAULT_SORT_BY: TSortBy | string = "DateAndTime";
const DEFAULT_SORT_ORDER: TSortOrder | string = "descending";
const DEFAULT_STORAGE_FILTER: Nullable<string> = null;
const DEFAULT_SUBJECT_FILTER: Nullable<string> = null;
const DEFAULT_SUBJECT_ID: Nullable<string> = null;
const DEFAULT_TAGS: Nullable<string | string[]> = null;
const DEFAULT_TOTAL = 0;
const DEFAULT_TYPE: Nullable<string | string[]> = null;
const DEFAULT_WITHOUT_TAGS: Nullable<string | boolean> = false;

const EXCLUDE_SUBJECT = "excludeSubject";
const FILTER_VALUE = "filterValue";
const PAGE = "page";
const PAGE_COUNT = "count";
const PROVIDER = "provider";
const QUOTA_FILTER = "quotaFilter";
const SEARCH_AREA = "searchArea";
const SEARCH_IN_CONTENT = "searchInContent";
const SEARCH_TYPE = "withSubfolders";
const SORT_BY = "sortBy";
const SORT_ORDER = "sortOrder";
const STORAGE_FILTER = "storageFilter";
const SUBJECT_FILTER = "subjectFilter";
const SUBJECT_ID = "subjectId";
const TAGS = "tags";
const TYPE = "type";
const WITHOUT_TAGS = "withoutTags";

export const toJSON = (filter: RoomsFilter) => {
  const filterObject = Object.entries(filter).reduce(
    (result, [key, value]) => {
      if (typeof value === "function" || value === null || value === false) {
        return result;
      }
      result[key] = value;
      return result;
    },
    {} as Record<string, string | number | boolean>,
  );

  return JSON.stringify(filterObject);
};

class RoomsFilter {
  page: number;

  pageCount: number;

  total: number;

  searchArea: RoomSearchArea | string;

  filterValue: Nullable<string>;

  provider: Nullable<string>;

  type: Nullable<string | string[]>;

  subjectId: Nullable<string>;

  searchInContent: Nullable<boolean>;

  withSubfolders: Nullable<string | boolean>;

  tags: Nullable<string | string[]>;

  sortBy: TSortBy | string;

  sortOrder: TSortOrder | string;

  excludeSubject: Nullable<string | boolean>;

  withoutTags: Nullable<string | boolean>;

  subjectFilter: Nullable<string>;

  quotaFilter: Nullable<string>;

  storageFilter: Nullable<string>;

  static getDefault(userId?: string, searchArea: string = DEFAULT_SEARCH_AREA) {
    const defaultFilter = new RoomsFilter(
      DEFAULT_PAGE,
      DEFAULT_PAGE_COUNT,
      DEFAULT_TOTAL,
    );

    defaultFilter.searchArea = searchArea;

    if (userId) {
      const storageKey =
        defaultFilter.searchArea === RoomSearchArea.Active
          ? `UserRoomsSharedFilter=${userId}`
          : `UserRoomsArchivedFilter=${userId}`;

      try {
        const filterStorageItem = JSON.parse(
          localStorage.getItem(storageKey) || "{}",
        );
        if (filterStorageItem) {
          Object.assign(defaultFilter, filterStorageItem);
        }
      } catch (e) {
        // console.log(e);
      }
    }

    return defaultFilter;
  }

  static clean() {
    return new RoomsFilter(DEFAULT_PAGE, DEFAULT_PAGE_COUNT, DEFAULT_TOTAL);
  }

  static getFilter(location: Location) {
    if (!location) return this.getDefault();

    const urlFilter = getObjectByLocation(location);

    if (!urlFilter) return null;

    const defaultFilter = RoomsFilter.getDefault();

    const {
      [PAGE]: urlPage,
      [PAGE_COUNT]: urlPageCount,
      [FILTER_VALUE]: urlFilterValue,
      [PROVIDER]: urlProvider,
      [TYPE]: urlType,
      [SUBJECT_ID]: urlSubjectId,
      [SUBJECT_FILTER]: urlSubjectFilter,
      [SEARCH_AREA]: urlSearchArea,
      [TAGS]: urlTags,
      [SORT_BY]: urlSortBy,
      [SORT_ORDER]: urlSortOrder,
      [EXCLUDE_SUBJECT]: urlExcludeSubject,
      [WITHOUT_TAGS]: urlWithoutTags,
      [QUOTA_FILTER]: urlQuotaFilter,
      [STORAGE_FILTER]: urlStorageFilter,
    } = urlFilter;

    const {
      page: defaultPage,
      pageCount: defaultPageCount,
      filterValue: defaultFilterValue,
      provider: defaultProvider,
      type: defaultType,
      subjectId: defaultSubjectId,
      subjectFilter: defaultSubjectFilter,
      searchArea: defaultSearchArea,
      tags: defaultTags,
      sortBy: defaultSortBy,
      sortOrder: defaultSortOrder,
      excludeSubject: defaultExcludeSubject,
      withoutTags: defaultWithoutTags,
      quotaFilter: defaultQuotaFilter,
      storageFilter: defaultStorageFilter,
    } = defaultFilter;

    const page = (urlPage && +urlPage - 1) || defaultPage;
    const pageCount = (urlPageCount && +urlPageCount) || defaultPageCount;
    const filterValue = (urlFilterValue as string) || defaultFilterValue;
    const provider = (urlProvider as string) || defaultProvider;
    const type = urlType || defaultType;
    const subjectId = (urlSubjectId as string) || defaultSubjectId;
    const subjectFilter =
      urlSubjectFilter?.toString() || defaultSubjectFilter?.toString();
    const searchInContent = false;
    const withSubfolders = false;
    const searchArea = (urlSearchArea as string) || defaultSearchArea;
    const tags = tryParseArray(urlTags as string) || defaultTags;
    const sortBy = (urlSortBy as string) || defaultSortBy;
    const sortOrder = (urlSortOrder as string) || defaultSortOrder;
    const excludeSubject =
      (urlExcludeSubject as string) || defaultExcludeSubject;
    const withoutTags = (urlWithoutTags as string) || defaultWithoutTags;
    const quotaFilter = (urlQuotaFilter as string) || defaultQuotaFilter;
    const storageFilter = (urlStorageFilter as string) || defaultStorageFilter;

    // TODO: remove it if search with subfolders and in content will be available and add it to the urlFilter and the defaultFilter
    // const searchInContent = urlSearchInContent || defaultSearchInContent;
    // const withSubfolders = urlSearchType || defaultSearchType;

    const newFilter = new RoomsFilter(
      page,
      pageCount,
      defaultFilter.total,
      filterValue,
      provider,
      type,
      subjectId,
      searchInContent,
      withSubfolders,
      searchArea,
      tags,
      sortBy,
      sortOrder,
      excludeSubject,
      withoutTags,
      subjectFilter,
      quotaFilter,
      storageFilter,
    );

    return newFilter;
  }

  constructor(
    page = DEFAULT_PAGE,
    pageCount = DEFAULT_PAGE_COUNT,
    total = DEFAULT_TOTAL,
    filterValue = DEFAULT_FILTER_VALUE,
    provider = DEFAULT_PROVIDER,
    type = DEFAULT_TYPE,
    subjectId = DEFAULT_SUBJECT_ID,
    searchInContent = DEFAULT_SEARCH_IN_CONTENT,
    withSubfolders = DEFAULT_SEARCH_TYPE,
    searchArea = DEFAULT_SEARCH_AREA,
    tags = DEFAULT_TAGS,
    sortBy = DEFAULT_SORT_BY,
    sortOrder = DEFAULT_SORT_ORDER,
    excludeSubject = DEFAULT_EXCLUDE_SUBJECT,
    withoutTags = DEFAULT_WITHOUT_TAGS,
    subjectFilter = DEFAULT_SUBJECT_FILTER,
    quotaFilter = DEFAULT_QUOTA_FILTER,
    storageFilter = DEFAULT_STORAGE_FILTER,
  ) {
    this.page = page;
    this.pageCount = pageCount;
    this.total = total;
    this.filterValue = filterValue;
    this.provider = provider;
    this.type = type;
    this.subjectId = subjectId;
    this.searchInContent = searchInContent;
    this.withSubfolders = withSubfolders;
    this.searchArea = searchArea;
    this.tags = tags;
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
    this.excludeSubject = excludeSubject;
    this.withoutTags = withoutTags;
    this.subjectFilter = subjectFilter;
    this.quotaFilter = quotaFilter;
    this.storageFilter = storageFilter;
  }

  getStartIndex = () => {
    return this.page * this.pageCount;
  };

  hasNext = () => {
    return this.total - this.getStartIndex() > this.pageCount;
  };

  hasPrev = () => {
    return this.page > 0;
  };

  toApiUrlParams = () => {
    const {
      page,
      pageCount,
      filterValue,
      provider,
      type,
      subjectId,
      searchInContent,
      withSubfolders,
      searchArea,
      tags,
      sortBy,
      sortOrder,
      excludeSubject,
      withoutTags,
      subjectFilter,
      quotaFilter,
      storageFilter,
    } = this;

    const dtoFilter = {
      page,
      pageCount,
      startIndex: this.getStartIndex(),
      filterValue: (filterValue ?? "").trim(),
      provider,
      type,
      subjectId,
      searchInContent,
      withSubfolders,
      searchArea,
      tags,
      sortBy,
      sortOrder,
      excludeSubject,
      withoutTags,
      subjectFilter,
      quotaFilter,
      storageFilter,
    };

    return toUrlParams(dtoFilter, true);
  };

  toUrlParams = (userId?: string, withLocalStorage?: boolean) => {
    const {
      page,
      pageCount,
      filterValue,
      provider,
      type,
      subjectId,
      searchInContent,
      withSubfolders,
      searchArea,
      tags,
      sortBy,
      sortOrder,
      excludeSubject,
      withoutTags,
      subjectFilter,
      quotaFilter,
      storageFilter,
    } = this;

    const dtoFilter: Record<string, unknown> = {
      ...(filterValue && { [FILTER_VALUE]: filterValue }),
      ...(provider && { [PROVIDER]: provider }),
      ...(type && { [TYPE]: type }),
      ...(subjectId && { [SUBJECT_ID]: subjectId }),
      ...(searchInContent && { [SEARCH_IN_CONTENT]: searchInContent }),
      ...(searchArea && { [SEARCH_AREA]: searchArea }),
      ...(tags && { [TAGS]: tags }),
      ...(pageCount !== DEFAULT_PAGE_COUNT && { [PAGE_COUNT]: pageCount }),
      ...(excludeSubject && { [EXCLUDE_SUBJECT]: excludeSubject }),
      ...(withoutTags && { [WITHOUT_TAGS]: withoutTags }),
      ...(subjectFilter?.toString() && {
        [SUBJECT_FILTER]: subjectFilter.toString(),
      }),
      ...(quotaFilter && { [QUOTA_FILTER]: quotaFilter }),
      ...(storageFilter && { [STORAGE_FILTER]: storageFilter }),
      [PAGE]: page + 1,
      [SORT_BY]: sortBy,
      [SORT_ORDER]: sortOrder,
      [SEARCH_TYPE]: withSubfolders,
    };

    const archivedFilterKey = `UserRoomsArchivedFilter=${userId}`;
    const sharedFilterKey = `UserRoomsSharedFilter=${userId}`;

    let archivedStorageFilter = null;
    let sharedStorageFilter = null;

    try {
      archivedStorageFilter = JSON.parse(
        localStorage.getItem(archivedFilterKey) || "{}",
      );
      sharedStorageFilter = JSON.parse(
        localStorage.getItem(sharedFilterKey) || "{}",
      );
    } catch (e) {
      // console.log(e);
    }

    const defaultFilter = new RoomsFilter(
      DEFAULT_PAGE,
      DEFAULT_PAGE_COUNT,
      DEFAULT_TOTAL,
    );

    const filterJSON = toJSON(dtoFilter as unknown as RoomsFilter);

    if (isEmpty(sharedStorageFilter) && userId) {
      localStorage.setItem(sharedFilterKey, toJSON(defaultFilter));
      sharedStorageFilter = filterJSON;
    }

    if (isEmpty(archivedStorageFilter) && userId) {
      defaultFilter.searchArea = RoomSearchArea.Archive;
      localStorage.setItem(archivedFilterKey, toJSON(defaultFilter));
      archivedStorageFilter = filterJSON;
    }

    const currentStorageFilter =
      dtoFilter.searchArea === RoomSearchArea.Active
        ? sharedStorageFilter
        : archivedStorageFilter;

    const urlParams =
      withLocalStorage && currentStorageFilter
        ? currentStorageFilter
        : dtoFilter;

    if (userId && !withLocalStorage) {
      if (dtoFilter.searchArea === RoomSearchArea.Active) {
        localStorage.setItem(sharedFilterKey, filterJSON);
      } else {
        localStorage.setItem(archivedFilterKey, filterJSON);
      }
    }

    return toUrlParams(urlParams, true);
  };

  getLastPage() {
    return Math.ceil(this.total / this.pageCount) - 1;
  }

  clone() {
    return new RoomsFilter(
      this.page,
      this.pageCount,
      this.total,
      this.filterValue,
      this.provider,
      this.type,
      this.subjectId,
      this.searchInContent,
      this.withSubfolders,
      this.searchArea,
      this.tags,
      this.sortBy,
      this.sortOrder,
      this.excludeSubject,
      this.withoutTags,
      this.subjectFilter,
      this.quotaFilter,
      this.storageFilter,
    );
  }

  equals(filter: RoomsFilter) {
    const typeEqual = Array.isArray(this.type)
      ? this.type.every((t: string) => filter.type?.includes(t))
      : this.type === filter.type;

    const tagsEqual = Array.isArray(this.tags)
      ? this.tags.every((t: string) => filter.tags?.includes(t))
      : this.tags === filter.tags;

    const equals =
      this.page === filter.page &&
      this.pageCount === filter.pageCount &&
      this.provider === filter.provider &&
      this.filterValue === filter.filterValue &&
      this.subjectId === filter.subjectId &&
      this.searchInContent === filter.searchInContent &&
      this.withSubfolders === filter.withSubfolders &&
      this.searchArea === filter.searchArea &&
      this.sortBy === filter.sortBy &&
      this.sortOrder === filter.sortOrder &&
      this.excludeSubject === filter.excludeSubject &&
      this.withoutTags === filter.withoutTags &&
      this.subjectFilter === filter.subjectFilter &&
      typeEqual &&
      tagsEqual;

    return equals;
  }
}

export default RoomsFilter;
