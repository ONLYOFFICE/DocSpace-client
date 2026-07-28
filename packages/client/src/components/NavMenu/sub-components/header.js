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

import { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { Link as LinkWithoutRedirect } from "react-router";
import { isDesktop, getLogoUrl } from "@docspace/shared/utils";
import { FolderType, WhiteLabelLogoType } from "@docspace/shared/enums";
import HeaderCatalogBurger from "./header-catalog-burger";
import { getUrlByDefaultFolderType } from "SRC_DIR/helpers/utils";

import styles from "../nav.module.scss";

const HeaderComponent = ({
  currentProductName,
  currentProductId,
  isLoaded,
  isAuthenticated,
  isPreparationPortal,
  theme,
  toggleArticleOpen,
  customHeader,
  defaultFolderType,
}) => {
  const defaultUrl = getUrlByDefaultFolderType(
    defaultFolderType || FolderType.Rooms,
  );
  const [isDesktopView, setIsDesktopView] = useState(isDesktop());

  const onResize = () => {
    const desktop = isDesktop();
    setIsDesktopView((value) => (value !== desktop ? desktop : value));
  };

  useEffect(() => {
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [onResize]);

  const logo = getLogoUrl(
    WhiteLabelLogoType.LightSmall,
    !theme.isBase,
    false,
    "",
    true,
  );

  return (
    <>
      <header
        module={currentProductName}
        isLoaded={isLoaded}
        isPreparationPortal={isPreparationPortal}
        isAuthenticated={isAuthenticated}
        className={classNames(
          styles.mainHeader,
          "navMenuHeader",
          "hidingHeader",
        )}
        needNavMenu={false}
        isDesktopView={isDesktopView}
      >
        {currentProductId !== "home" ? (
          <HeaderCatalogBurger onClick={toggleArticleOpen} />
        ) : null}
        {customHeader || (
          <LinkWithoutRedirect className="header-logo-wrapper" to={defaultUrl}>
            <img alt="logo" src={logo} className="header-logo-icon" />
          </LinkWithoutRedirect>
        )}
      </header>
    </>
  );
};

HeaderComponent.displayName = "Header";

HeaderComponent.propTypes = {
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
  const {
    logoUrl,
    currentProductId,
    theme,
    toggleArticleOpen,
    defaultFolderType,
  } = settingsStore;

  return {
    theme,
    isAdmin,
    logoUrl,

    // totalNotifications,
    isLoaded,
    version,
    isAuthenticated,
    currentProductId,
    toggleArticleOpen,
    defaultFolderType,
    // currentProductName: (product && product.title) || "",
  };
})(observer(HeaderComponent));
