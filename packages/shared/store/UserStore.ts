/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
import { makeAutoObservable, runInAction } from "mobx";

import api from "../api";
import { TUser } from "../api/people/types";
import { EmployeeActivationStatus, ThemeKeys } from "../enums";
import { TI18n } from "../types";

class UserStore {
  user: TUser | null = null;

  isLoading = false;

  isLoaded = false;

  userIsUpdate = false;

  withSendAgain = true;

  constructor() {
    makeAutoObservable(this);
  }

  loadCurrentUser = async () => {
    let user = null;
    if (window?.__ASC_INITIAL_EDITOR_STATE__?.user)
      user = window.__ASC_INITIAL_EDITOR_STATE__.user;
    else user = await api.people.getUser();

    this.setUser(user);

    return user;
  };

  init = async (i18n?: TI18n) => {
    if (this.isLoaded) return;

    this.setIsLoading(true);

    try {
      const user = await this.loadCurrentUser();

      if (i18n && user.cultureName !== i18n.language) {
        // console.log({ i18n, user });
        if (user.cultureName) i18n.changeLanguage(user.cultureName);
      }
    } catch (e) {
      console.error(e);
    }

    this.setIsLoading(false);
    this.setIsLoaded(true);
  };

  setIsLoading = (isLoading: boolean) => {
    this.isLoading = isLoading;
  };

  setIsLoaded = (isLoaded: boolean) => {
    this.isLoaded = isLoaded;
  };

  setUser = (user: TUser) => {
    this.user = user;
  };

  changeEmail = async (userId: string, email: string, key: string) => {
    this.setIsLoading(true);

    const user = await api.people.changeEmail(userId, email, key);

    this.setUser(user);
    this.setIsLoading(false);
  };

  updateEmailActivationStatus = async (
    activationStatus: EmployeeActivationStatus,
    userId: string,
    key: string,
  ) => {
    this.setIsLoading(true);

    const user = await api.people.updateActivationStatus(
      activationStatus,
      userId,
      key,
    );

    this.setUser(user);
    this.setIsLoading(false);
  };

  changeTheme = async (key: ThemeKeys) => {
    this.setIsLoading(true);

    const { theme } = await api.people.changeTheme(key);

    runInAction(() => {
      if (this.user) this.user.theme = theme;
    });

    this.setIsLoading(false);

    return theme;
  };

  setUserIsUpdate = (isUpdate: boolean) => {
    // console.log("setUserIsUpdate");
    this.userIsUpdate = isUpdate;
  };

  setWithSendAgain = (withSendAgain: boolean) => {
    this.withSendAgain = withSendAgain;
  };

  sendActivationLink = async () => {
    if (!this.user) return null;
    const { email, id } = this.user;
    await api.people.resendUserInvites([id]);
    return email;
  };

  updateAvatarInfo = (
    avatar: string,
    avatarSmall: string,
    avatarMedium: string,
    avatarMax: string,
    avatarOriginal: string,
  ) => {
    if (this.user) {
      this.user = {
        ...this.user,
        avatar,
        avatarSmall,
        avatarMedium,
        avatarMax,
        avatarOriginal,
      };
    }
  };

  updateUserQuota = (usedSpace: number, quotaLimit: number) => {
    if (!this.user) return;

    this.user.usedSpace = usedSpace;
    this.user.quotaLimit = quotaLimit;
  };

  get withActivationBar() {
    return (
      this.user &&
      (this.user.activationStatus === EmployeeActivationStatus.Pending ||
        this.user.activationStatus === EmployeeActivationStatus.NotActivated) &&
      this.withSendAgain
    );
  }

  get isAuthenticated() {
    return !!this.user;
  }

  get personalQuotaLimitReached() {
    if (!this.user || !this.user.quotaLimit || !this.user.usedSpace)
      return false;

    if (this.user.quotaLimit === -1) return false;

    return this.user.quotaLimit <= this.user.usedSpace;
  }
}

export { UserStore };
