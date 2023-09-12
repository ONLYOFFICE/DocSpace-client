import DropDownItem from "@docspace/components/drop-down-item";
import { StyledSubList } from "./index.styled";
import { inject } from "mobx-react";
import { withTranslation } from "react-i18next";
import { getOformCategoryTitle } from "@docspace/client/src/helpers/utils";

const CategorySubList = ({
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
    <StyledSubList
      isSubHovered={isSubHovered}
      id={`category-sub-list-${categoryType}`}
      className={`dropdown-sub sub-by-${categoryType}`}
      directionX={"right"}
      directionY={"bottom"}
      manualY={"0px"}
      manualX={"0px"}
      marginTop={marginTop}
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
