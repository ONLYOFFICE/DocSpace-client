import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import PropTypes from "prop-types";
import {
  StyledFloatingButton,
  StyledDropDown,
  StyledDropDownItem,
  StyledContainerAction,
  StyledProgressBarContainer,
  StyledMobileProgressBar,
  StyledProgressContainer,
  StyledBar,
  StyledButtonWrapper,
  StyledButtonOptions,
  StyledAlertIcon,
  StyledRenderItem,
} from "./styled-main-button";
import IconButton from "../icon-button";
import Text from "../text";
import Scrollbar from "../scrollbar";
import { isIOS, isMobile } from "react-device-detect";
import Backdrop from "../backdrop";

import styled from "styled-components";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/button.alert... Remove this comment to see the full error message
import ButtonAlertReactSvg from "PUBLIC_DIR/images/button.alert.react.svg";
import commonIconsStyles from "../utils/common-icons-style";

import { ColorTheme, ThemeType } from "../ColorTheme";
import SubmenuItem from "./sub-components/SubmenuItem";
import { classNames } from "../utils/classNames";

const StyledButtonAlertIcon = styled(ButtonAlertReactSvg)`
  cursor: pointer;
  vertical-align: top !important;
  ${commonIconsStyles};
`;

const ProgressBarMobile = ({
  label,
  status,
  percent,
  open,
  onCancel,
  icon,
  onClickAction,
  hideButton,
  error
}: any) => {
  const uploadPercent = percent > 100 ? 100 : percent;

  const onClickHeaderAction = () => {
    onClickAction && onClickAction();
    hideButton();
  };

  return (
    // @ts-expect-error TS(2769): No overload matches this call.
    <StyledProgressBarContainer isUploading={open}>
      <div className="progress-container">
        // @ts-expect-error TS(2322): Type '{ children: any; className: string; fontSize... Remove this comment to see the full error message
        <Text
          className="progress-header"
          fontSize={`14`}
          // color="#657077"
          onClick={onClickHeaderAction}
          truncate
        >
          {label}
        </Text>
        <div className="progress_info-container">
          // @ts-expect-error TS(2322): Type '{ children: any; className: string; fontSize... Remove this comment to see the full error message
          <Text className="progress_count" fontSize={`13`} truncate>
            {status}
          </Text>
          <IconButton
            // @ts-expect-error TS(2322): Type '{ className: string; onClick: any; iconName:... Remove this comment to see the full error message
            className="progress_icon"
            onClick={onCancel}
            iconName={icon}
            size={14}
          />
        </div>
      </div>

      <StyledMobileProgressBar>
        <ColorTheme
          // @ts-expect-error TS(2322): Type '{ themeId: string; uploadPercent: any; error... Remove this comment to see the full error message
          themeId={ThemeType.MobileProgressBar}
          uploadPercent={uploadPercent}
          error={error}
        />
      </StyledMobileProgressBar>
    </StyledProgressBarContainer>
  );
};

ProgressBarMobile.propTypes = {
  label: PropTypes.string,
  status: PropTypes.string,
  percent: PropTypes.number,
  open: PropTypes.bool,
  onCancel: PropTypes.func,
  icon: PropTypes.string,
  /** The function called after the progress header is clicked  */
  onClickAction: PropTypes.func,
  /** The function that facilitates hiding the button */
  hideButton: PropTypes.func,
  /** Changes the progress bar color, if set to true */
  error: PropTypes.bool,
};

