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

// @ts-nocheck

import axios, { AxiosRequestConfig } from "axios";

import { Nullable } from "../../types";
import { ILogo } from "../../pages/Branding/WhiteLabel/WhiteLabel.types";
import { request } from "../client";
import { RecaptchaType } from "../../enums";
import {
  TCustomSchema,
  TGetCSPSettings,
  TSettings,
  TTfa,
  TTfaType,
  TGetColorTheme,
  TAdditionalResources,
  TCompanyInfo,
  TPasswordSettings,
  TVersionBuild,
  TMailDomainSettings,
  TIpRestriction,
  TIpRestrictionSettings,
  TCookieSettings,
  TLoginSettings,
  TCapabilities,
  TThirdPartyProvider,
  TPaymentSettings,
  TGetSsoSettings,
  TWorkspaceService,
  TWorkspaceStatusResponse,
  TMigrationData,
  TSendWelcomeEmailData,
  TPortalCultures,
  TStorageBackup,
  TEncryptionSettings,
  TTelegramCheck,
  TNotificationChannel,
} from "./types";

export async function getSettings(withPassword = false, headers = null) {
  const options: AxiosRequestConfig = {
    method: "get",
    url: `/settings?withPassword=${withPassword}`,
  };

  if (headers) options.headers = headers;

  const skipRedirect = true;

  const res = (await request(options, skipRedirect)) as TSettings;

  return res;
}

export async function getPortalCultures(signal?: AbortSignal) {
  const res = (await request({
    method: "get",
    url: "/settings/cultures",
    signal,
  })) as TPortalCultures;

  return res;
}

export async function getPortalPasswordSettings(
  confirmKey: Nullable<string> = null,
  signal?: AbortSignal,
) {
  const options: AxiosRequestConfig = {
    method: "get",
    url: "/settings/security/password",
    signal,
  };

  if (confirmKey) options.headers = { confirm: confirmKey };

  const res = (await request(options)) as TPasswordSettings;

  return res;
}

export async function setPortalPasswordSettings(
  minLength: number,
  upperCase: boolean,
  digits: boolean,
  specSymbols: boolean,
) {
  const res = (await request({
    method: "put",
    url: "/settings/security/password",
    data: { minLength, upperCase, digits, specSymbols },
  })) as TPasswordSettings;

  return res;
}

export async function setMailDomainSettings(data: TMailDomainSettings) {
  const res = (await request({
    method: "post",
    url: "/settings/maildomainsettings",
    data,
  })) as TMailDomainSettings;

  return res;
}

// export function setDNSSettings(dnsName, enable) {
//   return request({
//     method: "post",
//     url: "/settings/maildomainsettings",
//     data: { dnsName, enable },
//   });
// }

export function setDNSSettings(dnsName, enable) {
  return request({
    method: "put",
    url: "/settings/dns",
    data: { dnsName, enable },
  });
}

export async function getIpRestrictions(signal?: AbortSignal) {
  const res = (await request({
    method: "get",
    url: "/settings/iprestrictions",
    signal,
  })) as TIpRestriction[];

  return res;
}

export async function setIpRestrictions(data: {
  IpRestrictions: string[];
  enable: boolean;
}) {
  const res = (await request({
    method: "put",
    url: "/settings/iprestrictions",
    data,
  })) as TIpRestrictionSettings;

  return res;
}

export async function getIpRestrictionsEnable(signal?: AbortSignal) {
  const res = (await request({
    method: "get",
    url: "/settings/iprestrictions/settings",
    signal,
  })) as { enable: boolean };

  return res;
}

export function setMessageSettings(turnOn) {
  return request({
    method: "post",
    url: "/settings/messagesettings",
    data: { turnOn },
  });
}

export function setCookieSettings(lifeTime, enabled) {
  return request({
    method: "put",
    url: "/settings/cookiesettings",
    data: { lifeTime, enabled },
  });
}

export async function getCookieSettings(signal?: AbortSignal) {
  const res = (await request({
    method: "get",
    url: "/settings/cookiesettings",
    signal,
  })) as TCookieSettings;

  return res;
}

