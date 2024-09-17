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

/* eslint-disable class-methods-use-this */
/* eslint-disable guard-for-in */
import transform from "lodash/transform";
import { RoomSearchArea } from "../../enums";
import {
  getObjectByLocation,
  toUrlParams,
  tryParseArray,
} from "../../utils/common";

const PAGE = "page";
const PAGE_COUNT = "count";
const DEFAULT_PAGE = 0;
const DEFAULT_PAGE_COUNT = 25;
const DEFAULT_TOTAL = 0;

const FILTER_VALUE = "filterValue";
const DEFAULT_FILTER_VALUE = null;

const PROVIDER = "provider";
const DEFAULT_PROVIDER = null;

const TYPE = "type";
const DEFAULT_TYPE = null;

const SUBJECT_ID = "subjectId";
const DEFAULT_SUBJECT_ID = null;

const SEARCH_IN_CONTENT = "searchInContent";
const DEFAULT_SEARCH_IN_CONTENT = null;

const SEARCH_TYPE = "withSubfolders";
const DEFAULT_SEARCH_TYPE = null;

const SEARCH_AREA = "searchArea";
const DEFAULT_SEARCH_AREA = RoomSearchArea.Active;

const TAGS = "tags";
const DEFAULT_TAGS = null;

const SORT_BY = "sortBy";
const DEFAULT_SORT_BY = "DateAndTime";

const SORT_ORDER = "sortOrder";
const DEFAULT_SORT_ORDER = "descending";

const EXCLUDE_SUBJECT = "excludeSubject";
const DEFAULT_EXCLUDE_SUBJECT = false;

const WITHOUT_TAGS = "withoutTags";
const DEFAULT_WITHOUT_TAGS = false;

const SUBJECT_FILTER = "subjectFilter";
const DEFAULT_SUBJECT_FILTER = null;

const QUOTA_FILTER = "quotaFilter";
const DEFAULT_QUOTA_FILTER = null;

const STORAGE_FILTER = "storageFilter";
const DEFAULT_STORAGE_FILTER = null;

export const toJSON = (filter) => {
  const filterObject = transform(
    filter,
    (result, value, key) => {
      if (value instanceof Function) return result;
      if (value === null || value === false) return result;

      result[key] = value;
    },
    {},
  );

  return JSON.stringify(filterObject);
};

class RoomsFilter {
  static getDefault(userId, searchArea) {
    const defaultFilter = new RoomsFilter(
      DEFAULT_PAGE,
      DEFAULT_PAGE_COUNT,
      DEFAULT_TOTAL,
    );
    defaultFilter.searchArea = searchArea || DEFAULT_SEARCH_AREA;

    if (userId) {
      try {
        const filterStorageItem =
          defaultFilter.searchArea === RoomSearchArea.Active
            ? JSON.parse(
                localStorage.getItem(`UserRoomsSharedFilter=${userId}`),
              )
            : JSON.parse(
                localStorage.getItem(`UserRoomsArchivedFilter=${userId}`),
              );
        if (filterStorageItem) {
          // eslint-disable-next-line no-restricted-syntax
          for (const filterProperty in filterStorageItem) {
            defaultFilter[filterProperty] = filterStorageItem[filterProperty];
          }
        }
      } catch (e) {
        return defaultFilter;
      }
    }

    return defaultFilter;
  }

  static clean() {
    return new RoomsFilter(DEFAULT_PAGE, DEFAULT_PAGE_COUNT, DEFAULT_TOTAL);
  }

  static getFilter(location) {
    if (!location) return this.getDefault();

    const urlFilter = getObjectByLocation(location);

    if (!urlFilter) return null;

    const defaultFilter = RoomsFilter.getDefault();

    const page =
      (urlFilter[PAGE] && +urlFilter[PAGE] - 1) || defaultFilter.page;

    const pageCount =
      (urlFilter[PAGE_COUNT] && +urlFilter[PAGE_COUNT]) ||
      defaultFilter.pageCount;

    const filterValue =
      (urlFilter[FILTER_VALUE] && urlFilter[FILTER_VALUE]) ||
      defaultFilter.filterValue;

    const provider =
      (urlFilter[PROVIDER] && urlFilter[PROVIDER]) || defaultFilter.filterType;

    const type = (urlFilter[TYPE] && urlFilter[TYPE]) || defaultFilter.type;

    const subjectId =
      (urlFilter[SUBJECT_ID] && urlFilter[SUBJECT_ID]) ||
      defaultFilter.subjectId;

    const subjectFilter =
      (urlFilter[SUBJECT_FILTER]?.toString() &&
        urlFilter[SUBJECT_FILTER]?.toString()) ||
      defaultFilter.subjectFilter?.toString();

    // TODO: remove it if search with subfolders and in content will be available
    // const searchInContent = urlFilter[SEARCH_IN_CONTENT]
    //   ? urlFilter[SEARCH_IN_CONTENT] === "true"
    //   : defaultFilter.searchInContent;

    // const withSubfolders = urlFilter[SEARCH_TYPE]
    //   ? urlFilter[SEARCH_TYPE] === "true"
    //   : defaultFilter.withSubfolders;

    const searchInContent = false;
    const withSubfolders = false;

    const searchArea =
      (urlFilter[SEARCH_AREA] && urlFilter[SEARCH_AREA]) ||
      defaultFilter.searchArea;

    const tags = tryParseArray(urlFilter[TAGS]) || defaultFilter.tags;

    const sortBy = urlFilter[SORT_BY] || defaultFilter.sortBy;

    const sortOrder = urlFilter[SORT_ORDER] || defaultFilter.sortOrder;

    const excludeSubject =
      urlFilter[EXCLUDE_SUBJECT] || defaultFilter.excludeSubject;

    const withoutTags = urlFilter[WITHOUT_TAGS] || defaultFilter.withoutTags;
    const quotaFilter = urlFilter[QUOTA_FILTER] || defaultFilter.quotaFilter;

    const storageFilter =
      (urlFilter[STORAGE_FILTER] && urlFilter[STORAGE_FILTER]) ||
      defaultFilter.storageFilter;

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
      count: pageCount,
      page,
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

    const str = toUrlParams(dtoFilter, true);
    return str;
  };

