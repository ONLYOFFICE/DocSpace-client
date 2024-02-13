import React, { useEffect, useState } from "react";
import { observer, inject } from "mobx-react";
import { isMobile } from "@docspace/shared/utils";

const withLoading = (WrappedComponent) => {
  const withLoading = (props) => {
    const {
      isLoadedArticleBody,
      isLoadedSectionHeader,
      isLoadedSubmenu,
      isLoadedLngTZSettings,
      isLoadedDNSSettings,
      isLoadedPortalRenaming,
      isLoadedCustomization,
      isLoadedCustomizationNavbar,
      isLoadedWelcomePageSettings,
      isBurgerLoading,
      setIsBurgerLoading,
      enablePortalRename,
    } = props;

    const [mobileView, setMobileView] = useState(true);

    useEffect(() => {
      if (window.location.pathname.includes("profile")) {
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

    useEffect(() => {
      window.addEventListener("resize", checkInnerWidth);

      return () => window.removeEventListener("resize", checkInnerWidth);
    }, []);

    const checkInnerWidth = () => {
      if (isMobile()) {
        setMobileView(true);
      } else {
        setMobileView(false);
      }
    };

    const pathname = location.pathname;
    const index = pathname.lastIndexOf("/");
    const setting = pathname.slice(index + 1);

    const viewMobile = !!(isMobile() && mobileView);

    const loadedPortalRenaming = enablePortalRename
      ? isLoadedPortalRenaming
      : true;

    const isLoadedCustomizationSettings =
      isLoadedCustomization &&
      isLoadedLngTZSettings &&
      isLoadedWelcomePageSettings &&
      isLoadedDNSSettings &&
      loadedPortalRenaming &&
      isLoadedArticleBody &&
      !isBurgerLoading &&
      isLoadedSectionHeader &&
      isLoadedSubmenu;

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
      isLoadedPortalRenaming,
      isLoadedCustomization,
      isLoadedCustomizationNavbar,
      isLoadedWelcomePageSettings,
    } = common;

    const { isBurgerLoading, setIsBurgerLoading, enablePortalRename } =
      settingsStore;

    return {
      isLoadedArticleBody,
      isLoadedSectionHeader,
      isLoadedSubmenu,
      isLoadedLngTZSettings,
      isLoadedDNSSettings,
      isLoadedPortalRenaming,
      isLoadedCustomization,
      isLoadedCustomizationNavbar,
      isLoadedWelcomePageSettings,
      isBurgerLoading,
      setIsBurgerLoading,
      enablePortalRename,
    };
  })(observer(withLoading));
};
export default withLoading;
