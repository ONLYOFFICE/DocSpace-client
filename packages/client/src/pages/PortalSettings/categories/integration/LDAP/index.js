import React, { useState, useEffect } from "react";
import { isMobile, isDesktop } from "react-device-detect";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import Text from "@docspace/components/text";
import Box from "@docspace/components/box";
import Link from "@docspace/components/link";

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
import GroupMembership from './sub-components/GroupMembership';

const LDAP = ({
  ldapSettingsUrl,
  theme,
  currentColorScheme,
  isLdapAvailable,
  isSettingsShown,
  load,
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

  if (isSmallWindow)
    return <BreakpointWarning sectionName={t("Settings:LDAP")} isSmallWindow />;

  if (isMobile) return <BreakpointWarning sectionName={t("Settings:LDAP")} />;

  return (
    <StyledLdapPage theme={theme} isSettingPaid={isLdapAvailable}>
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
    </StyledLdapPage>
  );
};

export default inject(({ auth, ldapStore }) => {
  const { settingsStore, currentQuotaStore } = auth;
  const { isLdapAvailable } = currentQuotaStore;
  const { ldapSettingsUrl, theme, currentColorScheme } = settingsStore;
  const { isSettingsShown, load } = ldapStore;
  return {
    ldapSettingsUrl,
    theme,
    currentColorScheme,
    isLdapAvailable,
    isSettingsShown,
    load,
  };
})(observer(LDAP));