  toUrlParams = (userId, withLocalStorage) => {
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

    const dtoFilter = {};

    if (filterValue) {
      dtoFilter[FILTER_VALUE] = filterValue;
    }

    if (provider) {
      dtoFilter[PROVIDER] = provider;
    }

    if (type) {
      dtoFilter[TYPE] = type;
    }

    if (subjectId) {
      dtoFilter[SUBJECT_ID] = subjectId;
    }

    if (searchInContent) {
      dtoFilter[SEARCH_IN_CONTENT] = searchInContent;
    }

    if (searchArea) {
      dtoFilter[SEARCH_AREA] = searchArea;
    }

    if (tags) {
      dtoFilter[TAGS] = tags;
    }

    if (pageCount !== DEFAULT_PAGE_COUNT) {
      dtoFilter[PAGE_COUNT] = pageCount;
    }

    if (excludeSubject) {
      dtoFilter[EXCLUDE_SUBJECT] = excludeSubject;
    }

    if (withoutTags) {
      dtoFilter[WITHOUT_TAGS] = withoutTags;
    }

    if (subjectFilter?.toString()) {
      dtoFilter[SUBJECT_FILTER] = subjectFilter.toString();
    }

    if (quotaFilter) dtoFilter[QUOTA_FILTER] = quotaFilter;
    if (storageFilter) dtoFilter[STORAGE_FILTER] = storageFilter;

    dtoFilter[PAGE] = page + 1;
    dtoFilter[SORT_BY] = sortBy;
    dtoFilter[SORT_ORDER] = sortOrder;
    dtoFilter[SEARCH_TYPE] = withSubfolders;

    let archivedStorageFilter = null;
    let sharedStorageFilter = null;

    try {
      archivedStorageFilter = JSON.parse(
        localStorage.getItem(`UserRoomsArchivedFilter=${userId}`),
      );

      sharedStorageFilter = JSON.parse(
        localStorage.getItem(`UserRoomsSharedFilter=${userId}`),
      );
    } catch (e) {
      //  console.log(e);
    }

    const defaultFilter = new RoomsFilter(
      DEFAULT_PAGE,
      DEFAULT_PAGE_COUNT,
      DEFAULT_TOTAL,
    );

    if (!sharedStorageFilter && userId) {
      localStorage.setItem(
        `UserRoomsSharedFilter=${userId}`,
        toJSON(defaultFilter),
      );
    }

    if (!archivedStorageFilter && userId) {
      defaultFilter.searchArea = RoomSearchArea.Archive;
      localStorage.setItem(
        `UserRoomsArchivedFilter=${userId}`,
        toJSON(defaultFilter),
      );
    }

    const filterJSON = toJSON(dtoFilter);

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
        localStorage.setItem(`UserRoomsSharedFilter=${userId}`, filterJSON);
      } else {
        localStorage.setItem(`UserRoomsArchivedFilter=${userId}`, filterJSON);
      }
    }

    const str = toUrlParams(urlParams, true);
    return str;
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

  equals(filter) {
    const typeEqual =
      this.type.length === filter.type.length &&
      this.type.forEach((type) => filter.type.includes(type));

    const tagsEqual =
      this.tags.length === filter.tags.length &&
      this.tags.forEach((tag) => filter.tags.includes(tag));

    const equals =
      this.page === filter.page &&
      this.pageCount === filter.pageCount &&
      this.provider === filter.provider &&
      this.filterValue === filter.filterValue &&
      typeEqual &&
      this.subjectId === filter.subjectId &&
      this.searchInContent === filter.searchInContent &&
      this.withSubfolders === filter.withSubfolders &&
      this.searchArea === filter.searchArea &&
      tagsEqual &&
      this.sortBy === filter.sortBy &&
      this.sortOrder === filter.sortOrder &&
      this.excludeSubject === filter.excludeSubject &&
      this.withoutTags === filter.withoutTags &&
      this.subjectFilter === filter.subjectFilter;

    return equals;
  }
}

export default RoomsFilter;
