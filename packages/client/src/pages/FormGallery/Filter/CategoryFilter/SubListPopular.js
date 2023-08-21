import DropDownItem from "@docspace/components/drop-down-item";
import { isMobileOnly } from "react-device-detect";
import { isMobile, isSmallTablet } from "@docspace/components/utils/device";
import { StyledSubList, StyledSubItemMobile } from "./index.styled";
import { getPopularCategories } from "@docspace/common/api/oforms";
import { useState, useEffect } from "react";

const SubListPopular = ({ isOpen }) => {
  const [popularForms, setPopularForms] = useState([]);

  const onOpenCategory = (category) => {
    openCategory();
  };

  useEffect(() => {
    (async () => {
      const data = await getPopularCategories();
      setPopularForms(data);
    })();
  }, []);

  if (isSmallTablet() || isMobile() || isMobileOnly) {
    if (isOpen)
      return popularForms.map((category) => (
        <StyledSubItemMobile
          className="dropdown-item item-mobile"
          key={category.id}
          label={category.attributes.compilation}
          onClick={() => onOpenCategory(category)}
        />
      ));
  } else
    return (
      <StyledSubList
        className={"dropdown-sub sub-popular"}
        open={true}
        directionY={"bottom"}
        directionX={"right"}
        isDefaultMode={false}
        fixedDirection={true}
        clickOutsideAction={() => {}}
        withBackdrop={false}
        marginTop={"111px"}
      >
        {popularForms.map((category) => (
          <DropDownItem
            className="dropdown-item"
            key={category.id}
            label={category.attributes.compilation}
            onClick={() => onOpenCategory(category)}
          />
        ))}
      </StyledSubList>
    );
};

export default SubListPopular;
