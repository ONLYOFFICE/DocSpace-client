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

import PersonalLogoReactSvgUrl from "PUBLIC_DIR/images/personal.logo.react.svg?url";
import React, { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { Link as LinkWithoutRedirect } from "react-router-dom";
import { isMobileOnly, isMobile } from "react-device-detect";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  isDesktop,
  tablet,
  mobile,
  NoUserSelect,
  getLogoUrl,
} from "@docspace/shared/utils";
import { WhiteLabelLogoType } from "@docspace/shared/enums";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import HeaderCatalogBurger from "./header-catalog-burger";
import { Base } from "@docspace/shared/themes";

const Header = styled.header`
  display: flex;
  align-items: center;

  background-color: ${(props) => props.theme.header.backgroundColor};

  width: 100vw;
  height: 48px;

  .header-logo-wrapper {
    height: 24px;

    display: flex;
    align-items: center;
    justify-items: center;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

    ${NoUserSelect}
  }

  .header-logo-icon {
    position: absolute;
    right: 50%; /* Just centering. Does not require rtl mirroring */
    transform: translateX(50%);
    height: 24px;
    cursor: pointer;

    svg {
      path:last-child {
        fill: ${(props) => props.theme.client.home.logoColor};
      }
    }
  }
  .mobile-short-logo {
    width: 146px;
  }

  .header-items-wrapper {
    display: flex;

    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `margin-right: 82px;`
        : `margin-left: 82px;`}
  }
`;

Header.defaultProps = { theme: Base };

const StyledLink = styled.div`
  display: inline;
  .nav-menu-header_link {
    color: ${(props) => props.theme.header.linkColor};
    font-size: ${(props) => props.theme.getCorrectFontSize("13px")};
  }

  a {
    text-decoration: none;
  }
  :hover {
    color: ${(props) => props.theme.header.linkColor};
    -webkit-text-decoration: underline;
    text-decoration: underline;
  }
`;

StyledLink.defaultProps = { theme: Base };

const versionBadgeProps = {
  fontWeight: "600",
  fontSize: "13px",
};

const StyledNavigationIconsWrapper = styled.div`
  height: 20px;
  position: absolute;

  ${({ theme }) =>
    theme.interfaceDirection === "rtl"
      ? `right: ${isMobile ? "254px" : "275px"};`
      : `left: ${isMobile ? "254px" : "275px"};`}
  display: ${isMobileOnly ? "none" : "flex"};
  justify-content: flex-start;
  align-items: center;

  @media ${tablet} {
    ${({ theme }) =>
      theme.interfaceDirection === "rtl" ? `right: 254px;` : `left: 254px;`}
  }

  @media ${mobile} {
    display: none;
  }
`;

