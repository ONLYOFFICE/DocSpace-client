import axios, { AxiosRequestConfig } from "axios";

import {
  transformToClientProps,
  transformToClientReqDTO,
} from "./../../utils/oauth/index";

import {
  ClientProps,
  ClientResDTO,
  ClientListProps,
  ClientListDTO,
  Scope,
} from "../../utils/oauth/interfaces";

const axiosConfig: AxiosRequestConfig = {
  baseURL: "/api/2.0",
  responseType: "json",
  timeout: 0,
  withCredentials: true,
};

const client = axios.create(axiosConfig);

const request = (options: any): Promise<any> => {
  const onSuccess = (response: any) => {
    return response.data;
  };

  const onError = (error: any) => {
    return error;
  };

  return client(options).then(onSuccess).catch(onError);
};

export const getClient = async (clientId: string): Promise<ClientProps> => {
  const client: ClientResDTO = await request({
    method: "get",
    url: `/clients/${clientId}`,
    headers: {},
  });

  client.enabled = true;

  return transformToClientProps(client);
};

export const getClientList = async (
  page: number,
  limit: number
): Promise<ClientListProps> => {
  const { data }: { data: ClientListDTO } = await request({
    method: "get",
    url: `/clients?page=${page}&limit=${limit}`,
  });

  const clients = { ...data, content: [] as ClientProps[] };

  data.content.forEach((item) => {
    const client = transformToClientProps(item);

    // TODO: OAuth, get it from request
    client.enabled = true;

    clients.content.push({ ...client });
  });

  return clients;
};

export const addClient = async (data: ClientProps): Promise<ClientProps> => {
  const client: ClientResDTO = await request({
    method: "post",
    url: `/clients`,
    data: transformToClientReqDTO(data),
  });

  // TODO: OAuth, get it from request
  client.enabled = true;

  return transformToClientProps(client);
};

export const updateClient = async (
  clientId: string,
  data: ClientProps
): Promise<ClientProps> => {
  const client: ClientResDTO = await request({
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

export const getScope = async (name: string): Promise<Scope> => {
  const scope: Scope = await request({
    method: "get",
    url: `/scopes/${name}`,
  });

  return scope;
};

export const getScopeList = async (): Promise<Scope[]> => {
  const scopeList: Scope[] = await request({
    method: "get",
    url: `/scopes`,
  });

  return scopeList;
};
