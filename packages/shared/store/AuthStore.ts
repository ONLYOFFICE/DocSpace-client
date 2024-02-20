/* eslint-disable no-console */
import { makeAutoObservable, runInAction } from "mobx";

import api from "../api";
import { setWithCredentialsStatus } from "../api/client";
import { loginWithTfaCode } from "../api/user";
import { getPortalTenantExtra } from "../api/portal";
import { TUser } from "../api/people/types";
import { TCapabilities, TThirdPartyProvider } from "../api/settings/types";
import { logout as logoutDesktop } from "../utils/desktop";
import { frameCallEvent, isAdmin, isPublicRoom } from "../utils/common";
import { getCookie, setCookie } from "../utils/cookie";
import { TTenantExtraRes } from "../api/portal/types";
import { TenantStatus } from "../enums";
import { COOKIE_EXPIRATION_YEAR, LANGUAGE } from "../constants";
import { Nullable, TI18n } from "../types";
import { UserStore } from "./UserStore";

import { CurrentTariffStatusStore } from "./CurrentTariffStatusStore";
import { CurrentQuotasStore } from "./CurrentQuotaStore";

import { SettingsStore } from "./SettingsStore";

class AuthStore {
  private userStore: UserStore | null = null;

  private currentQuotaStore: CurrentQuotasStore | null = null;

  private currentTariffStatusStore: CurrentTariffStatusStore | null = null;

  settingsStore: SettingsStore | null = null;

  isLoading = false;

  version: string = "";

  providers: TThirdPartyProvider[] = [];

  capabilities: Nullable<TCapabilities> = null;

  isInit = false;

  isLogout = false;

  isUpdatingTariff = false;

  tenantExtra: Nullable<TTenantExtraRes> = null;

  skipRequest = false;

  skipModules = false;

  constructor(
    userStoreConst: UserStore,
    currentTariffStatusStoreConst: CurrentTariffStatusStore,
    currentQuotaStoreConst: CurrentQuotasStore,
    settingsStore: SettingsStore,
  ) {
    this.userStore = userStoreConst;
    this.currentTariffStatusStore = currentTariffStatusStoreConst;
    this.currentQuotaStore = currentQuotaStoreConst;
    this.settingsStore = settingsStore;

    makeAutoObservable(this);

    const { socketHelper } = this.settingsStore;

    socketHelper.on("s:change-quota-used-value", ({ featureId, value }) => {
      console.log(`[WS] change-quota-used-value ${featureId}:${value}`);

      runInAction(() => {
        this.currentQuotaStore?.updateQuotaUsedValue(featureId, value);
      });
    });

    socketHelper.on("s:change-quota-feature-value", ({ featureId, value }) => {
      console.log(`[WS] change-quota-feature-value ${featureId}:${value}`);

      runInAction(() => {
        if (featureId === "free") {
          this.updateTariff();
          return;
        }

        this.currentQuotaStore?.updateQuotaFeatureValue(featureId, value);
      });
    });
    socketHelper.on("s:change-user-quota-used-value", (options) => {
      console.log(`[WS] change-user-quota-used-value`, options);

      runInAction(() => {
        if (options.customQuotaFeature === "user_custom_quota") {
          this.userStore?.updateUserQuota(
            options.usedSpace,
            options.quotaLimit,
          );

          return;
        }

        const { customQuotaFeature, ...updatableObject } = options;

        this.currentQuotaStore?.updateTenantCustomQuota(updatableObject);
      });
    });
  }

  setIsUpdatingTariff = (isUpdatingTariff: boolean) => {
    this.isUpdatingTariff = isUpdatingTariff;
  };

  updateTariff = async () => {
    this.setIsUpdatingTariff(true);

    await this.getTenantExtra();
    await this.currentTariffStatusStore?.setPayerInfo();

    this.setIsUpdatingTariff(false);
  };

