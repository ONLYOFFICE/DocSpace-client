/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { makeAutoObservable, runInAction } from "mobx";

import api from "../api";
import { TUser } from "../api/people/types";
import { EmployeeActivationStatus, ThemeKeys } from "../enums";
import { TI18n } from "../types";
import { getUserType, getStringUserType } from "../utils/common";

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
        await i18n.changeLanguage(correctCulture);
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

  isMe = (userId: string) => this.user?.id === userId;

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

  get stringUserType() {
    return getStringUserType(this.user!);
  }
}

export { UserStore };
