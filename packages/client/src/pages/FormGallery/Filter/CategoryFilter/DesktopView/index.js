import * as Styled from "./index.styled";

import DropDownItem from "@docspace/components/drop-down-item";
import { useState } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import SubList from "./SubList";

const CategoryFilterDesktop = ({
  t,

  menuItems,

  currentCategory,
  getCategoryTitle,
  filterOformsByCategory,

  ...rest
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const onToggleDropdownIsOpen = () => setIsOpen(!isOpen);
  const onCloseDropdown = () => setIsOpen(false);

  const [hoveredSub, setHoveredSub] = useState(null);

  const onViewAllTemplates = () => filterOformsByCategory("", "");

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
          label:
            getCategoryTitle(currentCategory) || t("FormGallery:Categories"),
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
              onMouseEnter={() => setHoveredSub(null)}
            />
            <DropDownItem isSeparator />
            {menuItems?.map((item) => (
              <Styled.CategoryFilterItem
                id={item.key}
                key={item.key}
                title={item.label}
                className={`item-by-${item.key}`}
                label={item.label}
                onMouseEnter={() => setHoveredSub(item.key)}
                onMouseLeave={() => setHoveredSub(null)}
                isSubMenu
              />
            ))}
          </>
        }
      />

      {menuItems?.map((item, index) => (
        <SubList
          key={item.key}
          categoryType={item.key}
          categories={item.categories || []}
          isDropdownOpen={isOpen}
          isSubHovered={hoveredSub === item.key}
          marginTop={`${83 + index * 32}px`}
          onCloseDropdown={onCloseDropdown}
        />
      ))}
    </Styled.CategoryFilterWrapper>
  );
};
export default inject(({ oformsStore }) => ({
  currentCategory: oformsStore.currentCategory,
  getCategoryTitle: oformsStore.getCategoryTitle,
  filterOformsByCategory: oformsStore.filterOformsByCategory,
}))(withTranslation(["FormGallery"])(observer(CategoryFilterDesktop)));
