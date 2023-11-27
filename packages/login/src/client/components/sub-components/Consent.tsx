import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { useTranslation, Trans } from "react-i18next";

//@ts-ignore
import api from "@docspace/common/api";

import ScopeList from "@docspace/common/utils/oauth/ScopeList";

//@ts-ignore
import FormWrapper from "@docspace/components/form-wrapper";
//@ts-ignore
import Button from "@docspace/components/button";
//@ts-ignore
import Text from "@docspace/components/text";
//@ts-ignore
import Link from "@docspace/components/link";
//@ts-ignore
import Avatar from "@docspace/components/avatar";
//@ts-ignore
import { Base } from "@docspace/components/themes";

import OAuthClientInfo from "./oauth-client-info";
import { deleteCookie, setCookie } from "@docspace/common/utils";

const StyledFormWrapper = styled(FormWrapper)`
  width: 416px;
  max-width: 416px;

  .button-container {
    margin-top: 32px;
    margin-bottom: 16px;

    width: 100%;
    display: flex;
    gap: 8px;
  }

  .description-container {
    width: 100%;

    margin-bottom: 16px;

    p {
      width: 100%;
    }
  }

  .user-container {
    width: 100%;

    padding-top: 16px;

    border-top: 1px solid ${(props) => props.theme.separatorColor};

    .block {
      height: 40px;

      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
`;

StyledFormWrapper.defaultProps = { theme: Base };

interface IConsentProps {
  oauth: IOAuthState;
  theme: IUserTheme;
  hashSettings: null | PasswordHashType;
  setHashSettings: (hashSettings: PasswordHashType | null) => void;
  setIsConsentScreen: (value: boolean) => void;
}

const Consent = ({
  oauth,
  theme,
  setIsConsentScreen,
  hashSettings,
  setHashSettings,
}: IConsentProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { t } = useTranslation(["Consent", "Common"]);

  const onAllowClick = async () => {
    const clientId = oauth.clientId;

    let clientState = "";
    const scope = oauth.client.scopes;

    setCookie("client_id", clientId);

    await api.oauth.onOAuthLogin();

    const cookie = document.cookie.split(";");

    cookie.forEach((c) => {
      if (c.includes("client_state"))
        clientState = c.replace("client_state=", "").trim();
    });

    console.log(clientState);

    // deleteCookie("client_id");
    // deleteCookie("client_state");

    await api.oauth.onOAuthSubmit(clientId, clientState, scope);
  };

  const onDenyClick = async () => {
    const clientId = oauth.clientId;

    let clientState = "";

    setCookie("client_id", clientId);

    await api.oauth.onOAuthLogin();

    const cookie = document.cookie.split(";");

    cookie.forEach((c) => {
      if (c.includes("client_state"))
        clientState = c.replace("client_state=", "").trim();
    });

    deleteCookie("client_id");
    deleteCookie("client_state");

    await api.oauth.onOAuthCancel(clientId, clientState);
  };

  const onChangeUserClick = async () => {
    await api.user.logout();
    if (!hashSettings) {
      const portalSettings = await api.settings.getSettings();

      setHashSettings(portalSettings.passwordHash);
    }

    setIsConsentScreen(false);
    navigate(`/login/${location.search}`);
  };

  return (
    <StyledFormWrapper id={"consent"} theme={theme}>
      <OAuthClientInfo
        name={oauth.client.name}
        logo={oauth.client.logo}
        websiteUrl={oauth.client.websiteUrl}
        isConsentScreen
        t={t}
      />

      <ScopeList
        t={t}
        selectedScopes={oauth.client.scopes || []}
        scopes={oauth.scopes || []}
      />

      <div className="button-container">
        <Button
          onClick={onAllowClick}
          label={"Allow"}
          size={"normal"}
          scale
          primary
        />
        <Button onClick={onDenyClick} label={"Deny"} size={"normal"} scale />
      </div>
      <div className="description-container">
        <Text fontWeight={400} fontSize={"13px"} lineHeight={"20px"}>
          <Trans t={t} i18nKey={"ConsentDescription"} ns="Consent">
            Data shared with {{ displayName: oauth.self?.displayName }} will be
            governed by {{ nameApp: oauth.client.name }}
            <Link
              className={"login-link"}
              type="page"
              isHovered={false}
              href={oauth.client.policyUrl}
              target={"_blank"}
              noHover
            >
              privacy policy
            </Link>
            and
            <Link
              className={"login-link"}
              type="page"
              isHovered={false}
              href={oauth.client.termsUrl}
              target={"_blank"}
              noHover
            >
              terms of service
            </Link>
            . You can revoke this consent at any time in your DocSpace account
            settings.
          </Trans>
        </Text>
      </div>
      <div className="user-container">
        <div className="block">
          <Avatar size={"min"} source={oauth.self?.avatarSmall} />
          <div className="user-info">
            <Text lineHeight={"20px"}>
              {t("SignedInAs")} {oauth.self?.email}
            </Text>
            <Link
              className={"login-link"}
              type="action"
              isHovered={false}
              noHover
              lineHeight={"20px"}
              onClick={onChangeUserClick}
            >
              {t("NotYou")}
            </Link>
          </div>
        </div>
      </div>
    </StyledFormWrapper>
  );
};

export default Consent;
