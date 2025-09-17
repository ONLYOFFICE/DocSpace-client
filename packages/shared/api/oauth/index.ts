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

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { request } from "../client";

import { transformToClientProps } from "../../utils/oauth";
import { getCookie, setCookie } from "../../utils/cookie";

import {
  IClientProps,
  IClientResDTO,
  IClientListProps,
  IClientListDTO,
  TScope,
  IClientReqDTO,
  TConsentData,
  TConsentList,
  TGenerateDeveloperToken,
  TIntrospectDeveloperToken,
} from "../../utils/oauth/types";

const STORAGE_KEY = "x-signature";

const getOAuth2Headers = () => {
  let token = getCookie(STORAGE_KEY);

  if (!token) {
    token = localStorage.getItem(STORAGE_KEY);

    if (!token) return {};
  }

  return {
    [STORAGE_KEY]: token,
  };
};

export const getClient = async (clientId: string): Promise<IClientProps> => {
  const hdrs = getOAuth2Headers();
  const client = (await request(
    {
      method: "get",
      url: `/clients/${clientId}`,
      headers: hdrs,
    },
    false,
    true,
  )) as IClientResDTO;

  return transformToClientProps(client);
};

export const getClientList = async (
  page: number,
  limit: number,
  signal?: AbortSignal,
): Promise<IClientListProps> => {
  const hdrs = getOAuth2Headers();
  const data = (await request(
    {
      method: "get",
      url: `/clients?page=${page}&limit=${limit}`,
      headers: hdrs,
      signal,
    },
    false,
    true,
  )) as IClientListDTO;

  const clients: IClientListProps = { ...data, data: [] };

  data.data.forEach((item) => {
    const client = transformToClientProps(item);

    clients.data.push({ ...client });
  });

  return clients;
};

export const addClient = async (
  dataParam: IClientReqDTO,
): Promise<IClientProps> => {
  const hdrs = getOAuth2Headers();
  const data = { ...dataParam };
  data.logout_redirect_uri = data.website_url;

  const client = (await request(
    {
      method: "post",
      url: `/clients`,
      data,
      headers: hdrs,
    },
    false,
    true,
  )) as IClientResDTO;

  return transformToClientProps(client);
};

export const updateClient = async (clientId: string, data: IClientReqDTO) => {
  const hdrs = getOAuth2Headers();

  await request(
    {
      method: "put",
      url: `/clients/${clientId}`,
      data,
      headers: hdrs,
    },
    false,
    true,
  );
};

export const changeClientStatus = async (
  clientId: string,
  status: boolean,
): Promise<void> => {
  const hdrs = getOAuth2Headers();

  await request(
    {
      method: "patch",
      url: `/clients/${clientId}/activation`,
      data: { status },
      headers: hdrs,
    },
    false,
    true,
  );
};

export const regenerateSecret = async (
  clientId: string,
): Promise<{ client_secret: string }> => {
  const hdrs = getOAuth2Headers();

  const clientSecret = (await request(
    {
      method: "patch",
      url: `/clients/${clientId}/regenerate`,
      headers: hdrs,
    },
    false,
    true,
  )) as { client_secret: string };

  return clientSecret;
};

export const deleteClient = async (clientId: string): Promise<void> => {
  const hdrs = getOAuth2Headers();

  await request(
    {
      method: "delete",
      url: `/clients/${clientId}`,
      headers: hdrs,
    },
    false,
    true,
  );
};

export const getScope = async (name: string): Promise<TScope> => {
  const hdrs = getOAuth2Headers();

  const scope = (await request(
    {
      method: "get",
      url: `/scopes/${name}`,
      headers: hdrs,
    },
    false,
    true,
  )) as TScope;

  return scope;
};

export const getScopeList = async (signal?: AbortSignal): Promise<TScope[]> => {
  const hdrs = getOAuth2Headers();

  const scopeList = (await request(
    {
      method: "get",
      url: `/scopes`,
      headers: hdrs,
      signal,
    },
    false,
    true,
  )) as TScope[];

  return scopeList;
};

export const getJWTToken = () => {
  return request<string>({
    method: "get",
    url: "/security/oauth2/token",
  });
};

