import * as Styled from "./index.styled";

import DropDown from "@docspace/components/drop-down";
import DropDownItem from "@docspace/components/drop-down-item";
import ExpanderDownReactSvgUrl from "PUBLIC_DIR/images/expander-down.react.svg?url";
import { ReactSVG } from "react-svg";
import Text from "@docspace/components/text";
import { useRef, useState, useEffect } from "react";
import { inject } from "mobx-react";
import { withTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import OformsFilter from "@docspace/common/api/oforms/filter";
import SubList from "./SubList";
import { OformCategory } from "@docspace/client/src/helpers/constants";
import {
  getCategoriesByBranch,
  getCategoriesByType,
  getPopularCategories,
} from "@docspace/common/api/oforms";

const CategoryFilter = ({ t, getOforms }) => {
  const dropdownRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdownIsOpen = () => setIsOpen(!isOpen);
  const onCloseDropdown = () => setIsOpen(false);

  const [openedCategory, setOpenedCategory] = useState(null);
  const isBranchCategoryOpen = openedCategory === OformCategory.Branch;
  const isTypeCategoryOpen = openedCategory === OformCategory.Type;
  const isCompilationCategoryOpen =
    openedCategory === OformCategory.Compilation;

  const onToggleBranchCategory = () =>
    setOpenedCategory(isBranchCategoryOpen ? null : OformCategory.Branch);
  const onToggleTypeCategory = () =>
    setOpenedCategory(isTypeCategoryOpen ? null : OformCategory.Type);
  const onToggleCompilationCategory = () =>
    setOpenedCategory(
      isCompilationCategoryOpen ? null : OformCategory.Compilation
    );

  const [formsByBranch, setFormsByBranch] = useState([]);
  const [formsByType, setFormsByType] = useState([]);
  const [formsByCompilation, setFormsByCompilation] = useState([]);
  useEffect(() => {
    (async () => {
      const branchData = await getCategoriesByBranch();
      setFormsByBranch(branchData);
      const typeData = await getCategoriesByType();
      setFormsByType(typeData);
      const compilationData = await getPopularCategories();
      setFormsByCompilation(compilationData);
    })();
  }, []);

  const onViewAllTemplates = () => {
    const newFilter = OformsFilter.getFilter(location);
    newFilter.categorizeBy = "";
    newFilter.categoryUrl = "";
    getOforms(newFilter);
    navigate(`${location.pathname}?${newFilter.toUrlParams()}`);
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
            onClick={onViewAllTemplates}
          />

          <DropDownItem isSeparator />

          <DropDownItem
            className={`dropdown-item item-by-${OformCategory.Branch} ${
              isBranchCategoryOpen && "mobile-sub-open"
            }`}
            label={t("FormGallery:FormsByBranch")}
            onClick={onToggleBranchCategory}
            isSubMenu
          />
          <SubList
            isOpen={isBranchCategoryOpen}
            categoryType={OformCategory.Branch}
            categories={formsByBranch}
            marginTop={"43px"}
          />

          <DropDownItem
            className={`dropdown-item item-by-${OformCategory.Type} ${
              isTypeCategoryOpen && "mobile-sub-open"
            }`}
            label={t("FormGallery:FormsByType")}
            onClick={onToggleTypeCategory}
            isSubMenu
          />
          <SubList
            isOpen={isTypeCategoryOpen}
            categoryType={OformCategory.Type}
            categories={formsByType}
            marginTop={"79px"}
          />

          <DropDownItem
            className={`dropdown-item item-by-${OformCategory.Compilation} ${
              isCompilationCategoryOpen && "mobile-sub-open"
            }`}
            label={t("FormGallery:PopularCompilations")}
            onClick={onToggleCompilationCategory}
            isSubMenu
          />
          <SubList
            isOpen={isCompilationCategoryOpen}
            categoryType={OformCategory.Compilation}
            categories={formsByCompilation}
            marginTop={"111px"}
          />
        </DropDown>
      </div>
    </Styled.CategoryFilter>
  );
};
export default inject(({ oformsStore }) => ({
  getOforms: oformsStore.getOforms,
}))(withTranslation(["FormGallery"])(CategoryFilter));
