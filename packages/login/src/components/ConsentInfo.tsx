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

import React from "react";
import styled from "styled-components";
import { Trans, useTranslation } from "react-i18next";

import { Text } from "@docspace/shared/components/text";
import { Link, LinkTarget, LinkType } from "@docspace/shared/components/link";

const StyledOAuthContainer = styled.div`
  width: 100%;
  height: auto;

  display: flex;
  flex-direction: column;
  align-items: center;

  gap: 12px;

  margin-bottom: 32px;

  .client-logo {
    width: 32px;
    height: 32px;
    max-width: 32px;
    max-height: 32px;

    border-radius: 3px;

    object-fit: cover;
  }

  .row {
    width: 100%;
    text-align: center;
  }

  .login-link {
    cursor: normal;
  }
`;

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
    <StyledOAuthContainer>
      {!isConsentScreen ? (
        <Text
          className="row"
          fontWeight={600}
          fontSize="16px"
          lineHeight="22px"
        >
          {t("Common:LoginButton")}
        </Text>
      ) : null}
      <img src={logo} className="client-logo" alt="client-logo" />
      <Text
        className="row"
        fontWeight={isConsentScreen ? 400 : 600}
        fontSize="16px"
        lineHeight="22px"
      >
        {isConsentScreen ? (
          <Trans
            t={t}
            i18nKey="ConsentSubHeader"
            ns="Consent"
            values={{ nameApp: name, productName: t("Common:ProductName") }}
            components={{
              1: (
                <Link
                  key="component_key"
                  className="login-link"
                  type={LinkType.page}
                  isHovered={false}
                  href={websiteUrl}
                  target={LinkTarget.blank}
                  noHover
                  fontWeight={600}
                  fontSize="16px"
                />
              ),
            }}
          />
        ) : (
          <>
            {t("Consent:ToContinue")}{" "}
            <Link
              className="login-link"
              type={LinkType.page}
              isHovered={false}
              href={websiteUrl}
              target={LinkTarget.blank}
              noHover
              fontWeight={600}
              fontSize="16px"
            >
              {name}
            </Link>
          </>
        )}
      </Text>
    </StyledOAuthContainer>
  );
};

export default OAuthClientInfo;
