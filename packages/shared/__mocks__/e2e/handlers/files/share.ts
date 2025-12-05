import { BASE_URL, API_PREFIX } from "../../utils";

type ActionType = "Delete";

export const PATH_SHARE = "files/share";

export const deleteShare = {
  response: true,
  count: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/${PATH_SHARE}`,
      action: "DELETE",
    },
  ],
  status: 0,
  statusCode: 200,
};

export const shareHandler = (action: ActionType) => {
  switch (action) {
    case "Delete":
      return new Response(JSON.stringify(deleteShare));
    default:
      return new Response(JSON.stringify(deleteShare));
  }
};
