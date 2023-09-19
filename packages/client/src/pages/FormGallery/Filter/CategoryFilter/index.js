import { useState, useEffect } from "react";
import { inject } from "mobx-react";
import { withTranslation } from "react-i18next";
import CategoryFilterDesktop from "./DesktopView";
import CategoryFilterMobile from "./MobileView";
import { getOformCategoryTitle } from "@docspace/client/src/helpers/utils";
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

const CategoryFilter = ({
  t,

  currentCategory,
  oformsFilter,
  filterOformsByCategory,

  fetchCategoriesByBranch,
  fetchCategoriesByType,
  fetchPopularCategories,
}) => {
  const currentCategoryTitle = getOformCategoryTitle(
    oformsFilter.categorizeBy,
    currentCategory
  );

  const onViewAllTemplates = () => filterOformsByCategory("", "");

  const [formsByBranch, setFormsByBranch] = useState([]);
  const [formsByType, setFormsByType] = useState([]);
  const [formsByCompilation, setFormsByCompilation] = useState([]);

  useEffect(() => {
    (async () => {
      const branchData = await fetchCategoriesByBranch();
      setFormsByBranch(branchData);
      const typeData = await fetchCategoriesByType();
      setFormsByType(typeData);
      const compilationData = await fetchPopularCategories();
      setFormsByCompilation(compilationData);
    })();
  }, [oformsFilter.locale]);

  return (
    <StyledCategoryFilterWrapper className="categoryFilterWrapper">
      <CategoryFilterMobile
        className="mobileView"
        currentCategoryTitle={getOformCategoryTitle(
          oformsFilter.categorizeBy,
          currentCategory
        )}
        onViewAllTemplates={onViewAllTemplates}
        formsByBranch={formsByBranch}
        formsByType={formsByType}
        formsByCompilation={formsByCompilation}
      />
      <CategoryFilterDesktop
        className="desktopView"
        currentCategory={getOformCategoryTitle(
          oformsFilter.categorizeBy,
          currentCategory
        )}
        onViewAllTemplates={onViewAllTemplates}
        formsByBranch={formsByBranch}
        formsByType={formsByType}
        formsByCompilation={formsByCompilation}
      />
    </StyledCategoryFilterWrapper>
  );
};
export default inject(({ oformsStore }) => ({
  currentCategory: oformsStore.currentCategory,

  fetchCategoriesByBranch: oformsStore.fetchCategoriesByBranch,
  fetchCategoriesByType: oformsStore.fetchCategoriesByType,
  fetchPopularCategories: oformsStore.fetchPopularCategories,

  oformsFilter: oformsStore.oformsFilter,
  filterOformsByCategory: oformsStore.filterOformsByCategory,
}))(withTranslation(["FormGallery"])(CategoryFilter));
