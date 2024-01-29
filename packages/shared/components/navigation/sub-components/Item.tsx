import React from "react";

import DefaultIcon from "PUBLIC_DIR/images/default.react.svg";
import RootIcon from "PUBLIC_DIR/images/root.react.svg";
import DefaultTabletIcon from "PUBLIC_DIR/images/default.tablet.react.svg";
import RootTabletIcon from "PUBLIC_DIR/images/root.tablet.react.svg";

import { DeviceType } from "../../../enums";

import { ColorTheme, ThemeId } from "../../color-theme";
import { StyledItem, StyledText } from "../Navigation.styled";
import { INavigationItemProps } from "../Navigation.types";

const Item = ({
  id,
  title,
  isRoot,
  isRootRoom,
  onClick,
  withLogo,
  currentDeviceType,
  ...rest
}: INavigationItemProps) => {
  const onClickAvailable = () => {
    onClick?.(id, isRootRoom);
  };

  return (
    <StyledItem
      id={`${id}`}
      isRoot={isRoot}
      onClick={onClickAvailable}
      withLogo={!!withLogo}
      {...rest}
    >
      <ColorTheme isRoot={isRoot} themeId={ThemeId.IconWrapper}>
        {currentDeviceType !== DeviceType.desktop ? (
          isRoot ? (
            <RootTabletIcon />
          ) : (
            <DefaultTabletIcon />
          )
        ) : isRoot ? (
          <RootIcon />
        ) : (
          <DefaultIcon />
        )}
      </ColorTheme>

      <StyledText
        isRoot={isRoot}
        fontWeight={isRoot ? "600" : "400"}
        fontSize="15px"
        truncate
        title={title}
      >
        {title}
      </StyledText>
    </StyledItem>
  );
};

export default React.memo(Item);
