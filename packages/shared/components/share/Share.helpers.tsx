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
import isUndefined from "lodash/isUndefined";
import isNull from "lodash/isNull";
import type { TFunction } from "i18next";

import AccessEditReactSvgUrl from "PUBLIC_DIR/images/access.edit.react.svg?url";
import AccessReviewReactSvgUrl from "PUBLIC_DIR/images/access.review.react.svg?url";
import CustomFilterReactSvgUrl from "PUBLIC_DIR/images/custom.filter.react.svg?url";
import AccessCommentReactSvgUrl from "PUBLIC_DIR/images/access.comment.react.svg?url";
import EyeReactSvgUrl from "PUBLIC_DIR/images/eye.react.svg?url";
import FillFormsReactSvgUrl from "PUBLIC_DIR/images/access.edit.form.react.svg?url";
// import EyeOffReactSvgUrl from "PUBLIC_DIR/images/eye.off.react.svg?url";
// import RemoveReactSvgUrl from "PUBLIC_DIR/images/remove.react.svg?url";

import { globalColors } from "../../themes";
import { FileType, ShareAccessRights } from "../../enums";
import { copyShareLink as copy } from "../../utils/copy";
import { isFolderOrRoom } from "../../utils/typeGuards";

import type { TTranslation } from "../../types";
import type {
  TAvailableExternalRights,
  TFile,
  TFileLink,
  TFolder,
} from "../../api/files/types";

import { Link } from "../link";
import { toastr } from "../toast";

export const getShareOptions = (
  t: TTranslation,
  // available: TAvailableExternalRights | undefined,
) => {
  return [
    {
      internal: false,
      key: "anyone",
      label: t("Common:AnyoneWithLink"),
    },
    {
      internal: true,
      key: "users",
      label: t("Common:SpaceUsersOnly", {
        productName: t("Common:ProductName"),
      }),
    },
  ];
};

export const getAccessOptions = (
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

  type ItemValue<T> = T extends false ? never : T;

  return accessOptions.filter(
    (item): item is ItemValue<(typeof accessOptions)[number]> => Boolean(item),
  );
};

export const getRoomAccessOptions = (t: TTranslation) => {
  return [
    {
      access: ShareAccessRights.Editing,
      description: t("Common:RoleEditorDescription"),
      key: "editing",
      label: t("Common:Editor"),
      icon: AccessEditReactSvgUrl,
    },
    {
      access: ShareAccessRights.Review,
      description: t("Common:RoleReviewerDescription"),
      key: "review",
      label: t("Common:RoleReviewer"),
      icon: AccessReviewReactSvgUrl,
    },
    {
      access: ShareAccessRights.Comment,
      description: t("Common:RoleCommentatorDescription"),
      key: "commenting",
      label: t("Commentator"),
      icon: AccessCommentReactSvgUrl,
    },
    {
      access: ShareAccessRights.ReadOnly,
      description: t("Common:RoleViewerDescription"),
      key: "viewing",
      label: t("Common:Viewer"),
      icon: EyeReactSvgUrl,
    },
  ];
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

export const getNameAccess = (access: ShareAccessRights, t: TTranslation) => {
  switch (access) {
    case ShareAccessRights.Editing:
      return t("Common:Editing");
    case ShareAccessRights.CustomFilter:
      return t("Common:CustomFilter");
    case ShareAccessRights.Review:
      return t("Common:Review");
    case ShareAccessRights.Comment:
      return t("Common:Comment");
    case ShareAccessRights.ReadOnly:
      return t("Common:ReadOnly");
    case ShareAccessRights.FormFilling:
      return t("Common:FillInOut");
    default:
      return "";
  }
};

export const getRoleNameByAccessRight = (
  access: ShareAccessRights,
  t: TTranslation,
) => {
  switch (access) {
    case ShareAccessRights.Editing:
      return t("Common:Editor");
    case ShareAccessRights.Review:
      return t("Common:RoleReviewer");
    case ShareAccessRights.Comment:
      return t("Common:Commentator");
    case ShareAccessRights.ReadOnly:
      return t("Common:Viewer");
    case ShareAccessRights.FormFilling:
      return t("Common:RoleFormFiller");
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
        i18nKey="LinkExpireAfter"
        ns="Common"
        values={{ date }}
        components={{ 1: <strong key="strong-expire-after" /> }}
      />
    );
  }
  const date = t("Common:Unlimited").toLowerCase();
  return (
    <Trans
      t={t}
      i18nKey="LinkIsValid"
      ns="Common"
      values={{ date }}
      components={{ 1: <strong key="strong-link-valid" /> }}
    />
  );
};

