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

import {
  getInvitationLinks,
  getInvitationLink,
  getShortenedLink,
} from "@docspace/shared/api/portal";
import { EmployeeType } from "@docspace/shared/enums";
import { Nullable } from "@docspace/shared/types";
import { UserStore } from "@docspace/shared/store/UserStore";

class InviteLinksStore {
  userLink: Nullable<string> = null;

  guestLink: Nullable<string> = null;

  adminLink: Nullable<string> = null;

  collaboratorLink: Nullable<string> = null;

  constructor(public userStore: UserStore) {
    this.userStore = userStore;

    makeAutoObservable(this);
  }

  setRoomAdminLink = (link: Nullable<string>) => {
    this.userLink = link;
  };

  setGuestLink = (link: Nullable<string>) => {
    this.guestLink = link;
  };

  setAdminLink = (link: Nullable<string>) => {
    this.adminLink = link;
  };

  setUserLink = (link: Nullable<string>) => {
    this.collaboratorLink = link;
  };

  getPortalInviteLinks = async () => {
    if (this.userStore.user!.isVisitor) return Promise.resolve();

    const links = await getInvitationLinks();

    runInAction(() => {
      this.setRoomAdminLink(links.userLink);
      this.setGuestLink(links.guestLink);
      this.setAdminLink(links.adminLink);
      this.setUserLink(links.collaboratorLink);
    });
  };

  getPortalInviteLink = async (type: EmployeeType) => {
    if (this.userStore.user!.isVisitor) return Promise.resolve();

    const link = await getInvitationLink(type);

    runInAction(() => {
      switch (type) {
        case EmployeeType.RoomAdmin:
          this.setRoomAdminLink(link);
          break;
        case EmployeeType.Guest:
          this.setGuestLink(link);
          break;
        case EmployeeType.Admin:
          this.setAdminLink(link);
          break;
        case EmployeeType.User:
          this.setUserLink(link);
          break;
        default:
          break;
      }
    });

    return link;
  };

  getShortenedLink = async (link: string, forUser = false) => {
    if (forUser) {
      const userLink = await getShortenedLink(link);
      this.setRoomAdminLink(userLink);
    } else {
      const guestLink = await getShortenedLink(link);
      this.setGuestLink(guestLink);
    }
  };
}

export default InviteLinksStore;
