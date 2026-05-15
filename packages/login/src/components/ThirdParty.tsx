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

import React, { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";

import { SocialButtonsGroup } from "@docspace/shared/components/social-buttons-group";
import { Text } from "@docspace/ui-kit/components/text";
import { getLoginLink } from "@docspace/shared/utils/common";
import { getOAuthToken } from "@docspace/ui-kit/utils/get-oauth-token";
import {
  TCapabilities,
  TThirdPartyProvider,
} from "@docspace/shared/api/settings/types";

import SSOIcon from "PUBLIC_DIR/images/sso.react.svg";

import { LoginDispatchContext, LoginValueContext } from "./Login";

type ThirdPartyProps = {
  thirdParty?: TThirdPartyProvider[];
  capabilities?: TCapabilities;
  ssoExists?: boolean;
  oauthDataExists?: boolean;
  isOauth?: boolean;
};

const ThirdParty = ({
  thirdParty,
  capabilities,
  ssoExists,
  oauthDataExists,
  isOauth,
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
        // Lifehack for Twitter
        if (providerName == "twitter") {
          url += "authCallback";

          if (isOauth) {
            url += "&pure=true";
          }
        }

        const tokenGetterWin =
          window.AscDesktopEditor !== undefined
            ? (window.location.href = url)
            : window.open(
                url,
                "login",
                "width=800,height=500,status=no,toolbar=no,menubar=no,resizable=yes,scrollbars=no,popup=yes",
              );

        getOAuthToken(tokenGetterWin).then((code) => {
          const tokenObj: Record<string, string | undefined> = {
            auth: providerName,
            mode: "popup",
            callback: "authCallback",
          };

          if (isOauth) {
            tokenObj["pure"] = "true";
          }
          const token = window.btoa(JSON.stringify(tokenObj));

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
      <div style={{ width: "100%", height: "auto" }}>
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
      </div>
    )
  );
};

export default ThirdParty;
