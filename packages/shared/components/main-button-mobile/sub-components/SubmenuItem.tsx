import React, { useLayoutEffect, useEffect, useState } from "react";

import { StyledDropDownItem } from "../MainButtonMobile.styled";
import { ActionOption, SubmenuItemProps } from "../MainButtonMobile.types";

const SubmenuItem = ({
  option,
  toggle,
  noHover,
  recalculateHeight,
  openedSubmenuKey,
  setOpenedSubmenuKey,
}: SubmenuItemProps) => {
  const [isOpenSubMenu, setIsOpenSubMenu] = useState(false);

  useLayoutEffect(() => {
    recalculateHeight();
  }, [isOpenSubMenu, recalculateHeight]);

  useEffect(() => {
    if (openedSubmenuKey === option.key) return;

    setIsOpenSubMenu(false);
  }, [openedSubmenuKey, option.key]);

  const onClick = () => {
    setOpenedSubmenuKey(option.key);
    setIsOpenSubMenu((v) => !v);
  };

  return (
    <div key={`mobile-submenu-${option.key}`}>
      <StyledDropDownItem
        id={option.id}
        key={option.key}
        label={option.label}
        className={`${option.className} ${
          option.isSeparator && "is-separator"
        }`}
        onClick={onClick}
        icon={option.icon ? option.icon : ""}
        isActive={isOpenSubMenu}
        isSubMenu
        noHover={noHover}
      />
      {isOpenSubMenu &&
        option.items?.map((item: ActionOption) => {
          const subMenuOnClickAction = () => {
            toggle(false);
            setIsOpenSubMenu(false);
            item.onClick?.({ action: item.action });
          };

          return (
            <StyledDropDownItem
              id={item.id}
              key={item.key}
              label={item.label}
              className={`${item.className} sublevel`}
              onClick={subMenuOnClickAction}
              icon={item.icon ? item.icon : ""}
              withoutIcon={item.withoutIcon}
              noHover={noHover}
            />
          );
        })}
    </div>
  );
};

export default SubmenuItem;
