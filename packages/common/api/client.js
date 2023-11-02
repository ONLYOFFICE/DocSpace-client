import AxiosClient from "../utils/axiosClient";

const client = new AxiosClient();

export const initSSR = (headers) => {
  client.initSSR(headers);
};

export const request = (options, isSelector = false) => {
  return client.request(options, isSelector);
};

export const setWithCredentialsStatus = (state) => {
  return client.setWithCredentialsStatus(state);
};
