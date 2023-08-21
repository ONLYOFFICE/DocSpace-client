import { getDefaultOformLocale, toUrlParams } from "../../utils";

const PAGE = "pagination[page]";
const PAGE_SIZE = "pagination[pageSize]";
const CATEGORIZE_BY = "categorizeby";
const CATEGORY_NAME = "categoryName";
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
const DEFAULT_CATEGORY_NAME = "";

class OformsFilter {
  static getDefault(total = DEFAULT_TOTAL) {
    return new OformsFilter(
      DEFAULT_PAGE,
      DEFAULT_PAGE_SIZE,
      DEFAULT_CATEGORIZE_BY,
      DEFAULT_CATEGORY_NAME,
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
    const categoryName =
      urlFilter.get(CATEGORY_NAME) || defaultFilter.categoryName;
    const locale = urlFilter.get(LOCALE) || defaultFilter.locale;
    const sortBy = urlFilter.get(SORT_BY) || defaultFilter.sortBy;
    const sortOrder = urlFilter.get(SORT_ORDER) || defaultFilter.sortOrder;

    const newFilter = new OformsFilter(
      page,
      pageSize,
      categorizeBy,
      categoryName,
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
    categoryName = DEFAULT_CATEGORY_NAME,
    locale = DEFAULT_LOCALE,
    sortBy = DEFAULT_SORT_BY,
    sortOrder = DEFAULT_SORT_ORDER,
    total = DEFAULT_TOTAL
  ) {
    this.page = page;
    this.pageSize = pageSize;
    this.categorizeBy = categorizeBy;
    this.categoryName = categoryName;
    this.locale = locale;
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
    this.total = total;
  }

  getStartIndex = () => {
    return this.page * this.pageSize;
  };

  toUrlParams = () => {
    const { categorizeBy, categoryName, sortBy, sortOrder, locale } = this;

    const dtoFilter = {};
    dtoFilter[CATEGORIZE_BY] = categorizeBy;
    dtoFilter[CATEGORY_NAME] = categoryName;
    dtoFilter[LOCALE] = locale;
    dtoFilter[SORT_BY] = sortBy;
    dtoFilter[SORT_ORDER] = sortOrder;

    return toUrlParams(dtoFilter, true);
  };

  toApiUrlParams = () => {
    const { categorizeBy, categoryName, sortBy, sortOrder, locale } = this;

    const dtoFilter = {};
    dtoFilter[categorizeBy] = categoryName;
    dtoFilter[LOCALE] = locale;
    if (sortBy && sortOrder) dtoFilter[SORT] = `${sortBy}:${sortOrder}`;

    console.log(toUrlParams(dtoFilter, true));
    return toUrlParams(dtoFilter, true);
  };

  clone() {
    return new OformsFilter(
      this.page,
      this.pageSize,
      this.categorizeBy,
      this.categoryName,
      this.locale,
      this.sortBy,
      this.sortOrder,
      this.total
    );
  }
}

export default OformsFilter;
