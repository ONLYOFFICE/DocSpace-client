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

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import queryString from "query-string";

import { ApplyFilterOption, FilterLocation, FilterType } from "../../enums";
import { getObjectByLocation, toUrlParams } from "../../utils/common";
import { TViewAs, TSortOrder, TSortBy } from "../../types";
import { validateAndFixObject } from "../../utils/filterValidator";

const DEFAULT_PAGE = 0;
const DEFAULT_PAGE_COUNT = 25;
const DEFAULT_TOTAL = 0;
const DEFAULT_SORT_BY: TSortBy | null = "DateAndTime";
const DEFAULT_SORT_ORDER: TSortOrder | null = "descending";
const DEFAULT_VIEW: TViewAs = "row";
const DEFAULT_FILTER_TYPE: FilterType | null = null;
const DEFAULT_SEARCH_TYPE: boolean | null = null; // withSubfolders
const DEFAULT_SEARCH: string | null = null;
const DEFAULT_AUTHOR_TYPE: string | null = null;
const DEFAULT_ROOM_ID: number | null = null;
const DEFAULT_FOLDER = "@my";
const DEFAULT_SEARCH_IN_CONTENT: boolean | null = null;
const DEFAULT_EXCLUDE_SUBJECT: boolean | null = null;
const DEFAULT_APPLY_FILTER_OPTION: ApplyFilterOption | null = null;
const DEFAULT_EXTENSION: string | null = null;
const DEFAULT_SEARCH_AREA: number | null = null;
const DEFAULT_KEY: string | null = null;
const DEFAULT_LOCATION: FilterLocation | null = null;

const SEARCH_TYPE = "withSubfolders";
const AUTHOR_TYPE = "authorType";
const FILTER_TYPE = "filterType";
const ROOM_ID = "roomId";
const SEARCH = "search";
const SORT_BY = "sortby";
const SORT_ORDER = "sortorder";
const VIEW_AS = "viewas";
const PAGE = "page";
const PAGE_COUNT = "count";
const FOLDER = "folder";
const PREVIEW = "preview";
const SEARCH_IN_CONTENT = "searchInContent";
const EXCLUDE_SUBJECT = "excludeSubject";
const APPLY_FILTER_OPTION = "applyFilterOption";
const EXTENSION = "extension";
const SEARCH_AREA = "searchArea";
const KEY = "key";
const DATE = "date";
const TAGS = "tags";
const LOCATION = "location";
const AREA = "area";

// TODO: add next params
// subjectGroup bool
// subjectID

const getOtherSearchParams = () => {
  const searchParams = new URLSearchParams(window.location.search);

  const filterSearchParams = [
    SEARCH_TYPE,
    AUTHOR_TYPE,
    FILTER_TYPE,
    ROOM_ID,
    SEARCH,
    SORT_BY,
    SORT_ORDER,
    VIEW_AS,
    PAGE,
    PAGE_COUNT,
    FOLDER,
    SEARCH_IN_CONTENT,
    EXCLUDE_SUBJECT,
    APPLY_FILTER_OPTION,
    EXTENSION,
    SEARCH_AREA,
    KEY,
    DATE,
    TAGS,
    LOCATION,
    AREA,
  ];

  filterSearchParams.forEach((param) => {
    const keys = Array.from(searchParams.keys());
    const keyToDelete = keys.find(
      (key) => key.toLowerCase() === param.toLowerCase(),
    );
    if (keyToDelete) {
      searchParams.delete(keyToDelete);
    }
  });

  return searchParams.toString();
};

export const typeDefinition = {
  filterType: Object.values(FilterType).map((value) => String(value)), // enum FilterType
  applyFilterOption: Object.values(ApplyFilterOption), // enum ApplyFilterOption
  sortBy: [
    "DateAndTime",
    "DateAndTimeCreation",
    "AZ",
    "Type",
    "Size",
    "Title",
    "Author",
  ] as TSortBy[], // type TSortBy
  sortOrder: ["ascending", "descending"] as TSortOrder[], // type TSortOrder
};

class FilesFilter {
  page: number;

  pageCount: number;

  sortBy: TSortBy | null;

  sortOrder: TSortOrder | null;

  viewAs: TViewAs;

  filterType: FilterType | null;

  withSubfolders: boolean | null;

  search: string | null;

  roomId: number | null;

  authorType: string | null;

  total: number;

  folder: string;

  searchInContent: boolean | null;

  excludeSubject: boolean | null;

  applyFilterOption: ApplyFilterOption | null;

  extension: string | null;

  startIndex: number | null = null;

  searchArea: number | null = null;

  key: string | null = null;

  location: FilterLocation | null = null;

