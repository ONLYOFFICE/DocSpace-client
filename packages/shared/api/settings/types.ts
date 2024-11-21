// (c) Copyright Ascensio System SIA 2009-2024
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

import { RecaptchaType, TenantStatus } from "../../enums";
import { TColorScheme } from "../../themes";

export type TTfaType = "sms" | "app" | "none";

export type TTfa = {
  id: string;
  title: string;
  enabled: boolean;
  avaliable: boolean;
};

export type TGetSsoSettings = {
  hideAuthPage: boolean;
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
  licenseUrl: string;
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
  tagManagerId?: string;
  enabledJoin?: boolean;
  recaptchaPublicKey?: string;
  recaptchaType?: RecaptchaType;
  maxImageUploadSize: number;
  isAmi: boolean;
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

export type TIpRestrictionSettings = {
  ipRestrictions: {
    ip: string;
    forAdmin: boolean;
  }[];
  enable: boolean;
};

export type TCookieSettings = {
  lifeTime: number;
  enabled: boolean;
};

export type TLoginSettings = {
  attemptCount: number;
  blockTime: number;
  checkPeriod: number;
  isDefault: boolean;
};

export type TCapabilities = {
  ldapEnabled: boolean;
  ldapDomain: string;
  providers: string[];
  ssoLabel: string;
  oauthEnabled: boolean;
  ssoUrl: string;
  identityServerEnabled: boolean;
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

export type TWorkspaceService = "Workspace" | "GoogleWorkspace" | "Nextcloud";
export type MigrationOperation = "parse" | "migration";

export type TMigrationGroup = {
  groupName: string;
  userUidList: string[];
  shouldImport: boolean;
};

export type TImportOptions = {
  importGroups: boolean;
  importPersonalFiles: boolean;
  importSharedFiles: boolean;
  importSharedFolders: boolean;
  importCommonFiles: boolean;
  importProjectFiles: boolean;
};

export type TMigrationUser = {
  key: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  userType: string;
  migratingFiles: {
    foldersCount: number;
    filesCount: number;
    bytesTotal: number;
  };
  shouldImport: boolean;
};

export type TEnhancedMigrationUser = TMigrationUser & { isDuplicate: boolean };

export type TMigrationStatusResult = {
  migratorName: TWorkspaceService;
  operation: MigrationOperation;
  failedArchives: string[];
  users: TMigrationUser[];
  withoutEmailUsers: TMigrationUser[];
  existUsers: TMigrationUser[];
  groups: TMigrationGroup[];
  successedUsers: number;
  failedUsers: number;
  files: string[];
  errors: string[];
} & TImportOptions;

export type TWorkspaceStatusResponse =
  | {
      error: string;
      isCompleted: boolean;
      progress: number;
      parseResult: TMigrationStatusResult;
    }
  | undefined;

export type TMigrationData = {
  users: TMigrationUser[];
  migratorName: TWorkspaceService;
} & TImportOptions;

export type TSendWelcomeEmailData = { isSendWelcomeEmail: boolean };

export type TPortalCultures = string[];
