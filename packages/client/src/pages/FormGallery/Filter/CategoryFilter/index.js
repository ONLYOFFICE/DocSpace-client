import { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import CategoryFilterDesktop from "./DesktopView";
import CategoryFilterMobile from "./MobileView";
import { smallTablet } from "@docspace/components/utils/device";
import { isMobileOnly } from "react-device-detect";

import styled, { css } from "styled-components";

export const StyledCategoryFilterWrapper = styled.div`
  width: 100%;

  .mobileView {
    display: none;
  }
  .desktopView {
    display: block;
  }

  @media ${smallTablet} {
    .mobileView {
      display: block;
    }
    .desktopView {
      display: none;
    }
  }

  ${isMobileOnly &&
  css`
    .mobileView {
      display: block;
    }
    .desktopView {
      display: none;
    }
  `}
`;

const CategoryFilter = ({ fetchCategoryList, fetchCategories }) => {
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    (async () => {
      let newMenuItems = await fetchCategoryList();

      const categoryPromises = newMenuItems.map(
        (item) =>
          new Promise((res) => res(fetchCategories(item.attributes.categoryId)))
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
        .finally(() => setMenuItems(newMenuItems));
    })();
  }, []);

  return (
    <StyledCategoryFilterWrapper className="categoryFilterWrapper">
      <CategoryFilterMobile className="mobileView" menuItems={menuItems} />
      <CategoryFilterDesktop className="desktopView" menuItems={menuItems} />
    </StyledCategoryFilterWrapper>
  );
};
export default inject(({ oformsStore }) => ({
  fetchCategoryList: oformsStore.fetchCategoryList,
  fetchCategories: oformsStore.fetchCategories,
}))(observer(CategoryFilter));
