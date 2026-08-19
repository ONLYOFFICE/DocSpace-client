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

import { useEffect } from "react";
import { observer, inject } from "mobx-react";
import { DeviceType } from "@docspace/shared/enums";

const withLoading = (WrappedComponent) => {
  const LoaderWrapper = (props) => {
    const {
      isLoadedArticleBody,
      isLoadedSectionHeader,
      isLoadedSubmenu,
      isLoadedLngTZSettings,
      isLoadedDNSSettings,
      isLoadedConfigureDeepLink,
      isLoadedAdManagement,
      isLoadedCustomizationNavbar,
      isLoadedWelcomePageSettings,
      isBurgerLoading,
      setIsBurgerLoading,
      enablePortalRename,
      deviceType,
      showPortalSettingsLoader,
    } = props;

    const viewMobile = deviceType === DeviceType.mobile;
    const pathname = window.location.pathname;
    const index = pathname.lastIndexOf("/");
    const setting = pathname.slice(index + 1);

    useEffect(() => {
      if (pathname.includes("developer-tools"))
        return setIsBurgerLoading(false);
      if (pathname.includes("profile")) {
        if (!isLoadedArticleBody) {
          setIsBurgerLoading(true);
        } else {
          setIsBurgerLoading(false);
        }
      }

      if (isLoadedArticleBody) {
        setIsBurgerLoading(false);
      } else {
        setIsBurgerLoading(true);
      }
    }, [isLoadedArticleBody, setIsBurgerLoading]);

    const loadedPortalRenaming = !!enablePortalRename;

    const isLoadedCustomizationSettings =
      isLoadedArticleBody &&
      !isBurgerLoading &&
      isLoadedSectionHeader &&
      !showPortalSettingsLoader;

    const isLoadedCustomizationNavbarSettings =
      isLoadedCustomizationNavbar &&
      isLoadedArticleBody &&
      !isBurgerLoading &&
      isLoadedSectionHeader &&
      isLoadedSubmenu &&
      !showPortalSettingsLoader;

    const isLoadedCustomizationSettingLngTZSettings =
      isLoadedArticleBody &&
      !isBurgerLoading &&
      isLoadedSectionHeader &&
      isLoadedLngTZSettings;

    const isLoadedCustomizationSettingWelcomePageSettings =
      isLoadedArticleBody &&
      !isBurgerLoading &&
      isLoadedSectionHeader &&
      isLoadedWelcomePageSettings;

    const isLoadedCustomizationSettingPortalRenaming =
      isLoadedArticleBody &&
      !isBurgerLoading &&
      isLoadedSectionHeader &&
      loadedPortalRenaming;

    const isLoadedCustomizationSettingDNSSettings =
      isLoadedArticleBody &&
      !isBurgerLoading &&
      isLoadedSectionHeader &&
      isLoadedDNSSettings;

    const isLoadedCustomizationConfigureDeepLink =
      isLoadedArticleBody &&
      !isBurgerLoading &&
      isLoadedSectionHeader &&
      isLoadedConfigureDeepLink;

    const isLoadedCustomizationAdManagement =
      isLoadedArticleBody &&
      !isBurgerLoading &&
      isLoadedSectionHeader &&
      isLoadedAdManagement;

    const getIsLoadedPage = () => {
      switch (setting) {
        case "language-and-time-zone":
          return isLoadedCustomizationSettingLngTZSettings;
        case "welcome-page-settings":
          return isLoadedCustomizationSettingWelcomePageSettings;
        case "dns-settings":
          return isLoadedCustomizationSettingDNSSettings;
        case "portal-renaming":
          return isLoadedCustomizationSettingPortalRenaming;
        case "ad-management":
          return isLoadedCustomizationAdManagement;
        case "configure-deep-link":
          return isLoadedCustomizationConfigureDeepLink;
        default:
          return viewMobile
            ? isLoadedCustomizationNavbarSettings
            : isLoadedCustomizationSettings;
      }
    };

    const isLoadedPage = getIsLoadedPage();

    return (
      <WrappedComponent
        {...props}
        viewMobile={viewMobile}
        isLoadedPage={isLoadedPage}
      />
    );
  };

  return inject(({ common, settingsStore, clientLoadingStore }) => {
    const {
      isLoadedArticleBody,
      isLoadedSectionHeader,
      isLoadedSubmenu,
      isLoadedLngTZSettings,
      isLoadedDNSSettings,
      isLoadedConfigureDeepLink,
      isLoadedAdManagement,
      isLoadedCustomizationNavbar,
      isLoadedWelcomePageSettings,
    } = common;

    const {
      isBurgerLoading,
      setIsBurgerLoading,
      enablePortalRename,
      deviceType,
    } = settingsStore;

    const { showPortalSettingsLoader } = clientLoadingStore;

    return {
      isLoadedArticleBody,
      isLoadedSectionHeader,
      isLoadedSubmenu,
      isLoadedLngTZSettings,
      isLoadedDNSSettings,
      isLoadedConfigureDeepLink,
      isLoadedAdManagement,
      isLoadedCustomizationNavbar,
      isLoadedWelcomePageSettings,
      isBurgerLoading,
      setIsBurgerLoading,
      enablePortalRename,
      deviceType,
      showPortalSettingsLoader,
    };
  })(observer(LoaderWrapper));
};
export default withLoading;
