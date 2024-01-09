import React, { useState, useEffect } from "react";
import { isMobile, isDesktop } from "react-device-detect";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import Text from "@docspace/components/text";
import Box from "@docspace/components/box";
import Link from "@docspace/components/link";
import { DeviceType } from "@docspace/common/constants";

import BreakpointWarning from "SRC_DIR/components/BreakpointWarning";

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

const LDAP = ({
  ldapSettingsUrl,
  theme,
  currentColorScheme,
  isLdapAvailable,
  isSettingsShown,
  load,
  isMobileView,
}) => {
  const { t } = useTranslation(["Ldap", "Settings", "Common"]);
  const [isSmallWindow, setIsSmallWindow] = useState(false);

  useEffect(() => {
    isLdapAvailable && load();
    onCheckView();
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
        <LdapMobileView />
      ) : (
        <>
          <HideButton
            text={t("Settings:LDAP")}
            value={isSettingsShown}
            isDisabled={!isLdapAvailable}
          />

          {isSettingsShown && (
            <>
              <Box>
                <Text>{t("LdapDisclaimer")}</Text>
                <Checkboxes />
              </Box>

              <ConnectionSettings />
              <AttributeMapping />
              <GroupMembership />
              <AuthenticationContainer />
              <AdvancedSettings />
              <ButtonsContainer />
            </>
          )}

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
  const { isSettingsShown, load } = ldapStore;

  const isMobileView = currentDeviceType === DeviceType.mobile;

  return {
    ldapSettingsUrl,
    theme,
    currentColorScheme,
    isLdapAvailable,
    isSettingsShown,
    load,
    isMobileView,
  };
})(observer(LDAP));
