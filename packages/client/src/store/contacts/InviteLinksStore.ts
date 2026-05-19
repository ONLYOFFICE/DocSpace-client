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
