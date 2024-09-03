export const settingsSuccessNoAuth = {
  response: {
    trustedDomainsType: 0,
    culture: "en-GB",
    utcOffset: "00:00:00",
    utcHoursOffset: 0,
    greetingSettings: "Web Office",
    ownerId: "00000000-0000-0000-0000-000000000000",
    enabledJoin: false,
    enableAdmMess: false,
    thirdpartyEnable: false,
    docSpace: true,
    standalone: true,
    baseDomain: "localhost",
    passwordHash: {
      size: 256,
      iterations: 100000,
      salt: "4d9abe238e2f7b14a30a4565d62214a795a15abb798ed61118a69820d6a6146c",
    },
    version: ".",
    recaptchaType: 0,
    recaptchaPublicKey: "",
    debugInfo: false,
    tenantStatus: 0,
    tenantAlias: "localhost",
    forumLink: "https://forum.onlyoffice.com",
    legalTerms:
      "https://help.onlyoffice.co/products/files/doceditor.aspx?fileid=5048502&doc=SXhWMEVzSEYxNlVVaXJJeUVtS0kyYk14YWdXTEFUQmRWL250NllHNUFGbz0_IjUwNDg1MDIi0",
    cookieSettingsEnabled: false,
    limitedAccessSpace: false,
    userNameRegex: "^[\\p{L}\\p{M}' \\-]+$",
    maxImageUploadSize: 0,
  },
  count: 1,
  links: [
    {
      href: "http://192.168.0.16/api/2.0/settings?withPassword=false",
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

export const settingsSuccessWithAuth = {
  response: {
    trustedDomainsType: 0,
    culture: "en-US",
    utcOffset: "00:00:00",
    utcHoursOffset: 0,
    greetingSettings: "Web Office",
    ownerId: "00000000-0000-0000-0000-000000000000",
    enabledJoin: false,
    enableAdmMess: false,
    thirdpartyEnable: false,
    docSpace: true,
    standalone: true,
    baseDomain: "localhost",
    passwordHash: {
      size: 256,
      iterations: 100000,
      salt: "4d9abe238e2f7b14a30a4565d62214a795a15abb798ed61118a69820d6a6146c",
    },
    version: ".",
    recaptchaType: 0,
    recaptchaPublicKey: "",
    debugInfo: false,
    tenantStatus: 0,
    tenantAlias: "localhost",
    forumLink: "https://forum.onlyoffice.com",
    legalTerms:
      "https://help.onlyoffice.co/products/files/doceditor.aspx?fileid=5048502&doc=SXhWMEVzSEYxNlVVaXJJeUVtS0kyYk14YWdXTEFUQmRWL250NllHNUFGbz0_IjUwNDg1MDIi0",
    licenseUrl: "https://www.gnu.org/licenses/agpl-3.0.en.html",
    cookieSettingsEnabled: false,
    limitedAccessSpace: false,
    userNameRegex: "^[\\p{L}\\p{M}' \\-]+$",
    maxImageUploadSize: 0,
  },
  count: 1,
  links: [
    {
      href: "http://192.168.50.219/api/2.0/settings?withPassword=true",
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

export const settingsSuccessWithAuthWizard = {
  response: {
    trustedDomainsType: 0,
    culture: "en-US",
    utcOffset: "00:00:00",
    utcHoursOffset: 0,
    greetingSettings: "Web Office",
    ownerId: "00000000-0000-0000-0000-000000000000",
    enabledJoin: false,
    enableAdmMess: false,
    thirdpartyEnable: false,
    docSpace: true,
    standalone: true,
    baseDomain: "localhost",
    wizardToken:
      "type=Wizard&key=462096722976.4OD9HUTNJZGBFMMPVOTCBNOVCPGLTBKUNPKGCNY&uid=66faa6e4-f133-11ea-b126-00ffeec8b4ef",
    passwordHash: {
      size: 256,
      iterations: 100000,
      salt: "4d9abe238e2f7b14a30a4565d62214a795a15abb798ed61118a69820d6a6146c",
    },
    version: ".",
    recaptchaType: 0,
    recaptchaPublicKey: "",
    debugInfo: false,
    tenantStatus: 0,
    tenantAlias: "localhost",
    forumLink: "https://forum.onlyoffice.com",
    legalTerms:
      "https://help.onlyoffice.co/products/files/doceditor.aspx?fileid=5048502&doc=SXhWMEVzSEYxNlVVaXJJeUVtS0kyYk14YWdXTEFUQmRWL250NllHNUFGbz0_IjUwNDg1MDIi0",
    cookieSettingsEnabled: false,
    limitedAccessSpace: false,
    userNameRegex: "^[\\p{L}\\p{M}' \\-]+$",
    maxImageUploadSize: 0,
  },
  count: 1,
  links: [
    {
      href: "http://192.168.50.219/api/2.0/settings?withPassword=true",
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
  ok: true,
};

export const settingsPasswordSuccess = {
  response: {
    minLength: 8,
    upperCase: false,
    digits: false,
    specSymbols: false,
    allowedCharactersRegexStr: "[\\x21-\\x7E]",
    digitsRegexStr: "(?=.*\\d)",
    upperCaseRegexStr: "(?=.*[A-Z])",
    specSymbolsRegexStr: "(?=.*[\\x21-\\x2F\\x3A-\\x40\\x5B-\\x60\\x7B-\\x7E])",
  },
  count: 1,
  links: [
    {
      href: "http://192.168.50.219/api/2.0/settings/security/password",
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
  ok: true,
};

export const machineNameSuccess = {
  response: "192.168.50.219",
  count: 1,
  links: [
    {
      href: "http://192.168.50.219/api/2.0/settings/machine",
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
  ok: true,
};

export const isLicenseRequiredFalseSuccess = {
  response: false,
  count: 1,
  links: [
    {
      href: "http://192.168.50.219/api/2.0/settings/license/required",
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
  ok: true,
};

export const isLicenseRequiredTrueSuccess = {
  response: true,
  count: 1,
  links: [
    {
      href: "http://192.168.50.219/api/2.0/settings/license/required",
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
  ok: true,
};

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
  ],
  count: 10,
  links: [
    {
      href: "http://192.168.50.219/api/2.0/settings/timezones",
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
  ok: true,
};

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
      href: "http://192.168.50.219/api/2.0/settings/cultures",
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
  ok: true,
};

export const colorThemeSuccess = {
  response: {
    themes: [
      {
        id: 1,
        name: "blue",
        main: {
          accent: "#4781D1",
          buttons: "#5299E0",
        },
        text: {
          accent: "#FFFFFF",
          buttons: "#FFFFFF",
        },
      },
      {
        id: 2,
        name: "orange",
        main: {
          accent: "#F97A0B",
          buttons: "#FF9933",
        },
        text: {
          accent: "#FFFFFF",
          buttons: "#FFFFFF",
        },
      },
      {
        id: 3,
        name: "green",
        main: {
          accent: "#2DB482",
          buttons: "#22C386",
        },
        text: {
          accent: "#FFFFFF",
          buttons: "#FFFFFF",
        },
      },
      {
        id: 4,
        name: "red",
        main: {
          accent: "#F2675A",
          buttons: "#F27564",
        },
        text: {
          accent: "#FFFFFF",
          buttons: "#FFFFFF",
        },
      },
      {
        id: 5,
        name: "purple",
        main: {
          accent: "#6D4EC2",
          buttons: "#8570BD",
        },
        text: {
          accent: "#FFFFFF",
          buttons: "#FFFFFF",
        },
      },
      {
        id: 6,
        name: "light-blue",
        main: {
          accent: "#11A4D4",
          buttons: "#13B7EC",
        },
        text: {
          accent: "#FFFFFF",
          buttons: "#FFFFFF",
        },
      },
    ],
    selected: 1,
    limit: 9,
  },
  count: 1,
  links: [
    {
      href: "http://192.168.50.219/api/2.0/settings/colortheme",
      action: "GET",
    },
  ],
  status: 0,
  ok: true,
};

export const settingsForbidden = new Response(null, { status: 403 });

export const settingsNotFound = new Response(null, { status: 404 });

export const settingsError = new Response(null, { status: 500 });

const getMockResponse = (response: any, headers?: any): Response => {
  let responseData = response;
  // TODO: remove this when MSW the server is added
  if (headers) {
    if (
      headers.get("x-test-data-license-required") &&
      responseData.links[0].href ===
        "http://192.168.50.219/api/2.0/settings/license/required"
    ) {
      responseData = isLicenseRequiredTrueSuccess;
    }
  }

  return new Response(JSON.stringify(responseData), {
    status: 200,
  });
};

export default getMockResponse;
