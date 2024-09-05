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

import { getObjectByLocation, toUrlParams } from "../../utils/common";

const DEFAULT_PAGE = 0;
const DEFAULT_PAGE_COUNT = 25;
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

const ACTIVE_EMPLOYEE_STATUS = 1;

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
    );
  }

  static getFilter(location) {
    if (!location) return this.getDefault();

    const urlFilter = getObjectByLocation(location);

    if (!urlFilter) return null;

    const defaultFilter = Filter.getDefault();

    const employeeStatus =
      (urlFilter[EMPLOYEE_STATUS] && +urlFilter[EMPLOYEE_STATUS]) ||
      defaultFilter.employeeStatus;
    const activationStatus =
      (urlFilter[ACTIVATION_STATUS] && +urlFilter[ACTIVATION_STATUS]) ||
      defaultFilter.activationStatus;
    const role = urlFilter[ROLE] || defaultFilter.role;
    const group = urlFilter[GROUP] || defaultFilter.group;
    const search = urlFilter[SEARCH] || defaultFilter.search;
    const sortBy = urlFilter[SORT_BY] || defaultFilter.sortBy;
    const sortOrder = urlFilter[SORT_ORDER] || defaultFilter.sortOrder;
    const page =
      (urlFilter[PAGE] && +urlFilter[PAGE] - 1) || defaultFilter.page;
    const pageCount =
      (urlFilter[PAGE_COUNT] && +urlFilter[PAGE_COUNT]) ||
      defaultFilter.pageCount;
    const payments = urlFilter[PAYMENTS] || defaultFilter.payments;
    const accountLoginType =
      urlFilter[ACCOUNT_LOGIN_TYPE] || defaultFilter.accountLoginType;
    const withoutGroup = urlFilter[WITHOUT_GROUP] || defaultFilter.withoutGroup;
    const quotaFilter = urlFilter[QUOTA_FILTER] || defaultFilter.quotaFilter;

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
    );

    return newFilter;
  }

  constructor(
    page = DEFAULT_PAGE,
    pageCount = DEFAULT_PAGE_COUNT,
    total = DEFAULT_TOTAL,
    sortBy = DEFAULT_SORT_BY,
    sortOrder = DEFAULT_SORT_ORDER,
    employeeStatus = DEFAULT_EMPLOYEE_STATUS,
    activationStatus = DEFAULT_ACTIVATION_STATUS,
    role = DEFAULT_ROLE,
    search = DEFAULT_SEARCH,
    group = DEFAULT_GROUP,
    payments = DEFAULT_PAYMENTS,
    accountLoginType = DEFAULT_ACCOUNT_LOGIN_TYPE,
    withoutGroup = DEFAULT_WITHOUT_GROUP,
    quotaFilter = DEFAULT_QUOTA_FILTER,
    filterSeparator = DEFAULT_FILTER_SEPARATOR,
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

  toApiUrlParams = (fields = undefined) => {
    const {
      pageCount,
      sortBy,
      sortOrder,
      employeeStatus,
      // activationStatus,
      role,
      search,
      group,
      payments,
      accountLoginType,
      withoutGroup,
      quotaFilter,
      filterSeparator,
    } = this;

    let employeetype = null;

    if (Array.isArray(role)) {
      employeetype = { employeetypes: role };
    } else {
      employeetype = { employeetype: role };
    }

    let dtoFilter = {
      StartIndex: this.getStartIndex(),
      Count: pageCount,
      sortby: sortBy,
      sortorder: sortOrder,
      employeestatus: employeeStatus,
      // activationstatus: activationStatus,
      filtervalue: (search ?? "").trim(),
      groupId: group,
      fields,
      payments,
      accountLoginType,
      withoutGroup,
      quotaFilter,
      filterSeparator,
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
      // activationStatus,
      role,
      search,
      group,
      page,
      payments,
      accountLoginType,
      withoutGroup,
      quotaFilter,
      filterSeparator,
    } = this;

    const dtoFilter = {};

    if (employeeStatus) {
      dtoFilter[EMPLOYEE_STATUS] = employeeStatus;
    }

    // if (activationStatus) {
    //   dtoFilter[ACTIVATION_STATUS] = activationStatus;
    // }

    if (role) {
      dtoFilter[ROLE] = role;
    }

    if (group) {
      dtoFilter[GROUP] = group;
    }

    if (search) {
      dtoFilter[SEARCH] = search.trim();
    }

    if (pageCount !== DEFAULT_PAGE_COUNT) {
      dtoFilter[PAGE_COUNT] = pageCount;
    }

    if (withoutGroup) {
      dtoFilter[WITHOUT_GROUP] = withoutGroup;
    }

    if (quotaFilter) dtoFilter[QUOTA_FILTER] = quotaFilter;

    if (filterSeparator) dtoFilter[FILTER_SEPARATOR] = filterSeparator;

    dtoFilter[PAGE] = page + 1;
    dtoFilter[SORT_BY] = sortBy;
    dtoFilter[SORT_ORDER] = sortOrder;
    dtoFilter[PAYMENTS] = payments;
    dtoFilter[ACCOUNT_LOGIN_TYPE] = accountLoginType;

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
        );
  }

  reset(idGroup) {
    if (idGroup) {
      return new Filter(
        0,
        this.pageCount,
        this.total,
        this.sortBy,
        this.sortOrder,
        null,
        null,
        null,
        "",
        idGroup,
        null,
        null,
        false,
        null,
      );
    }

    this.clone(true);
  }

  equals(filter) {
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
      this.filterSeparator === filter.filterSeparator;

    return equals;
  }
}

export default Filter;
