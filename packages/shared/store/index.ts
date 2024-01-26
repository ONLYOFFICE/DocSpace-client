import { UserStore } from "./UserStore";
import { TfaStore } from "./TfaStore";
import { BannerStore } from "./BannerStore";
import { CurrentTariffStatusStore } from "./CurrentTariffStatusStore";
import { CurrentQuotasStore } from "./CurrentQuotaStore";
import { PaymentQuotasStore } from "./PaymentQuotasStore";
import { AuthStore } from "./AuthStore";
import { SettingsStore } from "./SettingsStore";

export const userStore = new UserStore();
export const tfaStore = new TfaStore();
export const bannerStore = new BannerStore();
export const currentQuotaStore = new CurrentQuotasStore();
export const paymentQuotasStore = new PaymentQuotasStore();
export const currentTariffStatusStore = new CurrentTariffStatusStore();
export const settingsStore = new SettingsStore();
export const authStore = new AuthStore(
  userStore,
  currentTariffStatusStore,
  currentQuotaStore,
  settingsStore,
);
