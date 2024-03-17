// (c) Copyright Ascensio System SIA 2010-2024
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

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useTheme } from "styled-components";
import { countAutoFocus, countAutoOffset } from "./Submenu.utils";
import {
  StyledSubmenu,
  StyledSubmenuBottomLine,
  StyledSubmenuContentWrapper,
  StyledSubmenuItems,
  StyledSubmenuItemText,
  SubmenuScroller,
  SubmenuRoot,
  SubmenuScrollbarSize,
  StyledItemLabelTheme,
  StyledSubmenuItem,
} from "./Submenu.styled";

import { ColorTheme, ThemeId } from "../color-theme";
import { SubmenuProps, TSubmenuItem } from "./Submenu.types";

const Submenu = (props: SubmenuProps) => {
  const {
    data,
    startSelect = 0,
    forsedActiveItemId,
    onSelect,
    topProps,
    ...rest
  } = props;
  const submenuItemsRef = useRef<HTMLDivElement | null>(null);

  const [currentItem, setCurrentItem] = useState<null | TSubmenuItem>(null);

  const theme = useTheme();

  useEffect(() => {
    if (typeof startSelect === "number")
      return setCurrentItem(data[startSelect]);

    setCurrentItem(startSelect);
  }, [data, startSelect]);

  // if (!data) return null;

  const onCheckCurrentItem = useCallback(() => {
    const isSelect = data.find((item: TSubmenuItem) =>
      window.location.pathname.endsWith(item.id),
    );

    if (isSelect) setCurrentItem(isSelect);
  }, [data, setCurrentItem]);

  useEffect(() => {
    window.addEventListener("popstate", onCheckCurrentItem);
    onCheckCurrentItem();

    return () => {
      window.removeEventListener("popstate", onCheckCurrentItem);
    };
  }, [onCheckCurrentItem]);

  const selectSubmenuItem = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!forsedActiveItemId) {
      const item = data.find((el) => el.id === e.currentTarget.id);
      if (!item) return;
      setCurrentItem(item);
      const offset = countAutoFocus(item.name, data, submenuItemsRef.current);
      if (submenuItemsRef.current && offset)
        submenuItemsRef.current.scrollLeft += offset;
      onSelect?.(item);
    }
  };

  useEffect(() => {
    if (!submenuItemsRef.current) return;
    let isDown = false;
    let startX: number;
    let scrollLeft: number;

    const mouseDown = (e: MouseEvent) => {
      e.preventDefault();
      isDown = true;
      if (submenuItemsRef.current) {
        startX = e.pageX - submenuItemsRef.current.offsetLeft;
        scrollLeft = submenuItemsRef.current.scrollLeft;
      }
    };

    const mouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      if (submenuItemsRef.current) {
        const x = e.pageX - submenuItemsRef.current.offsetLeft;
        const walk = x - startX;
        submenuItemsRef.current.scrollLeft = scrollLeft - walk;
      }
    };

    const mouseUp = () => {
      const offset = countAutoOffset(data, submenuItemsRef.current);
      if (submenuItemsRef.current && offset)
        submenuItemsRef.current.scrollLeft += offset;
      isDown = false;
    };

    const mouseLeave = () => (isDown = false);

    const ref = submenuItemsRef.current;

    ref.addEventListener("mousedown", mouseDown);
    ref.addEventListener("mousemove", mouseMove);
    ref.addEventListener("mouseup", mouseUp);
    ref.addEventListener("mouseleave", mouseLeave);

    return () => {
      ref?.removeEventListener("mousedown", mouseDown);
      ref?.removeEventListener("mousemove", mouseMove);
      ref?.removeEventListener("mouseup", mouseUp);
      ref?.removeEventListener("mouseleave", mouseLeave);
    };
  }, [data, submenuItemsRef]);

  return (
    <StyledSubmenu {...rest} topProps={topProps}>
      <div className="sticky">
        <SubmenuRoot>
          <SubmenuScrollbarSize />
          <SubmenuScroller>
            <StyledSubmenuItems ref={submenuItemsRef} role="list">
              {data.map((d) => {
                const isActive =
                  d.id === (forsedActiveItemId || currentItem?.id);

                return (
                  <StyledSubmenuItem
                    key={d.id}
                    id={d.id}
                    onClick={(e) => {
                      d.onClick?.();
                      selectSubmenuItem(e);
                    }}
                  >
                    <StyledSubmenuItemText isActive={isActive}>
                      <ColorTheme
                        {...props}
                        as="div"
                        themeId={ThemeId.SubmenuText}
                        className="item-text"
                        fontSize="13px"
                        fontWeight="600"
                        truncate={false}
                        isActive={isActive}
                      >
                        {d.name}
                      </ColorTheme>
                    </StyledSubmenuItemText>
                    <StyledItemLabelTheme
                      isActive={isActive}
                      $currentColorScheme={theme.currentColorScheme}
                    />
                  </StyledSubmenuItem>
                );
              })}
            </StyledSubmenuItems>
          </SubmenuScroller>
        </SubmenuRoot>
        <StyledSubmenuBottomLine className="bottom-line" />
      </div>
      <div className="sticky-indent" />

      <StyledSubmenuContentWrapper>
        {currentItem?.content}
      </StyledSubmenuContentWrapper>
    </StyledSubmenu>
  );
};

export { Submenu };
