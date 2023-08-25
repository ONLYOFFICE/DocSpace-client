import DropDownItem from "@docspace/components/drop-down-item";
import { isMobileOnly } from "react-device-detect";
import { isMobile, isSmallTablet } from "@docspace/components/utils/device";
import { StyledSubList, StyledSubItemMobile } from "./index.styled";
import { getCategoriesByType } from "@docspace/common/api/oforms";
import { useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { inject } from "mobx-react";
import { withTranslation } from "react-i18next";
import { OformCategory } from "@docspace/client/src/helpers/constants";

const SubListByType = ({ isOpen, getOforms, oformsFilter }) => {
  const [formsByType, setFormsByType] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();

  const onOpenCategory = (category) => {
    const newFilter = oformsFilter.clone();
    newFilter.categorizeBy = OformCategory.Type;
    newFilter.categoryUrl = category.attributes.urlReq;
    getOforms(newFilter);
    navigate(`${location.pathname}?${newFilter.toUrlParams()}`);
  };

  useEffect(() => {
    (async () => {
      const data = await getCategoriesByType();
      setFormsByType(data);
    })();
  }, []);

  if (isSmallTablet() || isMobile() || isMobileOnly) {
    if (isOpen)
      return formsByType.map((category) => (
        <StyledSubItemMobile
          className="dropdown-item item-mobile"
          key={category.id}
          label={category.attributes.type}
          onClick={() => onOpenCategory(category)}
        />
      ));
  } else
    return (
      <StyledSubList
        className={"dropdown-sub sub-by-type"}
        open={true}
        directionY={"bottom"}
        directionX={"right"}
        isDefaultMode={false}
        fixedDirection={true}
        clickOutsideAction={() => {}}
        withBackdrop={false}
        marginTop={"79px"}
      >
        {formsByType.map((category) => (
          <DropDownItem
            className="dropdown-item"
            key={category.id}
            label={category.attributes.type}
            onClick={() => onOpenCategory(category)}
          />
        ))}
      </StyledSubList>
    );
};

export default inject(({ oformsStore }) => ({
  oformsFilter: oformsStore.oformsFilter,
  getOforms: oformsStore.getOforms,
}))(withTranslation(["FormGallery", "Common"])(SubListByType));
