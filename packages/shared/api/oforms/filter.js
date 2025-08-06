// (c) Copyright Ascensio System SIA 2009-2025
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

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { toUrlParams } from "../../utils/common";

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
      extension,
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
    dtoFilter[`filters[form_exts][ext][$eq]`] = extension;
    if (sortBy && sortOrder) dtoFilter[SORT] = `${sortBy}:${sortOrder}`;

    return toUrlParams(dtoFilter, true);
  };
}

export default OformsFilter;
