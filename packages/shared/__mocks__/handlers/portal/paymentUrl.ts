import { http } from "msw";

import { API_PREFIX, BASE_URL } from "../../e2e/utils";

export const PATH_PAYMENT_URL = "portal/payment/url";

export const paymentUrlSuccess = () => {
  return "https://example.com/payment";
};

export const paymentUrlResolver = () => {
  return new Response(JSON.stringify(paymentUrlSuccess()));
};

export const paymentUrlHandler = (port: string) => {
  return http.put(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_PAYMENT_URL}`,
    () => {
      return paymentUrlResolver();
    },
  );
};
