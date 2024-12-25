// (c) Copyright Ascensio System SIA 2009-2024
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

import React, { useEffect, useLayoutEffect, useState } from "react";
import { DropDownItem } from "../../drop-down-item";
import { ActionOption, SubmenuItemProps } from "../MainButtonMobile.types";
import styles from "../MainButtonMobile.module.scss";
import { classNames } from "../../../utils";

const SubmenuItem = ({
  option,
  toggle,
  noHover,
  recalculateHeight,
  openedSubmenuKey,
  setOpenedSubmenuKey,
  openByDefault,
}: SubmenuItemProps) => {
  const [isOpenSubMenu, setIsOpenSubMenu] = useState(false);

  useLayoutEffect(() => {
    recalculateHeight();
  }, [isOpenSubMenu, recalculateHeight]);

  useEffect(() => {
    if (openedSubmenuKey === option.key) return;
    setIsOpenSubMenu(false);
  }, [openedSubmenuKey, option.key]);

  useEffect(() => {
    if (openByDefault) {
      setOpenedSubmenuKey(option.key);
      setIsOpenSubMenu(true);
    }
  }, []);

  const onClick = () => {
    setOpenedSubmenuKey(option.key);
    setIsOpenSubMenu((v) => !v);
  };

  return (
    <div key={`mobile-submenu-${option.key}`}>
      <DropDownItem
        id={option.id}
        key={option.key}
        label={option.label}
        className={classNames(styles.dropDownItem, option.className, {
          "is-separator": option.isSeparator,
          "main-button_drop-down": !option.isSeparator,
        })}
        onClick={onClick}
        icon={option.icon}
        isActive={isOpenSubMenu}
        isSubMenu
        noHover={noHover}
      />
      {isOpenSubMenu &&
        option.items?.map((suboption: ActionOption) => {
          const subMenuOnClickAction = () => {
            toggle(false);
            setIsOpenSubMenu(false);
            suboption.onClick?.({ action: suboption.action });
          };

          return (
            <DropDownItem
              id={suboption.id}
              key={suboption.key}
              label={suboption.label}
              className={classNames(
                styles.dropDownItem,
                styles.sublevel,
                suboption.className,
                "main-button_drop-down",
              )}
              onClick={subMenuOnClickAction}
              icon={suboption.icon}
              withoutIcon={suboption.withoutIcon}
              noHover={noHover}
            />
          );
        })}
    </div>
  );
};

export default SubmenuItem;
