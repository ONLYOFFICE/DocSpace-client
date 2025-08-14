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

/* eslint-disable no-underscore-dangle */
/* eslint-disable prefer-regex-literals */
import { makeAutoObservable, runInAction } from "mobx";

import Filter from "../api/people/filter";
import { TFrameConfig } from "../types/Frame";
import api from "../api";
import { TFolder } from "../api/files/types";
import {
  TAdditionalResources,
  TCompanyInfo,
  TCustomSchema,
  TDomainValidator,
  TFirebaseSettings,
  TFormGallery,
  TGetColorTheme,
  TLoginSettings,
  TMailDomainSettings,
  TPasswordHash,
  TPasswordSettings,
  TSettings,
  TTimeZone,
  TVersionBuild,
  TExternalResources,
} from "../api/settings/types";
import { TUser } from "../api/people/types";
import { TPortals } from "../api/management/types";
import {
  size as deviceSize,
  isTablet,
  getSystemTheme,
  getDeviceTypeByWidth,
} from "../utils";
import {
  frameCallEvent,
  getShowText,
  isPublicRoom,
  insertTagManager,
  isManagement,
  openUrl,
} from "../utils/common";
import { setCookie, getCookie } from "../utils/cookie";
import { combineUrl } from "../utils/combineUrl";
import FirebaseHelper from "../utils/firebase";
import SocketHelper from "../utils/socket";
import { ILogo } from "../pages/Branding/WhiteLabel/WhiteLabel.types";

import {
  ThemeKeys,
  TenantStatus,
  UrlActionType,
  RecaptchaType,
  DeepLinkType,
  StartPageRoutes,
} from "../enums";
import { LANGUAGE, COOKIE_EXPIRATION_YEAR, MEDIA_VIEW_URL } from "../constants";
import { Dark, Base, TColorScheme } from "../themes";
import { toastr } from "../components/toast";
import { TData } from "../components/toast/Toast.type";
import { version } from "../package.json";
import { Nullable } from "../types";

const themes = {
  Dark,
  Base,
};

const isDesktopEditors = window.AscDesktopEditor !== undefined;
const systemTheme = getSystemTheme();

class SettingsStore {
  isFirstLoaded = false;

  isLoading = false;

  interfaceDirection = "";

  isLoaded = false;

  isBurgerLoading = true;

  checkedMaintenance = false;

  maintenanceExist = false;

  snackbarExist = false;

  currentProductId = "";

  culture = "en";

  cultures: string[] = [];

  theme = themes[systemTheme];

  trustedDomains: string[] = [];

  trustedDomainsType = 0;

  ipRestrictionEnable = false;

  ipRestrictions: string[] = [];

  sessionLifetime = 1440;

  enabledSessionLifetime = false;

  timezone = "UTC";

  timezones: TTimeZone[] = [];

  tenantAlias = "";

  utcOffset = "00:00:00";

  utcHoursOffset = 0;

  defaultPage = "/";

  homepage = "";

  // TODO: Temp value. Change later. Maybe defaultPage should be used.
  startPage = StartPageRoutes.Rooms;

  datePattern = "M/d/yyyy";

  datePatternJQ = "00/00/0000";

  dateTimePattern = "dddd, MMMM d, yyyy h:mm:ss tt";

  datepicker = {
    datePattern: "mm/dd/yy",
    dateTimePattern: "DD, mm dd, yy h:mm:ss tt",
    timePattern: "h:mm tt",
  };

  greetingSettings = "Web Office Applications";

  enableAdmMess = false;

  enabledJoin = false;

  formGallery: TFormGallery = {
    url: "",
    ext: ".oform",
    uploadUrl: "",
    uploadExt: ".docxf",
    path: "",
    domain: "",
    uploadPath: "",
    uploadDomain: "",
    uploadDashboard: "",
  };

  logoUrl: Nullable<ILogo> = null;

  isDesktopClient = isDesktopEditors;

  isDesktopClientInit = false;

  // isDesktopEncryption: desktopEncryption;
  isEncryptionSupport = false;

  encryptionKeys: { [key: string]: string | boolean } = {};

  roomsMode = false;

  isHeaderVisible = false;

  isTabletView = false;

  showText = getShowText();

  articleOpen = false;

  isMobileArticle = false;

  folderPath: TFolder[] = [];

  hashSettings: Nullable<TPasswordHash> = null;

  title = "";

  ownerId = "";

  nameSchemaId = null;

  owner: Nullable<TUser> = null;

  wizardToken = null;

  limitedAccessSpace = null;

  passwordSettings: TPasswordSettings | null = null;

  hasShortenService = false;

  customSchemaList: TCustomSchema[] = [];

