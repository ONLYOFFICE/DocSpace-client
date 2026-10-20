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
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { Link, LinkTarget } from "@onlyoffice/apps-ui-kit/components/link";

import { getLogoUrl } from "../../utils";
import { WhiteLabelLogoType } from "../../enums";
import { useTheme } from "@onlyoffice/apps-ui-kit/context/ThemeContext";

import { BetaBadge } from "../beta-badge";

import { IContentProps } from "./About.types";
import styles from "./About.module.scss";
import { getBrandName } from "@docspace/shared/constants/brands";

export const AboutContent = ({
  buildVersionInfo,
  companyInfoSettingsData,
  previewData,
  standalone,
  licenseAgreementsUrl,
  privacyPolicyUrl,
  isEnterprise,
}: IContentProps) => {
  const { t } = useTranslation("Common");
  const { isBase } = useTheme();
  const linkRepo = "https://github.com/ONLYOFFICE/DocSpace";
  const linkDocs = "https://github.com/ONLYOFFICE/DocumentServer";

  const companyName = previewData
    ? previewData.companyName
    : companyInfoSettingsData?.companyName;

  const email = previewData
    ? previewData.email
    : companyInfoSettingsData?.email;

  const phone = previewData
    ? previewData.phone
    : companyInfoSettingsData?.phone;

  const site = previewData ? previewData.site : companyInfoSettingsData?.site;

  const address = previewData
    ? previewData.address
    : companyInfoSettingsData?.address;

  const logo = getLogoUrl(WhiteLabelLogoType.AboutPage, !isBase, true);

  const secondaryColor = "var(--about-secondary-text-color)";

  const isCommercial = !standalone || isEnterprise;
  const license = isCommercial ? t("Common:Commercial") : "AGPL-3.0";

  // SaaS links its legal pages next to the logo, the same two entries the
  // sign-up page uses; a server shows its software license there instead.
  // A page without a configured URL is left out.
  const legalLinks = [
    {
      key: "terms-of-use",
      label: t("AboutTermsOfUse"),
      href: licenseAgreementsUrl,
    },
    {
      key: "privacy-policy",
      label: t("AboutPrivacyPolicy"),
      href: privacyPolicyUrl,
    },
  ].filter((link) => link.href);

  const products: {
    key: string;
    name: string;
    href?: string;
    version?: string;
    isBeta?: boolean;
  }[] = [
    {
      key: "online-editors",
      name: getBrandName("ProductEditorsName"),
      href: linkDocs,
      version: buildVersionInfo.documentServer,
    },
    {
      key: "document-management",
      name: getBrandName("ProductName"),
      href: linkRepo,
      version: buildVersionInfo.docSpace,
    },
  ];

  // AI Tools is a closed product: no repository to link to, and only listed
  // where the service is deployed and reports its version.
  if (buildVersionInfo.aiTools) {
    products.push({
      key: "ai-tools",
      name: getBrandName("ProductAIToolsName"),
      version: buildVersionInfo.aiTools,
      isBeta: true,
    });
  }

  return (
    companyInfoSettingsData && (
      <div className={styles.aboutContent}>
        <div className={styles.header}>
          <img
            src={logo}
            alt="Logo"
            className={classNames(
              styles.logoDocspaceTheme,
              styles.noSelect,
              "logo-docspace-theme",
            )}
          />
          {standalone ? (
            <div className={styles.license}>
              <Text fontSize="14px" color={secondaryColor}>
                {t("SoftwareLicense")}:
              </Text>
              {isCommercial ? (
                <Link
                  tag="a"
                  fontSize="14px"
                  href={licenseAgreementsUrl}
                  target={LinkTarget.blank}
                  enableUserSelect
                  color={secondaryColor}
                >
                  {license}
                </Link>
              ) : (
                <Text fontSize="14px" color={secondaryColor}>
                  {license}
                </Text>
              )}
            </div>
          ) : (
            <div className={styles.license}>
              {legalLinks.map((link, index) => (
                <React.Fragment key={link.key}>
                  {index > 0 ? (
                    <Text
                      fontSize="14px"
                      color={secondaryColor}
                      className={styles.separator}
                    >
                      |
                    </Text>
                  ) : null}
                  <Link
                    tag="a"
                    fontSize="14px"
                    href={link.href}
                    target={LinkTarget.blank}
                    enableUserSelect
                    color={secondaryColor}
                  >
                    {link.label}
                  </Link>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        <div className={styles.products} data-testid="about-products">
          {products.map((product) => (
            <div
              key={product.key}
              className={styles.product}
              data-testid={`about-product-${product.key}`}
            >
              <div className={styles.productName}>
                {product.href ? (
                  <Link
                    tag="a"
                    fontSize="14px"
                    fontWeight="600"
                    href={product.href}
                    target={LinkTarget.blank}
                    textDecoration="underline"
                    enableUserSelect
                  >
                    {product.name}
                  </Link>
                ) : (
                  <Text fontSize="14px" fontWeight="600">
                    {product.name}
                  </Text>
                )}
                {product.isBeta ? (
                  <BetaBadge place="bottom" withoutTooltip />
                ) : null}
              </div>
              <Text fontSize="14px" color={secondaryColor}>
                {t("Version")}{" "}
                <span
                  className={classNames(
                    styles.version,
                    `version-${product.key}`,
                  )}
                >
                  {product.version}
                </span>
              </Text>
            </div>
          ))}
        </div>

        <Text
          className={styles.copyright}
          fontSize="13px"
          fontWeight="700"
          color={secondaryColor}
        >
          © {companyName}
        </Text>

        <Text className={styles.row} fontSize="13px" color={secondaryColor}>
          {t("Common:Address")}: <span>{address}</span>
        </Text>

        <Text className={styles.row} fontSize="13px" color={secondaryColor}>
          {t("Common:Phone")}: <span className={styles.phone}>{phone}</span>
        </Text>

        <Text className={styles.row} fontSize="13px" color={secondaryColor}>
          {t("AboutCompanyEmailTitle")}:{" "}
          <Link
            tag="a"
            fontSize="13px"
            href={`mailto:${companyInfoSettingsData.email}`}
            enableUserSelect
            color="accent"
          >
            {email}
          </Link>
        </Text>

        <Text className={styles.row} fontSize="13px" color={secondaryColor}>
          {t("Site")}:{" "}
          <Link
            tag="a"
            fontSize="13px"
            target={LinkTarget.blank}
            href={site}
            enableUserSelect
            color="accent"
          >
            {site?.replace(/^https?\:\/\//i, "")}
          </Link>
        </Text>
      </div>
    )
  );
};
