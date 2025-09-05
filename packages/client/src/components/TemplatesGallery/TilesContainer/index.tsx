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
import EmptyScreenFilterAltSvgUrl from "PUBLIC_DIR/images/empty_screen_filter_alt.svg?url";
import EmptyScreenFilterAltDarkSvgUrl from "PUBLIC_DIR/images/empty_screen_filter_alt_dark.svg?url";
import ClearEmptyFilterSvgUrl from "PUBLIC_DIR/images/clear.empty.filter.svg?url";
import { isMobile, IconSizeType } from "@docspace/shared/utils";
import { TTranslation } from "@docspace/shared/types";

import { useTheme } from "styled-components";

import { Scrollbar } from "@docspace/shared/components/scrollbar";
import { Scrollbar as CustomScrollbar } from "@docspace/shared/components/scrollbar/custom-scrollbar";
import { EmptyScreenContainer } from "@docspace/shared/components/empty-screen-container";
import { Link, LinkType } from "@docspace/shared/components/link";

import { IconButton } from "@docspace/shared/components/icon-button";

import styles from "../TemplatesGallery.module.scss";
import SectionFilterContent from "../Filter";
import Tiles from "../Tiles";

interface TilesContainerOwnProps {
  ext: string;
  isInitLoading: boolean;
}

interface TilesContainerInjectedProps {
  hasGalleryFiles: boolean;
  resetFilters: (ext: string) => Promise<void>;
  t: TTranslation;
}

interface TilesContainerProps
  extends TilesContainerOwnProps,
    TilesContainerInjectedProps {}

const TilesContainer: FC<TilesContainerProps> = ({
  ext,
  isInitLoading,
  hasGalleryFiles,
  resetFilters,
  t,
}) => {
  const { isBase } = useTheme();

  const [isShowOneTile, setShowOneTile] = useState(false);
  const [viewMobile, setViewMobile] = useState(false);

  const scrollRef = useRef<CustomScrollbar>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollToTop();
  }, [ext]);

  const onCheckView = () => setViewMobile(isMobile());

  useEffect(() => {
    onCheckView();
    window.addEventListener("resize", onCheckView);
    return () => window.removeEventListener("resize", onCheckView);
  }, [onCheckView]);

  return (
    <div style={{ width: "100%" }}>
      <SectionFilterContent
        isShowOneTile={isShowOneTile}
        setShowOneTile={setShowOneTile}
        viewMobile={viewMobile}
      />
      {!hasGalleryFiles && !isInitLoading ? (
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
      ) : viewMobile ? (
        <Scrollbar
          style={{ height: "calc(100vh - 227px)", width: "calc(100% + 16px)" }}
          id="scroll-template-gallery"
          ref={scrollRef}
        >
          <Tiles
            isShowOneTile={isShowOneTile}
            smallPreview={ext === ".pptx" || ext === ".xlsx"}
            viewMobile={viewMobile}
            isInitLoading={isInitLoading}
          />
        </Scrollbar>
      ) : (
        <Scrollbar
          style={{ height: "calc(100vh - 286px)", width: "calc(100% + 16px)" }}
          id="scroll-template-gallery"
          ref={scrollRef}
        >
          <Tiles
            isShowOneTile={false}
            smallPreview={ext === ".pptx" || ext === ".xlsx"}
            isInitLoading={isInitLoading}
          />
        </Scrollbar>
      )}
    </div>
  );
};

export default inject<TStore>(({ oformsStore }) => ({
  oformsLoadError: oformsStore.oformsLoadError,
  currentCategory: oformsStore.currentCategory,
  fetchCurrentCategory: oformsStore.fetchCurrentCategory,
  hasGalleryFiles: oformsStore.hasGalleryFiles,
  defaultOformLocale: oformsStore.defaultOformLocale,
  fetchOformLocales: oformsStore.fetchOformLocales,
  oformsFilter: oformsStore.oformsFilter,
  setOformsFilter: oformsStore.setOformsFilter,
  resetFilters: oformsStore.resetFilters,
  fetchOforms: oformsStore.fetchOforms,
  setOformFromFolderId: oformsStore.setOformFromFolderId,
}))(
  withTranslation("Common")(observer(TilesContainer)),
) as unknown as React.ComponentType<TilesContainerOwnProps>;
