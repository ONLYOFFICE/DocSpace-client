import { AxiosRequestConfig } from "axios";
import AxiosClient, { TReqOption } from "../utils/axiosClient";

const client = new AxiosClient();

export const initSSR = (headers: Record<string, string>) => {
  client.initSSR(headers);
};

export const request = (
  options: TReqOption & AxiosRequestConfig,
  skipRedirect = false,
) => {
  return client.request(options, skipRedirect);
};

export const setWithCredentialsStatus = (state: boolean) => {
  return client.setWithCredentialsStatus(state);
};
