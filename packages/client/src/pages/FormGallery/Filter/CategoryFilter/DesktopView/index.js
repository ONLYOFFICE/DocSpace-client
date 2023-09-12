import * as Styled from "./index.styled";

import DropDownItem from "@docspace/components/drop-down-item";
import { useState } from "react";
import { inject } from "mobx-react";
import { withTranslation } from "react-i18next";
import CategorySubList from "./CategorySubList";
import { OformCategoryType } from "@docspace/client/src/helpers/constants";

const CategoryFilterDesktop = ({
  t,

  onViewAllTemplates,
  formsByBranch,
  formsByType,
  formsByCompilation,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdownIsOpen = () => setIsOpen(!isOpen);
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

  return (
    <Styled.CategoryFilterWrapper>
      <Styled.CategoryFilter
        id="comboBoxLanguage"
        tabIndex={1}
        className={"combobox"}
        selectedOption={{ label: t("FormGallery:ViewAllTemplates") }}
        onSelect={() => {}}
        isDisabled={false}
        manualWidth={"100%"}
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
        advancedOptions={
          <>
            <Styled.CategoryFilterItem
              id={"ViewAllTemplates"}
              key={"ViewAllTemplates"}
              className="dropdown-item"
              label={t("FormGallery:ViewAllTemplates")}
              onClick={onViewAllTemplates}
            />
            <DropDownItem isSeparator />
            <Styled.CategoryFilterItem
              id={"FormsByBranch"}
              key={"FormsByBranch"}
              className={`item-by-${OformCategoryType.Branch}`}
              label={t("FormGallery:FormsByBranch")}
              onMouseEnter={onMouseEnterBranch}
              onMouseLeave={onMouseLeaveBranch}
              isSubMenu
            />
            <Styled.CategoryFilterItem
              id={"FormsByType"}
              key={"FormsByType"}
              className={`item-by-${OformCategoryType.Type}`}
              label={t("FormGallery:FormsByType")}
              onMouseEnter={onMouseEnterType}
              onMouseLeave={onMouseLeaveType}
              isSubMenu
            />
            <Styled.CategoryFilterItem
              id={"PopularCompilations"}
              key={"PopularCompilations"}
              className={`item-by-${OformCategoryType.Compilation}`}
              label={t("FormGallery:PopularCompilations")}
              onMouseEnter={onMouseEnterCompilation}
              onMouseLeave={onMouseLeaveCompilation}
              isSubMenu
            />
          </>
        }
      />

      <CategorySubList
        categoryType={OformCategoryType.Branch}
        categories={formsByBranch}
        isSubHovered={isBranchHovered}
        marginTop={"83px"}
      />
      <CategorySubList
        categoryType={OformCategoryType.Type}
        categories={formsByType}
        isSubHovered={isTypeHovered}
        marginTop={"115px"}
      />

      <CategorySubList
        categoryType={OformCategoryType.Compilation}
        categories={formsByCompilation}
        isSubHovered={isCompilationHovered}
        marginTop={"147px"}
      />
    </Styled.CategoryFilterWrapper>
  );
};
export default inject(({ oformsStore }) => ({
  currentCategory: oformsStore.currentCategory,

  fetchCategoriesByBranch: oformsStore.fetchCategoriesByBranch,
  fetchCategoriesByType: oformsStore.fetchCategoriesByType,
  fetchPopularCategories: oformsStore.fetchPopularCategories,

  oformsFilter: oformsStore.oformsFilter,
  filterOformsByCategory: oformsStore.filterOformsByCategory,
}))(withTranslation(["FormGallery"])(CategoryFilterDesktop));
