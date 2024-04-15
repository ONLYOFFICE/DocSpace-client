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

import { TariffState } from "../../enums";

export type TQuotas = { id: number; quantity: number };

export type TPortalTariff = {
  id: number;
  state: TariffState;
  dueDate: Date;
  delayDueDate: Date;
  licenseDate: Date;
  customerId: string;
  portalStatus?: number;
  quotas: TQuotas[];
};

export type TPaymentFeature = {
  id: string;
  value: number;
  type: string;
  priceTitle?: string;
  image?: string;
  used?: {
    value: number;
    title?: string;
  };
};

export type TPaymentQuota = {
  id: number;
  title: string;
  price: {
    value: string;
    currencySymbol?: string;
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

export type TTenantExtraRes = {
  customMode: boolean;
  opensource: boolean;
  enterprise: boolean;
  notPaid: boolean;
  licenseAccept: Date;
  enableTariffPage: boolean;
};

export type TTenantExtra = {
  customMode: boolean;
  opensource: boolean;
  enterprise: boolean;
  tariff: TTariff;
  quota: TPaymentQuota;
  notPaid: boolean;
  licenseAccept: Date;
  enableTariffPage: boolean;
};
