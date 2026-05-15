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

import { Text } from "@docspace/ui-kit/components/text";
import { Link, LinkTarget } from "@docspace/ui-kit/components/link";

import { getLogoUrl } from "../../utils";
import { WhiteLabelLogoType } from "../../enums";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";

import { IContentProps } from "./About.types";
import styles from "./About.module.scss";
import { getBrandName } from "@docspace/shared/constants/brands";

export const AboutContent = ({
  buildVersionInfo,
  companyInfoSettingsData,
  previewData,
  standalone,
  licenseAgreementsUrl,
  isEnterprise,
  logoText,
}: IContentProps) => {
  const { t } = useTranslation("Common");
  const { isBase } = useTheme();
  const isCommercial = !standalone || isEnterprise;
  const license = isCommercial ? t("Common:Commercial") : "AGPL-3.0";
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

  return (
    companyInfoSettingsData && (
      <div className={styles.aboutContent}>
        <div className={classNames(styles.avatar, "avatar")}>
          <img
            src={logo}
            alt="Logo"
            className={classNames(
              styles.logoDocspaceTheme,
              styles.noSelect,
              "logo-docspace-theme",
            )}
          />
        </div>
        <div className={classNames(styles.row, "row")}>
          <Text className={classNames(styles.rowEl, "row-el")} fontSize="13px">
            {t("DocumentManagement")}:
          </Text>
          <div
            className={classNames(
              styles.programWithVersion,
              "program-with-version",
            )}
          >
            <Link
              tag="a"
              className={classNames(styles.rowEl, "row-el")}
              fontSize="13px"
              fontWeight="600"
              href={linkRepo}
              target={LinkTarget.blank}
              enableUserSelect
              color="accent"
            >
              &nbsp;{logoText} {getBrandName("ProductName")}&nbsp;
            </Link>

            <Text
              className={classNames(
                styles.rowEl,
                styles.selectEl,
                "row-el select-el",
              )}
              fontSize="13px"
              fontWeight="600"
            >
              v.
              <span className="version-document-management">
                {buildVersionInfo.docSpace}&nbsp;
              </span>
            </Text>
          </div>
        </div>

        <div className={classNames(styles.row, "row")}>
          <Text className={classNames(styles.rowEl, "row-el")} fontSize="13px">
            {t("OnlineEditors")}:
          </Text>
          <div
            className={classNames(
              styles.programWithVersion,
              "program-with-version",
            )}
          >
            <Link
              tag="a"
              className={classNames(styles.rowEl, "row-el")}
              fontSize="13px"
              fontWeight="600"
              href={linkDocs}
              target={LinkTarget.blank}
              enableUserSelect
              color="accent"
            >
              &nbsp;{logoText} {getBrandName("ProductEditorsName")}&nbsp;
            </Link>
            <Text
              className={classNames(
                styles.rowEl,
                styles.selectEl,
                "row-el select-el",
              )}
              fontSize="13px"
              fontWeight="600"
            >
              v.
              <span className="version-online-editors">
                {buildVersionInfo.documentServer}&nbsp;
              </span>
            </Text>
          </div>
        </div>

        <div className={classNames(styles.row, "row")}>
          <Text className={classNames(styles.rowEl, "row-el")} fontSize="13px">
            {t("SoftwareLicense")}:{" "}
          </Text>
          {isCommercial ? (
            <Link
              tag="a"
              className={classNames(styles.rowEl, "row-el")}
              fontSize="13px"
              fontWeight="600"
              href={licenseAgreementsUrl}
              target={LinkTarget.blank}
              enableUserSelect
              color="accent"
            >
              &nbsp;{license}
            </Link>
          ) : (
            <Text
              className={classNames(styles.rowEl, "row-el")}
              fontSize="13px"
              fontWeight="600"
            >
              &nbsp;{license}
            </Text>
          )}
        </div>

        <Text
          className={classNames(styles.copyright, "copyright")}
          fontSize="14px"
          fontWeight="600"
        >
          © {companyName}
        </Text>

        <div className={classNames(styles.row, "row")}>
          <Text
            className={classNames(styles.addressTitle, "address-title")}
            fontSize="13px"
          >
            {t("Common:Address")}:{" "}
          </Text>
          <Text
            className={classNames(
              styles.addressTitle,
              styles.selectEl,
              "address-title select-el",
            )}
            fontSize="13px"
          >
            {address}
          </Text>
        </div>

        <div className={classNames(styles.row, "row")}>
          <Text
            className={classNames(styles.telTitle, "tel-title")}
            fontSize="13px"
          >
            {t("Common:Phone")}:{" "}
          </Text>
          <Text
            className={classNames(
              styles.telTitle,
              styles.selectEl,
              "tel-title select-el",
            )}
            fontSize="13px"
          >
            {phone}
          </Text>
        </div>

        <div className={classNames(styles.row, "row")}>
          <Text className={classNames(styles.rowEl, "row-el")} fontSize="13px">
            {t("AboutCompanyEmailTitle")}:
          </Text>

          <Link
            tag="a"
            className={classNames(styles.rowEl, "row-el")}
            fontSize="13px"
            fontWeight="600"
            href={`mailto:${companyInfoSettingsData.email}`}
            enableUserSelect
            color="accent"
          >
            &nbsp;{email}
          </Link>
        </div>

        <div className={classNames(styles.row, "row")}>
          <Text className={classNames(styles.rowEl, "row-el")} fontSize="13px">
            {t("Site")}:
          </Text>

          <Link
            tag="a"
            className={classNames(styles.rowEl, "row-el")}
            fontSize="13px"
            fontWeight="600"
            target={LinkTarget.blank}
            href={site}
            enableUserSelect
            color="accent"
          >
            &nbsp;{site?.replace(/^https?\:\/\//i, "")}
          </Link>
        </div>
      </div>
    )
  );
};
