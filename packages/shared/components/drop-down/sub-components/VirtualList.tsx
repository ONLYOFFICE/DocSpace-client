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

const VirtualList = ({
  Row,
  width,
  isOpen,
  children,
  itemCount,
  maxHeight,
  cleanChildren,
  calculatedHeight,
  isNoFixedHeightOptions,
  getItemSize,
  enableKeyboardEvents,
}: VirtualListProps) => {
  const listRef = useRef<VariableSizeList>(null);

  const activeIndex = useMemo(() => {
    let foundIndex = -1;
    React.Children.forEach(cleanChildren, (child, index) => {
      if (
        React.isValidElement(child) &&
        (child.props as { disabled?: boolean })?.disabled
      ) {
        foundIndex = index;
      }
    });
    return foundIndex;
  }, [cleanChildren]);

  const [currentIndex, setCurrentIndex] = useState(activeIndex);
  const currentIndexRef = useRef<number>(activeIndex);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!listRef.current || !isOpen) return;

      event.preventDefault();

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
            children?.[index]?.props?.onClick()
          );
        default:
          return;
      }

      setCurrentIndex(index);
      currentIndexRef.current = index;
      listRef.current.scrollToItem(index, "smart");
    },
    [isOpen, children],
  );

  const handleMouseMove = useCallback((index: number) => {
    if (currentIndexRef.current === index) return;
    setCurrentIndex(index);
    currentIndexRef.current = index;
  }, []);

  useEffect(() => {
    if (isOpen && maxHeight && enableKeyboardEvents) {
      window.addEventListener("keydown", handleKeyDown);
    }

    const list = listRef.current;

    return () => {
      window.removeEventListener("keydown", handleKeyDown);

      if (itemCount > 0 && list) {
        setCurrentIndex(activeIndex);
        currentIndexRef.current = activeIndex;
        list.scrollToItem(activeIndex, "smart");
      }
    };
  }, [
    isOpen,
    activeIndex,
    maxHeight,
    enableKeyboardEvents,
    itemCount,
    handleKeyDown,
  ]);

  if (!maxHeight) return cleanChildren || children;

  return isNoFixedHeightOptions ? (
    <Scrollbar style={{ height: maxHeight }}>{cleanChildren}</Scrollbar>
  ) : (
    <VariableSizeList
      ref={listRef}
      width={width}
      itemCount={itemCount}
      itemSize={getItemSize}
      height={calculatedHeight}
      itemData={{
        children: cleanChildren,
        activeIndex,
        activedescendant: currentIndex,
        handleMouseMove,
      }}
      outerElementType={Scrollbar}
    >
      {Row}
    </VariableSizeList>
  );
};

VirtualList.displayName = "VirtualList";

export { VirtualList };
