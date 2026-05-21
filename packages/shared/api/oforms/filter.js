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

import { toUrlParams } from "../../utils/common";
import { validateAndFixObject } from "../../utils/filterValidator";

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
const DEFAULT_EXTENSION = "pdf";

const typeDefinition = {
  sortBy: ["name_form", "updatedAt"],
  sortOrder: ["asc", "desc"],
};

class OformsFilter {
  constructor(
    page = DEFAULT_PAGE,
    pageSize = DEFAULT_PAGE_SIZE,
    categorizeBy = DEFAULT_CATEGORIZE_BY,
    categoryId = DEFAULT_CATEGORY_ID,
    locale = DEFAULT_LOCALE,
    search = DEFAULT_SEARCH,
    extension = DEFAULT_EXTENSION,
    sortBy = DEFAULT_SORT_BY,
    sortOrder = DEFAULT_SORT_ORDER,
    total = DEFAULT_TOTAL,
  ) {
    this.page = page;
    this.pageSize = pageSize;
    this.categorizeBy = categorizeBy;
    this.categoryId = categoryId;
    this.locale = locale;
    this.search = search;
    this.extension = extension;
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
    this.total = total;
  }

  static getDefault(total = DEFAULT_TOTAL, extension = DEFAULT_EXTENSION) {
    return new OformsFilter(
      DEFAULT_PAGE,
      DEFAULT_PAGE_SIZE,
      DEFAULT_CATEGORIZE_BY,
      DEFAULT_CATEGORY_ID,
      DEFAULT_LOCALE,
      DEFAULT_SEARCH,
      extension,
      DEFAULT_SORT_BY,
      DEFAULT_SORT_ORDER,
      total,
    );
  }

  static getDefaultDocx(total = DEFAULT_TOTAL, extension = "docx") {
    return new OformsFilter(
      DEFAULT_PAGE,
      DEFAULT_PAGE_SIZE,
      DEFAULT_CATEGORIZE_BY,
      DEFAULT_CATEGORY_ID,
      DEFAULT_LOCALE,
      DEFAULT_SEARCH,
      extension,
      DEFAULT_SORT_BY,
      DEFAULT_SORT_ORDER,
      total,
    );
  }

  static getDefaultSpreadsheet(total = DEFAULT_TOTAL, extension = "xlsx") {
    return new OformsFilter(
      DEFAULT_PAGE,
      DEFAULT_PAGE_SIZE,
      DEFAULT_CATEGORIZE_BY,
      DEFAULT_CATEGORY_ID,
      DEFAULT_LOCALE,
      DEFAULT_SEARCH,
      extension,
      DEFAULT_SORT_BY,
      DEFAULT_SORT_ORDER,
      total,
    );
  }

  static getDefaultPresentation(total = DEFAULT_TOTAL, extension = "pptx") {
    return new OformsFilter(
      DEFAULT_PAGE,
      DEFAULT_PAGE_SIZE,
      DEFAULT_CATEGORIZE_BY,
      DEFAULT_CATEGORY_ID,
      DEFAULT_LOCALE,
      DEFAULT_SEARCH,
      extension,
      DEFAULT_SORT_BY,
      DEFAULT_SORT_ORDER,
      total,
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
      defaultFilter.extension,
      sortBy,
      sortOrder,
      defaultFilter.total,
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
      this.extension,
      this.sortBy,
      this.sortOrder,
      this.total,
    );
  }

  toUrlParams = () => {
    const fixedValidObject = validateAndFixObject(this, typeDefinition);

    const { categorizeBy, categoryId, locale, search, sortBy, sortOrder } =
      fixedValidObject;

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
    const fixedValidObject = validateAndFixObject(this, typeDefinition);

    const {
      page,
      pageSize,
      categorizeBy,
      categoryId,
      locale,
      search,
      extension,
      sortBy,
      sortOrder,
    } = fixedValidObject;

    const dtoFilter = {};
    dtoFilter[PAGE] = page;
    dtoFilter[PAGE_SIZE] = pageSize;
    if (categorizeBy && categoryId)
      dtoFilter[`filters[${categorizeBy}][id][$eq]`] = categoryId;
    dtoFilter[LOCALE] = locale;
    dtoFilter[`filters[name_form][$containsi]`] = search;
    dtoFilter[`filters[form_exts][ext][$eq]`] = extension;
    if (sortBy && sortOrder) dtoFilter[SORT] = `${sortBy}:${sortOrder}`;

    return toUrlParams(dtoFilter, true);
  };
}

export default OformsFilter;
