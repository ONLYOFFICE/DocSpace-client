import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import {Checkbox} from "@docspace/shared/components/checkbox";
import {Box} from "@docspace/shared/components/box";

const Checkboxes = ({
  isLdapAvailable,
  isTlsEnabled,
  isSslEnabled,
  setIsTlsEnabled,
  setIsSslEnabled,
}) => {
  const { t } = useTranslation("Ldap");

  const onChangeTls = (e) => {
    const checked = e.target.checked;
    isSslEnabled && checked && setIsSslEnabled(false);
    setIsTlsEnabled(checked);
  };

  const onChangeSsl = (e) => {
    const checked = e.target.checked;
    isTlsEnabled && checked && setIsTlsEnabled(false);
    setIsSslEnabled(checked);
  };

  return (
    <Box className="checkbox-container">
      <Checkbox
        tabIndex={1}
        className="checkbox"
        isDisabled={!isLdapAvailable}
        label={t("LdapEnableStartTls")}
        isChecked={isTlsEnabled}
        onChange={onChangeTls}
      />
      <Checkbox
        tabIndex={2}
        className="checkbox"
        isDisabled={!isLdapAvailable}
        label={t("LdapEnableSSL")}
        isChecked={isSslEnabled}
        onChange={onChangeSsl}
      />
    </Box>
  );
};

export default inject(({ auth, ldapStore }) => {
  const { settingsStore, currentQuotaStore } = auth;
  const { isLdapAvailable } = currentQuotaStore;
  const {
    isTlsEnabled,
    isSslEnabled,
    setIsTlsEnabled,
    setIsSslEnabled,
  } = ldapStore;
  return {
    isLdapAvailable,
    isTlsEnabled,
    isSslEnabled,
    setIsTlsEnabled,
    setIsSslEnabled,
  };
})(observer(Checkboxes));
