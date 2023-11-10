import AxiosClient from "../utils/axiosClient";

const client = new AxiosClient();

export const initSSR = (headers) => {
  client.initSSR(headers);
};

export const request = (options, isSkipRedirect = false) => {
  return client.request(options, isSkipRedirect);
};

export const setWithCredentialsStatus = (state) => {
  return client.setWithCredentialsStatus(state);
};
