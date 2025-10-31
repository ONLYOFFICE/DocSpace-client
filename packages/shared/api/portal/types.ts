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

import { TError } from "../../utils/axiosClient";
import type { TariffState, BackupStorageType, QuotaState } from "../../enums";

export type TQuotas = {
  id: number;
  quantity: number;
  wallet?: boolean;
  dueDate?: string;
  nextQuantity?: number;
  state?: QuotaState;
};

export type TPortalTariff = {
  id: number;
  state: TariffState;
  dueDate: Date;
  delayDueDate: Date;
  licenseDate: Date;
  customerId: string;
  portalStatus?: number;
  quotas: TQuotas[];
  enterprise: boolean;
  developer: boolean;
  openSource: boolean;
};

export type TBasePaymentFeature = {
  id: string;
  type: string;
  priceTitle?: string;
  image?: string;
  used?: {
    value: number;
    title?: string;
  };
};

export type TStringPaymentFeature = TBasePaymentFeature & {
  title: string;
  value?: number;
};

export type TNumericPaymentFeature = TBasePaymentFeature & {
  value: number;
};

export type TBooleanPaymentFeature = TBasePaymentFeature & {
  value: boolean;
};

export type TPaymentFeature =
  | TNumericPaymentFeature
  | TBooleanPaymentFeature
  | TStringPaymentFeature;

export type TPaymentQuota = {
  id: number;
  title: string;
  price: {
    value: number;
    currencySymbol?: string;
    isoCurrencySymbol?: string;
  };
  nonProfit: boolean;
  free: boolean;
  trial: boolean;
  features: TPaymentFeature[];
  usersQuota: {
    defaultQuota: number;
    enableQuota: boolean;
  };
  roomsQuota: {
    defaultQuota: number;
    enableQuota: boolean;
  };
  tenantCustomQuota: {
    quota: number;
    enableQuota: boolean;
  };
  aiAgentQuota: {
    defaultQuota: number;
    enableQuota: boolean;
  };
};

export type TPortal = {
  tenantAlias: string;
  calls: boolean;
  creationDateTime: Date;
  tenantId: number;
  industry: number;
  language: string;
  lastModified: Date;
  name: string;
  ownerId: string;
  region?: string | null;
  paymentId: string;
  spam: boolean;
  status: number;
  statusChangeDate: Date;
  timeZone: string;
  trustedDomains: string[];
  trustedDomainsType: number;
  version: number;
  versionChanged: Date;
};

export type TTariff = {
  id: number;
  state: number;
  dueDate: Date;
  delayDueDate: Date;
  licenseDate: Date;
  customerId: string;
  quotas: TQuotas[];
};

export type TRestoreProgress = {
  progress: number;
  error?: TError;
};

export type TBackupHistory = {
  id: string;
  fileName: string;
  storageType: BackupStorageType;
  createdOn: string;
  expiresOn: string;
};

export type TBackupSchedule = {
  backupsStored: number;
  cronParams: {
    day: number;
    hour: number;
    period: number;
  };
  dump: boolean;
  lastBackupTime: string;
  storageParams: {
    folderId: string;
    module?: string;
    tenantId?: string;
  };
  storageType: BackupStorageType;
};

export type TStorageRegion = {
  displayName: string;
  originalSystemName: string;
  partitionDnsSuffix: string;
  partitionName: string;
  systemName: string;
};

export type TBackupProgress = {
  progress: number;
  error?: TError;
  warning?: string;
  link?: string;
  isCompleted: boolean;
};

export type TDocServerLicense = {
  branding: boolean;
  customization: boolean;
  timeLimited: boolean;
  end_date: string;
  trial: boolean;
  customer_id: string;
  resource_key: string;
  users_count: number;
  users_expire: number;
  connections: number;
  docspace_dev: boolean;
};

export type TLicenseQuota = {
  userQuota: Record<string, string>;
  license: TDocServerLicense;
  totalUsers: number;
  portalUsers: number;
  externalUsers: number;
  licenseTypeByUsers: boolean;
};

export type TCustomerInfo = {
  paymentMethodStatus: number;
  email: string | null;
  portalId: string | null;
  payer: {
    avatar: string;
    avatarMax: string;
    avatarMedium: string;
    avatarOriginal: string;
    avatarSmall: string;
    displayName: string;
    hasAvatar: boolean;
    id: string;
    isAnonim: boolean;
    profileUrl: string;
  } | null;
};

export type TBalance =
  | {
      accountNumber?: number;
      subAccounts: [{ currency: string; amount: number }];
    }
  | 0;

export type TTransactionCollection = {
  date: string;
  service?: string;
  serviceUnit?: string;
  quantity: number;
  amount: number;
  credit: number;
  debit: number;
  currency: string;
  description: string;
  details: string;
  participantName?: string;
  participantDisplayName?: string;
};

export type TTransactionHistory = {
  collection: TTransactionCollection[];
  offset: number;
  limit: number;
  totalQuantity: number;
  totalPage: number;
  currentPage: number;
};

export type TAutoTopUpSettings = {
  enabled: boolean;
  minBalance: number;
  upToBalance: number;
  currency: string | null;
};

export type TransactionHistoryReport = {
  id: string;
  error: string;
  percentage: number;
  isCompleted: boolean;
  status: number;
  resultFileId: number;
  resultFileName: string;
  resultFileUrl: string;
};
