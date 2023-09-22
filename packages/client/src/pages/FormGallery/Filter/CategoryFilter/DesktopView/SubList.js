import * as Styled from "./index.styled";
import { inject } from "mobx-react";
import { withTranslation } from "react-i18next";
import { getOformCategoryTitle } from "@docspace/client/src/helpers/utils";
import { getDefaultOformLocale } from "@docspace/common/utils";

const categoryLocale = getDefaultOformLocale();

const SubList = ({
  categoryType,
  categories,

  isDropdownOpen,
  isSubHovered,
  marginTop,
  onCloseDropdown,

  filterOformsByCategory,
  setOformsCurrentCategory,
}) => {
  const onPreventDefault = (e) => e.preventDefault();

  const onFilterByCategory = (category) => {
    onCloseDropdown();
    setOformsCurrentCategory(category);
    filterOformsByCategory(categoryType, category.id);
  };

  return (
    <Styled.CategoryFilterSubList
      open={isDropdownOpen}
      isSubHovered={isSubHovered}
      marginTop={marginTop}
      id={`category-sub-list-${categoryType}`}
      className={`dropdown-sub sub-by-${categoryType}`}
      directionX={"right"}
      directionY={"bottom"}
      manualY={"0px"}
      manualX={"0px"}
      clickOutsideAction={() => {}}
      maxHeight={296}
      manualWidth={"206px"}
      showDisabledItems={false}
      isDefaultMode={false}
      withBackdrop={false}
      withBackground={false}
      isMobileView={false}
      isNoFixedHeightOptions={false}
    >
      {categories.map((category) => {
        const categoryTitle = getOformCategoryTitle(category, categoryLocale);
        const onCategoryClick = () => onFilterByCategory(category);
        return (
          <Styled.CategoryFilterSubListItem
            className="dropdown-item"
            height={36}
            heightTablet={36}
            key={category.id}
            onClick={onCategoryClick}
            onMouseDown={onPreventDefault}
            title={categoryTitle}
          >
            <div
              className="item-content"
              style={{
                maxWidth: "182px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {categoryTitle}
            </div>
          </Styled.CategoryFilterSubListItem>
        );
      })}
    </Styled.CategoryFilterSubList>
  );
};

export default inject(({ oformsStore }) => ({
  getOforms: oformsStore.getOforms,
  oformsFilter: oformsStore.oformsFilter,
  filterOformsByCategory: oformsStore.filterOformsByCategory,
  setOformsCurrentCategory: oformsStore.setOformsCurrentCategory,
}))(withTranslation(["FormGallery", "Common"])(SubList));
