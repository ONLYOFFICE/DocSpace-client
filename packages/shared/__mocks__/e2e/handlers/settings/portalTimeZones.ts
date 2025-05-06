import { API_PREFIX, BASE_URL } from "../../utils";

const PATH = "settings/timezones";

const url = `${BASE_URL}/${API_PREFIX}/${PATH}`;

export const portalTimeZonesSuccess = {
  response: [
    {
      id: "Pacific/Niue",
      displayName: "(UTC-11:00) Niue Time",
    },
    {
      id: "Pacific/Midway",
      displayName: "(UTC-11:00) Samoa Standard Time (Midway)",
    },
    {
      id: "Pacific/Pago_Pago",
      displayName: "(UTC-11:00) Samoa Standard Time (Pago Pago)",
    },
    {
      id: "Pacific/Rarotonga",
      displayName: "(UTC-10:00) Cook Islands Standard Time (Rarotonga)",
    },
    {
      id: "America/Adak",
      displayName: "(UTC-10:00) Hawaii-Aleutian Time (Adak)",
    },
    {
      id: "Pacific/Honolulu",
      displayName: "(UTC-10:00) Hawaii-Aleutian Time (Adak) (Honolulu)",
    },
    {
      id: "Pacific/Tahiti",
      displayName: "(UTC-10:00) Tahiti Time",
    },
    {
      id: "Pacific/Marquesas",
      displayName: "(UTC-09:30) Marquesas Time",
    },
    {
      id: "America/Anchorage",
      displayName: "(UTC-09:00) Alaska Time (Anchorage)",
    },
    {
      id: "America/Juneau",
      displayName: "(UTC-09:00) Alaska Time (Juneau)",
    },
    { id: "UTC", displayName: "(UTC) Coordinated Universal Time" },
  ],
  count: 10,
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

export const portalTimeZone = (): Response => {
  return new Response(JSON.stringify(portalTimeZonesSuccess));
};
