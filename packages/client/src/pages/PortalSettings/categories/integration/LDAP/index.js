import React, { useState, useEffect } from "react";
import { isMobile, isDesktop } from "react-device-detect";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import {Text} from "@docspace/shared/components/text";
import {Box} from "@docspace/shared/components/box";
import {Link} from "@docspace/shared/components/link";
import { DeviceType } from "@docspace/common/constants";


import StyledLdapPage from "./styled-components/StyledLdapPage";
import StyledSettingsSeparator from "SRC_DIR/pages/PortalSettings/StyledSettingsSeparator";

import ToggleLDAP from "./sub-components/ToggleLDAP";
import HideButton from "./sub-components/HideButton";
import Checkboxes from "./sub-components/Checkboxes";
import ConnectionSettings from "./sub-components/ConnectionSettings";
import AttributeMapping from "./sub-components/AttributeMapping";
import ButtonsContainer from "./sub-components/ButtonsContainer";
import AuthenticationContainer from "./sub-components/AuthenticationContainer";
import AdvancedSettings from "./sub-components/AdvancedSettings";
import SyncContainer from "./sub-components/SyncContainer";
import GroupMembership from "./sub-components/GroupMembership";
import LdapMobileView from "./sub-components/LdapMobileView";
import SettingsContainer from "./sub-components/SettingsContainer";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";

const LDAP = ({
  ldapSettingsUrl,
  theme,
  currentColorScheme,
  isLdapAvailable,
  load,
  isMobileView,
  isLdapEnabled,
}) => {
  const { t } = useTranslation(["Ldap", "Settings", "Common"]);
  const [isSmallWindow, setIsSmallWindow] = useState(false);

  useEffect(() => {
    isLdapAvailable && load();
    onCheckView();
    setDocumentTitle(t("Settings:ManagementCategoryIntegration"));
    window.addEventListener("resize", onCheckView);

    return () => window.removeEventListener("resize", onCheckView);
  }, []);

  const onCheckView = () => {
    if (isDesktop && window.innerWidth < 795) {
      setIsSmallWindow(true);
    } else {
      setIsSmallWindow(false);
    }
  };

  return (
    <StyledLdapPage
      isSmallWindow={isSmallWindow}
      theme={theme}
      isSettingPaid={isLdapAvailable}
    >
      <Text className="intro-text settings_unavailable">{t("LdapIntro")}</Text>
      <Box marginProp="8px 0 24px 0">
        <Link
          color={currentColorScheme.main.accent}
          isHovered
          target="_blank"
          href={ldapSettingsUrl}
        >
          {t("Common:LearnMore")}
        </Link>
      </Box>

      <ToggleLDAP isLDAPAvailable={isLdapAvailable} />

      {isMobileView ? (
        <LdapMobileView isLdapEnabled={isLdapEnabled} />
      ) : (
        <>
          <SettingsContainer />

          <StyledSettingsSeparator />

          <SyncContainer />
        </>
      )}
    </StyledLdapPage>
  );
};

export default inject(({ auth, ldapStore }) => {
  const { settingsStore, currentQuotaStore } = auth;
  const { isLdapAvailable } = currentQuotaStore;
  const { ldapSettingsUrl, theme, currentColorScheme, currentDeviceType } =
    settingsStore;
  const { load, isLdapEnabled } = ldapStore;

  const isMobileView = currentDeviceType === DeviceType.mobile;

  return {
    ldapSettingsUrl,
    theme,
    currentColorScheme,
    isLdapAvailable,
    load,
    isMobileView,
    isLdapEnabled,
  };
})(observer(LDAP));
