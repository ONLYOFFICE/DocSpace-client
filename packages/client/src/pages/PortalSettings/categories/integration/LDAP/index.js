// (c) Copyright Ascensio System SIA 2009-2024
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
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Text } from "@docspace/shared/components/text";
import { Box } from "@docspace/shared/components/box";
import { Link } from "@docspace/shared/components/link";
import { DeviceType } from "@docspace/shared/enums";

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
}) => {
  const { t } = useTranslation(["Ldap", "Settings", "Common"]);
  const [isSmallWindow, setIsSmallWindow] = useState(false);

  const onCheckView = () => {
    if (isDesktop && window.innerWidth < 795) {
      setIsSmallWindow(true);
    } else {
      setIsSmallWindow(false);
    }
  };

  useEffect(() => {
    isLdapAvailable && load(t);
    onCheckView();
    setDocumentTitle(t("Ldap:LdapSettings"));
    window.addEventListener("resize", onCheckView);

    return () => window.removeEventListener("resize", onCheckView);
  }, [isLdapAvailable, load, t]);

  if (!isLoaded && isLdapAvailable) return <LdapLoader />;
  return (
    <StyledLdapPage isSmallWindow={isSmallWindow}>
      <Text className="intro-text settings_unavailable">{t("LdapIntro")}</Text>
      <Box marginProp="8px 0 24px 0">
        <Link
          color={currentColorScheme.main.accent}
          isHovered
          target="_blank"
          href={ldapSettingsUrl}
        >
          {t("Common:LearnMore")}
        </Link>
      </Box>

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
  const { ldapSettingsUrl, currentColorScheme, currentDeviceType } =
    settingsStore;
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
  };
})(observer(LDAP));