const MainButtonMobile = (props: any) => {
  const {
    className,
    style,
    opened,
    onUploadClick,
    actionOptions,
    progressOptions,
    buttonOptions,
    percent,
    title,
    withButton,
    withoutButton,
    manualWidth,
    isOpenButton,
    onClose,
    sectionWidth,
    alert,
    withMenu,
    onClick,
    onAlertClick,
    withAlertClick,
    dropdownStyle,
  } = props;

  const [isOpen, setIsOpen] = useState(opened);
  const [isUploading, setIsUploading] = useState(false);
  const [height, setHeight] = useState(window.innerHeight - 48 + "px");
  const [openedSubmenuKey, setOpenedSubmenuKey] = useState("");

  const divRef = useRef();
  const ref = useRef();
  const dropDownRef = useRef();

  useEffect(() => {
    if (opened !== isOpen) {
      setIsOpen(opened);
    }
  }, [opened]);

  let currentPosition: any, prevPosition: any, buttonBackground: any, scrollElem: any;

  useEffect(() => {
    if (!isIOS) return;

    scrollElem = document.getElementsByClassName("section-scroll")[0];

    if (scrollElem?.scrollTop === 0) {
      scrollElem.classList.add("dialog-background-scroll");
    }

    scrollElem?.addEventListener("scroll", scrollChangingBackground);

    return () => {
      scrollElem?.removeEventListener("scroll", scrollChangingBackground);
    };
  }, []);

  const scrollChangingBackground = () => {
    currentPosition = scrollElem.scrollTop;
    const scrollHeight = scrollElem.scrollHeight;

    if (currentPosition < prevPosition) {
      setDialogBackground(scrollHeight);
    } else {
      if (currentPosition > 0 && currentPosition > prevPosition) {
        setButtonBackground();
      }
    }
    prevPosition = currentPosition;
  };

  const onAlertClickAction = () => {
    withAlertClick && onAlertClick && onAlertClick();
  };

  const setDialogBackground = (scrollHeight: any) => {
    if (!buttonBackground) {
      document
        .getElementsByClassName("section-scroll")[0]
        .classList.add("dialog-background-scroll");
    }
    if (currentPosition < scrollHeight / 3) {
      buttonBackground = false;
    }
  };
  const setButtonBackground = () => {
    buttonBackground = true;
    scrollElem.classList.remove("dialog-background-scroll");
  };
  const recalculateHeight = () => {
    let height =
      // @ts-expect-error TS(2339): Property 'getBoundingClientRect' does not exist on... Remove this comment to see the full error message
      divRef?.current?.getBoundingClientRect()?.height || window.innerHeight;

    height >= window.innerHeight
      ? setHeight(window.innerHeight - 48 + "px")
      : setHeight(height + "px");
  };

  useLayoutEffect(() => {
    // @ts-expect-error TS(2532): Object is possibly 'undefined'.
    const { height } = divRef.current.getBoundingClientRect();
    setHeight(height);
  }, [isOpen]);

  useLayoutEffect(() => {
    recalculateHeight();
  }, [isOpen, isOpenButton, window.innerHeight, isUploading]);

  useEffect(() => {
    window.addEventListener("resize", recalculateHeight);
    return () => {
      window.removeEventListener("resize", recalculateHeight);
    };
  }, [recalculateHeight]);

  const toggle = (isOpen: any) => {
    if (isOpenButton && onClose) {
      onClose();
    }

    return setIsOpen(isOpen);
  };

  const onMainButtonClick = (e: any) => {
    if (!withMenu) {
      onClick && onClick(e);
      return;
    }

    toggle(!isOpen);
  };

  const outsideClick = (e: any) => {
    // @ts-expect-error TS(2532): Object is possibly 'undefined'.
    if (isOpen && ref.current.contains(e.target)) return;
    toggle(false);
  };

  React.useEffect(() => {
    if (progressOptions) {
      const openProgressOptions = progressOptions.filter(
        (option: any) => option.open
      );

      setIsUploading(openProgressOptions.length > 0);
    }
  }, [progressOptions]);

  const noHover = isMobile ? true : false;

  const renderItems = () => {
    return (
      // @ts-expect-error TS(2769): No overload matches this call.
      <StyledRenderItem ref={divRef}>
        <StyledContainerAction>
          {actionOptions.map((option: any) => {
            const optionOnClickAction = () => {
              toggle(false);
              option.onClick && option.onClick({ action: option.action });
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
                className={classNames(option.className, {
                  "is-separator": option.isSeparator,
                })}
                onClick={optionOnClickAction}
                icon={option.icon ? option.icon : ""}
                action={option.action}
                noHover={noHover}
              />
            );
          })}
        </StyledContainerAction>
        <StyledProgressContainer
          // @ts-expect-error TS(2769): No overload matches this call.
          isUploading={isUploading}
          isOpenButton={isOpenButton}
        >
          {progressOptions &&
            progressOptions.map((option: any) => <ProgressBarMobile
              key={option.key}
              label={option.label}
              icon={option.icon}
              // @ts-expect-error TS(2322): Type '{ key: any; label: any; icon: any; className... Remove this comment to see the full error message
              className={option.className}
              percent={option.percent}
              status={option.status}
              open={option.open}
              onCancel={option.onCancel}
              onClickAction={option.onClick}
              hideButton={() => toggle(false)}
              error={option.error}
            />)}
        </StyledProgressContainer>

        // @ts-expect-error TS(2769): No overload matches this call.
        <StyledButtonOptions withoutButton={withoutButton}>
          {buttonOptions
            ? buttonOptions.map((option: any) => option.isSeparator ? (
            <div key={option.key} className="separator-wrapper">
              <div className="is-separator" />
            </div>
          ) : (
            <StyledDropDownItem
              id={option.id}
              className={`drop-down-item-button ${
                option.isSeparator ? "is-separator" : ""
              }`}
              key={option.key}
              label={option.label}
              onClick={option.onClick}
              icon={option.icon ? option.icon : ""}
              action={option.action}
            />
          )
              )
            : ""}
        </StyledButtonOptions>
      </StyledRenderItem>
    );
  };

  const children = renderItems();

  return (
    <>
      // @ts-expect-error TS(2322): Type '{ zIndex: number; visible: any; onClick: (e:... Remove this comment to see the full error message
      <Backdrop zIndex={210} visible={isOpen} onClick={outsideClick} />
      <div
        // @ts-expect-error TS(2322): Type 'MutableRefObject<undefined>' is not assignab... Remove this comment to see the full error message
        ref={ref}
        className={className}
        style={{ zIndex: `${isOpen ? "211" : "201"}`, ...style }}
      >
        <StyledFloatingButton
          icon={isOpen ? "minus" : "plus"}
          isOpen={isOpen}
          onClick={onMainButtonClick}
          percent={percent}
        />

        // @ts-expect-error TS(2769): No overload matches this call.
        <StyledDropDown
          style={dropdownStyle}
          open={isOpen}
          withBackdrop={false}
          manualWidth={manualWidth || "400px"}
          directionY="top"
          directionX="right"
          isMobile={isMobile}
          fixedDirection={true}
          heightProp={height}
          sectionWidth={sectionWidth}
          isDefaultMode={false}
          className="mainBtnDropdown"
        >
          {isMobile ? (
            // @ts-expect-error TS(2322): Type '{ children: Element; style: { position: stri... Remove this comment to see the full error message
            <Scrollbar
              style={{ position: "absolute" }}
              scrollclass="section-scroll"
              stype="mediumBlack"
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
            <StyledButtonAlertIcon onClick={onAlertClickAction} size="small" />
          </StyledAlertIcon>
        )}
      </div>
    </>
  );
};

