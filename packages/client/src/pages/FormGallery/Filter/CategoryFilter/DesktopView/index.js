import * as Styled from "./index.styled";

import DropDownItem from "@docspace/components/drop-down-item";
import { useState, useEffect } from "react";
import { inject } from "mobx-react";
import { withTranslation } from "react-i18next";
import SubList from "./SubList";
import { OformCategoryType } from "@docspace/client/src/helpers/constants";

const CategoryFilterDesktop = ({
  t,

  fetchCategoryFilterMenuItems,

  currentCategoryTitle,

  onViewAllTemplates,
  formsByBranch,
  formsByType,
  formsByCompilation,

  ...rest
}) => {
  // const [menuItems, setMenuItems] = useState([]);

  const [isOpen, setIsOpen] = useState(false);
  const onToggleDropdownIsOpen = () => setIsOpen(!isOpen);
  const onCloseDropdown = () => setIsOpen(false);

  const [isBranchHovered, setIsBranchHovered] = useState(false);
  const [isTypeHovered, setIsTypeHovered] = useState(false);
  const [isCompilationHovered, setIsCompilationHovered] = useState(false);

  const onMouseEnterBranch = () => setIsBranchHovered(true);
  const onMouseLeaveBranch = () => setIsBranchHovered(false);
  const onMouseEnterType = () => setIsTypeHovered(true);
  const onMouseLeaveType = () => setIsTypeHovered(false);
  const onMouseEnterCompilation = () => setIsCompilationHovered(true);
  const onMouseLeaveCompilation = () => setIsCompilationHovered(false);

  // useEffect(() => {
  //   (async () => {
  //     const fetchedMenuItems = await fetchCategoryFilterMenuItems();
  //     setMenuItems(fetchedMenuItems);
  //   })();
  // }, []);

  return (
    <Styled.CategoryFilterWrapper {...rest}>
      <Styled.CategoryFilter
        id="comboBoxLanguage"
        tabIndex={1}
        className={"combobox"}
        opened={isOpen}
        onClick={onToggleDropdownIsOpen}
        onSelect={onCloseDropdown}
        isDisabled={false}
        showDisabledItems={true}
        options={[]}
        directionX={"right"}
        directionY={"both"}
        scaled={true}
        size={"content"}
        disableIconClick={false}
        disableItemClick={false}
        isDefaultMode={false}
        fixedDirection={true}
        advancedOptionsCount={5}
        selectedOption={{
          label: currentCategoryTitle || t("FormGallery:Categories"),
        }}
        advancedOptions={
          <>
            <Styled.CategoryFilterItem
              id={"ViewAllTemplates"}
              key={"ViewAllTemplates"}
              title={t("FormGallery:ViewAllTemplates")}
              className="dropdown-item"
              label={t("FormGallery:ViewAllTemplates")}
              onClick={onViewAllTemplates}
            />
            <DropDownItem isSeparator />
            <Styled.CategoryFilterItem
              id={"FormsByBranch"}
              key={"FormsByBranch"}
              title={t("FormGallery:FormsByBranch")}
              className={`item-by-${OformCategoryType.Branch}`}
              label={t("FormGallery:FormsByBranch")}
              onMouseEnter={onMouseEnterBranch}
              onMouseLeave={onMouseLeaveBranch}
              isSubMenu
            />
            <Styled.CategoryFilterItem
              id={"FormsByType"}
              key={"FormsByType"}
              title={t("FormGallery:FormsByType")}
              className={`item-by-${OformCategoryType.Type}`}
              label={t("FormGallery:FormsByType")}
              onMouseEnter={onMouseEnterType}
              onMouseLeave={onMouseLeaveType}
              isSubMenu
            />
            <Styled.CategoryFilterItem
              id={"PopularCompilations"}
              key={"PopularCompilations"}
              title={t("FormGallery:PopularCompilations")}
              className={`item-by-${OformCategoryType.Compilation}`}
              label={t("FormGallery:PopularCompilations")}
              onMouseEnter={onMouseEnterCompilation}
              onMouseLeave={onMouseLeaveCompilation}
              isSubMenu
            />
          </>
        }
      />

      <SubList
        categoryType={OformCategoryType.Branch}
        categories={formsByBranch}
        isDropdownOpen={isOpen}
        isSubHovered={isBranchHovered}
        marginTop={"83px"}
        onCloseDropdown={onCloseDropdown}
      />
      <SubList
        categoryType={OformCategoryType.Type}
        categories={formsByType}
        isDropdownOpen={isOpen}
        isSubHovered={isTypeHovered}
        marginTop={"115px"}
        onCloseDropdown={onCloseDropdown}
      />
      <SubList
        categoryType={OformCategoryType.Compilation}
        categories={formsByCompilation}
        isDropdownOpen={isOpen}
        isSubHovered={isCompilationHovered}
        marginTop={"147px"}
        onCloseDropdown={onCloseDropdown}
      />
    </Styled.CategoryFilterWrapper>
  );
};
export default inject(({ oformsStore }) => ({
  fetchCategoryFilterMenuItems: oformsStore.fetchCategoryFilterMenuItems,

  currentCategory: oformsStore.currentCategory,

  fetchCategoriesByBranch: oformsStore.fetchCategoriesByBranch,
  fetchCategoriesByType: oformsStore.fetchCategoriesByType,
  fetchPopularCategories: oformsStore.fetchPopularCategories,

  oformsFilter: oformsStore.oformsFilter,
  filterOformsByCategory: oformsStore.filterOformsByCategory,
}))(withTranslation(["FormGallery"])(CategoryFilterDesktop));
