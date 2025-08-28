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

import React from "react";
import { isIOS, isMobileOnly, isSafari } from "react-device-detect";
import classNames from "classnames";

import { ASIDE_PADDING_AFTER_LAST_ITEM } from "../../../constants";
import { DialogSkeleton, DialogAsideSkeleton } from "../../../skeletons";

import { Scrollbar } from "../../scrollbar";
import { AsideHeader } from "../../aside-header";
import styles from "../ModalDialog.module.scss";
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
  isHuge,
  zIndex,
  autoMaxHeight,
  autoMaxWidth,
  onClose,
  onBackClick,
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

  embedded,
  withForm,
  withoutPadding,
  withoutHeaderMargin,
  hideContent,

  isInvitePanelLoader = false,
  onSubmit,
  withBodyScrollForcibly = false,
  withBorder = false,
  dataTestId,
  ...rest
}: ModalSubComponentsProps) => {
  const contentRef = React.useRef<null | HTMLDivElement>(null);

  const headerComponent = React.isValidElement(header)
    ? (header.props as { children: React.ReactNode }).children
    : null;
  const bodyComponent = React.isValidElement(body)
    ? (body.props as { children: React.ReactNode }).children
    : null;
  const footerComponent = React.isValidElement(footer)
    ? (footer.props as { children: React.ReactNode }).children
    : null;
  const containerComponent = React.isValidElement(container)
    ? (container.props as { children: React.ReactNode }).children
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

  const onTouchMove = () => {
    const { activeElement } = document;
    if (
      activeElement instanceof HTMLElement &&
      activeElement?.tagName === "INPUT"
    ) {
      activeElement.blur();
    }
  };

  const onFocusAction = () => {
    document.addEventListener("touchmove", onTouchMove);
  };

  const onBlurAction = () => {
    document.removeEventListener("touchmove", onTouchMove);
  };

  const iOSActions =
    isMobileOnly && isIOS && isSafari
      ? { onFocus: onFocusAction, onBlur: onBlurAction }
      : {};

  const contentMarginBottom =
    modalSwipeOffset && modalSwipeOffset < 0
      ? `${modalSwipeOffset * 1.1}px`
      : "0px";

  const dialogClassName = classNames(
    styles.dialog,
    className,
    "not-selectable",
    "dialog",
  );

  const contentClassName = classNames(styles.content, {
    [styles.visible]: visible,
    [styles.large]: isLarge,
    [styles.huge]: isHuge,
    [styles.displayTypeModal]: currentDisplayType === "modal",
    [styles.displayTypeAside]: currentDisplayType === "aside",
    [styles.autoMaxHeight]: autoMaxHeight,
    [styles.autoMaxWidth]: autoMaxWidth,
    [styles.withBorder]: withBorder,
  });

  const headerClassName = classNames(
    styles.header,
    "modal-header",
    headerProps.className,
    {
      [styles.displayTypeModal]: currentDisplayType === "modal",
      [styles.withoutHeaderMargin]: withoutHeaderMargin,
    },
  );

  const bodyClassName = classNames(
    styles.body,
    "modal-body",
    bodyProps.className,
    {
      [styles.withBodyScroll]: withBodyScroll,
      [styles.scrollLocked]: isScrollLocked,
      [styles.hasFooter]: !!footer,
      [styles.displayTypeModal]: currentDisplayType === "modal",
      [styles.displayTypeAside]: currentDisplayType === "aside",
      [styles.withoutPadding]: withoutPadding,
    },
  );

  const footerClassName = classNames(
    styles.footer,
    "modal-footer",
    footerProps.className,
    {
      [styles.withFooterBorder]: withFooterBorder,
      [styles.doubleFooterLine]: isDoubleFooterLine,
    },
  );

  return (
    <div
      id={id}
      className={classNames(styles.modal, {
        [styles.modalActive]: visible,
      })}
      data-testid={dataTestId ?? "modal"}
    >
      <ModalBackdrop
        className={classNames({
          [styles.modalBackdropActive]: visible,
          "backdrop-active": visible,
        })}
        zIndex={zIndex}
      >
        <div
          id="modal-onMouseDown-close"
          className={dialogClassName}
          role="dialog"
          aria-modal="true"
          style={style}
          onMouseDown={validateOnMouseDown}
        >
          {!hideContent ? (
            <div
              id="modal-dialog"
              ref={contentRef}
              style={{ marginBottom: contentMarginBottom }}
              className={contentClassName}
            >
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
                    isInvitePanelLoader={isInvitePanelLoader}
                  />
                )
              ) : container &&
                containerVisible &&
                currentDisplayType !== "modal" ? (
                containerComponent
              ) : (
                <FormWrapper withForm={withForm || false} onSubmit={onSubmit}>
                  {header ? (
                    <AsideHeader
                      id="modal-header-swipe"
                      className={headerClassName}
                      header={headerComponent}
                      onCloseClick={onClose}
                      onBackClick={onBackClick}
                      {...rest}
                    />
                  ) : null}

                  {body ? (
                    <div
                      {...bodyProps}
                      {...iOSActions}
                      className={bodyClassName}
                    >
                      {withBodyScrollForcibly ||
                      (currentDisplayType === "aside" && withBodyScroll) ? (
                        <Scrollbar
                          id="modal-scroll"
                          className="modal-scroll"
                          noScrollY={isScrollLocked}
                          paddingAfterLastItem={ASIDE_PADDING_AFTER_LAST_ITEM}
                        >
                          {bodyComponent}
                        </Scrollbar>
                      ) : (
                        bodyComponent
                      )}
                    </div>
                  ) : null}
                  {footer ? (
                    <div {...footerProps} className={footerClassName}>
                      {footerComponent}
                    </div>
                  ) : null}
                </FormWrapper>
              )}
            </div>
          ) : null}
        </div>
      </ModalBackdrop>
    </div>
  );
};

export { Modal };
