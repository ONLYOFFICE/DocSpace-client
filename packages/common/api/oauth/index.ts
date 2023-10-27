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
      websiteUrl: client.website_url,
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

export const addClient = async (data: IClientProps): Promise<IClientProps> => {
  const client: IClientResDTO = await request({
    method: "post",
    url: `/clients`,
    data: transformToClientReqDTO(data),
  });

  return transformToClientProps(client);
};

export const updateClient = async (
  clientId: string,
  data: IClientProps
): Promise<IClientProps> => {
  const client: IClientResDTO = await request({
    method: "put",
    url: `/clients/${clientId}`,
    data: transformToClientReqDTO(data),
  });

  // TODO: OAuth, get it from request
  client.enabled = true;

  return transformToClientProps(client);
};

export const changeClientStatus = async (
  clientId: string,
  status: boolean
): Promise<boolean> => {
  console.log(`Change client:${clientId} status to ${status}`);

  return !status;
};

export const regenerateSecret = async (clientId: string): Promise<string> => {
  const clientSecret: string = (
    await request({
      method: "patch",
      url: `/clients/${clientId}`,
    })
  ).client_secret;

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
  });
};

export const onOAuthSubmit = (
  clientId: string,
  clientState: string,
  scope: string[]
) => {
  const formData = new FormData();

  // console.log(window.location.search);

  formData.append("client_id", clientId);
  formData.append("state", clientState);
  formData.append("scope", scope.join(","));

  return request({
    method: "post",
    url: `/oauth2/authorize`,
    data: formData,
  });
};
