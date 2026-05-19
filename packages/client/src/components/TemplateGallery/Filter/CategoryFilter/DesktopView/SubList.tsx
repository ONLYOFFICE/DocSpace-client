/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import { inject } from "mobx-react";
import { withTranslation } from "react-i18next";
import { DropDown } from "@docspace/ui-kit/components/drop-down";
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
