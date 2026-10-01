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

import React from "react";
import { Trans, useTranslation } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";
import { Link, LinkTarget } from "@docspace/ui-kit/components/link";

import styles from "../Bonus.module.scss";

const getHost = (url: string) => {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
};

export const HelpLinks = ({
  organizationName,
  license,
  salesEmail,
  forEnterprisesUrl,
  demoOrderUrl,
  feedbackAndSupportUrl,
}: {
  organizationName: string;
  license: string;
  salesEmail: string;
  forEnterprisesUrl: string;
  demoOrderUrl: string;
  feedbackAndSupportUrl: string;
}) => {
  const { t } = useTranslation("Common");

  const renderLink = (href: string, dataTestId: string) => (
    <Link
      tag="a"
      href={href}
      target={LinkTarget.blank}
      color="accent"
      fontSize="13px"
      fontWeight={600}
      lineHeight="20px"
      textDecoration="underline"
      dataTestId={dataTestId}
    />
  );

  return (
    <div className={styles.help} data-testid="bonus-help">
      <Text fontSize="16px" fontWeight={700} lineHeight="22px">
        {t("Common:UpgradeLearnMoreTitle")}
      </Text>
      <div className={styles.helpLines}>
        {forEnterprisesUrl ? (
          <Text
            fontSize="13px"
            fontWeight={600}
            lineHeight="20px"
            className={styles.description}
          >
            <Trans
              t={t}
              ns="Common"
              i18nKey="UpgradeLearnMoreAbout"
              values={{ organizationName, license }}
              components={{
                1: renderLink(forEnterprisesUrl, "for_enterprise_license_link"),
              }}
            />
          </Text>
        ) : null}
        {demoOrderUrl ? (
          <Text
            fontSize="13px"
            fontWeight={600}
            lineHeight="20px"
            className={styles.description}
          >
            <Trans
              t={t}
              ns="Common"
              i18nKey="UpgradeRequestDemo"
              components={{ 1: renderLink(demoOrderUrl, "demo_order_link") }}
            />
          </Text>
        ) : null}
        {salesEmail ? (
          <Text
            fontSize="13px"
            fontWeight={600}
            lineHeight="20px"
            className={styles.description}
          >
            <Trans
              t={t}
              ns="Common"
              i18nKey="UpgradeToProBannerInformationPurchase"
              values={{ email: salesEmail }}
              components={{
                1: renderLink(
                  `mailto:${salesEmail}`,
                  "upgrade_to_pro_banner_purchase_link",
                ),
              }}
            />
          </Text>
        ) : null}
        {feedbackAndSupportUrl ? (
          <Text
            fontSize="13px"
            fontWeight={600}
            lineHeight="20px"
            className={styles.description}
          >
            <Trans
              t={t}
              ns="Common"
              i18nKey="UpgradeGetTechAssistance"
              values={{ helpUrl: getHost(feedbackAndSupportUrl) }}
              components={{
                1: renderLink(
                  feedbackAndSupportUrl,
                  "upgrade_to_pro_banner_support_link",
                ),
              }}
            />
          </Text>
        ) : null}
      </div>
    </div>
  );
};
