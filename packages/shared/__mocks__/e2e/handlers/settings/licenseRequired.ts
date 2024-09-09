import { API_PREFIX, BASE_URL, HEADER_LICENCE_REQUIRED } from "../../utils";

const PATH = "settings/license/required";

const url = `${BASE_URL}/${API_PREFIX}/${PATH}`;

export const licenseRequiredSuccess = {
  response: true,
  count: 1,
  links: [
    {
      href: url,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
  ok: true,
};

export const licenseNotRequiredSuccess = {
  response: false,
  count: 1,
  links: [
    {
      href: url,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
  ok: true,
};

export const licenseRequired = (headers?: Headers): Response => {
  let isRequired = false;

  if (headers?.get(HEADER_LICENCE_REQUIRED)) {
    isRequired = true;
  }

  if (isRequired) return new Response(JSON.stringify(licenseRequiredSuccess));

  return new Response(JSON.stringify(licenseNotRequiredSuccess));
};
