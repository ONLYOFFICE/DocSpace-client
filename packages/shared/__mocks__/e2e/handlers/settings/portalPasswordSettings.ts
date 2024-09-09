import { API_PREFIX, BASE_URL } from "../../utils";

const PATH = "settings/security/password";

const url = `${BASE_URL}/${API_PREFIX}/${PATH}`;

export const portalPasswordSettings = (): Response => {
  return new Response(
    JSON.stringify({
      response: {
        minLength: 8,
        upperCase: false,
        digits: false,
        specSymbols: false,
        allowedCharactersRegexStr: "[\\x21-\\x7E]",
        digitsRegexStr: "(?=.*\\d)",
        upperCaseRegexStr: "(?=.*[A-Z])",
        specSymbolsRegexStr:
          "(?=.*[\\x21-\\x2F\\x3A-\\x40\\x5B-\\x60\\x7B-\\x7E])",
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
    }),
  );
};
