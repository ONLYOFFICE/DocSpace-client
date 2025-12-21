import { PATH_WITH_PARAMS } from "./../authentication/login";
import {
  API_PREFIX,
  BASE_URL,
  HEADER_WIZARD_SETTINGS,
  HEADER_WIZARD_WITH_AMI_SETTINGS,
  HEADER_PORTAL_DEACTIVATE_SETTINGS,
  HEADER_NO_STANDALONE_SETTINGS,
  HEADER_AUTHENTICATED_SETTINGS,
  HEADER_ENABLED_JOIN_SETTINGS,
  HEADER_ENABLE_ADM_MESS_SETTINGS,
  HEADER_HCAPTCHA_SETTINGS,
  HEADER_AUTHENTICATED_WITH_SOCKET_SETTINGS,
  HEADER_PLUGINS_SETTINGS,
} from "../../utils";

export const PATH = "settings";
export const PATH_WITH_QUERY = `${PATH}?**`;

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

    domainValidator: {
      regex: "^[a-z0-9]([a-z0-9-]){1,61}[a-z0-9]$",
      minLength: 3,
      maxLength: 63,
    },
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

    domainValidator: {
      regex: "^[a-z0-9]([a-z0-9-]){1,61}[a-z0-9]$",
      minLength: 3,
      maxLength: 63,
    },

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
      helpcenter: {
        domain: "https://helpcenter.onlyoffice.com",
        entries: {
          accessrights: "/docspace/getting-started.aspx#AccessRights_block",
          administrationguides:
            "/docspace/configuration/docspace-developer-tools-settings.aspx#webhooks_block",
          administratormessage:
            "/docspace/configuration/docspace-security-settings.aspx#administratormessagesettings_block",
          aiprovidersettings:
            "/docspace/configuration/docspace-ai-settings.aspx#aiprovidersettings_block",
          aisettings: "/docspace/configuration/docspace-ai-settings.aspx",
          alternativeurl:
            "/docspace/configuration/docspace-customization-settings.aspx#dnssettings_block",
          apikeys:
            "/docspace/configuration/docspace-developer-tools-settings.aspx#apikeys_block",
          appearance:
            "/docspace/configuration/docspace-customization-settings.aspx#appearance_block",
          autobackup:
            "/docspace/configuration/docspace-backup-restore-settings.aspx#automaticbackup_block",
          becometranslator: "/docspace/contribution/become-translator.aspx",
          configureDeepLink:
            "/docspace/configuration/docspace-customization-settings.aspx#сonfiguredeeplink_block",
          configuringsettings:
            "/docspace/configuration/docspace-wallet-settings.aspx",
          connectamazon: "/docspace/configuration/connect-amazon-docspace.aspx",
          connectapple: "/docspace/configuration/connect-apple-docspace.aspx",
          connectbox: "/docspace/configuration/connect-box-docspace.aspx",
          connectdropbox:
            "/docspace/configuration/connect-dropbox-docspace.aspx",
          connectfacebook:
            "/docspace/configuration/connect-facebook-docspace.aspx",
          connectfirebase:
            "/docspace/configuration/connect-firebase-docspace.aspx",
          connectgoogle: "/docspace/configuration/connect-google-docspace.aspx",
          connectgooglecloudstorage:
            "/docspace/configuration/connect-google-cloud-storage-docspace.aspx",
          connectlinkedin:
            "/docspace/configuration/connect-linkedin-docspace.aspx",
          connectmicrosoft:
            "/docspace/configuration/connect-microsoft-docspace.aspx",
          connectonedrive:
            "/docspace/configuration/connect-onedrive-docspace.aspx",
          connectrackspace:
            "/docspace/configuration/connect-rackspace-docspace.aspx",
          connecttelegram:
            "/docspace/configuration/connect-telegram-docspace.aspx",
          connecttwitter:
            "/docspace/configuration/connect-twitter-docspace.aspx",
          connectwechat: "/docspace/configuration/connect-wechat-docspace.aspx",
          connectzoom: "/docspace/configuration/connect-zoom-docspace.aspx",
          creatingbackup:
            "/docspace/configuration/docspace-backup-restore-settings.aspx#creatingbackup_block",
          dataImport:
            "/docspace/configuration/docspace-data-import-settings.aspx",
          docspacefaq: "/docspace/faq.aspx",
          docspacemanagingrooms:
            "/docspace/administration/docspace-managing-rooms.aspx",
          documentService:
            "/docspace/configuration/docspace-integration-settings.aspx#documentservicesettings_block",
          encryption:
            "/docspace/configuration/docspace-encryption-at-rest.aspx",
          enterpriseinstall: "/docspace/installation/enterprise",
          enterpriseinstallscript:
            "/docspace/installation/docspace-enterprise-install-script.aspx",
          enterpriseinstallwindows:
            "/docspace/installation/docspace-enterprise-install-windows.aspx",
          integrationsettings:
            "/docspace/configuration/docspace-integration-settings.aspx#thirdpartyserviceintegration_block",
          invitationSettings:
            "/docspace/configuration/docspace-security-settings.aspx#invitationsettings_block",
          ipsecurity:
            "/docspace/configuration/docspace-security-settings.aspx#ipsecuritysettings_block",
          knowledgesettings:
            "/docspace/configuration/docspace-ai-settings.aspx#knowledgesettings_block",
          language:
            "/docspace/configuration/docspace-customization-settings.aspx#languageandtimezonesettings_block",
          ldap: "/docspace/configuration/docspace-integration-settings.aspx#ldapsettings_block",
          limiteddevtools:
            "/docspace/configuration/docspace-security-settings.aspx#limiteddevelopertoolsaccess_block",
          login:
            "/docspace/configuration/docspace-security-settings.aspx#bruteforceprotectionsettings_block",
          managingusers:
            "/docspace/administration/docspace-managing-users.aspx",
          mcpserverssettings:
            "/docspace/configuration/docspace-ai-settings.aspx#mcpserverssettings_block",
          oauth:
            "/docspace/configuration/docspace-developer-tools-settings.aspx#oauth_block",
          passwordstrength:
            "/docspace/configuration/docspace-security-settings.aspx#passwordstrengthsettings_block",
          pluginsSdk:
            "/docspace/configuration/docspace-integration-settings.aspx#plugins_block",
          renaming:
            "/docspace/configuration/docspace-customization-settings.aspx#docspacerenaming_block",
          sessionlifetime:
            "/docspace/configuration/docspace-security-settings.aspx#sessionlifetime_block",
          settings: "/docspace/configuration",
          singleSignOn:
            "/docspace/configuration/docspace-integration-settings.aspx#singlesignonsettings_block",
          smtp: "/docspace/configuration/docspace-integration-settings.aspx#smtpsettings_block",
          storagemanagement:
            "/docspace/configuration/docspace-storage-management-settings.aspx",
          trusteddomain:
            "/docspace/configuration/docspace-security-settings.aspx#trustedmaildomainsettings_block",
          twofactorauthentication:
            "/docspace/configuration/docspace-two-factor-authentication.aspx",
          userguides: "/userguides/docspace-index.aspx",
          websearchsettings:
            "/docspace/configuration/docspace-ai-settings.aspx#websearchsettings_block",
          welcomepage:
            "/docspace/configuration/docspace-customization-settings.aspx#welcomepagesettings_block",
        },
      },
      support: {
        domain: "https://helpdesk.onlyoffice.com",
        entries: {
          request: "/hc/requests/new",
        },
      },
    },
    logoText: "ONLYOFFICE",
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

