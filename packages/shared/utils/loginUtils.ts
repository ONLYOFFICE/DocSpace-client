/* eslint-disable @typescript-eslint/no-throw-literal */
import api from "../api";
import { setWithCredentialsStatus } from "../api/client";

export async function login(
  user: string,
  hash: string,
  session = true,
  captchaToken: string = "",
): Promise<string | object> {
  try {
    const response = (await api.user.login(
      user,
      hash,
      session,
      captchaToken,
    )) as {
      token?: string;
      tfa?: string;
      confirmUrl?: string;
      error?: {
        message: string;
      };
    };

    if (!response || (!response.token && !response.tfa))
      throw response?.error?.message || "";

    if (response.tfa && response.confirmUrl) {
      const url = response.confirmUrl.replace(window.location.origin, "");
      return url;
    }

    setWithCredentialsStatus(true);

    return await Promise.resolve(response);
  } catch (e) {
    return Promise.reject(e);
  }
}

export async function thirdPartyLogin(SerializedProfile: unknown) {
  try {
    const response = (await api.user.thirdPartyLogin(SerializedProfile)) as {
      token?: string;
    };

    if (!response || !response.token) throw new Error("Empty API response");

    setWithCredentialsStatus(true);

    // this.reset();

    // this.init();

    return await Promise.resolve(response);
  } catch (e) {
    return Promise.reject(e);
  }
}
