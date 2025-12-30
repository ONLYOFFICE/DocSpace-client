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

import React from "react";
import { inject } from "mobx-react";
import { withTranslation } from "react-i18next";
import { DropDown } from "@docspace/shared/components/drop-down";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import classNames from "classnames";
import styles from "./DesktopView.module.scss";
import type {
  SubListProps,
  Category,
  InjectedProps,
} from "../CategoryFilter.types";

const SubList: React.FC<SubListProps> = ({
  categoryType,
  categories,
  isDropdownOpen,
  isSubHovered,
  marginTop,
  onCloseDropdown,
  getCategoryTitle,
  filterOformsByCategory,
  setOformsCurrentCategory,
}) => {
  const onPreventDefault = (e: React.MouseEvent) => e.preventDefault();

  const onFilterByCategory = (category: Category) => {
    onCloseDropdown();
    setOformsCurrentCategory(category);
    filterOformsByCategory(categoryType, category.id);
  };

  return (
    <DropDown
      open={isDropdownOpen}
      className={classNames(
        `dropdown-sub sub-by-${categoryType}`,
        styles.categoryFilterSubList,
        {
          [styles.open]: isDropdownOpen,
          [styles.isSubHovered]: isSubHovered,
        },
      )}
      style={{ "--margin-top": marginTop } as React.CSSProperties}
      id={`category-sub-list-${categoryType}`}
      directionX="right"
      directionY="bottom"
      manualY="0px"
      manualX="0px"
      clickOutsideAction={() => {}}
      maxHeight={296}
      manualWidth="206px"
      showDisabledItems={false}
      isDefaultMode={false}
      withBackdrop={false}
      withBackground={false}
      isMobileView={false}
      isNoFixedHeightOptions={false}
    >
      {categories.map((category) => {
        const categoryTitle = getCategoryTitle(category);
        const onCategoryClick = () => onFilterByCategory(category);
        return (
          <DropDownItem
            className={classNames(
              "dropdown-item",
              styles.categoryFilterSubListItem,
            )}
            height={36}
            heightTablet={36}
            key={category.id}
            onClick={onCategoryClick}
            onMouseDown={onPreventDefault}
          >
            <div
              className="item-content"
              title={categoryTitle}
              style={{
                maxWidth: "182px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {categoryTitle}
            </div>
          </DropDownItem>
        );
      })}
    </DropDown>
  );
};

export default inject(({ oformsStore }: InjectedProps) => ({
  getCategoryTitle: oformsStore.getCategoryTitle,
  setOformsCurrentCategory: oformsStore.setOformsCurrentCategory,
  filterOformsByCategory: oformsStore.filterOformsByCategory,
}))(withTranslation(["FormGallery", "Common"])(SubList));
