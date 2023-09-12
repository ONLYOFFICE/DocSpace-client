import { useRef, memo } from "react";
import DropDownItem from "@docspace/components/drop-down-item";
import { isMobile, isSmallTablet } from "@docspace/components/utils/device";
import { StyledSubList, StyledSubItemMobile } from "./index.styled";
import { inject } from "mobx-react";
import { withTranslation } from "react-i18next";
import { OformCategoryType } from "@docspace/client/src/helpers/constants";
import { getOformCategoryTitle } from "@docspace/client/src/helpers/utils";
import { isMobileOnly } from "react-device-detect";
import VirtualList from "@docspace/components/drop-down/VirtualList";

const CategorySubList = ({
  theme,

  isOpen,
  isSubHovered,
  categoryType,
  categories,
  marginTop,

  filterOformsByCategory,
  setOformsCurrentCategory,
}) => {
  const dropdownRef = useRef(null);

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
      isSubHovered={isSubHovered}
      id={`category-sub-list-${categoryType}`}
      className={`dropdown-sub sub-by-${categoryType}`}
      directionX={"right"}
      directionY={"bottom"}
      manualY={"0px"}
      manualX={"0px"}
      marginTop={marginTop}
      open={true}
      forwardedRef={dropdownRef}
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

  // return (
  //   <StyledSubList
  //     className={`dropdown-sub sub-by-${categoryType}`}
  //     open={true}
  //     directionY={"bottom"}
  //     directionX={"right"}
  //     isDefaultMode={false}
  //     fixedDirection={true}
  //     clickOutsideAction={() => {}}
  //     withBackdrop={false}
  //     marginTop={marginTop}
  //   >
  //     {categories.map((category) => (
  //       <DropDownItem
  //         className="dropdown-item"
  //         key={category.id}
  //         label={getOformCategoryTitle(categoryType, category)}
  //         onClick={() => onFilterByCategory(category)}
  //       />
  //     ))}
  //   </StyledSubList>
  // );
};

const Row = memo(({ data, index, style }) => {
  const { children, theme, activedescendant, handleMouseMove } = data;
  const option = children[index];
  const newStyle = { ...style, ...separator };
  return (
    <DropDownItem
      theme={theme}
      noHover
      style={newStyle}
      onMouseMove={() => handleMouseMove(index)}
      isActiveDescendant={activedescendant === index}
      {...option?.props}
    />
  );
});

export default inject(({ auth, oformsStore }) => ({
  theme: auth.settingsStore.theme,

  getOforms: oformsStore.getOforms,
  oformsFilter: oformsStore.oformsFilter,
  filterOformsByCategory: oformsStore.filterOformsByCategory,
  setOformsCurrentCategory: oformsStore.setOformsCurrentCategory,
}))(withTranslation(["FormGallery", "Common"])(CategorySubList));
