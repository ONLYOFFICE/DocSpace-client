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

import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { isIOS, isMobile } from "react-device-detect";
import styled from "styled-components";

import ButtonAlertReactSvg from "PUBLIC_DIR/images/button.alert.react.svg";

import { IconSizeType, classNames, commonIconsStyles } from "../../utils";

import { Scrollbar } from "../scrollbar";
import { Backdrop } from "../backdrop";
import { FloatingButtonIcons } from "../floating-button";

import {
  StyledFloatingButton,
  StyledDropDown,
  StyledDropDownItem,
  StyledContainerAction,
  StyledProgressContainer,
  StyledButtonOptions,
  StyledAlertIcon,
  StyledRenderItem,
} from "./MainButtonMobile.styled";

import SubmenuItem from "./sub-components/SubmenuItem";
import {
  ActionOption,
  ButtonOption,
  MainButtonMobileProps,
  ProgressOption,
} from "./MainButtonMobile.types";
import { ProgressBarMobile } from "./sub-components/ProgressBar";

const StyledButtonAlertIcon = styled(ButtonAlertReactSvg)`
  cursor: pointer;
  vertical-align: top !important;
  ${commonIconsStyles};
`;

const MainButtonMobile = (props: MainButtonMobileProps) => {
  const {
    className,
    style,
    opened,

    actionOptions,
    progressOptions,
    buttonOptions,
    percent,

    withoutButton,
    manualWidth,
    isOpenButton,
    onClose,

    alert,
    withMenu = true,
    onClick,
    onAlertClick,
    withAlertClick,
    dropdownStyle,
  } = props;

  const [isOpen, setIsOpen] = useState(opened);
  const [isUploading, setIsUploading] = useState(false);
  const [height, setHeight] = useState(`${window.innerHeight - 48}px`);
  const [openedSubmenuKey, setOpenedSubmenuKey] = useState("");

  const divRef = useRef<HTMLDivElement | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);
  const dropDownRef = useRef(null);

  const scrollElem = useRef<null | HTMLElement>(null);
  const currentPosition = useRef<null | number>(null);
  const prevPosition = useRef<null | number>(null);
  const buttonBackground = useRef<boolean>(false);

  useEffect(() => {
    setIsOpen(opened);
  }, [opened]);

  const usePrevious = (value?: string) => {
    const prevRef = useRef<string>();

    useEffect(() => {
      prevRef.current = value;
    });

    return prevRef.current;
  };

  const currentLocation = window.location.href;
  const prevLocation = usePrevious(window.location.href);

  useEffect(() => {
    if (prevLocation !== currentLocation) {
      setIsOpen(false);
    }
  }, [prevLocation, currentLocation]);

  const setDialogBackground = (scrollHeight: number) => {
    if (!buttonBackground) {
      document
        .getElementsByClassName("section-scroll")[0]
        .classList.add("dialog-background-scroll");
    }
    if (currentPosition.current && currentPosition.current < scrollHeight / 3) {
      buttonBackground.current = false;
    }
  };

  const setButtonBackground = React.useCallback(() => {
    buttonBackground.current = true;
    if (scrollElem.current)
      scrollElem.current.classList.remove("dialog-background-scroll");
  }, []);

  const scrollChangingBackground = React.useCallback(() => {
    if (scrollElem.current) {
      currentPosition.current = scrollElem.current.scrollTop;
      const scrollHeight = scrollElem.current.scrollHeight;

      if (currentPosition < prevPosition) {
        setDialogBackground(scrollHeight);
      } else if (
        currentPosition.current &&
        prevPosition.current &&
        currentPosition.current > 0 &&
        currentPosition.current > prevPosition.current
      ) {
        setButtonBackground();
      }
      prevPosition.current = currentPosition.current;
    }
  }, [setButtonBackground]);

  useEffect(() => {
    if (!isIOS) return;

    scrollElem.current = document.getElementsByClassName(
      "section-scroll",
    )[0] as HTMLElement;

    if (scrollElem.current && scrollElem.current.scrollTop === 0) {
      scrollElem.current.classList.add("dialog-background-scroll");
    }

    scrollElem.current.addEventListener("scroll", scrollChangingBackground);

    return () => {
      if (scrollElem.current)
        scrollElem.current.removeEventListener(
          "scroll",
          scrollChangingBackground,
        );
    };
  }, [scrollChangingBackground]);

  const onAlertClickAction = () => {
    if (withAlertClick) onAlertClick?.();
  };

  const recalculateHeight = React.useCallback(() => {
    if (divRef.current) {
      const h =
        divRef?.current?.getBoundingClientRect()?.height || window.innerHeight;

      if (h >= window.innerHeight) setHeight(`${window.innerHeight - 48}px`);
      else setHeight(`${h}px`);
    }
  }, []);

  useLayoutEffect(() => {
    if (divRef.current) {
      const { height: h } = divRef.current.getBoundingClientRect();
      setHeight(`${h}px`);
    }
  }, [isOpen]);

  useLayoutEffect(() => {
    recalculateHeight();
  }, [isOpen, isOpenButton, isUploading, recalculateHeight]);

  useEffect(() => {
    window.addEventListener("resize", recalculateHeight);
    return () => {
      window.removeEventListener("resize", recalculateHeight);
    };
  }, [recalculateHeight]);

  const toggle = (value: boolean) => {
    if (isOpenButton && onClose) {
      onClose();
    }

    return setIsOpen(value);
  };

  const onMainButtonClick = (e: React.MouseEvent) => {
    if (!withMenu) {
      onClick?.(e);
      return;
    }

    toggle(!isOpen);
  };

  const outsideClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (isOpen && ref.current && ref.current.contains(target)) return;
    toggle(false);
  };

  React.useEffect(() => {
    if (progressOptions) {
      const openProgressOptions = progressOptions.filter(
        (option: ProgressOption) => option.open,
      );

      setIsUploading(openProgressOptions.length > 0);
    }
  }, [progressOptions]);

  const noHover = isMobile;

  const renderItems = () => {
    return (
      <StyledRenderItem ref={divRef}>
        <StyledContainerAction>
          {actionOptions?.map((option: ActionOption) => {
            const optionOnClickAction = () => {
              toggle(false);
              option.onClick?.({ action: option.action });
            };

            if (option.items)
              return (
                <SubmenuItem
                  key={option.key}
                  option={option}
                  toggle={toggle}
                  noHover={noHover}
                  recalculateHeight={recalculateHeight}
                  openedSubmenuKey={openedSubmenuKey}
                  setOpenedSubmenuKey={setOpenedSubmenuKey}
                />
              );

            return (
              <StyledDropDownItem
                id={option.id}
                key={option.key}
                label={option.label}
                className={
                  classNames([
                    option.className,
                    option.isSeparator ? "is-separator" : "",
                  ]) || ""
                }
                onClick={optionOnClickAction}
                icon={option.icon ? option.icon : ""}
                noHover={noHover}
              />
            );
          })}
        </StyledContainerAction>
        <StyledProgressContainer isUploading={isUploading}>
          {progressOptions &&
            progressOptions.map((option: ProgressOption) => (
              <ProgressBarMobile
                key={option.key}
                label={option.label}
                icon={option.icon || ""}
                className={option.className}
                percent={option.percent || 0}
                status={option.status}
                open={option.open || false}
                onCancel={option.onCancel}
                onClickAction={option.onClick}
                hideButton={() => toggle(false)}
                error={option.error}
              />
            ))}
        </StyledProgressContainer>

        {buttonOptions && (
          <StyledButtonOptions withoutButton={withoutButton}>
            {buttonOptions.map((option: ButtonOption) => {
              if (option.items) {
                return (
                  <SubmenuItem
                    key={option.key}
                    option={option}
                    toggle={toggle}
                    noHover={noHover}
                    recalculateHeight={recalculateHeight}
                    openedSubmenuKey={openedSubmenuKey}
                    setOpenedSubmenuKey={setOpenedSubmenuKey}
                  />
                );
              }

              if (option.isSeparator)
                return (
                  <div key={option.key} className="separator-wrapper">
                    <div className="is-separator" />
                  </div>
                );

              return (
                <StyledDropDownItem
                  id={option.id}
                  className="drop-down-item-button"
                  key={option.key}
                  label={option.label}
                  onClick={option.onClick}
                  icon={option.icon ? option.icon : ""}
                  // action={option.action}
                />
              );
            })}
          </StyledButtonOptions>
        )}
      </StyledRenderItem>
    );
  };

  const children = renderItems();

  return (
    <>
      <Backdrop zIndex={210} visible={isOpen || false} onClick={outsideClick} />
      <div
        ref={ref}
        className={className}
        style={{ zIndex: `${isOpen ? "211" : "201"}`, ...style }}
        data-testid="main-button-mobile"
      >
        <StyledFloatingButton
          icon={isOpen ? FloatingButtonIcons.minus : FloatingButtonIcons.plus}
          onClick={onMainButtonClick}
          percent={percent}
        />

        <StyledDropDown
          style={dropdownStyle}
          open={isOpen}
          withBackdrop={false}
          manualWidth={manualWidth || "400px"}
          directionY="top"
          directionX="right"
          fixedDirection
          heightProp={height}
          isDefaultMode={false}
          className="mainBtnDropdown"
        >
          {isMobile ? (
            <Scrollbar
              style={{ position: "absolute" }}
              scrollClass="section-scroll"
              ref={dropDownRef}
            >
              {children}
            </Scrollbar>
          ) : (
            children
          )}
        </StyledDropDown>

        {alert && !isOpen && (
          <StyledAlertIcon>
            <StyledButtonAlertIcon
              onClick={onAlertClickAction}
              size={IconSizeType.small}
            />
          </StyledAlertIcon>
        )}
      </div>
    </>
  );
};

export { MainButtonMobile };
