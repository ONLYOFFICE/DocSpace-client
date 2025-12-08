// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import { useState } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import * as Styled from "./index.styled";
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
  const [hoveredSub, setHoveredSub] = useState(null);

  const onOpenDropdown = () => setIsOpen(true);
  const onCloseDropdown = () => {
    setIsOpen(false);
    setHoveredSub(null);
  };

  const onBackdropClick = (e) => {
    if (
      e?.target?.className !== "item-content" &&
      e?.target?.className !== "dropdown-item"
    )
      onCloseDropdown();
  };

  const onViewAllTemplates = () => filterOformsByCategory("", "");

  return (
    <Styled.CategoryFilterWrapper {...rest}>
      <Styled.CategoryFilter
        id="comboBoxLanguage"
        tabIndex={1}
        className="combobox"
        opened={isOpen}
        onToggle={onOpenDropdown}
        onBackdropClick={onBackdropClick}
        onSelect={onCloseDropdown}
        isDisabled={false}
        showDisabledItems
        options={[]}
        scaledOptions
        directionX="right"
        directionY="both"
        scaled
        size="content"
        withoutBackground
        withBackdrop
        disableIconClick={false}
        disableItemClick={false}
        isDefaultMode={false}
        fixedDirection
        disableItemClickFirstLevel
        advancedOptionsCount={5}
        dataTestId="form_gallery_category_combobox"
        selectedOption={{
          label:
            getCategoryTitle(currentCategory) || t("FormGallery:Categories"),
        }}
        advancedOptions={
          <>
            <Styled.CategoryFilterItem
              id="ViewAllTemplates"
              key="ViewAllTemplates"
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
                testId={`category_filter_${item.key}`}
                title={item.label}
                className={`item-by-${item.key} item-by-first-level`}
                label={item.label}
                onMouseEnter={() => setHoveredSub(item.key)}
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
