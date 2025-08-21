import {
  API_PREFIX,
  BASE_URL,
  HEADER_WIZARD_SETTINGS,
  HEADER_WIZARD_WITH_AMI_SETTINGS,
  HEADER_PORTAL_DEACTIVATE_SETTINGS,
  HEADER_NO_STANDALONE_SETTINGS,
  HEADER_AUTHENTICATED_SETTINGS,
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
    cookieSettingsEnabled: false,
    limitedAccessSpace: false,
    userNameRegex: "^[\\p{L}\\p{M}' \\-]+$",
    maxImageUploadSize: 0,
    isAmi: false,
    externalResources: {
      api: {
        domain: "https://api.onlyoffice.com",
        entries: {
          docspace: "/docspace",
          "javascript-sdk":
            "/docspace/javascript-sdk/get-started/basic-concepts",
          "plugins-sdk": "/docspace/plugins-sdk/get-started/basic-concepts",
        },
      },
      common: {
        entries: {
          booktrainingemail: "",
          documentationemail: "",
          legalterms:
            "https://help.onlyoffice.co/products/files/doceditor.aspx?fileid=5048502&doc=SXhWMEVzSEYxNlVVaXJJeUVtS0kyYk14YWdXTEFUQmRWL250NllHNUFGbz0_IjUwNDg1MDIi0",
          license:
            "https://help.onlyoffice.co/Products/Files/DocEditor.aspx?fileid=9318110&doc=S2RPck54RXJsd09QaTZiaFJvUWRwNjNaNE8rTE9LV3hnZmdoSm5Lcm94az0_IntcImVudHJ5XCI6XCI5MzE4MTEwXCIsXCJsaW5rXCI6XCJkOGVjZjdmMy1mY2E1LTQxZDYtYmM2Yi1kNDI4Mzk0YTNlMTdcIn0i0",
          paymentemail: "sales@onlyoffice.com",
          supportemail: "support@onlyoffice.com",
        },
      },
      forum: {
        domain: "https://forum.onlyoffice.com",
      },
      integrations: {
        entries: {
          drupal: "https://www.drupal.org/project/onlyoffice_docspace",
          pipedrive:
            "https://www.pipedrive.com/en/marketplace/app/onlyoffice-doc-space/4cb3b5d9d19a1918",
          wordpress: "https://wordpress.org/plugins/onlyoffice-docspace/",
          zapier: "https://zapier.com/apps/onlyoffice-docspace/integrations",
          zoom: "https://marketplace.zoom.us/apps/OW6rOq-nRgCihG5eps_p-g",
        },
      },
      site: {
        domain: "https://www.onlyoffice.com/ru",
        entries: {
          allconnectors: "/all-connectors.aspx",
          buydeveloper: "/post.ashx?type=buydocspacedeveloper",
          buyenterprise: "/post.ashx?type=buydocspaceenterprise",
          collaborationrooms: "/collaboration-rooms.aspx",
          customrooms: "/custom-rooms.aspx",
          demoorder: "/demo-order.aspx",
          desktop: "/desktop.aspx",
          docspace: "/docspace.aspx",
          docspaceprices: "/docspace-prices.aspx",
          downloaddesktop: "/download-desktop.aspx#desktop",
          downloadmobile: "/download-desktop.aspx#mobile",
          forenterprises: "/for-enterprises.aspx",
          formfillingrooms: "/form-filling-rooms.aspx",
          officeforandroid: "/office-for-android.aspx",
          officefordrupal: "/office-for-drupal.aspx",
          officeforios: "/office-for-ios.aspx",
          officeforwordpress: "/office-for-wordpress.aspx",
          officeforzapier: "/office-for-zapier.aspx",
          officeforzoom: "/office-for-zoom.aspx",
          openai: "/app-directory/openai",
          privaterooms: "/private-rooms.aspx",
          publicrooms: "/public-rooms.aspx",
          registrationcanceled: "/registration-canceled.aspx",
          seamlesscollaboration: "/seamless-collaboration.aspx",
          subscribe: "/post.ashx",
          wrongportalname: "/wrongportalname.aspx",
        },
      },
      socialNetworks: {
        entries: {
          facebook: "https://www.facebook.com/pages/OnlyOffice/833032526736775",
          instagram: "https://www.instagram.com/the_onlyoffice/",
          tiktok: "https://vm.tiktok.com/ZMLXbFEyd/",
          twitter: "https://twitter.com/ONLY_OFFICE",
          youtube: "https://www.youtube.com/user/onlyofficeTV",
        },
      },
      videoguides: {
        domain: "https://helpcenter.onlyoffice.com/ru/video.aspx",
        entries: {
          activesessions: "https://youtu.be/QxrRtMDj2ZM",
          archive: "https://youtu.be/WX-SN_nB4cI",
          backup: "https://youtu.be/2ed2iSxLCwk",
          createfiles: "https://youtu.be/1f9sl4u94v4",
          fileversions: "https://youtu.be/_Br4aGP7f3c",
          filterfiles: "https://youtu.be/zy5mPrf1DqY",
          full: "https://youtu.be/rEurv8Mss0o",
          hotkeys: "https://youtu.be/jclhTh5TXp0",
          operationswithfiles: "https://youtu.be/E96rEIgDO8M",
          playlist:
            "https://www.youtube.com/playlist?list=PLCF48HEKMOYM8MBnwYs8q5J0ILMK9NzIx",
          profile: "https://youtu.be/eJNHyjoc3lQ",
          roles: "https://youtu.be/5tzRL9Kxj1Y",
          rooms: "https://youtu.be/XBY2H9BaYDk",
          security: "https://youtu.be/psxZ0fDXiUo",
          whatis: "https://youtu.be/T8_hGjQR1Kk",
        },
      },
    },
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

    cookieSettingsEnabled: false,
    limitedAccessSpace: false,
    userNameRegex: "^[\\p{L}\\p{M}' \\-]+$",
    maxImageUploadSize: 0,
    externalResources: {
      api: {
        domain: "https://api.onlyoffice.com",
        entries: {
          docspace: "/docspace",
          "javascript-sdk":
            "/docspace/javascript-sdk/get-started/basic-concepts",
          "plugins-sdk": "/docspace/plugins-sdk/get-started/basic-concepts",
        },
      },
      common: {
        entries: {
          booktrainingemail: "",
          documentationemail: "",
          legalterms:
            "https://help.onlyoffice.co/products/files/doceditor.aspx?fileid=5048502&doc=SXhWMEVzSEYxNlVVaXJJeUVtS0kyYk14YWdXTEFUQmRWL250NllHNUFGbz0_IjUwNDg1MDIi0",
          license:
            "https://help.onlyoffice.co/Products/Files/DocEditor.aspx?fileid=9318110&doc=S2RPck54RXJsd09QaTZiaFJvUWRwNjNaNE8rTE9LV3hnZmdoSm5Lcm94az0_IntcImVudHJ5XCI6XCI5MzE4MTEwXCIsXCJsaW5rXCI6XCJkOGVjZjdmMy1mY2E1LTQxZDYtYmM2Yi1kNDI4Mzk0YTNlMTdcIn0i0",
          paymentemail: "sales@onlyoffice.com",
          supportemail: "support@onlyoffice.com",
        },
      },
      forum: {
        domain: "https://forum.onlyoffice.com",
      },
      integrations: {
        entries: {
          drupal: "https://www.drupal.org/project/onlyoffice_docspace",
          pipedrive:
            "https://www.pipedrive.com/en/marketplace/app/onlyoffice-doc-space/4cb3b5d9d19a1918",
          wordpress: "https://wordpress.org/plugins/onlyoffice-docspace/",
          zapier: "https://zapier.com/apps/onlyoffice-docspace/integrations",
          zoom: "https://marketplace.zoom.us/apps/OW6rOq-nRgCihG5eps_p-g",
        },
      },
      site: {
        domain: "https://www.onlyoffice.com/ru",
        entries: {
          allconnectors: "/all-connectors.aspx",
          buydeveloper: "/post.ashx?type=buydocspacedeveloper",
          buyenterprise: "/post.ashx?type=buydocspaceenterprise",
          collaborationrooms: "/collaboration-rooms.aspx",
          customrooms: "/custom-rooms.aspx",
          demoorder: "/demo-order.aspx",
          desktop: "/desktop.aspx",
          docspace: "/docspace.aspx",
          docspaceprices: "/docspace-prices.aspx",
          downloaddesktop: "/download-desktop.aspx#desktop",
          downloadmobile: "/download-desktop.aspx#mobile",
          forenterprises: "/for-enterprises.aspx",
          formfillingrooms: "/form-filling-rooms.aspx",
          officeforandroid: "/office-for-android.aspx",
          officefordrupal: "/office-for-drupal.aspx",
          officeforios: "/office-for-ios.aspx",
          officeforwordpress: "/office-for-wordpress.aspx",
          officeforzapier: "/office-for-zapier.aspx",
          officeforzoom: "/office-for-zoom.aspx",
          openai: "/app-directory/openai",
          privaterooms: "/private-rooms.aspx",
          publicrooms: "/public-rooms.aspx",
          registrationcanceled: "/registration-canceled.aspx",
          seamlesscollaboration: "/seamless-collaboration.aspx",
          subscribe: "/post.ashx",
          wrongportalname: "/wrongportalname.aspx",
        },
      },
      socialNetworks: {
        entries: {
          facebook: "https://www.facebook.com/pages/OnlyOffice/833032526736775",
          instagram: "https://www.instagram.com/the_onlyoffice/",
          tiktok: "https://vm.tiktok.com/ZMLXbFEyd/",
          twitter: "https://twitter.com/ONLY_OFFICE",
          youtube: "https://www.youtube.com/user/onlyofficeTV",
        },
      },
      videoguides: {
        domain: "https://helpcenter.onlyoffice.com/ru/video.aspx",
        entries: {
          activesessions: "https://youtu.be/QxrRtMDj2ZM",
          archive: "https://youtu.be/WX-SN_nB4cI",
          backup: "https://youtu.be/2ed2iSxLCwk",
          createfiles: "https://youtu.be/1f9sl4u94v4",
          fileversions: "https://youtu.be/_Br4aGP7f3c",
          filterfiles: "https://youtu.be/zy5mPrf1DqY",
          full: "https://youtu.be/rEurv8Mss0o",
          hotkeys: "https://youtu.be/jclhTh5TXp0",
          operationswithfiles: "https://youtu.be/E96rEIgDO8M",
          playlist:
            "https://www.youtube.com/playlist?list=PLCF48HEKMOYM8MBnwYs8q5J0ILMK9NzIx",
          profile: "https://youtu.be/eJNHyjoc3lQ",
          roles: "https://youtu.be/5tzRL9Kxj1Y",
          rooms: "https://youtu.be/XBY2H9BaYDk",
          security: "https://youtu.be/psxZ0fDXiUo",
          whatis: "https://youtu.be/T8_hGjQR1Kk",
        },
      },
    },
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

export const settingsAuth = {
  ...settingsNoAuth,
  response: { ...settingsNoAuth.response, socketUrl: "123" },
};

export const settingsNoAuthNoStandalone = {
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
    standalone: false,
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

    cookieSettingsEnabled: false,
    limitedAccessSpace: false,
    userNameRegex: "^[\\p{L}\\p{M}' \\-]+$",
    maxImageUploadSize: 0,
    externalResources: {
      api: {
        domain: "https://api.onlyoffice.com",
        entries: {
          docspace: "/docspace",
          "javascript-sdk":
            "/docspace/javascript-sdk/get-started/basic-concepts",
          "plugins-sdk": "/docspace/plugins-sdk/get-started/basic-concepts",
        },
      },
      common: {
        entries: {
          booktrainingemail: "",
          documentationemail: "",
          legalterms:
            "https://help.onlyoffice.co/products/files/doceditor.aspx?fileid=5048502&doc=SXhWMEVzSEYxNlVVaXJJeUVtS0kyYk14YWdXTEFUQmRWL250NllHNUFGbz0_IjUwNDg1MDIi0",
          license:
            "https://help.onlyoffice.co/Products/Files/DocEditor.aspx?fileid=9318110&doc=S2RPck54RXJsd09QaTZiaFJvUWRwNjNaNE8rTE9LV3hnZmdoSm5Lcm94az0_IntcImVudHJ5XCI6XCI5MzE4MTEwXCIsXCJsaW5rXCI6XCJkOGVjZjdmMy1mY2E1LTQxZDYtYmM2Yi1kNDI4Mzk0YTNlMTdcIn0i0",
          paymentemail: "sales@onlyoffice.com",
          supportemail: "support@onlyoffice.com",
        },
      },
      forum: {
        domain: "https://forum.onlyoffice.com",
      },
      integrations: {
        entries: {
          drupal: "https://www.drupal.org/project/onlyoffice_docspace",
          pipedrive:
            "https://www.pipedrive.com/en/marketplace/app/onlyoffice-doc-space/4cb3b5d9d19a1918",
          wordpress: "https://wordpress.org/plugins/onlyoffice-docspace/",
          zapier: "https://zapier.com/apps/onlyoffice-docspace/integrations",
          zoom: "https://marketplace.zoom.us/apps/OW6rOq-nRgCihG5eps_p-g",
        },
      },
      site: {
        domain: "https://www.onlyoffice.com/ru",
        entries: {
          allconnectors: "/all-connectors.aspx",
          buydeveloper: "/post.ashx?type=buydocspacedeveloper",
          buyenterprise: "/post.ashx?type=buydocspaceenterprise",
          collaborationrooms: "/collaboration-rooms.aspx",
          customrooms: "/custom-rooms.aspx",
          demoorder: "/demo-order.aspx",
          desktop: "/desktop.aspx",
          docspace: "/docspace.aspx",
          docspaceprices: "/docspace-prices.aspx",
          downloaddesktop: "/download-desktop.aspx#desktop",
          downloadmobile: "/download-desktop.aspx#mobile",
          forenterprises: "/for-enterprises.aspx",
          formfillingrooms: "/form-filling-rooms.aspx",
          officeforandroid: "/office-for-android.aspx",
          officefordrupal: "/office-for-drupal.aspx",
          officeforios: "/office-for-ios.aspx",
          officeforwordpress: "/office-for-wordpress.aspx",
          officeforzapier: "/office-for-zapier.aspx",
          officeforzoom: "/office-for-zoom.aspx",
          openai: "/app-directory/openai",
          privaterooms: "/private-rooms.aspx",
          publicrooms: "/public-rooms.aspx",
          registrationcanceled: "/registration-canceled.aspx",
          seamlesscollaboration: "/seamless-collaboration.aspx",
          subscribe: "/post.ashx",
          wrongportalname: "/wrongportalname.aspx",
        },
      },
      socialNetworks: {
        entries: {
          facebook: "https://www.facebook.com/pages/OnlyOffice/833032526736775",
          instagram: "https://www.instagram.com/the_onlyoffice/",
          tiktok: "https://vm.tiktok.com/ZMLXbFEyd/",
          twitter: "https://twitter.com/ONLY_OFFICE",
          youtube: "https://www.youtube.com/user/onlyofficeTV",
        },
      },
      videoguides: {
        domain: "https://helpcenter.onlyoffice.com/ru/video.aspx",
        entries: {
          activesessions: "https://youtu.be/QxrRtMDj2ZM",
          archive: "https://youtu.be/WX-SN_nB4cI",
          backup: "https://youtu.be/2ed2iSxLCwk",
          createfiles: "https://youtu.be/1f9sl4u94v4",
          fileversions: "https://youtu.be/_Br4aGP7f3c",
          filterfiles: "https://youtu.be/zy5mPrf1DqY",
          full: "https://youtu.be/rEurv8Mss0o",
          hotkeys: "https://youtu.be/jclhTh5TXp0",
          operationswithfiles: "https://youtu.be/E96rEIgDO8M",
          playlist:
            "https://www.youtube.com/playlist?list=PLCF48HEKMOYM8MBnwYs8q5J0ILMK9NzIx",
          profile: "https://youtu.be/eJNHyjoc3lQ",
          roles: "https://youtu.be/5tzRL9Kxj1Y",
          rooms: "https://youtu.be/XBY2H9BaYDk",
          security: "https://youtu.be/psxZ0fDXiUo",
          whatis: "https://youtu.be/T8_hGjQR1Kk",
        },
      },
    },
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
  let isNoStandalone = false;
  let isAuthenticated = false;

  if (headers?.get(HEADER_WIZARD_SETTINGS)) {
    isWizard = true;
  }

  if (headers?.get(HEADER_WIZARD_WITH_AMI_SETTINGS)) {
    isWizardWithAmi = true;
  }

  if (headers?.get(HEADER_PORTAL_DEACTIVATE_SETTINGS)) {
    isPortalDeactivate = true;
  }

  if (headers?.get(HEADER_NO_STANDALONE_SETTINGS)) {
    isNoStandalone = true;
  }

  if (headers?.get(HEADER_AUTHENTICATED_SETTINGS)) {
    isAuthenticated = true;
  }

  if (isWizard) return new Response(JSON.stringify(settingsWizzard));
  if (isWizardWithAmi)
    return new Response(JSON.stringify(settingsWizzardWithAmi));
  if (isPortalDeactivate)
    return new Response(JSON.stringify(settingsPortalDeactivate));
  if (isNoStandalone)
    return new Response(JSON.stringify(settingsNoAuthNoStandalone));
  if (isAuthenticated) return new Response(JSON.stringify(settingsAuth));

  return new Response(JSON.stringify(settingsNoAuth));
};
