/* eslint-disable no-underscore-dangle */
/* eslint-disable prefer-regex-literals */
import { makeAutoObservable, runInAction } from "mobx";

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
} from "../api/settings/types";
import { TUser } from "../api/people/types";
import { size as deviceSize, isTablet, getSystemTheme } from "../utils";
import {
  frameCallEvent,
  getShowText,
  initArticleAlertsData,
  isPublicRoom,
} from "../utils/common";
import { setCookie, getCookie } from "../utils/cookie";
import { combineUrl } from "../utils/combineUrl";
import FirebaseHelper from "../utils/firebase";
import SocketIOHelper from "../utils/socket";
import { TWhiteLabel } from "../utils/whiteLabelHelper";
import { ThemeKeys, TenantStatus, DeviceType, ArticleAlerts } from "../enums";
import {
  LANGUAGE,
  COOKIE_EXPIRATION_YEAR,
  MEDIA_VIEW_URL,
  WRONG_PORTAL_NAME_URL,
} from "../constants";
import { Dark, Base, TColorScheme } from "../themes";
import { toastr } from "../components/toast";
import { TData } from "../components/toast/Toast.type";
import { version } from "../package.json";
import { Nullable } from "../types";

// import { getFromLocalStorage } from "@docspace/client/src/pages/PortalSettings/utils";

const themes = {
  Dark,
  Base,
};

const isDesktopEditors = window.AscDesktopEditor !== undefined;
const systemTheme = getSystemTheme();

class SettingsStore {
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

  datePattern = "M/d/yyyy";

  datePatternJQ = "00/00/0000";

  dateTimePattern = "dddd, MMMM d, yyyy h:mm:ss tt";

  datepicker = {
    datePattern: "mm/dd/yy",
    dateTimePattern: "DD, mm dd, yy h:mm:ss tt",
    timePattern: "h:mm tt",
  };

  organizationName = "ONLYOFFICE";

  greetingSettings = "Web Office Applications";

  enableAdmMess = false;

  enabledJoin = false;

  urlLicense = "https://gnu.org/licenses/gpl-3.0.html";

  urlSupport = "https://helpdesk.onlyoffice.com/";

  forumLink = null;

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

  logoUrl: Nullable<TWhiteLabel> = null;

  isDesktopClient = isDesktopEditors;

  isDesktopClientInit = false;

  // isDesktopEncryption: desktopEncryption;
  isEncryptionSupport = false;

  encryptionKeys: { [key: string]: string | boolean } = {};

  personal = false;

  docSpace = true;

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

