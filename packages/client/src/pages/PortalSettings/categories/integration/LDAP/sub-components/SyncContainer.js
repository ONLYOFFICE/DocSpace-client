import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import {Box} from "@docspace/shared/components/box";
import {Text} from "@docspace/shared/components/text";
import {Button} from "@docspace/shared/components/button";
import {Cron} from "@docspace/shared/components/cron";

import ProgressContainer from "./ProgressContainer";
import ToggleAutoSync from "./ToggleAutoSync";
import { DeviceType } from "@docspace/common/constants";
import StyledLdapPage from "../styled-components/StyledLdapPage";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import { onChangeUrl } from "../utils";
import { useNavigate } from "react-router-dom";
import { isMobile } from "@docspace/shared/utils/device";

const SyncContainer = ({
  isLdapAvailable,
  isLdapEnabled,
  isMobileView,
  syncLdap,
  onChangeCron,
  cron,
  nextSyncDate,
  theme,
}) => {
  const { t } = useTranslation(["Ldap", "Common"]);
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

  const renderBody = () => (
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
              {`${t("LdapNextSync")}: ${nextSyncDate
                .toUTC()
                .toFormat("DDDD tt")}`}
            </Text>
          )}
          <Button
            tabIndex={-1}
            className="manual-sync-button"
            size="normal"
            primary
            // onClick={syncLdap} TODO: add saving logic
            label={t("Common:SaveButton")}
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

export default inject(({ auth, ldapStore }) => {
  const { currentQuotaStore, settingsStore } = auth;
  const { currentDeviceType, theme } = settingsStore;
  const { isLdapAvailable } = currentQuotaStore;
  const { isLdapEnabled, syncLdap, onChangeCron, cron, nextSyncDate } =
    ldapStore;

  const isMobileView = currentDeviceType === DeviceType.mobile;

  return {
    isLdapAvailable,
    isLdapEnabled,
    isMobileView,
    syncLdap,
    onChangeCron,
    cron,
    nextSyncDate,
    theme,
  };
})(observer(SyncContainer));
