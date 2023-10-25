import * as Styled from "./index.styled";

import DropDownItem from "@docspace/components/drop-down-item";
import { useState, useRef } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import CategorySubList from "./CategorySubList";
import Scrollbar from "@docspace/components/scrollbar";
import ComboButton from "@docspace/components/combobox/sub-components/combo-button";

const CategoryFilterMobile = ({
  t,

  menuItems,

  currentCategory,
  getCategoryTitle,
  filterOformsByCategory,

  ...rest
}) => {
  const wrapperRef = useRef();
  const scrollRef = useRef();

  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdownIsOpen = () => setIsOpen(!isOpen);

  const [openedCategory, setOpenedCategory] = useState(null);
  const onToggleCategory = (category) => {
    if (openedCategory?.key !== category.key) setOpenedCategory(category);
    else setOpenedCategory(null);
  };

  let calculatedHeight =
    152.2 + (!openedCategory ? 0 : 36 * openedCategory.categories.length);
  const maxCalculatedHeight =
    window.innerHeight - wrapperRef?.current?.offsetTop - 64 - 48;
  if (calculatedHeight > maxCalculatedHeight)
    calculatedHeight = maxCalculatedHeight;

  const onViewAllTemplates = () => filterOformsByCategory("", "");

  return (
    <Styled.CategoryFilterMobileWrapper ref={wrapperRef} {...rest}>
      <ComboButton
        selectedOption={{
          label:
            getCategoryTitle(currentCategory) || t("FormGallery:Categories"),
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

          {menuItems.map((item) => [
            <Styled.CategoryFilterItemMobile
              key={item.key}
              className={`item-by-${item.key}`}
              label={item.label}
              isMobileOpen={openedCategory?.key === item.key}
              onClick={() => onToggleCategory(item)}
              isSubMenu
            />,
            <CategorySubList
              key={`${item.key}-sublist`}
              isOpen={openedCategory?.key === item.key}
              categoryType={item.key}
              categories={item.categories}
            />,
          ])}
        </Scrollbar>
      </Styled.CategoryFilterMobile>
    </Styled.CategoryFilterMobileWrapper>
  );
};

export default inject(({ oformsStore }) => ({
  currentCategory: oformsStore.currentCategory,
  getCategoryTitle: oformsStore.getCategoryTitle,
  filterOformsByCategory: oformsStore.filterOformsByCategory,
}))(withTranslation(["FormGallery"])(observer(CategoryFilterMobile)));
