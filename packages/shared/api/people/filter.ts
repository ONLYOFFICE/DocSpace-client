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

import {
  AccountLoginType,
  EmployeeActivationStatus,
  EmployeeStatus,
  EmployeeType,
  PaymentsType,
} from "../../enums";
import { Nullable } from "../../types";
import { getObjectByLocation, toUrlParams } from "../../utils/common";
import { TFilterSortBy, TSortOrder } from "./types";

const DEFAULT_PAGE = 0;
const DEFAULT_PAGE_COUNT = 100;
const DEFAULT_TOTAL = 0;

const DEFAULT_SORT_BY = "displayname";
const DEFAULT_SORT_ORDER = "ascending";

const DEFAULT_EMPLOYEE_STATUS = null;
const DEFAULT_ACTIVATION_STATUS = null;
const DEFAULT_ROLE = null;
const DEFAULT_SEARCH = "";
const DEFAULT_GROUP = null;
const DEFAULT_PAYMENTS = null;
const DEFAULT_ACCOUNT_LOGIN_TYPE = null;
const DEFAULT_WITHOUT_GROUP = false;
const DEFAULT_QUOTA_FILTER = null;
const DEFAULT_FILTER_SEPARATOR = null;
const DEFAULT_USER_ID = null;
const DEFAULT_INVITED_BY_ME = false;

const ACTIVE_EMPLOYEE_STATUS = EmployeeStatus.Active;

const EMPLOYEE_STATUS = "employeestatus";
const ACTIVATION_STATUS = "activationstatus";
const ROLE = "employeeType";
const GROUP = "group";
const SEARCH = "search";
const SORT_BY = "sortby";
const SORT_ORDER = "sortorder";
const PAGE = "page";
const PAGE_COUNT = "pagecount";
const PAYMENTS = "payments";
const ACCOUNT_LOGIN_TYPE = "accountLoginType";
const WITHOUT_GROUP = "withoutGroup";
const QUOTA_FILTER = "quotaFilter";
const FILTER_SEPARATOR = "filterSeparator";
const USER_ID = "userid";
const INVITED_BY_ME = "invitedbyme";

class Filter {
  static getDefault(total = DEFAULT_TOTAL) {
    return new Filter(DEFAULT_PAGE, DEFAULT_PAGE_COUNT, total);
  }

  static getFilterWithOutDisabledUser() {
    return new Filter(
      DEFAULT_PAGE,
      DEFAULT_PAGE_COUNT,
      DEFAULT_TOTAL,
      DEFAULT_SORT_BY,
      DEFAULT_SORT_ORDER,
      ACTIVE_EMPLOYEE_STATUS,
      DEFAULT_ACTIVATION_STATUS,
      DEFAULT_ROLE,
      DEFAULT_SEARCH,
      DEFAULT_GROUP,
      DEFAULT_PAYMENTS,
      DEFAULT_ACCOUNT_LOGIN_TYPE,
      DEFAULT_WITHOUT_GROUP,
      DEFAULT_QUOTA_FILTER,
      DEFAULT_FILTER_SEPARATOR,
      DEFAULT_INVITED_BY_ME,
      DEFAULT_USER_ID,
    );
  }

