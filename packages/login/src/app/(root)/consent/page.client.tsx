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

import React from "react";
import styled from "styled-components";
import { useTranslation, Trans } from "react-i18next";
import { useRouter } from "next/navigation";

import { ScopeList } from "@docspace/shared/utils/oauth/scope-list";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";
import { Link, LinkTarget, LinkType } from "@docspace/shared/components/link";
import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@docspace/shared/components/avatar";
import {
  getOAuthJWTSignature,
  setOAuthJWTSignature,
} from "@docspace/shared/api/oauth";
import {
  getCookie,
  deleteCookie,
  setCookie,
} from "@docspace/shared/utils/cookie";
import { IClientProps, TScope } from "@docspace/shared/utils/oauth/types";
import { TUser } from "@docspace/shared/api/people/types";
import api from "@docspace/shared/api";
import { FormWrapper } from "@docspace/shared/components/form-wrapper";

import { getRedirectURL } from "@/utils";
import OAuthClientInfo from "../../../components/ConsentInfo";

const StyledButtonContainer = styled.div`
  margin-top: 32px;
  margin-bottom: 16px;

  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 8px;
`;

const StyledDescriptionContainer = styled.div`
  width: 100%;

  margin-bottom: 16px;

  p {
    width: 100%;
  }
`;

const StyledUserContainer = styled.div`
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
`;

interface IConsentProps {
  client: IClientProps;
  scopes: TScope[];
  user: TUser;
  baseUrl?: string;
  currentScopesProp?: string[];
}

const Consent = ({
  client,
  scopes,
  currentScopesProp,
  user,
  baseUrl,
}: IConsentProps) => {
  const { t } = useTranslation(["Consent", "Common"]);
  const router = useRouter();

  const [isAllowRunning, setIsAllowRunning] = React.useState(false);
  const [isDenyRunning, setIsDenyRunning] = React.useState(false);

  const [currentScopes, setCurrentScopes] = React.useState<string[]>(
    currentScopesProp || [],
  );

  React.useEffect(() => {
    const redirect_url = getCookie("x-redirect-authorization-uri");
    if (!redirect_url || !scopes.length) return;

    // Your cookie processing logic here
    const decodedRedirectUrl = window.atob(
      redirect_url.replace(/-/g, "+").replace(/_/g, "/"),
    );

    deleteCookie("x-redirect-authorization-uri");

    const splitedURL = decodedRedirectUrl.split("&scope=");

    if (splitedURL[1]) {
      const scopesStr = splitedURL[1].split("&")?.[0];

      const decodedScopesStr = window.decodeURIComponent(scopesStr);

      const splitedScopes: string[] = [];

      scopes.forEach((scope) => {
        if (decodedScopesStr.includes(scope.name)) {
          splitedScopes.push(scope.name);
        }
      });

      setCookie("x-scopes", splitedScopes.join(";"));

      setCurrentScopes(splitedScopes);
    }
    setCookie("x-url", splitedURL[0]);
  }, [scopes]);

  React.useEffect(() => {
    const validateToken = async () => {
      if (!user.id) return;

      const token = getOAuthJWTSignature(user.id);

      if (token) return;

      await setOAuthJWTSignature(user.id);

      const redirect_url = getRedirectURL();

      if (!redirect_url) {
        return;
      }

      window.location.replace(redirect_url);
    };

    validateToken();
  }, [user.id]);

  const onAllowClick = async () => {
    if (!("clientId" in client)) return;

    if (isAllowRunning || isDenyRunning) return;

    setIsAllowRunning(true);

    const clientId = client.clientId;

    let clientState = "";

    const cookie = document.cookie.split(";");

    cookie.forEach((c) => {
      if (c.includes("client_state"))
        clientState = c.replace("client_state=", "").trim();
    });

    await api.oauth.onOAuthSubmit(
      clientId,
      clientState,
      currentScopes,
      user.id,
    );

    setIsAllowRunning(false);
  };

  const onDenyClick = async () => {
    if (!("clientId" in client)) return;

    if (isAllowRunning || isDenyRunning) return;

    setIsDenyRunning(true);

    const clientId = client.clientId;

    let clientState = "";

    const cookie = document.cookie.split(";");

    cookie.forEach((c) => {
      if (c.includes("client_state"))
        clientState = c.replace("client_state=", "").trim();
    });

    deleteCookie("client_state");

    await api.oauth.onOAuthCancel(clientId, clientState, user.id);

    setIsDenyRunning(false);
  };

  const onChangeUserClick = async () => {
    await api.user.logout();

    if (baseUrl) {
      window.location.replace(
        `${baseUrl}/login?client_id=${client.clientId}&type=oauth2`,
      );

      return;
    }

    router.push(`/?client_id=${client.clientId}&type=oauth2`);
  };

  return (
    <FormWrapper>
      <OAuthClientInfo
        name={client.name}
        logo={client.logo}
        websiteUrl={client.websiteUrl}
        isConsentScreen
      />

      <ScopeList t={t} selectedScopes={currentScopes} scopes={scopes || []} />

      <StyledButtonContainer>
        <Button
          onClick={onAllowClick}
          label={t("AllowButton")}
          size={ButtonSize.normal}
          scale
          primary
          isDisabled={isDenyRunning}
          isLoading={isAllowRunning}
          testId="consent_allow_button"
        />
        <Button
          onClick={onDenyClick}
          label={t("DenyButton")}
          size={ButtonSize.normal}
          scale
          isDisabled={isAllowRunning}
          isLoading={isDenyRunning}
          testId="consent_deny_button"
        />
      </StyledButtonContainer>
      <StyledDescriptionContainer>
        <Text fontWeight={400} fontSize="13px" lineHeight="20px">
          <Trans t={t} i18nKey="ConsentDescription" ns="Consent">
            Data shared with {{ displayName: user.displayName }} will be
            governed by {{ nameApp: client.name }}
            <Link
              className="login-link"
              type={LinkType.page}
              isHovered={false}
              href={client.policyUrl}
              target={LinkTarget.blank}
              noHover
              dataTestId="privacy_policy_link"
            >
              privacy policy
            </Link>
            and
            <Link
              className="login-link"
              type={LinkType.page}
              isHovered={false}
              href={client.termsUrl}
              target={LinkTarget.blank}
              noHover
              dataTestId="terms_of_service_link"
            >
              terms of service
            </Link>
            . You can revoke this consent at any time in your{" "}
            {{ productName: t("Common:ProductName") }} account settings.
          </Trans>
        </Text>
      </StyledDescriptionContainer>
      <StyledUserContainer>
        <div className="block">
          <Avatar
            size={AvatarSize.min}
            role={AvatarRole.user}
            source={user.avatarSmall || ""}
          />
          <div className="user-info">
            <Text lineHeight="20px">
              {t("SignedInAs")} {user.email}
            </Text>
            <Link
              className="login-link"
              type={LinkType.action}
              isHovered={false}
              noHover
              lineHeight="20px"
              onClick={onChangeUserClick}
              dataTestId="not_you_link"
            >
              {t("NotYou")}
            </Link>
          </div>
        </div>
      </StyledUserContainer>
    </FormWrapper>
  );
};

export default Consent;
