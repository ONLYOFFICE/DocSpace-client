import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import {Checkbox} from "@docspace/shared/components/checkbox";
import {Box} from "@docspace/shared/components/box";
import {Text} from "@docspace/shared/components/text";

const AdvancedSettings = ({ isSendWelcomeEmail, setIsSendWelcomeEmail }) => {
  const { t } = useTranslation("Ldap");

  const onChange = (e) => {
    const checked = e.target.checked;

    setIsSendWelcomeEmail(checked);
  };

  return (
    <Box className="ldap_advanced-settings">
      <Text fontWeight={600} fontSize={"14px"}>
        {t("LdapAdvancedSettings")}
      </Text>

      <Checkbox
        className="checkbox"
        label={t("LdapSendWelcomeLetter")}
        isChecked={isSendWelcomeEmail}
        onChange={onChange}
      />
    </Box>
  );
};

export default inject(({ ldapStore }) => {
  const { setIsSendWelcomeEmail, isSendWelcomeEmail } = ldapStore;
  return {
    setIsSendWelcomeEmail,
    isSendWelcomeEmail,
  };
})(observer(AdvancedSettings));