export async function setLifetimeAuditSettings(data: TCookieSettings) {
  const res = (await request({
    method: "post",
    url: "/security/audit/settings/lifetime",
    data,
  })) as TCookieSettings;

  return res;
}

export async function getBruteForceProtection(signal?: AbortSignal) {
  const res = (await request({
    method: "get",
    url: "/settings/security/loginSettings",
    signal,
  })) as TLoginSettings;

  return res;
}

export function setBruteForceProtection(AttemptCount, BlockTime, CheckPeriod) {
  return request({
    method: "put",
    url: "/settings/security/loginSettings",
    data: { AttemptCount, BlockTime, CheckPeriod },
  });
}

export function deleteBruteForceProtection() {
  return request({
    method: "delete",
    url: `settings/security/loginSettings`,
  });
}
export function getLoginHistoryReport() {
  return request({
    method: "post",
    url: "/security/audit/login/report",
  });
}

export function getAuditTrailReport() {
  return request({
    method: "post",
    url: "/security/audit/events/report",
  });
}

export async function getPortalTimezones(
  confirmKey = null,
  signal?: AbortSignal,
) {
  const options: AxiosRequestConfig = {
    method: "get",
    url: "/settings/timezones",
    signal,
  };

  if (confirmKey) options.headers = { confirm: confirmKey };

  const res = (await request(options)) as TTimeZone[];

  return res;
}

export function setLanguageAndTime(lng, timeZoneID) {
  return request({
    method: "put",
    url: "/settings/timeandlanguage",
    data: { lng, timeZoneID },
  });
}

export function setGreetingSettings(title) {
  return request({
    method: "post",
    url: `/settings/greetingsettings`,
    data: { title },
  });
}

export function getGreetingSettingsIsDefault(signal?: AbortSignal) {
  return request({
    method: "get",
    url: `/settings/greetingsettings/isDefault`,
    signal,
  });
}

export function restoreGreetingSettings() {
  return request({
    method: "post",
    url: `/settings/greetingsettings/restore`,
  });
}

export async function getAppearanceTheme(headers = null) {
  const options: AxiosRequestConfig = {
    method: "get",
    url: "/settings/colortheme",
  };

  if (headers) options.headers = headers;

  const skipRedirect = true;

  const res = (await request(options, skipRedirect)) as TGetColorTheme;

  return res;
}

export function sendAppearanceTheme(data) {
  return request({
    method: "put",
    url: "/settings/colortheme",
    data,
  });
}

export function deleteAppearanceTheme(id) {
  return request({
    method: "delete",
    url: `/settings/colortheme?id=${id}`,
  });
}

export async function getLogoUrls(
  headers = null,
  isManagement: boolean = false,
  signal?: AbortSignal,
) {
  const url = "/settings/whitelabel/logos";

  const options: AxiosRequestConfig = {
    method: "get",
    url: isManagement ? `${url}?isDefault=true` : url,
    signal,
  };

  if (headers) options.headers = headers;

  const skipRedirect = true;

  const res = (await request(options, skipRedirect)) as ILogo[];

  return res;
}

export function getIsDefaultWhiteLabelLogos(
  isManagement: boolean = false,
  signal?: AbortSignal,
) {
  const url = "/settings/whitelabel/logos/isdefault";

  return request({
    method: "get",
    url: isManagement ? `${url}?isDefault=true` : url,
    signal,
  });
}

export function restoreWhiteLabelLogos(isManagement: boolean = false) {
  const url = "/settings/whitelabel/logos/restore";

  return request({
    method: "put",
    url: isManagement ? `${url}?isDefault=true` : url,
  });
}

export function setWhiteLabelLogos(data, isManagement: boolean = false) {
  const url = "/settings/whitelabel/logos/save";

  const options = {
    method: "post",
    url: isManagement ? `${url}?isDefault=true` : url,
    data,
  };

  return request(options);
}

export function setBrandName(data, isManagement: boolean = false) {
  const url = "/settings/whitelabel/logotext/save";

  const options = {
    method: "post",
    url: isManagement ? `${url}?isDefault=true` : url,
    data,
  };

  return request(options);
}

