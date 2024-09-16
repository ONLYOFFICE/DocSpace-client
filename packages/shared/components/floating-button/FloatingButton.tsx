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
import RefreshIcon from "PUBLIC_DIR/images/icons/16/refresh.react.svg";
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
        <StyledCircle
          displayProgress={displayProgress}
          percent={percent > 100 ? 0 : percent}
        >
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
