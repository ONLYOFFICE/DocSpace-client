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
    return new Response(
      JSON.stringify({
        response: { result: 1 },
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
      }),
    );
  }

  if (isExpired) {
    return new Response(
      JSON.stringify({
        response: { result: 2 },
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
      }),
    );
  }

  if (isTariffLimit) {
    return new Response(
      JSON.stringify({
        response: { result: 3 },
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
      }),
    );
  }

  if (isUserExisted) {
    return new Response(
      JSON.stringify({
        response: { result: 4 },
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
      }),
    );
  }

  if (isUserExcluded) {
    return new Response(
      JSON.stringify({
        response: { result: 5 },
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
      }),
    );
  }

  if (isQuotaFailed) {
    return new Response(
      JSON.stringify({
        response: { result: 6 },
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
      }),
    );
  }

  return new Response(
    JSON.stringify({
      response: { result: 0 },
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
    }),
  );
};
