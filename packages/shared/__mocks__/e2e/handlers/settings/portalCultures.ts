import { API_PREFIX, BASE_URL } from "../../utils";

const PATH = "settings/cultures";

const url = `${BASE_URL}/${API_PREFIX}/${PATH}`;

export const portalCulturesSuccess = {
  response: [
    "az",
    "cs",
    "de",
    "en-GB",
    "en-US",
    "es",
    "fr",
    "it",
    "lv",
    "nl",
    "pl",
    "pt-BR",
    "pt",
    "ro",
    "sk",
    "sl",
    "sq-AL",
    "fi",
    "vi",
    "tr",
    "el-GR",
    "bg",
    "ru",
    "sr-Cyrl-RS",
    "sr-Latn-RS",
    "uk-UA",
    "hy-AM",
    "ar-SA",
    "si",
    "lo-LA",
    "zh-CN",
    "ja-JP",
    "ko-KR",
  ],
  count: 32,
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

export const portalCultures = (): Response => {
  return new Response(JSON.stringify(portalCulturesSuccess));
};
