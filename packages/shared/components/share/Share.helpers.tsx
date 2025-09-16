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
import moment from "moment";
import { Trans } from "react-i18next";
import type { TFunction } from "i18next";

import AccessEditReactSvgUrl from "PUBLIC_DIR/images/access.edit.react.svg?url";
import AccessReviewReactSvgUrl from "PUBLIC_DIR/images/access.review.react.svg?url";
import CustomFilterReactSvgUrl from "PUBLIC_DIR/images/custom.filter.react.svg?url";
import AccessCommentReactSvgUrl from "PUBLIC_DIR/images/access.comment.react.svg?url";
import EyeReactSvgUrl from "PUBLIC_DIR/images/eye.react.svg?url";
import FillFormsReactSvgUrl from "PUBLIC_DIR/images/form.fill.rect.svg?url";

import PeopleIcon from "PUBLIC_DIR/images/people.react.svg?url";
import UniverseIcon from "PUBLIC_DIR/images/universe.react.svg?url";
// import EyeOffReactSvgUrl from "PUBLIC_DIR/images/eye.off.react.svg?url";
// import RemoveReactSvgUrl from "PUBLIC_DIR/images/remove.react.svg?url";

import { globalColors } from "../../themes";
import {
  EmployeeActivationStatus,
  MembersSubjectType,
  ShareAccessRights,
} from "../../enums";
import { copyShareLink as copy } from "../../utils/copy";
import {
  isFile,
  isFolder,
  isFolderOrRoom,
  isRoom,
} from "../../utils/typeGuards";

import type { RoomMember, TRoom } from "../../api/rooms/types";
import type { TTranslation } from "../../types";
import type {
  TAvailableExternalRights,
  TFile,
  TFileLink,
  TFolder,
} from "../../api/files/types";

import { Link } from "../link";
import { toastr } from "../toast";
import {
  TCopyShareLinkOptions,
  TShare,
  TShareMember,
  TShareMembers,
  TTitleShare,
} from "./Share.types";

type ItemValue<T> = T extends false ? never : T;

export const getAccessTypeOptions = (t: TTranslation, withIcon = true) => {
  return [
    {
      internal: false,
      key: "anyone",
      label: t("Common:AnyoneWithLink"),
      icon: withIcon ? UniverseIcon : undefined,
    },
    {
      internal: true,
      key: "users",
      label: t("Common:SpaceUsersOnly", {
        productName: t("Common:ProductName"),
      }),
      icon: withIcon ? PeopleIcon : undefined,
    },
  ];
};

export const getAccessRightOptions = (
  t: TTranslation,
  available: TAvailableExternalRights,
) => {
  const accessOptions = [
    available.Editing && {
      access: ShareAccessRights.Editing,
      key: "editing",
      label: t("Common:Editing"),
      icon: AccessEditReactSvgUrl,
    },
    available.CustomFilter && {
      access: ShareAccessRights.CustomFilter,
      key: "custom-filter",
      label: t("Common:CustomFilter"),
      icon: CustomFilterReactSvgUrl,
    },
    available.Review && {
      access: ShareAccessRights.Review,
      key: "review",
      label: t("Common:Review"),
      icon: AccessReviewReactSvgUrl,
    },
    available.Comment && {
      access: ShareAccessRights.Comment,
      key: "commenting",
      label: t("Common:Comment"),
      icon: AccessCommentReactSvgUrl,
    },
    available.Read && {
      access: ShareAccessRights.ReadOnly,
      key: "viewing",
      label: t("Common:ReadOnly"),
      icon: EyeReactSvgUrl,
      title: t("Common:ReadOnly"),
    },
    available.FillForms && {
      access: ShareAccessRights.FormFilling,
      key: "filling",
      label: t("Common:Filling"),
      icon: FillFormsReactSvgUrl,
    },
    // available.Restrict && {
    //   access: ShareAccessRights.DenyAccess,
    //   key: "deny-access",
    //   label: t("Common:DenyAccess"),
    //   icon: EyeOffReactSvgUrl,
    // },
    // {
    //   key: "separator",
    //   isSeparator: true,
    // },
    // available.None && {
    //   access: ShareAccessRights.None,
    //   key: "remove",
    //   label: t("Common:Remove"),
    //   icon: RemoveReactSvgUrl,
    // },
  ];

  return accessOptions.filter(
    (item): item is ItemValue<(typeof accessOptions)[number]> => Boolean(item),
  );
};

