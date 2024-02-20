import React, { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { ButtonsWrapper, LoginFormWrapper, LoginContent } from "./StyledLogin";
import { Text } from "@docspace/shared/components/text";
import { SocialButtonsGroup } from "@docspace/shared/components/social-buttons-group";
import {
  getProviderTranslation,
  getOAuthToken,
  getLoginLink,
} from "@docspace/shared/utils/common";
import { Link } from "@docspace/shared/components/link";
import { checkIsSSR } from "@docspace/shared/utils";
import { PROVIDERS_DATA } from "@docspace/shared/constants";
import { Toast } from "@docspace/shared/components/toast";
import LoginForm from "./sub-components/LoginForm";
import RecoverAccessModalDialog from "@docspace/shared/components/recover-access-modal-dialog/RecoverAccessModalDialog";
import { FormWrapper } from "@docspace/shared/components/form-wrapper";
import Register from "./sub-components/register-container";
import { ColorTheme, ThemeId } from "@docspace/shared/components/color-theme";
import SSOIcon from "PUBLIC_DIR/images/sso.react.svg";
import { Dark, Base } from "@docspace/shared/themes";
import { useMounted } from "../helpers/useMounted";
import { getBgPattern, frameCallCommand } from "@docspace/shared/utils/common";
import useIsomorphicLayoutEffect from "../hooks/useIsomorphicLayoutEffect";
import { getLogoFromPath, getSystemTheme } from "@docspace/shared/utils";
import { TenantStatus } from "@docspace/shared/enums";

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
  const isRestoringPortal =
    portalSettings?.tenantStatus === TenantStatus.PortalRestore;

  useEffect(() => {
    isRestoringPortal && window.location.replace("/preparation-portal");
  }, []);
  const [isLoading, setIsLoading] = useState(false);
  const [recoverDialogVisible, setRecoverDialogVisible] = useState(false);

  const {
    enabledJoin,
    greetingSettings,
    enableAdmMess,
    cookieSettingsEnabled,
  } = portalSettings || {
    enabledJoin: false,
    greetingSettings: false,
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
        ssoLabel: ssoLabel || getProviderTranslation("sso", t),
        ssoSVG: SSOIcon,
      }
    : {};
  return (
    <LoginFormWrapper
      id="login-page"
      enabledJoin={enabledJoin}
      isDesktop={isDesktopEditor}
      bgPattern={bgPattern}
    >
      <div className="bg-cover"></div>
      <LoginContent enabledJoin={enabledJoin}>
        <ColorTheme themeId={ThemeId.LinkForgotPassword}>
          <img src={logoUrl} className="logo-wrapper" />
          <Text
            fontSize="23px"
            fontWeight={700}
            textAlign="center"
            className="greeting-title"
          >
            {greetingSettings}
          </Text>
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
            />
            {(oauthDataExists() || ssoExists()) && (
              <>
                <div className="line">
                  <Text className="or-label">{t("Common:orContinueWith")}</Text>
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
          <Toast />

          <RecoverAccessModalDialog
            visible={recoverDialogVisible}
            onClose={closeRecoverDialog}
            textBody={t("RecoverTextBody")}
            emailPlaceholderText={t("RecoverContactEmailPlaceholder")}
            id="recover-access-modal"
          />
        </ColorTheme>
      </LoginContent>

      {!checkIsSSR() && enabledJoin && (
        <Register
          id="login_register"
          enabledJoin={enabledJoin}
          currentColorScheme={currentColorScheme}
          trustedDomains={portalSettings?.trustedDomains}
          trustedDomainsType={portalSettings?.trustedDomainsType}
        />
      )}
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