export function getOAuthJWTSignature(userId: string) {
  let token = getCookie(`${STORAGE_KEY}-${userId}`);

  if (!token) {
    token = localStorage.getItem(`${STORAGE_KEY}-${userId}`);

    if (!token) return;
  }

  const tokenPayload = JSON.parse(
    window.atob(token!.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
  );

  // Get the token's original expiration time
  const tokenExpDate = new Date(tokenPayload.exp * 1000); // Convert seconds to milliseconds

  // Check expired token
  if (tokenExpDate < new Date()) return;

  setCookie(STORAGE_KEY, token, { expires: tokenExpDate });
  localStorage.setItem(STORAGE_KEY, token);

  return token;
}

export async function setOAuthJWTSignature(userId: string) {
  const token = await getJWTToken()!;

  // Parse the token payload to extract information
  const tokenPayload = JSON.parse(
    window.atob(token!.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
  );

  // Get the token's original expiration time
  const tokenExpDate = new Date(tokenPayload.exp * 1000); // Convert seconds to milliseconds

  setCookie(`${STORAGE_KEY}-${userId}`, token, { expires: tokenExpDate });
  setCookie(STORAGE_KEY, token, { expires: tokenExpDate });

  localStorage.setItem(`${STORAGE_KEY}-${userId}`, token);
  localStorage.setItem(STORAGE_KEY, token);

  return token;
}

export const getConsentList = async (
  page: number = 0,
  limit: number = 50,
): Promise<TConsentList & { consents: IClientProps[] }> => {
  const hdrs = getOAuth2Headers();

  const consentList = (await request(
    {
      method: "get",
      url: `/clients/consents?page=${page}&limit=${limit}`,
      headers: hdrs,
    },
    false,
    true,
  )) as TConsentList;

  const consents: IClientProps[] = [];

  consentList.data.forEach(
    ({ client, invalidated, modified_at }: TConsentData) => {
      if (!client) return;
      const consentClient: IClientResDTO = {
        ...client,
        client_secret: "",
        logout_redirect_uri: "",
      };

      const cl = transformToClientProps(consentClient);

      if (!invalidated) consents.push({ ...cl, modifiedOn: modified_at });
    },
  );

  return { ...consentList, consents };
};

export const revokeUserClient = async (clientId: string): Promise<void> => {
  const hdrs = getOAuth2Headers();

  await request(
    {
      method: "delete",
      url: `/clients/${clientId}/revoke`,
      headers: hdrs,
    },
    false,
    true,
  );
};

export const onOAuthSubmit = async (
  clientId: string,
  clientState: string,
  scope: string[],
  userId: string,
) => {
  const hdrs = getOAuth2Headers();

  const formData = new FormData();

  const token = getOAuthJWTSignature(userId);

  if (!token) await setOAuthJWTSignature(userId);

  formData.append("client_id", clientId);
  formData.append("state", clientState);

  scope.forEach((s) => {
    formData.append("scope", s);
  });

  return request(
    {
      method: "post",
      url: `/oauth2/authorize`,
      data: formData,
      withRedirect: true,
      headers: {
        "X-Disable-Redirect": "true",
        ...hdrs,
      },
    },
    false,
    true,
  );
};

export const onOAuthCancel = async (
  clientId: string,
  clientState: string,
  userId: string,
) => {
  const hdrs = getOAuth2Headers();

  const formData = new FormData();

  const token = getOAuthJWTSignature(userId);

  if (!token) await setOAuthJWTSignature(userId);

  formData.append("client_id", clientId);
  formData.append("state", clientState);

  return request(
    {
      method: "post",
      url: `/oauth2/authorize`,
      data: formData,
      withRedirect: true,
      headers: {
        "X-Disable-Redirect": "true",
        ...hdrs,
      },
    },
    false,
    true,
  );
};

export const generateDevelopToken = (
  client_id: string,
  client_secret: string,
  scopes: string[],
): Promise<TGenerateDeveloperToken> | undefined => {
  const hdrs = getOAuth2Headers();

  const params = new URLSearchParams();
  params.append("grant_type", "personal_access_token");
  params.append("client_id", client_id);
  params.append("client_secret", client_secret);
  params.append("scope", scopes.join(" "));

  return request<TGenerateDeveloperToken>(
    {
      method: "post",
      url: "/oauth2/token",
      data: params,
      headers: {
        "X-Disable-Redirect": "true",
        ...hdrs,
      },
    },
    false,
    true,
  );
};

export const revokeDeveloperToken = (
  token: string,
  client_id: string,
  client_secret: string,
) => {
  const hdrs = getOAuth2Headers();

  const params = new URLSearchParams();
  params.append("token", token);
  params.append("client_id", client_id);
  params.append("client_secret", client_secret);

  return request(
    {
      method: "post",
      url: "/oauth2/revoke",
      data: params,
      headers: {
        ...hdrs,
      },
    },
    false,
    true,
  );
};

export const introspectDeveloperToken = (token: string) => {
  const hdrs = getOAuth2Headers();

  const params = new URLSearchParams();
  params.append("token", token);

  return request<TIntrospectDeveloperToken>(
    {
      method: "post",
      url: "/oauth2/introspect",
      data: params,
      headers: { ...hdrs },
    },
    false,
    true,
  );
};
