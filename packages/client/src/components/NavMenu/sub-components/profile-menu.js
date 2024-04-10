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

import React from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";

import { Avatar } from "@docspace/shared/components/avatar";
import { DropDown } from "@docspace/shared/components/drop-down";

import styled, { css, withTheme } from "styled-components";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";

import { Base } from "@docspace/shared/themes";
import { mobile, tablet } from "@docspace/shared/utils";
import CrossIcon from "PUBLIC_DIR/images/icons/17/cross.react.svg";
import { Portal } from "@docspace/shared/components/portal";

const StyledWrapper = styled.div``;

const StyledDropDown = styled(DropDown)`
  z-index: 500 !important;

  top: ${(props) =>
    props.isBannerVisible && props.withPortal ? "134px" : "54px"} !important;

  ${({ theme }) =>
    theme.interfaceDirection === "rtl"
      ? `left: 20px !important;`
      : `right: 20px !important;`}

  @media ${tablet} {
    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `left: 16px !important;`
        : `right: 16px !important;`}
  }

  @media ${mobile} {
    position: fixed;

    top: unset !important;
    right: 0 !important;
    left: 0 !important;
    bottom: 0 !important;
    width: 100vw;

    border: none !important;

    border-radius: 6px 6px 0px 0px !important;
  }
`;

const StyledControlContainer = styled.div`
  width: 24px;
  height: 24px;
  position: absolute;
  top: -34px;
  ${({ theme }) =>
    theme.interfaceDirection === "rtl" ? `left: 10px;` : `right: 10px;`}
  border-radius: 100px;
  cursor: pointer;
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 290;

  @media ${mobile} {
    display: flex;
  }
`;

StyledControlContainer.defaultProps = { theme: Base };

const StyledCrossIcon = styled(CrossIcon)`
  width: 17px;
  height: 17px;
  path {
    stroke: ${(props) => props.theme.catalog.control.fill};
  }
`;

StyledCrossIcon.defaultProps = { theme: Base };

const commonStyle = css`
  font-family: "Open Sans", sans-serif, Arial;
  font-style: normal;
  color: ${(props) => props.theme.menuContainer.color};
  max-width: 300px;
  @media ${mobile} {
    max-width: calc(100vw - 84px);
  }
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const StyledProfileMenu = styled(DropDownItem)`
  position: relative;
  overflow: visible;
  padding: 0px;
  cursor: pointer;
  display: inline-block;
  margin-top: -6px;
  max-width: 600px;
`;

export const MenuContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  position: relative;
  height: 76px;
  background: ${(props) => props.theme.menuContainer.background};
  border-radius: 6px 6px 0px 0px;
  padding: 16px;
  cursor: default;
  box-sizing: border-box;

  background: red;

  @media ${mobile} {
    max-width: 100vw;
    background: ${(props) => props.theme.menuContainer.background};
  }

  .avatar {
    height: 40px;
    width: 40px;
    min-height: 40px;
    min-width: 40px;
  }
`;

MenuContainer.defaultProps = { theme: Base };

export const MainLabelContainer = styled.div`
  font-size: ${(props) => props.theme.getCorrectFontSize("16px")};
  line-height: 28px;

  width: auto;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  ${commonStyle}
`;

MainLabelContainer.defaultProps = { theme: Base };

export const LabelContainer = styled.div`
  font-weight: normal;
  font-size: ${(props) => props.theme.getCorrectFontSize("11px")};
  line-height: 16px;

  ${commonStyle}
`;

LabelContainer.defaultProps = { theme: Base };

class ProfileMenu extends React.Component {
  constructor(props) {
    super(props);
  }
  renderDropDown = () => {
    const {
      avatarRole,
      avatarSource,
      children,
      className,
      displayName,
      clickOutsideAction,
      open,
      forwardedRef,
      isBannerVisible,
    } = this.props;
    // console.log("Current theme: ", this.props.theme);

    return (
      <StyledDropDown
        className={className}
        directionX="right"
        open={open}
        clickOutsideAction={clickOutsideAction}
        forwardedRef={forwardedRef}
        isDefaultMode={false}
        withBlur={true}
        isBannerVisible={isBannerVisible}
        withPortal={true}
      >
        <StyledProfileMenu>
          <MenuContainer>
            <Avatar
              className="avatar"
              size="medium"
              role={avatarRole}
              source={avatarSource}
              userName={displayName}
              hideRoleIcon
            />
            <div>
              <MainLabelContainer>{displayName}</MainLabelContainer>
              <StyledControlContainer onClick={clickOutsideAction}>
                <StyledCrossIcon />
              </StyledControlContainer>
            </div>
          </MenuContainer>
        </StyledProfileMenu>
        {children}
      </StyledDropDown>
    );
  };

  render() {
    const { open } = this.props;

    const element = this.renderDropDown();

    const root = document.getElementById("root");

    const wrapper = <StyledWrapper>{element}</StyledWrapper>;

    return <>{<Portal element={wrapper} appendTo={root} visible={open} />}</>;
  }
}

ProfileMenu.displayName = "ProfileMenu";

ProfileMenu.propTypes = {
  avatarRole: PropTypes.oneOf(["owner", "admin", "guest", "user"]),
  avatarSource: PropTypes.string,
  children: PropTypes.any,
  className: PropTypes.string,
  displayName: PropTypes.string,
  id: PropTypes.string,
  open: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  clickOutsideAction: PropTypes.func,
};

export default inject(({ bannerStore }) => {
  const { isBannerVisible } = bannerStore;

  return { isBannerVisible };
})(observer(withTheme(ProfileMenu)));
