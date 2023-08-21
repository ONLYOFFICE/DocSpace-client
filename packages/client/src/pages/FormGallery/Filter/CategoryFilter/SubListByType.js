import DropDownItem from "@docspace/components/drop-down-item";
import { isMobileOnly } from "react-device-detect";
import { isMobile, isSmallTablet } from "@docspace/components/utils/device";
import { StyledSubList, StyledSubItemMobile } from "./index.styled";
import { getCategoriesByType } from "@docspace/common/api/oforms";
import { useState, useEffect } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import OformsFilter from "@docspace/common/api/oforms/filter";
import { inject } from "mobx-react";
import { withTranslation } from "react-i18next";
import Scrollbar from "@docspace/components/scrollbar";
import styled from "styled-components";

const SubListByType = ({ getOforms, isOpen }) => {
  const [formsByType, setFormsByType] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();

  const onOpenCategory = (category) => {
    console.log(category);

    const newFilter = OformsFilter.getFilter(location);
    newFilter.categorizeBy = "type";
    newFilter.categoryName = category.attributes.urlReq;
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
  getOforms: oformsStore.getOforms,
}))(withTranslation(["FormGallery", "Common"])(SubListByType));
