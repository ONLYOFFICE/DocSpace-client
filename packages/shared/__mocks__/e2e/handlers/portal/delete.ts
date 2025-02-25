import { API_PREFIX, BASE_URL } from "../../utils";

export const PATH = "portal/delete";

const url = `${BASE_URL}/${API_PREFIX}/${PATH}`;

export const deleteSuccess = {
  response: "http://www.onlyoffice.com/remove-portal-feedback-form.aspx",
  count: 1,
  links: [
    {
      href: url,
      action: "DELETE",
    },
  ],
  status: 0,
  statusCode: 200,
  ok: true,
};

export const deletePortal = (): Response => {
  return new Response(JSON.stringify(deleteSuccess));
};
