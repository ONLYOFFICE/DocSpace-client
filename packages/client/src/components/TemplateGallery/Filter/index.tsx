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

import { FC, useCallback, useState } from "react";
import { ReactSVG } from "react-svg";
import classNames from "classnames";
import ViewTilesReactSvg from "PUBLIC_DIR/images/view-tiles.react.svg?url";
import ViewChangeReactUrl from "PUBLIC_DIR/images/view-change.react.svg?url";

import { RectangleSkeleton } from "@docspace/shared/skeletons";

import CategoryFilter from "./CategoryFilter";
import LanguageFilter from "./LanguageFilter";
import SearchFilter from "./SearchFilter";
import SortFilter from "./SortFilter";
import { useMobileDetection } from "../hooks/useMobileDetection";
import styles from "./Filter.module.scss";
import { FilterContentProps } from "./Filter.types";

const FilterContent: FC<FilterContentProps> = (props) => {
  const {
    setShowOneTile,
    isShowOneTile,
    isShowInitSkeleton,

    oformsFilter,
    noLocales,
    fetchCategoryTypes,
    fetchCategoriesOfCategoryType,
    setCategoryFilterLoaded,
    categoryFilterLoaded,

    filterOformsByLocaleIsLoading,
    setFilterOformsByLocaleIsLoading,
    setLanguageFilterLoaded,
    languageFilterLoaded,
    oformsLocal,
    oformLocales,
    filterOformsByLocale,
    filterOformsBySearch,
    sortOforms,
  } = props;

  const isMobileView = useMobileDetection();
  const [isLanguageFilterChange, setIsLanguageFilterChange] = useState(false);

  const handleViewToggle = useCallback(() => {
    setShowOneTile(!isShowOneTile);
  }, [setShowOneTile, isShowOneTile]);

  const categoryFilterProps = {
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
    viewMobile: isMobileView,
    isLanguageFilterChange,
  };

  const languageFilterProps = {
    filterOformsByLocaleIsLoading,
    setLanguageFilterLoaded,
    isShowInitSkeleton,
    oformLocales,
    filterOformsByLocale,
    categoryFilterLoaded,
    languageFilterLoaded,
    oformsLocal,
    viewMobile: isMobileView,
    isLanguageFilterChange,
    setIsLanguageFilterChange,
  };

  const searchFilterProps = {
    filterOformsByLocaleIsLoading,
    categoryFilterLoaded,
    languageFilterLoaded,
    isShowInitSkeleton,
    oformsFilter,
    filterOformsBySearch,
    isLanguageFilterChange,
  };

  const sortFilterProps = {
    filterOformsByLocaleIsLoading,
    categoryFilterLoaded,
    languageFilterLoaded,
    isShowInitSkeleton,
    oformsFilter,
    sortOforms,
    isLanguageFilterChange,
  };

  const renderViewToggleButton = () => {
    if (!isMobileView) return null;

    if (
      (isShowInitSkeleton ||
        filterOformsByLocaleIsLoading ||
        !(categoryFilterLoaded && languageFilterLoaded)) &&
      !isLanguageFilterChange
    )
      return <RectangleSkeleton height="32px" width="32px" />;

    return (
      <div
        className={classNames(styles.viewButton, {
          [styles.isDisabled]: isLanguageFilterChange,
        })}
        onClick={handleViewToggle}
      >
        <ReactSVG
          src={isShowOneTile ? ViewTilesReactSvg : ViewChangeReactUrl}
          className={styles.iconView}
        />
      </div>
    );
  };

  return (
    <div className={styles.filter}>
      <div className={styles.formOnlyFilters}>
        <CategoryFilter {...categoryFilterProps} />
        <LanguageFilter {...languageFilterProps} />
      </div>
      <div className={styles.generalFilters}>
        <SearchFilter {...searchFilterProps} />
        <SortFilter {...sortFilterProps} />
        {renderViewToggleButton()}
      </div>
    </div>
  );
};

export default FilterContent;
