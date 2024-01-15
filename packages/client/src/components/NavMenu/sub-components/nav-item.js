import React from "react";
import { ReactSVG } from "react-svg";
import PropTypes from "prop-types";
import styled, { css } from "styled-components";

import { Badge } from "@docspace/shared/components/badge";
import { Link } from "@docspace/shared/components/link";
import { Text } from "@docspace/shared/components/text";
import {
  commonIconsStyles,
  getCorrectFourValuesStyle,
  tablet,
} from "@docspace/shared/utils";

import MenuIcon from "PUBLIC_DIR/images/menu.react.svg";
import { Base } from "@docspace/shared/themes";

const NavItemSeparator = styled.div`
  border-bottom: 1px ${(props) => (props.dashed ? "dashed" : "solid")}
    ${(props) => props.theme.navItem.separatorColor};
  margin: 0 16px;
`;

NavItemSeparator.defaultProps = { theme: Base };

const NavItemWrapper = styled(Link)`
  display: flex;
  min-width: 48px;
  min-height: 50px;
  align-items: center;
  padding: ${({ theme }) =>
    getCorrectFourValuesStyle("0 16px 0 20px", theme.interfaceDirection)};
  cursor: pointer;
  position: relative;
  box-sizing: border-box;

  ${(props) =>
    !props.noHover &&
    css`
      &:hover {
        background: ${(props) => props.theme.navItem.wrapper.hoverBackground};
        text-decoration: none;
      }
    `}

  .injected-svg {
    margin-top: 3px;
    path {
      fill: ${(props) =>
        props.active
          ? props.theme.navItem.activeColor
          : props.theme.navItem.baseColor};
    }
  }

  ${(props) =>
    props.iconUrl &&
    css`
      svg {
        path {
          fill: ${(props) =>
            props.active
              ? props.theme.navItem.activeColor
              : props.theme.navItem.baseColor};
        }
      }
    `}

  @media ${tablet} {
    padding: ${({ theme }) =>
      getCorrectFourValuesStyle("0 16px 0 16px", theme.interfaceDirection)};
  }
`;

NavItemWrapper.defaultProps = { theme: Base };

const NavItemLabel = styled(Text)`
  margin: ${({ theme }) =>
    getCorrectFourValuesStyle("0 auto 0 16px", theme.interfaceDirection)};

  display: ${(props) => (props.opened ? "block" : "none")};
  color: ${(props) =>
    props.active
      ? props.theme.navItem.activeColor
      : props.theme.navItem.baseColor};
`;

NavItemLabel.defaultProps = { theme: Base };

const badgeCss = css`
  position: absolute;
  top: 2px;

  ${({ theme }) =>
    theme.interfaceDirection === "rtl" ? `left: 4px;` : `right: 4px;`}
  overflow: inherit;
`;

const NavItemBadge = styled(Badge)`
  ${(props) => (props.opened ? "" : badgeCss)}
`;

const VersionBadge = styled.div`
  background-color: #3cb55b;
  border-radius: 5px;
  color: #ffffff;
  display: inline-block;
  font-size: ${(props) => props.theme.getCorrectFontSize("10px")};
  line-height: 8px;
  padding: 3px 6px;
  position: absolute;
  top: -5px;

  ${({ theme }) =>
    theme.interfaceDirection === "rtl" ? `right: 10px;` : `left: 10px;`}
`;

const StyledMenuIcon = styled(MenuIcon)`
  ${commonIconsStyles}
  path {
    fill: ${(props) =>
      props.active
        ? props.theme.navItem.activeColor
        : props.theme.navItem.baseColor};
  }
`;

StyledMenuIcon.defaultProps = { theme: Base };
const NavItem = React.memo((props) => {
  //console.log("NavItem render");
  const {
    separator,
    opened,
    active,
    iconName,
    iconUrl,
    children,
    badgeNumber,
    onClick,
    onBadgeClick,
    url,
    noHover,
    ...rest
  } = props;

  return separator ? (
    <NavItemSeparator {...rest} />
  ) : (
    <NavItemWrapper
      noHover={noHover}
      iconUrl={iconUrl}
      href={url}
      onClick={onClick}
      active={active}
      {...rest}
    >
      {iconUrl ? (
        <ReactSVG src={iconUrl} beforeInjection={(svg) => {}} />
      ) : (
        <>
          {iconName === "MenuIcon" && <VersionBadge>BETA</VersionBadge>}
          <StyledMenuIcon active={active} size="big" />
        </>
      )}
      {children && (
        <NavItemLabel
          opened={opened}
          active={active}
          fontSize="16px"
          fontWeight="bold"
          truncate
        >
          {children}
        </NavItemLabel>
      )}
      <NavItemBadge
        opened={opened}
        label={badgeNumber}
        onClick={onBadgeClick}
      />
    </NavItemWrapper>
  );
});

NavItem.displayName = "NavItem";

NavItem.propTypes = {
  active: PropTypes.bool,
  badgeNumber: PropTypes.number,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  url: PropTypes.string,
  iconName: PropTypes.string,
  iconUrl: PropTypes.string,
  onBadgeClick: PropTypes.func,
  onClick: PropTypes.func,
  opened: PropTypes.bool,
  separator: PropTypes.bool,
  noHover: PropTypes.bool,
  dashed: PropTypes.bool,
};

export default NavItem;
