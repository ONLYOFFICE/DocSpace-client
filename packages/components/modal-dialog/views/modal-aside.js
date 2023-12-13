import React from "react";
import PropTypes from "prop-types";

import DialogSkeleton from "../../skeletons/dialog";
import DialogAsideSkeleton from "../../skeletons/dialog/aside";

import Heading from "../../heading";
import {
  StyledModal,
  StyledHeader,
  Content,
  Dialog,
  StyledBody,
  StyledFooter,
} from "../styled-modal-dialog";
import CloseButton from "../components/CloseButton";
import ModalBackdrop from "../components/ModalBackdrop";
import Scrollbar from "../../scrollbar";
import { classNames } from "../../utils/classNames";
import FormWrapper from "../components/FormWrapper";
import { isIOS, isMobileOnly } from "react-device-detect";

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
}) => {
  const [windowHeight, setWindowHeight] = React.useState(window.innerHeight);

  const visualPageTop = React.useRef(0);
  const diffRef = React.useRef(0);
  const contentRef = React.useRef(0);

  React.useEffect(() => {
    if (isMobileOnly && isIOS) {
      window.visualViewport.addEventListener("resize", onResize);
      window.visualViewport.addEventListener("scroll", onResize);
    }
    return () => {
      window.visualViewport.removeEventListener("resize", onResize);
      window.visualViewport.removeEventListener("scroll", onResize);
    };
  }, []);

  const onResize = (e) => {
    if (!contentRef.current) return;

    if (currentDisplayType === "modal") {
      let diff = windowHeight - e.target.height - e.target.pageTop;

      visualPageTop.current = e.target.pageTop;

      contentRef.current.style.bottom = `${diff}px`;

      return;
    }
    if (e?.type === "resize") {
      let diff = windowHeight - e.target.height - e.target.pageTop;

      visualPageTop.current = e.target.pageTop;

      contentRef.current.style.bottom = `${diff}px`;
      contentRef.current.style.height = `${
        e.target.height - 64 + e.target.pageTop
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
  };

  const headerComponent = header ? header.props.children : null;
  const bodyComponent = body ? body.props.children : null;
  const footerComponent = footer ? footer.props.children : null;
  const containerComponent = container ? container.props.children : null;

  const validateOnMouseDown = (e) => {
    if (e.target.id === "modal-onMouseDown-close") onClose();
  };

  return (
    <StyledModal
      id={id}
      className={visible ? "modal-active" : ""}
      modalSwipeOffset={modalSwipeOffset}
    >
      <ModalBackdrop
        className={visible ? "modal-backdrop-active backdrop-active" : ""}
        visible={true}
        zIndex={zIndex}
        modalSwipeOffset={modalSwipeOffset}
      >
        <Dialog
          id="modal-onMouseDown-close"
          className={classNames(
            className,
            "modalOnCloseBacdrop",
            "not-selectable",
            "dialog"
          )}
          currentDisplayType={currentDisplayType}
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
                id={id}
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
                  withFooterBorder={withFooterBorder}
                />
              )
            ) : (
              <>
                {container &&
                containerVisible &&
                currentDisplayType !== "modal" ? (
                  <>{containerComponent}</>
                ) : (
                  <FormWrapper withForm={withForm}>
                    {header && (
                      <StyledHeader
                        id="modal-header-swipe"
                        className={classNames(
                          "modal-header",
                          header.props.className
                        )}
                        currentDisplayType={currentDisplayType}
                        {...header.props}
                      >
                        <Heading
                          level={1}
                          className={"heading"}
                          size="medium"
                          truncate={true}
                        >
                          {headerComponent}
                        </Heading>
                      </StyledHeader>
                    )}
                    {body && (
                      <StyledBody
                        className={classNames(
                          "modal-body",
                          body.props.className
                        )}
                        withBodyScroll={withBodyScroll}
                        isScrollLocked={isScrollLocked}
                        hasFooter={1 && footer}
                        currentDisplayType={currentDisplayType}
                        {...body.props}
                        embedded={embedded}
                      >
                        {currentDisplayType === "aside" && withBodyScroll ? (
                          <Scrollbar
                            stype="mediumBlack"
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
                        className={classNames(
                          "modal-footer",
                          footer.props.className
                        )}
                        withFooterBorder={withFooterBorder}
                        currentDisplayType={currentDisplayType}
                        isDoubleFooterLine={isDoubleFooterLine}
                        {...footer.props}
                      >
                        {footerComponent}
                      </StyledFooter>
                    )}
                  </FormWrapper>
                )}
              </>
            )}
          </Content>
        </Dialog>
      </ModalBackdrop>
    </StyledModal>
  );
};

Modal.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  zIndex: PropTypes.number,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  onClose: PropTypes.func,
  visible: PropTypes.bool,
  modalSwipeOffset: PropTypes.number,

  isLoading: PropTypes.bool,
  modalLoaderBodyHeight: PropTypes.string,

  currentDisplayType: PropTypes.oneOf(["auto", "modal", "aside"]),
  isLarge: PropTypes.bool,

  header: PropTypes.object,
  body: PropTypes.object,
  footer: PropTypes.object,
};

export default Modal;
