import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { useTranslation, Trans } from "react-i18next";

import api from "@docspace/shared/api";

import ScopeList from "@docspace/shared/utils/oauth/ScopeList";

import { FormWrapper } from "@docspace/shared/components/form-wrapper";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";
import { Link, LinkTarget, LinkType } from "@docspace/shared/components/link";
import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@docspace/shared/components/avatar";
import { Base } from "@docspace/shared/themes";

import OAuthClientInfo from "./oauth-client-info";
import { deleteCookie, setCookie } from "@docspace/shared/utils/cookie";

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

    border-top: 1px solid
      ${(props) => props.theme.oauth.infoDialog.separatorColor};

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

    await api.oauth.onOAuthLogin(clientId);

    const cookie = document.cookie.split(";");

    cookie.forEach((c) => {
      if (c.includes("client_state"))
        clientState = c.replace("client_state=", "").trim();
    });

    deleteCookie("client_state");

    await api.oauth.onOAuthSubmit(clientId, clientState, scope);
  };

  const onDenyClick = async () => {
    const clientId = oauth.clientId;

    let clientState = "";

    await api.oauth.onOAuthLogin(clientId);

    const cookie = document.cookie.split(";");

    cookie.forEach((c) => {
      if (c.includes("client_state"))
        clientState = c.replace("client_state=", "").trim();
    });

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
    <StyledFormWrapper id={"consent"}>
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
          size={ButtonSize.normal}
          scale
          primary
        />
        <Button
          onClick={onDenyClick}
          label={"Deny"}
          size={ButtonSize.normal}
          scale
        />
      </div>
      <div className="description-container">
        <Text fontWeight={400} fontSize={"13px"} lineHeight={"20px"}>
          <Trans t={t} i18nKey={"ConsentDescription"} ns="Consent">
            Data shared with {{ displayName: oauth.self?.displayName }} will be
            governed by {{ nameApp: oauth.client.name }}
            <Link
              className={"login-link"}
              type={LinkType.page}
              isHovered={false}
              href={oauth.client.policyUrl}
              target={LinkTarget.blank}
              noHover
            >
              privacy policy
            </Link>
            and
            <Link
              className={"login-link"}
              type={LinkType.page}
              isHovered={false}
              href={oauth.client.termsUrl}
              target={LinkTarget.blank}
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
          <Avatar
            size={AvatarSize.min}
            role={AvatarRole.user}
            source={oauth.self?.avatarSmall || ""}
          />
          <div className="user-info">
            <Text lineHeight={"20px"}>
              {t("SignedInAs")} {oauth.self?.email}
            </Text>
            <Link
              className={"login-link"}
              type={LinkType.action}
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
