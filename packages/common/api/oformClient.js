import AxiosOformClient from "../utils/axiosOformClient";

const oformClient = new AxiosOformClient();

export const request = (options) => {
  return oformClient.request(options);
};
