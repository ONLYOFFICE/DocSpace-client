import * as Styled from "./index.styled";

import DropDown from "@docspace/components/drop-down";
import DropDownItem from "@docspace/components/drop-down-item";
import ExpanderDownReactSvgUrl from "PUBLIC_DIR/images/expander-down.react.svg?url";
import { ReactSVG } from "react-svg";
import Text from "@docspace/components/text";
import { useRef, useState, useEffect } from "react";
import { inject } from "mobx-react";
import { withTranslation } from "react-i18next";
import CategorySubList from "./CategorySubList";
import { OformCategoryType } from "@docspace/client/src/helpers/constants";
import {
  getCategoriesByBranch,
  getCategoriesByType,
  getPopularCategories,
} from "@docspace/common/api/oforms";
import { getOformCategoryTitle } from "@docspace/client/src/helpers/utils";

const CategoryFilter = ({
  t,

  currentCategory,

  fetchCategoriesByBranch,
  fetchCategoriesByType,
  fetchPopularCategories,

  oformsFilter,
  filterOformsByCategory,
}) => {
  const dropdownRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdownIsOpen = () => setIsOpen(!isOpen);
  const onCloseDropdown = () => setIsOpen(false);

  const [openedCategory, setOpenedCategory] = useState(null);
  const isBranchCategoryOpen = openedCategory === OformCategoryType.Branch;
  const isTypeCategoryOpen = openedCategory === OformCategoryType.Type;
  const isCompilationCategoryOpen =
    openedCategory === OformCategoryType.Compilation;

  const onViewAllTemplates = () => filterOformsByCategory("", "");

  const onToggleBranchCategory = () =>
    setOpenedCategory(isBranchCategoryOpen ? null : OformCategoryType.Branch);
  const onToggleTypeCategory = () =>
    setOpenedCategory(isTypeCategoryOpen ? null : OformCategoryType.Type);
  const onToggleCompilationCategory = () =>
    setOpenedCategory(
      isCompilationCategoryOpen ? null : OformCategoryType.Compilation
    );

  const [formsByBranch, setFormsByBranch] = useState([]);
  const [formsByType, setFormsByType] = useState([]);
  const [formsByCompilation, setFormsByCompilation] = useState([]);
  useEffect(() => {
    (async () => {
      const branchData = await fetchCategoriesByBranch();
      setFormsByBranch(branchData);
      const typeData = await fetchCategoriesByType();
      setFormsByType(typeData);
      const compilationData = await fetchPopularCategories();
      setFormsByCompilation(compilationData);
    })();
  }, [oformsFilter.locale]);

  return (
    <Styled.CategoryFilter isOpen={isOpen}>
      <div className="combobox" onClick={toggleDropdownIsOpen}>
        <Text truncate className="combobox-text" noSelect>
          {getOformCategoryTitle(oformsFilter.categorizeBy, currentCategory) ||
            t("FormGallery:Categories")}
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
            className={`dropdown-item item-by-${OformCategoryType.Branch} ${
              isBranchCategoryOpen && "mobile-sub-open"
            }`}
            label={t("FormGallery:FormsByBranch")}
            onClick={onToggleBranchCategory}
            isSubMenu
          />
          <CategorySubList
            isOpen={isBranchCategoryOpen}
            categoryType={OformCategoryType.Branch}
            categories={formsByBranch}
            marginTop={"43px"}
          />

          <DropDownItem
            className={`dropdown-item item-by-${OformCategoryType.Type} ${
              isTypeCategoryOpen && "mobile-sub-open"
            }`}
            label={t("FormGallery:FormsByType")}
            onClick={onToggleTypeCategory}
            isSubMenu
          />
          <CategorySubList
            isOpen={isTypeCategoryOpen}
            categoryType={OformCategoryType.Type}
            categories={formsByType}
            marginTop={"79px"}
          />

          <DropDownItem
            className={`dropdown-item item-by-${
              OformCategoryType.Compilation
            } ${isCompilationCategoryOpen && "mobile-sub-open"}`}
            label={t("FormGallery:PopularCompilations")}
            onClick={onToggleCompilationCategory}
            isSubMenu
          />
          <CategorySubList
            isOpen={isCompilationCategoryOpen}
            categoryType={OformCategoryType.Compilation}
            categories={formsByCompilation}
            marginTop={"111px"}
          />
        </DropDown>
      </div>
    </Styled.CategoryFilter>
  );
};
export default inject(({ oformsStore }) => ({
  currentCategory: oformsStore.currentCategory,

  fetchCategoriesByBranch: oformsStore.fetchCategoriesByBranch,
  fetchCategoriesByType: oformsStore.fetchCategoriesByType,
  fetchPopularCategories: oformsStore.fetchPopularCategories,

  oformsFilter: oformsStore.oformsFilter,
  filterOformsByCategory: oformsStore.filterOformsByCategory,
}))(withTranslation(["FormGallery"])(CategoryFilter));
