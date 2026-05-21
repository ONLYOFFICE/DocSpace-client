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

import { useState, useEffect, useRef } from "react";
import { observer, inject } from "mobx-react";
import { withTranslation } from "react-i18next";
import type { FC } from "react";
import EmptyScreenFilterAltSvgUrl from "PUBLIC_DIR/images/emptyFilter/empty.filter.files.light.svg?url";
import EmptyScreenFilterAltDarkSvgUrl from "PUBLIC_DIR/images/emptyFilter/empty.filter.files.dark.svg?url";
import ClearEmptyFilterSvgUrl from "PUBLIC_DIR/images/clear.empty.filter.svg?url";
import { IconSizeType } from "@docspace/shared/utils";
import { TTranslation } from "@docspace/shared/types";

import { useTheme } from "@docspace/ui-kit/context/ThemeContext";
import {
  Scrollbar,
  ScrollbarType,
} from "@docspace/ui-kit/components/scrollbar";
import { EmptyScreenContainer } from "@docspace/ui-kit/components/empty-screen-container";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import type OformsFilter from "@docspace/shared/api/oforms/filter";
import type { Category } from "../Filter/CategoryFilter/CategoryFilter.types";
import styles from "../TemplateGallery.module.scss";
import FilterContent from "../Filter";
import Tiles from "../Tiles";
import { useMobileDetection } from "../hooks/useMobileDetection";
import { SCROLL_HEIGHTS, FILE_EXTENSIONS } from "../constants";

interface TilesContainerOwnProps {
  ext: string;
  isShowInitSkeleton: boolean;
}

interface FilterProps {
  oformsFilter: OformsFilter;
  noLocales: boolean;
  fetchCategoryTypes: () => Promise<Category[]>;
  fetchCategoriesOfCategoryType: (categoryId: string) => Promise<Category[]>;
  filterOformsByLocaleIsLoading: boolean;
  setFilterOformsByLocaleIsLoading: (isLoading: boolean) => void;
  setCategoryFilterLoaded: (isLoaded: boolean) => void;
  categoryFilterLoaded: boolean;
  languageFilterLoaded: boolean;
  setLanguageFilterLoaded: (isLoaded: boolean) => void;
  oformsLocal: string;
  oformLocales: string[] | null;
  filterOformsByLocale: (locale: string) => Promise<void>;
  filterOformsBySearch: (search: string) => void;
  sortOforms: (sortBy: string, sortOrder: "asc" | "desc") => void;
}

interface TilesContainerInjectedProps extends FilterProps {
  hasGalleryFiles: boolean;
  resetFilters: (ext: string) => Promise<void>;
  t: TTranslation;
  isFormRoomRoot: boolean;
}

interface TilesContainerProps
  extends TilesContainerOwnProps,
    TilesContainerInjectedProps {}

const TilesContainer: FC<TilesContainerProps> = (props) => {
  const {
    ext,
    isShowInitSkeleton,
    hasGalleryFiles,
    resetFilters,
    t,
    isFormRoomRoot,
    ...filterProps
  } = props;

  const { isBase } = useTheme();
  const isMobileView = useMobileDetection();

  const [isShowOneTile, setShowOneTile] = useState(false);
  const scrollRef = useRef<ScrollbarType>(null);

  useEffect(() => {
    scrollRef.current?.scrollToTop();
  }, [ext]);

  const renderEmptyState = () => (
    <EmptyScreenContainer
      imageSrc={
        isBase ? EmptyScreenFilterAltSvgUrl : EmptyScreenFilterAltDarkSvgUrl
      }
      imageAlt="Empty Screen Gallery image"
      headerText={t("Common:NotFoundTitle")}
      descriptionText={t("FormGallery:EmptyFormGalleryScreenDescription")}
      buttons={
        <div className={styles.links}>
          <IconButton
            className={styles.icon}
            size={IconSizeType.small}
            onClick={() => resetFilters(ext)}
            iconName={ClearEmptyFilterSvgUrl}
            isFill
          />
          <Link
            className={styles.link}
            onClick={() => resetFilters(ext)}
            isHovered
            type={LinkType.action}
            fontWeight="600"
            display="flex"
          >
            {t("Common:ClearFilter")}
          </Link>
        </div>
      }
    />
  );

  const renderTilesWithScrollbar = (height: string, showOneTile: boolean) => (
    <Scrollbar
      style={{ height, width: "calc(100% + 16px)" }}
      id="scroll-template-gallery"
      ref={scrollRef}
      paddingInlineEnd="16px"
      tabIndex={null}
    >
      <Tiles
        hotkeysResetKey={ext}
        isShowOneTile={showOneTile}
        smallPreview={
          ext === FILE_EXTENSIONS.PPTX || ext === FILE_EXTENSIONS.XLSX
        }
        viewMobile={isMobileView}
        isShowInitSkeleton={isShowInitSkeleton}
      />
    </Scrollbar>
  );

  const renderContent = () => {
    if (!hasGalleryFiles && !isShowInitSkeleton) {
      return renderEmptyState();
    }

    const mobileHeight = isFormRoomRoot
      ? SCROLL_HEIGHTS.MOBILE_FORMS_ONLY
      : SCROLL_HEIGHTS.MOBILE;

    const desktopHeight = isFormRoomRoot
      ? SCROLL_HEIGHTS.DESKTOP_FORMS_ONLY
      : SCROLL_HEIGHTS.DESKTOP;

    const scrollHeight = isMobileView ? mobileHeight : desktopHeight;

    const showOneTile = isMobileView ? isShowOneTile : false;

    return renderTilesWithScrollbar(scrollHeight, showOneTile);
  };

  return (
    <div style={{ width: "100%" }}>
      <FilterContent
        {...filterProps}
        isShowOneTile={isShowOneTile}
        setShowOneTile={setShowOneTile}
        viewMobile={isMobileView}
        isShowInitSkeleton={isShowInitSkeleton}
      />
      {renderContent()}
    </div>
  );
};

export default inject<TStore>(({ oformsStore, treeFoldersStore }) => {
  const {
    hasGalleryFiles,
    resetFilters,
    oformsFilter,
    fetchCategoryTypes,
    fetchCategoriesOfCategoryType,
    setCategoryFilterLoaded,
    categoryFilterLoaded,
    filterOformsByLocale,
    filterOformsByLocaleIsLoading,
    setFilterOformsByLocaleIsLoading,
    languageFilterLoaded,
    setLanguageFilterLoaded,
    filterOformsBySearch,
    sortOforms,
  } = oformsStore;

  const { isFormRoomRoot } = treeFoldersStore;
  const oformLocales = oformsStore.oformLocales as string[] | null;

  return {
    noLocales: !oformLocales || oformLocales.length === 0,
    oformLocales,
    oformsLocal: oformsStore.oformsFilter.locale,
    hasGalleryFiles,
    resetFilters,
    oformsFilter,
    fetchCategoryTypes,
    fetchCategoriesOfCategoryType,
    setCategoryFilterLoaded,
    categoryFilterLoaded,
    filterOformsByLocale,
    filterOformsByLocaleIsLoading,
    setFilterOformsByLocaleIsLoading,
    languageFilterLoaded,
    setLanguageFilterLoaded,
    filterOformsBySearch,
    sortOforms,
    isFormRoomRoot,
  };
})(
  withTranslation("Common")(observer(TilesContainer)),
) as unknown as React.ComponentType<TilesContainerOwnProps>;
