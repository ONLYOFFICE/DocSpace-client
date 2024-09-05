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

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { VariableSizeList } from "react-window";

import { Scrollbar } from "../../scrollbar";

import { VirtualListProps } from "../DropDown.types";

function VirtualList({
  Row,
  width,
  theme,
  isOpen,
  children,
  itemCount,
  maxHeight,
  cleanChildren,
  calculatedHeight,
  isNoFixedHeightOptions,
  getItemSize,
  enableKeyboardEvents,
  isDropdownReady,
}: VirtualListProps) {
  const ref = useRef<VariableSizeList>(null);
  const focusTrapRef = useRef<HTMLDivElement>(null);

  const activeIndex = useMemo(() => {
    let foundIndex = -1;
    React.Children.forEach(cleanChildren, (child, index) => {
      const props = child && React.isValidElement(child) && child.props;
      if (props?.isSelected) foundIndex = index;
    });
    return foundIndex;
  }, [cleanChildren]);

  const [currentIndex, setCurrentIndex] = useState(activeIndex);
  const currentIndexRef = useRef<number>(activeIndex);

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!focusTrapRef.current || !isOpen) return;

      event.preventDefault();
      event.stopPropagation();

      let index = currentIndexRef.current;

      switch (event.code) {
        case "ArrowDown":
          index += 1;
          break;
        case "ArrowUp":
          index -= 1;
          break;
        case "Enter":
          return (
            children &&
            Array.isArray(children) &&
            children[index] &&
            React.isValidElement(children?.[index]) &&
            children?.[index]?.props?.onClick?.()
          );
        default:
          return;
      }

      if (index < 0 || index >= React.Children.count(children)) return;

      setCurrentIndex(index);
      currentIndexRef.current = index;
      // ref.current.scrollToItem(index, "smart");
    },
    [isOpen, children],
  );

  useEffect(() => {
    if (isOpen && isDropdownReady && enableKeyboardEvents) {
      focusTrapRef.current?.focus();
      focusTrapRef.current?.addEventListener("keydown", onKeyDown);
    }

    const refVar = ref.current;

    return () => {
      focusTrapRef.current?.removeEventListener("keydown", onKeyDown);

      if (itemCount > 0 && refVar) {
        setCurrentIndex(activeIndex);
        currentIndexRef.current = activeIndex;

        // refVar.scrollToItem(activeIndex, "smart");
      }
    };
  }, [
    isOpen,
    activeIndex,
    maxHeight,
    enableKeyboardEvents,
    children,
    onKeyDown,
    itemCount,
    isDropdownReady,
  ]);

  useEffect(() => {
    setCurrentIndex(activeIndex);
    currentIndexRef.current = activeIndex;
  }, [activeIndex]);

  const handleMouseMove = useCallback((index: number) => {
    if (currentIndexRef.current === index) return;

    setCurrentIndex(index);
    currentIndexRef.current = index;
  }, []);

  const items = cleanChildren || children;

  if (!maxHeight)
    return (
      <div
        className="focus-trap"
        style={{ outline: "none" }}
        ref={focusTrapRef}
        tabIndex={0}
      >
        {items?.map((item, index) => (
          <Row
            key={index}
            data={{
              children: cleanChildren,
              theme,
              activeIndex,
              activedescendant: currentIndex,
              handleMouseMove,
            }}
            index={index}
            style={{}}
          />
        ))}
      </div>
    );

  return (
    <div
      className="focus-trap"
      style={{ outline: "none" }}
      ref={focusTrapRef}
      tabIndex={0}
    >
      {isNoFixedHeightOptions ? (
        <Scrollbar style={{ height: maxHeight }}>{cleanChildren}</Scrollbar>
      ) : (
        <VariableSizeList
          ref={ref}
          width={width}
          itemCount={itemCount}
          itemSize={getItemSize}
          height={calculatedHeight}
          itemData={{
            children: cleanChildren,
            theme,
            activeIndex,
            activedescendant: currentIndex,
            handleMouseMove,
          }}
          outerElementType={Scrollbar}
        >
          {Row}
        </VariableSizeList>
      )}
    </div>
  );
}

export { VirtualList };
