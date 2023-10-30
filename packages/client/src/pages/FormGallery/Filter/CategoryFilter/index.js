import { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import CategoryFilterDesktop from "./DesktopView";
import CategoryFilterMobile from "./MobileView";
import { mobile, tablet } from "@docspace/components/utils/device";

import styled from "styled-components";

export const StyledCategoryFilterWrapper = styled.div`
  width: 100%;
  @media ${mobile} {
    max-width: calc(100% - 49px);
  }

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

const CategoryFilter = ({
  fetchCategoryTypes,
  fetchCategoriesOfCategoryType,
}) => {
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    (async () => {
      let newMenuItems = await fetchCategoryTypes();

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
  fetchCategoryTypes: oformsStore.fetchCategoryTypes,
  fetchCategoriesOfCategoryType: oformsStore.fetchCategoriesOfCategoryType,
}))(observer(CategoryFilter));
