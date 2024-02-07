import { getObjectByLocation, toUrlParams } from "../../utils/common";

const DEFAULT_PAGE = 0;
const DEFAULT_PAGE_COUNT = 100;
const DEFAULT_TOTAL = 0;
const DEFAULT_SORT_BY = "title";
const DEFAULT_SORT_ORDER = "ascending";
const DEFAULT_SEARCH = "";
const DEFAULT_USER_ID = null;
const DEFAULT_SEARCH_BY_MANAGER = false;

const PAGE = "page";
const PAGE_COUNT = "pagecount";
const SEARCH = "search";
const SORT_BY = "sortby";
const SORT_ORDER = "sortorder";
const USER_ID = "subjectId";
const SEARCH_BY_MANAGER = "manager";

class Filter {
  static getDefault(total = DEFAULT_TOTAL) {
    return new Filter(DEFAULT_PAGE, DEFAULT_PAGE_COUNT, total);
  }

  static getFilter(location) {
    if (!location) return this.getDefault();

    const urlFilter = getObjectByLocation(location);

    if (!urlFilter) return null;

    const defaultFilter = Filter.getDefault();

    const search = urlFilter[SEARCH] || defaultFilter.search;

    const sortBy = urlFilter[SORT_BY] || defaultFilter.sortBy;

    const sortOrder = urlFilter[SORT_ORDER] || defaultFilter.sortOrder;

    const page =
      (urlFilter[PAGE] && +urlFilter[PAGE] - 1) || defaultFilter.page;

    const pageCount =
      (urlFilter[PAGE_COUNT] && +urlFilter[PAGE_COUNT]) ||
      defaultFilter.pageCount;

    const userId =
      (urlFilter[USER_ID] && urlFilter[USER_ID]) || defaultFilter.userId;

    const searchByManager =
      urlFilter[SEARCH_BY_MANAGER] || defaultFilter.searchByManager;

    return new Filter(
      page,
      pageCount,
      defaultFilter.total,
      sortBy,
      sortOrder,
      search,
      userId,
      searchByManager,
    );
  }

  constructor(
    page = DEFAULT_PAGE,
    pageCount = DEFAULT_PAGE_COUNT,
    total = DEFAULT_TOTAL,
    sortBy = DEFAULT_SORT_BY,
    sortOrder = DEFAULT_SORT_ORDER,
    search = DEFAULT_SEARCH,
    userId = DEFAULT_USER_ID,
    searchByManager = DEFAULT_SEARCH_BY_MANAGER,
  ) {
    this.page = page;
    this.pageCount = pageCount;
    this.total = total;
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
    this.search = search;
    this.userId = userId;
    this.searchByManager = searchByManager;
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
    const { pageCount, sortBy, sortOrder, search, userId, searchByManager } =
      this;

    const dtoFilter = {
      startIndex: this.getStartIndex(),
      count: pageCount,
      sortby: sortBy,
      sortorder: sortOrder,
      filtervalue: (search ?? "").trim(),
      userId,
      manager: searchByManager,
    };

    const str = toUrlParams(dtoFilter, true);
    return str;
  };

  toUrlParams = () => {
    const {
      page,
      pageCount,
      sortBy,
      sortOrder,
      search,
      userId,
      searchByManager,
    } = this;

    const dtoFilter = {};

    if (pageCount !== DEFAULT_PAGE_COUNT) {
      dtoFilter[PAGE_COUNT] = pageCount;
    }

    if (search) {
      dtoFilter[SEARCH] = search.trim();
    }

    if (userId) {
      dtoFilter[USER_ID] = userId;
    }

    if (searchByManager) {
      dtoFilter[SEARCH_BY_MANAGER] = searchByManager;
    }

    dtoFilter[PAGE] = page + 1;
    dtoFilter[SORT_BY] = sortBy;
    dtoFilter[SORT_ORDER] = sortOrder;

    const str = toUrlParams(dtoFilter, true);

    return str;
  };

  clone(onlySorting) {
    return onlySorting
      ? new Filter(
          DEFAULT_PAGE,
          DEFAULT_PAGE_COUNT,
          DEFAULT_TOTAL,
          this.sortBy,
          this.sortOrder,
        )
      : new Filter(
          this.page,
          this.pageCount,
          this.total,
          this.sortBy,
          this.sortOrder,
          this.search,
          this.userId,
          this.searchByManager,
        );
  }

  equals(filter) {
    return (
      this.search === filter.search &&
      this.sortBy === filter.sortBy &&
      this.sortOrder === filter.sortOrder &&
      this.page === filter.page &&
      this.pageCount === filter.pageCount &&
      this.userId === filter.userId &&
      this.searchByManager === filter.searchByManager
    );
  }
}

export default Filter;
