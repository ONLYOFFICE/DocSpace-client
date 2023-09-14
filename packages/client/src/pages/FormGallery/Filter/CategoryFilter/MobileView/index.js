import * as Styled from "./index.styled";

import DropDownItem from "@docspace/components/drop-down-item";
import { useState, useEffect, useRef } from "react";
import { inject } from "mobx-react";
import { withTranslation } from "react-i18next";
import CategorySubList from "./CategorySubList";
import { OformCategoryType } from "@docspace/client/src/helpers/constants";
import Scrollbar from "@docspace/components/scrollbar";
import { getOformCategoryTitle } from "@docspace/client/src/helpers/utils";
import ComboBox from "@docspace/components/combobox";
import ComboButton from "@docspace/components/combobox/sub-components/combo-button";

const CategoryFilterMobile = ({
  t,

  onViewAllTemplates,
  formsByBranch,
  formsByType,
  formsByCompilation,

  ...rest
}) => {
  const wrapperRef = useRef();
  const scrollRef = useRef();

  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdownIsOpen = () => setIsOpen(!isOpen);
  const onCloseDropdown = () => setIsOpen(false);

  const [openedCategory, setOpenedCategory] = useState(null);
  const isBranchOpen = openedCategory === OformCategoryType.Branch;
  const isTypeOpen = openedCategory === OformCategoryType.Type;
  const isCompilationOpen = openedCategory === OformCategoryType.Compilation;

  const onToggleBranchCategory = () =>
    setOpenedCategory(isBranchOpen ? null : OformCategoryType.Branch);
  const onToggleTypeCategory = () =>
    setOpenedCategory(isTypeOpen ? null : OformCategoryType.Type);
  const onToggleCompilationCategory = () =>
    setOpenedCategory(isCompilationOpen ? null : OformCategoryType.Compilation);

  const wrapperOffsetTop = wrapperRef?.current?.offsetTop;
  const maxCalculatedHeight = window.innerHeight - wrapperOffsetTop - 64;
  console.log(wrapperOffsetTop);
  console.log(
    window.innerHeight,
    wrapperOffsetTop,
    maxCalculatedHeight,
    maxCalculatedHeight + wrapperOffsetTop
  );
  let calculatedHeight =
    36 +
    8.2 +
    36 * 3 +
    36 *
      (isBranchOpen
        ? formsByBranch.length
        : isTypeOpen
        ? formsByType.length
        : isCompilationOpen
        ? formsByCompilation.length
        : 0);
  if (calculatedHeight > maxCalculatedHeight)
    calculatedHeight = maxCalculatedHeight;

  return (
    <Styled.CategoryFilterMobileWrapper ref={wrapperRef} {...rest}>
      <ComboButton
        selectedOption={{
          label: t("FormGallery:Categories"),
        }}
        isOpen={isOpen}
        scaled={true}
        onClick={toggleDropdownIsOpen}
        tabIndex={1}
      />

      <Styled.CategoryFilterMobile
        open={isOpen}
        withBackdrop={false}
        manualWidth={"100%"}
        directionY="bottom"
        directionX="right"
        isMobile={true}
        fixedDirection={true}
        isDefaultMode={false}
        className="mainBtnDropdown"
        forcedHeight={`${calculatedHeight}px`}
      >
        <Scrollbar
          style={{ position: "absolute" }}
          scrollclass="section-scroll"
          stype="mediumBlack"
          ref={scrollRef}
        >
          <Styled.CategoryFilterItemMobile
            id={"ViewAllTemplates"}
            key={"ViewAllTemplates"}
            className="dropdown-item"
            label={t("FormGallery:ViewAllTemplates")}
            onClick={onViewAllTemplates}
          />

          <DropDownItem isSeparator />

          <Styled.CategoryFilterItemMobile
            id={"FormsByBranch"}
            key={"FormsByBranch"}
            className={`item-by-${OformCategoryType.Branch}`}
            label={t("FormGallery:FormsByBranch")}
            isMobileOpen={isBranchOpen}
            onClick={onToggleBranchCategory}
            isSubMenu
          />
          {isBranchOpen && (
            <CategorySubList
              categoryType={OformCategoryType.Branch}
              categories={formsByBranch}
            />
          )}

          <Styled.CategoryFilterItemMobile
            id={"FormsByType"}
            key={"FormsByType"}
            className={`item-by-${OformCategoryType.Type}`}
            label={t("FormGallery:FormsByType")}
            isMobileOpen={isTypeOpen}
            onClick={onToggleTypeCategory}
            isSubMenu
          />
          {isTypeOpen && (
            <CategorySubList
              categoryType={OformCategoryType.Type}
              categories={formsByType}
            />
          )}

          <Styled.CategoryFilterItemMobile
            id={"PopularCompilations"}
            key={"PopularCompilations"}
            className={`item-by-${OformCategoryType.Compilation}`}
            label={t("FormGallery:PopularCompilations")}
            isMobileOpen={isCompilationOpen}
            onClick={onToggleCompilationCategory}
            isSubMenu
          />
          {isCompilationOpen && (
            <CategorySubList
              categoryType={OformCategoryType.Compilation}
              categories={formsByCompilation}
            />
          )}
        </Scrollbar>
      </Styled.CategoryFilterMobile>
    </Styled.CategoryFilterMobileWrapper>
  );
};

export default inject(({ oformsStore }) => ({
  currentCategory: oformsStore.currentCategory,

  fetchCategoriesByBranch: oformsStore.fetchCategoriesByBranch,
  fetchCategoriesByType: oformsStore.fetchCategoriesByType,
  fetchPopularCategories: oformsStore.fetchPopularCategories,

  oformsFilter: oformsStore.oformsFilter,
  filterOformsByCategory: oformsStore.filterOformsByCategory,
}))(withTranslation(["FormGallery"])(CategoryFilterMobile));
