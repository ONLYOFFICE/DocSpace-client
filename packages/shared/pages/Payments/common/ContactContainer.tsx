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

import styles from "../Bonus/Bonus.module.scss";

export const ContactContainer = ({
  salesEmail,
  isCommunity,
  forEnterprisesUrl,
  demoOrderUrl,
  feedbackAndSupportUrl,
}: {
  salesEmail: string;
  feedbackAndSupportUrl: string;
  isCommunity?: boolean;
  forEnterprisesUrl?: string;
  demoOrderUrl?: string;
}) => {
  const { t } = useTranslation("Common");

  return (
    <>
      {isCommunity ? (
        <div
          data-testid="community-contact-container"
          className={styles.contactComponent}
        >
          <div className={styles.paymentsContact}>
            <Text className={styles.text} fontWeight={600}>
              <Trans
                i18nKey="UpgradeToProBannerInformationAboutShort"
                ns="Common"
                t={t}
                values={{ license: t("Common:EnterpriseLicense") }}
                components={{
                  1: (
                    <Link
                      key="enterprise-license-link"
                      target={LinkTarget.blank}
                      tag="a"
                      fontWeight="600"
                      href={forEnterprisesUrl}
                      className={styles.link}
                      dataTestId="for_enterprise_license_link"
                    />
                  ),
                }}
              />
            </Text>
          </div>
          <div className={styles.paymentsContact}>
            <Text className={styles.text} fontWeight={600}>
              <Trans
                i18nKey="UpgradeToProBannerInformationDemo"
                ns="Common"
                t={t}
              >
                Request demonstration
                <Link
                  target={LinkTarget.blank}
                  tag="a"
                  fontWeight="600"
                  href={demoOrderUrl}
                  className={styles.link}
                  dataTestId="demo_order_link"
                >
                  here
                </Link>
              </Trans>
            </Text>
          </div>
        </div>
      ) : null}
      <div className={styles.contactComponent}>
        <div className={styles.paymentsContact}>
          <Text className={styles.text} fontWeight={600}>
            <Trans
              t={t}
              i18nKey="UpgradeToProBannerInformationPurchase"
              ns="Common"
              values={{ email: salesEmail }}
              components={{
                1: (
                  <Link
                    key="upgrade-to-pro-banner-purchase-link"
                    fontWeight="600"
                    target={LinkTarget.blank}
                    tag="a"
                    href={`mailto:${salesEmail}`}
                    className={styles.link}
                    dataTestId="upgrade_to_pro_banner_purchase_link"
                  />
                ),
              }}
            />
          </Text>
        </div>
        <div className={styles.paymentsContact}>
          <Text className={styles.text} fontWeight={600}>
            <Trans
              t={t}
              i18nKey="UpgradeToProBannerInformationSupport"
              ns="Common"
              values={{ helpUrl: feedbackAndSupportUrl }}
              components={{
                1: (
                  <Link
                    key="upgrade-to-pro-banner-support-link"
                    target={LinkTarget.blank}
                    tag="a"
                    fontWeight="600"
                    href={feedbackAndSupportUrl}
                    className={styles.link}
                    dataTestId="upgrade_to_pro_banner_support_link"
                  />
                ),
              }}
            />
          </Text>
        </div>
      </div>
    </>
  );
};
