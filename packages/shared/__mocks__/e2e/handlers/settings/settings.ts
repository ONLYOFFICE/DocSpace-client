import {
  API_PREFIX,
  BASE_URL,
  HEADER_WIZARD_SETTINGS,
  HEADER_WIZARD_WITH_AMI_SETTINGS,
  HEADER_PORTAL_DEACTIVATE_SETTINGS,
} from "../../utils";

const PATH = "settings";

const url = `${BASE_URL}/${API_PREFIX}/${PATH}`;

export const settingsWizzard = {
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
    baseDomain: BASE_URL,
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
    isAmi: false,
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

export const settingsWizzardWithAmi = {
  ...settingsWizzard,
  response: { ...settingsWizzard.response, isAmi: true },
};

export const settingsAuth = {};

export const settingsNoAuth = {
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
    baseDomain: "docspace.site",
    passwordHash: {
      size: 256,
      iterations: 100000,
      salt: "4d9abe238e2f7b14a30a4565d62214a795a15abb798ed61118a69820d6a6146c",
    },
    version: ".",
    recaptchaType: 0,
    recaptchaPublicKey: "6Ld7iToqAAAAAMxFUP5Sn3gfzRDb7iEYjlokMdTj",
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
      href: url,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

export const settingsPortalDeactivate = {
  ...settingsNoAuth,
  response: { ...settingsNoAuth.response, tenantStatus: 1 },
};

export const settings = (headers?: Headers): Response => {
  let isWizard = false;
  let isWizardWithAmi = false;
  let isPortalDeactivate = false;

  if (headers?.get(HEADER_WIZARD_SETTINGS)) {
    isWizard = true;
  }

  if (headers?.get(HEADER_WIZARD_WITH_AMI_SETTINGS)) {
    isWizardWithAmi = true;
  }

  if (headers?.get(HEADER_PORTAL_DEACTIVATE_SETTINGS)) {
    isPortalDeactivate = true;
  }

  if (isWizard) return new Response(JSON.stringify(settingsWizzard));
  if (isWizardWithAmi)
    return new Response(JSON.stringify(settingsWizzardWithAmi));
  if (isPortalDeactivate)
    return new Response(JSON.stringify(settingsPortalDeactivate));

  return new Response(JSON.stringify(settingsNoAuth));
};
