import React from "react";
import PropTypes from "prop-types";
import styled, { css } from "styled-components";

import { Text } from "@docspace/shared/components/text";

import DefaultIcon from "PUBLIC_DIR/images/default.react.svg";
import RootIcon from "PUBLIC_DIR/images/root.react.svg";
import DefaultTabletIcon from "PUBLIC_DIR/images/default.tablet.react.svg";
import RootTabletIcon from "PUBLIC_DIR/images/root.tablet.react.svg";

import { tablet, mobile } from "@docspace/shared/utils";
import { Base } from "@docspace/shared/themes";

import { ColorTheme, ThemeId } from "@docspace/shared/components/color-theme";
import { DeviceType } from "../../../constants";

const StyledItem = styled.div`
  height: auto;
  width: auto !important;
  position: relative;
  display: grid;
  align-items: ${(props) => (props.isRoot ? "baseline" : "end")};
  grid-template-columns: 17px auto;
  cursor: pointer;

  ${({ theme }) =>
    theme.interfaceDirection === "rtl" ? `margin-right: 0;` : `margin-left: 0;`}

  @media ${tablet} {
    ${({ withLogo }) =>
      withLogo &&
      css`
        ${(props) =>
          props.theme.interfaceDirection === "rtl"
            ? css`
                margin-right: 44px;
              `
            : css`
                margin-left: 44px;
              `}
      `};
  }

  @media ${mobile} {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: 0;
          `
        : css`
            margin-left: 0;
          `}
  }
`;

const StyledText = styled(Text)`
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          margin-right: 10px;
        `
      : css`
          margin-left: 10px;
        `}
  position: relative;
  bottom: ${(props) => (props.isRoot ? "2px" : "-1px")};
`;

const Item = ({
  id,
  title,
  isRoot,
  isRootRoom,
  onClick,
  withLogo,
  currentDeviceType,
  ...rest
}) => {
  const onClickAvailable = () => {
    onClick && onClick(id, isRootRoom);
  };

  return (
    <StyledItem
      id={id}
      isRoot={isRoot}
      onClick={onClickAvailable}
      withLogo={withLogo}
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
        fontSize={"15px"}
        truncate={true}
        title={title}
      >
        {title}
      </StyledText>
    </StyledItem>
  );
};

Item.propTypes = {
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  title: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  isRoot: PropTypes.bool,
  onClick: PropTypes.func,
};

export default React.memo(Item);
