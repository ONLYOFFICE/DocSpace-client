import * as Styled from "./index.styled";

import DropDown from "@docspace/components/drop-down";
import DropDownItem from "@docspace/components/drop-down-item";
import ExpanderDownReactSvgUrl from "PUBLIC_DIR/images/expander-down.react.svg?url";
import { ReactSVG } from "react-svg";
import Text from "@docspace/components/text";
import { useRef, useState } from "react";
import { inject } from "mobx-react";
import { withTranslation } from "react-i18next";
import SubListByBranch from "./SubListByBranch";
import SubListByType from "./SubListByType";
import SubListPopular from "./SubListPopular";

const CategoryFilter = ({ t }) => {
  const dropdownRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdownIsOpen = () => setIsOpen(!isOpen);
  const onCloseDropdown = () => setIsOpen(false);

  const [mobileSubByBranchIsOpen, setMobileSubByBranchIsOpen] = useState(false);
  const onToggleMobileSubByBranchIsOpen = () => {
    setMobileSubByBranchIsOpen(!mobileSubByBranchIsOpen);
    setMobileSubByTypeIsOpen(false);
    setMobileSubPopularIsOpen(false);
  };

  const [mobileSubByTypeIsOpen, setMobileSubByTypeIsOpen] = useState(false);
  const onToggleMobileSubByTypeIsOpen = () => {
    setMobileSubByTypeIsOpen(!mobileSubByTypeIsOpen);
    setMobileSubByBranchIsOpen(false);
    setMobileSubPopularIsOpen(false);
  };

  const [mobileSubPopularIsOpen, setMobileSubPopularIsOpen] = useState(false);
  const onToggleMobileSubPopularIsOpen = () => {
    setMobileSubPopularIsOpen(!mobileSubPopularIsOpen);
    setMobileSubByBranchIsOpen(false);
    setMobileSubByTypeIsOpen(false);
  };

  return (
    <Styled.CategoryFilter isOpen={isOpen}>
      <div className="combobox" onClick={toggleDropdownIsOpen}>
        <Text className="combobox-text" noSelect>
          {t("FormGallery:Categories")}
        </Text>
        <ReactSVG className="combobox-expander" src={ExpanderDownReactSvgUrl} />
      </div>
      <div className="dropdown-wrapper" ref={dropdownRef}>
        <DropDown
          className={"dropdown-container"}
          forwardedRef={dropdownRef}
          open={isOpen}
          clickOutsideAction={onCloseDropdown}
          directionY={"bottom"}
          directionX={"right"}
          isDefaultMode={false}
          fixedDirection={true}
        >
          <DropDownItem
            className="dropdown-item"
            label={t("FormGallery:ViewAllTemplates")}
            onClick={() => {}}
          />
          <DropDownItem isSeparator />

          <DropDownItem
            className={`dropdown-item item-by-branch ${
              mobileSubByBranchIsOpen && "mobile-sub-open"
            }`}
            label={t("FormGallery:FormsByBranch")}
            onClick={onToggleMobileSubByBranchIsOpen}
            isSubMenu
          />
          <SubListByBranch isOpen={mobileSubByBranchIsOpen} />

          <DropDownItem
            className={`dropdown-item item-by-type ${
              mobileSubByTypeIsOpen && "mobile-sub-open"
            }`}
            label={t("FormGallery:FormsByType")}
            onClick={onToggleMobileSubByTypeIsOpen}
            isSubMenu
          />
          <SubListByType isOpen={mobileSubByTypeIsOpen} />

          <DropDownItem
            className={`dropdown-item item-popular ${
              mobileSubPopularIsOpen && "mobile-sub-open"
            }`}
            label={t("FormGallery:PopularCompilations")}
            onClick={onToggleMobileSubPopularIsOpen}
            isSubMenu
          />
          <SubListPopular isOpen={mobileSubPopularIsOpen} />
        </DropDown>
      </div>
    </Styled.CategoryFilter>
  );
};
export default inject(({}) => ({}))(
  withTranslation(["FormGallery"])(CategoryFilter)
);
