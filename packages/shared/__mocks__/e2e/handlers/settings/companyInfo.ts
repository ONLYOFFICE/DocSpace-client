import { API_PREFIX, BASE_URL } from "../../utils";

export const PATH = "settings/rebranding/company";

const url = `${BASE_URL}/${API_PREFIX}/${PATH}`;

export const companyInfoSuccess = {
  response: {
    companyName: "Ascensio System SIA",
    site: "https://www.onlyoffice.com",
    email: "support@onlyoffice.com",
    address: "Riga, Latvia, EU",
    phone: "+371 660-16425",
    isLicensor: true,
    isDefault: true,
  },
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

export const companyInfo = (): Response => {
  return new Response(JSON.stringify(companyInfoSuccess));
};
