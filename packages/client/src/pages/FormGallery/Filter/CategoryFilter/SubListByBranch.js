import DropDownItem from "@docspace/components/drop-down-item";
import { isMobileOnly } from "react-device-detect";
import { isMobile, isSmallTablet } from "@docspace/components/utils/device";
import { StyledSubList, StyledSubItemMobile } from "./index.styled";
import { getCategoriesByBranch } from "@docspace/common/api/oforms";
import { useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import OformsFilter from "@docspace/common/api/oforms/filter";
import { inject } from "mobx-react";
import { withTranslation } from "react-i18next";
import { OformCategory } from "@docspace/client/src/helpers/constants";

const SubListByBranch = ({ isOpen, oformsFilter, getOforms }) => {
  const [formsByBranch, setFormsByBranch] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();

  const onOpenCategory = (category) => {
    const newFilter = oformsFilter.clone();
    newFilter.categorizeBy = OformCategory.Branch;
    newFilter.categoryUrl = category.attributes.urlReq;
    getOforms(newFilter);
    navigate(`${location.pathname}?${newFilter.toUrlParams()}`);
  };

  useEffect(() => {
    (async () => {
      const data = await getCategoriesByBranch();
      setFormsByBranch(data);
    })();
  }, []);

  if (isSmallTablet() || isMobile() || isMobileOnly) {
    if (isOpen)
      return formsByBranch.map((category) => (
        <StyledSubItemMobile
          className="dropdown-item item-mobile"
          key={category.id}
          label={category.attributes.categorie}
          onClick={() => onOpenCategory(category)}
        />
      ));
  } else
    return (
      <StyledSubList
        className={"dropdown-sub sub-by-branch"}
        open={true}
        directionY={"bottom"}
        directionX={"right"}
        isDefaultMode={false}
        fixedDirection={true}
        clickOutsideAction={() => {}}
        withBackdrop={false}
        marginTop={"43px"}
      >
        {formsByBranch.map((category) => (
          <DropDownItem
            className="dropdown-item"
            key={category.id}
            label={category.attributes.categorie}
            onClick={() => onOpenCategory(category)}
          />
        ))}
      </StyledSubList>
    );
};

export default inject(({ oformsStore }) => ({
  oformsFilter: oformsStore.oformsFilter,
  getOforms: oformsStore.getOforms,
}))(withTranslation(["FormGallery", "Common"])(SubListByBranch));