  init = async (skipRequest?: boolean, i18n?: TI18n) => {
    if (this.isInit) return;
    this.isInit = true;

    this.skipRequest = skipRequest ?? false;

    await this.settingsStore?.init();

    const requests = [];

    const isPortalDeactivated = this.settingsStore?.isPortalDeactivate;

    const isPortalRestore =
      this.settingsStore?.tenantStatus === TenantStatus.PortalRestore;

    if (
      this.settingsStore?.isLoaded &&
      this.settingsStore?.socketUrl &&
      !isPublicRoom() &&
      !isPortalDeactivated
    ) {
      requests.push(
        this.userStore?.init(i18n).then(() => {
          if (!isPortalRestore) {
            this.getTenantExtra();
          }
        }),
      );
    } else {
      this.userStore?.setIsLoaded(true);
    }

    if (this.isAuthenticated && !skipRequest) {
      if (!isPortalRestore && !isPortalDeactivated)
        requests.push(this.settingsStore?.getAdditionalResources());

      if (!this.settingsStore?.passwordSettings) {
        if (!isPortalRestore && !isPortalDeactivated) {
          requests.push(this.settingsStore?.getCompanyInfoSettings());
        }
      }
    }

    return Promise.all(requests).then(() => {
      const user = this.userStore?.user;

      if (
        user &&
        this.settingsStore?.standalone &&
        !this.settingsStore?.wizardToken &&
        this.isAuthenticated &&
        user.isAdmin
      ) {
        requests.push(this.settingsStore.getPortals());
      }
    });
  };

  get isEnterprise() {
    this.currentTariffStatusStore?.setIsEnterprise(
      this.tenantExtra?.enterprise || false,
    );
    return this.tenantExtra?.enterprise;
  }

  get isCommunity() {
    return this.tenantExtra?.opensource;
  }

  getTenantExtra = async () => {
    let refresh = false;
    if (window.location.search === "?complete=true") {
      window.history.replaceState({}, document.title, window.location.pathname);
      refresh = true;
    }

    const result = await getPortalTenantExtra(refresh);

    if (!result) return;

    const { tariff, quota, ...tenantExtra } = result;

    runInAction(() => {
      this.tenantExtra = { ...tenantExtra };
    });

    this.currentQuotaStore?.setPortalQuotaValue(quota);
    this.currentTariffStatusStore?.setPortalTariffValue(tariff);
  };

  setLanguage() {
    if (this.userStore?.user?.cultureName) {
      if (getCookie(LANGUAGE) !== this.userStore.user.cultureName)
        setCookie(LANGUAGE, this.userStore.user.cultureName, {
          "max-age": COOKIE_EXPIRATION_YEAR,
        });
    } else {
      setCookie(LANGUAGE, this.settingsStore?.culture || "en-US", {
        "max-age": COOKIE_EXPIRATION_YEAR,
      });
    }
  }

  get isLoaded() {
    let success = false;
    if (this.isAuthenticated) {
      success =
        (this.userStore?.isLoaded && this.settingsStore?.isLoaded) ?? false;

      if (success) this.setLanguage();
    } else {
      success = this.settingsStore?.isLoaded ?? false;
    }

    return success;
  }

  get language() {
    const lang =
      (this.userStore?.user && this.userStore.user.cultureName) ||
      this.settingsStore?.culture ||
      "en";

    this.currentTariffStatusStore?.setLanguage(lang);

    return lang;
  }

  get languageBaseName() {
    try {
      const intl = new Intl.Locale(this.language);
      return intl.minimize().baseName;
    } catch {
      return "en";
    }
  }

  get isAdmin() {
    const user = this.userStore?.user;

    if (!user || !user.id) return false;

    return isAdmin(user);
  }

  get isRoomAdmin() {
    const user = this.userStore?.user;

    if (!user) return false;

    return (
      !user.isAdmin && !user.isOwner && !user.isVisitor && !user.isCollaborator
    );
  }

  // get isQuotaAvailable() {
  //   const user = this.userStore?.user;

  //   if (!user) return false;

  //   return user.isOwner || user.isAdmin || this.isRoomAdmin;
  // }

  get isPaymentPageAvailable() {
    const user = this.userStore?.user;

    if (!user) return false;

    return user.isOwner || user.isAdmin;
  }

