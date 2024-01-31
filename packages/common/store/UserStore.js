import React from "react";

import { makeAutoObservable, runInAction } from "mobx";
import { Trans } from "react-i18next";
import api from "@docspace/shared/api";
import { EmployeeActivationStatus } from "@docspace/shared/enums";

class UserStore {
  user = null;
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

  init = async (i18n) => {
    if (this.isLoaded) return;

    this.setIsLoading(true);

    try {
      const user = await this.loadCurrentUser();

      if (i18n && user.cultureName !== i18n.language) {
        //console.log({ i18n, user });
        i18n.changeLanguage(user.cultureName);
      }
    } catch (e) {
      console.error(e);
    }

    this.setIsLoading(false);
    this.setIsLoaded(true);
  };

  setIsLoading = (isLoading) => {
    this.isLoading = isLoading;
  };

  setIsLoaded = (isLoaded) => {
    this.isLoaded = isLoaded;
  };

  setUser = (user) => {
    this.user = user;
  };

  changeEmail = async (userId, email, key) => {
    this.setIsLoading(true);

    const user = await api.people.changeEmail(userId, email, key);

    this.setUser(user);
    this.setIsLoading(false);
  };

  updateEmailActivationStatus = async (activationStatus, userId, key) => {
    this.setIsLoading(true);

    const user = await api.people.updateActivationStatus(
      activationStatus,
      userId,
      key
    );

    this.setUser(user);
    this.setIsLoading(false);
  };

  changeTheme = async (key) => {
    this.setIsLoading(true);

    const { theme } = await api.people.changeTheme(key);

    runInAction(() => {
      this.user.theme = theme;
    });

    this.setIsLoading(false);

    return theme;
  };

  setUserIsUpdate = (isUpdate) => {
    //console.log("setUserIsUpdate");
    this.userIsUpdate = isUpdate;
  };

  setWithSendAgain = (withSendAgain) => {
    this.withSendAgain = withSendAgain;
  };

  sendActivationLink = async () => {
    const { email, id } = this.user;
    await api.people.resendUserInvites([id]);
    return email;
  };

  updateUser = (newUser) => {
    this.user = { ...this.user, newUser };
  };

  updateUserQuota = (usedSpace, quotaLimit) => {
    this.user.usedSpace = usedSpace;
    this.user.quotaLimit = quotaLimit;
  };

  updateAvatarInfo = (avatar, avatarSmall, avatarMedium, avatarMax) => {
    this.user.avatar = avatar;
    this.updateUser({ avatar, avatarSmall, avatarMedium, avatarMax });
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
    if (this.user?.quotaLimit === -1) return false;
    return this.user?.quotaLimit <= this.user?.usedSpace;
  }
}

export default UserStore;
