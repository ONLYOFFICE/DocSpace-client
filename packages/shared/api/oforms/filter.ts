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

import { toUrlParams } from "../../utils/common";
import { validateAndFixObject } from "../../utils/filterValidator";

const PAGE = "pagination[page]";
const PAGE_SIZE = "pagination[pageSize]";
const CATEGORY_ID = "categoryId";
const PURPOSE = "purpose";
const LOCALE = "locale";
const SEARCH = "filterValue";
const SORT_BY = "sortby";
const SORT_ORDER = "sortorder";

const SORT = "sort[0]";
const SEARCH_FILTER = "filters[name_form][$containsi]";
const EXTENSION_FILTER = "filters[form_exts][ext][$eq]";
// The numeric id of a taxonomy entity differs per locale, `documentId` does
// not - so the category filter travels as the document id.
const CATEGORY_FILTER = "filters[subcategories][documentId][$eq]";
const PURPOSE_FILTER =
  "filters[subcategories][parent_categories][purpose][key][$eq]";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 150;
const DEFAULT_TOTAL = 0;
const DEFAULT_LOCALE = null;
const DEFAULT_SEARCH = "";
const DEFAULT_SORT_BY = "";
const DEFAULT_SORT_ORDER = "";
const DEFAULT_CATEGORY_ID = "";
const DEFAULT_PURPOSE = "";
const DEFAULT_EXTENSION = "pdf";

const sortTypeDefinition = {
  sortBy: ["name_form", "updatedAt"],
  sortOrder: ["asc", "desc"],
};

class OformsFilter {
  page: number;

  pageSize: number;

  /** Document id of the selected subcategory; empty means every category. */
  categoryId: string;

  /** `business` / `personal`; empty means both. */
  purpose: string;

  locale: string | null;

  search: string;

  /** Template extension without the leading dot, as the CMS stores it. */
  extension: string;

  sortBy: string;

  sortOrder: string;

  total: number;

  constructor(
    page = DEFAULT_PAGE,
    pageSize = DEFAULT_PAGE_SIZE,
    categoryId = DEFAULT_CATEGORY_ID,
    purpose = DEFAULT_PURPOSE,
    locale: string | null = DEFAULT_LOCALE,
    search = DEFAULT_SEARCH,
    extension = DEFAULT_EXTENSION,
    sortBy = DEFAULT_SORT_BY,
    sortOrder = DEFAULT_SORT_ORDER,
    total = DEFAULT_TOTAL,
  ) {
    this.page = page;
    this.pageSize = pageSize;
    this.categoryId = categoryId;
    this.purpose = purpose;
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
      DEFAULT_CATEGORY_ID,
      DEFAULT_PURPOSE,
      DEFAULT_LOCALE,
      DEFAULT_SEARCH,
      extension,
      DEFAULT_SORT_BY,
      DEFAULT_SORT_ORDER,
      total,
    );
  }

  static getDefaultDocx(total = DEFAULT_TOTAL) {
    return OformsFilter.getDefault(total, "docx");
  }

  static getDefaultSpreadsheet(total = DEFAULT_TOTAL) {
    return OformsFilter.getDefault(total, "xlsx");
  }

  static getDefaultPresentation(total = DEFAULT_TOTAL) {
    return OformsFilter.getDefault(total, "pptx");
  }

  static getFilter(location?: { search: string }) {
    if (!location) return OformsFilter.getDefault();

    const urlFilter = new URLSearchParams(location.search);
    const defaultFilter = OformsFilter.getDefault();

    const page = Number(urlFilter.get(PAGE)) || defaultFilter.page;
    const pageSize = Number(urlFilter.get(PAGE_SIZE)) || defaultFilter.pageSize;
    const categoryId =
      urlFilter.get(CATEGORY_ID) || defaultFilter.categoryId;
    const purpose = urlFilter.get(PURPOSE) || defaultFilter.purpose;
    const locale = urlFilter.get(LOCALE) || defaultFilter.locale;
    const search = urlFilter.get(SEARCH) || defaultFilter.search;
    const sortBy = urlFilter.get(SORT_BY) || defaultFilter.sortBy;
    const sortOrder = urlFilter.get(SORT_ORDER) || defaultFilter.sortOrder;

    return new OformsFilter(
      page,
      pageSize,
      categoryId,
      purpose,
      locale,
      search,
      defaultFilter.extension,
      sortBy,
      sortOrder,
      defaultFilter.total,
    );
  }

  clone() {
    return new OformsFilter(
      this.page,
      this.pageSize,
      this.categoryId,
      this.purpose,
      this.locale,
      this.search,
      this.extension,
      this.sortBy,
      this.sortOrder,
      this.total,
    );
  }

  getValidSort = () =>
    validateAndFixObject(
      { sortBy: this.sortBy, sortOrder: this.sortOrder },
      sortTypeDefinition,
    );

  toUrlParams = () => {
    const { sortBy, sortOrder } = this.getValidSort();

    return toUrlParams(
      {
        [CATEGORY_ID]: this.categoryId,
        [PURPOSE]: this.purpose,
        [LOCALE]: this.locale,
        [SEARCH]: this.search,
        [SORT_BY]: sortBy,
        [SORT_ORDER]: sortOrder,
      },
      true,
    );
  };

  toApiUrlParams = () => {
    const { sortBy, sortOrder } = this.getValidSort();

    return toUrlParams(
      {
        [PAGE]: this.page,
        [PAGE_SIZE]: this.pageSize,
        [LOCALE]: this.locale,
        [SEARCH_FILTER]: this.search,
        [EXTENSION_FILTER]: this.extension,
        [CATEGORY_FILTER]: this.categoryId,
        [PURPOSE_FILTER]: this.purpose,
        [SORT]: sortBy && sortOrder ? `${sortBy}:${sortOrder}` : "",
      },
      true,
    );
  };
}

export default OformsFilter;
