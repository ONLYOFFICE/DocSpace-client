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
      isLoadedCustomizationNavbar,
      isLoadedWelcomePageSettings,
      isBurgerLoading,
      setIsBurgerLoading,
      enablePortalRename,
      deviceType,
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
      isLoadedArticleBody && !isBurgerLoading && isLoadedSectionHeader;

    const isLoadedCustomizationNavbarSettings =
      isLoadedCustomizationNavbar &&
      isLoadedArticleBody &&
      !isBurgerLoading &&
      isLoadedSectionHeader &&
      isLoadedSubmenu;

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

    const isLoadedPage =
      setting === "language-and-time-zone"
        ? isLoadedCustomizationSettingLngTZSettings
        : setting === "welcome-page-settings"
          ? isLoadedCustomizationSettingWelcomePageSettings
          : setting === "dns-settings"
            ? isLoadedCustomizationSettingDNSSettings
            : setting === "portal-renaming"
              ? isLoadedCustomizationSettingPortalRenaming
              : viewMobile
                ? isLoadedCustomizationNavbarSettings
                : isLoadedCustomizationSettings;

    return (
      <WrappedComponent
        {...props}
        viewMobile={viewMobile}
        isLoadedPage={isLoadedPage}
      />
    );
  };

  return inject(({ common, settingsStore }) => {
    const {
      isLoadedArticleBody,
      isLoadedSectionHeader,
      isLoadedSubmenu,
      isLoadedLngTZSettings,
      isLoadedDNSSettings,
      isLoadedCustomizationNavbar,
      isLoadedWelcomePageSettings,
    } = common;

    const {
      isBurgerLoading,
      setIsBurgerLoading,
      enablePortalRename,
      deviceType,
    } = settingsStore;

    return {
      isLoadedArticleBody,
      isLoadedSectionHeader,
      isLoadedSubmenu,
      isLoadedLngTZSettings,
      isLoadedDNSSettings,
      isLoadedCustomizationNavbar,
      isLoadedWelcomePageSettings,
      isBurgerLoading,
      setIsBurgerLoading,
      enablePortalRename,
      deviceType,
    };
  })(observer(LoaderWrapper));
};
export default withLoading;
