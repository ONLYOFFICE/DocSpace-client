import { http, HttpResponse } from "msw";

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

export default http.get("/api/2.0/settings", async () => {
  return HttpResponse.json(settingsSuccessNoAuth);
});
