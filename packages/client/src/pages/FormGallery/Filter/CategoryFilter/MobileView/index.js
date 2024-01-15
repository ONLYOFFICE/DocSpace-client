import * as Styled from "./index.styled";

import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import { useState, useRef } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { Scrollbar } from "@docspace/shared/components/scrollbar";
import { ComboButton } from "@docspace/shared/components/combobox";
import { Backdrop } from "@docspace/shared/components/backdrop";
import { isMobile } from "@docspace/shared/utils";

const CategoryFilterMobile = ({
  t,

  menuItems,

  currentCategory,
  getTypeOfCategory,
  getCategoryTitle,
  filterOformsByCategory,
  setOformsCurrentCategory,

  ...rest
}) => {
  const scrollRef = useRef();

  const [isOpen, setIsOpen] = useState(false);
  const onCloseDropdown = () => {
    setIsOpen(false);
    setOpenedMenuItem(null);
  };
  const onToggleDropdown = () => {
    if (isOpen) setOpenedMenuItem(null);
    else setIsOpen(!isOpen);
  };

  const onViewAllTemplates = () => {
    filterOformsByCategory("", "");
    onCloseDropdown();
  };

  const [openedMenuItem, setOpenedMenuItem] = useState(null);
  const onOpenMenuItem = (category) => setOpenedMenuItem(category);
  const onHeaderArrowClick = () => setOpenedMenuItem(null);

  const onFilterByCategory = (category) => {
    filterOformsByCategory(openedMenuItem.key, category.id);

    setOformsCurrentCategory(category);
    setOpenedMenuItem(null);
    setIsOpen(false);
  };

  let height = 0;
  const maxCalculatedHeight = 385;

  let calculatedHeight =
    48 +
    (!openedMenuItem
      ? 36 + 13 + menuItems.length * 36
      : openedMenuItem.categories.length * 36);

  if (calculatedHeight > maxCalculatedHeight) height = maxCalculatedHeight;
  else height = calculatedHeight;

  return (
    <>
      <Backdrop
        visible={isOpen}
        withBackground={isMobile()}
        onClick={onCloseDropdown}
        withoutBlur={!isMobile()}
      />

      <Styled.CategoryFilterMobileWrapper {...rest}>
        <ComboButton
          selectedOption={{
            label:
              getCategoryTitle(currentCategory) || t("FormGallery:Categories"),
          }}
          isOpen={isOpen}
          scaled={true}
          onClick={onToggleDropdown}
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
          forsedHeight={`${height}px`}
        >
          <Scrollbar
            style={{ position: "absolute" }}
            scrollclass="section-scroll"
            ref={scrollRef}
          >
            <DropDownItem
              isHeader
              withHeaderArrow={!!openedMenuItem}
              headerArrowAction={onHeaderArrowClick}
              label={openedMenuItem?.label || t("Categories")}
            />

            {!openedMenuItem && [
              <Styled.CategoryFilterItemMobile
                key={"view-all"}
                className="dropdown-item"
                label={t("FormGallery:ViewAllTemplates")}
                onClick={onViewAllTemplates}
              />,
              <DropDownItem
                isSeparator
                key={"separator"}
                className={"huge-separator"}
              />,
            ]}

            {!openedMenuItem
              ? menuItems.map((item) => (
                  <Styled.CategoryFilterItemMobile
                    key={item.key}
                    className={`item-by-${item.key}`}
                    label={item.label}
                    onClick={() => onOpenMenuItem(item)}
                    isSubMenu
                  />
                ))
              : openedMenuItem.categories.map((category) => (
                  <Styled.CategoryFilterItemMobile
                    key={category.id}
                    label={getCategoryTitle(category)}
                    onClick={() => onFilterByCategory(category)}
                  />
                ))}
          </Scrollbar>
        </Styled.CategoryFilterMobile>
      </Styled.CategoryFilterMobileWrapper>
    </>
  );
};

export default inject(({ oformsStore }) => ({
  currentCategory: oformsStore.currentCategory,
  getTypeOfCategory: oformsStore.getTypeOfCategory,
  getCategoryTitle: oformsStore.getCategoryTitle,
  filterOformsByCategory: oformsStore.filterOformsByCategory,
  setOformsCurrentCategory: oformsStore.setOformsCurrentCategory,
}))(withTranslation(["FormGallery"])(observer(CategoryFilterMobile)));
