import {
  API_PREFIX,
  BASE_URL,
  HEADER_LINK_EXPIRED,
  HEADER_LINK_INVALID,
  HEADER_USER_EXCLUDED,
} from "../../utils";

const PATH = "/authentication/confirm";

const url = `${BASE_URL}/${API_PREFIX}/${PATH}`;

export const confirm = (headers?: Headers): Response => {
  let isInvalid = false;
  let isExpired = false;
  let isUserExcluded = false;

  if (headers?.get(HEADER_LINK_INVALID)) {
    isInvalid = true;
  }
  if (headers?.get(HEADER_LINK_EXPIRED)) {
    isExpired = true;
  }
  if (headers?.get(HEADER_USER_EXCLUDED)) {
    isUserExcluded = true;
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
