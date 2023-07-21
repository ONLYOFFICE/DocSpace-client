import { ApplyFilterOption } from "../../constants";
import { getObjectByLocation, toUrlParams } from "../../utils";
import queryString from "query-string";

const DEFAULT_PAGE = 0;
const DEFAULT_PAGE_COUNT = 25;
const DEFAULT_TOTAL = 0;
const DEFAULT_SORT_BY = "DateAndTime";
const DEFAULT_SORT_ORDER = "descending";
const DEFAULT_VIEW = "row";
const DEFAULT_FILTER_TYPE = null;
const DEFAULT_SEARCH_TYPE = true; //withSubfolders
const DEFAULT_SEARCH = null;
const DEFAULT_AUTHOR_TYPE = null;
const DEFAULT_ROOM_ID = null;
const DEFAULT_SEARCH_IN_CONTENT = null;
const DEFAULT_EXCLUDE_SUBJECT = null;
const DEFAULT_APPLY_FILTER_OPTION = null;

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
const ROLEID = "roleid";
const PREVIEW = "preview";
const SEARCH_IN_CONTENT = "searchInContent";
const EXCLUDE_SUBJECT = "excludeSubject";
const APPLY_FILTER_OPTION = "applyFilterOption";

// TODO: add next params
// subjectGroup bool
// subjectID

type SelectedType = {
  key: string | number;
  label: string;
  type: string;
};

class RoleFilter {
  public startIndex?: number;

  static getDefault(total = DEFAULT_TOTAL) {
    return new RoleFilter(DEFAULT_PAGE, DEFAULT_PAGE_COUNT, total);
  }

  static getFilter(location: Location) {
    if (!location) return this.getDefault();

    const urlFilter = getObjectByLocation(location);

    if (!urlFilter) return null;

    const defaultFilter = RoleFilter.getDefault();

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
    const role = urlFilter[ROLEID] || defaultFilter.roleid;
    const searchInContent =
      urlFilter[SEARCH_IN_CONTENT] || defaultFilter.searchInContent;
    const excludeSubject =
      urlFilter[EXCLUDE_SUBJECT] || defaultFilter.excludeSubject;
    const applyFilterOption =
      urlFilter[APPLY_FILTER_OPTION] || defaultFilter.applyFilterOption;

    const newFilter = new RoleFilter(
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
      defaultFilter.selectedItem,
      role,
      searchInContent,
      excludeSubject,
      applyFilterOption
    );

    return newFilter;
  }

  constructor(
    public page: number = DEFAULT_PAGE,
    public pageCount: number = DEFAULT_PAGE_COUNT,
    public total: number = DEFAULT_TOTAL,
    public sortBy: string = DEFAULT_SORT_BY,
    public sortOrder: string = DEFAULT_SORT_ORDER,
    public viewAs: string = DEFAULT_VIEW,
    public filterType: string | null = DEFAULT_FILTER_TYPE,
    public withSubfolders: boolean = DEFAULT_SEARCH_TYPE,
    public search: string | null = DEFAULT_SEARCH,
    public roomId = DEFAULT_ROOM_ID,
    public authorType: string | null = DEFAULT_AUTHOR_TYPE,
    public selectedItem?: SelectedType,
    public roleid?: string | number,
    public searchInContent = DEFAULT_SEARCH_IN_CONTENT,
    public excludeSubject = DEFAULT_EXCLUDE_SUBJECT,
    public applyFilterOption = DEFAULT_APPLY_FILTER_OPTION
  ) {}

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
    } = this;

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
      startIndex: startIndex ? startIndex : this.getStartIndex(),
      page: page,
      sortby: sortBy,
      sortOrder: sortOrder,
      filterType: filterType,
      filterValue: (search ?? "").trim(),
      withSubfolders: isFilterSet,
      roomId: roomId,
      userIdOrGroupId,
      searchInContent,
      excludeSubject,
      applyFilterOption,
    };

    const str = toUrlParams(dtoFilter, true);
    return str;
  };

  toUrlParams = () => {
    const {
      authorType,
      filterType,
      roleid,
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
    } = this;

    const dtoFilter: Record<string, {}> = {};

    const URLParams = queryString.parse(window.location.href);

    if (roleid) dtoFilter[ROLEID] = roleid;
    if (filterType) dtoFilter[FILTER_TYPE] = filterType;
    if (withSubfolders) dtoFilter[SEARCH_TYPE] = withSubfolders;
    if (search) dtoFilter[SEARCH] = search.trim();
    if (roomId) dtoFilter[ROOM_ID] = roomId;
    if (authorType) dtoFilter[AUTHOR_TYPE] = authorType;
    if (pageCount !== DEFAULT_PAGE_COUNT) dtoFilter[PAGE_COUNT] = pageCount;
    if (URLParams.preview) dtoFilter[PREVIEW] = URLParams.preview;
    if (searchInContent) dtoFilter[SEARCH_IN_CONTENT] = searchInContent;
    if (excludeSubject) dtoFilter[EXCLUDE_SUBJECT] = excludeSubject;
    if (applyFilterOption) dtoFilter[APPLY_FILTER_OPTION] = applyFilterOption;

    dtoFilter[PAGE] = page + 1;
    dtoFilter[SORT_BY] = sortBy;
    dtoFilter[SORT_ORDER] = sortOrder;

    const str = toUrlParams(dtoFilter, true);
    return str;
  };

  getLastPage() {
    return Math.ceil(this.total / this.pageCount) - 1;
  }

  clone() {
    return new RoleFilter(
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
      this.selectedItem,
      this.roleid,
      this.searchInContent,
      this.excludeSubject,
      this.applyFilterOption
    );
  }

  equals(filter: RoleFilter) {
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
      this.selectedItem?.key === filter.selectedItem?.key &&
      this.roleid === filter.roleid &&
      this.pageCount === filter.pageCount &&
      this.searchInContent === filter.searchInContent &&
      this.excludeSubject === filter.excludeSubject &&
      this.applyFilterOption === filter.applyFilterOption;

    return equals;
  }
}

export default RoleFilter;
