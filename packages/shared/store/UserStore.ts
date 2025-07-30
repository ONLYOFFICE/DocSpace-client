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

/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
import { makeAutoObservable, runInAction } from "mobx";

import api from "../api";
import { TUser } from "../api/people/types";
import { EmployeeActivationStatus, ThemeKeys } from "../enums";
import { TI18n } from "../types";
import { getUserType } from "../utils/common";

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
    const user = await api.people.getUser();

    this.setUser(user as TUser);

    return user as TUser;
  };

  init = async (i18n?: TI18n, portalCultureName?: string) => {
    if (this.isLoaded) return;

    this.setIsLoading(true);

    try {
      const user = await this.loadCurrentUser();
      const correctCulture = user.cultureName || portalCultureName;

      if (i18n && correctCulture && correctCulture !== i18n.language) {
        i18n.changeLanguage(correctCulture);
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

  changeEmail = async (
    userId: string,
    email: string,
    encemail: string,
    key: string,
  ) => {
    this.setIsLoading(true);

    const user = await api.people.changeEmail(userId, email, encemail, key);

    this.setUser(user);
    this.setIsLoading(false);
  };

  updateEmailActivationStatus = async (
    activationStatus: EmployeeActivationStatus,
    userId: string,
    key: string,
  ) => {
    this.setIsLoading(true);

    const users = await api.people.updateActivationStatus(
      activationStatus,
      userId,
      key,
    );

    this.setUser(users[0]);
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

    return +this.user.quotaLimit <= +this.user.usedSpace;
  }

  get userType() {
    return getUserType(this.user!);
  }
}

export { UserStore };
