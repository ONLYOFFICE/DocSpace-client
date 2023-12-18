import { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import CategoryFilterDesktop from "./DesktopView";
import CategoryFilterMobile from "./MobileView";
import { mobile } from "@docspace/components/utils/device";
import RectangleSkeleton from "@docspace/components/skeletons/rectangle";

import styled, { css } from "styled-components";

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
}) => {
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    (async () => {
      let newMenuItems = await fetchCategoryTypes();
      if (!newMenuItems) {
        filterOformsByLocaleIsLoading &&
          setFilterOformsByLocaleIsLoading(false);
        return;
      }

      const categoryPromises = newMenuItems.map(
        (item) =>
          new Promise((res) =>
            res(fetchCategoriesOfCategoryType(item.attributes.categoryId))
          )
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

  if (filterOformsByLocaleIsLoading || menuItems.length === 0)
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
}))(observer(CategoryFilter));
