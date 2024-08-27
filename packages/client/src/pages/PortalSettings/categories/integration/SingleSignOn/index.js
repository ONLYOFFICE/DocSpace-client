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

import { useEffect } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Box } from "@docspace/shared/components/box";
import { Text } from "@docspace/shared/components/text";

import HideButton from "./sub-components/HideButton";
import SPSettings from "./SPSettings";
import ProviderMetadata from "./ProviderMetadata";
import StyledSsoPage from "./styled-containers/StyledSsoPageContainer";
import StyledSettingsSeparator from "SRC_DIR/pages/PortalSettings/StyledSettingsSeparator";
import ToggleSSO from "./sub-components/ToggleSSO";
import SSOLoader from "./sub-components/ssoLoader";

import MobileView from "./MobileView";
import { DeviceType } from "@docspace/shared/enums";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";

const SERVICE_PROVIDER_SETTINGS = "serviceProviderSettings";
const SP_METADATA = "spMetadata";

const SingleSignOn = (props) => {
  const {
    init,
    serviceProviderSettings,
    spMetadata,
    isSSOAvailable,
    isInit,
    currentDeviceType,
  } = props;
  const { t, ready } = useTranslation(["SingleSignOn", "Settings"]);
  const isMobileView = currentDeviceType === DeviceType.mobile;

  useEffect(() => {
    isSSOAvailable && !isInit && init();
  }, []);

  useEffect(() => {
    if (ready) setDocumentTitle(t("Settings:SingleSignOn"));
  }, [ready]);

  if (!isInit && !isMobileView && isSSOAvailable) return <SSOLoader />;

  return (
    <StyledSsoPage
      hideSettings={serviceProviderSettings}
      hideMetadata={spMetadata}
    >
      <Text className="intro-text settings_unavailable" noSelect>
        {t("SsoIntro")}
      </Text>

      {isMobileView ? (
        <MobileView isSSOAvailable={isSSOAvailable} />
      ) : (
        <>
          <ToggleSSO />

          <HideButton
            id="sp-settings-hide-button"
            text={t("ServiceProviderSettings", {
              organizationName: t("Common:OrganizationName"),
            })}
            label={SERVICE_PROVIDER_SETTINGS}
            value={serviceProviderSettings}
            //isDisabled={!isSSOAvailable}
          />

          <SPSettings />
          <StyledSettingsSeparator />

          <HideButton
            id="sp-metadata-hide-button"
            text={t("SpMetadata", {
              organizationName: t("Common:OrganizationName"),
            })}
            label={SP_METADATA}
            value={spMetadata}
            //isDisabled={!isSSOAvailable}
          />

          <Box className="sp-metadata">
            <ProviderMetadata />
          </Box>
        </>
      )}
    </StyledSsoPage>
  );
};

export default inject(
  ({ authStore, settingsStore, ssoStore, currentQuotaStore }) => {
    const { isSSOAvailable } = currentQuotaStore;
    const { currentDeviceType } = settingsStore;

    const { init, serviceProviderSettings, spMetadata, isInit } = ssoStore;

    return {
      init,
      serviceProviderSettings,
      spMetadata,
      isSSOAvailable,
      isInit,
      currentDeviceType,
    };
  },
)(observer(SingleSignOn));
