// (c) Copyright Ascensio System SIA 2009-2024
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

import React from "react";
import { Trans } from "react-i18next";
import MailReactSvgUrl from "PUBLIC_DIR/images/mail.react.svg?url";
import cloneDeep from "lodash/cloneDeep";
import find from "lodash/find";
import {
  EmployeeActivationStatus,
  EmployeeStatus,
} from "@docspace/shared/enums";

import PhoneIconUrl from "PUBLIC_DIR/images/phone.react.svg?url";
import MobileIconUrl from "PUBLIC_DIR/images/mobile.react.svg?url";
import GmailIconUrl from "PUBLIC_DIR/images/gmail.react.svg?url";
import SkypeIconUrl from "PUBLIC_DIR/images/skype.react.svg?url";
import MsnIconUrl from "PUBLIC_DIR/images/windows.msn.react.svg?url";
import IcqIconUrl from "PUBLIC_DIR/images/icq.react.svg?url";
import JabberIconUrl from "PUBLIC_DIR/images/jabber.react.svg?url";
import AimIconUrl from "PUBLIC_DIR/images/aim.react.svg?url";
import FacebookIconUrl from "PUBLIC_DIR/images/share.facebook.react.svg?url";
import LivejournalIconUrl from "PUBLIC_DIR/images/livejournal.react.svg?url";
import MyspaceIconUrl from "PUBLIC_DIR/images/myspace.react.svg?url";
import TwitterIconUrl from "PUBLIC_DIR/images/share.twitter.react.svg?url";
import BloggerIconUrl from "PUBLIC_DIR/images/blogger.react.svg?url";
import YahooIconUrl from "PUBLIC_DIR/images/yahoo.react.svg?url";
import { toastr } from "@docspace/shared/components/toast";

export const getUserStatus = (user) => {
  switch (user.status) {
    case EmployeeStatus.Active:
      return "active";
    case EmployeeStatus.Pending:
      return "pending";
    case EmployeeStatus.Disabled:
      return "disabled";
    default:
      return "unknown";
  }
};

export const getUserContactsPattern = () => {
  return {
    contact: [
      {
        type: "mail",
        icon: MailReactSvgUrl,
        link: "mailto:{0}",
      },
      {
        type: "phone",
        icon: PhoneIconUrl,
        link: "tel:{0}",
      },
      {
        type: "mobphone",
        icon: MobileIconUrl,
        link: "tel:{0}",
      },
      {
        type: "gmail",
        icon: GmailIconUrl,
        link: "mailto:{0}",
      },
      {
        type: "skype",
        icon: SkypeIconUrl,
        link: "skype:{0}?userinfo",
      },
      { type: "msn", icon: MsnIconUrl },
      {
        type: "icq",
        icon: IcqIconUrl,
        link: "https://www.icq.com/people/{0}",
      },
      { type: "jabber", icon: JabberIconUrl },
      { type: "aim", icon: AimIconUrl },
    ],
    social: [
      {
        type: "facebook",
        icon: FacebookIconUrl,
        link: "https://facebook.com/{0}",
      },
      {
        type: "livejournal",
        icon: LivejournalIconUrl,
        link: "https://{0}.livejournal.com",
      },
      {
        type: "myspace",
        icon: MyspaceIconUrl,
        link: "https://myspace.com/{0}",
      },
      {
        type: "twitter",
        icon: TwitterIconUrl,
        link: "https://twitter.com/{0}",
      },
      {
        type: "blogger",
        icon: BloggerIconUrl,
        link: "https://{0}.blogspot.com",
      },
      {
        type: "yahoo",
        icon: YahooIconUrl,
        link: "mailto:{0}@yahoo.com",
      },
    ],
  };
};

export const getUserContacts = (contacts) => {
  const mapContacts = (a, b) => {
    return a
      .map((a) => ({ ...a, ...b.find(({ type }) => type === a.type) }))
      .filter((c) => c.icon);
  };

  const info = {};
  const pattern = getUserContactsPattern();

  info.contact = mapContacts(contacts, pattern.contact);
  info.social = mapContacts(contacts, pattern.social);

  return info;
};

export function getSelectedGroup(groups, selectedGroupId) {
  return find(groups, (group) => group.id === selectedGroupId);
}

export function toEmployeeWrapper(profile) {
  const emptyData = {
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    birthday: "",
    sex: "male",
    workFrom: "",
    location: "",
    title: "",
    groups: [],
    notes: "",
    contacts: [],
  };

  return cloneDeep({ ...emptyData, ...profile });
}

export const showEmailActivationToast = (email, t) => {
  //console.log("showEmailActivationToast", { email });
  toastr.success(
    <Trans
      i18nKey="MessageEmailActivationInstuctionsSentOnEmail"
      t={t}
      ns="People"
      defaults="The email activation instructions have been sent to the <strong>{{email}}</strong> email address"
      values={{ email }}
      components={{ 1: <strong /> }}
    />,
  );
};
