import { StyledSubItemMobile } from "./index.styled";
import { inject } from "mobx-react";
import { withTranslation } from "react-i18next";

const CategorySubList = ({
  isOpen,
  categoryType,
  categories,

  getCategoryTitle,
  filterOformsByCategory,
  setOformsCurrentCategory,
}) => {
  const onFilterByCategory = (category) => {
    setOformsCurrentCategory(category);
    filterOformsByCategory(categoryType, category.id);
  };

  if (!isOpen) return null;

  return categories.map((category) => (
    <StyledSubItemMobile
      className="dropdown-item item-mobile"
      key={category.id}
      label={getCategoryTitle(category)}
      onClick={() => onFilterByCategory(category)}
    />
  ));
};

export default inject(({ oformsStore }) => ({
  getCategoryTitle: oformsStore.getCategoryTitle,
  setOformsCurrentCategory: oformsStore.setOformsCurrentCategory,
  filterOformsByCategory: oformsStore.filterOformsByCategory,
}))(withTranslation(["FormGallery", "Common"])(CategorySubList));