  static getFilter(location: Location) {
    if (!location) return this.getDefault();

    const urlFilter = getObjectByLocation(location);

    if (!urlFilter) return null;

    const defaultFilter = Filter.getDefault();

    const employeeStatus =
      ((urlFilter[EMPLOYEE_STATUS] &&
        +urlFilter[EMPLOYEE_STATUS]) as typeof defaultFilter.employeeStatus) ||
      defaultFilter.employeeStatus;
    const activationStatus =
      ((urlFilter[ACTIVATION_STATUS] &&
        +urlFilter[
          ACTIVATION_STATUS
        ]) as typeof defaultFilter.activationStatus) ||
      defaultFilter.activationStatus;
    const role =
      (urlFilter[ROLE] as typeof defaultFilter.role) || defaultFilter.role;
    const group =
      (urlFilter[GROUP] as typeof defaultFilter.group) || defaultFilter.group;
    const search =
      (urlFilter[SEARCH] as typeof defaultFilter.search) ||
      defaultFilter.search;
    const sortBy =
      (urlFilter[SORT_BY] as typeof defaultFilter.sortBy) ||
      defaultFilter.sortBy;
    const sortOrder =
      (urlFilter[SORT_ORDER] as typeof defaultFilter.sortOrder) ||
      defaultFilter.sortOrder;
    const page =
      ((urlFilter[PAGE] &&
        +urlFilter[PAGE] - 1) as typeof defaultFilter.page) ||
      defaultFilter.page;
    const pageCount =
      ((urlFilter[PAGE_COUNT] &&
        +urlFilter[PAGE_COUNT]) as typeof defaultFilter.pageCount) ||
      defaultFilter.pageCount;
    const payments =
      (urlFilter[PAYMENTS] as typeof defaultFilter.payments) ||
      defaultFilter.payments;
    const accountLoginType =
      (urlFilter[
        ACCOUNT_LOGIN_TYPE
      ] as typeof defaultFilter.accountLoginType) ||
      defaultFilter.accountLoginType;
    const withoutGroup =
      (urlFilter[WITHOUT_GROUP] &&
        ((urlFilter[WITHOUT_GROUP] ===
          "true") as typeof defaultFilter.withoutGroup)) ||
      defaultFilter.withoutGroup;
    const quotaFilter =
      (urlFilter[QUOTA_FILTER] &&
        (+urlFilter[QUOTA_FILTER] as typeof defaultFilter.quotaFilter)) ||
      defaultFilter.quotaFilter;
    const filterSeparator =
      urlFilter[FILTER_SEPARATOR] || defaultFilter.filterSeparator;
    const invitedByMe =
      (urlFilter[INVITED_BY_ME] &&
        ((urlFilter[INVITED_BY_ME] ===
          "true") as typeof defaultFilter.invitedByMe)) ||
      defaultFilter.withoutGroup;
    const userId = urlFilter[USER_ID] || defaultFilter.userId;

    const newFilter = new Filter(
      page,
      pageCount,
      defaultFilter.total,
      sortBy,
      sortOrder,
      employeeStatus,
      activationStatus,
      role,
      search,
      group,
      payments,
      accountLoginType,
      withoutGroup,
      quotaFilter,
      filterSeparator,
      invitedByMe,
      userId,
    );

    return newFilter;
  }

  constructor(
    public page: number = DEFAULT_PAGE,
    public pageCount: number = DEFAULT_PAGE_COUNT,
    public total: number = DEFAULT_TOTAL,
    public sortBy: TFilterSortBy = DEFAULT_SORT_BY,
    public sortOrder: TSortOrder = DEFAULT_SORT_ORDER,
    public employeeStatus: Nullable<EmployeeStatus> = DEFAULT_EMPLOYEE_STATUS,
    public activationStatus: Nullable<EmployeeActivationStatus> = DEFAULT_ACTIVATION_STATUS,
    public role: Nullable<EmployeeType> = DEFAULT_ROLE,
    public search: string = DEFAULT_SEARCH,
    public group: Nullable<string> = DEFAULT_GROUP,
    public payments: Nullable<PaymentsType> = DEFAULT_PAYMENTS,
    public accountLoginType: Nullable<AccountLoginType> = DEFAULT_ACCOUNT_LOGIN_TYPE,
    public withoutGroup: boolean = DEFAULT_WITHOUT_GROUP,
    public quotaFilter: Nullable<number> = DEFAULT_QUOTA_FILTER,
    public filterSeparator: Nullable<string> = DEFAULT_FILTER_SEPARATOR,
    public invitedByMe: boolean = DEFAULT_INVITED_BY_ME,
    public userId: Nullable<string> = DEFAULT_USER_ID,
  ) {
    this.page = page;
    this.pageCount = pageCount;
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
    this.employeeStatus = employeeStatus;
    this.activationStatus = activationStatus;
    this.role = role;
    this.search = search;
    this.total = total;
    this.group = group;
    this.payments = payments;
    this.accountLoginType = accountLoginType;
    this.withoutGroup = withoutGroup;
    this.quotaFilter = quotaFilter;
    this.filterSeparator = filterSeparator;
    this.invitedByMe = invitedByMe;
    this.userId = userId;
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
      pageCount,
      sortBy,
      sortOrder,
      employeeStatus,
      role,
      search,
      group,
      payments,
      accountLoginType,
      withoutGroup,
      quotaFilter,
      filterSeparator,
      invitedByMe,
      userId,
    } = this;