MainButtonMobile.propTypes = {
  /** Accepts css style */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  /** Drop down items options */
  actionOptions: PropTypes.array.isRequired,
  /** Displays progress bar components */
  progressOptions: PropTypes.array,
  /** Menu that opens by clicking on the button */
  buttonOptions: PropTypes.array,
  /** The function called after the button is clicked */
  onUploadClick: PropTypes.func,
  /** Displays button inside the drop down */
  withButton: PropTypes.bool,
  /** Opens a menu on clicking the button. Used with buttonOptions */
  isOpenButton: PropTypes.bool,
  /** The button name in the drop down */
  title: PropTypes.string,
  /** Loading indicator */
  percent: PropTypes.number,
  /** Width section */
  sectionWidth: PropTypes.number,
  /** Specifies the exact width of the drop down component */
  manualWidth: PropTypes.string,
  /** Accepts class */
  className: PropTypes.string,
  /** Sets the dropdown to open */
  opened: PropTypes.bool,
  /** Closes the drop down */
  onClose: PropTypes.func,
  /** If you need open upload panel when clicking on alert button  */
  onAlertClick: PropTypes.func,
  /** Enables alert click  */
  withAlertClick: PropTypes.bool,
  /** Enables the submenu */
  withMenu: PropTypes.bool,
};

MainButtonMobile.defaultProps = {
  withMenu: true,
};

export default MainButtonMobile;
