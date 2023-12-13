import PropTypes from "prop-types";
import styled from "styled-components";
import React, { useEffect, useState, useMemo } from "react";

import {
  StyledFloatingButtonWrapper,
  StyledFloatingButton,
  StyledAlertIcon,
  StyledCircle,
  IconBox,
} from "./styled-floating-button";
import FloatingButtonTheme from "./FloatingButton.theme";

import { classNames } from "../utils/classNames";

import ButtonUploadIcon from "PUBLIC_DIR/images/button.upload.react.svg";
import ButtonFileIcon from "PUBLIC_DIR/images/button.file.react.svg";
import ButtonTrashIcon from "PUBLIC_DIR/images/button.trash.react.svg";
import ButtonMoveIcon from "PUBLIC_DIR/images/button.move.react.svg";
import ButtonDuplicateIcon from "PUBLIC_DIR/images/button.duplicate.react.svg";
import ButtonAlertIcon from "PUBLIC_DIR/images/button.alert.react.svg";
import commonIconsStyles from "../utils/common-icons-style";
import ButtonPlusIcon from "PUBLIC_DIR/images/icons/16/button.plus.react.svg";
import ButtonMinusIcon from "PUBLIC_DIR/images/icons/16/button.minus.react.svg";
import RefreshIcon from "PUBLIC_DIR/images/refresh.react.svg";
import CloseIcon from "PUBLIC_DIR/images/close-icon.react.svg";

const StyledButtonAlertIcon = styled(ButtonAlertIcon)`
  ${commonIconsStyles}
`;

const Delay = 1000;

const icons = {
  upload: <ButtonUploadIcon />,
  file: <ButtonFileIcon />,
  trash: <ButtonTrashIcon />,
  move: <ButtonMoveIcon />,
  plus: <ButtonPlusIcon />,
  minus: <ButtonMinusIcon />,
  refresh: <RefreshIcon />,
  duplicate: <ButtonDuplicateIcon />,
};

const FloatingButton = (props) => {
  const {
    id,
    className,
    style,
    icon,
    alert,
    percent,
    onClick,
    color,
    clearUploadedFilesHistory,
    showTwoProgress,
    ...rest
  } = props;

  const [animationCompleted, setAnimationCompleted] = useState(false);

  const onProgressClear = () => {
    clearUploadedFilesHistory && clearUploadedFilesHistory();
  };

  const displayProgress = useMemo(() => {
    return !(percent === 100 && animationCompleted) && icon != "minus";
  }, [percent, animationCompleted, icon]);

  let timerId = null;

  useEffect(() => {
    timerId = setTimeout(
      () => setAnimationCompleted(percent === 100 ? true : false),
      Delay
    );

    return () => {
      clearTimeout(timerId);
    };
  }, [percent, setAnimationCompleted]);

  const iconComponent = useMemo(() => {
    return icons[icon] ?? icons.duplicate;
  }, [icon]);

  return (
    <StyledFloatingButtonWrapper
      showTwoProgress={showTwoProgress}
      className="layout-progress-bar_wrapper"
    >
      <FloatingButtonTheme
        {...props}
        id={id}
        icon={icon}
        color={color}
        style={style}
        onClick={onClick}
        displayProgress={displayProgress}
        className={classNames(className, "not-selectable")}
      >
        <StyledCircle displayProgress={displayProgress} percent={percent}>
          <div className="circle__mask circle__full">
            <div className="circle__fill"></div>
          </div>
          <div className="circle__mask">
            <div className="circle__fill"></div>
          </div>

          <StyledFloatingButton className="circle__background" color={color}>
            <IconBox className="icon-box">{iconComponent}</IconBox>
            <StyledAlertIcon>
              {alert ? <StyledButtonAlertIcon size="medium" /> : <></>}
            </StyledAlertIcon>
          </StyledFloatingButton>
        </StyledCircle>
      </FloatingButtonTheme>
      {clearUploadedFilesHistory && percent === 100 && (
        <CloseIcon
          className="layout-progress-bar_close-icon"
          onClick={onProgressClear}
        />
      )}
    </StyledFloatingButtonWrapper>
  );
};

FloatingButton.propTypes = {
  /** Accepts id */
  id: PropTypes.string,
  /** Accepts class */
  className: PropTypes.string,
  /** Accepts CSS style */
  style: PropTypes.object,
  /** Sets the icon on the button */
  icon: PropTypes.oneOf([
    "upload",
    "file",
    "trash",
    "move",
    "duplicate",
    "plus",
    "minus",
    "refresh",
  ]),
  /** Displays the alert */
  alert: PropTypes.bool,
  /** Loading indicator */
  percent: PropTypes.number,
  /**  Sets a callback function that is triggered when the button is clicked */
  onClick: PropTypes.func,
  /** CSS color */
  color: PropTypes.string,
};

FloatingButton.defaultProps = {
  id: undefined,
  className: undefined,
  style: undefined,
  icon: "upload",
  alert: false,
  percent: 0,
};

export default FloatingButton;
