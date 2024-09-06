import { API_PREFIX, BASE_URL, HEADER_WIZARD_SETTINGS } from "../../utils";

const PATH = "settings";

const url = `${BASE_URL}/${API_PREFIX}/${PATH}`;

export const settings = (headers?: Headers): Response => {
  let isWizard = false;

  if (headers?.get(HEADER_WIZARD_SETTINGS)) {
    isWizard = true;
  }

  if (isWizard)
    return new Response(
      JSON.stringify({
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

  return new Response(
    JSON.stringify({
      response: {
        timezone: "Asia/Tbilisi",
        trustedDomains: [],
        trustedDomainsType: 1,
        culture: "en-US",
        utcOffset: "04:00:00",
        utcHoursOffset: 4,
        greetingSettings: "Web Office",
        ownerId: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
        nameSchemaId: "Common",
        enableAdmMess: false,
        docSpace: true,
        standalone: true,
        baseDomain: "localhost",
        passwordHash: {
          size: 256,
          iterations: 100000,
          salt: "4d9abe238e2f7b14a30a4565d62214a795a15abb798ed61118a69820d6a6146c",
        },
        firebase: {
          apiKey: "",
          authDomain: "",
          projectId: "",
          storageBucket: "",
          messagingSenderId: "",
          appId: "",
          measurementId: "",
          databaseURL: "",
        },
        version: ".",
        recaptchaType: 0,
        debugInfo: false,
        socketUrl: "/socket.io",
        tenantStatus: 0,
        tenantAlias: "localhost",
        helpLink: "https://helpcenter.onlyoffice.com",
        forumLink: "https://forum.onlyoffice.com",
        apiDocsLink: "https://api.onlyoffice.com",
        domainValidator: {
          regex: "^[a-z0-9]([a-z0-9-]){1,61}[a-z0-9]$",
          minLength: 3,
          maxLength: 63,
        },
        zendeskKey: "",
        tagManagerId: "",
        bookTrainingEmail: "training@onlyoffice.com",
        documentationEmail: "documentation@onlyoffice.com",
        legalTerms:
          "https://help.onlyoffice.co/products/files/doceditor.aspx?fileid=5048502&doc=SXhWMEVzSEYxNlVVaXJJeUVtS0kyYk14YWdXTEFUQmRWL250NllHNUFGbz0_IjUwNDg1MDIi0",
        cookieSettingsEnabled: false,
        limitedAccessSpace: false,
        userNameRegex: "^[\\p{L}\\p{M}' \\-]+$",
        invitationLimit: 2147483647,
        plugins: {
          enabled: true,
          upload: true,
          delete: true,
        },
        deepLink: {
          androidPackageName: "com.onlyoffice.documents",
          url: "oodocuments://openfile",
          iosPackageId: "944896972",
        },
        formGallery: {
          path: "/api/oforms/",
          domain: "https://cmsoforms.teamlab.info",
          ext: ".pdf",
          uploadPath: "/api/upload",
          uploadDomain: "https://oforms.teamlab.info",
          uploadExt: ".pdf",
          uploadDashboard: "/dashboard/api",
        },
        maxImageUploadSize: 5242880,
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
    }),
  );
};
