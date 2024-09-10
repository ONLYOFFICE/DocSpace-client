import {
  API_PREFIX,
  BASE_URL,
  HEADER_LINK_EXPIRED,
  HEADER_LINK_INVALID,
  HEADER_QUOTA_FAILED,
  HEADER_TRAFF_LIMIT,
  HEADER_USER_EXCLUDED,
  HEADER_USER_EXISTED,
} from "../../utils";

const PATH = "/authentication/confirm";

const url = `${BASE_URL}/${API_PREFIX}/${PATH}`;

export const getConfirmSuccess = (result: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 0) => {
  return {
    response: { result },
    count: 1,
    links: [
      {
        href: url,
        action: "POST",
      },
    ],
    status: 0,
    statusCode: 200,
    ok: true,
  };
};

export const confirm = (headers?: Headers): Response => {
  let isInvalid = false;
  let isExpired = false;
  let isTariffLimit = false;
  let isUserExisted = false;
  let isUserExcluded = false;
  let isQuotaFailed = false;

  if (headers?.get(HEADER_LINK_INVALID)) {
    isInvalid = true;
  }
  if (headers?.get(HEADER_LINK_EXPIRED)) {
    isExpired = true;
  }
  if (headers?.get(HEADER_TRAFF_LIMIT)) {
    isTariffLimit = true;
  }
  if (headers?.get(HEADER_USER_EXISTED)) {
    isUserExisted = true;
  }
  if (headers?.get(HEADER_USER_EXCLUDED)) {
    isUserExcluded = true;
  }
  if (headers?.get(HEADER_QUOTA_FAILED)) {
    isQuotaFailed = true;
  }

  if (isInvalid) {
    return new Response(JSON.stringify(getConfirmSuccess(1)));
  }

  if (isExpired) {
    return new Response(JSON.stringify(getConfirmSuccess(2)));
  }

  if (isTariffLimit) {
    return new Response(JSON.stringify(getConfirmSuccess(3)));
  }

  if (isUserExisted) {
    return new Response(JSON.stringify(getConfirmSuccess(4)));
  }

  if (isUserExcluded) {
    return new Response(JSON.stringify(getConfirmSuccess(5)));
  }

  if (isQuotaFailed) {
    return new Response(JSON.stringify(getConfirmSuccess(6)));
  }

  return new Response(JSON.stringify(getConfirmSuccess()));
};
