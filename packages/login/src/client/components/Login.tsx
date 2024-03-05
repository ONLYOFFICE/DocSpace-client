import React, { useState, useCallback, useEffect, useMemo } from "react";
import {} from "react-router-dom";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { useLocation, useSearchParams } from "react-router-dom";

import { LoginFormWrapper, LoginContent } from "./StyledLogin";
import { Text } from "@docspace/shared/components/text";
import { SocialButtonsGroup } from "@docspace/shared/components/social-buttons-group";
import {
  getOAuthToken,
  getLoginLink,
  mapCulturesToArray,
} from "@docspace/shared/utils/common";
import { Link } from "@docspace/shared/components/link";
import { checkIsSSR, getCookie } from "@docspace/shared/utils";
import {
  COOKIE_EXPIRATION_YEAR,
  LANGUAGE,
  PROVIDERS_DATA,
} from "@docspace/shared/constants";
import { Toast } from "@docspace/shared/components/toast";
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

import { setCookie } from "@docspace/shared/utils/cookie";
import { ComboBox } from "@docspace/shared/components/combobox";

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
  cultures,
}) => {
  const location = useLocation();

  const { search } = location;
  const isRestoringPortal =
    portalSettings?.tenantStatus === TenantStatus.PortalRestore;

  let [searchParams] = useSearchParams();

  const cultureNames = useMemo(
    () => mapCulturesToArray(cultures, false),
    [cultures]
  );

  const culture = searchParams.get("culture");

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

    const cultureName = culture ?? getCookie(LANGUAGE);
    setCurrantCultureName(cultureName);

    isRestoringPortal && window.location.replace("/preparation-portal");
  }, []);

  const [currentCultureName, setCurrantCultureName] = useState("en-GB");
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

  const selectedCultureObj = cultureNames.find(
    (item) => item.key === currentCultureName
  );

  const onLanguageSelect = (e) => {
    setCookie(LANGUAGE, e.key, {
      "max-age": COOKIE_EXPIRATION_YEAR,
    });

    if (culture) {
      window.location.href = window.location.href.replace(
        `culture=${culture}`,
        `culture=${e.key}`
      );
      return;
    }

    window.location.reload();
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
          <ComboBox
            className="language-combo-box"
            directionY={"both"}
            options={cultureNames}
            selectedOption={selectedCultureObj}
            onSelect={onLanguageSelect}
            isDisabled={false}
            scaled={false}
            scaledOptions={false}
            size="content"
            showDisabledItems={true}
            dropDownMaxHeight={200}
            manualWidth="70px"
            fillIcon={false}
            modernView
            displaySelectedOption
          />
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
              <Toast />

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
