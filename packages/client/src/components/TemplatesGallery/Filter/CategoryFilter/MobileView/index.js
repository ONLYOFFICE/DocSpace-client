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
import { DropDown } from "@docspace/shared/components/drop-down";
import { useState, useRef } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { Scrollbar } from "@docspace/shared/components/scrollbar";
import { ComboButton } from "@docspace/shared/components/combobox/sub-components/ComboButton";
import classNames from "classnames";
import styles from "./MobileView.module.scss";

const CategoryFilterMobile = ({
  t,

  menuItems,

  currentCategory,
  getCategoryTitle,
  filterOformsByCategory,
  setOformsCurrentCategory,
}) => {
  const scrollRef = useRef();

  const [isOpen, setIsOpen] = useState(false);
  const [openedMenuItem, setOpenedMenuItem] = useState(null);

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

  const calculatedHeight =
    48 +
    (!openedMenuItem
      ? 36 + 13 + menuItems.length * 36
      : openedMenuItem.categories.length * 36);

  if (calculatedHeight > maxCalculatedHeight) height = maxCalculatedHeight;
  else height = calculatedHeight;

  return (
    <div id="containerMobile" className={styles.categoryFilterMobileWrapper}>
      <ComboButton
        selectedOption={{
          label:
            getCategoryTitle(currentCategory) || t("FormGallery:Categories"),
        }}
        isOpen={isOpen}
        scaled
        onClick={onToggleDropdown}
        tabIndex={1}
      />

      <DropDown
        className={classNames(styles.categoryFilterMobile, "mainBtnDropdown")}
        style={{ "--forced-height": `${height}px` }}
        open={isOpen}
        withBackdrop
        withBackground
        usePortalBackdrop
        shouldShowBackdrop
        manualWidth="100%"
        directionY="top"
        manualY="0px"
        directionX="right"
        fixedDirection
        isDefaultMode={true}
        clickOutsideAction={onCloseDropdown}
      >
        <Scrollbar
          style={{ position: "absolute" }}
          scrollClass="section-scroll"
          ref={scrollRef}
        >
          <DropDownItem
            isHeader
            withHeaderArrow={!!openedMenuItem}
            headerArrowAction={onHeaderArrowClick}
            label={openedMenuItem?.label || t("Categories")}
            style={{ paddingLeft: "0" }}
          />

          {!openedMenuItem
            ? [
                <DropDownItem
                  key="view-all"
                  className={classNames(
                    "dropdown-item",
                    styles.categoryFilterItemMobile,
                  )}
                  label={t("FormGallery:ViewAllTemplates")}
                  onClick={onViewAllTemplates}
                  style={{ paddingLeft: "0" }}
                />,
                <DropDownItem
                  isSeparator
                  key="separator"
                  className={classNames("huge-separator", "isSeparator")}
                />,
              ]
            : null}

          {!openedMenuItem
            ? menuItems.map((item) => (
                <DropDownItem
                  key={item.key}
                  className={classNames(
                    `item-by-${item.key}`,
                    styles.categoryFilterItemMobile,
                  )}
                  label={item.label}
                  onClick={() => onOpenMenuItem(item)}
                  style={{ paddingLeft: "0" }}
                  isSubMenu
                />
              ))
            : openedMenuItem.categories.map((category) => (
                <DropDownItem
                  key={category.id}
                  className={styles.categoryFilterItemMobile}
                  label={getCategoryTitle(category)}
                  onClick={() => onFilterByCategory(category)}
                  style={{ paddingLeft: "0" }}
                />
              ))}
        </Scrollbar>
      </DropDown>
    </div>
  );
};

export default inject(({ oformsStore }) => ({
  currentCategory: oformsStore.currentCategory,
  getCategoryTitle: oformsStore.getCategoryTitle,
  filterOformsByCategory: oformsStore.filterOformsByCategory,
  setOformsCurrentCategory: oformsStore.setOformsCurrentCategory,
}))(withTranslation(["FormGallery"])(observer(CategoryFilterMobile)));
