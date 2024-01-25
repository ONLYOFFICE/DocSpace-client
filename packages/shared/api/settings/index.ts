import axios, { AxiosRequestConfig } from "axios";
import { TWhiteLabel } from "../../utils/whiteLabelHelper";
import { request } from "../client";
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
  TCookieSettings,
  TLoginSettings,
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

export async function getPortalCultures() {
  const res = (await request({
    method: "get",
    url: "/settings/cultures",
  })) as string[];

  return res;
}

export async function getPortalPasswordSettings(confirmKey = null) {
  const options: AxiosRequestConfig = {
    method: "get",
    url: "/settings/security/password",
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

export async function getIpRestrictions() {
  const res = (await request({
    method: "get",
    url: "/settings/iprestrictions",
  })) as TIpRestriction[];

  return res;
}

export async function setIpRestrictions(data) {
  const res = (await request({
    method: "put",
    url: "/settings/iprestrictions",
    data,
  })) as TIpRestriction[];

  return res;
}

export async function getIpRestrictionsEnable() {
  const res = (await request({
    method: "get",
    url: "/settings/iprestrictions/settings",
  })) as { enable: boolean };

  return res;
}

export async function setIpRestrictionsEnable(data) {
  const res = (await request({
    method: "put",
    url: "/settings/iprestrictions/settings",
    data,
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

export async function getCookieSettings() {
  const res = (await request({
    method: "get",
    url: "/settings/cookiesettings",
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

export async function getBruteForceProtection() {
  const res = (await request({
    method: "get",
    url: "/settings/security/loginSettings",
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

export async function getPortalTimezones(confirmKey = null) {
  const options: AxiosRequestConfig = {
    method: "get",
    url: "/settings/timezones",
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

export function getGreetingSettingsIsDefault() {
  return request({
    method: "get",
    url: `/settings/greetingsettings/isDefault`,
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

export function getLogoText() {
  return request({
    method: "get",
    url: `/settings/whitelabel/logotext`,
  });
}

export async function getLogoUrls(headers = null) {
  const options: AxiosRequestConfig = {
    method: "get",
    url: `/settings/whitelabel/logos`,
  };

  if (headers) options.headers = headers;

  const skipRedirect = true;

  const res = (await request(options, skipRedirect)) as TWhiteLabel[];

  return res;
}

export function setWhiteLabelSettings(data, isManagement) {
  const url = "/settings/whitelabel/save";

  const options = {
    method: "post",
    url: isManagement ? `${url}?isDefault=true` : url,
    data,
  };

  return request(options);
}

export function getIsDefaultWhiteLabel() {
  return request({
    method: "get",
    url: `/settings/whitelabel/logos/isdefault`,
  });
}

export function restoreWhiteLabelSettings(isDefault, isManagement) {
  const url = "/settings/whitelabel/restore";

  return request({
    method: "put",
    url: isManagement ? `${url}?isDefault=true` : url,
    data: { isDefault },
  });
}

export function setCompanyInfoSettings(
  address,
  companyName,
  email,
  phone,
  site,
) {
  const data = {
    settings: { address, companyName, email, phone, site },
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
  feedbackAndSupportEnabled,
  videoGuidesEnabled,
  helpCenterEnabled,
) {
  const data = {
    settings: {
      helpCenterEnabled,
      feedbackAndSupportEnabled,
      videoGuidesEnabled,
    },
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

export function sendRecoverRequest(email, message) {
  const data = { email, message };
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

export function ownerChange(ownerId, confirmKey = null) {
  const data = { ownerId };

  const options = {
    method: "put",
    url: `/settings/owner`,
    data,
  };

  if (confirmKey) options.headers = { confirm: confirmKey };

  return request(options);
}

export function getMachineName(confirmKey = null) {
  const options = {
    method: "get",
    url: "/settings/machine",
  };

  if (confirmKey) options.headers = { confirm: confirmKey };

  return request(options);
}

export function setPortalOwner(
  email,
  hash,
  lng,
  timeZone,
  confirmKey,
  analytics,
) {
  const options = {
    method: "put",
    url: "/settings/wizard/complete",
    data: {
      email,
      PasswordHash: hash,
      lng,
      timeZone,
      analytics,
    },
  };

  if (confirmKey) {
    options.headers = { confirm: confirmKey };
  }
  return request(options);
}

export function getIsLicenseRequired() {
  return request({
    method: "get",
    url: "/settings/license/required",
  });
}

export function setLicense(confirmKey, data) {
  const options = {
    method: "post",
    url: `/settings/license`,
    data,
  };

  if (confirmKey) {
    options.headers = { confirm: confirmKey };
  }

  return request(options);
}

export function getPaymentSettings() {
  return request({
    method: "get",
    url: `/settings/payment`,
  });
}
export function acceptLicense() {
  return request({
    method: "post",
    url: `/settings/license/accept`,
  });
}
export function getConsumersList() {
  return request({
    method: "get",
    url: `/settings/authservice`,
  });
}

export function getAuthProviders() {
  return request({
    method: "get",
    url: `/people/thirdparty/providers`,
  });
}

export function updateConsumerProps(newProps) {
  const options = {
    method: "post",
    url: `/settings/authservice`,
    data: newProps,
  };

  return request(options);
}

export async function getTfaSettings() {
  const res = (await request({
    method: "get",
    url: `/settings/tfaapp`,
  })) as TTfa[];

  return res;
}

export async function setTfaSettings(type: TTfaType) {
  const res = (await request({
    method: "put",
    url: "/settings/tfaappwithlink",
    data: { type },
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

export function validateTfaCode(code, confirmKey = null) {
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

export function getBackupStorage() {
  const options = {
    method: "get",
    url: "/settings/storage/backup",
  };
  return request(options);
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

export function getCapabilities() {
  const options = {
    method: "get",
    url: "/capabilities",
  };
  return request(options);
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

export function getCurrentSsoSettings() {
  const options = {
    method: "get",
    url: "/settings/ssov2",
  };

  return request(options);
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

export function getLifetimeAuditSettings(data) {
  return request({
    method: "get",
    url: "/security/audit/settings/lifetime",
    data,
  });
}

export function getLoginHistory() {
  return request({
    method: "get",
    url: "/security/audit/login/last",
  });
}

export function getAuditTrail() {
  return request({
    method: "get",
    url: "/security/audit/events/last",
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

export function getStorageRegions() {
  const options = {
    method: "get",
    url: "/settings/storage/s3/regions",
  };
  return request(options);
}

export function getPortalQuota() {
  return request({
    method: "get",
    url: `/settings/quota`,
  });
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

export function createWebhook(name, uri, secretKey, ssl) {
  return request({
    method: "post",
    url: `/settings/webhook`,
    data: { name, uri, secretKey, ssl },
  });
}

export function getAllWebhooks() {
  return request({
    method: "get",
    url: `/settings/webhook`,
  });
}

export function updateWebhook(id, name, uri, secretKey, ssl) {
  return request({
    method: "put",
    url: `/settings/webhook`,
    data: { id, name, uri, secretKey, ssl },
  });
}

export function toggleEnabledWebhook(webhook) {
  return request({
    method: "put",
    url: `/settings/webhook`,
    data: {
      id: webhook.id,
      name: webhook.name,
      uri: webhook.uri,
      secretKey: webhook.secretKey,
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

export function getSMTPSettings() {
  return request({
    method: "get",
    url: `/smtpsettings/smtp`,
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

export async function setCSPSettings(data: string[]) {
  const res = (await request({
    method: "post",
    url: `/security/csp`,
    data,
  })) as TGetCSPSettings;

  return res;
}

export async function getCSPSettings() {
  const res = (await request({
    method: "get",
    url: `/security/csp`,
  })) as TGetCSPSettings;

  return res;
}
