import { API_PREFIX, BASE_URL } from "../../utils";

export const PATH = "portal/continue";

const url = `${BASE_URL}/${API_PREFIX}/${PATH}`;

export const continueSuccess = {
  count: 0,
  links: [
    {
      href: url,
      action: "PUT",
    },
  ],
  status: 0,
  statusCode: 200,
  ok: true,
};

export const continuePortal = (): Response => {
  return new Response(JSON.stringify(continueSuccess));
};
