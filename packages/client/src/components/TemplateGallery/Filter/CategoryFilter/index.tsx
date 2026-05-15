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

import React, { useState, useEffect } from "react";
import { observer } from "mobx-react";
import { RectangleSkeleton } from "@docspace/shared/skeletons";
import classNames from "classnames";

import CategoryFilterDesktop from "./DesktopView";
import CategoryFilterMobile from "./MobileView";
import styles from "./CategoryFilter.module.scss";
import type {
  CategoryFilterProps,
  MenuItem,
  Category,
} from "./CategoryFilter.types";

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  oformsFilter,
  noLocales,
  fetchCategoryTypes,
  fetchCategoriesOfCategoryType,
  filterOformsByLocaleIsLoading,
  setFilterOformsByLocaleIsLoading,
  setCategoryFilterLoaded,
  categoryFilterLoaded,
  languageFilterLoaded,
  isShowInitSkeleton,
  viewMobile,
  isLanguageFilterChange,
}) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    (async () => {
      if (!oformsFilter.locale) return;
      const categoryData = await fetchCategoryTypes();
      if (!categoryData) {
        filterOformsByLocaleIsLoading &&
          setFilterOformsByLocaleIsLoading(false);

        return;
      }

      const categoryPromises = categoryData.map(
        (item: Category) =>
          new Promise<Category[]>((resolve) => {
            resolve(fetchCategoriesOfCategoryType(item.attributes.categoryId));
          }),
      );

      Promise.all(categoryPromises)
        .then((results) => {
          const menuItems: MenuItem[] = categoryData.map(
            (item: Category, index: number) => ({
              key: item.attributes.categoryId,
              label: item.attributes.name,
              categories: results[index],
            }),
          );
          setMenuItems(menuItems);
        })
        .catch((err) => {
          console.error(err);
          const menuItems: MenuItem[] = categoryData.map((item: Category) => ({
            key: item.attributes.categoryId,
            label: item.attributes.name,
            categories: [],
          }));
          setMenuItems(menuItems);
        })
        .finally(() => {
          filterOformsByLocaleIsLoading &&
            setFilterOformsByLocaleIsLoading(false);
        });
    })();
  }, [
    oformsFilter.locale,
    fetchCategoryTypes,
    fetchCategoriesOfCategoryType,
    filterOformsByLocaleIsLoading,
    setFilterOformsByLocaleIsLoading,
  ]);

  useEffect(() => {
    setCategoryFilterLoaded(menuItems.length !== 0);
  }, [menuItems.length, setCategoryFilterLoaded]);

  if (
    (isShowInitSkeleton ||
      filterOformsByLocaleIsLoading ||
      !(categoryFilterLoaded && languageFilterLoaded)) &&
    !isLanguageFilterChange
  )
    return (
      <RectangleSkeleton
        className={classNames(styles.skeleton, {
          [styles.withLocales]: !noLocales,
        })}
      />
    );

  return (
    <div
      className={classNames(styles.categoryFilterWrapper, {
        [styles.withLocales]: !noLocales,
      })}
    >
      {viewMobile ? (
        <CategoryFilterMobile
          menuItems={menuItems}
          isLanguageFilterChange={isLanguageFilterChange}
        />
      ) : (
        <CategoryFilterDesktop
          menuItems={menuItems}
          isLanguageFilterChange={isLanguageFilterChange}
        />
      )}
    </div>
  );
};

export default observer(CategoryFilter);
