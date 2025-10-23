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

import { useState, useEffect, useRef } from "react";
import { observer, inject } from "mobx-react";
import { withTranslation } from "react-i18next";
import type { FC } from "react";
import EmptyScreenFilterAltSvgUrl from "PUBLIC_DIR/images/emptyFilter/empty.filter.files.light.svg?url";
import EmptyScreenFilterAltDarkSvgUrl from "PUBLIC_DIR/images/emptyFilter/empty.filter.files.dark.svg?url";
import ClearEmptyFilterSvgUrl from "PUBLIC_DIR/images/clear.empty.filter.svg?url";
import { IconSizeType } from "@docspace/shared/utils";
import { TTranslation } from "@docspace/shared/types";

import { useTheme } from "styled-components";

import { Scrollbar } from "@docspace/shared/components/scrollbar";
import { Scrollbar as CustomScrollbar } from "@docspace/shared/components/scrollbar/custom-scrollbar";
import { EmptyScreenContainer } from "@docspace/shared/components/empty-screen-container";
import { Link, LinkType } from "@docspace/shared/components/link";
import { IconButton } from "@docspace/shared/components/icon-button";
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
}

interface TilesContainerInjectedProps extends FilterProps {
  hasGalleryFiles: boolean;
  resetFilters: (ext: string) => Promise<void>;
  t: TTranslation;
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
    ...filterProps
  } = props;

  const { isBase } = useTheme();
  const isMobileView = useMobileDetection();

  const [isShowOneTile, setShowOneTile] = useState(false);
  const scrollRef = useRef<CustomScrollbar>(null);

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
    >
      <Tiles
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

    const scrollHeight = isMobileView
      ? SCROLL_HEIGHTS.MOBILE
      : SCROLL_HEIGHTS.DESKTOP;
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

export default inject<TStore>(({ oformsStore }) => {
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
  } = oformsStore;

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
  };
})(
  withTranslation("Common")(observer(TilesContainer)),
) as unknown as React.ComponentType<TilesContainerOwnProps>;
