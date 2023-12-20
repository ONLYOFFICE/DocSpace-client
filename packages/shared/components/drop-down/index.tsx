import React from "react";
import { isMobile } from "react-device-detect";

import { Backdrop } from "../backdrop";

import { DropDownProps } from "./DropDown.types";
import { EnhancedComponent } from "./DropDown";

const DropDown = (props: DropDownProps) => {
  const {
    clickOutsideAction,
    open,
    withBackdrop = true,

    withBlur = false,

    isAside,
    withBackground,
    eventTypes,
    forceCloseClickOutside,
    withoutBackground,
  } = props;

  const toggleDropDown = () => {
    clickOutsideAction?.({} as Event, !open);
  };

  const eventTypesProp = forceCloseClickOutside
    ? {}
    : isMobile
      ? { eventTypes: ["click, touchend"] }
      : eventTypes
        ? { eventTypes }
        : {};

  return (
    <>
      {withBackdrop ? (
        <Backdrop
          visible={open}
          zIndex={199}
          onClick={toggleDropDown}
          withoutBlur={!withBlur}
          isAside={isAside}
          withBackground={withBackground}
          withoutBackground={withoutBackground}
        />
      ) : null}
      <EnhancedComponent {...eventTypesProp} {...props} />
    </>
  );
};

DropDown.defaultProps = {
  withBackdrop: true,
  showDisabledItems: false,
  isDefaultMode: true,
  fixedDirection: false,
  offsetLeft: 0,
  enableKeyboardEvents: true,
};

export { DropDown };
