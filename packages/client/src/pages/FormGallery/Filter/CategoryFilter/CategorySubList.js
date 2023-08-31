import DropDownItem from "@docspace/components/drop-down-item";
import { isMobileOnly } from "react-device-detect";
import { isMobile, isSmallTablet } from "@docspace/components/utils/device";
import { StyledSubList, StyledSubItemMobile } from "./index.styled";
import { inject } from "mobx-react";
import { withTranslation } from "react-i18next";
import { OformCategoryType } from "@docspace/client/src/helpers/constants";
import { getOformCategoryTitle } from "@docspace/client/src/helpers/utils";

const CategorySubList = ({
  isOpen,
  categoryType,
  categories,
  marginTop,

  filterOformsByCategory,
  setOformsCurrentCategory,
}) => {
  const onFilterByCategory = (category) => {
    setOformsCurrentCategory(category);
    filterOformsByCategory(categoryType, category.id);
  };

  if (isSmallTablet() || isMobile() || isMobileOnly)
    if (isOpen)
      return categories.map((category) => (
        <StyledSubItemMobile
          className="dropdown-item item-mobile"
          key={category.id}
          label={getOformCategoryTitle(categoryType, category)}
          onClick={() => onFilterByCategory(category)}
        />
      ));
    else return null;

  return (
    <StyledSubList
      className={`dropdown-sub sub-by-${categoryType}`}
      open={true}
      directionY={"bottom"}
      directionX={"right"}
      isDefaultMode={false}
      fixedDirection={true}
      clickOutsideAction={() => {}}
      withBackdrop={false}
      marginTop={marginTop}
    >
      {categories.map((category) => (
        <DropDownItem
          className="dropdown-item"
          key={category.id}
          label={getOformCategoryTitle(categoryType, category)}
          onClick={() => onFilterByCategory(category)}
        />
      ))}
    </StyledSubList>
  );
};

export default inject(({ oformsStore }) => ({
  getOforms: oformsStore.getOforms,
  oformsFilter: oformsStore.oformsFilter,
  filterOformsByCategory: oformsStore.filterOformsByCategory,
  setOformsCurrentCategory: oformsStore.setOformsCurrentCategory,
}))(withTranslation(["FormGallery", "Common"])(CategorySubList));
