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

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
} from "./types";
import { Nullable } from "../../types";

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

export function getBalance(refresh?: boolean, signal?: AbortSignal) {
  const params = refresh ? { refresh: true } : {};

  return request({
    method: "get",
    url: `/portal/payment/customer/balance`,
    params,
    signal,
  }) as TBalance;
}

export function getWalletPayer(refresh?: boolean, signal?: AbortSignal) {
  const params = refresh ? { refresh: true } : {};

  return request({
    method: "get",
    url: `/portal/payment/customerinfo`,
    params,
    signal,
  }) as TCustomerInfo;
}

export async function getCardLinked(backUrl, signal?: AbortSignal) {
  const params = backUrl ? { backUrl } : {};

  const res = (await request({
    method: "get",
    url: "/portal/payment/chechoutsetupurl",
    params,
    signal,
  })) as string;

  return res;
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

export async function getTransactionHistory(
  startDate: string,
  endDate: string,
  credit: boolean = true,
  debit: boolean = true,
  participantName: string = "",
  offset: number = 0,
  limit: number = 25,
  signal?: AbortSignal,
) {
  const params = {
    startDate,
    endDate,
    credit,
    debit,
    offset,
    limit,
  };

  if (participantName) {
    params.participantName = participantName;
  }

  const options = {
    method: "get",
    url: "/portal/payment/customer/operations",
    params,
    signal,
  };
  const res = (await request(options)) as TCustomerOperation;

  return res;
}

export async function getAutoTopUpSettings(signal?: AbortSignal) {
  const options = {
    method: "get",
    url: "/portal/payment/topupsettings",
    signal,
  };
  const res = (await request(options)) as TAutoTopUpSettings;

  return res;
}

export async function updateAutoTopUpSettings(
  enabled: boolean,
  minBalance: number,
  upToBalance: number,
  currency: string,
) {
  const body = enabled
    ? {
        settings: {
          enabled,
          minBalance,
          upToBalance,
          currency,
        },
      }
    : {};

  const options = {
    method: "post",
    url: "/portal/payment/topupsettings",
    data: { ...body },
  };
  return request(options);
}

export async function startTransactionHistoryReport(
  startDate: string,
  endDate: string,
  credit: boolean,
  withdrawal: boolean,
) {
  const options = {
    method: "post",
    url: "/portal/payment/customer/operationsreport",
    data: {
      startDate,
      endDate,
      credit,
      withdrawal,
    },
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
