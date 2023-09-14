import { StyledSubItemMobile } from "./index.styled";
import { inject } from "mobx-react";
import { withTranslation } from "react-i18next";
import { getOformCategoryTitle } from "@docspace/client/src/helpers/utils";

const CategorySubList = ({
  categoryType,
  categories,

  filterOformsByCategory,
  setOformsCurrentCategory,
}) => {
  const onFilterByCategory = (category) => {
    setOformsCurrentCategory(category);
    filterOformsByCategory(categoryType, category.id);
  };

  return categories.map((category) => (
    <StyledSubItemMobile
      className="dropdown-item item-mobile"
      key={category.id}
      label={getOformCategoryTitle(categoryType, category)}
      onClick={() => onFilterByCategory(category)}
    />
  ));
};

export default inject(({ auth, oformsStore }) => ({
  theme: auth.settingsStore.theme,

  getOforms: oformsStore.getOforms,
  oformsFilter: oformsStore.oformsFilter,
  filterOformsByCategory: oformsStore.filterOformsByCategory,
  setOformsCurrentCategory: oformsStore.setOformsCurrentCategory,
}))(withTranslation(["FormGallery", "Common"])(CategorySubList));
