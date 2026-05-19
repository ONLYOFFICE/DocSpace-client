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

import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { Trans } from "react-i18next";

import { CategoryItem } from "@docspace/ui-kit/components/category-item";

import { setDocumentTitle } from "SRC_DIR/helpers/utils";

import { MainContainer } from "../StyledSecurity";
import { getBrandName } from "@docspace/shared/constants/brands";

const MobileView = (props) => {
  const { t, withoutExternalLink } = props;

  const navigate = useNavigate();

  useEffect(() => {
    setDocumentTitle(
      t("PortalAccess", { productName: getBrandName("ProductName") }),
    );
  }, []);

  const onClickLink = (e) => {
    e.preventDefault();
    navigate(e.target.pathname);
  };

  return (
    <MainContainer withoutExternalLink={withoutExternalLink}>
      <CategoryItem
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
      <CategoryItem
        title={t("TwoFactorAuth")}
        subtitle={
          <Trans i18nKey="TwoFactorAuthMobileDescription" ns="Settings" t={t} />
        }
        url="/portal-settings/security/access-portal/tfa"
        onClickLink={onClickLink}
      />
      <CategoryItem
        title={t("TrustedMail")}
        subtitle={
          <Trans i18nKey="TrustedMailMobileDescription" ns="Settings" t={t} />
        }
        url="/portal-settings/security/access-portal/trusted-mail"
        onClickLink={onClickLink}
      />
      <CategoryItem
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
      <CategoryItem
        title={t("InvitationSettings")}
        subtitle={
          <Trans
            i18nKey="InvitationSettingsMobile"
            ns="Settings"
            t={t}
            values={{ productName: getBrandName("ProductName") }}
          />
        }
        url="/portal-settings/security/access-portal/invitation-settings"
        onClickLink={onClickLink}
      />
      <CategoryItem
        title={t("IPSecurity")}
        subtitle={
          <Trans i18nKey="IPSecurityMobileDescription" ns="Settings" t={t} />
        }
        url="/portal-settings/security/access-portal/ip"
        onClickLink={onClickLink}
      />
      <CategoryItem
        title={t("BruteForceProtection")}
        subtitle={t("BruteForceProtectionDescriptionMobile")}
        url="/portal-settings/security/access-portal/brute-force-protection"
        onClickLink={onClickLink}
      />
      <CategoryItem
        title={t("AdminsMessage")}
        subtitle={
          <Trans i18nKey="AdminsMessageMobileDescription" ns="Settings" t={t} />
        }
        url="/portal-settings/security/access-portal/admin-message"
        onClickLink={onClickLink}
      />
      <CategoryItem
        title={t("SessionLifetime")}
        subtitle={t("SessionLifetimeMobileDescription", {
          productName: getBrandName("ProductName"),
        })}
        url="/portal-settings/security/access-portal/lifetime"
        onClickLink={onClickLink}
      />
    </MainContainer>
  );
};

export default MobileView;