const HeaderComponent = ({
  currentProductName,
  //totalNotifications,
  onClick,
  onNavMouseEnter,
  onNavMouseLeave,
  defaultPage,
  //mainModules,
  isNavOpened,
  currentProductId,
  toggleAside,
  isLoaded,
  version,
  isAuthenticated,
  isAdmin,
  backdropClick,
  isPersonal,
  isPreparationPortal,
  theme,
  toggleArticleOpen,
  logoUrl,

  customHeader,
  ...props
}) => {
  const { t } = useTranslation("Common");

  const location = useLocation();

  const isFormGallery = location.pathname.includes("/form-gallery");

  //const isNavAvailable = mainModules.length > 0;

  // const onLogoClick = () => {
  //   history.push(defaultPage);
  //   backdropClick();
  // };

  // const onBadgeClick = React.useCallback((e) => {
  //   if (!e) return;
  //   const id = e.currentTarget.dataset.id;
  //   const item = mainModules.find((m) => m.id === id);
  //   toggleAside();

  //   if (item) item.onBadgeClick(e);
  // }, []);

  // const handleItemClick = React.useCallback((e) => {
  //   onItemClick(e);
  //   backdropClick();
  // }, []);

  //const numberOfModules = mainModules.filter((item) => !item.separator).length;
  //const needNavMenu = currentProductId !== "home";
  // const mainModulesWithoutSettings = mainModules.filter(
  //   (module) => module.id !== "settings"
  // );

  /*const navItems = mainModulesWithoutSettings.map(
    ({ id, separator, iconUrl, notifications, link, title, dashed }) => {
      const itemLink = getLink(link);
      const shouldRenderIcon = checkIfModuleOld(link);
      return (
        <NavItem
          separator={!!separator}
          key={id}
          data-id={id}
          data-link={itemLink}
          opened={isNavOpened}
          active={id == currentProductId}
          iconUrl={iconUrl}
          badgeNumber={notifications}
          onClick={handleItemClick}
          onBadgeClick={onBadgeClick}
          url={itemLink}
          dashed={dashed}
        >
          {title}
          {shouldRenderIcon && <StyledExternalLinkIcon color={linkColor} />}
        </NavItem>
      );
    }
  );*/

  const [isDesktopView, setIsDesktopView] = useState(isDesktop());

  const onResize = () => {
    const isDesktopView = isDesktop();
    if (isDesktopView === isDesktopView) setIsDesktopView(isDesktopView);
  };

  useEffect(() => {
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  });

  const logo = getLogoUrl(WhiteLabelLogoType.LightSmall, !theme.isBase);

  return (
    <>
      <Header
        module={currentProductName}
        isLoaded={isLoaded}
        isPersonal={isPersonal}
        isPreparationPortal={isPreparationPortal}
        isAuthenticated={isAuthenticated}
        className="navMenuHeader hidingHeader"
        needNavMenu={false}
        isDesktopView={isDesktopView}
      >
        {((isPersonal && location.pathname.includes("files")) ||
          (!isPersonal && currentProductId !== "home")) &&
          !isFormGallery && <HeaderCatalogBurger onClick={toggleArticleOpen} />}
        {customHeader ? (
          <>{customHeader}</>
        ) : (
          <LinkWithoutRedirect className="header-logo-wrapper" to={defaultPage}>
            {!isPersonal ? (
              <img alt="logo" src={logo} className="header-logo-icon" />
            ) : (
              <img
                alt="logo"
                className="header-logo-icon"
                src={combineUrl(
                  window.DocSpaceConfig?.proxy?.url,
                  PersonalLogoReactSvgUrl,
                )}
              />
            )}
          </LinkWithoutRedirect>
        )}
        {/* {isNavAvailable &&
          isDesktopView &&
          !isPersonal &&
          currentProductId !== "home" && (
            <StyledNavigationIconsWrapper>
              {mainModules.map((item) => {
                return (
                  <React.Fragment key={item.id}>
                    {item.iconUrl &&
                      !item.separator &&
                      item.id !== "settings" && (
                        <HeaderNavigationIcon
                          key={item.id}
                          id={item.id}
                          data-id={item.id}
                          data-link={item.link}
                          active={item.id == currentProductId}
                          iconUrl={item.iconUrl}
                          badgeNumber={item.notifications}
                          onItemClick={onItemClick}
                          onBadgeClick={onBadgeClick}
                          url={item.link}
                        />
                      )}
                  </React.Fragment>
                );
              })}
            </StyledNavigationIconsWrapper>
          )} */}
      </Header>

      {/* {!isDesktopView && (
        <Nav
          opened={isNavOpened}
          onMouseEnter={onNavMouseEnter}
          onMouseLeave={onNavMouseLeave}
          numberOfModules={numberOfModules}
        >
          <NavLogoItem opened={isNavOpened} onClick={onLogoClick} />
          <NavItem
            separator={true}
            key={"nav-products-separator"}
            data-id={"nav-products-separator"}
          />
          {navItems}
          <Box className="version-box">
            <Link
              as="a"
              href={`https://github.com/ONLYOFFICE/Docspace/releases`}
              target="_blank"
              {...versionBadgeProps}
            >
              {t("Common:Version")} {version}
            </Link>
            <Text as="span" {...versionBadgeProps}>
              {" "}
              -{" "}
            </Text>
            <StyledLink>
              <LinkWithoutRedirect
                to={combineUrl(window.DocSpaceConfig?.proxy?.url, "/about")}
                className="nav-menu-header_link"
              >
                {t("Common:About")}
              </LinkWithoutRedirect>
            </StyledLink>
          </Box>
        </Nav>
      )} */}
    </>
  );
};

HeaderComponent.displayName = "Header";

HeaderComponent.propTypes = {
  //totalNotifications: PropTypes.number,
  onClick: PropTypes.func,

  defaultPage: PropTypes.string,

  isNavOpened: PropTypes.bool,
  onNavMouseEnter: PropTypes.func,
  onNavMouseLeave: PropTypes.func,
  toggleAside: PropTypes.func,
  logoUrl: PropTypes.object,
  isLoaded: PropTypes.bool,
  version: PropTypes.string,
  isAuthenticated: PropTypes.bool,
  isAdmin: PropTypes.bool,
  needNavMenu: PropTypes.bool,
};

export default inject(({ settingsStore, authStore }) => {
  const {
    isLoaded,
    isAuthenticated,
    isAdmin,

    version,
  } = authStore;
  const {
    logoUrl,
    defaultPage,
    currentProductId,
    personal: isPersonal,
    theme,
    toggleArticleOpen,
  } = settingsStore;

  return {
    theme,
    isPersonal,
    isAdmin,
    defaultPage,
    logoUrl,

    //totalNotifications,
    isLoaded,
    version,
    isAuthenticated,
    currentProductId,
    toggleArticleOpen,
    //currentProductName: (product && product.title) || "",
  };
})(observer(HeaderComponent));