export function getBrandName(
  isManagement: boolean = false,
  signal?: AbortSignal,
) {
  const url = "/settings/whitelabel/logotext";

  return request({
    method: "get",
    url: isManagement ? `${url}?isDefault=true` : url,
    signal,
  });
}

export function setCompanyInfoSettings(
  address,
  companyName,
  email,
  phone,
  site,
  hideAbout,
) {
  const data = {
    settings: { address, companyName, email, phone, site, hideAbout },
  };

  return request({
    method: "post",
    url: `/settings/rebranding/company`,
    data,
  });
}

export async function getCompanyInfoSettings() {
  const res = (await request({
    method: "get",
    url: `/settings/rebranding/company`,
  })) as TCompanyInfo;

  return res;
}

export function restoreCompanyInfoSettings() {
  return request({
    method: "delete",
    url: `/settings/rebranding/company`,
  });
}

export async function getCustomSchemaList() {
  const res = (await request({
    method: "get",
    url: `settings/customschemas`,
  })) as TCustomSchema[];

  return res;
}

export function setAdditionalResources(
  additionalResources: TAdditionalResources,
) {
  const data = {
    settings: additionalResources,
  };

  return request({
    method: "post",
    url: `/settings/rebranding/additional`,
    data,
  });
}

export async function getAdditionalResources() {
  const res = (await request({
    method: "get",
    url: `/settings/rebranding/additional`,
  })) as TAdditionalResources;

  return res;
}

export function restoreAdditionalResources() {
  return request({
    method: "delete",
    url: `/settings/rebranding/additional`,
  });
}

export function setCurrentSchema(id) {
  return request({
    method: "post",
    url: "settings/customschemas",
    data: { id },
  });
}
export function setCustomSchema(
  userCaption,
  usersCaption,
  groupCaption,
  groupsCaption,
  userPostCaption,
  regDateCaption,
  groupHeadCaption,
  guestCaption,
  guestsCaption,
) {
  const data = {
    userCaption,
    usersCaption,
    groupCaption,
    groupsCaption,
    userPostCaption,
    regDateCaption,
    groupHeadCaption,
    guestCaption,
    guestsCaption,
  };
  return request({
    method: "put",
    url: `settings/customschemas`,
    data,
  });
}

export function getCurrentCustomSchema(id) {
  return request({
    method: "get",
    url: `settings/customschemas/${id}`,
  });
}

export function sendRecoverRequest(
  email: string,
  message: string,
  recaptchaResponse: string | null | undefined = "",
  recaptchaType?: RecaptchaType,
) {
  const data: Record<string, unknown> = { email, message, recaptchaResponse };

  if (typeof recaptchaType !== "undefined") {
    data.recaptchaType = recaptchaType;
  }

  return request({
    method: "post",
    url: `/settings/sendadmmail`,
    data,
  });
}

export function sendRegisterRequest(email) {
  const data = { email };
  return request({
    method: "post",
    url: `/settings/sendjoininvite`,
    data,
  });
}

export function sendOwnerChange(ownerId) {
  const data = { ownerId };
  return request({
    method: "post",
    url: `/settings/owner`,
    data,
  });
}

export function dataReassignment(fromUserId, toUserId, deleteProfile) {
  const data = { fromUserId, toUserId, deleteProfile };
  return request({
    method: "post",
    url: `/people/reassign/start`,
    data,
  });
}

export function dataReassignmentProgress(id) {
  return request({
    method: "get",
    url: `/people/reassign/progress/${id}`,
  });
}

export function dataReassignmentTerminate(userId) {
  const data = { userId };
  return request({
    method: "put",
    url: `/people/reassign/terminate`,
    data,
  });
}

export function ownerChange(
  ownerId: string,
  confirmKey: Nullable<string> = null,
) {
  const data = { ownerId };

  const options = {
    method: "put",
    url: `/settings/owner`,
    data,
  };

  if (confirmKey) options.headers = { confirm: confirmKey };

  return request(options);
}

