/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// @ts-nocheck

import { getObjectByLocation, toUrlParams } from "../../utils/common";
import { validateAndFixObject } from "../../utils/filterValidator";

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

export const typeDefinition = {
  sortBy: ["title", "membersCount", "manager"],
  sortOrder: ["ascending", "descending"],
};

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
    const fixedValidObject = validateAndFixObject(this, typeDefinition);

    const { pageCount, sortBy, sortOrder, search, userId, searchByManager } =
      fixedValidObject;

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
    const fixedValidObject = validateAndFixObject(this, typeDefinition);

    const {
      page,
      pageCount,
      sortBy,
      sortOrder,
      search,
      userId,
      searchByManager,
    } = fixedValidObject;

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
