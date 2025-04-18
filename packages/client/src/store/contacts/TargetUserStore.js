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

import api from "@docspace/shared/api";
import { NotificationsType } from "@docspace/shared/enums";

import { LANGUAGE, COOKIE_EXPIRATION_YEAR } from "@docspace/shared/constants";
import { makeAutoObservable } from "mobx";
import { setCookie } from "@docspace/shared/utils/cookie";

import {
  changeNotificationSubscription,
  getNotificationSubscription,
} from "@docspace/shared/api/settings";
import { toastr } from "@docspace/shared/components/toast";

import UploadSvgUrl from "PUBLIC_DIR/images/actions.upload.react.svg?url";
import TrashIconSvgUrl from "PUBLIC_DIR/images/delete.react.svg?url";

import { employeeWrapperToMemberModel } from "SRC_DIR/helpers/contacts";

const { Badges, RoomsActivity, DailyFeed, UsefulTips } = NotificationsType;
class TargetUserStore {
  peopleStore = null;

  userStore = null;

  targetUser = null;

  isEditTargetUser = false;

  changePasswordVisible = false;

  changeNameVisible = false;

  changeAvatarVisible = false;

  badgesSubscription = false;

  roomsActivitySubscription = false;

  dailyFeedSubscriptions = false;

  usefulTipsSubscription = false;

  isFirstSubscriptionsLoad = true;

  constructor(peopleStore, userStore) {
    this.peopleStore = peopleStore;
    this.userStore = userStore;
    makeAutoObservable(this);
  }

  get isMe() {
    return (
      this.targetUser &&
      this.targetUser.userName === this.userStore.user.userName
    );
  }

  setHasAvatar = (value) => {
    this.targetUser.hasAvatar = value;
    this.userStore.user.hasAvatar = value;
  };

  getTargetUser = async (userName) => {
    /* if (this.userStore.user.userName === userName) {
      return this.setTargetUser(this.userStore.user);
    } else { */
    const user = await api.people.getUser(userName);

    this.setTargetUser(user);
    return user;
    // }
  };

  setTargetUser = (user) => {
    this.targetUser = user;
    this.userStore.setUser(user); // TODO
  };

  updateProfile = async (profile) => {
    const member = employeeWrapperToMemberModel(profile);

    const res = await api.people.updateUser(member);
    if (!res.theme) res.theme = this.userStore.user.theme;

    this.setTargetUser(res);
    return Promise.resolve(res);
  };

  updateCreatedAvatar = (avatar) => {
    const { big, small, medium, max, main } = avatar;

    this.targetUser.avatar = big;
    this.targetUser.avatarSmall = small;
    this.targetUser.avatarMedium = medium;
    this.targetUser.avatarMax = max;
    this.targetUser.avatarOriginal = main;

    this.userStore.updateAvatarInfo(big, small, medium, max, main);

    console.log("updateCreatedAvatar", {
      targetUser: this.targetUser,
      user: this.userStore.user,
    });
  };

  updateProfileCulture = async (id, culture) => {
    const res = await api.people.updateUserCulture(id, culture);

    this.userStore.setUser(res);

    this.setTargetUser(res);
    // caches.delete("api-cache");

    setCookie(LANGUAGE, culture, {
      "max-age": COOKIE_EXPIRATION_YEAR,
    });
  };

  setIsEditTargetUser = (isEditTargetUser) => {
    this.isEditTargetUser = isEditTargetUser;
  };

  setChangePasswordVisible = (visible) =>
    (this.changePasswordVisible = visible);

  setChangeNameVisible = (visible) => {
    // console.log("setChangeNameVisible", { visible });
    this.changeNameVisible = visible;
  };

  setChangeAvatarVisible = (visible) => {
    // console.log("setChangeAvatarVisible", { visible });
    this.changeAvatarVisible = visible;
  };

  deleteProfileAvatar = async () => {
    const res = await api.people.deleteAvatar(this.targetUser.id);
    this.updateCreatedAvatar(res);
    this.setHasAvatar(false);
  };

  getProfileModel = (t) => {
    return [
      {
        label: t("RoomLogoCover:UploadPicture"),
        icon: UploadSvgUrl,
        key: "upload",
        onClick: (ref) => ref.current.click(),
      },
      {
        label: t("Common:Delete"),
        icon: TrashIconSvgUrl,
        key: "delete",
        onClick: () => this.deleteProfileAvatar(),
      },
    ];
  };

  setSubscriptions = (
    isEnableBadges,
    isEnableRoomsActivity,
    isEnableDailyFeed,
    isEnableTips,
  ) => {
    this.badgesSubscription = isEnableBadges;
    this.roomsActivitySubscription = isEnableRoomsActivity;
    this.dailyFeedSubscriptions = isEnableDailyFeed;
    this.usefulTipsSubscription = isEnableTips;
    this.isFirstSubscriptionsLoad = false;
  };

  changeSubscription = async (notificationType, isEnabled) => {
    const setNotificationValue = (type, enabled) => {
      switch (type) {
        case Badges:
          this.badgesSubscription = enabled;
          break;
        case DailyFeed:
          this.dailyFeedSubscriptions = enabled;
          break;
        case RoomsActivity:
          this.roomsActivitySubscription = enabled;
          break;
        case UsefulTips:
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
      toastr.error(e);
      const notification = await getNotificationSubscription(notificationType);

      setNotificationValue(notificationType, notification.isEnabled);
    }
  };
}

export default TargetUserStore;
