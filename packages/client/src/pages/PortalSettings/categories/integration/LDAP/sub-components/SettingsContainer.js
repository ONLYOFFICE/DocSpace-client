import React, { useState, useEffect } from "react";

import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { DeviceType } from "@docspace/common/constants";
import HideButton from "./HideButton";
import Checkboxes from "./Checkboxes";
import ConnectionSettings from "./ConnectionSettings";
import AttributeMapping from "./AttributeMapping";
import ButtonsContainer from "./ButtonsContainer";
import AuthenticationContainer from "./AuthenticationContainer";
import AdvancedSettings from "./AdvancedSettings";
import {Box} from "@docspace/shared/components/box";
import {Text} from "@docspace/shared/components/text";
import StyledLdapPage from "../styled-components/StyledLdapPage";
import { useNavigate } from "react-router-dom";
import { isMobile } from "@docspace/shared/utils/device";

import GroupMembership from "./GroupMembership";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import { onChangeUrl } from "../utils";

const SettingsContainer = ({
  isSettingsShown,
  isLdapAvailable,
  isMobileView,
}) => {
  const { t } = useTranslation(["Ldap", "Settings", "Common"]);
  const navigate = useNavigate();

  useEffect(() => {
    setDocumentTitle(t("Ldap:LdapSettings"));
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
    </>
  );

  if (isMobileView)
    return (
      <StyledLdapPage
        isMobileView={isMobileView}
        theme={theme}
        isSettingPaid={isLdapAvailable}
      >
        {renderBody()}
      </StyledLdapPage>
    );

  return <>{renderBody()}</>;
};

export default inject(({ auth, ldapStore }) => {
  const { settingsStore, currentQuotaStore } = auth;
  const { isLdapAvailable } = currentQuotaStore;
  const { currentDeviceType, theme } = settingsStore;
  const { isSettingsShown } = ldapStore;

  const isMobileView = currentDeviceType === DeviceType.mobile;

  return {
    isLdapAvailable,
    isSettingsShown,
    isMobileView,
    theme,
  };
})(observer(SettingsContainer));
