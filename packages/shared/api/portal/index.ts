/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// @ts-nocheck

import { EmployeeType } from "../../enums";
import { request } from "../client";
import {
  TBackupSchedule,
  TAutoTopUpSettings,
  TBalance,
  TCustomerInfo,
  TPaymentQuota,
  TPortal,
  TPortalTariff,
  TRestoreProgress,
  TLicenseQuota,
} from "./types";
import { Nullable } from "../../types";
import { Encoder } from "@docspace/ui-kit/utils/encoder";

const baseURL = "/apisystem";

export async function getShortenedLink(link: string) {
  const shortLink = (await request({
    method: "put",
    url: "/portal/getshortenlink",
    data: { link },
  })) as string;

  return shortLink;
}

export async function getInvitationLink(type: EmployeeType) {
  const res = (await request({
    method: "get",
    url: `/portal/users/invite/${type}`,
  })) as string;

  return res;
}

export function getInvitationLinks() {
  return Promise.all([
    getInvitationLink(EmployeeType.RoomAdmin),
    getInvitationLink(EmployeeType.Guest),
    getInvitationLink(EmployeeType.Admin),
    getInvitationLink(EmployeeType.User),
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

export function getBackupProgress(dump: boolean = false, signal) {
  const options = {
    method: "get",
    url: "/portal/getbackupprogress",
    params: {
      dump,
    },
    signal,
  };
  return request(options);
}

export function deleteBackupSchedule(dump: boolean = false) {
  const options = {
    method: "delete",
    url: "/portal/deletebackupschedule",
    params: {
      dump,
    },
  };
  return request(options);
}

export function getBackupSchedule(dump: boolean = false, signal?: AbortSignal) {
  const options = {
    method: "get",
    url: "/portal/getbackupschedule",
    params: {
      dump,
    },
    signal,
  };
  return request<TBackupSchedule>(options);
}

export function createBackupSchedule(
  storageType,
  storageParams,
  backupsStored,
  Period,
  Hour,
  Day: string | null = null,
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

export function deleteBackupHistory(dump: boolean = false) {
  return request({
    method: "delete",
    url: "/portal/deletebackuphistory",
    params: {
      dump,
    },
  });
}

export function deleteBackup(id: string) {
  return request({ method: "delete", url: `/portal/deletebackup/${id}` });
}

export function getBackupHistory(
  dump: boolean = false,
): Promise<TBackupHistory[]> {
  return request({
    method: "get",
    url: "/portal/getbackuphistory",
    params: {
      dump,
    },
  });
}

export function startRestore(
  backupId: string,
  storageType: string,
  storageParams,
  notify: boolean,
  dump = false,
) {
  return request({
    method: "post",
    url: `/portal/startrestore`,
    data: {
      backupId,
      storageType,
      storageParams,
      notify,
      dump,
    },
  });
}

export async function getRestoreProgress() {
  const res = (await request({
    method: "get",
    url: "/portal/getrestoreprogress",
  })) as TRestoreProgress;

  return res;
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

export function suspendPortal(confirmKey: Nullable<string> = null) {
  const options = {
    method: "put",
    url: "/portal/suspend",
  };

  if (confirmKey) options.headers = { confirm: confirmKey };

  return request(options);
}

export function continuePortal(confirmKey: Nullable<string> = null) {
  const options = {
    method: "put",
    url: "/portal/continue",
  };

  if (confirmKey) options.headers = { confirm: confirmKey };

  return request(options);
}

export function deletePortal(confirmKey: Nullable<string> = null) {
  const options = {
    method: "delete",
    url: "/portal/delete",
  };

  if (confirmKey) options.headers = { confirm: confirmKey };

  return request(options);
}

export async function getPortalPaymentQuotas(signal?: AbortSignal) {
  const res = (await request({
    method: "get",
    url: "/portal/payment/quotas",
    signal,
  })) as TPaymentQuota[];

  return res;
}

export async function getServicesQuotas(signal?: AbortSignal) {
  const res = (await request({
    method: "get",
    url: "/portal/payment/walletservices",
    signal,
  })) as TPaymentQuota[];

  return res;
}

export async function getServiceQuota(
  serviceName?: string,
  signal?: AbortSignal,
) {
  const res = (await request({
    method: "get",
    url: `/portal/payment/walletservice?service=${serviceName}`,
    signal,
  })) as TPaymentQuota;

  return res;
}

export async function setServiceState(data: {
  service: string;
  enabled: boolean;
}) {
  const res = (await request({
    method: "post",
    url: "/portal/payment/servicestate",
    data,
  })) as TPaymentQuota;

  return res;
}
export async function getPortalQuota(refresh = false, signal?: AbortSignal) {
  const params = refresh ? { refresh: true } : {};
  // console.log("getPortalQuota", { params });
  const res = (await request({
    method: "get",
    url: "/portal/payment/quota",
    params,
    signal,
  })) as TPaymentQuota;

  return res;
}

export async function getPortalTariff(refresh = false, signal?: AbortSignal) {
  const params = refresh ? { refresh: true } : {};

  const res = (await request({
    method: "get",
    url: "/portal/tariff",
    params,
    signal,
  })) as TPortalTariff;

  return res;
}

export async function getPaymentAccount(signal?: AbortSignal) {
  const res = (await request({
    method: "get",
    url: "/portal/payment/account",
    signal,
  })) as string;

  return res;
}

export function updatePayment(adminCount, isYearTariff) {
  const data = isYearTariff ? { adminyear: adminCount } : { admin: adminCount };

  return request({
    method: "put",
    url: `/portal/payment/update`,
    data: {
      quantity: data,
    },
  });
}

export function updateWalletPayment(
  amount: number | null,
  productQuantityType: number,
) {
  return request({
    method: "put",
    url: `/portal/payment/updatewallet`,
    data: {
      quantity: {
        storage: amount,
      },
      productQuantityType,
    },
  });
}

export function calcalateWalletPayment(
  amount: number,
  productQuantityType: number,
  signal?: AbortSignal,
) {
  return request({
    method: "put",
    url: `/portal/payment/calculatewallet`,
    data: {
      quantity: {
        storage: amount,
      },
      productQuantityType,
    },
    signal,
  }) as {
    operationId: number;
    amount: number;
    currency: string;
    quantity: number;
  };
}

export function getCurrencies() {
  return request({ method: "get", url: "/portal/payment/currencies" });
}

export function getPaymentTariff() {
  return request({ method: "get", url: "/portal/payment/tariff" });
}

export async function getServiceQuotaBalance(
  refresh?: boolean,
  signal?: AbortSignal,
) {
  const params = refresh ? { refresh: true } : {};

  return request({
    method: "get",
    url: `/portal/payment/customer/aibalance`,
    params,
    signal,
  }) as TBalance;
}

export async function getAiPrices(signal?: AbortSignal) {
  return request({
    method: "get",
    url: `/portal/payment/ai-prices`,
    signal,
  });
}

export async function getWalletPayer(refresh?: boolean, signal?: AbortSignal) {
  const params = refresh ? { refresh: true } : {};

  const user = (await request({
    method: "get",
    url: `/portal/payment/customerinfo`,
    params,
    signal,
  })) as TCustomerInfo;

  if (user && user.payer?.displayName) {
    user.payer.displayName = Encoder.htmlDecode(user.payer.displayName);
  }

  return user;
}

export async function saveDeposite(amount: number, currency: string) {
  return request({
    method: "post",
    url: "/portal/payment/deposit",
    data: {
      amount,
      currency,
    },
  }) as string;
}



export async function startTransactionHistoryReport(
  startDate: string,
  endDate: string,
  credit: boolean,
  debit: boolean,
  participantName?: string,
  serviceName?: string,
) {
  const data = {
    startDate,
    endDate,
    credit,
    debit,
  };

  if (participantName) {
    data.participantName = participantName;
  }

  if (serviceName) {
    data.serviceName = serviceName;
  }

  const options = {
    method: "post",
    url: "/portal/payment/customer/operationsreport",
    data,
  };
  const res = (await request(options)) as TransactionHistoryReport;

  return res;
}

export async function checkTransactionHistoryReport() {
  const options = {
    method: "get",
    url: "/portal/payment/customer/operationsreport",
  };
  const res = (await request(options)) as TransactionHistoryReport;

  return res;
}

export async function getPortal(signal?: AbortSignal) {
  const options = {
    method: "get",
    url: "/portal",
    signal,
  };
  const res = (await request(options)) as TPortal;

  return res;
}

export function getPortalUsersCount(signal?: AbortSignal) {
  const options = {
    method: "get",
    url: "/portal/userscount",
    signal,
  };
  return request(options);
}

export async function getLicenseQuota() {
  const options = {
    baseURL,
    method: "get",
    url: "/portal/licensequota",
    params: {
      useCache: false,
    },
  };
  const res = (await request(options)) as TLicenseQuota;
  return res;
}

export async function getInviteLink(employeeType) {
  const options = {
    method: "get",
    url: `/portal/users/invitationlink/${employeeType}`,
  };
  const res = await request(options);
  return res;
}

export async function createInviteLink(data) {
  const options = {
    method: "post",
    url: `/portal/users/invitationlink`,
    data,
  };
  const res = await request(options);
  return res;
}

export async function deleteInviteLink(id) {
  const data = { id };
  const options = {
    method: "delete",
    url: "/portal/users/invitationlink",
    data,
  };
  const res = await request(options);
  return res;
}

export async function updateInviteLink(data) {
  const options = {
    method: "PUT",
    url: "/portal/users/invitationlink",
    data,
  };
  const res = await request(options);
  return res;
}

export type TAiModelAvailabilitySettingsResponse =
  | []
  | {
      models: string[];
    };

export const getAiModelRestrictions = async (signal?: AbortSignal) => {
  return request({
    method: "get",
    url: "/portal/payment/ai-model/restrictions",
    signal,
  }) as Promise<TAiModelAvailabilitySettingsResponse>;
};

export const setAiModelRestrictions = async (
  models: string[],
  signal?: AbortSignal,
) => {
  return request({
    method: "put",
    url: "/portal/payment/ai-model/restrictions",
    data: { models },
    signal,
  });
};

