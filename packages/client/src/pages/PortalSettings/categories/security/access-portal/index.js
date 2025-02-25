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
import { Trans, withTranslation } from "react-i18next";
import { Text } from "@docspace/shared/components/text";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import StyledSettingsSeparator from "SRC_DIR/pages/PortalSettings/StyledSettingsSeparator";

import { inject, observer } from "mobx-react";
import { Link } from "@docspace/shared/components/link";
import { DeviceType } from "@docspace/shared/enums";
import { MainContainer } from "../StyledSecurity";
import { TfaSection } from "./tfa";
import { PasswordStrengthSection } from "./passwordStrength";
import { TrustedMailSection } from "./trustedMail";
import { IpSecuritySection } from "./ipSecurity";
import { AdminMessageSection } from "./adminMessage";
import { SessionLifetimeSection } from "./sessionLifetime";
import { BruteForceProtectionSection } from "./bruteForceProtection";
import MobileView from "./mobileView";

const AccessPortal = (props) => {
  const {
    t,
    currentColorScheme,
    passwordStrengthSettingsUrl,
    tfaSettingsUrl,
    trustedMailDomainSettingsUrl,
    administratorMessageSettingsUrl,
    lifetimeSettingsUrl,
    ipSettingsUrl,
    isMobileView,
    resetIsInit,
  } = props;

  useEffect(() => {
    setDocumentTitle(
      t("PortalAccess", { productName: t("Common:ProductName") }),
    );

    return () => resetIsInit();
  }, []);

  if (isMobileView) return <MobileView />;
  return (
    <MainContainer className="desktop-view">
      <Text className="subtitle">{t("PortalSecurityTitle")}</Text>

      <Text fontSize="16px" fontWeight="700">
        {t("SettingPasswordTittle")}
      </Text>

      <div className="category-item-description">
        <Text fontSize="13px" fontWeight="400">
          {t("SettingPasswordDescription")}
        </Text>
        <Text fontSize="13px" fontWeight="400">
          <Trans t={t} i18nKey="SaveToApply" />
        </Text>
        <Link
          className="link-learn-more"
          target="_blank"
          isHovered
          color={currentColorScheme.main?.accent}
          href={passwordStrengthSettingsUrl}
        >
          {t("Common:LearnMore")}
        </Link>
      </div>

      <PasswordStrengthSection />
      <StyledSettingsSeparator />
      <Text fontSize="16px" fontWeight="700">
        {t("TwoFactorAuth")}
      </Text>

      <div className="category-item-description">
        <Text fontSize="13px" fontWeight="400">
          {t("TwoFactorAuthEnableDescription", {
            productName: t("Common:ProductName"),
          })}
        </Text>
        <Text fontSize="13px" fontWeight="400">
          <Trans t={t} i18nKey="TwoFactorAuthSave" />
        </Text>
        <Link
          className="link-learn-more"
          target="_blank"
          isHovered
          color={currentColorScheme.main?.accent}
          href={tfaSettingsUrl}
        >
          {t("Common:LearnMore")}
        </Link>
      </div>

      <TfaSection />
      <StyledSettingsSeparator />

      <Text fontSize="16px" fontWeight="700">
        {t("TrustedMail")}
      </Text>
      <div className="category-item-description">
        <Text fontSize="13px" fontWeight="400">
          {t("TrustedMailSettingDescription")}
        </Text>
        <Text fontSize="13px" fontWeight="400">
          <Trans t={t} i18nKey="SaveToApply" />
        </Text>
        <Link
          className="link-learn-more"
          target="_blank"
          isHovered
          color={currentColorScheme.main?.accent}
          href={trustedMailDomainSettingsUrl}
        >
          {t("Common:LearnMore")}
        </Link>
      </div>

      <TrustedMailSection />
      <StyledSettingsSeparator />
      <Text fontSize="16px" fontWeight="700">
        {t("IPSecurity")}
      </Text>
      <div className="category-item-description">
        <Text fontSize="13px" fontWeight="400">
          {t("IPSecuritySettingDescription")}
        </Text>

        <Link
          className="link-learn-more"
          target="_blank"
          isHovered
          color={currentColorScheme.main?.accent}
          href={ipSettingsUrl}
        >
          {t("Common:LearnMore")}
        </Link>
      </div>

      <IpSecuritySection />

      <StyledSettingsSeparator />

      <Text fontSize="16px" fontWeight="700">
        {t("BruteForceProtection")}
      </Text>

      <BruteForceProtectionSection />

      <StyledSettingsSeparator />

      <Text fontSize="16px" fontWeight="700">
        {t("AdminsMessage")}
      </Text>
      <div className="category-item-description">
        <Text fontSize="13px" fontWeight="400">
          {t("AdminsMessageSettingDescription", {
            productName: t("Common:ProductName"),
          })}
        </Text>
        <Text fontSize="13px" fontWeight="400">
          <Trans t={t} i18nKey="SaveToApply" />
        </Text>

        <Link
          className="link-learn-more"
          target="_blank"
          isHovered
          color={currentColorScheme.main?.accent}
          href={administratorMessageSettingsUrl}
        >
          {t("Common:LearnMore")}
        </Link>
      </div>

      <AdminMessageSection />

      <StyledSettingsSeparator />
      <Text fontSize="16px" fontWeight="700">
        {t("SessionLifetime")}
      </Text>

      <div className="category-item-description">
        <Text fontSize="13px" fontWeight="400">
          {t("SessionLifetimeSettingDescription")}
        </Text>

        <Link
          className="link-learn-more"
          target="_blank"
          isHovered
          color={currentColorScheme.main?.accent}
          href={lifetimeSettingsUrl}
        >
          {t("Common:LearnMore")}
        </Link>
      </div>

      <SessionLifetimeSection />
    </MainContainer>
  );
};

export default inject(({ settingsStore, setup }) => {
  const {
    currentColorScheme,
    passwordStrengthSettingsUrl,
    tfaSettingsUrl,
    trustedMailDomainSettingsUrl,
    administratorMessageSettingsUrl,
    lifetimeSettingsUrl,
    ipSettingsUrl,
    currentDeviceType,
  } = settingsStore;
  const { resetIsInit } = setup;

  const isMobileView = currentDeviceType === DeviceType.mobile;

  return {
    currentColorScheme,
    passwordStrengthSettingsUrl,
    tfaSettingsUrl,
    trustedMailDomainSettingsUrl,
    administratorMessageSettingsUrl,
    lifetimeSettingsUrl,
    ipSettingsUrl,
    isMobileView,
    resetIsInit,
  };
})(withTranslation(["Settings", "Profile"])(observer(AccessPortal)));
