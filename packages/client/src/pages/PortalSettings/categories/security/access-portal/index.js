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

import { useEffect, useRef, useState } from "react";
import { Trans, withTranslation } from "react-i18next";
import { Text } from "@docspace/shared/components/text";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import StyledSettingsSeparator from "SRC_DIR/pages/PortalSettings/StyledSettingsSeparator";

import { inject, observer } from "mobx-react";
import { Link } from "@docspace/shared/components/link";
import { DeviceType } from "@docspace/shared/enums";
import { isDesktop } from "@docspace/shared/utils/device";
import { MainContainer } from "../StyledSecurity";
import { TfaSection } from "./tfa";
import { PasswordStrengthSection } from "./passwordStrength";
import { TrustedMailSection } from "./trustedMail";
import { InvitationSettingsSection } from "./invitationSettings";
import { IpSecuritySection } from "./ipSecurity";
import { AdminMessageSection } from "./adminMessage";
import { SessionLifetimeSection } from "./sessionLifetime";
import { BruteForceProtectionSection } from "./bruteForceProtection";
import { DevToolsAccessSection } from "./devToolsAccess";

import MobileView from "./mobileView";

const HEADER_HEIGHT_DESKTOP = 69;
const HEADER_HEIGHT_TABLET = 61;
const TABS_HEIGHT = 32;

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
    helpCenterDomain,
    limitedDevToolsBlockHelpUrl,
    scrollToSettings,
    setScrollToSettings,
    tReady,
  } = props;

  const invitationSettingsRef = useRef(null);
  const scrollElement = document.getElementsByClassName("section-scroll")[0];

  const [isPasswordStrengthLoaded, setPasswordStrengthLoaded] = useState(false);
  const [isTfaLoaded, setTfaLoaded] = useState(false);
  const [isTrustedMailLoaded, setTrustedMailLoaded] = useState(false);

  const onSettingsSkeletonNotShown = (setting) => {
    if (setting === "PasswordStrength") setPasswordStrengthLoaded(true);
    if (setting === "Tfa") setTfaLoaded(true);
    if (setting === "TrustedMail") setTrustedMailLoaded(true);
  };

  useEffect(() => {
    setDocumentTitle(
      t("PortalAccess", { productName: t("Common:ProductName") }),
    );

    return () => {
      resetIsInit();
      setScrollToSettings(false);
    };
  }, []);

  useEffect(() => {
    const settingsBeforeInvitationSettings =
      !isPasswordStrengthLoaded || !isTfaLoaded || !isTrustedMailLoaded;

    if (
      !scrollToSettings ||
      !invitationSettingsRef.current ||
      !scrollElement ||
      settingsBeforeInvitationSettings ||
      !tReady
    )
      return;

    const coordinateY =
      invitationSettingsRef.current.offsetTop -
      (isDesktop() ? HEADER_HEIGHT_DESKTOP : HEADER_HEIGHT_TABLET) -
      TABS_HEIGHT;

    scrollElement.scrollTo(0, coordinateY);
    setScrollToSettings(false);
  }, [
    invitationSettingsRef.current,
    scrollElement,
    scrollToSettings,
    isPasswordStrengthLoaded,
    isTfaLoaded,
    isTrustedMailLoaded,
    tReady,
  ]);

  const settingsBeforeInvitationSettingsProps = scrollToSettings
    ? { onSettingsSkeletonNotShown }
    : {};

  if (isMobileView)
    return <MobileView t={t} withoutExternalLink={!helpCenterDomain} />;
  return (
    <MainContainer
      className="desktop-view"
      withoutExternalLink={!helpCenterDomain}
    >
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
        {passwordStrengthSettingsUrl ? (
          <Link
            className="link-learn-more"
            dataTestId="password_strength_learn_more"
            target="_blank"
            isHovered
            color={currentColorScheme.main?.accent}
            href={passwordStrengthSettingsUrl}
          >
            {t("Common:LearnMore")}
          </Link>
        ) : null}
      </div>

      <PasswordStrengthSection {...settingsBeforeInvitationSettingsProps} />
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
        {tfaSettingsUrl ? (
          <Link
            className="link-learn-more"
            target="_blank"
            isHovered
            color={currentColorScheme.main?.accent}
            href={tfaSettingsUrl}
          >
            {t("Common:LearnMore")}
          </Link>
        ) : null}
      </div>

      <TfaSection {...settingsBeforeInvitationSettingsProps} />
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
        {trustedMailDomainSettingsUrl ? (
          <Link
            className="link-learn-more"
            target="_blank"
            isHovered
            color={currentColorScheme.main?.accent}
            href={trustedMailDomainSettingsUrl}
          >
            {t("Common:LearnMore")}
          </Link>
        ) : null}
      </div>

      <TrustedMailSection {...settingsBeforeInvitationSettingsProps} />
      <StyledSettingsSeparator />

      <Text fontSize="16px" fontWeight="700">
        {t("DeveloperToolsAccess")}
      </Text>
      <div className="category-item-description">
        <Text fontSize="13px" fontWeight="400">
          {t("DeveloperToolsAccessDescription", {
            productName: t("Common:ProductName"),
          })}
        </Text>
        {limitedDevToolsBlockHelpUrl ? (
          <Link
            className="link-learn-more"
            target="_blank"
            isHovered
            color={currentColorScheme.main?.accent}
            href={limitedDevToolsBlockHelpUrl}
          >
            {t("Common:LearnMore")}
          </Link>
        ) : null}
      </div>
      <DevToolsAccessSection />
      <StyledSettingsSeparator />

      <Text fontSize="16px" fontWeight="700" ref={invitationSettingsRef}>
        {t("InvitationSettings")}
      </Text>
      <div className="category-item-description">
        <Text fontSize="13px" fontWeight="400">
          {t("InvitationSettingsDescription", {
            productName: t("Common:ProductName"),
          })}
        </Text>
      </div>
      <InvitationSettingsSection />

      <StyledSettingsSeparator />

      <Text fontSize="16px" fontWeight="700">
        {t("IPSecurity")}
      </Text>
      <div className="category-item-description">
        <Text fontSize="13px" fontWeight="400">
          {t("IPSecuritySettingDescription")}
        </Text>

        {ipSettingsUrl ? (
          <Link
            className="link-learn-more"
            target="_blank"
            isHovered
            color={currentColorScheme.main?.accent}
            href={ipSettingsUrl}
          >
            {t("Common:LearnMore")}
          </Link>
        ) : null}
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

        {administratorMessageSettingsUrl ? (
          <Link
            className="link-learn-more"
            target="_blank"
            isHovered
            color={currentColorScheme.main?.accent}
            href={administratorMessageSettingsUrl}
          >
            {t("Common:LearnMore")}
          </Link>
        ) : null}
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

        {lifetimeSettingsUrl ? (
          <Link
            className="link-learn-more"
            target="_blank"
            isHovered
            color={currentColorScheme.main?.accent}
            href={lifetimeSettingsUrl}
          >
            {t("Common:LearnMore")}
          </Link>
        ) : null}
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
    helpCenterDomain,
    limitedDevToolsBlockHelpUrl,
    scrollToSettings,
    setScrollToSettings,
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
    helpCenterDomain,
    limitedDevToolsBlockHelpUrl,
    scrollToSettings,
    setScrollToSettings,
  };
})(withTranslation(["Settings", "Profile"])(observer(AccessPortal)));
