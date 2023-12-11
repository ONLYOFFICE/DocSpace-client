import React, { useEffect, useState, useCallback } from "react";
import { isSafari, isTablet } from "react-device-detect";
import throttle from "lodash/throttle";

import { Portal } from "../portal";
import { Modal } from "./sub-components/Modal";

import {
  handleTouchMove,
  handleTouchStart,
  parseChildren,
  getCurrentDisplayType,
} from "./ModalDialog.utils";
import {
  MODAL_DIALOG_BODY_NAME,
  MODAL_DIALOG_CONTAINER_NAME,
  MODAL_DIALOG_FOOTER_NAME,
  MODAL_DIALOG_HEADER_NAME,
} from "./ModalDialog.constants";
import { ModalDialogProps } from "./ModalDialog.types";

const Header = () => null;
Header.displayName = MODAL_DIALOG_HEADER_NAME;

const Body = () => null;
Body.displayName = MODAL_DIALOG_BODY_NAME;

const Footer = () => null;
Footer.displayName = MODAL_DIALOG_FOOTER_NAME;

const Container = () => null;
Container.displayName = MODAL_DIALOG_CONTAINER_NAME;

const ModalDialog = ({
  id,
  style,
  children,
  visible,
  onClose,
  isLarge,
  zIndex,
  className,
  displayType,
  displayTypeDetailed,
  isLoading,
  autoMaxHeight,
  autoMaxWidth,
  withBodyScroll,
  withFooterBorder,
  isScrollLocked,
  containerVisible,
  isDoubleFooterLine,
  isCloseable,
  embedded,
  withForm,
}: ModalDialogProps) => {
  const onCloseEvent = () => {
    if (embedded) return;
    if (isCloseable) onClose?.();
  };
  const [currentDisplayType, setCurrentDisplayType] = useState(
    getCurrentDisplayType(displayType, displayTypeDetailed),
  );
  const [modalSwipeOffset, setModalSwipeOffset] = useState(0);

  const returnWindowPositionAfterKeyboard = () => {
    isSafari && isTablet && window.scrollY !== 0 && window.scrollTo(0, 0);
  };

  useEffect(() => {
    const onResize = throttle(() => {
      setCurrentDisplayType(
        getCurrentDisplayType(displayType, displayTypeDetailed),
      );
    }, 300);

    const onSwipe = (e: TouchEvent) =>
      setModalSwipeOffset(handleTouchMove(e, onClose));

    const onSwipeEnd = () => setModalSwipeOffset(0);

    const onKeyPress = (e: KeyboardEvent) => {
      if ((e.key === "Esc" || e.key === "Escape") && visible) onCloseEvent();
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("keyup", onKeyPress);
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", onSwipe);
    window.addEventListener("touchend", onSwipeEnd);
    return () => {
      returnWindowPositionAfterKeyboard();

      window.removeEventListener("resize", onResize);
      window.removeEventListener("keyup", onKeyPress);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", onSwipe);
      window.addEventListener("touchend", onSwipeEnd);
    };
  }, []);

  const [header, body, footer, container] = parseChildren(
    children,
    Header.displayName,
    Body.displayName,
    Footer.displayName,
    Container.displayName,
  );

  return (
    <Portal
      element={
        <Modal
          withForm={withForm}
          isDoubleFooterLine={isDoubleFooterLine}
          id={id}
          style={style}
          className={className}
          currentDisplayType={currentDisplayType}
          withBodyScroll={withBodyScroll}
          isScrollLocked={isScrollLocked}
          isLarge={isLarge}
          zIndex={zIndex}
          autoMaxHeight={autoMaxHeight}
          autoMaxWidth={autoMaxWidth}
          withFooterBorder={withFooterBorder}
          onClose={onCloseEvent}
          isLoading={isLoading}
          header={header}
          body={body}
          footer={footer}
          container={container}
          visible={visible}
          modalSwipeOffset={modalSwipeOffset}
          containerVisible={containerVisible}
          isCloseable={isCloseable && !embedded}
          embedded={embedded}
        />
      }
    />
  );
};

ModalDialog.defaultProps = {
  zIndex: 310,
  isLarge: false,
  isLoading: false,
  isCloseable: true,
  withBodyScroll: false,
  withFooterBorder: false,
  containerVisible: false,
};

ModalDialog.Header = Header;
ModalDialog.Body = Body;
ModalDialog.Footer = Footer;
ModalDialog.Container = Container;

export { ModalDialog };
