// (c) Copyright Ascensio System SIA 2009-2025
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

import { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { Link as LinkWithoutRedirect, useLocation } from "react-router";
import {
  isDesktop,
  NoUserSelect,
  getLogoUrl,
  injectDefaultTheme,
} from "@docspace/shared/utils";
import { WhiteLabelLogoType } from "@docspace/shared/enums";
import { globalColors } from "@docspace/shared/themes";
import HeaderCatalogBurger from "./header-catalog-burger";

const Header = styled.header.attrs(injectDefaultTheme)`
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
    -webkit-tap-highlight-color: ${globalColors.tapHighlight};

    ${NoUserSelect}
  }

  .header-logo-icon {
    position: absolute;
    right: 50%; /* Does not require rtl mirroring */
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
    margin-inline-start: 82px;
  }
`;

const HeaderComponent = ({
  currentProductName,
  defaultPage,
  currentProductId,
  isLoaded,
  isAuthenticated,
  isPreparationPortal,
  theme,
  toggleArticleOpen,
  customHeader,
}) => {
  const location = useLocation();

  const isFormGallery = location.pathname.includes("/form-gallery");

  // const isNavAvailable = mainModules.length > 0;

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

  // const numberOfModules = mainModules.filter((item) => !item.separator).length;
  // const needNavMenu = currentProductId !== "home";
  // const mainModulesWithoutSettings = mainModules.filter(
  //   (module) => module.id !== "settings"
  // );

  /* const navItems = mainModulesWithoutSettings.map(
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
  ); */

  const [isDesktopView, setIsDesktopView] = useState(isDesktop());

  const onResize = () => {
    const desktop = isDesktop();
    setIsDesktopView((value) => (value !== desktop ? desktop : value));
  };

  useEffect(() => {
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [onResize]);

  const logo = getLogoUrl(WhiteLabelLogoType.LightSmall, !theme.isBase);

  return (
    <>
      <Header
        module={currentProductName}
        isLoaded={isLoaded}
        isPreparationPortal={isPreparationPortal}
        isAuthenticated={isAuthenticated}
        className="navMenuHeader hidingHeader"
        needNavMenu={false}
        isDesktopView={isDesktopView}
      >
        {currentProductId !== "home" && !isFormGallery ? (
          <HeaderCatalogBurger onClick={toggleArticleOpen} />
        ) : null}
        {customHeader || (
          <LinkWithoutRedirect className="header-logo-wrapper" to={defaultPage}>
            <img alt="logo" src={logo} className="header-logo-icon" />
          </LinkWithoutRedirect>
        )}
        {/* {isNavAvailable &&
          isDesktopView &&
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
                to={combineUrl(window.ClientConfig?.proxy?.url, "/about")}
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
  defaultPage: PropTypes.string,
  isLoaded: PropTypes.bool,
  isAuthenticated: PropTypes.bool,
};

export default inject(({ settingsStore, authStore }) => {
  const {
    isLoaded,
    isAuthenticated,
    isAdmin,

    version,
  } = authStore;
  const { logoUrl, defaultPage, currentProductId, theme, toggleArticleOpen } =
    settingsStore;

  return {
    theme,
    isAdmin,
    defaultPage,
    logoUrl,

    // totalNotifications,
    isLoaded,
    version,
    isAuthenticated,
    currentProductId,
    toggleArticleOpen,
    // currentProductName: (product && product.title) || "",
  };
})(observer(HeaderComponent));
