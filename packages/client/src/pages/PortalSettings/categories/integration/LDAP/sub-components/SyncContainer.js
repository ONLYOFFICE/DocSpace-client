import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import Box from "@docspace/components/box";
import Text from "@docspace/components/text";
import Button from "@docspace/components/button";

import ProgressContainer from "./ProgressContainer";
import ToggleAutoSync from "./ToggleAutoSync";

const SyncContainer = ({ isLdapAvailable, isLdapEnabled, syncLdap }) => {
  const { t } = useTranslation(["Ldap", "Common"]);

  return (
    <Box className="ldap_sync-container">
      <Text
        fontSize="16px"
        fontWeight={700}
        lineHeight="24px"
        noSelect
        className="settings_unavailable"
      >
        {t("LdapSyncTitle")}
      </Text>
      <Text
        fontSize="12px"
        fontWeight={400}
        lineHeight="16px"
        noSelect
        className="settings_unavailable sync-description"
      >
        {t("LdapSyncDescription")}
      </Text>

      <Button
        tabIndex={-1}
        className="manual-sync-button"
        size="normal"
        isDisabled={!isLdapAvailable && isLdapEnabled}
        primary
        onClick={syncLdap}
        label={t("LdapSyncButton")}
        //minwidth={displaySettings && "auto"}
        //isLoading={isSaving}
      />

      <ProgressContainer />

      <ToggleAutoSync isLDAPAvailable={isLdapAvailable} />
    </Box>
  );
};

export default inject(({ auth, ldapStore }) => {
  const { currentQuotaStore } = auth;
  const { isLdapAvailable } = currentQuotaStore;
  const { isLdapEnabled, syncLdap } = ldapStore;

  return {
    isLdapAvailable,
    isLdapEnabled,
    syncLdap,
  };
})(observer(SyncContainer));