  get isTeamTrainingAlertAvailable() {
    const user = this.userStore?.user;

    if (!user) return false;

    return (
      !!this.settingsStore?.bookTrainingEmail &&
      (user.isOwner || user.isAdmin || this.isRoomAdmin)
    );
  }

  get isLiveChatAvailable() {
    const user = this.userStore?.user;

    if (!user) return false;

    return (
      !!this.settingsStore?.zendeskKey &&
      (user.isOwner || user.isAdmin || this.isRoomAdmin)
    );
  }

  login = async (user: TUser, hash: string, session = true) => {
    try {
      const response = (await api.user.login(user, hash, session)) as {
        token: string;
        tfa: string;
        error: { message: unknown };
        confirmUrl: string;
      };

      if (!response || (!response.token && !response.tfa))
        throw response.error.message;

      if (response.tfa && response.confirmUrl) {
        const url = response.confirmUrl.replace(window.location.origin, "");
        return await Promise.resolve({ url, user, hash });
      }

      setWithCredentialsStatus(true);

      this.reset();

      this.init();

      return await Promise.resolve({ url: this.settingsStore?.defaultPage });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  loginWithCode = async (
    userName: string,
    passwordHash: string,
    code: string,
  ) => {
    await loginWithTfaCode(userName, passwordHash, code);
    setWithCredentialsStatus(true);

    this.reset();

    this.init();

    return Promise.resolve(this.settingsStore?.defaultPage);
  };

  thirdPartyLogin = async (SerializedProfile: string) => {
    try {
      const response = (await api.user.thirdPartyLogin(SerializedProfile)) as {
        token: string;
      };

      if (!response || !response.token) throw new Error("Empty API response");

      setWithCredentialsStatus(true);

      this.reset();

      this.init();

      return await Promise.resolve(this.settingsStore?.defaultPage);
    } catch (e) {
      return Promise.reject(e);
    }
  };

  reset = (skipUser = false) => {
    this.isInit = false;
    this.skipModules = false;
    if (!skipUser) {
      // this.userStore = new UserStore();
    }

    // this.settingsStore = new SettingsStore();
  };

  logout = async (reset = true) => {
    const ssoLogoutUrl = await api.user.logout();

    this.isLogout = true;

    const isDesktop = this.settingsStore?.isDesktopClient;
    const isFrame = this.settingsStore?.isFrame;

    if (isDesktop) logoutDesktop();
    if (isFrame) frameCallEvent({ event: "onSignOut" });

    if (ssoLogoutUrl) return ssoLogoutUrl;

    if (!reset) return;

    setWithCredentialsStatus(false);
    this.reset(true);
    this.userStore?.setUser({} as TUser);
    this.init();
  };

  get isAuthenticated() {
    return (
      this.settingsStore?.isLoaded &&
      !!this.settingsStore?.socketUrl &&
      !isPublicRoom()
      // || //this.userStore.isAuthenticated
    );
  }

  setDocumentTitle = (subTitle = null) => {
    let title;

    // const currentModule = this.settingsStore?.product;
    const organizationName = this.settingsStore?.organizationName;

    if (subTitle) {
      title = `${subTitle} - ${organizationName}`;
      // if (this.isAuthenticated && currentModule) {
      //   title = `${subTitle} - ${currentModule.title}`;
      // } else {
      //   title = `${subTitle} - ${organizationName}`;
      // }
      // } else if ( organizationName) {
      // title = `${currentModule.title} - ${organizationName}`;
    } else {
      title = organizationName;
    }

    document.title = title ?? "";
  };

  setProductVersion = (version: string) => {
    this.version = version;
  };

  setProviders = (providers: TThirdPartyProvider[]) => {
    this.providers = providers;
  };

  setCapabilities = (capabilities: TCapabilities) => {
    this.capabilities = capabilities;
  };

  getAuthProviders = async () => {
    const providers = await api.settings.getAuthProviders();
    if (providers) this.setProviders(providers);
  };

  getCapabilities = async () => {
    const capabilities = await api.settings.getCapabilities();
    if (capabilities) this.setCapabilities(capabilities);
  };
}

export { AuthStore };
