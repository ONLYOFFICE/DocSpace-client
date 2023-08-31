import DropDownItem from "@docspace/components/drop-down-item";
import { isMobileOnly } from "react-device-detect";
import { isMobile, isSmallTablet } from "@docspace/components/utils/device";
import { StyledSubList, StyledSubItemMobile } from "./index.styled";
import { inject } from "mobx-react";
import { withTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { OformCategory } from "@docspace/client/src/helpers/constants";

const SubListByBranch = ({
  isOpen,
  categoryType,
  categories,
  marginTop,

  getOforms,
  oformsFilter,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const getCategoryLabel = (category) =>
    categoryType === OformCategory.Branch
      ? category.attributes.categorie
      : categoryType === OformCategory.Type
      ? category.attributes.type
      : category.attributes.compilation;

  const onOpenCategory = (category) => {
    const newFilter = oformsFilter.clone();
    newFilter.categorizeBy = categoryType;
    newFilter.categoryUrl = category.attributes.urlReq;
    getOforms(newFilter);
    navigate(`${location.pathname}?${newFilter.toUrlParams()}`);
  };

  if (isSmallTablet() || isMobile() || isMobileOnly)
    if (isOpen)
      return categories.map((category) => (
        <StyledSubItemMobile
          className="dropdown-item item-mobile"
          key={category.id}
          label={getCategoryLabel(category)}
          onClick={() => onOpenCategory(category)}
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
          label={getCategoryLabel(category)}
          onClick={() => onOpenCategory(category)}
        />
      ))}
    </StyledSubList>
  );
};

export default inject(({ oformsStore }) => ({
  getOforms: oformsStore.getOforms,
  oformsFilter: oformsStore.oformsFilter,
}))(withTranslation(["FormGallery", "Common"])(SubListByBranch));
