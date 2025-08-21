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

"use client";

import React from "react";
import { useTranslation, Trans } from "react-i18next";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Text } from "@docspace/shared/components/text";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import ErrorContainer from "@docspace/shared/components/error-container/ErrorContainer";

import {
  getMessageFromKey,
  getMessageKeyTranslate,
  getOAuthMessageKeyTranslation,
} from "@/utils";
import { OAuth2ErrorKey } from "@/utils/enums";

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
            productName: t("Common:ProductName"),
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
