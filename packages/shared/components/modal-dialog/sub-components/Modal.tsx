import React from "react";
import { isIOS, isMobileOnly } from "react-device-detect";

import { classNames } from "../../../utils";
import { DialogSkeleton, DialogAsideSkeleton } from "../../../skeletons";

import { Heading, HeadingSize } from "../../heading";
import { Scrollbar, ScrollbarType } from "../../scrollbar";

import {
  StyledModal,
  StyledHeader,
  Content,
  Dialog,
  StyledBody,
  StyledFooter,
} from "../ModalDialog.styled";
import { CloseButton } from "./CloseButton";
import { ModalBackdrop } from "./ModalBackdrop";
import { FormWrapper } from "./FormWrapper";
import { ModalSubComponentsProps } from "../ModalDialog.types";

const Modal = ({
  id,
  style,
  className,
  currentDisplayType,
  withBodyScroll,
  isScrollLocked,
  isLarge,
  zIndex,
  autoMaxHeight,
  autoMaxWidth,
  onClose,
  isLoading,
  header,
  body,
  footer,
  container,
  visible,
  withFooterBorder,
  modalSwipeOffset,
  containerVisible,
  isDoubleFooterLine,
  isCloseable,
  embedded,
  withForm,
}: ModalSubComponentsProps) => {
  const [windowHeight] = React.useState(window.innerHeight);

  const visualPageTop = React.useRef(0);
  const diffRef = React.useRef(0);
  const contentRef = React.useRef<null | HTMLDivElement>(null);

  const onResize = React.useCallback(
    (e: Event) => {
      if (!contentRef.current || !window.visualViewport) return;

      const target = e.target as VisualViewport;

      if (currentDisplayType === "modal") {
        const diff = windowHeight - target.height - target.pageTop;

        visualPageTop.current = target.pageTop;

        contentRef.current.style.bottom = `${diff}px`;

        return;
      }
      if (e?.type === "resize") {
        const diff = windowHeight - target.height - target.pageTop;

        visualPageTop.current = target.pageTop;

        contentRef.current.style.bottom = `${diff}px`;

        contentRef.current.style.height = `${
          target.height - 64 + target.pageTop
        }px`;

        contentRef.current.style.position = "fixed";

        diffRef.current = diff;
      } else if (e?.type === "scroll") {
        const diff = window.visualViewport.pageTop ? 0 : visualPageTop.current;

        contentRef.current.style.bottom = `${diffRef.current + diff}px`;

        contentRef.current.style.height = `${
          window.visualViewport.height - 64 + diff
        }px`;

        contentRef.current.style.position = "fixed";
      }
    },
    [currentDisplayType, windowHeight],
  );

  React.useEffect(() => {
    if (isMobileOnly && isIOS && window.visualViewport) {
      window.visualViewport.addEventListener("resize", onResize);
      window.visualViewport.addEventListener("scroll", onResize);
    }
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", onResize);
        window.visualViewport.removeEventListener("scroll", onResize);
      }
    };
  }, [onResize]);

  const headerComponent = React.isValidElement(header)
    ? header.props.children
    : null;
  const bodyComponent = React.isValidElement(body) ? body.props.children : null;
  const footerComponent = React.isValidElement(footer)
    ? footer.props.children
    : null;
  const containerComponent = React.isValidElement(container)
    ? container.props.children
    : null;

  const validateOnMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    if (target.id === "modal-onMouseDown-close") onClose?.();
  };

  const headerProps = React.isValidElement(header)
    ? (header?.props as { className?: string })
    : { className: "" };
  const bodyProps = React.isValidElement(body)
    ? (body?.props as { className?: string })
    : { className: "" };
  const footerProps = React.isValidElement(footer)
    ? (footer?.props as { className?: string })
    : { className: "" };

  return (
    <StyledModal
      id={id}
      className={visible ? "modal-active" : ""}
      modalSwipeOffset={modalSwipeOffset}
    >
      <ModalBackdrop
        className={visible ? "modal-backdrop-active backdrop-active" : ""}
        visible
        zIndex={zIndex}
        modalSwipeOffset={modalSwipeOffset}
      >
        <Dialog
          id="modal-onMouseDown-close"
          className={
            classNames([
              className,
              "modalOnCloseBacdrop",
              "not-selectable",
              "dialog",
            ]) || ""
          }
          style={style}
          onMouseDown={validateOnMouseDown}
        >
          <Content
            id="modal-dialog"
            visible={visible}
            isLarge={isLarge}
            currentDisplayType={currentDisplayType}
            autoMaxHeight={autoMaxHeight}
            autoMaxWidth={autoMaxWidth}
            modalSwipeOffset={modalSwipeOffset}
            embedded={embedded}
            ref={contentRef}
          >
            {isCloseable && (
              <CloseButton
                currentDisplayType={currentDisplayType}
                onClick={onClose}
              />
            )}
            {isLoading ? (
              currentDisplayType === "modal" ? (
                <DialogSkeleton
                  isLarge={isLarge}
                  withFooterBorder={withFooterBorder}
                />
              ) : (
                <DialogAsideSkeleton
                  withoutAside
                  isPanel={false}
                  withFooterBorder={withFooterBorder}
                />
              )
            ) : container &&
              containerVisible &&
              currentDisplayType !== "modal" ? (
              { containerComponent }
            ) : (
              <FormWrapper withForm={withForm || false}>
                {header && (
                  <StyledHeader
                    id="modal-header-swipe"
                    className={
                      classNames(["modal-header", headerProps.className]) ||
                      "modal-header"
                    }
                    {...headerProps}
                  >
                    <Heading
                      level={1}
                      className="heading"
                      size={HeadingSize.medium}
                      truncate
                    >
                      {headerComponent}
                    </Heading>
                  </StyledHeader>
                )}
                {body && (
                  <StyledBody
                    className={
                      classNames(["modal-body", bodyProps.className]) ||
                      "modal-body"
                    }
                    withBodyScroll={withBodyScroll}
                    isScrollLocked={isScrollLocked}
                    hasFooter={!!footer}
                    currentDisplayType={currentDisplayType}
                    {...bodyProps}
                    // embedded={embedded}
                  >
                    {currentDisplayType === "aside" && withBodyScroll ? (
                      <Scrollbar
                        stype={ScrollbarType.mediumBlack}
                        id="modal-scroll"
                        className="modal-scroll"
                      >
                        {bodyComponent}
                      </Scrollbar>
                    ) : (
                      bodyComponent
                    )}
                  </StyledBody>
                )}
                {footer && (
                  <StyledFooter
                    className={
                      classNames(["modal-footer", footerProps.className]) ||
                      "modal-footer"
                    }
                    withFooterBorder={withFooterBorder}
                    isDoubleFooterLine={isDoubleFooterLine}
                    {...footerProps}
                  >
                    {footerComponent}
                  </StyledFooter>
                )}
              </FormWrapper>
            )}
          </Content>
        </Dialog>
      </ModalBackdrop>
    </StyledModal>
  );
};

export { Modal };
