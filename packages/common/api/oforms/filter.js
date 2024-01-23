import { toUrlParams } from "../../utils";

const PAGE = "pagination[page]";
const PAGE_SIZE = "pagination[pageSize]";
const CATEGORIZE_BY = "categorizeby";
const CATEGORY_ID = "categoryId";
const LOCALE = "locale";
const SEARCH = "filterValue";
const SORT = "sort";
const SORT_BY = "sortby";
const SORT_ORDER = "sortorder";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 150;
const DEFAULT_TOTAL = 0;
const DEFAULT_LOCALE = null;
const DEFAULT_SEARCH = "";
const DEFAULT_SORT_BY = "";
const DEFAULT_SORT_ORDER = "";
const DEFAULT_CATEGORIZE_BY = "";
const DEFAULT_CATEGORY_ID = "";

class OformsFilter {
  constructor(
    page = DEFAULT_PAGE,
    pageSize = DEFAULT_PAGE_SIZE,
    categorizeBy = DEFAULT_CATEGORIZE_BY,
    categoryId = DEFAULT_CATEGORY_ID,
    locale = DEFAULT_LOCALE,
    search = DEFAULT_SEARCH,
    sortBy = DEFAULT_SORT_BY,
    sortOrder = DEFAULT_SORT_ORDER,
    total = DEFAULT_TOTAL
  ) {
    this.page = page;
    this.pageSize = pageSize;
    this.categorizeBy = categorizeBy;
    this.categoryId = categoryId;
    this.locale = locale;
    this.search = search;
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
    this.total = total;
  }

  static getDefault(total = DEFAULT_TOTAL) {
    return new OformsFilter(
      DEFAULT_PAGE,
      DEFAULT_PAGE_SIZE,
      DEFAULT_CATEGORIZE_BY,
      DEFAULT_CATEGORY_ID,
      DEFAULT_LOCALE,
      DEFAULT_SEARCH,
      DEFAULT_SORT_BY,
      DEFAULT_SORT_ORDER,
      total
    );
  }

  static getFilter(location) {
    if (!location) return this.getDefault();

    const urlFilter = new URLSearchParams(location.search);
    if (!urlFilter) return null;

    const defaultFilter = OformsFilter.getDefault();
    const page =
      (urlFilter.get(PAGE) && +urlFilter.get(PAGE) - 1) || defaultFilter.page;
    const pageSize =
      (urlFilter.get(PAGE_SIZE) && +urlFilter.get(PAGE_SIZE)) ||
      defaultFilter.pageSize;
    const categorizeBy =
      urlFilter.get(CATEGORIZE_BY) || defaultFilter.categorizeBy;
    const categoryId = urlFilter.get(CATEGORY_ID) || defaultFilter.categoryId;
    const locale = urlFilter.get(LOCALE) || defaultFilter.locale;
    const search = urlFilter.get(SEARCH) || defaultFilter.search;
    const sortBy = urlFilter.get(SORT_BY) || defaultFilter.sortBy;
    const sortOrder = urlFilter.get(SORT_ORDER) || defaultFilter.sortOrder;

    const newFilter = new OformsFilter(
      page,
      pageSize,
      categorizeBy,
      categoryId,
      locale,
      search,
      sortBy,
      sortOrder,
      defaultFilter.total
    );

    return newFilter;
  }

  clone() {
    return new OformsFilter(
      this.page,
      this.pageSize,
      this.categorizeBy,
      this.categoryId,
      this.locale,
      this.search,
      this.sortBy,
      this.sortOrder,
      this.total
    );
  }

  toUrlParams = () => {
    const { categorizeBy, categoryId, locale, search, sortBy, sortOrder } =
      this;

    const dtoFilter = {};
    dtoFilter[CATEGORIZE_BY] = categorizeBy;
    dtoFilter[CATEGORY_ID] = categoryId;
    dtoFilter[LOCALE] = locale;
    dtoFilter[SEARCH] = search;
    dtoFilter[SORT_BY] = sortBy;
    dtoFilter[SORT_ORDER] = sortOrder;

    return toUrlParams(dtoFilter, true);
  };

  toApiUrlParams = () => {
    const {
      page,
      pageSize,
      categorizeBy,
      categoryId,
      locale,
      search,
      sortBy,
      sortOrder,
    } = this;

    const dtoFilter = {};
    dtoFilter[PAGE] = page;
    dtoFilter[PAGE_SIZE] = pageSize;
    if (categorizeBy && categoryId)
      dtoFilter[`filters[${categorizeBy}][id][$eq]`] = categoryId;
    dtoFilter[LOCALE] = locale;
    dtoFilter[`filters[name_form][$containsi]`] = search;
    if (sortBy && sortOrder) dtoFilter[SORT] = `${sortBy}:${sortOrder}`;

    return toUrlParams(dtoFilter, true);
  };
}

export default OformsFilter;
