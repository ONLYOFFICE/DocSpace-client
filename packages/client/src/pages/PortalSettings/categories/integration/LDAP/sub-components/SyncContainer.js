import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import Box from "@docspace/components/box";
import Text from "@docspace/components/text";
import Button from "@docspace/components/button";
import Cron from "@docspace/components/cron";

import ProgressContainer from "./ProgressContainer";
import ToggleAutoSync from "./ToggleAutoSync";

const SyncContainer = ({
  isLdapAvailable,
  isLdapEnabled,
  syncLdap,
  onChangeCron,
  cron,
  nextSyncDate,
}) => {
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

      <Text
        fontSize="13px"
        fontWeight={400}
        lineHeight="20px"
        className="ldap_cron-title"
        noSelect
      >
        {t("Here you can set how often you want to auto sync LDAP users")}
      </Text>

      <div className="ldap_cron-container">
        <Cron value={cron} setValue={onChangeCron} />
      </div>

      {nextSyncDate && (
        <Text
          fontSize="12px"
          fontWeight={600}
          lineHeight="16px"
          color={"#A3A9AE"}
          noSelect
        >
          {`${t("Next synchronization")}: ${nextSyncDate
            .toUTC()
            .toFormat("DDDD tt")}`}
        </Text>
      )}
    </Box>
  );
};

export default inject(({ auth, ldapStore }) => {
  const { currentQuotaStore } = auth;
  const { isLdapAvailable } = currentQuotaStore;
  const { isLdapEnabled, syncLdap, onChangeCron, cron, nextSyncDate } =
    ldapStore;

  return {
    isLdapAvailable,
    isLdapEnabled,
    syncLdap,
    onChangeCron,
    cron,
    nextSyncDate,
  };
})(observer(SyncContainer));
