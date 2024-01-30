import { AxiosRequestConfig } from "axios";
import { EmployeeType } from "../../enums";
import { request } from "../client";
import { TPaymentQuota, TPortal, TPortalTariff, TTenantExtra } from "./types";

export function getShortenedLink(link) {
  return request({
    method: "put",
    url: "/portal/getshortenlink",
    data: { link },
  });
}

export function getInvitationLink(type) {
  return request({
    method: "get",
    url: `/portal/users/invite/${type}`,
  }).then((link) => {
    return Promise.resolve(link);
  });
}

export function getInvitationLinks() {
  return Promise.all([
    getInvitationLink(EmployeeType.User),
    getInvitationLink(EmployeeType.Guest),
    getInvitationLink(EmployeeType.Admin),
    getInvitationLink(EmployeeType.Collaborator),
  ]).then(
    ([
      userInvitationLinkResp,
      guestInvitationLinkResp,
      adminInvitationLinkResp,
      collaboratorInvitationLinkResp,
    ]) => {
      return Promise.resolve({
        userLink: userInvitationLinkResp,
        guestLink: guestInvitationLinkResp,
        adminLink: adminInvitationLinkResp,
        collaboratorLink: collaboratorInvitationLinkResp,
      });
    },
  );
}

export function startBackup(
  storageType,
  storageParams,
  backupMail = false,
  dump = false,
) {
  const options = {
    method: "post",
    url: `/portal/startbackup`,
    data: {
      storageType,
      storageParams,
      backupMail,
      dump,
    },
  };

  return request(options);
}

export function getBackupProgress() {
  const options = {
    method: "get",
    url: "/portal/getbackupprogress",
  };
  return request(options);
}

export function deleteBackupSchedule() {
  const options = {
    method: "delete",
    url: "/portal/deletebackupschedule",
  };
  return request(options);
}

export function getBackupSchedule() {
  const options = {
    method: "get",
    url: "/portal/getbackupschedule",
  };
  return request(options);
}

export function createBackupSchedule(
  storageType,
  storageParams,
  backupsStored,
  Period,
  Hour,
  Day = null,
  backupMail = false,
  dump = false,
) {
  const cronParams = {
    Period,
    Hour,
    Day,
  };

  const options = {
    method: "post",
    url: "/portal/createbackupschedule",
    data: {
      storageType,
      storageParams,
      backupsStored,
      cronParams,
      backupMail,
      dump,
    },
  };
  return request(options);
}

export function deleteBackupHistory() {
  return request({ method: "delete", url: "/portal/deletebackuphistory" });
}

export function deleteBackup(id) {
  return request({ method: "delete", url: `/portal/deletebackup/${id}` });
}

export function getBackupHistory() {
  return request({ method: "get", url: "/portal/getbackuphistory" });
}

export function startRestore(backupId, storageType, storageParams, notify) {
  return request({
    method: "post",
    url: `/portal/startrestore`,
    data: {
      backupId,
      storageType,
      storageParams,
      notify,
    },
  });
}

export function getRestoreProgress() {
  return request({ method: "get", url: "/portal/getrestoreprogress" });
}

export function enableRestore() {
  return request({ method: "get", url: "/portal/enablerestore" });
}

export function enableAutoBackup() {
  return request({ method: "get", url: "/portal/enableAutoBackup" });
}

export function setPortalRename(alias) {
  return request({
    method: "put",
    url: "/portal/portalrename",
    data: { alias },
  });
}

export function sendSuspendPortalEmail() {
  return request({
    method: "post",
    url: "/portal/suspend",
  });
}

export function sendDeletePortalEmail() {
  return request({
    method: "post",
    url: "/portal/delete",
  });
}

export function suspendPortal(confirmKey = null) {
  const options = {
    method: "put",
    url: "/portal/suspend",
  };

  if (confirmKey) options.headers = { confirm: confirmKey };

  return request(options);
}

export function continuePortal(confirmKey = null) {
  const options = {
    method: "put",
    url: "/portal/continue",
  };

  if (confirmKey) options.headers = { confirm: confirmKey };

  return request(options);
}

export function deletePortal(confirmKey = null) {
  const options = {
    method: "delete",
    url: "/portal/delete",
  };

  if (confirmKey) options.headers = { confirm: confirmKey };

  return request(options);
}

export async function getPortalPaymentQuotas() {
  const res = (await request({
    method: "get",
    url: "/portal/payment/quotas",
  })) as TPaymentQuota[];

  return res;
}

export async function getPortalTenantExtra(refresh: boolean) {
  const params = refresh ? { refresh: true } : {};
  const res = (await request({
    method: "get",
    url: "/portal/tenantextra",
    params,
  })) as TTenantExtra;

  return res;
}
export async function getPortalQuota(refresh = false) {
  const params = refresh ? { refresh: true } : {};
  // console.log("getPortalQuota", { params });
  const res = (await request({
    method: "get",
    url: "/portal/payment/quota",
    params,
  })) as TPaymentQuota;

  return res;
}

export async function getPortalTariff(refresh = false) {
  const params = refresh ? { refresh: true } : {};

  const res = (await request({
    method: "get",
    url: "/portal/tariff",
    params,
  })) as TPortalTariff;

  return res;
}

export async function getPaymentAccount() {
  const res = (await request({
    method: "get",
    url: "/portal/payment/account",
  })) as string;

  return res;
}

export async function getPaymentLink(
  adminCount: number,
  backUrl: string,
  signal?: AbortSignal,
) {
  const res = (await request({
    method: "put",
    url: `/portal/payment/url`,
    data: {
      quantity: { admin: adminCount },
      backUrl,
    },
    signal,
  })) as string;

  return res;
}

export function updatePayment(adminCount) {
  return request({
    method: "put",
    url: `/portal/payment/update`,
    data: {
      quantity: { admin: adminCount },
    },
  });
}

export function getCurrencies() {
  return request({ method: "get", url: "/portal/payment/currencies" });
}

export function getPaymentTariff() {
  return request({ method: "get", url: "/portal/payment/tariff" });
}

export function sendPaymentRequest(email, userName, message) {
  return request({
    method: "post",
    url: `/portal/payment/request `,
    data: {
      email,
      userName,
      message,
    },
  });
}

export async function getPortal() {
  const options: AxiosRequestConfig = {
    method: "get",
    url: "/portal",
  };
  const res = (await request(options)) as TPortal;

  return res;
}
