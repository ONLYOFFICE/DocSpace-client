import axios, { AxiosRequestConfig } from "axios";

import { ClientDTO, ClientListDTO } from "../../utils/oauth/dto";

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

export const getClient = async (clientId: string): Promise<ClientDTO> => {
  const client: ClientDTO = await request({
    method: "get",
    url: `/clients/${clientId}`,
  });
  return client;
};

export const getClientList = async (
  page: number,
  limit: number
): Promise<ClientListDTO> => {
  const clients: ClientListDTO = (
    await request({
      method: "get",
      url: `/clients?page=${page}&limit=${limit}`,
    })
  ).data;

  return clients;
};

export const addClient = async (data: ClientDTO): Promise<ClientDTO> => {
  const client: ClientDTO = await request({
    method: "post",
    url: `/clients`,
    data,
  });

  return client;
};

export const updateClient = async (
  clientId: string,
  data: ClientDTO
): Promise<ClientDTO> => {
  const client: ClientDTO = await request({
    method: "put",
    url: `/clients/${clientId}`,
    data,
  });

  return client;
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
