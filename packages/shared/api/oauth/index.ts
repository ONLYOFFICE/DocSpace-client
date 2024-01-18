import { request } from "../client";

import { transformToClientProps } from "../../utils/oauth/index";

import {
  IClientProps,
  IClientResDTO,
  IClientListProps,
  IClientListDTO,
  IScope,
  INoAuthClientProps,
  IClientReqDTO,
} from "../../utils/oauth/interfaces";

export const getClient = async (
  clientId: string,
  isAuth: boolean = true,
): Promise<IClientProps | INoAuthClientProps> => {
  if (!isAuth) {
    const client = (await request({
      method: "get",
      url: `/clients/${clientId}/info`,
    })) as IClientResDTO;

    return {
      ...client,
      websiteUrl: client?.website_url || "",
    };
  }

  const client = (await request({
    method: "get",
    url: `/clients/${clientId}`,
  })) as IClientResDTO;

  return transformToClientProps(client);
};

export const getClientList = async (
  page: number,
  limit: number,
): Promise<IClientListProps> => {
  const data = (await request({
    method: "get",
    url: `/clients?page=${page}&limit=${limit}`,
  })) as IClientListDTO;

  const clients: IClientListProps = { ...data, content: [] as IClientProps[] };

  data.data.forEach((item) => {
    const client = transformToClientProps(item);

    clients.content.push({ ...client });
  });

  return clients;
};

export const addClient = async (data: IClientReqDTO): Promise<IClientProps> => {
  data.logout_redirect_uri = data.website_url;

  const client = (await request({
    method: "post",
    url: `/clients`,
    data,
  })) as IClientResDTO;

  return transformToClientProps(client);
};

export const updateClient = async (clientId: string, data: IClientReqDTO) => {
  await request({
    method: "put",
    url: `/clients/${clientId}`,
    data,
  });
};

export const changeClientStatus = async (
  clientId: string,
  status: boolean,
): Promise<void> => {
  await request({
    method: "patch",
    url: `/clients/${clientId}/activation`,
    data: { status },
  });
};

export const regenerateSecret = async (
  clientId: string,
): Promise<{ client_secret: string }> => {
  const clientSecret = (await request({
    method: "patch",
    url: `/clients/${clientId}/regenerate`,
  })) as { client_secret: string };

  return clientSecret;
};

export const deleteClient = async (clientId: string): Promise<void> => {
  await request({
    method: "delete",
    url: `/clients/${clientId}`,
  });
};

export const getScope = async (name: string): Promise<IScope> => {
  const scope = (await request({
    method: "get",
    url: `/scopes/${name}`,
  })) as IScope;

  return scope;
};

export const getScopeList = async (): Promise<IScope[]> => {
  const scopeList = (await request({
    method: "get",
    url: `/scopes`,
  })) as IScope[];

  return scopeList;
};

export const onOAuthLogin = () => {
  const formData = new FormData();

  return request({
    method: "post",
    url: `/oauth2/login`,
    data: formData,
    withRedirect: true,
    headers: {
      "X-Disable-Redirect": "true",
    },
  });
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

  return request({
    method: "post",
    url: `/oauth2/authorize`,
    data: formData,
    withRedirect: true,
    headers: {
      "X-Disable-Redirect": "true",
    },
  });
};

export const onOAuthCancel = (clientId: string, clientState: string) => {
  const formData = new FormData();

  formData.append("client_id", clientId);
  formData.append("state", clientState);

  return request({
    method: "post",
    url: `/oauth2/authorize`,
    data: formData,
    withRedirect: true,
    headers: {
      "X-Disable-Redirect": "true",
    },
  });
};

export const getConsentList = async (): Promise<IClientProps[]> => {
  const clients = await request({
    method: "get",
    url: "/clients/consents",
  });

  const consents: IClientProps[] = [];

  clients.forEach((item) => {
    const client = transformToClientProps(item.client);

    if (!item.invalidated)
      consents.push({ ...client, modifiedOn: item.modified_at });
  });

  return consents;
};

export const revokeUserClient = async (clientId: string): Promise<void> => {
  await request({
    method: "delete",
    url: `/clients/${clientId}/revoke`,
  });
};
