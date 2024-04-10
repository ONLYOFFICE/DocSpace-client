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
import styled, { css } from "styled-components";

import { isMobile, mobile } from "@docspace/shared/utils";
import { Backdrop } from "@docspace/shared/components/backdrop";
import { Aside } from "@docspace/shared/components/aside";

import Header from "./sub-components/header";
import HeaderNav from "./sub-components/header-nav";
import HeaderUnAuth from "./sub-components/header-unauth";
import { I18nextProvider, withTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";

import { NavMenuHeaderLoader } from "@docspace/shared/skeletons/nav-menu";
import { LayoutContextConsumer } from "../Layout/context";

import { inject, observer } from "mobx-react";
import i18n from "./i18n";
import PreparationPortalDialog from "../dialogs/PreparationPortalDialog";
import { Base } from "@docspace/shared/themes";
import { DeviceType } from "@docspace/shared/enums";

const StyledContainer = styled.header`
  height: 48px;
  position: relative;
  align-items: center;
  background-color: ${(props) => props.theme.header.backgroundColor};

  ${(props) =>
    !props.isLoaded
      ? css`
          @media ${mobile} {
            width: 100vw; // fixes space between header loader and screen edge
          }
        `
      : css`
          @media ${mobile} {
            .navMenuHeader,
            .profileMenuIcon,
            .navMenuHeaderUnAuth {
              position: absolute;
              z-index: 160;
              top: 0;
              // top: ${(props) => (props.isVisible ? "0" : "-48px")};

              transition: top 0.3s cubic-bezier(0, 0, 0.8, 1);
              -moz-transition: top 0.3s cubic-bezier(0, 0, 0.8, 1);
              -ms-transition: top 0.3s cubic-bezier(0, 0, 0.8, 1);
              -webkit-transition: top 0.3s cubic-bezier(0, 0, 0.8, 1);
              -o-transition: top 0.3s cubic-bezier(0, 0, 0.8, 1);
            }

            width: 100vw;
          }
        `}
`;

StyledContainer.defaultProps = { theme: Base };

const NavMenu = (props) => {
  const timeout = React.useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  const [isBackdropVisible, setIsBackdropVisible] = React.useState(
    props.isBackdropVisible,
  );
  const [isNavOpened, setIsNavOpened] = React.useState(props.isNavHoverEnabled);
  const [isAsideVisible, setIsAsideVisible] = React.useState(props.isNavOpened);
  const [isNavHoverEnabled, setIsNavHoverEnabled] = React.useState(
    props.isAsideVisible,
  );

  const backdropClick = () => {
    setIsBackdropVisible(false);
    setIsNavOpened(false);
    setIsAsideVisible(false);
    setIsNavHoverEnabled((val) => !val);
  };

  const showNav = () => {
    setIsBackdropVisible(true);
    setIsNavOpened(true);
    setIsAsideVisible(false);
    setIsNavHoverEnabled(false);
  };

  const clearNavTimeout = () => {
    if (timeout.current === null) return;
    clearTimeout(timeout.current);
    timeout.current = null;
  };

  const handleNavMouseEnter = () => {
    if (!isNavHoverEnabled) return;
    timeout.current = setTimeout(() => {
      setIsBackdropVisible(false);
      setIsNavOpened(true);
      setIsAsideVisible(false);
    }, 1000);
  };

  const handleNavMouseLeave = () => {
    if (!isNavHoverEnabled) return;
    clearNavTimeout();
    setIsBackdropVisible(false);
    setIsNavOpened(false);
    setIsAsideVisible(false);
  };

  const toggleAside = () => {
    clearNavTimeout();
    setIsBackdropVisible(true);
    setIsNavOpened(false);
    setIsAsideVisible(true);
    setIsNavHoverEnabled(false);
  };

  const {
    isAuthenticated,
    isLoaded,
    asideContent,

    isDesktop,
    isFrame,
    showHeader,
    currentDeviceType,

    hideProfileMenu,
    customHeader,
  } = props;

  const isAsideAvailable = !!asideContent;
  const hideHeader = !showHeader && isFrame;

  if (currentDeviceType !== DeviceType.mobile || !isMobile() || hideHeader)
    return <></>;

  const isPreparationPortal = location.pathname === "/preparation-portal";
  return (
    <LayoutContextConsumer>
      {(value) => (
        <StyledContainer isLoaded={isLoaded} isVisible={value.isVisible}>
          <Backdrop
            visible={isBackdropVisible}
            onClick={backdropClick}
            withBackground={true}
            withBlur={true}
          />

          {!hideHeader &&
            (isLoaded && isAuthenticated ? (
              <>
                {!isPreparationPortal && (
                  <HeaderNav hideProfileMenu={hideProfileMenu} />
                )}
                <Header
                  customHeader={customHeader}
                  isPreparationPortal={isPreparationPortal}
                  isNavOpened={isNavOpened}
                  onClick={showNav}
                  onNavMouseEnter={handleNavMouseEnter}
                  onNavMouseLeave={handleNavMouseLeave}
                  toggleAside={toggleAside}
                  backdropClick={backdropClick}
                />
              </>
            ) : !isLoaded && isAuthenticated ? (
              <NavMenuHeaderLoader />
            ) : (
              <HeaderUnAuth />
            ))}

          {isAsideAvailable && (
            <Aside visible={isAsideVisible} onClick={backdropClick}>
              {asideContent}
            </Aside>
          )}
        </StyledContainer>
      )}
    </LayoutContextConsumer>
  );
};

NavMenu.propTypes = {
  isBackdropVisible: PropTypes.bool,
  isNavHoverEnabled: PropTypes.bool,
  isNavOpened: PropTypes.bool,
  isAsideVisible: PropTypes.bool,
  isDesktop: PropTypes.bool,

  asideContent: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),

  isAuthenticated: PropTypes.bool,
  isLoaded: PropTypes.bool,
};

NavMenu.defaultProps = {
  isBackdropVisible: false,
  isNavHoverEnabled: true,
  isNavOpened: false,
  isAsideVisible: false,
  isDesktop: false,
};

const NavMenuWrapper = inject(({ authStore, settingsStore }) => {
  const { isAuthenticated, isLoaded, language } = authStore;
  const {
    isDesktopClient: isDesktop,
    frameConfig,
    isFrame,
    currentDeviceType,
  } = settingsStore;

  return {
    isAuthenticated,
    isLoaded,
    isDesktop,
    language,

    showHeader: frameConfig?.showHeader,
    isFrame,
    currentDeviceType,
  };
})(observer(withTranslation(["NavMenu", "Common"])(NavMenu)));

export default ({ ...props }) => (
  <I18nextProvider i18n={i18n}>
    <NavMenuWrapper {...props} />
  </I18nextProvider>
);
