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

import { makeAutoObservable } from "mobx";
import { TFunction } from "i18next";

import api from "@docspace/shared/api";
import {
  NotificationsType,
  EmployeeActivationStatus,
} from "@docspace/shared/enums";
import { setCookie } from "@docspace/shared/utils/cookie";
import {
  LANGUAGE,
  COOKIE_EXPIRATION_YEAR,
  AVATAR_ACTION_KEYS,
} from "@docspace/shared/constants";
import {
  changeNotificationSubscription,
  getNotificationSubscription,
} from "@docspace/shared/api/settings";
import { TNotificationChannel } from "@docspace/shared/api/settings/types";
import { toastr } from "@docspace/shared/components/toast";
import { UserStore } from "@docspace/shared/store/UserStore";
import { Nullable } from "@docspace/shared/types";

import UploadSvgUrl from "PUBLIC_DIR/images/actions.upload.react.svg?url";
import TrashIconSvgUrl from "PUBLIC_DIR/images/delete.react.svg?url";

import { employeeWrapperToMemberModel } from "SRC_DIR/helpers/contacts";
import { TUser } from "@docspace/shared/api/people/types";

class TargetUserStore {
  userStore: Nullable<UserStore> = null;

  changePasswordVisible = false;

  changeNameVisible = false;

  changeAvatarVisible = false;

  badgesSubscription = false;

  roomsActivitySubscription = false;

  dailyFeedSubscriptions = false;

  usefulTipsSubscription = false;

  isFirstSubscriptionsLoad = true;

  notificationChannels: TNotificationChannel[] = [];

  constructor(userStore: UserStore) {
    this.userStore = userStore;
    makeAutoObservable(this);
  }

  setHasAvatar = (value: boolean) => {
    if (this.userStore?.user) this.userStore.user.hasAvatar = value;
  };

  updateProfile = async (profile: TUser) => {
    const member = employeeWrapperToMemberModel(profile);

    const res = (await api.people.updateUser(member)) as TUser;

    if (!res.theme && this.userStore?.user?.theme)
      res.theme = this.userStore.user.theme;

    this.userStore?.setUser(res);

    return Promise.resolve(res);
  };

  updateCreatedAvatar = (avatar: {
    big: string;
    small: string;
    medium: string;
    max: string;
    main: string;
  }) => {
    const { big, small, medium, max, main } = avatar;

    this.userStore?.updateAvatarInfo(big, small, medium, max, main);
  };

  updateProfileCulture = async (id: string, culture: string) => {
    const res = (await api.people.updateUserCulture(id, culture)) as TUser;

    if (!res.theme && this.userStore?.user?.theme)
      res.theme = this.userStore.user.theme;

    this.userStore?.setUser(res);

    setCookie(LANGUAGE, culture, {
      "max-age": COOKIE_EXPIRATION_YEAR,
    });
  };

  setChangePasswordVisible = (visible: boolean) =>
    (this.changePasswordVisible = visible);

  setChangeNameVisible = (visible: boolean) => {
    this.changeNameVisible = visible;
  };

  setChangeAvatarVisible = (visible: boolean) => {
    this.changeAvatarVisible = visible;
  };

  deleteProfileAvatar = async () => {
    if (!this.userStore?.user) return;

    const res = (await api.people.deleteAvatar(this.userStore.user.id)) as {
      big: string;
      small: string;
      medium: string;
      max: string;
      main: string;
    };

    this.updateCreatedAvatar(res);
    this.setHasAvatar(false);
  };

  getProfileModel = (t: TFunction) => {
    return [
      {
        label: t("RoomLogoCover:UploadPicture"),
        icon: UploadSvgUrl,
        key: AVATAR_ACTION_KEYS.PROFILE_AVATAR_UPLOAD,
        onClick: (ref: React.RefObject<HTMLDivElement>) => ref.current?.click(),
      },
      {
        label: t("Common:Delete"),
        icon: TrashIconSvgUrl,
        key: AVATAR_ACTION_KEYS.PROFILE_AVATAR_DELETE,
        onClick: () => this.deleteProfileAvatar(),
      },
    ];
  };

  setSubscriptions = (
    isEnableBadges: boolean,
    isEnableRoomsActivity: boolean,
    isEnableDailyFeed: boolean,
    isEnableTips: boolean,
  ) => {
    this.badgesSubscription = isEnableBadges;
    this.roomsActivitySubscription = isEnableRoomsActivity;
    this.dailyFeedSubscriptions = isEnableDailyFeed;
    this.usefulTipsSubscription = isEnableTips;
    this.isFirstSubscriptionsLoad = false;
  };

  setNotificationChannels = (channels: TNotificationChannel[]) => {
    this.notificationChannels = channels;
  };

  changeSubscription = async (
    notificationType: NotificationsType,
    isEnabled: boolean,
  ) => {
    const setNotificationValue = (
      type: NotificationsType,
      enabled: boolean,
    ) => {
      switch (type) {
        case NotificationsType.Badges:
          this.badgesSubscription = enabled;
          break;
        case NotificationsType.DailyFeed:
          this.dailyFeedSubscriptions = enabled;
          break;
        case NotificationsType.RoomsActivity:
          this.roomsActivitySubscription = enabled;
          break;
        case NotificationsType.UsefulTips:
          this.usefulTipsSubscription = enabled;
          break;
        default:
          break;
      }
    };

    setNotificationValue(notificationType, isEnabled);

    try {
      await changeNotificationSubscription(notificationType, isEnabled);
    } catch (e) {
      toastr.error(e as string);
      const notification = await getNotificationSubscription(notificationType);

      setNotificationValue(
        notificationType,
        (notification as { isEnabled: boolean }).isEnabled,
      );
    }
  };

  get isEmailEnabled() {
    return this.notificationChannels?.find(
      (channel) => channel.name === "email.sender",
    )?.isEnabled;
  }

  get isTelegramEnabled() {
    return this.notificationChannels?.find(
      (channel) => channel.name === "telegram.sender",
    )?.isEnabled;
  }

  get isEmailNotValid() {
    return (
      this.userStore?.user?.activationStatus ===
      EmployeeActivationStatus.AutoGenerated
    );
  }
}

export default TargetUserStore;
