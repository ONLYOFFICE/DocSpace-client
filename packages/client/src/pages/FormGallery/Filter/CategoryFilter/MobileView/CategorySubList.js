import { StyledSubItemMobile } from "./index.styled";
import { inject } from "mobx-react";
import { withTranslation } from "react-i18next";

const CategorySubList = ({
  isOpen,
  categories,
  categoryType,

  getCategoryTitle,
  onFilterByCategory,
}) => {
  if (!isOpen) return null;

  return categories.map((category) => (
    <StyledSubItemMobile
      className="dropdown-item item-mobile"
      key={category.id}
      label={getCategoryTitle(category)}
      onClick={() => onFilterByCategory(categoryType, category)}
    />
  ));
};

export default inject(({ oformsStore }) => ({
  getCategoryTitle: oformsStore.getCategoryTitle,
}))(withTranslation(["FormGallery", "Common"])(CategorySubList));
