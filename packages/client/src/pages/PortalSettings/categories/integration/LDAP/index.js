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

import { useState, useEffect } from "react";
import { isDesktop } from "react-device-detect";
import { useTranslation, Trans } from "react-i18next";
import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router";
import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";
import { DeviceType } from "@docspace/shared/enums";
import { isMobile } from "@docspace/shared/utils/device";

import StyledSettingsSeparator from "SRC_DIR/pages/PortalSettings/StyledSettingsSeparator";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import StyledLdapPage from "./styled-components/StyledLdapPage";

import ToggleLDAP from "./sub-components/ToggleLDAP";
import { SyncContainerSection } from "./sub-components/SyncContainer";
import LdapMobileView from "./sub-components/LdapMobileView";
import { SettingsContainerSection } from "./sub-components/SettingsContainer";
import LdapLoader from "./sub-components/LdapLoader";

const LDAP = ({
  ldapSettingsUrl,
  currentColorScheme,
  isLdapAvailable,
  load,
  isMobileView,
  isLdapEnabled,
  isLoaded,
  setScrollToSettings,
}) => {
  const { t } = useTranslation(["Ldap", "Settings", "Common"]);
  const [isSmallWindow, setIsSmallWindow] = useState(false);
  const navigate = useNavigate();

  const onCheckView = () => {
    if (isDesktop && window.innerWidth < 795) {
      setIsSmallWindow(true);
    } else {
      setIsSmallWindow(false);
    }
  };

  const onGoToInvitationSettings = () => {
    if (!isMobile()) setScrollToSettings(true);
    navigate(`/portal-settings/security/access-portal/invitation-settings`);
  };

  useEffect(() => {
    isLdapAvailable && load(t);
    onCheckView();
    setDocumentTitle(t("Ldap:LdapSettings"));
    window.addEventListener("resize", onCheckView);

    return () => window.removeEventListener("resize", onCheckView);
  }, [isLdapAvailable, load, t]);

  if (!isLoaded && isLdapAvailable) return <LdapLoader />;

  const link = `${`${t("Settings:ManagementCategorySecurity")} > ${t("Settings:InvitationSettings")}.`}`;

  return (
    <StyledLdapPage isSmallWindow={isSmallWindow}>
      <Text className="intro-text settings_unavailable">
        <Trans
          t={t}
          i18nKey="LdapIntegrationDescription"
          ns="Ldap"
          values={{
            productName: t("Common:ProductName"),
            sectionName: t("Common:Contacts"),
            link,
          }}
          components={{
            1: (
              <Link
                fontSize="13px"
                fontWeight="600"
                lineHeight="20px"
                color={currentColorScheme?.main?.accent}
                isHovered
                onClick={onGoToInvitationSettings}
              />
            ),
          }}
        />
      </Text>
      <div className="settings_unavailable-box">
        {ldapSettingsUrl ? (
          <Link
            color={currentColorScheme.main.accent}
            isHovered
            target="_blank"
            href={ldapSettingsUrl}
          >
            {t("Common:LearnMore")}
          </Link>
        ) : null}
      </div>

      {isMobileView ? (
        <LdapMobileView
          isLdapEnabled={isLdapEnabled}
          isLDAPAvailable={isLdapAvailable}
        />
      ) : (
        <>
          <ToggleLDAP />

          <SettingsContainerSection />

          <StyledSettingsSeparator />

          <SyncContainerSection />
        </>
      )}
    </StyledLdapPage>
  );
};

export default inject(({ ldapStore, settingsStore, currentQuotaStore }) => {
  const { isLdapAvailable } = currentQuotaStore;
  const {
    ldapSettingsUrl,
    currentColorScheme,
    currentDeviceType,
    setScrollToSettings,
  } = settingsStore;
  const { load, isLdapEnabled, isLoaded } = ldapStore;

  const isMobileView = currentDeviceType === DeviceType.mobile;

  return {
    ldapSettingsUrl,
    currentColorScheme,
    isLdapAvailable,
    load,
    isMobileView,
    isLdapEnabled,
    isLoaded,
    setScrollToSettings,
  };
})(observer(LDAP));
