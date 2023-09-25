import axios, { AxiosRequestConfig } from "axios";

import {
  transformToClientProps,
  transformToClientDTO,
} from "./../../utils/oauth/index";

import {
  ClientDTO,
  ClientListDTO,
  ClientListProps,
  ClientProps,
  ScopeDTO,
} from "../../utils/oauth/dto";

const axiosConfig: AxiosRequestConfig = {
  baseURL: "/api",
  responseType: "json",
  timeout: 0,
  withCredentials: true,
  headers: { "X-API-Version": "1", "X-Tenant": "1" },
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
  const client: ClientDTO = await request({
    method: "get",
    url: `/clients/${clientId}`,
  });

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

    clients.content.push({ ...client });
  });

  return clients;
};

export const addClient = async (data: ClientProps): Promise<ClientProps> => {
  const client: ClientDTO = await request({
    method: "post",
    url: `/clients`,
    data: transformToClientDTO(data),
  });

  return transformToClientProps(client);
};

export const updateClient = async (
  clientId: string,
  data: ClientProps
): Promise<ClientProps> => {
  const client: ClientDTO = await request({
    method: "put",
    url: `/clients/${clientId}`,
    data: transformToClientDTO(data),
  });

  return transformToClientProps(client);
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

export const getScope = async (name: string): Promise<ScopeDTO> => {
  const scope: ScopeDTO = await request({
    method: "get",
    url: `/scopes/${name}`,
  });

  return scope;
};

export const getScopeList = async (): Promise<ScopeDTO[]> => {
  const scopeList: ScopeDTO[] = await request({
    method: "get",
    url: `/scopes`,
  });

  return scopeList;
};