export async function getMachineName(confirmKey: string = "") {
  const options: AxiosRequestConfig = {
    method: "get",
    url: "/settings/machine",
  };

  if (confirmKey) options.headers = { confirm: confirmKey };

  const res = (await request(options)) as string;

  return res;
}

export function setPortalOwner(
  email,
  hash,
  lng,
  timeZone,
  confirmKey,
  analytics,
  amiId: string | null = null,
) {
  const data = {
    email,
    PasswordHash: hash,
    lng,
    timeZone,
    analytics,
  };

  if (amiId) {
    data.amiId = amiId;
  }

  const options = {
    method: "put",
    url: "/settings/wizard/complete",
    data,
  };

  if (confirmKey) {
    options.headers = { confirm: confirmKey };
  }
  return request(options);
}

export async function getIsLicenseRequired() {
  const res = (await request({
    method: "get",
    url: "/settings/license/required",
  })) as boolean;

  return res;
}

export async function setLicense(confirmKey: string | null, data: FormData) {
  const options: AxiosRequestConfig = {
    method: "post",
    url: `/settings/license`,
    data,
  };

  if (confirmKey) {
    options.headers = { confirm: confirmKey };
  }

  const res = (await request(options)) as string;

  return res;
}

export async function getPaymentSettings(signal?: AbortSignal) {
  const res = (await request({
    method: "get",
    url: `/settings/payment`,
    signal,
  })) as TPaymentSettings;

  return res;
}
export function acceptLicense() {
  return request({
    method: "post",
    url: `/settings/license/accept`,
  });
}
export function getConsumersList(signal?: AbortSignal) {
  return request({
    method: "get",
    url: `/settings/authservice`,
    signal,
  });
}

export async function getAuthProviders() {
  const res = (await request({
    method: "get",
    url: `/people/thirdparty/providers`,
  })) as TThirdPartyProvider[];

  return res;
}

export function updateConsumerProps(newProps) {
  const options = {
    method: "post",
    url: `/settings/authservice`,
    data: newProps,
  };

  return request(options);
}

export async function getTfaSettings(signal?: AbortSignal) {
  const res = (await request({
    method: "get",
    url: `/settings/tfaapp`,
    signal,
  })) as TTfa[];

  return res;
}

export async function setTfaSettings(type: TTfaType, signal?: AbortSignal) {
  const res = (await request({
    method: "put",
    url: "/settings/tfaappwithlink",
    data: { type },
    signal,
  })) as TTfa;

  return res;
}

export function getTfaBackupCodes() {
  return request({
    method: "get",
    url: "/settings/tfaappcodes",
  });
}

export function getTfaNewBackupCodes() {
  return request({
    method: "put",
    url: "/settings/tfaappnewcodes",
  });
}

export function getTfaConfirmLink() {
  return request({
    method: "get",
    url: "/settings/tfaapp/confirm",
  });
}

export function unlinkTfaApp(id) {
  const data = {
    id,
  };
  return request({
    method: "put",
    url: "/settings/tfaappnewapp",
    data,
  });
}

export function getTfaSecretKeyAndQR(confirmKey = null) {
  const options = {
    method: "get",
    url: "/settings/tfaapp/setup",
  };

  if (confirmKey) options.headers = { confirm: confirmKey };

  return request(options);
}

export function validateTfaCode(code, confirmKey: Nullable<string> = null) {
  const data = {
    code,
  };

  const options = {
    method: "post",
    url: "/settings/tfaapp/validate",
    skipLogout: true,
    data,
  };

  if (confirmKey) options.headers = { confirm: confirmKey };

  return request(options);
}

export function getBackupStorage(dump: boolean = false, signal?: AbortSignal) {
  const options = {
    method: "get",
    url: "/settings/storage/backup",
    params: {
      dump,
    },
    signal,
  };
  return request<TStorageBackup[]>(options);
}

export async function getBuildVersion(headers = null) {
  const options: AxiosRequestConfig = {
    method: "get",
    url: "/settings/version/build",
  };
  if (headers) options.headers = headers;

  const res = (await request(options)) as TVersionBuild;

  return res;
}