export const settingAuthWithSocket = {
  ...settingsNoAuth,
  response: { ...settingsNoAuth.response, socketUrl: "/socket.io" },
};

export const settingsWithPlugins = {
  ...settingsAuth,
  response: {
    ...settingsAuth.response,
    plugins: {
      enabled: true,
      upload: true,
      delete: true,
    },
  },
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

    domainValidator: {
      regex: "^[a-z0-9]([a-z0-9-]){1,61}[a-z0-9]$",
      minLength: 3,
      maxLength: 63,
    },

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

export const settingsWithEnabledJoin = {
  ...settingsNoAuth,
  response: { ...settingsNoAuth.response, enabledJoin: true },
};

export const settingsWithEnableAdmMess = {
  ...settingsNoAuth,
  response: { ...settingsNoAuth.response, enableAdmMess: true },
};

export const settingsWithHCaptcha = {
  ...settingsNoAuth,
  response: {
    ...settingsNoAuth.response,
    recaptchaType: 3,
    recaptchaPublicKey: "10000000-ffff-ffff-ffff-000000000001",
  },
};

export const settings = (headers?: Headers): Response => {
  let isWizard = false;
  let isWizardWithAmi = false;
  let isPortalDeactivate = false;
  let isNoStandalone = false;
  let isAuthenticated = false;
  let isEnableJoin = false;
  let isEnableAdmMess = false;
  let isHCaptcha = false;
  let isPlugins = false;

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

  if (headers?.get(HEADER_ENABLED_JOIN_SETTINGS)) {
    isEnableJoin = true;
  }

  if (headers?.get(HEADER_ENABLE_ADM_MESS_SETTINGS)) {
    isEnableAdmMess = true;
  }

  if (headers?.get(HEADER_HCAPTCHA_SETTINGS)) {
    isHCaptcha = true;
  }

  if (headers?.get(HEADER_PLUGINS_SETTINGS)) {
    isPlugins = true;
  }

  if (isWizard) return new Response(JSON.stringify(settingsWizzard));
  if (isWizardWithAmi)
    return new Response(JSON.stringify(settingsWizzardWithAmi));
  if (isPortalDeactivate)
    return new Response(JSON.stringify(settingsPortalDeactivate));
  if (isNoStandalone)
    return new Response(JSON.stringify(settingsNoAuthNoStandalone));
  if (isAuthenticated) {
    if (headers?.get(HEADER_AUTHENTICATED_WITH_SOCKET_SETTINGS)) {
      return new Response(JSON.stringify(settingAuthWithSocket));
    }
    if (isPlugins) return new Response(JSON.stringify(settingsWithPlugins));
    return new Response(JSON.stringify(settingsAuth));
  }
  if (isEnableJoin)
    return new Response(JSON.stringify(settingsWithEnabledJoin));
  if (isEnableAdmMess)
    return new Response(JSON.stringify(settingsWithEnableAdmMess));
  if (isHCaptcha) return new Response(JSON.stringify(settingsWithHCaptcha));

  return new Response(JSON.stringify(settingsNoAuth));
};
