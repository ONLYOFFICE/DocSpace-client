import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Box } from "@docspace/shared/components/box";
import { Text } from "@docspace/shared/components/text";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { Cron } from "@docspace/shared/components/cron";
import { toastr } from "@docspace/shared/components/toast";

import ProgressContainer from "./ProgressContainer";
import ToggleAutoSync from "./ToggleAutoSync";
import { DeviceType, LDAPOperation } from "@docspace/shared/enums";
import StyledLdapPage from "../styled-components/StyledLdapPage";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import { onChangeUrl } from "../utils";
import { useNavigate } from "react-router-dom";
import { isMobile, isDesktop } from "@docspace/shared/utils/device";

const SyncContainer = ({
  isMobileView,
  syncLdap,
  saveCronLdap,
  onChangeCron,
  cron,
  serverCron,
  nextSyncDate,
  theme,

  isLdapEnabled,
  isUIDisabled,
  isLdapAvailable,
}) => {
  const { t } = useTranslation(["Ldap", "Common", "Settings"]);
  const navigate = useNavigate();

  React.useEffect(() => {
    setDocumentTitle(t("Ldap:LdapSyncTitle"));
    onCheckView();
    window.addEventListener("resize", onCheckView);

    return () => window.removeEventListener("resize", onCheckView);
  }, []);

  const onCheckView = () => {
    if (!isMobile()) {
      const newUrl = onChangeUrl();
      if (newUrl) navigate(newUrl);
    }
  };

  const onSaveClick = React.useCallback(() => {
    saveCronLdap()
      .then(() => toastr.success(t("Settings:SuccessfullySaveSettingsMessage")))
      .catch((e) => toastr.error(e));
  }, []);

  const onSync = React.useCallback(() => {
    syncLdap(t).catch((e) => toastr.error(e));
  }, []);

  const buttonSize = isDesktop() ? ButtonSize.small : ButtonSize.normal;

  const renderBody = () => (
    <Box className="ldap_sync-container">
      {!isMobileView && (
        <Text
          fontSize="16px"
          fontWeight={700}
          lineHeight="24px"
          noSelect
          className="settings_unavailable"
        >
          {t("LdapSyncTitle")}
        </Text>
      )}
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
        size={buttonSize}
        primary
        onClick={onSync}
        label={t("LdapSyncButton")}
        //minwidth={displaySettings && "auto"}
        //isLoading={isSaving}
        isDisabled={!isLdapEnabled || isUIDisabled}
      />

      <ProgressContainer operation={LDAPOperation.Sync} />

      <ToggleAutoSync />

      {cron && (
        <>
          {" "}
          <Text
            fontSize="13px"
            fontWeight={400}
            lineHeight="20px"
            className="ldap_cron-title"
            noSelect
          >
            {t("LdapSyncCronTitle")}
          </Text>
          <div className="ldap_cron-container">
            <Cron
              value={cron}
              setValue={onChangeCron}
              isDisabled={!isLdapEnabled || isUIDisabled}
            />
          </div>
          <Text
            fontSize="12px"
            fontWeight={600}
            lineHeight="16px"
            // color={"#A3A9AE"}
            noSelect
          >
            {`${t("LdapNextSync")}: ${nextSyncDate.toFormat("DDDD tt")} UTC`}
          </Text>
          <Button
            tabIndex={-1}
            className="auto-sync-button"
            size="normal"
            primary
            onClick={onSaveClick}
            label={t("Common:SaveButton")}
            isDisabled={!isLdapEnabled || isUIDisabled || cron === serverCron}
          />
        </>
      )}
    </Box>
  );

  if (isMobileView) {
    return (
      <StyledLdapPage
        isMobileView={isMobileView}
        theme={theme}
        isSettingPaid={isLdapAvailable}
      >
        {renderBody()}
      </StyledLdapPage>
    );
  }

  return <>{renderBody()}</>;
};

export default inject(({ currentQuotaStore, settingsStore, ldapStore }) => {
  const { isLdapAvailable } = currentQuotaStore;
  const { currentDeviceType, theme } = settingsStore;
  const {
    syncLdap,
    saveCronLdap,
    onChangeCron,
    cron,
    serverCron,
    nextSyncDate,

    isLdapEnabled,
    isUIDisabled,
  } = ldapStore;

  const isMobileView = currentDeviceType === DeviceType.mobile;

  return {
    isMobileView,
    syncLdap,
    saveCronLdap,
    onChangeCron,
    cron,
    serverCron,
    nextSyncDate,
    theme,

    isLdapEnabled,
    isUIDisabled,
    isLdapAvailable,
  };
})(observer(SyncContainer));
