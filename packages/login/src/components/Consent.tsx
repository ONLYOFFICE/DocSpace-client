/* eslint-disable @next/next/no-img-element */
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

import React from "react";
import styled from "styled-components";
import { useTranslation, Trans } from "react-i18next";

import ScopeList from "@docspace/shared/utils/oauth/ScopeList";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";
import { Link, LinkTarget, LinkType } from "@docspace/shared/components/link";
import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@docspace/shared/components/avatar";
import { deleteCookie } from "@docspace/shared/utils/cookie";
import { IClientProps, TScope } from "@docspace/shared/utils/oauth/types";
import { TUser } from "@docspace/shared/api/people/types";
import api from "@docspace/shared/api";

import OAuthClientInfo from "./ConsentInfo";
import { useRouter } from "next/navigation";
import { FormWrapper } from "@docspace/shared/components/form-wrapper";

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
}

const Consent = ({ client, scopes, user }: IConsentProps) => {
  const { t } = useTranslation(["Consent", "Common"]);
  const router = useRouter();

  const [isAllowRunning, setIsAllowRunning] = React.useState(false);
  const [isDenyRunning, setIsDenyRunning] = React.useState(false);

  const onAllowClick = async () => {
    if (!("clientId" in client)) return;

    if (isAllowRunning || isDenyRunning) return;

    setIsAllowRunning(true);

    const clientId = client.clientId;

    let clientState = "";

    const scope = client.scopes;

    const cookie = document.cookie.split(";");

    cookie.forEach((c) => {
      if (c.includes("client_state"))
        clientState = c.replace("client_state=", "").trim();
    });

    await api.oauth.onOAuthSubmit(clientId, clientState, scope);

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

    await api.oauth.onOAuthCancel(clientId, clientState);

    setIsDenyRunning(false);
  };

  const onChangeUserClick = async () => {
    await api.user.logout();

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

      <ScopeList
        t={t}
        selectedScopes={client.scopes || []}
        scopes={scopes || []}
      />

      <StyledButtonContainer>
        <Button
          onClick={onAllowClick}
          label={"Allow"}
          size={ButtonSize.normal}
          scale
          primary
          isDisabled={isDenyRunning}
          isLoading={isAllowRunning}
        />
        <Button
          onClick={onDenyClick}
          label={"Deny"}
          size={ButtonSize.normal}
          scale
          isDisabled={isAllowRunning}
          isLoading={isDenyRunning}
        />
      </StyledButtonContainer>
      <StyledDescriptionContainer>
        <Text fontWeight={400} fontSize={"13px"} lineHeight={"20px"}>
          <Trans t={t} i18nKey={"ConsentDescription"} ns="Consent">
            Data shared with {{ displayName: user.displayName }} will be
            governed by {{ nameApp: client.name }}
            <Link
              className={"login-link"}
              type={LinkType.page}
              isHovered={false}
              href={client.policyUrl}
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
              href={client.termsUrl}
              target={LinkTarget.blank}
              noHover
            >
              terms of service
            </Link>
            . You can revoke this consent at any time in your DocSpace account
            settings.
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
            <Text lineHeight={"20px"}>
              {t("SignedInAs")} {user.email}
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
      </StyledUserContainer>
    </FormWrapper>
  );
};

export default Consent;