export async function getCapabilities() {
  const options: AxiosRequestConfig = {
    method: "get",
    url: "/capabilities",
  };

  const res = (await request(options)) as TCapabilities;

  return res;
}

export function getTipsSubscription() {
  const options = {
    method: "get",
    url: "/settings/tips/subscription",
  };
  return request(options);
}

export function getNotificationSubscription(notificationType) {
  const options = {
    method: "get",
    url: `/settings/notification/${notificationType}`,
  };
  return request(options);
}

export function changeNotificationSubscription(notificationType, isEnabled) {
  const data = {
    Type: notificationType,
    isEnabled,
  };
  const options = {
    method: "post",
    url: "/settings/notification",
    data,
  };

  return request(options);
}

export function toggleTipsSubscription() {
  const options = {
    method: "put",
    url: "/settings/tips/change/subscription",
  };
  return request(options);
}

export async function getCurrentSsoSettings(signal?: AbortSignal) {
  const options: AxiosRequestConfig = {
    method: "get",
    url: "/settings/ssov2",
    signal,
  };

  const res = (await request(options)) as TGetSsoSettings;

  return res;
}

export function submitSsoForm(data) {
  const options = {
    method: "post",
    url: "/settings/ssov2",
    data,
  };

  return request(options);
}

export function resetSsoForm() {
  const options = {
    method: "delete",
    url: "/settings/ssov2",
  };

  return request(options);
}

export function getLifetimeAuditSettings(data, signal) {
  return request({
    method: "get",
    url: "/security/audit/settings/lifetime",
    data,
    signal,
  });
}

export function getLoginHistory(signal?: AbortSignal) {
  return request({
    method: "get",
    url: "/security/audit/login/last",
    signal,
  });
}

export function getAuditTrail(signal?: AbortSignal) {
  return request({
    method: "get",
    url: "/security/audit/events/last",
    signal,
  });
}

export function loadXmlMetadata(data) {
  return axios.post("/sso/loadmetadata", data);
}

export function uploadXmlMetadata(data) {
  return axios.post("/sso/uploadmetadata", data);
}

export function validateCerts(data) {
  return axios.post("/sso/validatecerts", data);
}

export function generateCerts() {
  return axios.get("/sso/generatecert");
}

export function getMetadata() {
  return axios.get("/sso/metadata");
}

export function getStorageRegions(signal?: AbortSignal) {
  const options = {
    method: "get",
    url: "/settings/storage/s3/regions",
    signal,
  };
  return request(options);
}

export function getAllActiveSessions() {
  return request({
    method: "get",
    url: "/security/activeconnections",
  });
}

export function removeAllActiveSessions() {
  return request({
    method: "put",
    url: "/security/activeconnections/logoutallchangepassword",
  });
}

export function removeAllExceptThisSession() {
  return request({
    method: "put",
    url: "/security/activeconnections/logoutallexceptthis",
  });
}

export function removeActiveSession(eventId) {
  return request({
    method: "put",
    url: `/security/activeconnections/logout/${eventId}`,
    data: { eventId },
  });
}

export function setDefaultUserQuota(enableQuota, defaultQuota) {
  const data = {
    enableQuota,
    defaultQuota,
  };
  const options = {
    method: "post",
    url: "/settings/userquotasettings",
    data,
  };

  return request(options);
}
export function setDefaultRoomQuota(enableQuota, defaultQuota) {
  const data = {
    enableQuota,
    defaultQuota,
  };
  const options = {
    method: "post",
    url: "/settings/roomquotasettings",
    data,
  };

  return request(options);
}

export function getQuotaSettings(signal?: AbortSignal) {
  return request({
    method: "get",
    url: "/settings/userquotasettings",
    signal,
  });
}

export function createWebhook(name, uri, secretKey, ssl, triggers, targetId) {
  return request({
    method: "post",
    url: `/settings/webhook`,
    data: { name, uri, secretKey, enabled: true, ssl, triggers, targetId },
  });
}

export function getAllWebhooks(signal?: AbortSignal) {
  return request({
    method: "get",
    url: `/settings/webhook`,
    signal,
  });
}

