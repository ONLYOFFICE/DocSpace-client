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

import React, { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import { SocialButtonsGroup } from "@docspace/shared/components/social-buttons-group";
import { Text } from "@docspace/shared/components/text";
import { getOAuthToken, getLoginLink } from "@docspace/shared/utils/common";
import {
  TCapabilities,
  TThirdPartyProvider,
} from "@docspace/shared/api/settings/types";

import SSOIcon from "PUBLIC_DIR/images/sso.react.svg";

import { LoginDispatchContext, LoginValueContext } from "./Login";

const StyledThirdParty = styled.div<{ isVisible: boolean }>`
  width: 100%;
  height: auto;
`;

type ThirdPartyProps = {
  thirdParty?: TThirdPartyProvider[];
  capabilities?: TCapabilities;
  ssoExists?: boolean;
  oauthDataExists?: boolean;
};

const ThirdParty = ({
  thirdParty,
  capabilities,
  ssoExists,
  oauthDataExists,
}: ThirdPartyProps) => {
  const { isLoading } = useContext(LoginValueContext);
  const { setIsModalOpen } = useContext(LoginDispatchContext);

  const { t } = useTranslation(["Login", "Common"]);

  const onSocialButtonClick = useCallback(
    (e: React.MouseEvent<Element, MouseEvent>) => {
      const target = e.target as HTMLElement;
      let targetElement = target;

      if (
        !(targetElement instanceof HTMLButtonElement) &&
        target.parentElement
      ) {
        targetElement = target.parentElement;
      }

      const providerName = targetElement.dataset.providername;
      let url = targetElement.dataset.url || "";

      try {
        //Lifehack for Twitter
        if (providerName == "twitter") {
          url += "authCallback";
        }

        const tokenGetterWin =
          window["AscDesktopEditor"] !== undefined
            ? (window.location.href = url)
            : window.open(
                url,
                "login",
                "width=800,height=500,status=no,toolbar=no,menubar=no,resizable=yes,scrollbars=no,popup=yes",
              );

        getOAuthToken(tokenGetterWin).then((code) => {
          const token = window.btoa(
            JSON.stringify({
              auth: providerName,
              mode: "popup",
              callback: "authCallback",
            }),
          );

          if (tokenGetterWin && typeof tokenGetterWin !== "string")
            tokenGetterWin.location.href = getLoginLink(token, code);
        });
      } catch (err) {
        console.log(err);
      }
    },
    [],
  );

  const ssoProps = ssoExists
    ? {
        ssoUrl: capabilities?.ssoUrl,
        ssoLabel: capabilities?.ssoLabel,
        ssoSVG: SSOIcon as string,
      }
    : {};

  const isVisible = oauthDataExists || ssoExists;

  return (
    isVisible && (
      <StyledThirdParty isVisible={isVisible}>
        <div className="line">
          <Text className="or-label">{t("Common:orContinueWith")}</Text>
        </div>
        <SocialButtonsGroup
          providers={thirdParty ?? undefined}
          onClick={onSocialButtonClick}
          onMoreAuthToggle={setIsModalOpen}
          t={t}
          isDisabled={isLoading}
          {...ssoProps}
        />
      </StyledThirdParty>
    )
  );
};

export default ThirdParty;
