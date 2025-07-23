// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router";
import { isMobile } from "@docspace/shared/utils/device";

import { DeviceType, LDAPOperation } from "@docspace/shared/enums";
import { Text } from "@docspace/shared/components/text";

import { setDocumentTitle } from "SRC_DIR/helpers/utils";
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

  const onCheckView = () => {
    if (!isMobile()) {
      const newUrl = onChangeUrl();
      if (newUrl) navigate(newUrl);
    }
  };

  useEffect(() => {
    isLdapAvailable && isMobileView && !isLoaded && load();
    isMobileView && setDocumentTitle(t("Ldap:LdapSettings"));
    onCheckView();
    window.addEventListener("resize", onCheckView);

    return () => window.removeEventListener("resize", onCheckView);
  }, []);

  const renderBody = () => (
    <>
      {!isMobileView ? (
        <HideButton text={t("Settings:LDAP")} value={isSettingsShown} />
      ) : null}

      {isMobileView ? <ToggleLDAP /> : null}

      {isMobileView || isSettingsShown ? (
        <>
          <div>
            <Text className="ldap-disclaimer">{t("LdapDisclaimer")}</Text>
            <Checkboxes />
          </div>

          <ConnectionSettings />
          <AttributeMapping />
          <GroupMembership />
          <AuthenticationContainer />
          <AdvancedSettings />
          <ButtonsContainer />

          {!isMobileView ? (
            <ProgressContainer operation={LDAPOperation.SaveAndSync} />
          ) : null}

          {isCertificateDialogVisible ? <CertificateDialog /> : null}
        </>
      ) : null}
    </>
  );

  if (isMobileView)
    return (
      <StyledLdapPage
        isMobileView={isMobileView}
        isSettingPaid={isLdapAvailable}
      >
        {renderBody()}
      </StyledLdapPage>
    );

  return <>{renderBody()}</>;
};

export const SettingsContainerSection = inject(
  ({ settingsStore, currentQuotaStore, ldapStore }) => {
    const { isLdapAvailable } = currentQuotaStore;
    const { currentDeviceType } = settingsStore;
    const { isSettingsShown, isCertificateDialogVisible, isLoaded, load } =
      ldapStore;

    const isMobileView = currentDeviceType === DeviceType.mobile;

    return {
      isLdapAvailable,
      isSettingsShown,
      isMobileView,
      isCertificateDialogVisible,
      isLoaded,
      load,
    };
  },
)(observer(SettingsContainer));
