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

import { TFunction } from "i18next";

export interface Category {
  id: string;
  attributes: {
    name: string;
    categoryId: string;
  };
}

export interface MenuItem {
  key: string;
  label: string;
  categories: Category[];
}
export interface OformsFilter {
  locale: string;
  sortBy: string;
  sortOrder: string;
}

export interface CategoryFilterProps {
  oformsFilter: OformsFilter;
  noLocales: boolean;
  fetchCategoryTypes: () => Promise<Category[]>;
  fetchCategoriesOfCategoryType: (categoryId: string) => Promise<Category[]>;
  filterOformsByLocaleIsLoading: boolean;
  setFilterOformsByLocaleIsLoading: (loading: boolean) => void;
  setCategoryFilterLoaded: (loaded: boolean) => void;
  categoryFilterLoaded: boolean;
  languageFilterLoaded: boolean;
  isShowInitSkeleton: boolean;
  viewMobile: boolean;
  isLanguageFilterChange: boolean;
}

export interface CategoryFilterDesktopProps {
  t: TFunction;
  menuItems: MenuItem[];
  currentCategory: Category | null;
  getCategoryTitle: (category: Category | null) => string;
  filterOformsByCategory: (categoryType: string, categoryId: string) => void;
  isLanguageFilterChange: boolean;
}

export interface SubListProps {
  t: TFunction;
  categoryType: string;
  categories: Category[];
  isDropdownOpen: boolean;
  isSubHovered: boolean;
  marginTop: string;
  onCloseDropdown: () => void;
  getCategoryTitle: (category: Category) => string;
  filterOformsByCategory: (categoryType: string, categoryId: string) => void;
  setOformsCurrentCategory: (category: Category) => void;
}

export interface CategoryFilterMobileProps {
  t: TFunction;
  menuItems: MenuItem[];
  currentCategory: Category | null;
  getCategoryTitle: (category: Category | null) => string;
  filterOformsByCategory: (categoryType: string, categoryId: string) => void;
  setOformsCurrentCategory: (category: Category) => void;
  isLanguageFilterChange: boolean;
}

export interface InjectedProps {
  oformsStore: {
    currentCategory: Category | null;
    getCategoryTitle: (category: Category | null) => string;
    filterOformsByCategory: (categoryType: string, categoryId: string) => void;
    setOformsCurrentCategory: (category: Category) => void;
  };
}