  static getDefault(
    options: {
      pageCount?: number;
      total?: number;
      isRecentFolder?: boolean;
    } = {},
  ) {
    const {
      pageCount = DEFAULT_PAGE_COUNT,
      total = DEFAULT_TOTAL,
      isRecentFolder = false,
    } = options;

    const filter = new FilesFilter(DEFAULT_PAGE, pageCount, total);

    if (isRecentFolder) {
      filter.sortBy = null;
      filter.sortOrder = null;
      filter.folder = "@recent";
    }

    return filter;
  }

  static getFilter(location: Location): FilesFilter {
    if (!location) return this.getDefault();

    const isRecentFolder = location.pathname?.startsWith("/recent");

    const urlFilter = getObjectByLocation(location);

    const defaultFilter = FilesFilter.getDefault({ isRecentFolder });

    if (!urlFilter) return defaultFilter;

    const filterType =
      (urlFilter[FILTER_TYPE] && +urlFilter[FILTER_TYPE]) ||
      defaultFilter.filterType;

    const authorType =
      (urlFilter[AUTHOR_TYPE] &&
        urlFilter[AUTHOR_TYPE].includes("_") &&
        urlFilter[AUTHOR_TYPE]) ||
      defaultFilter.authorType;
    const roomId = urlFilter[ROOM_ID] || defaultFilter.roomId;
    const withSubfolders =
      (urlFilter[SEARCH_TYPE] && urlFilter[SEARCH_TYPE]) ||
      defaultFilter.withSubfolders;
    const search = urlFilter[SEARCH] || defaultFilter.search;
    const sortBy = urlFilter[SORT_BY] || defaultFilter.sortBy;
    const viewAs = urlFilter[VIEW_AS] || defaultFilter.viewAs;
    const sortOrder = urlFilter[SORT_ORDER] || defaultFilter.sortOrder;
    const page =
      (urlFilter[PAGE] && +urlFilter[PAGE] - 1) || defaultFilter.page;
    const pageCount =
      (urlFilter[PAGE_COUNT] && +urlFilter[PAGE_COUNT]) ||
      defaultFilter.pageCount;
    const folder = urlFilter[FOLDER] || defaultFilter.folder;
    const searchInContent =
      urlFilter[SEARCH_IN_CONTENT] || defaultFilter.searchInContent;
    const excludeSubject =
      urlFilter[EXCLUDE_SUBJECT] || defaultFilter.excludeSubject;
    const applyFilterOption =
      urlFilter[APPLY_FILTER_OPTION] || defaultFilter.applyFilterOption;
    const extension = urlFilter[EXTENSION] || defaultFilter.extension;
    const searchArea =
      (urlFilter[SEARCH_AREA] && urlFilter[SEARCH_AREA]) ||
      defaultFilter.searchArea;
    const key = (urlFilter[KEY] && urlFilter[KEY]) || defaultFilter.key;
    const locationFilter =
      (urlFilter[LOCATION] && +urlFilter[LOCATION]) || defaultFilter.location;

    const newFilter = new FilesFilter(
      page,
      pageCount,
      defaultFilter.total,
      sortBy,
      sortOrder,
      viewAs,
      filterType,
      withSubfolders,
      search,
      roomId,
      authorType,
      folder,
      searchInContent,
      excludeSubject,
      applyFilterOption,
      extension,
      searchArea,
      key,
      locationFilter,
    );

    return newFilter;
  }

  constructor(
    page = DEFAULT_PAGE,
    pageCount = DEFAULT_PAGE_COUNT,
    total = DEFAULT_TOTAL,
    sortBy = DEFAULT_SORT_BY,
    sortOrder = DEFAULT_SORT_ORDER,
    viewAs = DEFAULT_VIEW,
    filterType = DEFAULT_FILTER_TYPE,
    withSubfolders = DEFAULT_SEARCH_TYPE,
    search = DEFAULT_SEARCH,
    roomId = DEFAULT_ROOM_ID,
    authorType = DEFAULT_AUTHOR_TYPE,
    folder = DEFAULT_FOLDER,
    searchInContent = DEFAULT_SEARCH_IN_CONTENT,
    excludeSubject = DEFAULT_EXCLUDE_SUBJECT,
    applyFilterOption = DEFAULT_APPLY_FILTER_OPTION,
    extension = DEFAULT_EXTENSION,
    searchArea = DEFAULT_SEARCH_AREA,
    key = DEFAULT_KEY,
    location = DEFAULT_LOCATION,
  ) {
    this.page = page;
    this.pageCount = pageCount;
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
    this.viewAs = viewAs;
    this.filterType = filterType;
    this.withSubfolders = withSubfolders;
    this.search = search;
    this.roomId = roomId;
    this.authorType = authorType;
    this.total = total;
    this.folder = folder;
    this.searchInContent = searchInContent;
    this.excludeSubject = excludeSubject;
    this.applyFilterOption = applyFilterOption;
    this.extension = extension;
    this.searchArea = searchArea;
    this.key = key;
    this.location = location;
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
    const fixedValidObject = validateAndFixObject(this, typeDefinition);

    const {
      authorType,
      filterType,
      page,
      pageCount,
      search,
      sortBy,
      roomId,
      sortOrder,
      withSubfolders,
      startIndex,
      searchInContent,
      excludeSubject,
      applyFilterOption,
      extension,
      searchArea,
      location,
    } = fixedValidObject;

    const isFilterSet =
      filterType ||
      (search ?? "").trim() ||
      authorType ||
      applyFilterOption !== ApplyFilterOption.All
        ? withSubfolders
        : false;

    const userIdOrGroupId =
      authorType && authorType.includes("_")
        ? authorType.slice(authorType.indexOf("_") + 1)
        : null;

    const dtoFilter = {
      count: pageCount,
      startIndex: startIndex || this.getStartIndex(),
      page,
      sortby: sortBy,
      sortOrder,
      filterType,
      filterValue: (search ?? "").trim(),
      withSubfolders: isFilterSet,
      roomId,
      userIdOrGroupId,
      searchInContent,
      excludeSubject,
      applyFilterOption,
      extension,
      searchArea,
      location,
    };

    const str = toUrlParams(dtoFilter, true);
    return str;
  };

