//@ts-ignore
import { request } from "../client";

import {
  transformToClientProps,
  transformToClientReqDTO,
} from "./../../utils/oauth/index";

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
  isAuth: boolean = true
): Promise<IClientProps | INoAuthClientProps> => {
  if (!isAuth) {
    const client: IClientResDTO = await request({
      method: "get",
      url: `/clients/${clientId}/info`,
    });

    return {
      ...client,
      websiteUrl: client?.website_url || "",
    };
  }

  const client: IClientResDTO = await request({
    method: "get",
    url: `/clients/${clientId}`,
  });

  return transformToClientProps(client);
};

export const getClientList = async (
  page: number,
  limit: number
): Promise<IClientListProps> => {
  const data: IClientListDTO = await request({
    method: "get",
    url: `/clients?page=${page}&limit=${limit}`,
  });

  const clients: IClientListProps = { ...data, content: [] as IClientProps[] };

  data.data.forEach((item) => {
    const client = transformToClientProps(item);

    clients.content.push({ ...client });
  });

  return clients;
};

export const addClient = async (data: IClientReqDTO): Promise<IClientProps> => {
  data.logout_redirect_uri = data.website_url;

  const client: IClientResDTO = await request({
    method: "post",
    url: `/clients`,
    data,
  });

  return transformToClientProps(client);
};

export const updateClient = async (
  clientId: string,
  data: IClientReqDTO
): Promise<IClientProps> => {
  const client: IClientResDTO = await request({
    method: "put",
    url: `/clients/${clientId}`,
    data,
  });

  return transformToClientProps(client);
};

export const changeClientStatus = async (
  clientId: string,
  status: boolean
): Promise<void> => {
  await request({
    method: "patch",
    url: `/clients/${clientId}/activation`,
    data: { status },
  });
};

export const regenerateSecret = async (
  clientId: string
): Promise<{ client_secret: string }> => {
  const clientSecret: { client_secret: string } = await request({
    method: "patch",
    url: `/clients/${clientId}/regenerate`,
  });

  return clientSecret;
};

export const deleteClient = async (clientId: string): Promise<void> => {
  await request({
    method: "delete",
    url: `/clients/${clientId}`,
  });
};

export const getScope = async (name: string): Promise<IScope> => {
  const scope: IScope = await request({
    method: "get",
    url: `/scopes/${name}`,
  });

  return scope;
};

export const getScopeList = async (): Promise<IScope[]> => {
  const scopeList: IScope[] = await request({
    method: "get",
    url: `/scopes`,
  });

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
      "X-Disable-Redirect": true,
    },
  });
};

export const onOAuthSubmit = (
  clientId: string,
  clientState: string,
  scope: string[]
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
      "X-Disable-Redirect": true,
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
      "X-Disable-Redirect": true,
    },
  });
};

export const getConsentList = async (): Promise<IClientProps[]> => {
  const clients: any = await request({
    method: "get",
    url: "/clients/consents",
  });

  const consents: IClientProps[] = [];

  clients.forEach((item: any) => {
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
