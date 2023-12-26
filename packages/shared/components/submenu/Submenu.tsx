import React, { useEffect, useRef, useState, useCallback } from "react";
import { useTheme } from "styled-components";
import { countAutoFocus, countAutoOffset } from "./Submenu.utils";
import {
  StyledSubmenu,
  StyledSubmenuBottomLine,
  StyledSubmenuContentWrapper,
  //   StyledSubmenuItem,
  StyledSubmenuItems,
  StyledSubmenuItemText,
  SubmenuScroller,
  SubmenuRoot,
  SubmenuScrollbarSize,
  StyledItemLabelTheme,
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
                  <StyledSubmenuItemText
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
                  </StyledSubmenuItemText>
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
