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

import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { Trans } from "react-i18next";

import { MobileCategoryWrapper } from "@docspace/shared/components/mobile-category-wrapper";

import { setDocumentTitle } from "SRC_DIR/helpers/utils";

import { MainContainer } from "../StyledSecurity";

const MobileView = (props) => {
  const { t, withoutExternalLink } = props;

  const navigate = useNavigate();

  useEffect(() => {
    setDocumentTitle(
      t("PortalAccess", { productName: t("Common:ProductName") }),
    );
  }, []);

  const onClickLink = (e) => {
    e.preventDefault();
    navigate(e.target.pathname);
  };

  return (
    <MainContainer withoutExternalLink={withoutExternalLink}>
      <MobileCategoryWrapper
        title={t("SettingPasswordTittle")}
        subtitle={
          <Trans
            i18nKey="SettingPasswordStrengthMobileDescription"
            ns="Settings"
            t={t}
          />
        }
        url="/portal-settings/security/access-portal/password"
        onClickLink={onClickLink}
      />
      <MobileCategoryWrapper
        title={t("TwoFactorAuth")}
        subtitle={
          <Trans i18nKey="TwoFactorAuthMobileDescription" ns="Settings" t={t} />
        }
        url="/portal-settings/security/access-portal/tfa"
        onClickLink={onClickLink}
      />
      <MobileCategoryWrapper
        title={t("TrustedMail")}
        subtitle={
          <Trans i18nKey="TrustedMailMobileDescription" ns="Settings" t={t} />
        }
        url="/portal-settings/security/access-portal/trusted-mail"
        onClickLink={onClickLink}
      />
      <MobileCategoryWrapper
        title={t("DeveloperToolsAccess")}
        subtitle={
          <Trans
            i18nKey="DeveloperToolsAccessMobileDescription"
            ns="Settings"
            t={t}
          />
        }
        url="/portal-settings/security/access-portal/access-dev-tools"
        onClickLink={onClickLink}
      />
      <MobileCategoryWrapper
        title={t("InvitationSettings")}
        subtitle={
          <Trans
            i18nKey="InvitationSettingsMobile"
            ns="Settings"
            t={t}
            values={{ productName: t("Common:ProductName") }}
          />
        }
        url="/portal-settings/security/access-portal/invitation-settings"
        onClickLink={onClickLink}
      />
      <MobileCategoryWrapper
        title={t("IPSecurity")}
        subtitle={
          <Trans i18nKey="IPSecurityMobileDescription" ns="Settings" t={t} />
        }
        url="/portal-settings/security/access-portal/ip"
        onClickLink={onClickLink}
      />
      <MobileCategoryWrapper
        title={t("BruteForceProtection")}
        subtitle={t("BruteForceProtectionDescriptionMobile")}
        url="/portal-settings/security/access-portal/brute-force-protection"
        onClickLink={onClickLink}
      />
      <MobileCategoryWrapper
        title={t("AdminsMessage")}
        subtitle={
          <Trans i18nKey="AdminsMessageMobileDescription" ns="Settings" t={t} />
        }
        url="/portal-settings/security/access-portal/admin-message"
        onClickLink={onClickLink}
      />
      <MobileCategoryWrapper
        title={t("SessionLifetime")}
        subtitle={t("SessionLifetimeMobileDescription", {
          productName: t("Common:ProductName"),
        })}
        url="/portal-settings/security/access-portal/lifetime"
        onClickLink={onClickLink}
      />
    </MainContainer>
  );
};

export default MobileView;
