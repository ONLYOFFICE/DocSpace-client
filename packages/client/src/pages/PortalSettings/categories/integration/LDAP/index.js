import React from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import Text from "@docspace/components/text";
import Box from "@docspace/components/box";
import Link from "@docspace/components/link";

import StyledLdapPage from "./styled-components/StyledLdapPage";
import ToggleLDAP from "./sub-components/ToggleLDAP";

const LDAP = ({ ldapSettingsUrl, theme, currentColorScheme }) => {
  const { t } = useTranslation(["Ldap", "Settings", "Common"]);
  return (
    <StyledLdapPage theme={theme}>
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

      <ToggleLDAP isLDAPAvailable={true} />
    </StyledLdapPage>
  );
};

export default inject(({ auth }) => {
  const { settingsStore } = auth;
  const { ldapSettingsUrl, theme, currentColorScheme } = settingsStore;
  return {
    ldapSettingsUrl,
    theme,
    currentColorScheme,
  };
})(observer(LDAP));
