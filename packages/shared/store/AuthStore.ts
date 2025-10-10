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

import { makeAutoObservable, runInAction } from "mobx";

import SocketHelper, { SocketEvents, TOptSocket } from "../utils/socket";

import api from "../api";
import { setWithCredentialsStatus } from "../api/client";
import { loginWithTfaCode } from "../api/user";
import { TUser } from "../api/people/types";
import { TCapabilities, TThirdPartyProvider } from "../api/settings/types";
import { logout as logoutDesktop } from "../utils/desktop";
import {
  frameCallEvent,
  isAdmin,
  insertDataLayer,
  isPublicRoom,
  isPublicPreview,
} from "../utils/common";
import { getCookie, setCookie } from "../utils/cookie";
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

  skipRequest = false;

  skipModules = false;

  clientError = false;

  isPortalInfoLoaded = false;

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

    SocketHelper?.on(
      SocketEvents.ChangedQuotaUsedValue,
      (res: { featureId: string; value: number }) => {
        console.log(
          `[WS] change-quota-used-value ${res?.featureId}:${res?.value}`,
        );

        if (!res || !res?.featureId) return;
        const { featureId, value } = res;

        runInAction(() => {
          this.currentQuotaStore?.updateQuotaUsedValue(featureId, value);
        });
      },
    );

    SocketHelper?.on(
      SocketEvents.ChangedQuotaFeatureValue,
      (res: { featureId: string; value: number }) => {
        console.log(
          `[WS] change-quota-feature-value ${res?.featureId}:${res?.value}`,
        );

        if (!res || !res?.featureId) return;
        const { featureId, value } = res;

        runInAction(() => {
          if (featureId === "free") {
            this.updateTariff();
            return;
          }

          this.currentQuotaStore?.updateQuotaFeatureValue(featureId, value);
        });
      },
    );
    SocketHelper?.on(
      SocketEvents.ChangedQuotaUserUsedValue,
      (options: TOptSocket) => {
        console.log(`[WS] change-user-quota-used-value`, options);

        runInAction(() => {
          if (options.customQuotaFeature === "user_custom_quota") {
            this.userStore?.updateUserQuota(
              options.usedSpace,
              options.quotaLimit,
            );

            return;
          }

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { customQuotaFeature, ...updatableObject } = options;

          this.currentQuotaStore?.updateTenantCustomQuota(updatableObject);
        });
      },
    );
  }

  setIsUpdatingTariff = (isUpdatingTariff: boolean) => {
    this.isUpdatingTariff = isUpdatingTariff;
  };

  updateTariff = async () => {
    this.setIsUpdatingTariff(true);

    await this.getPaymentInfo();

    const user = this.userStore?.user;

    if (user && user.isAdmin) {
      await this.currentTariffStatusStore?.fetchPayerInfo();
    }

    this.setIsUpdatingTariff(false);
  };

  init = async (skipRequest?: boolean, i18n?: TI18n) => {
    if (this.isInit) return;
    this.isInit = true;

    this.skipRequest = skipRequest ?? false;

    if (window.location.pathname === "/shared/invalid-link") return;

    await this.settingsStore?.init();

    const requests = [];

    const isPortalDeactivated = this.settingsStore?.isPortalDeactivate;

    const isPortalRestore =
      this.settingsStore?.tenantStatus === TenantStatus.PortalRestore;

    const isPortalEncryption =
      this.settingsStore?.tenantStatus === TenantStatus.EncryptionProcess;

    if (!isPortalRestore && !isPortalEncryption)
      requests.push(this.getCapabilities());

    if (
      this.settingsStore?.isLoaded &&
      !!this.settingsStore?.socketUrl &&
      !isPortalDeactivated &&
      !isPortalEncryption &&
      !isPublicRoom() &&
      !isPublicPreview()
    ) {
      requests.push(
        this.userStore?.init(i18n, this.settingsStore.culture).then(() => {
          if (!isPortalRestore) {
            this.getPaymentInfo();
          } else {
            this.isPortalInfoLoaded = true;
          }
        }),
      );
    } else {
      this.userStore?.setIsLoaded(true);
    }

    return Promise.all(requests).then(() => {
      const user = this.userStore?.user;

      if (user?.id) {
        insertDataLayer(user.id);
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

  getPaymentInfo = async () => {
    let refresh = false;

    if (
      window.location.search === "?complete=true" &&
      !window.location.href.includes("wallet") &&
      !window.location.href.includes("services")
    ) {
      window.history.replaceState({}, document.title, window.location.pathname);
      refresh = true;
    }
    const user = this.userStore?.user?.isVisitor;

    const request = [];

    request.push(this.currentTariffStatusStore?.fetchPortalTariff(refresh));

    if (!user) {
      request.push(this.currentQuotaStore?.fetchPortalQuota(refresh));
    }

    await Promise.all(request);

    runInAction(() => {
      this.isPortalInfoLoaded = true;
    });
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
        (this.userStore?.isLoaded &&
          this.settingsStore?.isLoaded &&
          this.isPortalInfoLoaded) ??
        false;

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
      const response = (await api.user.login(user, hash, "", session)) as {
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
      //  this.userStore?.isAuthenticated
    );
  }

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

  setClientError = (clientError: boolean) => {
    this.clientError = clientError;
  };
}

export { AuthStore };
