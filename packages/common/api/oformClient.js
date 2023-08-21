import AxiosOformClient from "../utils/axiosOformClient";

const oformClient = new AxiosOformClient();

// export const initSSR = (headers) => {
//     oformClient.initSSR(headers);
// };

export const request = (options) => {
  return oformClient.request(options);
};

// export const setWithCredentialsStatus = (state) => {
//   return oformClient.setWithCredentialsStatus(state);
// };