export function updateWebhook(
  id,
  name,
  uri,
  secretKey,
  ssl,
  triggers,
  targetId,
) {
  return request({
    method: "put",
    url: `/settings/webhook`,
    data: { id, name, uri, secretKey, enabled: true, ssl, triggers, targetId },
  });
}

export function toggleEnabledWebhook(webhook) {
  return request({
    method: "put",
    url: `/settings/webhook/enable`,
    data: {
      id: webhook.id,
      name: webhook.name,
      uri: webhook.uri,
      enabled: !webhook.enabled,
    },
  });
}

export function removeWebhook(id) {
  return request({
    method: "delete",
    url: `/settings/webhook/${id}`,
  });
}

export function getWebhooksJournal(props) {
  const {
    configId,
    eventId,
    count,
    startIndex,
    deliveryFrom,
    deliveryTo,
    groupStatus,
  } = props;

  const params = {};

  if (configId) params.configId = configId;
  if (eventId) params.eventId = eventId;
  if (count) params.count = count;
  if (startIndex) params.startIndex = startIndex;
  if (deliveryFrom) params.deliveryFrom = deliveryFrom;
  if (deliveryTo) params.deliveryTo = deliveryTo;
  if (groupStatus) params.groupStatus = groupStatus;

  return request({
    method: "get",
    url: "/settings/webhooks/log?",
    params,
  });
}

export function retryWebhook(webhookId) {
  return request({
    method: "put",
    url: `/settings/webhook/${webhookId}/retry`,
  });
}

export function retryWebhooks(webhooksIds) {
  return request({
    method: "put",
    url: `/settings/webhook/retry`,
    data: { Ids: webhooksIds },
  });
}

export function muteRoomNotification(id, isMute) {
  const options = {
    method: "post",
    url: `/settings/notification/rooms`,
    data: { RoomsId: id, Mute: isMute },
  };

  return request(options);
}

export function setSMTPSettings(data) {
  const options = {
    method: "post",
    url: `/smtpsettings/smtp`,
    data,
  };

  return request(options);
}

export function getSMTPSettings(signal?: AbortSignal) {
  return request({
    method: "get",
    url: `/smtpsettings/smtp`,
    signal,
  });
}

export function resetSMTPSettings() {
  return request({
    method: "delete",
    url: `/smtpsettings/smtp`,
  });
}

export function sendingTestMail() {
  return request({
    method: "get",
    url: `/smtpsettings/smtp/test`,
  });
}

export function getSendingTestMailStatus() {
  return request({
    method: "get",
    url: `/smtpsettings/smtp/test/status`,
  });
}

export async function migrationList(signal?: AbortSignal) {
  const res = (await request({
    method: "get",
    url: `/migration/list`,
    signal,
  })) as TWorkspaceService[];
  return res;
}

export function initMigration(name: TWorkspaceService) {
  return request({
    method: "post",
    url: `/migration/init/${name}`,
  });
}

export async function migrationStatus(signal?: AbortSignal) {
  const res = (await request({
    method: "get",
    url: `/migration/status`,
    signal,
  })) as TWorkspaceStatusResponse;
  return res;
}

export function migrateFile(data: TMigrationData) {
  return request({
    method: "post",
    url: `/migration/migrate`,
    data,
  });
}

export function migrationCancel() {
  return request({
    method: "post",
    url: `/migration/cancel`,
  });
}

export function getLdapSettings(signal?: AbortSignal) {
  const options = {
    method: "get",
    url: "/settings/ldap",
    signal,
  };

  return request(options);
}

export function saveLdapSettings(settings) {
  return request({
    method: "post",
    url: `/settings/ldap`,
    data: settings,
  });
}

export function migrationClear() {
  return request({
    method: "post",
    url: `/migration/clear`,
  });
}

export async function migrationLog() {
  const response = await axios.get("/api/2.0/migration/logs");
  if (!response || !response.data) return null;
  return response.data as string;
}

export function migrationFinish(data: TSendWelcomeEmailData) {
  return request({
    method: "post",
    url: `/migration/finish`,
    data,
  });
}