export const canShowManageLink = (
  item: TFile | TFolder,
  buffer: TFile | TFolder | null,
  infoPanelVisible: boolean,
  infoPanelView: string,
  isRoom: boolean = false,
): boolean => {
  if (isFolderOrRoom(item) && !item.security.EditAccess) return false;

  if (!buffer) return true;

  const isEqual =
    item.id === buffer.id &&
    item.title === buffer.title &&
    isFolderOrRoom(item) === isFolderOrRoom(buffer);

  const view =
    (isRoom && infoPanelView !== "info_members") ||
    (!isRoom && infoPanelView !== "info_share");

  return !isEqual || view || !infoPanelVisible;
};

export const copyRoomShareLink = (
  link: TFileLink,
  t: TFunction,
  withCopy = true,
  linkOptions?: {
    canShowLink: boolean;
    onClickLink: VoidFunction;
  },
) => {
  const { password, shareLink, expirationDate, denyDownload } = link.sharedTo;
  const hasPassword = Boolean(password);
  const role = getRoleNameByAccessRight(link.access, t).toLowerCase(); //

  if (!role) return;
  if (withCopy) copy(shareLink);

  const roleText = (
    <Trans
      t={t}
      ns="Common"
      i18nKey="RoomShareLinkRole"
      values={{ role }}
      components={{ 1: <strong key="strong-role" /> }}
    />
  );

  const passwordText = hasPassword ? t("Common:RoomShareLinkPassword") : "";
  const restrictionText = denyDownload
    ? t("Common:RoomShareLinkRestrictionActivated")
    : "";

  const date = expirationDate ? (
    <Trans
      t={t}
      ns="Common"
      i18nKey="LinkIsValid"
      values={{ date: moment(expirationDate).format("lll") }}
      components={{ 1: <strong key="strong-date" /> }}
    />
  ) : null;

  toastr.success(
    <span>
      {roleText} {passwordText} {restrictionText} {date}
      {date ? <strong>.</strong> : null}
      {linkOptions?.canShowLink && linkOptions?.onClickLink ? (
        <Link
          color={globalColors.lightBlueMain}
          isHovered
          onClick={linkOptions.onClickLink}
        >
          {t("Common:ManageNotifications")}
        </Link>
      ) : null}
    </span>,
  );
};

export const copyDocumentShareLink = (
  link: TFileLink,
  t: TFunction,
  linkOptions?: {
    canShowLink: boolean;
    onClickLink: VoidFunction;
  },
) => {
  const { internal, expirationDate, shareLink } = link.sharedTo;

  const access = getNameAccess(link.access, t).toLowerCase();

  copy(shareLink);

  const head = internal ? (
    <Trans
      t={t}
      ns="Common"
      i18nKey="ShareLinkTitleInternal"
      values={{ productName: t("Common:ProductName"), access }}
      components={{ 1: <strong key="strong-internal" /> }}
    />
  ) : (
    <Trans
      t={t}
      ns="Common"
      i18nKey="ShareLinkTitle"
      values={{ access }}
      components={{ 1: <strong key="strong-external" /> }}
    />
  );
  const date = getTranslationDate(expirationDate, t);

  toastr.success(
    <span>
      {head} {date}
      <strong>.</strong>
      {linkOptions?.canShowLink && linkOptions?.onClickLink ? (
        <>
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

export const getExpirationDate = (
  diffExpiredDate: number | null | undefined,
) => {
  if (isUndefined(diffExpiredDate)) return moment().add(7, "days");

  if (isNull(diffExpiredDate)) return moment(diffExpiredDate);

  return moment().add(diffExpiredDate);
};

export const getCreateShareLinkKey = (userId: string, fileType?: FileType) => {
  return `link-create-document-${fileType ?? ""}-${userId}`;
};

export const evenPrimaryLink = (fileLinks: TFileLink[]) => {
  return fileLinks.map((link) => link?.sharedTo?.primary).includes(true);
};

export const DEFAULT_CREATE_LINK_SETTINGS = {
  access: ShareAccessRights.ReadOnly,
  internal: false,
  diffExpirationDate: null,
};
