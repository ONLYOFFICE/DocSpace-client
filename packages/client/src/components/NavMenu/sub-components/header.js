// (c) Copyright Ascensio System SIA 2009-2026
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
