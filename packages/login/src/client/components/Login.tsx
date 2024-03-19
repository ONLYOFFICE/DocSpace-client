// (c) Copyright Ascensio System SIA 2010-2024
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

import React, { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { useLocation } from "react-router-dom";

import { LoginFormWrapper, LoginContent } from "./StyledLogin";
import { Text } from "@docspace/shared/components/text";
import { SocialButtonsGroup } from "@docspace/shared/components/social-buttons-group";
import {
  getOAuthToken,
  getLoginLink,
  getEditorTheme,
} from "@docspace/shared/utils/common";
import { Link } from "@docspace/shared/components/link";
import { checkIsSSR } from "@docspace/shared/utils";
import { PROVIDERS_DATA } from "@docspace/shared/constants";
import LoginForm from "./sub-components/LoginForm";
import RecoverAccessModalDialog from "@docspace/shared/components/recover-access-modal-dialog/RecoverAccessModalDialog";
import { FormWrapper } from "@docspace/shared/components/form-wrapper";
import Register from "./sub-components/register-container";
import { ColorTheme, ThemeId } from "@docspace/shared/components/color-theme";
import SSOIcon from "PUBLIC_DIR/images/sso.react.svg?url";
import { Dark, Base } from "@docspace/shared/themes";
import { useMounted } from "../helpers/useMounted";
import { getBgPattern, frameCallCommand } from "@docspace/shared/utils/common";
import useIsomorphicLayoutEffect from "../hooks/useIsomorphicLayoutEffect";
import { getLogoFromPath, getSystemTheme } from "@docspace/shared/utils";
import { TenantStatus } from "@docspace/shared/enums";
import GreetingContainer from "./sub-components/GreetingContainer";
import { Scrollbar } from "@docspace/shared/components/scrollbar";

const themes = {
  Dark: Dark,
  Base: Base,
};

interface ILoginProps extends IInitialState {
  isDesktopEditor?: boolean;
  theme: IUserTheme;
  setTheme: (theme: IUserTheme) => void;
  isBaseTheme: boolean;
}

const Login: React.FC<ILoginProps> = ({
  portalSettings,
  providers,
  capabilities,
  isDesktopEditor,
  match,
  currentColorScheme,
  theme,
  setTheme,
  logoUrls,
  isBaseTheme,
}) => {
  const location = useLocation();

  const { search } = location;
  const isRestoringPortal =
    portalSettings?.tenantStatus === TenantStatus.PortalRestore;

  useEffect(() => {
    if (search) {
      const firstIndex = search.indexOf("loginData=");

      if (firstIndex === -1) return;
      const fromBinaryStr = (encodeString: string) => {
        const decodeStr = atob(encodeString);

        const decoder = new TextDecoder();
        const charCodeArray = Uint8Array.from(
          { length: decodeStr.length },
          (element, index) => decodeStr.charCodeAt(index)
        );

        return decoder.decode(charCodeArray);
      };

      const encodeString = search.slice(search.indexOf("=") + 1);

      const decodeString = fromBinaryStr(encodeString);
      const queryParams = JSON.parse(decodeString);

      setInvitationLinkData(queryParams);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    isRestoringPortal && window.location.replace("/preparation-portal");
  }, []);
  const [isLoading, setIsLoading] = useState(false);
  const [recoverDialogVisible, setRecoverDialogVisible] = useState(false);
  const [invitationLinkData, setInvitationLinkData] = useState({
    email: "",
    roomName: "",
    firstName: "",
    lastName: "",
    type: "",
  });

  const {
    enabledJoin,
    greetingSettings,
    enableAdmMess,
    cookieSettingsEnabled,
  } = portalSettings || {
    enabledJoin: false,
    greetingSettings: "",
    enableAdmMess: false,
    cookieSettingsEnabled: false,
  };

  const ssoLabel = capabilities?.ssoLabel || "";
  const ssoUrl = capabilities?.ssoUrl || "";
  const { t } = useTranslation(["Login", "Common"]);
  const mounted = useMounted();

  useIsomorphicLayoutEffect(() => {
    const systemTheme = getSystemTheme();
    const theme = themes[systemTheme];
    setTheme(theme);
    frameCallCommand("setIsLoaded");

    if (window?.AscDesktopEditor !== undefined) {
      const editorTheme = getEditorTheme(systemTheme);

      window.AscDesktopEditor.execCommand("portal:uitheme", editorTheme);
    }
  }, []);

  const ssoExists = () => {
    if (ssoUrl) return true;
    else return false;
  };

  const oauthDataExists = () => {
    if (!capabilities?.oauthEnabled) return false;

    let existProviders = 0;
    providers && providers.length > 0;
    providers?.map((item) => {
      if (!PROVIDERS_DATA[item.provider]) return;
      existProviders++;
    });

    return !!existProviders;
  };

  const onSocialButtonClick = useCallback(
    async (e: HTMLElementEvent<HTMLButtonElement | HTMLElement>) => {
      const { target } = e;
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

        const tokenGetterWin = isDesktopEditor
          ? (window.location.href = url)
          : window.open(
              url,
              "login",
              "width=800,height=500,status=no,toolbar=no,menubar=no,resizable=yes,scrollbars=no"
            );

        const code: string = await getOAuthToken(tokenGetterWin);

        const token = window.btoa(
          JSON.stringify({
            auth: providerName,
            mode: "popup",
            callback: "authCallback",
          })
        );

        if (tokenGetterWin && typeof tokenGetterWin !== "string")
          tokenGetterWin.location.href = getLoginLink(token, code);
      } catch (err) {
        console.log(err);
      }
    },
    []
  );

  const openRecoverDialog = () => {
    setRecoverDialogVisible(true);
  };

  const closeRecoverDialog = () => {
    setRecoverDialogVisible(false);
  };

  const bgPattern = getBgPattern(currentColorScheme?.id);

  const logo = logoUrls && Object.values(logoUrls)[1];
  const logoUrl = !logo
    ? undefined
    : !theme?.isBase
      ? getLogoFromPath(logo.path.dark)
      : getLogoFromPath(logo.path.light);

  if (!mounted) return <></>;
  if (isRestoringPortal) return <></>;

  const ssoProps = ssoExists()
    ? {
        ssoUrl: ssoUrl,
        ssoLabel: ssoLabel,
        ssoSVG: SSOIcon,
      }
    : {};

  const isRegisterContainerVisible = !checkIsSSR() && enabledJoin;

  return (
    <LoginFormWrapper
      id="login-page"
      enabledJoin={enabledJoin}
      isDesktop={isDesktopEditor}
      bgPattern={bgPattern}
    >
      <div className="bg-cover"></div>
      <Scrollbar id="customScrollBar">
        <LoginContent enabledJoin={enabledJoin}>
          <ColorTheme
            themeId={ThemeId.LinkForgotPassword}
            type={invitationLinkData.type}
            isRegisterContainerVisible={isRegisterContainerVisible}
          >
            <GreetingContainer
              t={t}
              roomName={invitationLinkData.roomName}
              firstName={invitationLinkData.firstName}
              lastName={invitationLinkData.lastName}
              logoUrl={logoUrl}
              greetingSettings={greetingSettings}
              type={invitationLinkData.type}
            />
            <FormWrapper id="login-form" theme={theme}>
              <LoginForm
                isBaseTheme={isBaseTheme}
                recaptchaPublicKey={portalSettings?.recaptchaPublicKey}
                isDesktop={!!isDesktopEditor}
                isLoading={isLoading}
                hashSettings={portalSettings?.passwordHash}
                setIsLoading={setIsLoading}
                match={match}
                enableAdmMess={enableAdmMess}
                cookieSettingsEnabled={cookieSettingsEnabled}
                emailFromInvitation={invitationLinkData.email}
              />
              {(oauthDataExists() || ssoExists()) && (
                <>
                  <div className="line">
                    <Text className="or-label">
                      {t("Common:orContinueWith")}
                    </Text>
                  </div>
                  <SocialButtonsGroup
                    providers={providers}
                    onClick={onSocialButtonClick}
                    t={t}
                    isDisabled={isLoading}
                    {...ssoProps}
                  />
                </>
              )}

              {enableAdmMess && (
                <Link
                  fontWeight="600"
                  fontSize="13px"
                  type="action"
                  isHovered={true}
                  className="login-link recover-link"
                  onClick={openRecoverDialog}
                >
                  {t("RecoverAccess")}
                </Link>
              )}
            </FormWrapper>

            {recoverDialogVisible && (
              <RecoverAccessModalDialog
                visible={recoverDialogVisible}
                onClose={closeRecoverDialog}
                textBody={t("RecoverTextBody")}
                emailPlaceholderText={t("RecoverContactEmailPlaceholder")}
                id="recover-access-modal"
              />
            )}
          </ColorTheme>
        </LoginContent>

        {isRegisterContainerVisible && (
          <Register
            id="login_register"
            enabledJoin={enabledJoin}
            currentColorScheme={currentColorScheme}
            trustedDomains={portalSettings?.trustedDomains}
            trustedDomainsType={portalSettings?.trustedDomainsType}
          />
        )}
      </Scrollbar>
    </LoginFormWrapper>
  );
};

export default inject(({ loginStore }) => {
  return {
    theme: loginStore.theme,
    setTheme: loginStore.setTheme,
    isBaseTheme: loginStore.theme.isBase,
  };
})(observer(Login));
