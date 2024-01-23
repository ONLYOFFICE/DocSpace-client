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
