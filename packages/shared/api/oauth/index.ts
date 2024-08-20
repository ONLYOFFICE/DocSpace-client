import { request } from "../client";

import { transformToClientProps } from "../../utils/oauth/index";

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

export const getClient = async (clientId: string): Promise<IClientProps> => {
  const client = (await request(
    {
      method: "get",
      url: `/clients/${clientId}`,
    },
    false,
    true,
  )) as IClientResDTO;

  return transformToClientProps(client);
};

export const getClientList = async (
  page: number,
  limit: number,
): Promise<IClientListProps> => {
  const data = (await request(
    {
      method: "get",
      url: `/clients?page=${page}&limit=${limit}`,
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

export const addClient = async (data: IClientReqDTO): Promise<IClientProps> => {
  data.logout_redirect_uri = data.website_url;

  const client = (await request(
    {
      method: "post",
      url: `/clients`,
      data,
    },
    false,
    true,
  )) as IClientResDTO;

  return transformToClientProps(client);
};

export const updateClient = async (clientId: string, data: IClientReqDTO) => {
  await request(
    {
      method: "put",
      url: `/clients/${clientId}`,
      data,
    },
    false,
    true,
  );
};

export const changeClientStatus = async (
  clientId: string,
  status: boolean,
): Promise<void> => {
  await request(
    {
      method: "patch",
      url: `/clients/${clientId}/activation`,
      data: { status },
    },
    false,
    true,
  );
};

export const regenerateSecret = async (
  clientId: string,
): Promise<{ client_secret: string }> => {
  const clientSecret = (await request(
    {
      method: "patch",
      url: `/clients/${clientId}/regenerate`,
    },
    false,
    true,
  )) as { client_secret: string };

  return clientSecret;
};

export const deleteClient = async (clientId: string): Promise<void> => {
  await request(
    {
      method: "delete",
      url: `/clients/${clientId}`,
    },
    false,
    true,
  );
};

export const getScope = async (name: string): Promise<TScope> => {
  const scope = (await request(
    {
      method: "get",
      url: `/scopes/${name}`,
    },
    false,
    true,
  )) as TScope;

  return scope;
};

export const getScopeList = async (): Promise<TScope[]> => {
  const scopeList = (await request(
    {
      method: "get",
      url: `/scopes`,
    },
    false,
    true,
  )) as TScope[];

  return scopeList;
};

export const getConsentList = async (
  page: number = 0,
  limit: number = 100,
): Promise<TConsentList & { consents: IClientProps[] }> => {
  const consentList = (await request(
    {
      method: "get",
      url: `/clients/consents?page=${page}&limit=${limit}`,
    },
    false,
    true,
  )) as TConsentList;

  const consents: IClientProps[] = [];

  consentList.data.forEach(
    ({ client, invalidated, modified_at }: TConsentData) => {
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
  await request(
    {
      method: "delete",
      url: `/clients/${clientId}/revoke`,
    },
    false,
    true,
  );
};

export const onOAuthSubmit = (
  clientId: string,
  clientState: string,
  scope: string[],
) => {
  const formData = new FormData();

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
      },
    },
    false,
    true,
  );
};

export const onOAuthCancel = (clientId: string, clientState: string) => {
  const formData = new FormData();

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
  const params = new URLSearchParams();
  params.append("grant_type", "personal_access_token");
  params.append("client_id", client_id);
  params.append("client_secret", client_secret);
  params.append("scope", scopes.join(" "));

  return request<TGenerateDeveloperToken>(
    { method: "post", url: "/oauth2/token", data: params },
    false,
    true,
  );
};

export const revokeDeveloperToken = (
  token: string,
  client_id: string,
  client_secret: string,
) => {
  const params = new URLSearchParams();
  params.append("token", token);
  params.append("client_id", client_id);
  params.append("client_secret", client_secret);

  return request(
    { method: "post", url: "/oauth2/revoke", data: params },
    false,
    true,
  );
};

export const introspectDeveloperToken = (token: string) => {
  const params = new URLSearchParams();
  params.append("token", token);

  return request<TIntrospectDeveloperToken>(
    { method: "post", url: "/oauth2/introspect", data: params },
    false,
    true,
  );
};
