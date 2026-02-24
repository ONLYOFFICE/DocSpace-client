import { http } from "msw";

import { API_PREFIX, BASE_URL } from "../../e2e/utils";

export const PATH_PAYMENT_CUSTOMER_INFO = "portal/payment/customerinfo";

export const paymentCustomerInfoSuccess = (
  nonpayer: boolean,
  email?: string,
) => {
  const payer = nonpayer
    ? undefined
    : {
        displayName: "Test Payer",
        hasAvatar: false,
      };
  return {
    response: {
      portalId: null,
      paymentMethodStatus: 1,
      email: email ?? (nonpayer ? "test-nonpayer@gtest.com" : "test@gmail.com"),
      payer,
    },
  };
};

export const paymentCustomerInfoResolver = (
  nonpayer: boolean,
  email?: string,
) => {
  return new Response(
    JSON.stringify(paymentCustomerInfoSuccess(nonpayer, email)),
  );
};

export const paymentCustomerInfoHandler = (
  port: string,
  nonpayer: boolean = false,
  email?: string,
) => {
  return http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_PAYMENT_CUSTOMER_INFO}`,
    () => {
      return paymentCustomerInfoResolver(nonpayer, email);
    },
  );
};
