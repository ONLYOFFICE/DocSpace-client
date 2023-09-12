import * as Styled from "./index.styled";

import DropDownItem from "@docspace/components/drop-down-item";
import { useState, useEffect, useRef } from "react";
import { inject } from "mobx-react";
import { withTranslation } from "react-i18next";
import CategorySubList from "./CategorySubList";
import { OformCategoryType } from "@docspace/client/src/helpers/constants";
import Scrollbar from "@docspace/components/scrollbar";
import { getOformCategoryTitle } from "@docspace/client/src/helpers/utils";

const CategoryFilterMobile = ({
  t,

  onViewAllTemplates,
  formsByBranch,
  formsByType,
  formsByCompilation,
}) => {
  const dropdownRef = useRef();

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

  return (
    <Styled.CategoryFilterMobile
      open={true}
      withBackdrop={false}
      manualWidth={"100%"}
      directionY="top"
      directionX="right"
      isMobile={true}
      fixedDirection={true}
      heightProp={500}
      //   sectionWidth={sectionWidth}
      isDefaultMode={false}
      className="mainBtnDropdown"
    >
      <Scrollbar
        style={{ position: "absolute" }}
        scrollclass="section-scroll"
        stype="mediumBlack"
        ref={dropdownRef}
      >
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
          isSubMenu
        />
        {isBranchOpen && (
          <CategorySubList
            isSubOpen={isBranchOpen}
            categoryType={OformCategoryType.Branch}
            categories={formsByBranch}
          />
        )}
        <Styled.CategoryFilterItem
          id={"FormsByType"}
          key={"FormsByType"}
          className={`item-by-${OformCategoryType.Type}`}
          label={t("FormGallery:FormsByType")}
          isSubMenu
        />
        <Styled.CategoryFilterItem
          id={"PopularCompilations"}
          key={"PopularCompilations"}
          className={`item-by-${OformCategoryType.Compilation}`}
          label={t("FormGallery:PopularCompilations")}
          isSubMenu
        />
      </Scrollbar>
    </Styled.CategoryFilterMobile>
  );

  //   // general interactions

  //   const [isOpen, setIsOpen] = useState(false);
  //   const toggleDropdownIsOpen = () => setIsOpen(!isOpen);
  //   const onCloseDropdown = () => setIsOpen(false);

  //   // mobile interactions

  //   const [openedCategory, setOpenedCategory] = useState(null);
  //   const isBranchOpen = openedCategory === OformCategoryType.Branch;
  //   const isTypeOpen = openedCategory === OformCategoryType.Type;
  //   const isCompilationOpen = openedCategory === OformCategoryType.Compilation;

  //   const onToggleBranchCategory = () =>
  //     setOpenedCategory(isBranchOpen ? null : OformCategoryType.Branch);
  //   const onToggleTypeCategory = () =>
  //     setOpenedCategory(isTypeOpen ? null : OformCategoryType.Type);
  //   const onToggleCompilationCategory = () =>
  //     setOpenedCategory(isCompilationOpen ? null : OformCategoryType.Compilation);

  //   return (
  //     <Styled.CategoryFilterWrapper>
  //       <Styled.CategoryFilter
  //         id="comboBoxLanguage"
  //         tabIndex={1}
  //         className={"combobox"}
  //         selectedOption={{ label: t("FormGallery:ViewAllTemplates") }}
  //         onSelect={() => {}}
  //         isDisabled={false}
  //         manualWidth={"100%"}
  //         showDisabledItems={true}
  //         options={[]}
  //         directionX={"right"}
  //         directionY={"both"}
  //         scaled={true}
  //         size={"content"}
  //         disableIconClick={false}
  //         disableItemClick={false}
  //         isDefaultMode={false}
  //         fixedDirection={true}
  //         advancedOptionsCount={5}
  //         advancedOptions={
  //           <>
  //             <Styled.CategoryFilterItem
  //               id={"ViewAllTemplates"}
  //               key={"ViewAllTemplates"}
  //               className="dropdown-item"
  //               label={t("FormGallery:ViewAllTemplates")}
  //               onClick={onViewAllTemplates}
  //             />
  //             <DropDownItem isSeparator />
  //             <Styled.CategoryFilterItem
  //               id={"FormsByBranch"}
  //               key={"FormsByBranch"}
  //               className={`item-by-${OformCategoryType.Branch}`}
  //               isMobileOpen={isBranchOpen}
  //               label={t("FormGallery:FormsByBranch")}
  //               onClick={onToggleBranchCategory}
  //               isSubMenu
  //             />
  //             <Styled.CategoryFilterItem
  //               id={"FormsByType"}
  //               key={"FormsByType"}
  //               className={`item-by-${OformCategoryType.Type}`}
  //               isMobileOpen={isTypeOpen}
  //               label={t("FormGallery:FormsByType")}
  //               onClick={onToggleTypeCategory}
  //               isSubMenu
  //             />
  //             <Styled.CategoryFilterItem
  //               id={"PopularCompilations"}
  //               key={"PopularCompilations"}
  //               className={`item-by-${OformCategoryType.Compilation}`}
  //               isMobileOpen={isCompilationOpen}
  //               label={t("FormGallery:PopularCompilations")}
  //               onClick={onToggleCompilationCategory}
  //               isSubMenu
  //             />
  //           </>
  //         }
  //       />
  //     </Styled.CategoryFilterWrapper>
  //   );
};

export default inject(({ oformsStore }) => ({
  currentCategory: oformsStore.currentCategory,

  fetchCategoriesByBranch: oformsStore.fetchCategoriesByBranch,
  fetchCategoriesByType: oformsStore.fetchCategoriesByType,
  fetchPopularCategories: oformsStore.fetchPopularCategories,

  oformsFilter: oformsStore.oformsFilter,
  filterOformsByCategory: oformsStore.filterOformsByCategory,
}))(withTranslation(["FormGallery"])(CategoryFilterMobile));
