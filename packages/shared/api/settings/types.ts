import { TenantStatus } from "../../enums";
import { TColorScheme } from "../../themes";

export type TTfaType = "sms" | "app" | "none";

export type TTfa = {
  id: string;
  title: string;
  enabled: boolean;
  avaliable: boolean;
};

export type TGetCSPSettings = {
  domains: string[];
  header: string;
};

export type TFirebaseSettings = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
  databaseURL: string;
};

export type TFormGallery = {
  path: string;
  domain: string;
  ext: string;
  uploadPath: string;
  uploadDomain: string;
  uploadExt: string;
  uploadDashboard: string;
  url?: string;
  uploadUrl?: string;
};

export type TDomainValidator = {
  regex: string;
  minLength: number;
  maxLength: number;
};

export type TPasswordHash = {
  size: boolean;
  iterations: boolean;
  salt: string;
};

export type TSettings = {
  timezone: string;
  trustedDomains: string[];
  trustedDomainsType: number;
  culture: string;
  utcOffset: string;
  utcHoursOffset: number;
  greetingSettings: string;
  ownerId: string;
  nameSchemaId: string;
  enableAdmMess: boolean;
  personal: boolean;
  docSpace: boolean;
  standalone: boolean;
  baseDomain: string;
  passwordHash: TPasswordHash;
  firebase: TFirebaseSettings;
  version: string;
  debugInfo: boolean;
  socketUrl: string;
  tenantStatus: TenantStatus;
  tenantAlias: string;
  helpLink: string;
  forumLink: string;
  apiDocsLink: string;
  domainValidator: TDomainValidator;
  zendeskKey: string;
  bookTrainingEmail: string;
  documentationEmail: string;
  legalTerms: string;
  cookieSettingsEnabled: boolean;
  userNameRegex: string;
  plugins: {
    enabled: boolean;
    upload: boolean;
    delete: boolean;
  };
  deepLink: {
    androidPackageName: string;
    url: string;
    iosPackageId: string;
  };
  formGallery: TFormGallery;
  wizardToken?: string;
  defaultPage?: string;
};

export type TCustomSchema = {
  id: string;
  name: string;
  userCaption: string;
  usersCaption: string;
  groupCaption: string;
  groupsCaption: string;
  userPostCaption: string;
  regDateCaption: string;
  groupHeadCaption: string;
  guestCaption: string;
  guestsCaption: string;
};

export type TGetColorTheme = {
  themes: TColorScheme[];
  selected: number;
  limit: 9;
};

export type TAdditionalResources = {
  startDocsEnabled: boolean;
  helpCenterEnabled: boolean;
  feedbackAndSupportEnabled: boolean;
  feedbackAndSupportUrl: string;
  userForumEnabled: boolean;
  userForumUrl: string;
  videoGuidesEnabled: boolean;
  videoGuidesUrl: string;
  salesEmail: string;
  buyUrl: string;
  licenseAgreementsEnabled: boolean;
  isDefault: boolean;
  licenseAgreementsUrl: string;
};

export type TCompanyInfo = {
  companyName: string;
  site: string;
  email: string;
  address: string;
  phone: string;
  isLicensor: boolean;
  isDefault: boolean;
};

export type TPasswordSettings = {
  minLength: number;
  allowedCharactersRegexStr: string;
  upperCase: boolean;
  digits: boolean;
  digitsRegexStr: string;
  upperCaseRegexStr: string;
  specSymbols: boolean;
  specSymbolsRegexStr: string;
};

export type TTimeZone = { id: string; displayName: string };

export type TVersionBuild = {
  docSpace: string;
  communityServer: string;
  documentServer: string;
};

export type TMailDomainSettings = {
  type: number;
  domains: string[];
  inviteUsersAsVisitors: boolean;
};

export type TIpRestriction = {
  ip: string;
};

export type TCookieSettings = {
  lifeTime: number;
  enabled: boolean;
};

export type TLoginSettings = {
  attemptCount: number;
  blockTime: number;
  checkPeriod: number;
};

export type TCapabilities = {
  ldapEnabled: boolean;
  providers: string[];
  ssoLabel: string;
  oauthEnabled: boolean;
  ssoUrl: string;
};

export type TThirdPartyProvider = {
  provider: string;
  url: string;
  linked: boolean;
};

export type TPaymentSettings = {
  salesEmail: string;
  feedbackAndSupportUrl: string;
  buyUrl: string;
  standalone: boolean;
  currentLicense: {
    trial: boolean;
    date: Date;
  };
  max: number;
};
