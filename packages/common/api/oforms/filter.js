import { getDefaultOformLocale, toUrlParams } from "../../utils";

const PAGE = "pagination[page]";
const PAGE_SIZE = "pagination[pageSize]";
const CATEGORIZE_BY = "categorizeby";
const CATEGORY_URL = "categoryUrl";
const LOCALE = "locale";
const SORT = "sort";
const SORT_BY = "sortby";
const SORT_ORDER = "sortorder";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 150;
const DEFAULT_TOTAL = 0;
const DEFAULT_LOCALE = getDefaultOformLocale();
const DEFAULT_SORT_BY = "";
const DEFAULT_SORT_ORDER = "";
const DEFAULT_CATEGORIZE_BY = "";
const DEFAULT_CATEGORY_URL = "";

class OformsFilter {
  static getDefault(total = DEFAULT_TOTAL) {
    return new OformsFilter(
      DEFAULT_PAGE,
      DEFAULT_PAGE_SIZE,
      DEFAULT_CATEGORIZE_BY,
      DEFAULT_CATEGORY_URL,
      DEFAULT_LOCALE,
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
    const categoryUrl =
      urlFilter.get(CATEGORY_URL) || defaultFilter.categoryUrl;
    const locale = urlFilter.get(LOCALE) || defaultFilter.locale;
    const sortBy = urlFilter.get(SORT_BY) || defaultFilter.sortBy;
    const sortOrder = urlFilter.get(SORT_ORDER) || defaultFilter.sortOrder;

    const newFilter = new OformsFilter(
      page,
      pageSize,
      categorizeBy,
      categoryUrl,
      locale,
      sortBy,
      sortOrder,
      defaultFilter.total
    );

    return newFilter;
  }

  constructor(
    page = DEFAULT_PAGE,
    pageSize = DEFAULT_PAGE_SIZE,
    categorizeBy = DEFAULT_CATEGORIZE_BY,
    categoryUrl = DEFAULT_CATEGORY_URL,
    locale = DEFAULT_LOCALE,
    sortBy = DEFAULT_SORT_BY,
    sortOrder = DEFAULT_SORT_ORDER,
    total = DEFAULT_TOTAL
  ) {
    this.page = page;
    this.pageSize = pageSize;
    this.categorizeBy = categorizeBy;
    this.categoryUrl = categoryUrl;
    this.locale = locale;
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
    this.total = total;
  }

  toUrlParams = () => {
    const { categorizeBy, categoryUrl, sortBy, sortOrder, locale } = this;

    const dtoFilter = {};
    dtoFilter[categorizeBy] = categoryUrl;
    dtoFilter[LOCALE] = locale;
    dtoFilter[SORT_BY] = sortBy;
    dtoFilter[SORT_ORDER] = sortOrder;

    return toUrlParams(dtoFilter, true);
  };

  toApiUrlParams = () => {
    const {
      page,
      pageSize,
      categorizeBy,
      categoryUrl,
      sortBy,
      sortOrder,
      locale,
    } = this;

    const dtoFilter = {};
    dtoFilter[PAGE] = page;
    dtoFilter[PAGE_SIZE] = pageSize;
    if (categorizeBy && categoryUrl)
      dtoFilter[`filters[${categorizeBy}][urlReq][$eq]`] = categoryUrl;
    if (sortBy && sortOrder) dtoFilter[SORT] = `${sortBy}:${sortOrder}`;
    dtoFilter[LOCALE] = locale;

    return toUrlParams(dtoFilter, true);
  };

  clone() {
    return new OformsFilter(
      this.page,
      this.pageSize,
      this.categorizeBy,
      this.categoryUrl,
      this.locale,
      this.sortBy,
      this.sortOrder,
      this.total
    );
  }
}

export default OformsFilter;
