import React, { useEffect, useRef, useState } from "react";
// import equal from "fast-deep-equal/react";
import { isMobileOnly } from "react-device-detect";
import { ReactSVG } from "react-svg";

import ExpanderDownReactSvgUrl from "PUBLIC_DIR/images/expander-down.react.svg?url";

import { classNames } from "../../utils";

import { DropDown } from "../drop-down";
import { DropDownItem } from "../drop-down-item";
import { Scrollbar } from "../scrollbar";

import {
  StyledSpan,
  StyledText,
  StyledTextWithExpander,
  StyledLinkWithDropdown,
  // Caret,
} from "./LinkWithDropdown.styled";
import { LinkWithDropDownProps } from "./LinkWithDropdown.types";

const LinkWithDropdown = ({
  isSemitransparent = false,
  dropdownType = "alwaysDashed",
  isTextOverflow = false,
  fontSize = "13px",
  fontWeight,
  color,
  isBold = false,
  title,
  className = "",
  data,
  id,
  style,
  isDisabled = false,
  directionY,
  hasScroll = false,
  withExpander = false,
  dropDownClassName,
  isOpen = false,
  children,
  ...rest
}: LinkWithDropDownProps) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const [state, setState] = useState({
    isOpen,
    orientation: window.orientation,
  });

  const setIsOpen = (value: boolean) =>
    setState((s) => ({ ...s, isOpen: value }));

  const onSetOrientation = () => {
    setState((s) => ({ ...s, orientation: window.orientation }));
  };

  const onOpen = () => {
    if (isDisabled) return;
    setIsOpen(!state.isOpen);
  };

  const onCheckManualWidth = () => {
    const padding = 32;
    if (ref.current) {
      const width = ref.current.querySelector(".text")?.getBoundingClientRect()
        .width;
      if (width) return `${width + padding}px`;
    }
  };

  const onClose = (e: Event) => {
    const target = e.target as HTMLDivElement;
    if (ref.current && ref.current.contains(target)) return;

    setIsOpen(!state.isOpen);
  };

  const onClickDropDownItem = (
    e:
      | React.MouseEvent<Element, MouseEvent>
      | React.ChangeEvent<HTMLInputElement>,
  ) => {
    const currentTarget = e.currentTarget as HTMLElement;
    const { key } = currentTarget.dataset;
    const item = data?.find((x) => x.key === key);
    setIsOpen(!state.isOpen);
    if (item && "onClick" in item) item.onClick?.(e);
  };

  useEffect(() => {
    window.addEventListener("orientationchange", onSetOrientation);

    return () => {
      window.removeEventListener("orientationchange", onSetOrientation);
    };
  }, []);

  useEffect(() => {
    setIsOpen(isOpen);
  }, [dropdownType, isOpen]);

  const showScroll = hasScroll && isMobileOnly;
  const scrollHeight = state.orientation === 90 ? 100 : 250;

  const dropDownItem = data?.map((item) => (
    <DropDownItem
      {...item}
      className="drop-down-item"
      id={`${item.key}`}
      key={item.key}
      onClick={onClickDropDownItem}
      data-key={item.key}
      textOverflow={isTextOverflow}
    />
  ));

  const styledText = (
    <StyledText
      className="text"
      isTextOverflow={isTextOverflow}
      truncate={isTextOverflow}
      fontSize={fontSize}
      fontWeight={fontWeight}
      color={color}
      isBold={isBold}
      title={title}
      // dropdownType={dropdownType}
      // isDisabled={isDisabled}
      // withTriangle
    >
      {children}
    </StyledText>
  );

  return (
    <StyledSpan
      $isOpen={state.isOpen}
      className={className}
      id={id}
      style={style}
      ref={ref}
    >
      <span onClick={onOpen}>
        <StyledLinkWithDropdown
          isSemitransparent={isSemitransparent}
          dropdownType={dropdownType}
          color={color}
          isDisabled={isDisabled}
        >
          {withExpander ? (
            <StyledTextWithExpander isOpen={state.isOpen}>
              {styledText}
              <ReactSVG className="expander" src={ExpanderDownReactSvgUrl} />
            </StyledTextWithExpander>
          ) : (
            styledText
          )}
        </StyledLinkWithDropdown>
      </span>
      <DropDown
        className={classNames("fixed-max-width", dropDownClassName || "") || ""}
        manualWidth={showScroll ? onCheckManualWidth() : undefined}
        open={state.isOpen}
        // withArrow={false}
        forwardedRef={ref}
        directionY={directionY}
        // isDropdown={false}
        clickOutsideAction={onClose}
        {...rest}
      >
        {showScroll ? (
          <Scrollbar
            className="scroll-drop-down-item"
            style={{
              height: scrollHeight,
            }}
          >
            {dropDownItem}
          </Scrollbar>
        ) : (
          dropDownItem
        )}
      </DropDown>
    </StyledSpan>
  );
};

export { LinkWithDropdown };