  firebase: TFirebaseSettings = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: "",
    databaseURL: "",
  };

  version = "";

  buildVersionInfo = {
    docspace: version,
    documentServer: "6.4.1",
    releaseDate: "",
  };

  debugInfo = false;

  debugInfoData = "";

  socketUrl = "";

  folderFormValidation = new RegExp('[*+:"<>?|\\\\/]', "gim");

  tenantStatus: TenantStatus | null = null;

  externalResources: TExternalResources | null = null;

  hotkeyPanelVisible = false;

  frameConfig: Nullable<TFrameConfig> = null;

  appearanceTheme: TColorScheme[] = [];

  selectedThemeId: number | null = null;

  currentColorScheme: Nullable<TColorScheme> = null;

  enablePlugins = false;

  pluginOptions = { upload: false, delete: false };

  domainValidator: TDomainValidator | null = null;

  additionalResourcesData: Nullable<TAdditionalResources> = null;

  additionalResourcesIsDefault = true;

  companyInfoSettingsData: Nullable<TCompanyInfo> = null;

  companyInfoSettingsIsDefault = true;

  whiteLabelLogoUrls: ILogo[] = [];

  standalone = false;

  mainBarVisible = false;

  zendeskKey = null;

  legalTerms = null;

  baseDomain: string | null = null;

  portals: Nullable<TPortals[]> = null;

  domain = null;

  cspDomains: string[] = [];

  publicRoomKey = "";

  numberAttempt: number | null = null;

  blockingTime: number | null = null;

  checkPeriod: number | null = null;

  userNameRegex = "";

  maxImageUploadSize: number | null = null;

  windowWidth = window.innerWidth;

  windowAngle = window.screen?.orientation?.angle ?? window.orientation ?? 0;

  recaptchaPublicKey: string | null = null;

  recaptchaType: RecaptchaType | null = null;

  displayAbout: boolean = false;

  deepLinkType: DeepLinkType = DeepLinkType.Choice;

  isDefaultPasswordProtection: boolean = false;

  isBannerVisible = false;

  logoText = "";

  limitedAccessDevToolsForUsers = false;

  allowInvitingGuests: boolean | null = null;

  allowInvitingMembers: boolean | null = null;

  hasGuests: boolean | null = null;

  scrollToSettings: boolean = false;

  displayBanners: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  setLogoText = (logoText: string) => {
    this.logoText = logoText;
  };

  setTenantStatus = (tenantStatus: TenantStatus) => {
    this.tenantStatus = tenantStatus;
  };

  get wizardCompleted() {
    return this.isLoaded && !this.wizardToken;
  }

  get helpCenterDomain() {
    return this.externalResources?.helpcenter?.domain;
  }

  get helpCenterEntries() {
    return this.externalResources?.helpcenter?.entries;
  }

  get apiDomain() {
    return this.externalResources?.api?.domain;
  }

  get apiEntries() {
    return this.externalResources?.api?.entries;
  }

  get siteDomain() {
    return this.externalResources?.site?.domain;
  }

  get siteEntries() {
    return this.externalResources?.site?.entries;
  }

  get feedbackAndSupportUrl() {
    return this.externalResources?.support?.domain;
  }

  get suggestFeatureUrl() {
    return this.externalResources?.common?.entries?.feedback;
  }

  get licenseAgreementsUrl() {
    return this.externalResources?.common?.entries.license;
  }

  get ldapSettingsUrl() {
    return this.helpCenterDomain && this.helpCenterEntries?.ldap
      ? `${this.helpCenterDomain}${this.helpCenterEntries.ldap}`
      : this.helpCenterDomain;
  }

  get portalSettingsUrl() {
    return this.helpCenterDomain && this.helpCenterEntries?.settings
      ? `${this.helpCenterDomain}${this.helpCenterEntries.settings}`
      : this.helpCenterDomain;
  }

  get integrationSettingsUrl() {
    return this.helpCenterDomain && this.helpCenterEntries?.integrationsettings
      ? `${this.helpCenterDomain}${this.helpCenterEntries.integrationsettings}`
      : this.helpCenterDomain;
  }

  get docuSignUrl() {
    return this.helpCenterDomain && this.helpCenterEntries?.connectdocusign
      ? `${this.helpCenterDomain}${this.helpCenterEntries.connectdocusign}`
      : this.helpCenterDomain;
  }

  get dropboxUrl() {
    return this.helpCenterDomain && this.helpCenterEntries?.connectdropbox
      ? `${this.helpCenterDomain}${this.helpCenterEntries.connectdropbox}`
      : this.helpCenterDomain;
  }

  get boxUrl() {
    return this.helpCenterDomain && this.helpCenterEntries?.connectbox
      ? `${this.helpCenterDomain}${this.helpCenterEntries.connectbox}`
      : this.helpCenterDomain;
  }

  get mailRuUrl() {
    return this.helpCenterDomain && this.helpCenterEntries?.connectmailru
      ? `${this.helpCenterDomain}${this.helpCenterEntries.connectmailru}`
      : this.helpCenterDomain;
  }

  get oneDriveUrl() {
    return this.helpCenterDomain && this.helpCenterEntries?.connectonedrive
      ? `${this.helpCenterDomain}${this.helpCenterEntries.connectonedrive}`
      : this.helpCenterDomain;
  }

  get microsoftUrl() {
    return this.helpCenterDomain && this.helpCenterEntries?.connectmicrosoft
      ? `${this.helpCenterDomain}${this.helpCenterEntries.connectmicrosoft}`
      : this.helpCenterDomain;
  }

  get googleUrl() {
    return this.helpCenterDomain && this.helpCenterEntries?.connectgoogle
      ? `${this.helpCenterDomain}${this.helpCenterEntries.connectgoogle}`
      : this.helpCenterDomain;
  }

  get facebookUrl() {
    return this.helpCenterDomain && this.helpCenterEntries?.connectfacebook
      ? `${this.helpCenterDomain}${this.helpCenterEntries.connectfacebook}`
      : this.helpCenterDomain;
  }

  get linkedinUrl() {
    return this.helpCenterDomain && this.helpCenterEntries?.connectlinkedin
      ? `${this.helpCenterDomain}${this.helpCenterEntries.connectlinkedin}`
      : this.helpCenterDomain;
  }

  get clickatellUrl() {
    return this.helpCenterDomain && this.helpCenterEntries?.connectclickatell
      ? `${this.helpCenterDomain}${this.helpCenterEntries.connectclickatell}`
      : this.helpCenterDomain;
  }

  get smsclUrl() {
    return this.helpCenterDomain && this.helpCenterEntries?.connectsmsc
      ? `${this.helpCenterDomain}${this.helpCenterEntries.connectsmsc}`
      : this.helpCenterDomain;
  }

  get firebaseUrl() {
    return this.helpCenterDomain && this.helpCenterEntries?.connectfirebase
      ? `${this.helpCenterDomain}${this.helpCenterEntries.connectfirebase}`
      : this.helpCenterDomain;
  }

  get appleIDUrl() {
    return this.helpCenterDomain && this.helpCenterEntries?.connectapple
      ? `${this.helpCenterDomain}${this.helpCenterEntries.connectapple}`
      : this.helpCenterDomain;
  }

  get telegramUrl() {
    return this.helpCenterDomain && this.helpCenterEntries?.connecttelegram
      ? `${this.helpCenterDomain}${this.helpCenterEntries.connecttelegram}`
      : this.helpCenterDomain;
  }

  get wordpressUrl() {
    return this.helpCenterDomain && this.helpCenterEntries?.connectwordpress
      ? `${this.helpCenterDomain}${this.helpCenterEntries.connectwordpress}`
      : this.helpCenterDomain;
  }

  get awsUrl() {
    return this.helpCenterDomain && this.helpCenterEntries?.connectamazon
      ? `${this.helpCenterDomain}${this.helpCenterEntries.connectamazon}`
      : this.helpCenterDomain;
  }

  get googleCloudUrl() {
    return this.helpCenterDomain &&
      this.helpCenterEntries?.connectgooglecloudstorage
      ? `${this.helpCenterDomain}${this.helpCenterEntries.connectgooglecloudstorage}`
      : this.helpCenterDomain;
  }

  get rackspaceUrl() {
    return this.helpCenterDomain && this.helpCenterEntries?.connectrackspace
      ? `${this.helpCenterDomain}${this.helpCenterEntries.connectrackspace}`
      : this.helpCenterDomain;
  }

  get selectelUrl() {
    return this.helpCenterDomain && this.helpCenterEntries?.connectselectel
      ? `${this.helpCenterDomain}${this.helpCenterEntries.connectselectel}`
      : this.helpCenterDomain;
  }

  get yandexUrl() {
    return this.helpCenterDomain && this.helpCenterEntries?.connectyandex
      ? `${this.helpCenterDomain}${this.helpCenterEntries.connectyandex}`
      : this.helpCenterDomain;
  }

  get vkUrl() {
    return this.helpCenterDomain && this.helpCenterEntries?.connectvk
      ? `${this.helpCenterDomain}${this.helpCenterEntries.connectvk}`
      : this.helpCenterDomain;
  }

  get languageAndTimeZoneSettingsUrl() {
    return this.helpCenterDomain && this.helpCenterEntries?.language
      ? `${this.helpCenterDomain}${this.helpCenterEntries.language}`
      : this.helpCenterDomain;
  }

  get welcomePageSettingsUrl() {
    return this.helpCenterDomain && this.helpCenterEntries?.welcomepage
      ? `${this.helpCenterDomain}${this.helpCenterEntries.welcomepage}`
      : this.helpCenterDomain;
  }

  get dnsSettingsUrl() {
    return this.helpCenterDomain && this.helpCenterEntries?.alternativeurl
      ? `${this.helpCenterDomain}${this.helpCenterEntries.alternativeurl}`
      : this.helpCenterDomain;
  }

  get renamingSettingsUrl() {
    return this.helpCenterDomain && this.helpCenterEntries?.renaming
      ? `${this.helpCenterDomain}${this.helpCenterEntries.renaming}`
      : this.helpCenterDomain;
  }

  get passwordStrengthSettingsUrl() {
    return this.helpCenterDomain && this.helpCenterEntries?.passwordstrength
      ? `${this.helpCenterDomain}${this.helpCenterEntries.passwordstrength}`
      : this.helpCenterDomain;
  }

  get tfaSettingsUrl() {
    return this.helpCenterDomain &&
      this.helpCenterEntries?.twofactorauthentication
      ? `${this.helpCenterDomain}${this.helpCenterEntries.twofactorauthentication}`
      : this.helpCenterDomain;
  }

  get trustedMailDomainSettingsUrl() {
    return this.helpCenterDomain && this.helpCenterEntries?.trusteddomain
      ? `${this.helpCenterDomain}${this.helpCenterEntries.trusteddomain}`
      : this.helpCenterDomain;
  }

  get ipSettingsUrl() {
    return this.helpCenterDomain && this.helpCenterEntries?.ipsecurity
      ? `${this.helpCenterDomain}${this.helpCenterEntries.ipsecurity}`
      : this.helpCenterDomain;
  }

  get bruteForceProtectionUrl() {
    return this.helpCenterDomain && this.helpCenterEntries?.login
      ? `${this.helpCenterDomain}${this.helpCenterEntries.login}`
      : this.helpCenterDomain;
  }

  get administratorMessageSettingsUrl() {
    return this.helpCenterDomain && this.helpCenterEntries?.administratormessage
      ? `${this.helpCenterDomain}${this.helpCenterEntries.administratormessage}`
      : this.helpCenterDomain;
  }

  get lifetimeSettingsUrl() {
    return this.helpCenterDomain && this.helpCenterEntries?.sessionlifetime
      ? `${this.helpCenterDomain}${this.helpCenterEntries.sessionlifetime}`
      : this.helpCenterDomain;
  }

  get dataBackupUrl() {
    return this.helpCenterDomain && this.helpCenterEntries?.creatingbackup
      ? `${this.helpCenterDomain}${this.helpCenterEntries.creatingbackup}`
      : this.helpCenterDomain;
  }

  get automaticBackupUrl() {
    return this.helpCenterDomain && this.helpCenterEntries?.autobackup
      ? `${this.helpCenterDomain}${this.helpCenterEntries.autobackup}`
      : this.helpCenterDomain;
  }

  get walletHelpUrl() {
    return this.helpCenterDomain && this.helpCenterEntries?.configuringsettings
      ? `${this.helpCenterDomain}${this.helpCenterEntries.configuringsettings}`
      : this.helpCenterDomain;
  }

  get webhooksGuideUrl() {
    return this.helpCenterDomain && this.helpCenterEntries?.administrationguides
      ? `${this.helpCenterDomain}${this.helpCenterEntries.administrationguides}`
      : this.helpCenterDomain;
  }

  get dataReassignmentUrl() {
    return this.helpCenterDomain && this.helpCenterEntries?.managingusers
      ? `${this.helpCenterDomain}${this.helpCenterEntries.managingusers}`
      : this.helpCenterDomain;
  }

  get installationGuidesUrl() {
    return this.helpCenterDomain && this.helpCenterEntries?.enterpriseinstall
      ? `${this.helpCenterDomain}${this.helpCenterEntries.enterpriseinstall}`
      : this.helpCenterDomain;
  }

  get apiOAuthLink() {
    return this.helpCenterDomain && this.helpCenterEntries?.oauth
      ? `${this.helpCenterDomain}${this.helpCenterEntries.oauth}`
      : this.helpCenterDomain;
  }

  get accessRightsLink() {
    return this.helpCenterDomain && this.helpCenterEntries?.accessrights
      ? `${this.helpCenterDomain}${this.helpCenterEntries.accessrights}`
      : this.helpCenterDomain;
  }

  get sdkLink() {
    return this.apiDomain && this.apiEntries?.["javascript-sdk"]
      ? `${this.apiDomain}${this.apiEntries["javascript-sdk"]}`
      : this.apiDomain;
  }

  get apiBasicLink() {
    return this.apiDomain && this.apiEntries?.docspace
      ? `${this.apiDomain}${this.apiEntries.docspace}`
      : this.apiDomain;
  }

  get apiPluginSDKLink() {
    return this.apiDomain && this.apiEntries?.["plugins-sdk"]
      ? `${this.apiDomain}${this.apiEntries["plugins-sdk"]}`
      : this.apiDomain;
  }

  get apiKeysLink() {
    return this.apiDomain && this.apiEntries?.apikeys
      ? `${this.apiDomain}${this.apiEntries.apikeys}`
      : this.apiDomain;
  }

  get forEnterprisesUrl() {
    return this.siteDomain && this.siteEntries?.forenterprises
      ? `${this.siteDomain}${this.siteEntries.forenterprises}`
      : this.siteDomain;
  }

  get demoOrderUrl() {
    return this.siteDomain && this.siteEntries?.demoorder
      ? `${this.siteDomain}${this.siteEntries.demoorder}`
      : this.siteDomain;
  }

  get desktopUrl() {
    return this.siteDomain && this.siteEntries?.desktop
      ? `${this.siteDomain}${this.siteEntries.desktop}`
      : this.siteDomain;
  }

  get privateRoomsUrl() {
    return this.siteDomain && this.siteEntries?.privaterooms
      ? `${this.siteDomain}${this.siteEntries.privaterooms}`
      : this.siteDomain;
  }

  get allConnectorsUrl() {
    return this.siteDomain && this.siteEntries?.allconnectors
      ? `${this.siteDomain}${this.siteEntries.allconnectors}`
      : this.siteDomain;
  }

  get zoomUrl() {
    return this.siteDomain && this.siteEntries?.officeforzoom
      ? `${this.siteDomain}${this.siteEntries.officeforzoom}`
      : this.siteDomain;
  }

  get wordPressUrl() {
    return this.siteDomain && this.siteEntries?.officeforwordpress
      ? `${this.siteDomain}${this.siteEntries.officeforwordpress}`
      : this.siteDomain;
  }

  get drupalUrl() {
    return this.siteDomain && this.siteEntries?.officefordrupal
      ? `${this.siteDomain}${this.siteEntries.officefordrupal}`
      : this.siteDomain;
  }

  get storageManagementUrl() {
    return this.helpCenterDomain && this.helpCenterEntries?.storagemanagement
      ? `${this.helpCenterDomain}${this.helpCenterEntries.storagemanagement}`
      : this.helpCenterDomain;
  }

  get enterpriseInstallScriptUrl() {
    return this.helpCenterDomain &&
      this.helpCenterEntries?.enterpriseinstallscript
      ? `${this.helpCenterDomain}${this.helpCenterEntries.enterpriseinstallscript}`
      : this.helpCenterDomain;
  }

  get enterpriseInstallWindowsUrl() {
    return this.helpCenterDomain &&
      this.helpCenterEntries?.enterpriseinstallwindows
      ? `${this.helpCenterDomain}${this.helpCenterEntries.enterpriseinstallwindows}`
      : this.helpCenterDomain;
  }

  get downloaddesktopUrl() {
    return this.siteDomain && this.siteEntries?.downloaddesktop
      ? `${this.siteDomain}${this.siteEntries.downloaddesktop}`
      : null;
  }

  get officeforandroidUrl() {
    return this.siteDomain && this.siteEntries?.officeforandroid
      ? `${this.siteDomain}${this.siteEntries.officeforandroid}`
      : null;
  }

  get officeforiosUrl() {
    return this.siteDomain && this.siteEntries?.officeforios
      ? `${this.siteDomain}${this.siteEntries.officeforios}`
      : null;
  }

  get forumLinkUrl() {
    return this.externalResources?.forum?.domain;
  }

  get becometranslatorUrl() {
    return this.helpCenterDomain && this.helpCenterEntries?.becometranslator
      ? `${this.helpCenterDomain}${this.helpCenterEntries.becometranslator}`
      : this.helpCenterDomain;
  }

  get requestEntriesUrl() {
    return this.externalResources?.support?.entries?.request;
  }

  get requestSupportUrl() {
    return this.feedbackAndSupportUrl && this.requestEntriesUrl
      ? `${this.feedbackAndSupportUrl}${this.requestEntriesUrl}`
      : this.feedbackAndSupportUrl;
  }

  get documentationEmail() {
    return this.externalResources?.common?.entries?.documentationemail;
  }

  get bookTrainingEmail() {
    return this.externalResources?.common?.entries?.booktrainingemail;
  }

  get appearanceBlockHelpUrl() {
    return this.helpCenterDomain && this.helpCenterEntries?.appearance
      ? `${this.helpCenterDomain}${this.helpCenterEntries.appearance}`
      : this.helpCenterDomain;
  }

  get limitedDevToolsBlockHelpUrl() {
    return this.helpCenterDomain && this.helpCenterEntries?.limiteddevtools
      ? `${this.helpCenterDomain}${this.helpCenterEntries.limiteddevtools}`
      : this.helpCenterDomain;
  }

  get encryptionBlockHelpUrl() {
    return this.helpCenterDomain && this.helpCenterEntries?.encryption
      ? `${this.helpCenterDomain}${this.helpCenterEntries.encryption}`
      : this.helpCenterDomain;
  }

  get docspaceManagingRoomsHelpUrl() {
    return this.helpCenterDomain &&
      this.helpCenterEntries?.docspacemanagingrooms
      ? `${this.helpCenterDomain}${this.helpCenterEntries.docspacemanagingrooms}`
      : this.helpCenterDomain;
  }

  setIsDesktopClientInit = (isDesktopClientInit: boolean) => {
    this.isDesktopClientInit = isDesktopClientInit;
  };

  setMainBarVisible = (visible: boolean) => {
    this.mainBarVisible = visible;
  };

  setValue = <T>(key: keyof SettingsStore, value: T) => {
    if (key in this)
      // @ts-expect-error is always writable property
      this[key] = value;
  };

  setCheckedMaintenance = (checkedMaintenance: boolean) => {
    this.checkedMaintenance = checkedMaintenance;
  };

  setMaintenanceExist = (maintenanceExist: boolean) => {
    this.maintenanceExist = maintenanceExist;
  };

  setSnackbarExist = (snackbar: boolean) => {
    this.snackbarExist = snackbar;
  };

  setDefaultPage = (defaultPage: string) => {
    this.defaultPage = defaultPage;
  };

  setPortalDomain = (domain: string) => {
    this.baseDomain = domain;
  };

  setPortals = (portals: TPortals[]) => {
    this.portals = portals;
  };

  setGreetingSettings = (greetingSettings: string) => {
    this.greetingSettings = greetingSettings;
  };

  getSettings = async () => {
    const settings: Nullable<TSettings> = await api.settings.getSettings(true);

    if (window.AscDesktopEditor !== undefined) {
      const dp = combineUrl(window.ClientConfig?.proxy?.url, MEDIA_VIEW_URL);
      this.setDefaultPage(dp);
    }

    if (!settings) return;

    Object.keys(settings).forEach((forEachKey) => {
      const key = forEachKey as keyof TSettings;

      if (key in this && settings) {
        if (key === "socketUrl") {
          this.setSocketUrl(settings[key]);
          return;
        }

        this.setValue(
          key as keyof SettingsStore,
          key === "defaultPage"
            ? combineUrl(window.ClientConfig?.proxy?.url, settings[key])
            : settings[key],
        );

        if (key === "culture") {
          if (settings?.wizardToken) return;
          const language = getCookie(LANGUAGE);
          if (!language || language === "undefined") {
            setCookie(LANGUAGE, settings[key], {
              "max-age": COOKIE_EXPIRATION_YEAR,
            });
          }
        }
      } else if (key === "passwordHash" && settings) {
        this.setValue("hashSettings", settings[key]);
      }
    });

    this.setGreetingSettings(settings.greetingSettings);

    return settings;
  };

  getFolderPath = async (id: number) => {
    this.folderPath = await api.files.getFolderPath(id);
  };

  getCustomSchemaList = async () => {
    this.customSchemaList = await api.settings.getCustomSchemaList();
  };

  getPortalSettings = async () => {
    const origSettings = await this.getSettings().catch((err) => {
      if (err?.response?.status === 404) {
        // portal not found

        const wrongportalname =
          (typeof window !== "undefined" &&
            window.ClientConfig?.wrongPortalNameUrl) ||
          `https://www.onlyoffice.com/wrongportalname.aspx`;

        const url = new URL(wrongportalname);
        url.searchParams.append("url", window.location.hostname);
        url.searchParams.append("ref", window.location.href);
        return window.location.replace(url);
      }

      if (err?.response?.status === 403) {
        // access to the portal is restricted
        window.DocSpace.navigate("/access-restricted", {
          state: { isRestrictionError: true },
          replace: true,
        });
      }
    });

    if (origSettings?.plugins?.enabled) {
      this.enablePlugins = origSettings.plugins.enabled;

      this.pluginOptions = {
        upload: origSettings.plugins.upload,
        delete: origSettings.plugins.delete,
      };
    }

    if (origSettings?.tenantAlias) {
      this.setTenantAlias(origSettings.tenantAlias);
    }

    if (origSettings?.domainValidator) {
      this.domainValidator = origSettings.domainValidator;
    }

    if (origSettings?.tagManagerId) {
      insertTagManager(origSettings.tagManagerId);
    }
  };

  getDebugInfo = async () => {
    let response = this.debugInfoData;
    try {
      if (response) return response;

      response = (await api.debuginfo.loadDebugInfo()) as string;
      this.debugInfoData = response;
    } catch (e) {
      console.error("getDebugInfo failed", (e as Error).message);
      response = `Debug info load failed (${(e as Error).message})`;
    }

    runInAction(() => {
      this.debugInfoData = response;
    });

    return response;
  };

  get isPortalDeactivate() {
    return this.tenantStatus === TenantStatus.PortalDeactivate;
  }

  get isPortalRestoring() {
    return this.tenantStatus === TenantStatus.PortalRestore;
  }

  init = async () => {
    this.setIsLoading(true);
    const requests = [];

    requests.push(this.getPortalSettings(), this.getAppearanceTheme());

    await Promise.all(requests);

    if (!this.isPortalDeactivate) {
      await this.getBuildVersionInfo();
    }

    this.setIsLoading(false);
    this.setIsLoaded(true);
    this.setIsFirstLoaded(true);
  };

  setRoomsMode = (mode: boolean) => {
    this.roomsMode = mode;
  };

  setIsLoading = (isLoading: boolean) => {
    this.isLoading = isLoading;
  };

  setIsLoaded = (isLoaded: boolean) => {
    this.isLoaded = isLoaded;
  };

  setIsFirstLoaded = (isFirstLoaded: boolean) => {
    this.isFirstLoaded = isFirstLoaded;
  };

  setCultures = (cultures: string[]) => {
    this.cultures = cultures;
  };

  setAdditionalResourcesData = (data: TAdditionalResources) => {
    this.additionalResourcesData = data;
  };

  setAdditionalResourcesIsDefault = (additionalResourcesIsDefault: boolean) => {
    this.additionalResourcesIsDefault = additionalResourcesIsDefault;
  };

  getAdditionalResources = async () => {
    const res = await api.settings.getAdditionalResources();

    this.setAdditionalResourcesData(res);
    this.setAdditionalResourcesIsDefault(res.isDefault);

    if (!this.isFirstLoaded && !this.isLoading) {
      this.getSettings();
    }
  };

  getPortalCultures = async () => {
    const cultures = await api.settings.getPortalCultures();
    this.setCultures(cultures);
  };

  setIsEncryptionSupport = (isEncryptionSupport: boolean) => {
    this.isEncryptionSupport = isEncryptionSupport;
  };

  getIsEncryptionSupport = async () => {
    const isEncryptionSupport = await api.files.getIsEncryptionSupport();
    this.setIsEncryptionSupport(isEncryptionSupport);
  };

  updateEncryptionKeys = (encryptionKeys: {
    [key: string]: string | boolean;
  }) => {
    this.encryptionKeys = encryptionKeys ?? {};
  };

  setEncryptionKeys = async (keys: { [key: string]: string | boolean }) => {
    await api.files.setEncryptionKeys(keys);
    this.updateEncryptionKeys(keys);
  };

  setCompanyInfoSettingsData = (data: TCompanyInfo) => {
    this.companyInfoSettingsData = data;
  };

  setCompanyInfoSettingsIsDefault = (companyInfoSettingsIsDefault: boolean) => {
    this.companyInfoSettingsIsDefault = companyInfoSettingsIsDefault;
  };

  setLogoUrl = (url: ILogo[]) => {
    [this.logoUrl] = url;
  };

  setLogoUrls = (urls: ILogo[]) => {
    this.whiteLabelLogoUrls = urls;
  };

  getCompanyInfoSettings = async () => {
    const res = await api.settings.getCompanyInfoSettings();

    this.setCompanyInfoSettingsData(res);
    this.setCompanyInfoSettingsIsDefault(res.isDefault);
    this.getSettings();
  };

  getWhiteLabelLogoUrls = async () => {
    const res = await api.settings.getLogoUrls(null, isManagement());

    this.setLogoUrls(Object.values(res));
    this.setLogoUrl(Object.values(res));

    return res;
  };

  getDomainName = async () => {
    const res = await api.management.getDomainName();
    const { settings } = res;
    this.setPortalDomain(settings);
    return settings;
  };

  getAllPortals = async () => {
    try {
      const res = await api.management.getAllPortals();
      this.setPortals(res.tenants);
      return res;
    } catch (e) {
      toastr.error(e as string);
    }
  };

  getPortals = async () => {
    await this.getAllPortals();
  };

  getEncryptionKeys = async () => {
    const encryptionKeys = await api.files.getEncryptionKeys();
    this.updateEncryptionKeys(encryptionKeys);
  };

  setModuleInfo = (homepage: string, productId: string) => {
    if (this.homepage === homepage || this.currentProductId === productId)
      return;

    // console.log(`setModuleInfo('${homepage}', '${productId}')`);

    this.homepage = homepage;
    this.setCurrentProductId(productId);

    const baseElm = document.getElementsByTagName("base");
    if (baseElm && baseElm.length === 1) {
      const baseUrl = homepage
        ? homepage[homepage.length - 1] === "/"
          ? homepage
          : `${homepage}/`
        : "/";

      baseElm[0].setAttribute("href", baseUrl);
    }
  };

  setCurrentProductId = (currentProductId: string) => {
    this.currentProductId = currentProductId;
  };

  setPortalOwner = (owner: TUser) => {
    this.owner = owner;
  };

  getPortalOwner = async () => {
    const owner = await api.people.getUserById(this.ownerId);

    this.setPortalOwner(owner);
    return owner;
  };

  setWizardComplete = () => {
    this.wizardToken = null;
  };

  setPasswordSettings = (passwordSettings: TPasswordSettings) => {
    this.passwordSettings = passwordSettings;
  };

  getPortalPasswordSettings = async (confirmKey = null) => {
    const settings = await api.settings.getPortalPasswordSettings(confirmKey);
    this.setPasswordSettings(settings);
  };

  setPortalPasswordSettings = async (
    minLength: number,
    upperCase: boolean,
    digits: boolean,
    specSymbols: boolean,
  ) => {
    const settings = await api.settings.setPortalPasswordSettings(
      minLength,
      upperCase,
      digits,
      specSymbols,
    );
    this.setPasswordSettings(settings);
  };

  setTimezones = (timezones: TTimeZone[]) => {
    this.timezones = timezones;
  };

  getPortalTimezones = async (token = undefined) => {
    const timezones = await api.settings.getPortalTimezones(token);
    this.setTimezones(timezones);
    return timezones;
  };

  setHeaderVisible = (isHeaderVisible: boolean) => {
    this.isHeaderVisible = isHeaderVisible;
  };

  setIsTabletView = (isTabletView: boolean) => {
    this.isTabletView = isTabletView;
  };

  setShowText = (showText: boolean) => {
    this.showText = showText;
  };

  toggleShowText = () => {
    const reverseValue = !this.showText;

    localStorage.setItem("showArticle", `${reverseValue}`);

    this.showText = reverseValue;
  };

  setArticleOpen = (articleOpen: boolean) => {
    this.articleOpen = articleOpen;
  };

  toggleArticleOpen = () => {
    this.articleOpen = !this.articleOpen;
  };

  setIsMobileArticle = (isMobileArticle: boolean) => {
    this.isMobileArticle = isMobileArticle;
  };

  get firebaseHelper() {
    window.firebaseHelper = new FirebaseHelper(this.firebase);
    return window.firebaseHelper;
  }

  setSocketUrl = (url: string) => {
    this.socketUrl = url;

    const socketUrl =
      isPublicRoom() && !this.publicRoomKey ? "" : this.socketUrl;

    SocketHelper?.connect(socketUrl, this.publicRoomKey);
  };

  setPublicRoomKey = (key: string) => {
    this.publicRoomKey = key;

    const socketUrl = isPublicRoom() && !key ? "" : this.socketUrl;

    SocketHelper?.connect(socketUrl, key);
  };

  getBuildVersionInfo = async () => {
    const versionInfo = await api.settings.getBuildVersion();
    this.setBuildVersionInfo(versionInfo);
  };

  setBuildVersionInfo = (versionInfo: TVersionBuild) => {
    // its release date 3.0.0 for SAAS version
    const saasV3ReleaseDate = "2024-11-23";

    let releaseDate = this.standalone
      ? localStorage.getItem(`${versionInfo.docSpace}-release-date`)
      : new Date(saasV3ReleaseDate).toString();

    if (!releaseDate) {
      releaseDate = new Date().toString();
      localStorage.setItem(`${versionInfo.docSpace}-release-date`, releaseDate);
    }

    this.buildVersionInfo = {
      ...this.buildVersionInfo,
      docspace: version,
      ...versionInfo,
      releaseDate,
    };

    if (!this.buildVersionInfo.documentServer)
      this.buildVersionInfo.documentServer = "6.4.1";
  };

  setTheme = (key: ThemeKeys) => {
    let theme: null | ThemeKeys.BaseStr | ThemeKeys.DarkStr = null;
    switch (key) {
      case ThemeKeys.Base:
      case ThemeKeys.BaseStr:
        theme = ThemeKeys.BaseStr;
        break;
      case ThemeKeys.Dark:
      case ThemeKeys.DarkStr:
        theme = ThemeKeys.DarkStr;
        break;
      case ThemeKeys.System:
      case ThemeKeys.SystemStr:
      default:
        theme =
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches
            ? ThemeKeys.DarkStr
            : ThemeKeys.BaseStr;
        theme = getSystemTheme();
    }

    this.theme = themes[theme];
  };

  setMailDomainSettings = async (data: TMailDomainSettings) => {
    const res = await api.settings.setMailDomainSettings(data);
    this.trustedDomainsType = data.type;
    this.trustedDomains = data.domains;
    return res;
  };

  setTenantAlias = (tenantAlias: string) => {
    this.tenantAlias = tenantAlias;
  };

  getIpRestrictions = async () => {
    const res = await api.settings.getIpRestrictions();
    this.ipRestrictions = res?.map((el) => el.ip);
  };

  setIpRestrictions = async (ips: string[], enable: boolean) => {
    const data = {
      IpRestrictions: ips,
      enable,
    };
    const res = await api.settings.setIpRestrictions(data);

    this.ipRestrictions = res?.ipRestrictions.map((el) => el.ip);
    this.ipRestrictionEnable = res?.enable;
  };

  getIpRestrictionsEnable = async () => {
    const res = await api.settings.getIpRestrictionsEnable();
    this.ipRestrictionEnable = res.enable;
  };

  getInvitationSettings = async () => {
    const res = await api.settings.getInvitationSettings();

    this.allowInvitingGuests = res.allowInvitingGuests;
    this.allowInvitingMembers = res.allowInvitingMembers;
  };

  setInvitationSettings = async (
    allowInvitingGuests: boolean,
    allowInvitingMembers: boolean,
  ) => {
    const data = {
      allowInvitingGuests,
      allowInvitingMembers,
    };
    const res = await api.settings.setInvitationSettings(data);

    this.allowInvitingGuests = res.allowInvitingGuests;
    this.allowInvitingMembers = res.allowInvitingMembers;
  };

  setMessageSettings = async (turnOn: boolean) => {
    await api.settings.setMessageSettings(turnOn);
    this.enableAdmMess = turnOn;
  };

  getSessionLifetime = async () => {
    const res = await api.settings.getCookieSettings();

    this.enabledSessionLifetime = res.enabled;
    this.sessionLifetime = res.lifeTime;
  };

  setSessionLifetimeSettings = async (lifeTime: number, enabled: boolean) => {
    const res = await api.settings.setCookieSettings(lifeTime, enabled);

    this.enabledSessionLifetime = enabled;
    this.sessionLifetime = lifeTime;

    return res;
  };

  setBruteForceProtectionSettings = (settings: TLoginSettings) => {
    this.numberAttempt = settings.attemptCount;
    this.blockingTime = settings.blockTime;
    this.checkPeriod = settings.checkPeriod;
    this.isDefaultPasswordProtection = settings.isDefault;
  };

  getBruteForceProtection = async () => {
    const res = await api.settings.getBruteForceProtection();

    this.setBruteForceProtectionSettings(res);
  };

  setIsBurgerLoading = (isBurgerLoading: boolean) => {
    this.isBurgerLoading = isBurgerLoading;
  };

  setHotkeyPanelVisible = (hotkeyPanelVisible: boolean) => {
    this.hotkeyPanelVisible = hotkeyPanelVisible;
  };

  setFrameConfig = async (frameConfig: TFrameConfig) => {
    runInAction(() => {
      this.frameConfig = frameConfig;
    });

    if (frameConfig) {
      frameCallEvent({
        event: "onAppReady",
        data: { frameId: frameConfig.frameId },
      });
    }
    return frameConfig;
  };

  get isFrame() {
    const isFrame = this.frameConfig
      ? window.name.includes(this.frameConfig?.name as string)
      : false;

    if (window.ClientConfig) window.ClientConfig.isFrame = isFrame;

    return isFrame;
  }

  setAppearanceTheme = (theme: TColorScheme[]) => {
    this.appearanceTheme = theme;
  };

  setSelectThemeId = (selected: number) => {
    this.selectedThemeId = selected;
  };

  setCurrentColorScheme = (currentColorScheme: TColorScheme) => {
    this.currentColorScheme = currentColorScheme;
  };

  getAppearanceTheme = async () => {
    const res: Nullable<TGetColorTheme> =
      await api.settings.getAppearanceTheme();

    const currentColorScheme = res.themes.find((theme) => {
      return res && res.selected === theme.id;
    });

    this.setAppearanceTheme(res.themes);
    this.setSelectThemeId(res.selected);

    if (currentColorScheme) this.setCurrentColorScheme(currentColorScheme);
  };

  setInterfaceDirection = (direction: string) => {
    this.interfaceDirection = direction;
    localStorage.setItem("interfaceDirection", direction);
  };

  setCSPDomains = (domains: string[]) => {
    this.cspDomains = domains;
  };

  getCSPSettings = async () => {
    const { domains } = await api.settings.getCSPSettings();

    this.setCSPDomains(domains || []);

    return domains;
  };

  setCSPSettings = async (data: string[]) => {
    try {
      const { domains } = await api.settings.setCSPSettings(data);

      this.setCSPDomains(domains);

      return domains;
    } catch (e) {
      toastr.error(e as TData);

      throw e;
    }
  };

  setWindowAngle = (angle: number) => {
    this.windowAngle = angle;
  };

  setWindowWidth = (width: number) => {
    if (width <= deviceSize.mobile && this.windowWidth <= deviceSize.mobile)
      return;

    if (isTablet(width) && isTablet(this.windowWidth)) return;

    if (width > deviceSize.desktop && this.windowWidth > deviceSize.desktop)
      return;

    this.windowWidth = width;
  };

  get currentDeviceType() {
    return getDeviceTypeByWidth(this.windowWidth);
  }

  get deviceType() {
    const angleByRadians = (Math.PI / 180) * this.windowAngle;

    const width = Math.abs(
      Math.round(
        Math.sin(angleByRadians) * window.innerHeight +
          Math.cos(angleByRadians) * this.windowWidth,
      ),
    );

    return getDeviceTypeByWidth(width);
  }

  get enablePortalRename() {
    return (
      !this.standalone || (this.standalone && this.baseDomain !== "localhost")
    );
  }

  openUrl = (url: string, action: UrlActionType, replace: boolean = false) => {
    openUrl({
      url,
      action,
      replace,
      isFrame: this.isFrame,
      frameConfig: this.frameConfig,
    });
  };

  checkEnablePortalSettings = (isPaid: boolean) => {
    return isManagement() && this.portals?.length === 1 ? false : isPaid;
  };

  setIsBannerVisible = (visible: boolean) => {
    this.isBannerVisible = visible;
  };

  setDevToolsAccessSettings = async (enable: string) => {
    const boolEnable = enable === "true";
    await api.settings.setLimitedAccessForUsers(boolEnable);
    this.limitedAccessDevToolsForUsers = boolEnable;
  };

  get accessDevToolsForUsers() {
    return this.limitedAccessDevToolsForUsers.toString();
  }

  checkGuests = async () => {
    const filterDefault = Filter.getDefault();
    filterDefault.area = "guests";
    const res = await api.people.getUserList(filterDefault);
    this.hasGuests = !!res.total;
  };

  setScrollToSettings = (scrollToSettings: boolean) => {
    this.scrollToSettings = scrollToSettings;
  };

  setDisplayBanners = (displayBanners: boolean) => {
    this.displayBanners = displayBanners;
  };

  setStartPage = (startPage: StartPageRoutes) => {
    this.startPage = startPage;
  };
}

export { SettingsStore };
