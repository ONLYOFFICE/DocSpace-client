import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { VariableSizeList } from "react-window";

import { Scrollbar, ScrollbarType } from "../../scrollbar";

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
}: VirtualListProps) {
  const ref = useRef<VariableSizeList>(null);

  const activeIndex = useMemo(() => {
    let foundIndex = -1;
    React.Children.forEach(cleanChildren, (child, index) => {
      const props = child && React.isValidElement(child) && child.props;
      if (props?.disabled) foundIndex = index;
    });
    return foundIndex;
  }, [cleanChildren]);

  const [currentIndex, setCurrentIndex] = useState(activeIndex);
  const currentIndexRef = useRef<number>(activeIndex);

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!ref.current || !isOpen) return;

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

      if (index < 0 || index >= React.Children.count(children)) return;

      setCurrentIndex(index);
      currentIndexRef.current = index;
      ref.current.scrollToItem(index, "smart");
    },
    [isOpen, children],
  );

  useEffect(() => {
    if (isOpen && maxHeight && enableKeyboardEvents) {
      window.addEventListener("keydown", onKeyDown);
    }

    const refVar = ref.current;

    return () => {
      window.removeEventListener("keydown", onKeyDown);

      if (itemCount > 0 && refVar) {
        setCurrentIndex(activeIndex);
        currentIndexRef.current = activeIndex;

        refVar.scrollToItem(activeIndex, "smart");
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
  ]);

  const handleMouseMove = useCallback((index: number) => {
    if (currentIndexRef.current === index) return;

    setCurrentIndex(index);
    currentIndexRef.current = index;
  }, []);

  if (!maxHeight) return cleanChildren || children;

  return isNoFixedHeightOptions ? (
    <Scrollbar style={{ height: maxHeight }} stype={ScrollbarType.mediumBlack}>
      {cleanChildren}
    </Scrollbar>
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
  );
}

export { VirtualList };