  toUrlParams = () => {
    const fixedValidObject = validateAndFixObject(this, typeDefinition);

    const {
      authorType,
      filterType,
      folder,
      page,
      pageCount,
      search,
      sortBy,
      sortOrder,
      withSubfolders,
      roomId,
      searchInContent,
      excludeSubject,
      applyFilterOption,
      extension,
      searchArea,
      key,
      location,
    } = fixedValidObject;

    const dtoFilter: { [key: string]: unknown } = {};

    const URLParams = queryString.parse(window.location.href);

    if (filterType) dtoFilter[FILTER_TYPE] = filterType;
    if (withSubfolders) dtoFilter[SEARCH_TYPE] = withSubfolders;
    if (search) dtoFilter[SEARCH] = search.trim();
    if (roomId) dtoFilter[ROOM_ID] = roomId;
    if (authorType) dtoFilter[AUTHOR_TYPE] = authorType;
    if (folder) dtoFilter[FOLDER] = folder;
    if (pageCount !== DEFAULT_PAGE_COUNT) dtoFilter[PAGE_COUNT] = pageCount;
    if (URLParams.preview) dtoFilter[PREVIEW] = URLParams.preview;
    if (searchInContent) dtoFilter[SEARCH_IN_CONTENT] = searchInContent;
    if (excludeSubject) dtoFilter[EXCLUDE_SUBJECT] = excludeSubject;
    if (applyFilterOption) dtoFilter[APPLY_FILTER_OPTION] = applyFilterOption;
    if (extension) dtoFilter[EXTENSION] = extension;
    if (searchArea) dtoFilter[SEARCH_AREA] = searchArea;
    if (key) dtoFilter[KEY] = key;
    if (location) dtoFilter[LOCATION] = location;

    dtoFilter[PAGE] = page + 1;
    dtoFilter[SORT_BY] = sortBy;
    dtoFilter[SORT_ORDER] = sortOrder;

    const otherSearchParams = getOtherSearchParams();

    const str = toUrlParams(dtoFilter, true);

    return `${str}&${otherSearchParams}`;
  };

  getLastPage() {
    return Math.ceil(this.total / this.pageCount) - 1;
  }

  isFiltered() {
    return Boolean(
      this.filterType ||
        this.withSubfolders ||
        this.search ||
        this.roomId ||
        this.authorType ||
        this.searchInContent ||
        this.excludeSubject ||
        this.applyFilterOption ||
        this.extension ||
        this.location,
    );
  }

  clone() {
    return new FilesFilter(
      this.page,
      this.pageCount,
      this.total,
      this.sortBy,
      this.sortOrder,
      this.viewAs,
      this.filterType,
      this.withSubfolders,
      this.search,
      this.roomId,
      this.authorType,
      this.folder,
      this.searchInContent,
      this.excludeSubject,
      this.applyFilterOption,
      this.extension,
      this.searchArea,
      this.key,
      this.location,
    );
  }

  equals(filter: FilesFilter) {
    const equals =
      this.filterType === filter.filterType &&
      this.withSubfolders === filter.withSubfolders &&
      this.search === filter.search &&
      this.roomId === filter.roomId &&
      this.authorType === filter.authorType &&
      this.sortBy === filter.sortBy &&
      this.sortOrder === filter.sortOrder &&
      this.viewAs === filter.viewAs &&
      this.page === filter.page &&
      this.folder === filter.folder &&
      this.pageCount === filter.pageCount &&
      this.searchInContent === filter.searchInContent &&
      this.excludeSubject === filter.excludeSubject &&
      this.applyFilterOption === filter.applyFilterOption &&
      this.extension === filter.extension &&
      this.searchArea === filter.searchArea &&
      this.location === filter.location;

    return equals;
  }
}

export default FilesFilter;
