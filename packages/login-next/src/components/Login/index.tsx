// (c) Copyright Ascensio System SIA 2009-2024
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

import { useContext, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components";

import { TenantStatus, WhiteLabelLogoType } from "@docspace/shared/enums";
import { PROVIDERS_DATA } from "@docspace/shared/constants";
import {
  getBgPattern,
  getLoginLink,
  getLogoFromPath,
  getLogoUrl,
  getOAuthToken,
} from "@docspace/shared/utils/common";

import RecoverAccessModalDialog from "@docspace/shared/components/recover-access-modal-dialog/RecoverAccessModalDialog";
import { Scrollbar } from "@docspace/shared/components/scrollbar";
import { ColorTheme, ThemeId } from "@docspace/shared/components/color-theme";
import { FormWrapper } from "@docspace/shared/components/form-wrapper";
import { Link, LinkType } from "@docspace/shared/components/link";
import { SocialButtonsGroup } from "@docspace/shared/components/social-buttons-group";
import { Text } from "@docspace/shared/components/text";

import SSOIcon from "PUBLIC_DIR/images/sso.react.svg?url";

import { LoginProps } from "@/types";
import useRecoverDialog from "@/hooks/useRecoverDialog";

import GreetingContainer from "../GreetingContainer";
import Register from "../Register";

import { LoginContent, LoginFormWrapper } from "./Login.styled";

const Login = ({
  searchParams,
  settings,
  capabilities,
  thirdPartyProvider,
}: LoginProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const [invitationLinkData, setInvitationLinkData] = useState({
    email: "",
    roomName: "",
    firstName: "",
    lastName: "",
    type: "",
  });

  const theme = useTheme();
  const { t } = useTranslation(["Login"]);

  const {
    recoverDialogVisible,
    recoverDialogEmailPlaceholder,
    recoverDialogTextBody,
    openRecoverDialog,
    closeRecoverDialog,
  } = useRecoverDialog({});

  const ssoExists = () => {
    if (capabilities?.ssoUrl) return true;
    else return false;
  };

  const oauthDataExists = () => {
    if (!capabilities?.oauthEnabled) return false;

    let existProviders = 0;
    if (thirdPartyProvider && thirdPartyProvider.length > 0)
      thirdPartyProvider?.map((item) => {
        if (!(item.provider in PROVIDERS_DATA)) return;
        existProviders++;
      });

    return !!existProviders;
  };

  const onSocialButtonClick = useCallback(
    async (e: React.MouseEvent<Element, MouseEvent>) => {
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
                "width=800,height=500,status=no,toolbar=no,menubar=no,resizable=yes,scrollbars=no",
              );

        const code: string = await getOAuthToken(tokenGetterWin);

        const token = window.btoa(
          JSON.stringify({
            auth: providerName,
            mode: "popup",
            callback: "authCallback",
          }),
        );

        if (tokenGetterWin && typeof tokenGetterWin !== "string")
          tokenGetterWin.location.href = getLoginLink(token, code);
      } catch (err) {
        console.log(err);
      }
    },
    [],
  );

  const bgPattern = getBgPattern(theme.currentColorScheme?.id);

  const logoUrl = getLogoUrl(WhiteLabelLogoType.LoginPage, !theme?.isBase);

  const ssoProps = ssoExists()
    ? {
        ssoUrl: capabilities?.ssoUrl,
        ssoLabel: capabilities?.ssoLabel,
        ssoSVG: SSOIcon as string,
      }
    : {};

  return (
    <LoginFormWrapper id="login-page" bgPattern={bgPattern}>
      <div className="bg-cover" />
      <Scrollbar id="customScrollBar">
        <LoginContent>
          <ColorTheme
            themeId={ThemeId.LinkForgotPassword}
            isRegisterContainerVisible={settings?.enabledJoin}
          >
            <GreetingContainer
              roomName={invitationLinkData.roomName}
              firstName={invitationLinkData.firstName}
              lastName={invitationLinkData.lastName}
              logoUrl={logoUrl}
              greetingSettings={settings?.greetingSettings}
              type={invitationLinkData.type}
            />
            <FormWrapper id="login-form">
              {(oauthDataExists() || ssoExists()) && (
                <>
                  <div className="line">
                    <Text className="or-label">
                      {t("Common:orContinueWith")}
                    </Text>
                  </div>
                  <SocialButtonsGroup
                    providers={thirdPartyProvider}
                    onClick={onSocialButtonClick}
                    t={t}
                    isDisabled={isLoading}
                    {...ssoProps}
                  />
                </>
              )}
              {settings?.enableAdmMess && (
                <Link
                  fontWeight={600}
                  fontSize="13px"
                  type={LinkType.action}
                  isHovered
                  className="login-link recover-link"
                  onClick={openRecoverDialog}
                >
                  {t("RecoverAccess")}
                </Link>
              )}
            </FormWrapper>
          </ColorTheme>
        </LoginContent>
        {settings?.enabledJoin && (
          <Register
            id="login_register"
            enabledJoin
            trustedDomains={settings.trustedDomains}
            trustedDomainsType={settings.trustedDomainsType}
          />
        )}
      </Scrollbar>
      {recoverDialogVisible && (
        <RecoverAccessModalDialog
          visible={recoverDialogVisible}
          onClose={closeRecoverDialog}
          textBody={recoverDialogTextBody}
          emailPlaceholderText={recoverDialogEmailPlaceholder}
          id="recover-access-modal"
        />
      )}
    </LoginFormWrapper>
  );
};

export default Login;
