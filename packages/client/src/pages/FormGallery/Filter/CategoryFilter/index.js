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

import { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { mobile } from "@docspace/shared/utils";
import { RectangleSkeleton } from "@docspace/shared/skeletons";

import styled, { css } from "styled-components";
import CategoryFilterMobile from "./MobileView";
import CategoryFilterDesktop from "./DesktopView";

export const StyledCategoryFilterWrapper = styled.div`
  width: 100%;

  ${({ noLocales }) =>
    !noLocales &&
    css`
      @media ${mobile} {
        max-width: calc(100% - 49px);
      }
    `}

  .mobileView {
    display: none;
  }
  .desktopView {
    display: block;
  }

  @media ${mobile} {
    .mobileView {
      display: block;
    }
    .desktopView {
      display: none;
    }
  }
`;

export const StyledSkeleton = styled(RectangleSkeleton)`
  width: 220px;
  height: 32px;

  @media ${mobile} {
    width: 100%;
  }

  ${({ noLocales }) =>
    !noLocales &&
    css`
      @media ${mobile} {
        max-width: calc(100% - 49px);
      }
    `}
`;

const CategoryFilter = ({
  oformsFilter,
  noLocales,
  fetchCategoryTypes,
  fetchCategoriesOfCategoryType,
  filterOformsByLocaleIsLoading,
  setFilterOformsByLocaleIsLoading,
  setCategoryFilterLoaded,
  categoryFilterLoaded,
  languageFilterLoaded,
  oformFilesLoaded,
}) => {
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    (async () => {
      if (!oformsFilter.locale) return;
      let newMenuItems = await fetchCategoryTypes();
      if (!newMenuItems) {
        filterOformsByLocaleIsLoading &&
          setFilterOformsByLocaleIsLoading(false);
        return;
      }

      const categoryPromises = newMenuItems.map(
        (item) =>
          new Promise((resolve) => {
            resolve(fetchCategoriesOfCategoryType(item.attributes.categoryId));
          }),
      );

      Promise.all(categoryPromises)
        .then((results) => {
          newMenuItems = newMenuItems.map((item, index) => ({
            key: item.attributes.categoryId,
            label: item.attributes.name,
            categories: results[index],
          }));
        })
        .catch((err) => {
          console.error(err);
          newMenuItems = newMenuItems.map((item) => ({
            key: item.attributes.categoryId,
            label: item.attributes.name,
            categories: [],
          }));
        })
        .finally(() => {
          setMenuItems(newMenuItems);
          filterOformsByLocaleIsLoading &&
            setFilterOformsByLocaleIsLoading(false);
        });
    })();
  }, [oformsFilter.locale]);

  useEffect(() => {
    setCategoryFilterLoaded(menuItems.length !== 0);
  }, [menuItems.length]);

  if (
    filterOformsByLocaleIsLoading ||
    !(categoryFilterLoaded && languageFilterLoaded && oformFilesLoaded)
  )
    return <StyledSkeleton $noLocales={noLocales} />;

  return (
    <StyledCategoryFilterWrapper
      noLocales={noLocales}
      className="categoryFilterWrapper"
    >
      <CategoryFilterMobile className="mobileView" menuItems={menuItems} />
      <CategoryFilterDesktop className="desktopView" menuItems={menuItems} />
    </StyledCategoryFilterWrapper>
  );
};
export default inject(({ oformsStore }) => ({
  oformsFilter: oformsStore.oformsFilter,
  noLocales:
    oformsStore.oformLocales !== null && oformsStore.oformLocales?.length === 0,
  fetchCategoryTypes: oformsStore.fetchCategoryTypes,
  fetchCategoriesOfCategoryType: oformsStore.fetchCategoriesOfCategoryType,
  filterOformsByLocaleIsLoading: oformsStore.filterOformsByLocaleIsLoading,
  setFilterOformsByLocaleIsLoading:
    oformsStore.setFilterOformsByLocaleIsLoading,
  setCategoryFilterLoaded: oformsStore.setCategoryFilterLoaded,
  categoryFilterLoaded: oformsStore.categoryFilterLoaded,
  languageFilterLoaded: oformsStore.languageFilterLoaded,
  oformFilesLoaded: oformsStore.oformFilesLoaded,
}))(observer(CategoryFilter));