export const getRoomAccessOptions = (
  t: TTranslation,
  available: TAvailableExternalRights,
) => {
  const accessOptions = [
    available.Editing && {
      access: ShareAccessRights.Editing,
      description: t("Common:RoleEditorDescription"),
      key: "editing",
      label: t("Common:Editor"),
      icon: AccessEditReactSvgUrl,
    },
    available.Review && {
      access: ShareAccessRights.Review,
      description: t("Common:RoleReviewerDescription"),
      key: "review",
      label: t("Common:RoleReviewer"),
      icon: AccessReviewReactSvgUrl,
    },
    available.Comment && {
      access: ShareAccessRights.Comment,
      description: t("Common:RoleCommentatorDescription"),
      key: "commenting",
      label: t("Commentator"),
      icon: AccessCommentReactSvgUrl,
    },
    available.Read && {
      access: ShareAccessRights.ReadOnly,
      description: t("Common:RoleViewerDescription"),
      key: "viewing",
      label: t("Common:Viewer"),
      icon: EyeReactSvgUrl,
    },
    available.FillForms && {
      access: ShareAccessRights.FormFilling,
      description: "",
      key: "filling",
      label: t("Common:Filling"),
      icon: FillFormsReactSvgUrl,
      title: t("Common:FillingOnly"),
    },
  ];

  return accessOptions.filter(
    (item): item is ItemValue<(typeof accessOptions)[number]> => Boolean(item),
  );
};

export const getExpiredOptions = (
  t: TTranslation,
  setTwelveHours: VoidFunction,
  setOneDay: VoidFunction,
  setSevenDays: VoidFunction,
  setUnlimited: VoidFunction,
  onCalendarOpen: VoidFunction,
  locale: string,
) => {
  const relativeTime = new Intl.RelativeTimeFormat(locale, {
    numeric: "always",
    style: "long",
  });

  const oneDay = relativeTime.format(1, "day");
  const severalDays = relativeTime.format(7, "day");
  const severalHours = relativeTime.format(12, "hours");

  return [
    {
      key: "twelvehours",
      label: severalHours,
      onClick: () => setTwelveHours(),
    },
    {
      key: "oneday",
      label: oneDay,
      onClick: () => setOneDay(),
    },
    {
      key: "sevendays",
      label: severalDays,
      onClick: () => setSevenDays(),
    },
    {
      key: "unlimited",
      label: t("Common:Unlimited"),
      onClick: () => setUnlimited(),
    },
    {
      key: "custom",
      label: t("Common:Custom"),
      onClick: () => onCalendarOpen(),
    },
  ];
};

export const getDate = (expirationDate: string) => {
  if (!expirationDate) return "";

  const currentDare = moment(new Date());
  const expDate = moment(new Date(expirationDate));
  const calculatedDate = expDate.diff(currentDare, "days");

  if (calculatedDate < 1) {
    return moment
      .duration(expDate.diff(currentDare, "hours") + 1, "hours")
      .humanize();
  }

  return moment.duration(calculatedDate + 1, "days").humanize();
};

export const getPasswordDescription = (t: TFunction, link: TFileLink) => {
  return link.sharedTo.password ? (
    <>&nbsp;{t("Common:RoomShareLinkPassword")}</>
  ) : (
    ""
  );
};

export const getLinkRestrictionDescription = (
  t: TFunction,
  link: TFileLink,
) => {
  return link.sharedTo.denyDownload ? (
    <>&nbsp;{t("Common:RoomShareLinkRestrictionActivated")}</>
  ) : (
    ""
  );
};

export const getNameAccess = (access: ShareAccessRights, t: TTranslation) => {
  switch (access) {
    case ShareAccessRights.Editing:
      return t("Common:EditButton");
    case ShareAccessRights.CustomFilter:
      return t("Common:UseCustomFilter");
    case ShareAccessRights.Review:
      return t("Common:Review");
    case ShareAccessRights.Comment:
      return t("Common:Comment");
    case ShareAccessRights.ReadOnly:
      return t("Common:ReadOnly");
    case ShareAccessRights.FormFilling:
      return t("Common:FillOut");
    default:
      return "";
  }
};