    let employeetype = null;

    if (Array.isArray(role)) {
      employeetype = { employeetypes: role };
    } else {
      employeetype = { employeetype: role };
    }

    let dtoFilter = {
      startindex: this.getStartIndex(),
      count: pageCount,
      sortby: sortBy,
      sortorder: sortOrder,
      employeestatus: employeeStatus,
      filtervalue: (search ?? "").trim(),
      groupId: group,
      payments,
      accountLoginType,
      withoutGroup,
      quotaFilter,
      filterSeparator,
      invitedByMe,
      userId,
    };

    dtoFilter = { ...dtoFilter, ...employeetype };

    const str = toUrlParams(dtoFilter, true);
    return str;
  };

  toUrlParams = () => {
    const {
      pageCount,
      sortBy,
      sortOrder,
      employeeStatus,
      role,
      search,
      group,
      page,
      payments,
      accountLoginType,
      withoutGroup,
      quotaFilter,
      filterSeparator,
      invitedByMe,
      userId,
    } = this;

    const dtoFilter: {
      [PAGE]: typeof page;
      [SORT_BY]: typeof sortBy;
      [SORT_ORDER]: typeof sortOrder;
      [EMPLOYEE_STATUS]?: typeof employeeStatus;
      [ROLE]?: typeof role;
      [GROUP]?: typeof group;
      [SEARCH]?: typeof search;
      [PAGE_COUNT]?: typeof pageCount;
      [WITHOUT_GROUP]?: typeof withoutGroup;
      [QUOTA_FILTER]?: typeof quotaFilter;
      [FILTER_SEPARATOR]?: typeof filterSeparator;
      [PAYMENTS]?: typeof payments;
      [ACCOUNT_LOGIN_TYPE]?: typeof accountLoginType;
      [INVITED_BY_ME]?: typeof invitedByMe;
      [USER_ID]?: typeof userId;
    } = {
      page: page + 1,
      sortby: sortBy,
      sortorder: sortOrder,
    };

    if (employeeStatus) dtoFilter[EMPLOYEE_STATUS] = employeeStatus;

    if (role) dtoFilter[ROLE] = role;

    if (group) dtoFilter[GROUP] = group;

    if (search) dtoFilter[SEARCH] = search.trim();

    if (pageCount !== DEFAULT_PAGE_COUNT) dtoFilter[PAGE_COUNT] = pageCount;

    if (withoutGroup) dtoFilter[WITHOUT_GROUP] = withoutGroup;

    if (quotaFilter) dtoFilter[QUOTA_FILTER] = quotaFilter;

    if (filterSeparator) dtoFilter[FILTER_SEPARATOR] = filterSeparator;

    if (payments) dtoFilter[PAYMENTS] = payments;

    if (accountLoginType) dtoFilter[ACCOUNT_LOGIN_TYPE] = accountLoginType;

    if (invitedByMe) dtoFilter[INVITED_BY_ME] = invitedByMe;

    if (userId) dtoFilter[USER_ID] = userId;

    const str = toUrlParams(dtoFilter, true);

    return str;
  };

  clone(onlySorting?: boolean) {
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
          this.employeeStatus,
          this.activationStatus,
          this.role,
          this.search,
          this.group,
          this.payments,
          this.accountLoginType,
          this.withoutGroup,
          this.quotaFilter,
          this.filterSeparator,
          this.invitedByMe,
          this.userId,
        );
  }

  equals(filter: Filter) {
    const equals =
      this.employeeStatus === filter.employeeStatus &&
      this.activationStatus === filter.activationStatus &&
      this.role === filter.role &&
      this.group === filter.group &&
      this.search === filter.search &&
      this.sortBy === filter.sortBy &&
      this.sortOrder === filter.sortOrder &&
      this.page === filter.page &&
      this.pageCount === filter.pageCount &&
      this.payments === filter.payments &&
      this.accountLoginType === filter.accountLoginType &&
      this.withoutGroup === filter.withoutGroup &&
      this.filterSeparator === filter.filterSeparator &&
      this.invitedByMe === filter.invitedByMe &&
      this.userId === filter.userId;

    return equals;
  }
}

export default Filter;
