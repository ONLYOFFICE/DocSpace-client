// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import { http } from "msw";
import { API_PREFIX, BASE_URL } from "../../e2e/utils";

export const PATH = "settings";

export enum TypeSettings {
  Wizard = "wizard",
  WizardWithAmi = "wizardWithAmi",
  PortalDeactivate = "portalDeactivate",
  NoStandalone = "noStandalone",
  Authenticated = "authenticated",
  AuthenticatedNoStandalone = "authenticatedNoStandalone",
  AuthenticatedWithSocket = "authenticatedWithSocket",
  AuthenticatedWithPlugins = "authenticatedWithPlugins",
  NoAuth = "noAuth",
  EnabledJoin = "enabledJoin",
  EnableAdmMess = "enableAdmMess",
  WithHCaptcha = "withHCaptcha",
  Connected = "connected",
}

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
      href: `/${API_PREFIX}/${PATH}`,
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
    recaptchaPublicKey: "",
    debugInfo: false,
    tenantStatus: 0,
    tenantAlias: "localhost",

    domainValidator: {
      regex: "^[a-z0-9]([a-z0-9-]){1,61}[a-z0-9]$",
      minLength: 3,
      maxLength: 63,
    },
    deepLink: {
      androidPackageName: "com.onlyoffice.documents",
      url: "oodocuments://openfile",
      iosPackageId: "944896972",
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
      href: `/${API_PREFIX}/${PATH}`,
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

export const settingsAuthNoStandalone = {
  ...settingsAuth,
  response: { ...settingsAuth.response, standalone: false },
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
      href: `/${API_PREFIX}/${PATH}`,
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

export const settingsConnected = {
  ...settingsNoAuth,
  response: {
    ...settingsNoAuth.response,
    tenantAlias: "test",
  },
};

export const settingsResolver = (
  type: TypeSettings = TypeSettings.NoAuth,
): Response => {
  if (type === TypeSettings.Wizard)
    return new Response(JSON.stringify(settingsWizzard));
  if (type === TypeSettings.WizardWithAmi)
    return new Response(JSON.stringify(settingsWizzardWithAmi));
  if (type === TypeSettings.PortalDeactivate)
    return new Response(JSON.stringify(settingsPortalDeactivate));
  if (type === TypeSettings.NoStandalone)
    return new Response(JSON.stringify(settingsNoAuthNoStandalone));
  if (type === TypeSettings.Authenticated)
    return new Response(JSON.stringify(settingsAuth));
  if (type === TypeSettings.AuthenticatedNoStandalone)
    return new Response(JSON.stringify(settingsAuthNoStandalone));
  if (type === TypeSettings.AuthenticatedWithSocket)
    return new Response(JSON.stringify(settingAuthWithSocket));
  if (type === TypeSettings.EnabledJoin)
    return new Response(JSON.stringify(settingsWithEnabledJoin));
  if (type === TypeSettings.EnableAdmMess)
    return new Response(JSON.stringify(settingsWithEnableAdmMess));
  if (type === TypeSettings.WithHCaptcha)
    return new Response(JSON.stringify(settingsWithHCaptcha));
  if (type === TypeSettings.AuthenticatedWithPlugins)
    return new Response(JSON.stringify(settingsWithPlugins));
  if (type === TypeSettings.Connected)
    return new Response(JSON.stringify(settingsConnected));

  return new Response(JSON.stringify(settingsNoAuth));
};

export const settingsHandler = (
  port: string,
  type: TypeSettings = TypeSettings.NoAuth,
) => {
  return http.get(`${BASE_URL}:${port}/${API_PREFIX}/${PATH}`, () => {
    return settingsResolver(type);
  });
};
