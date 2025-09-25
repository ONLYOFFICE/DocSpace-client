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
      isLoadedLngTZSettings &&
      !showPortalSettingsLoader;

    const isLoadedCustomizationSettingWelcomePageSettings =
      isLoadedArticleBody &&
      !isBurgerLoading &&
      isLoadedSectionHeader &&
      isLoadedWelcomePageSettings &&
      !showPortalSettingsLoader;

    const isLoadedCustomizationSettingPortalRenaming =
      isLoadedArticleBody &&
      !isBurgerLoading &&
      isLoadedSectionHeader &&
      loadedPortalRenaming &&
      !showPortalSettingsLoader;

    const isLoadedCustomizationSettingDNSSettings =
      isLoadedArticleBody &&
      !isBurgerLoading &&
      isLoadedSectionHeader &&
      isLoadedDNSSettings &&
      !showPortalSettingsLoader;

    const isLoadedCustomizationConfigureDeepLink =
      isLoadedArticleBody &&
      !isBurgerLoading &&
      isLoadedSectionHeader &&
      isLoadedConfigureDeepLink &&
      !showPortalSettingsLoader;

    const isLoadedCustomizationAdManagement =
      isLoadedArticleBody &&
      !isBurgerLoading &&
      isLoadedSectionHeader &&
      isLoadedAdManagement &&
      !showPortalSettingsLoader;

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
