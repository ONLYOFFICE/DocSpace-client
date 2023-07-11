import React from "react";
import { useTranslation } from "react-i18next";
import StyledLdapPage from "./styled-components/StyledLdapPage";
import Text from "@docspace/components/text";

const LDAP = () => {
  const { t } = useTranslation(["Ldap", "Settings"]);
  return (
    <StyledLdapPage>
      <Text
        className="intro-text settings_unavailable"
        lineHeight="20px"
        noSelect
      >
        {t("LdapIntro")}
      </Text>
    </StyledLdapPage>
  );
};

export default LDAP;