export const getNameAccessRoom = (
  access: ShareAccessRights,
  t: TTranslation,
) => {
  switch (access) {
    case ShareAccessRights.Editing:
      return t("Common:EditButton");
    case ShareAccessRights.Review:
      return t("Common:Review");
    case ShareAccessRights.Comment:
      return t("Common:Comment");
    case ShareAccessRights.ReadOnly:
      return t("Common:View");
    case ShareAccessRights.FormFilling:
      return t("Common:FillOut");
    default:
      return "";
  }
};

export const getTranslationDate = (
  expirationDate: TFileLink["sharedTo"]["expirationDate"],
  t: TFunction,
) => {
  if (expirationDate) {
    const date = getDate(expirationDate);

    return (
      <Trans
        t={t}
        ns="Common"
        values={{ date }}
        i18nKey="LinkExpireAfter"
        components={{ 1: <strong key="strong-expire-after" /> }}
      />
    );
  }

  return (
    <Trans
      t={t}
      ns="Common"
      i18nKey="LinkNoExpiration"
      components={{ 1: <strong key="strong-link-valid" /> }}
    />
  );
};

export const canShowManageLink = (
  item: TFile | TFolder,
  buffer: TFile | TFolder | null,
  infoPanelVisible: boolean,
  infoPanelView: string,
): boolean => {
  if (isFolderOrRoom(item) && !item.security?.EditAccess) return false;

  if (!buffer) return true;

  const isEqual =
    item.id === buffer.id &&
    item.title === buffer.title &&
    isFolderOrRoom(item) === isFolderOrRoom(buffer);

  const view =
    (isRoom(item) && infoPanelView !== "info_members") ||
    (!isRoom(item) && infoPanelView !== "info_share");

  return !isEqual || view || !infoPanelVisible;
};

export const getAccessTypeText = (
  t: TFunction,
  item: TFile | TFolder | TRoom,
  link: TFileLink,
) => {
  const accessType = link.sharedTo.internal
    ? t("Common:SpaceUsersOnly", {
        productName: t("Common:ProductName"),
      })
    : t("Common:AnyoneWithLink");

  if (isFile(item)) {
    const accessRights = getNameAccess(link.access, t).toLocaleLowerCase();

    return (
      <Trans
        t={t}
        ns="Common"
        i18nKey="LinkAccessFile"
        values={{ accessType, accessRights }}
        components={{
          1: <strong key="strong-access-type" />,
          3: <strong key="strong-access-rights" />,
        }}
      />
    );
  }

  const accessRights = getNameAccessRoom(link.access, t).toLocaleLowerCase();

  const shareContents =
    link.access === ShareAccessRights.FormFilling
      ? t("Common:ShareForm")
      : t("Common:ShareContents");

  const shareParent = isRoom(item)
    ? t("Common:ShareTheRoom")
    : t("Common:ShareTheFolder");

  return (
    <Trans
      t={t}
      ns="Common"
      i18nKey="SharePermissionsEntityAccessScope"
      values={{ accessType, accessRights, shareContents, shareParent }}
      components={{
        1: <strong key="strong-access-type" />,
        3: <strong key="strong-access-rights" />,
      }}
    />
  );
};

export const copyShareLink = async (
  item: TFile | TFolder | TRoom,
  link: TFileLink,
  t: TFunction,
  linkOptions?: TCopyShareLinkOptions,
) => {
  await copy(link.sharedTo.shareLink);

  const { expirationDate } = link.sharedTo;

  const date = getTranslationDate(expirationDate, t);

  const access = getAccessTypeText(t, item, link);

  const password = getPasswordDescription(t, link);
  const restriction = getLinkRestrictionDescription(t, link);

  toastr.success(
    <span>
      {access}
      {password}
      {restriction}
      &nbsp;
      {date}
      {linkOptions?.canShowLink && linkOptions?.onClickLink ? (
        <>
          <strong>.</strong>
          &nbsp;
          <Link
            color={globalColors.lightBlueMain}
            isHovered
            onClick={linkOptions.onClickLink}
          >
            {t("Common:ManageNotifications")}
          </Link>
        </>
      ) : null}
    </span>,
    t("Common:LinkCopiedToClipboard"),
  );
};

export const evenPrimaryLink = (fileLinks: TFileLink[]) => {
  return fileLinks.some((link) => link?.sharedTo?.primary);
};

