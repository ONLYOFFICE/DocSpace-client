import React, { useEffect } from "react";

import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router-dom";
import { isMobile } from "@docspace/shared/utils/device";

import { DeviceType, LDAPOperation } from "@docspace/shared/enums";
import { Box } from "@docspace/shared/components/box";
import { Text } from "@docspace/shared/components/text";

import HideButton from "./HideButton";
import Checkboxes from "./Checkboxes";
import ConnectionSettings from "./ConnectionSettings";
import AttributeMapping from "./AttributeMapping";
import ButtonsContainer from "./ButtonsContainer";
import AuthenticationContainer from "./AuthenticationContainer";
import AdvancedSettings from "./AdvancedSettings";
import ProgressContainer from "./ProgressContainer";
import GroupMembership from "./GroupMembership";

import CertificateDialog from "./CertificateDialog";
import ToggleLDAP from "./ToggleLDAP";

import StyledLdapPage from "../styled-components/StyledLdapPage";

import { onChangeUrl } from "../utils";

import { setDocumentTitle } from "SRC_DIR/helpers/utils";

const SettingsContainer = ({
  isSettingsShown,
  isLdapAvailable,
  isMobileView,
  isCertificateDialogVisible,
  isLoaded,
  load,
}) => {
  const { t } = useTranslation(["Ldap", "Settings", "Common"]);
  const navigate = useNavigate();

  useEffect(() => {
    isLdapAvailable && isMobileView && !isLoaded && load();
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
      {!isMobileView && (
        <HideButton
          text={t("Settings:LDAP")}
          value={isSettingsShown}
          isDisabled={!isLdapAvailable}
        />
      )}

      {isMobileView && <ToggleLDAP />}

      {(isMobileView || isSettingsShown) && (
        <>
          <Box>
            <Text className="ldap-disclaimer">{t("LdapDisclaimer")}</Text>
            <Checkboxes />
          </Box>

          <ConnectionSettings />
          <AttributeMapping />
          <GroupMembership />
          <AuthenticationContainer />
          <AdvancedSettings />
          <ButtonsContainer />

          <ProgressContainer operation={LDAPOperation.SaveAndSync} />

          {isCertificateDialogVisible && <CertificateDialog />}
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

export default inject(({ settingsStore, currentQuotaStore, ldapStore }) => {
  const { isLdapAvailable } = currentQuotaStore;
  const { currentDeviceType, theme } = settingsStore;
  const { isSettingsShown, isCertificateDialogVisible, isLoaded, load } =
    ldapStore;

  const isMobileView = currentDeviceType === DeviceType.mobile;

  return {
    isLdapAvailable,
    isSettingsShown,
    isMobileView,
    theme,
    isCertificateDialogVisible,
    isLoaded,
    load,
  };
})(observer(SettingsContainer));
