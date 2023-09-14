import * as Styled from "./index.styled";
import { inject } from "mobx-react";
import { withTranslation } from "react-i18next";
import { getOformCategoryTitle } from "@docspace/client/src/helpers/utils";

const SubList = ({
  categoryType,
  categories,

  isSubHovered,
  marginTop,

  filterOformsByCategory,
  setOformsCurrentCategory,
}) => {
  const onFilterByCategory = (category) => {
    setOformsCurrentCategory(category);
    filterOformsByCategory(categoryType, category.id);
  };

  return (
    <Styled.CategoryFilterSubList
      isSubHovered={isSubHovered}
      marginTop={marginTop}
      id={`category-sub-list-${categoryType}`}
      className={`dropdown-sub sub-by-${categoryType}`}
      directionX={"right"}
      directionY={"bottom"}
      manualY={"0px"}
      manualX={"0px"}
      open={true}
      clickOutsideAction={() => {}}
      maxHeight={296}
      manualWidth={"100%"}
      showDisabledItems={false}
      isDefaultMode={false}
      withBackdrop={false}
      withBackground={false}
      isMobileView={false}
      isNoFixedHeightOptions={false}
    >
      {categories.map((category) => (
        <Styled.CategoryFilterSubListItem
          className="dropdown-item"
          height={36}
          heightTablet={36}
          key={category.id}
          label={getOformCategoryTitle(categoryType, category)}
          onClick={() => onFilterByCategory(category)}
        />
      ))}
    </Styled.CategoryFilterSubList>
  );
};

export default inject(({ oformsStore }) => ({
  getOforms: oformsStore.getOforms,
  oformsFilter: oformsStore.oformsFilter,
  filterOformsByCategory: oformsStore.filterOformsByCategory,
  setOformsCurrentCategory: oformsStore.setOformsCurrentCategory,
}))(withTranslation(["FormGallery", "Common"])(SubList));