export async function setCSPSettings(data: string[]) {
  const res = (await request({
    method: "post",
    url: `/security/csp`,
    data,
  })) as TGetCSPSettings;

  return res;
}

export async function getCSPSettings(signal?: AbortSignal) {
  const res = (await request({
    method: "get",
    url: `/security/csp`,
    signal,
  })) as TGetCSPSettings;

  return res;
}

export function recalculateQuota() {
  return request({
    method: "get",
    url: `/settings/recalculatequota`,
  });
}

export function checkRecalculateQuota(signal?: AbortSignal) {
  return request({
    method: "get",
    url: `/settings/checkrecalculatequota`,
    signal,
  });
}

export function setTenantQuotaSettings(data) {
  const options = {
    method: "put",
    url: `/settings/tenantquotasettings`,
    data,
  };

  return request(options) as TPaymentQuota;
}

export function getLdapStatus() {
  const options = {
    method: "get",
    url: "/settings/ldap/status",
  };

  return request(options);
}

export function getLdapDefaultSettings(signal?: AbortSignal) {
  const options = {
    method: "get",
    url: "/settings/ldap/default",
    signal,
  };

  return request(options);
}

export function syncLdap() {
  const options = {
    method: "get",
    url: "/settings/ldap/sync",
  };

  return request(options);
}

export function saveCronLdap(cron) {
  const options = {
    method: "post",
    url: "/settings/ldap/cron",
    data: { Cron: cron },
  };

  return request(options);
}

export function getCronLdap(signal?: AbortSignal) {
  const options = {
    method: "get",
    url: "/settings/ldap/cron",
    signal,
  };

  return request(options);
}

export function setLimitedAccessForUsers(enable: boolean) {
  const data = { limitedAccessForUsers: enable };
  const options = {
    method: "post",
    url: "/settings/devtoolsaccess",
    data,
  };

  return request(options);
}

export function getDeepLinkSettings(signal?: AbortSignal) {
  const options = {
    method: "get",
    url: "/settings/deeplink",
    signal,
  };

  return request(options);
}

export function saveDeepLinkSettings(handlingMode: number) {
  const options = {
    method: "post",
    url: "/settings/deeplink",
    data: { deepLinkSettings: { handlingMode } },
  };

  return request(options);
}

export function startEncryption(notifyUsers) {
  const options = {
    method: "post",
    url: "/settings/encryption/start",
    data: { notifyUsers },
  };

  return request(options);
}

export function getEncryptionProgress() {
  const options = {
    method: "get",
    url: "/settings/encryption/progress",
  };

  return request(options);
}

export function getEncryptionSettings() {
  const options = {
    method: "get",
    url: "/settings/encryption/settings",
  };

  return request(options) as TEncryptionSettings;
}

export async function getInvitationSettings(signal?: AbortSignal) {
  const res = (await request({
    method: "get",
    url: "/settings/invitationsettings",
    signal,
  })) as TInvitationSettings;

  return res;
}

export async function setInvitationSettings(data: {
  allowInvitingGuests: boolean;
  allowInvitingMembers: boolean;
}) {
  const res = (await request({
    method: "put",
    url: "/settings/invitationsettings",
    data,
  })) as TInvitationSettings;

  return res;
}

export async function setAdManagement(hidden: boolean) {
  const data = { hidden };
  const res = await request({
    method: "post",
    url: "/settings/banner",
    data,
  });

  return res;
}

export async function checkTelegram() {
  const res = await request({
    method: "get",
    url: "/settings/telegram/check",
  });

  return res as TTelegramCheck;
}

export async function getTelegramLink() {
  const res = await request({
    method: "get",
    url: "/settings/telegram/link",
  });

  return res as string;
}

export async function deleteTelegramLink() {
  const res = await request({
    method: "delete",
    url: "/settings/telegram/link",
  });

  return res as boolean;
}

export async function getNotificationsSettings() {
  const res = await request({
    method: "get",
    url: "/settings/notification/channels",
  });

  return res.channels as TNotificationChannel[];
}
