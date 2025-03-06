import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { VariableSizeList } from "react-window";
import { Row } from "./Row";
import { VirtualListProps } from "./types";
import { Scrollbar } from "../scrollbar";

export const VirtualList = ({
  width,
  children,
  itemCount,
  maxHeight,
  cleanChildren,
  listHeight,
  getItemSize,
  enableKeyboardEvents,
}: VirtualListProps) => {
  const listRef = useRef<VariableSizeList>(null);

  const activeIndex = useMemo(() => {
    let foundIndex = 0;
    React.Children.forEach(cleanChildren, (child, index) => {
      if (React.isValidElement(child) && child.props?.disabled) {
        foundIndex = index;
      }
    });
    return foundIndex;
  }, [cleanChildren]);

  const [currentIndex, setCurrentIndex] = useState(activeIndex);
  const currentIndexRef = useRef<number>(activeIndex);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!listRef.current) return;

      let index = currentIndexRef.current;

      switch (event.code) {
        case "ArrowDown":
          event.preventDefault();
          index += 1;
          break;
        case "ArrowUp":
          event.preventDefault();
          index -= 1;
          break;
        case "Enter":
          event.preventDefault();
          return (
            Array.isArray(children) &&
            React.isValidElement(children?.[index]) &&
            children?.[index]?.props?.onClick()
          );
        default:
          return;
      }

      if (index > itemCount - 1) {
        index = itemCount - 1;
      }

      if (index < 0) {
        index = 0;
      }

      setCurrentIndex(index);
      currentIndexRef.current = index;
      listRef.current.scrollToItem(index, "smart");
    },
    [children, itemCount]
  );

  const handleMouseMove = useCallback((index: number) => {
    if (currentIndexRef.current === index) return;
    setCurrentIndex(index);
    currentIndexRef.current = index;
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    const list = listRef.current;

    return () => {
      window.removeEventListener("keydown", handleKeyDown);

      if (itemCount > 0 && list) {
        setCurrentIndex(activeIndex);
        currentIndexRef.current = activeIndex;
        list.scrollToItem(activeIndex, "smart");
      }
    };
  }, [activeIndex, maxHeight, enableKeyboardEvents, itemCount, handleKeyDown]);

  return (
    <VariableSizeList
      ref={listRef}
      width={width}
      itemCount={itemCount}
      itemSize={getItemSize}
      height={listHeight}
      itemData={{
        children: cleanChildren,
        activeIndex,
        isActive: currentIndex,
        handleMouseMove,
      }}
      outerElementType={Scrollbar}
    >
      {Row}
    </VariableSizeList>
  );
};
