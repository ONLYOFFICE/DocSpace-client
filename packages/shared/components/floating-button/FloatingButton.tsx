import React, { useEffect, useState, useMemo } from "react";
import styled from "styled-components";

import ButtonUploadIcon from "PUBLIC_DIR/images/button.upload.react.svg";
import ButtonFileIcon from "PUBLIC_DIR/images/button.file.react.svg";
import ButtonTrashIcon from "PUBLIC_DIR/images/button.trash.react.svg";
import ButtonMoveIcon from "PUBLIC_DIR/images/button.move.react.svg";
import ButtonDuplicateIcon from "PUBLIC_DIR/images/button.duplicate.react.svg";
import ButtonAlertIcon from "PUBLIC_DIR/images/button.alert.react.svg";
import ButtonPlusIcon from "PUBLIC_DIR/images/icons/16/button.plus.react.svg";
import ButtonMinusIcon from "PUBLIC_DIR/images/icons/16/button.minus.react.svg";
import RefreshIcon from "PUBLIC_DIR/images/refresh.react.svg";
import CloseIcon from "PUBLIC_DIR/images/close-icon.react.svg";

import { FloatingButtonTheme } from "./FloatingButton.theme";

import { IconSizeType, classNames, commonIconsStyles } from "../../utils";

import {
  StyledFloatingButtonWrapper,
  StyledFloatingButton,
  StyledAlertIcon,
  StyledCircle,
  IconBox,
} from "./FloatingButton.styled";
import { FloatingButtonProps } from "./FloatingButton.types";
import { FloatingButtonIcons } from "./FloatingButton.enums";

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

const FloatingButton = (props: FloatingButtonProps) => {
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
  } = props;

  const [animationCompleted, setAnimationCompleted] = useState(false);

  const timerId = React.useRef<null | ReturnType<typeof setTimeout>>(null);

  const onProgressClear = () => {
    clearUploadedFilesHistory?.();
  };

  const displayProgress = useMemo(() => {
    return (
      !(percent === 100 && animationCompleted) &&
      icon !== FloatingButtonIcons.minus
    );
  }, [percent, animationCompleted, icon]);

  useEffect(() => {
    timerId.current = setTimeout(
      () => setAnimationCompleted(percent === 100),
      Delay,
    );

    return () => {
      if (timerId.current) clearTimeout(timerId.current);
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
        className={
          classNames([className, "not-selectable"]) || "not-selectable"
        }
      >
        <StyledCircle displayProgress={displayProgress} percent={percent}>
          <div className="circle__mask circle__full">
            <div className="circle__fill" />
          </div>
          <div className="circle__mask">
            <div className="circle__fill" />
          </div>

          <StyledFloatingButton className="circle__background" color={color}>
            <IconBox className="icon-box">{iconComponent}</IconBox>
            <StyledAlertIcon>
              {alert ? (
                <StyledButtonAlertIcon size={IconSizeType.medium} />
              ) : null}
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

FloatingButton.defaultProps = {
  id: undefined,
  className: undefined,
  style: undefined,
  icon: FloatingButtonIcons.upload,
  alert: false,
  percent: 0,
};

export { FloatingButton };
