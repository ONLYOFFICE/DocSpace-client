import axios from "axios";
import defaultConfig from "PUBLIC_DIR/scripts/config.json";
import combineUrl from "./combineUrl";

let { oformsApi: apiConf } = defaultConfig;
let { origin, prefix, timeout } = apiConf;

class AxiosOformClient {
  constructor() {
    this.client = axios.create({
      baseURL: combineUrl(origin, prefix),
      responseType: "json",
      timeout: timeout,
      withCredentials: true,
    });
  }

  request = async (options) =>
    this.client(options)
      .then((res) => {
        if (res.data && res.data.error) throw new Error(res.data.error.message);
        if (res.isAxiosError && res.message) throw new Error(res.message);

        if (!res || !res.data || res.isAxiosError) return null;
        return res.data.data;
      })
      .catch((err) => Promise.reject(err));
}

export default AxiosOformClient;