  withPaging = false;

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
  };

  debugInfo = false;

  socketUrl = "";

  folderFormValidation = new RegExp('[*+:"<>?|\\\\/]', "gim");

  tenantStatus: TenantStatus | null = null;

  helpLink = null;

  apiDocsLink = null;

  bookTrainingEmail = null;

  hotkeyPanelVisible = false;

  frameConfig: TFrameConfig | null = null;

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

  whiteLabelLogoUrls: TWhiteLabel[] = [];

  standalone = false;

  mainBarVisible = false;

  zendeskKey = null;

  legalTerms = null;

  baseDomain: string | null = null;

  portals: string[] = [];

  domain = null;

  documentationEmail = null;

  articleAlertsData = initArticleAlertsData();

  cspDomains: string[] = [];

  publicRoomKey = "";

  numberAttempt: number | null = null;

  blockingTime: number | null = null;

  checkPeriod: number | null = null;

  userNameRegex = "";

  windowWidth = window.innerWidth;

  constructor() {
    makeAutoObservable(this);
  }

  setTenantStatus = (tenantStatus: TenantStatus) => {
    this.tenantStatus = tenantStatus;
  };

  get docspaceSettingsUrl() {
    return `${this.helpLink}/administration/docspace-settings.aspx`;
  }

  get integrationSettingsUrl() {
    return `${this.helpLink}/administration/docspace-settings.aspx#AdjustingIntegrationSettings_block`;
  }

  get docuSignUrl() {
    return `${this.helpLink}/administration/connect-docusign-docspace.aspx`;
  }

  get dropboxUrl() {
    return `${this.helpLink}/administration/connect-dropbox-docspace.aspx`;
  }

  get boxUrl() {
    return `${this.helpLink}/administration/connect-box-docspace.aspx`;
  }

  get mailRuUrl() {
    return `${this.helpLink}/administration/connect-mail-ru-docspace.aspx`;
  }

  get oneDriveUrl() {
    return `${this.helpLink}/administration/connect-onedrive-docspace.aspx`;
  }

  get microsoftUrl() {
    return `${this.helpLink}/administration/connect-microsoft-docspace.aspx`;
  }

  get googleUrl() {
    return `${this.helpLink}/administration/connect-google-docspace.aspx`;
  }

  get facebookUrl() {
    return `${this.helpLink}/administration/connect-facebook-docspace.aspx`;
  }

  get linkedinUrl() {
    return `${this.helpLink}/administration/connect-linkedin-docspace.aspx`;
  }

  get clickatellUrl() {
    return `${this.helpLink}/administration/connect-clickatell-docspace.aspx`;
  }

  get smsclUrl() {
    return `${this.helpLink}/administration/connect-smsc-docspace.aspx`;
  }

  get firebaseUrl() {
    return `${this.helpLink}/administration/connect-firebase-docspace.aspx`;
  }

  get appleIDUrl() {
    return `${this.helpLink}/administration/connect-apple-docspace.aspx`;
  }

  get telegramUrl() {
    return `${this.helpLink}/administration/connect-telegram-docspace.aspx`;
  }

  get wordpressUrl() {
    return `${this.helpLink}/administration/connect-wordpress-docspace.aspx`;
  }

  get awsUrl() {
    return `${this.helpLink}/administration/connect-amazon-docspace.aspx`;
  }

  get googleCloudUrl() {
    return `${this.helpLink}/administration/connect-google-cloud-storage-docspace.aspx`;
  }

  get rackspaceUrl() {
    return `${this.helpLink}/administration/connect-rackspace-docspace.aspx`;
  }

  get selectelUrl() {
    return `${this.helpLink}/administration/connect-selectel-docspace.aspx`;
  }

  get yandexUrl() {
    return `${this.helpLink}/administration/connect-yandex-docspace.aspx`;
  }

  get vkUrl() {
    return `${this.helpLink}/administration/connect-vk-docspace.aspx`;
  }

  get languageAndTimeZoneSettingsUrl() {
    return `${this.helpLink}/administration/docspace-settings.aspx#DocSpacelanguage`;
  }

  get welcomePageSettingsUrl() {
    return `${this.helpLink}/administration/docspace-settings.aspx#DocSpacetitle`;
  }

  get dnsSettingsUrl() {
    return `${this.helpLink}/administration/docspace-settings.aspx#alternativeurl`;
  }

  get renamingSettingsUrl() {
    return `${this.helpLink}/administration/docspace-settings.aspx#DocSpacerenaming`;
  }

  get passwordStrengthSettingsUrl() {
    return `${this.helpLink}/administration/docspace-settings.aspx#passwordstrength`;
  }

  get tfaSettingsUrl() {
    return `${this.helpLink}/administration/docspace-two-factor-authentication.aspx`;
  }

  get trustedMailDomainSettingsUrl() {
    return `${this.helpLink}/administration/docspace-settings.aspx#TrustedDomain`;
  }

  get ipSettingsUrl() {
    return `${this.helpLink}/administration/docspace-settings.aspx#ipsecurity`;
  }

  get bruteForceProtectionUrl() {
    return `${this.helpLink}/administration/configuration.aspx#loginsettings`;
  }

  get administratorMessageSettingsUrl() {
    return `${this.helpLink}/administration/docspace-settings.aspx#administratormessage`;
  }

  get lifetimeSettingsUrl() {
    return `${this.helpLink}/administration/docspace-settings.aspx#sessionlifetime`;
  }

  get dataBackupUrl() {
    return `${this.helpLink}/administration/docspace-settings.aspx#CreatingBackup_block`;
  }

  get automaticBackupUrl() {
    return `${this.helpLink}/administration/docspace-settings.aspx#AutoBackup`;
  }

  get webhooksGuideUrl() {
    return `${this.helpLink}/administration/docspace-webhooks.aspx`;
  }

  get dataReassignmentUrl() {
    return `${this.helpLink}/userguides/docspace-managing-users.aspx`;
  }

  get sdkLink() {
    return `${this.apiDocsLink}/docspace/jssdk/`;
  }

  get apiBasicLink() {
    return `${this.apiDocsLink}/docspace/basic`;
  }

  get wizardCompleted() {
    return this.isLoaded && !this.wizardToken;
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

  setPortals = (portals: string[]) => {
    this.portals = portals;
  };

  setGreetingSettings = (greetingSettings: string) => {
    this.greetingSettings = greetingSettings;
  };

  getSettings = async () => {
    let newSettings: Nullable<TSettings> = null;

    if (window?.__ASC_INITIAL_EDITOR_STATE__?.portalSettings)
      newSettings = window.__ASC_INITIAL_EDITOR_STATE__.portalSettings;
    else newSettings = await api.settings.getSettings(true);

    if (window.AscDesktopEditor !== undefined || this.personal) {
      const dp = combineUrl(window.DocSpaceConfig?.proxy?.url, MEDIA_VIEW_URL);
      this.setDefaultPage(dp);
    }

    if (!newSettings) return;

    Object.keys(newSettings).forEach((forEachKey) => {
      const key = forEachKey as keyof TSettings;
      if (key in this && newSettings) {
        this.setValue(
          key as keyof SettingsStore,
          key === "defaultPage"
            ? combineUrl(window.DocSpaceConfig?.proxy?.url, newSettings[key])
            : newSettings[key],
        );
        if (key === "culture") {
          if (newSettings?.wizardToken) return;
          const language = getCookie(LANGUAGE);
          if (!language || language === "undefined") {
            setCookie(LANGUAGE, newSettings[key], {
              "max-age": COOKIE_EXPIRATION_YEAR,
            });
          }
        }
      } else if (key === "passwordHash" && newSettings) {
        this.setValue("hashSettings", newSettings[key]);
      }
    });

    this.setGreetingSettings(newSettings.greetingSettings);

    return newSettings;
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
        const url = new URL(WRONG_PORTAL_NAME_URL);
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
  };

  get isPortalDeactivate() {
    return this.tenantStatus === TenantStatus.PortalDeactivate;
  }

  init = async () => {
    this.setIsLoading(true);
    const requests = [];

    requests.push(
      this.getPortalSettings(),
      this.getAppearanceTheme(),
      this.getWhiteLabelLogoUrls(),
    );

    await Promise.all(requests);

    if (!this.isPortalDeactivate) {
      await this.getBuildVersionInfo();
    }

    this.setIsLoading(false);
    this.setIsLoaded(true);
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

  setLogoUrl = (url: TWhiteLabel[]) => {
    this.logoUrl = url[0];
  };

  setLogoUrls = (urls: TWhiteLabel[]) => {
    this.whiteLabelLogoUrls = urls;
  };

  getCompanyInfoSettings = async () => {
    const res = await api.settings.getCompanyInfoSettings();

    this.setCompanyInfoSettingsData(res);
    this.setCompanyInfoSettingsIsDefault(res.isDefault);
  };

  getWhiteLabelLogoUrls = async () => {
    const res = await api.settings.getLogoUrls();

    this.setLogoUrls(Object.values(res));
    this.setLogoUrl(Object.values(res));
  };

  getDomainName = async () => {
    const res = await api.management.getDomainName();
    const { settings } = res;
    this.setPortalDomain(settings);
    return settings;
  };

  getAllPortals = async () => {
    const res = await api.management.getAllPortals();
    this.setPortals(res.tenants);
    return res;
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

  setPublicRoomKey = (key: string) => {
    this.publicRoomKey = key;
  };

  get socketHelper() {
    const socketUrl =
      isPublicRoom() && !this.publicRoomKey ? "" : this.socketUrl;

    return new SocketIOHelper(socketUrl, this.publicRoomKey);
  }

  getBuildVersionInfo = async () => {
    let versionInfo = null;
    if (window?.__ASC_INITIAL_EDITOR_STATE__?.versionInfo)
      versionInfo = window.__ASC_INITIAL_EDITOR_STATE__.versionInfo;
    else versionInfo = await api.settings.getBuildVersion();
    this.setBuildVersionInfo(versionInfo);
  };

  setBuildVersionInfo = (versionInfo: TVersionBuild) => {
    this.buildVersionInfo = {
      ...this.buildVersionInfo,
      docspace: version,
      ...versionInfo,
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

  setIpRestrictions = async (ips: string[]) => {
    const data = {
      IpRestrictions: ips,
    };
    const res = await api.settings.setIpRestrictions(data);
    this.ipRestrictions = res?.map((el) => el.ip);
  };

  getIpRestrictionsEnable = async () => {
    const res = await api.settings.getIpRestrictionsEnable();
    this.ipRestrictionEnable = res.enable;
  };

  setIpRestrictionsEnable = async (enable: boolean) => {
    const data = {
      enable,
    };
    const res = await api.settings.setIpRestrictionsEnable(data);
    this.ipRestrictionEnable = res.enable;
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
    // console.log("get isFrame:", this.frameConfig?.name === window.name);
    return this.frameConfig?.name === window.name;
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
    let res: Nullable<TGetColorTheme> = null;
    if (window?.__ASC_INITIAL_EDITOR_STATE__?.appearanceTheme)
      res = window.__ASC_INITIAL_EDITOR_STATE__.appearanceTheme;
    else res = await api.settings.getAppearanceTheme();

    const currentColorScheme = res.themes.find((theme) => {
      return res && res.selected === theme.id;
    });

    this.setAppearanceTheme(res.themes);
    this.setSelectThemeId(res.selected);
    if (currentColorScheme) this.setCurrentColorScheme(currentColorScheme);
  };

  updateArticleAlertsData = ({
    current,
    available,
  }: {
    current: ArticleAlerts;
    available: ArticleAlerts[];
  }) => {
    this.articleAlertsData = {
      current: current || this.articleAlertsData.current,
      available: available || this.articleAlertsData.available,
    };
    localStorage.setItem(
      "articleAlertsData",
      JSON.stringify(this.articleAlertsData),
    );
  };

  incrementIndexOfArticleAlertsData = () => {
    const { current, available } = this.articleAlertsData;
    if (!available.length) return;

    let next = null;
    const indexOfCurrent = available.indexOf(current);
    if (indexOfCurrent + 1 === available.length) next = available[0];
    else next = available[indexOfCurrent + 1];

    if (next) this.updateArticleAlertsData({ current: next, available });
  };

  removeAlertFromArticleAlertsData = (alertToRemove: ArticleAlerts) => {
    const { current, available } = this.articleAlertsData;
    const filteredAvailable = available.filter(
      (alert) => alert !== alertToRemove,
    );
    this.updateArticleAlertsData({ current, available: filteredAvailable });
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
    }
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
    if (this.windowWidth <= deviceSize.mobile) return DeviceType.mobile;

    if (isTablet(this.windowWidth)) return DeviceType.tablet;

    return DeviceType.desktop;
  }

  get enablePortalRename() {
    return (
      !this.standalone || (this.standalone && this.baseDomain !== "localhost")
    );
  }
}

export { SettingsStore };
