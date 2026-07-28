/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router";
import { isMobile } from "@docspace/ui-kit/utils/device";

import { DeviceType, LDAPOperation } from "@docspace/shared/enums";
import { Text } from "@docspace/ui-kit/components/text";

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

import StyledLdapPage from "../styled-containers/StyledLdapPage";

import { onChangeUrl } from "../utils";

const SettingsContainer = ({
  isSettingsShown,
  isLdapAvailable,
  isMobileView,
  isCertificateDialogVisible,
  isLoaded,
  load,
}) => {
  const { t, ready } = useTranslation(["Ldap", "Settings", "Common"]);
  const navigate = useNavigate();

  const onCheckView = () => {
    if (!isMobile()) {
      const newUrl = onChangeUrl();
      if (newUrl) navigate(newUrl);
    }
  };

  useEffect(() => {
    isLdapAvailable && isMobileView && !isLoaded && load(t);
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

  if (!ready) return null;

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
