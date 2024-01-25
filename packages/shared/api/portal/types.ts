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

export type TFeature = {
  id: string;
  value: number;
  type: string;
  used?: {
    value: number;
    title?: string;
  };
  priceTitle?: string;
};

export type TPortalQuota = {
  id: number;
  title: string;
  price: {
    value: number;
  };
  nonProfit: boolean;
  free: boolean;
  trial: boolean;
  features: TFeature[];
};

export type TPaymentFeature = {
  id: string;
  value: number | boolean;
  type: string;
  priceTitle?: string;
  image?: string;
};

export type TPaymentQuota = {
  id: number;
  title: string;
  price: {
    value: string;
    currencySymbol: string;
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
