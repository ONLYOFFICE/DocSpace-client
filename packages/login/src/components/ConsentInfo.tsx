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
import Image from "next/image";
import { Trans, useTranslation } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";
import { Link, LinkTarget, LinkType } from "@docspace/ui-kit/components/link";

import styles from "./ConsentInfo.module.scss";
import { getBrandName } from "@docspace/shared/constants/brands";

interface IOAuthClientInfo {
  name: string;
  logo: string;
  websiteUrl: string;

  isConsentScreen?: boolean;
}

const OAuthClientInfo = ({
  name,
  logo,
  websiteUrl,

  isConsentScreen,
}: IOAuthClientInfo) => {
  const { t } = useTranslation(["Consent", "Common"]);

  return (
    <div className={styles.oauthContainer}>
      {!isConsentScreen ? (
        <Text
          className={styles.row}
          fontWeight={600}
          fontSize="16px"
          lineHeight="22px"
        >
          {t("Common:LoginButton")}
        </Text>
      ) : null}
      <Image
        src={logo}
        className={styles.clientLogo}
        alt="client-logo"
        width={32}
        height={32}
      />
      <Text
        className={styles.row}
        fontWeight={isConsentScreen ? 400 : 600}
        fontSize="16px"
        lineHeight="22px"
      >
        {isConsentScreen ? (
          <Trans
            t={t}
            i18nKey="ConsentSubHeader"
            ns="Consent"
            values={{ nameApp: name, productName: getBrandName("ProductName") }}
            components={{
              1: (
                <Link
                  key="component_key"
                  className={styles.loginLink}
                  type={LinkType.page}
                  isHovered={false}
                  href={websiteUrl}
                  target={LinkTarget.blank}
                  noHover
                  fontWeight={600}
                  fontSize="16px"
                  dataTestId="app_link"
                />
              ),
            }}
          />
        ) : (
          <>
            {t("Consent:ToContinue")}{" "}
            <Link
              className={styles.loginLink}
              type={LinkType.page}
              isHovered={false}
              href={websiteUrl}
              target={LinkTarget.blank}
              noHover
              fontWeight={600}
              fontSize="16px"
              dataTestId="app_link"
            >
              {name}
            </Link>
          </>
        )}
      </Text>
    </div>
  );
};

export default OAuthClientInfo;
