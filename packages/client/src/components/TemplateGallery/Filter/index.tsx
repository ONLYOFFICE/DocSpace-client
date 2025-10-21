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

import { FC, useCallback } from "react";
import { ReactSVG } from "react-svg";

import ViewTilesReactSvg from "PUBLIC_DIR/images/view-tiles.react.svg?url";
import ViewChangeReactUrl from "PUBLIC_DIR/images/view-change.react.svg?url";

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
  } = props;

  const isMobileView = useMobileDetection();

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
  };

  const renderViewToggleButton = () => {
    if (!isMobileView) return null;

    return (
      <div className={styles.viewButton} onClick={handleViewToggle}>
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
        <SearchFilter />
        <SortFilter />
        {renderViewToggleButton()}
      </div>
    </div>
  );
};

export default FilterContent;
