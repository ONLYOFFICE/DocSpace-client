import { http } from "msw";

import { API_PREFIX, BASE_URL } from "../../e2e/utils";

export const PATH_PAYMENT_ACCOUNT = "portal/payment/account";

export const paymentAccountSuccess = () => {
  return "https://example.com/stripe-portal";
};

export const paymentAccountResolver = () => {
  return new Response(JSON.stringify(paymentAccountSuccess()));
};

export const paymentAccountHandler = (port: string) => {
  return http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_PAYMENT_ACCOUNT}`,
    () => {
      return paymentAccountResolver();
    },
  );
};
