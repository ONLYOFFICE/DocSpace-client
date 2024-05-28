import React, { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { ButtonsWrapper, LoginFormWrapper, LoginContent } from "./StyledLogin";
import { Text } from "@docspace/shared/components/text";
import { SocialButton } from "@docspace/shared/components/social-button";
import {
  getProviderTranslation,
  getOAuthToken,
  getLoginLink,
} from "@docspace/shared/utils/common";
import { checkIsSSR } from "@docspace/shared/utils";
import { PROVIDERS_DATA } from "@docspace/shared/constants";
import { Link } from "@docspace/shared/components/link";
import { Toast } from "@docspace/shared/components/toast";
import LoginForm from "./sub-components/LoginForm";
import RecoverAccessModalDialog from "@docspace/shared/components/recover-access-modal-dialog/RecoverAccessModalDialog";
import MoreLoginModal from "@docspace/shared/components/more-login-modal";
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
import Consent from "./sub-components/Consent";
import { IClientProps, IScope } from "@docspace/common/utils/oauth/interfaces";

const themes = {
  Dark: Dark,
  Base: Base,
};

interface ILoginProps extends IInitialState {
  isDesktopEditor?: boolean;
  theme: IUserTheme;
  setTheme: (theme: IUserTheme) => void;
  isBaseTheme: boolean;
  isConsent?: boolean;
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
  oauth,
  isConsent,
}) => {
  const isOAuthPage = !!oauth?.client.name;

  const isRestoringPortal =
    portalSettings?.tenantStatus === TenantStatus.PortalRestore;

  useEffect(() => {
    isRestoringPortal && window.location.replace("/preparation-portal");
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const [moreAuthVisible, setMoreAuthVisible] = useState(false);
  const [recoverDialogVisible, setRecoverDialogVisible] = useState(false);
  const [isConsentPage, setIsConsentPage] = useState(
    isConsent || oauth?.isConsent
  );
  const [scopes, setScopes] = useState(oauth?.scopes || ([] as IScope[]));
  const [oauthClient, setOAuthClient] = useState(
    oauth?.client || ({} as IClientProps)
  );
  const [self, setSelf] = useState(oauth?.self || ({} as ISelf));
  const [hashSettings, setHashSettings] = useState<null | PasswordHashType>(
    null
  );

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

  const ssoButton = () => {
    const onClick = () => (window.location.href = ssoUrl);
    return (
      <div className="buttonWrapper">
        <SocialButton
          IconComponent={SSOIcon}
          className="socialButton"
          label={ssoLabel || getProviderTranslation("sso", t)}
          onClick={onClick}
          isDisabled={isLoading}
        />
      </div>
    );
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

  const providerButtons = () => {
    const providerButtons =
      providers &&
      providers.map((item, index) => {
        if (!PROVIDERS_DATA[item.provider]) return;
        if (index > 1) return;

        const { icon, label, iconOptions, className } =
          PROVIDERS_DATA[item.provider];

        return (
          <div className="buttonWrapper" key={`${item.provider}ProviderItem`}>
            <SocialButton
              iconName={icon}
              label={getProviderTranslation(label, t)}
              className={`socialButton ${className ? className : ""}`}
              $iconOptions={iconOptions}
              data-url={item.url}
              data-providername={item.provider}
              onClick={onSocialButtonClick}
              isDisabled={isLoading}
            />
          </div>
        );
      });

    return providerButtons;
  };

  const moreAuthOpen = () => {
    setMoreAuthVisible(true);
  };

  const moreAuthClose = () => {
    setMoreAuthVisible(false);
  };

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
          {isConsentPage && isOAuthPage ? (
            <Consent
              oauth={{ ...oauth, scopes, client: oauthClient, self }}
              theme={theme}
              hashSettings={portalSettings?.passwordHash || hashSettings}
              setHashSettings={setHashSettings}
              setIsConsentScreen={setIsConsentPage}
            />
          ) : (
            <>
              <FormWrapper id="login-form" theme={theme}>
                {ssoExists() && !isOAuthPage && (
                  <ButtonsWrapper>{ssoButton()}</ButtonsWrapper>
                )}
                {oauthDataExists() && !isOAuthPage && (
                  <>
                    <ButtonsWrapper>{providerButtons()}</ButtonsWrapper>
                    {providers && providers.length > 2 && (
                      <Link
                        isHovered
                        type="action"
                        fontSize="13px"
                        fontWeight="600"
                        color={currentColorScheme?.main?.accent}
                        className="more-label"
                        onClick={moreAuthOpen}
                      >
                        {t("Common:ShowMore")}
                      </Link>
                    )}
                  </>
                )}
                {(oauthDataExists() || ssoExists()) && !isOAuthPage && (
                  <div className="line">
                    <Text className="or-label">{t("Or")}</Text>
                  </div>
                )}
                <LoginForm
                  isBaseTheme={isBaseTheme}
                  recaptchaPublicKey={portalSettings?.recaptchaPublicKey}
                  isDesktop={!!isDesktopEditor}
                  isLoading={isLoading}
                  hashSettings={portalSettings?.passwordHash || hashSettings}
                  setIsLoading={setIsLoading}
                  openRecoverDialog={openRecoverDialog}
                  match={match}
                  enableAdmMess={enableAdmMess}
                  cookieSettingsEnabled={cookieSettingsEnabled}
                  isOAuthPage={isOAuthPage}
                  oauth={oauth}
                  setIsConsentPage={setIsConsentPage}
                  setScopes={setScopes}
                  setOAuthClient={setOAuthClient}
                  setSelf={setSelf}
                />
              </FormWrapper>
              <Toast />
              <MoreLoginModal
                visible={moreAuthVisible}
                onClose={moreAuthClose}
                providers={providers}
                onSocialLoginClick={onSocialButtonClick}
                ssoLabel={ssoLabel}
                ssoUrl={ssoUrl}
                t={t}
              />
              <RecoverAccessModalDialog
                visible={recoverDialogVisible}
                onClose={closeRecoverDialog}
                textBody={t("RecoverTextBody")}
                emailPlaceholderText={t("RecoverContactEmailPlaceholder")}
                id="recover-access-modal"
              />
            </>
          )}
        </ColorTheme>
      </LoginContent>

      {!checkIsSSR() && !oauth?.self && enabledJoin && (
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
