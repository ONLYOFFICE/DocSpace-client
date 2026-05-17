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

"use client";

import React from "react";
import { useTranslation, Trans } from "react-i18next";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Text } from "@docspace/ui-kit/components/text";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import ErrorContainer from "@docspace/ui-kit/components/error-container/ErrorContainer";

import {
  getMessageFromKey,
  getMessageKeyTranslate,
  getOAuthMessageKeyTranslation,
} from "@/utils";
import { OAuth2ErrorKey } from "@/utils/enums";
import { getBrandName } from "@docspace/shared/constants/brands";

const homepage = "/";

interface InvalidErrorProps {
  match?: {
    [key: string]: string;
  };
}

const InvalidError = ({ match }: InvalidErrorProps) => {
  const router = useRouter();

  const [proxyHomepageUrl, setProxyHomepageUrl] = React.useState("");
  const { t } = useTranslation(["Login", "Errors", "Common"]);

  React.useEffect(() => {
    const url = combineUrl(window.ClientConfig?.proxy?.url, homepage);
    setProxyHomepageUrl(url);
    const timeout = setTimeout(() => {
      router.push("/");
    }, 10000);
    return () => clearTimeout(timeout);
  }, [router]);

  const message = getMessageFromKey(match?.messageKey ? +match.messageKey : 1);
  const oauthError = getOAuthMessageKeyTranslation(
    t,
    match?.oauthMessageKey as OAuth2ErrorKey | undefined,
  );

  const errorTitle =
    oauthError ||
    (match?.messageKey
      ? getMessageKeyTranslate(t, message)
      : t("Common:ExpiredLink"));

  return (
    <ErrorContainer headerText={errorTitle}>
      <Text fontSize="13px" fontWeight="600">
        <Trans
          t={t}
          i18nKey="ErrorInvalidText"
          values={{
            productName: getBrandName("ProductName"),
          }}
          components={{
            1: (
              <Link
                key="component_key"
                className="error_description_link"
                href={proxyHomepageUrl}
                data-testid="invalid_error_link"
              />
            ),
          }}
        />
      </Text>
    </ErrorContainer>
  );
};

export default InvalidError;
