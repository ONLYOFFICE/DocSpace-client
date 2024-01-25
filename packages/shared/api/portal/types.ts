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
