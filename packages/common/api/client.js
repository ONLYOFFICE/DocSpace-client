import AxiosClient from "../utils/axiosClient";

const client = new AxiosClient();

export const initSSR = (headers) => {
  client.initSSR(headers);
};

export const request = (options, skipRedirect = false) => {
  return client.request(options, skipRedirect);
};

export const setWithCredentialsStatus = (state) => {
  return client.setWithCredentialsStatus(state);
};
