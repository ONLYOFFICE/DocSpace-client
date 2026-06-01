/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { isMobile } from "@docspace/shared/utils";
import { Backdrop } from "@docspace/ui-kit/components/backdrop";
import { Aside } from "@docspace/ui-kit/components/aside";

import { withTranslation } from "react-i18next";
import { useLocation } from "react-router";

import { NavMenuHeaderLoader } from "@docspace/shared/skeletons/nav-menu";

import { inject, observer } from "mobx-react";
import { DeviceType } from "@docspace/shared/enums";
import { isPublicPreview } from "@docspace/shared/utils/common";

import HeaderUnAuth from "./sub-components/header-unauth";
import HeaderNav from "./sub-components/header-nav";
import Header from "./sub-components/header";
import styles from "./nav.module.scss";

const NavMenu = (props) => {
  const {
    isAuthenticated,
    isLoaded,
    asideContent,

    isFrame,
    showHeader,
    currentDeviceType,

    hideProfileMenu,
    customHeader,
    isAsideVisible: isAsideVisibleProp = false,
    isNavOpened: isNavOpenedProp = false,
    isNavHoverEnabled: isNavHoverEnabledProp = true,
    isBackdropVisible: isBackdropVisibleProp = false,

    isPublicRoom,
  } = props;

  const timeout = React.useRef(null);
  const scrollTopRef = React.useRef(0);

  const location = useLocation();

  const [isBackdropVisible, setIsBackdropVisible] = useState(
    isBackdropVisibleProp,
  );
  const [isNavOpened, setIsNavOpened] = useState(isNavOpenedProp);
  const [isAsideVisible, setIsAsideVisible] = useState(isAsideVisibleProp);
  const [isNavHoverEnabled, setIsNavHoverEnabled] = useState(
    isNavHoverEnabledProp,
  );
  const [isFixed, setIsFixed] = useState(true);

  const onScroll = useCallback((e) => {
    const eventTarget = e.target;
    const currentScrollTop = Math.max(0, eventTarget.scrollTop);
    const scrollHeight = eventTarget.scrollHeight;
    const clientHeight = eventTarget.clientHeight;

    const scrollShift = scrollTopRef.current - currentScrollTop;
    scrollTopRef.current = currentScrollTop;

    const isNearBottom = scrollHeight - (currentScrollTop + clientHeight) < 100;

    const isAtTop = currentScrollTop < 20;

    if (isAtTop) {
      setIsFixed(false);
    } else if (scrollShift > 0 && !isNearBottom) {
      setIsFixed(true);
    } else if (scrollShift <= 0) {
      setIsFixed(false);
    }
  }, []);

  useEffect(() => {
    const scroll = isMobile()
      ? document.querySelector("#customScrollBar .scroll-wrapper > .scroller")
      : document.querySelector("#sectionScroll .scroll-wrapper > .scroller");
    scroll?.addEventListener("scroll", onScroll);

    return () => {
      scroll?.removeEventListener("scroll", onScroll);
    };
  }, [onScroll]);

  useEffect(() => {
    if (isFixed) {
      document.documentElement.style.setProperty("--nav-offset", "48px");
    } else {
      document.documentElement.style.removeProperty("--nav-offset");
    }

    return () => {
      document.documentElement.style.removeProperty("--nav-offset");
    };
  }, [isFixed]);

  useEffect(() => {
    setIsFixed(false);
    scrollTopRef.current = 0;
  }, [location.pathname]);

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

  const isAsideAvailable = !!asideContent;
  const hideHeader = (!showHeader && isFrame) || isPublicPreview();

  if (currentDeviceType !== DeviceType.mobile || !isMobile() || hideHeader)
    return null;

  const isPreparationPortal = location.pathname === "/preparation-portal";

  return (
    <header
      className={classNames(styles.header, {
        [styles.isFixed]: isFixed,
      })}
    >
      <Backdrop
        visible={isBackdropVisible}
        onClick={backdropClick}
        withBackground
        withBlur
      />

      {!hideHeader ? (
        isLoaded && isAuthenticated && !isPublicRoom ? (
          <>
            {!isPreparationPortal ? (
              <HeaderNav hideProfileMenu={hideProfileMenu} />
            ) : null}
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
        ) : !isLoaded && isAuthenticated && !isPublicRoom ? (
          <NavMenuHeaderLoader />
        ) : (
          <HeaderUnAuth />
        )
      ) : null}

      {isAsideAvailable ? (
        <Aside visible={isAsideVisible} onClick={backdropClick}>
          {asideContent}
        </Aside>
      ) : null}
    </header>
  );
};

NavMenu.propTypes = {
  isBackdropVisible: PropTypes.bool,
  isNavHoverEnabled: PropTypes.bool,
  isNavOpened: PropTypes.bool,
  isAsideVisible: PropTypes.bool,

  asideContent: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),

  isAuthenticated: PropTypes.bool,
  isLoaded: PropTypes.bool,
};

const NavMenuWrapper = inject(
  ({ authStore, settingsStore, publicRoomStore }) => {
    const { isAuthenticated, isLoaded, language } = authStore;
    const {
      isDesktopClient: isDesktop,
      frameConfig,
      isFrame,
      currentDeviceType,
    } = settingsStore;
    const { isPublicRoom } = publicRoomStore;

    return {
      isAuthenticated,
      isLoaded,
      isDesktop,
      language,

      showHeader: frameConfig?.showHeader,
      isFrame,
      currentDeviceType,

      isPublicRoom,
    };
  },
)(observer(withTranslation(["Common"])(NavMenu)));

const NavMenuComponent = ({ ...props }) => <NavMenuWrapper {...props} />;
NavMenuComponent.displayName = "NavMenuComponent";

export default NavMenuComponent;
