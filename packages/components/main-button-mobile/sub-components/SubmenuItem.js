import React, { useLayoutEffect, useEffect, useState } from "react";

import { StyledDropDownItem } from "../styled-main-button";

const SubmenuItem = ({
  option,
  toggle,

  noHover,
  recalculateHeight,

  openedSubmenuKey,
  setOpenedSubmenuKey,
}) => {
  const [isOpenSubMenu, setIsOpenSubMenu] = useState(false);

  useLayoutEffect(() => {
    recalculateHeight();
  }, [isOpenSubMenu]);

  useEffect(() => {
    if (openedSubmenuKey === option.key) return;

    setIsOpenSubMenu(false);
  }, [openedSubmenuKey, option.key]);

  const onClick = () => {
    setOpenedSubmenuKey(option.key);
    setIsOpenSubMenu((isOpenSubMenu) => !isOpenSubMenu);
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
        action={option.action}
        isActive={isOpenSubMenu}
        isSubMenu={true}
        noHover={noHover}
      />
      {isOpenSubMenu &&
        option.items.map((item) => {
          const subMenuOnClickAction = () => {
            toggle(false);
            setIsOpenSubMenu(false);
            item.onClick && item.onClick({ action: item.action });
          };

          return (
            <StyledDropDownItem
              id={item.id}
              key={item.key}
              label={item.label}
              className={`${item.className} sublevel`}
              onClick={subMenuOnClickAction}
              icon={item.icon ? item.icon : ""}
              action={item.action}
              withoutIcon={item.withoutIcon}
              noHover={noHover}
            />
          );
        })}
    </div>
  );
};

export default SubmenuItem;