export const convertMembers = (
  membersList: RoomMember[],
  t: TFunction,
): TShareMembers => {
  const users: TShare[] = [];
  const administrators: TShare[] = [];
  const expected: TShare[] = [];
  const groups: TShare[] = [];
  const guests: TShare[] = [];

  membersList?.forEach(({ access, canEditAccess, sharedTo, subjectType }) => {
    const member: TShareMember = {
      access,
      canEditAccess,
      ...sharedTo,
    };

    if (
      "activationStatus" in member &&
      member.activationStatus === EmployeeActivationStatus.Pending
    ) {
      if (expected.length === 0) {
        expected.push({
          id: "expected",
          displayName: t("InfoPanel:ExpectUsers"),
          isTitle: true,
          isExpect: true,
        } satisfies TTitleShare);
      }

      member.isExpect = true;
      expected.push(member);
    } else if (
      access === ShareAccessRights.FullAccess ||
      access === ShareAccessRights.RoomManager
    ) {
      if (administrators.length === 0) {
        administrators.push({
          id: "administrators",
          displayName: t("InfoPanel:Administration"),
          isTitle: true,
        } satisfies TTitleShare);
      }

      administrators.push(member);
    } else if (
      ("isGroup" in member && member.isGroup) ||
      subjectType === MembersSubjectType.Group
    ) {
      if (groups.length === 0) {
        groups.push({
          id: "groups",
          displayName: t("Common:Groups"),
          isTitle: true,
        } satisfies TTitleShare);
      }

      groups.push({ ...member, isGroup: true });
    } else if ("isVisitor" in member && member.isVisitor) {
      if (guests.length === 0) {
        guests.push({
          id: "guests",
          displayName: t("Common:Guests"),
          isTitle: true,
        } satisfies TTitleShare);
      }

      guests.push(member);
    } else {
      if (users.length === 0) {
        users.push({
          id: "users",
          displayName: t("InfoPanel:Users"),
          isTitle: true,
        } satisfies TTitleShare);
      }

      users.push(member);
    }
  });

  return {
    administrators,
    users,
    expected,
    groups,
    guests,
  };
};

export const getShareAccessRightOptions = (
  t: TFunction,
  infoPanelSelection: TFile | TFolder,
) => {
  if (isFolder(infoPanelSelection)) {
    return [
      {
        access: ShareAccessRights.FullAccess,
        key: "full-access",
        label: t("Common:FullAccess"),
        description: t("Common:FullAccessDescription"),
      },
      {
        access: ShareAccessRights.Editing,
        key: "editor",
        label: t("Common:Editor"),
        description: t("Common:EditorDescription"),
      },
      {
        access: ShareAccessRights.Review,
        key: "review",
        label: t("Common:Review"),
        description: t("Common:RoleReviewerDescription"),
      },

      {
        access: ShareAccessRights.Comment,
        key: "commenting",
        label: t("Common:Comment"),
        description: t("Common:RoleCommentatorDescription"),
      },
      {
        access: ShareAccessRights.ReadOnly,
        key: "viewing",
        label: t("Common:RoleViewer"),
        description: t("Common:RoleViewerDescription"),
      },
      {
        key: "separator",
        isSeparator: true,
        label: "",
      },
      {
        access: ShareAccessRights.None,
        key: "remove",
        label: t("Common:Remove"),
      },
    ];
  }

  const accessOptions = [
    {
      access: ShareAccessRights.Editing,
      key: "editing",
      label: t("Common:Editing"),
    },
    {
      access: ShareAccessRights.CustomFilter,
      key: "custom-filter",
      label: t("Common:CustomFilter"),
    },
    {
      access: ShareAccessRights.Review,
      key: "review",
      label: t("Common:Review"),
    },
    {
      access: ShareAccessRights.Comment,
      key: "commenting",
      label: t("Common:Comment"),
    },
    {
      access: ShareAccessRights.ReadOnly,
      key: "viewing",
      label: t("Common:ReadOnly"),
      title: t("Common:ReadOnly"),
    },
    {
      access: ShareAccessRights.FormFilling,
      key: "filling",
      label: t("Common:Filling"),
    },
    {
      key: "separator",
      isSeparator: true,
      label: "",
    },
    {
      access: ShareAccessRights.None,
      key: "remove",
      label: t("Common:Remove"),
    },
  ];

  return accessOptions;
};
