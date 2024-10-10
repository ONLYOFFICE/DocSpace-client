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
import moment from "moment";
import { Trans } from "react-i18next";

import equal from "fast-deep-equal/react";

import AccessEditReactSvgUrl from "PUBLIC_DIR/images/access.edit.react.svg?url";
import AccessReviewReactSvgUrl from "PUBLIC_DIR/images/access.review.react.svg?url";
import CustomFilterReactSvgUrl from "PUBLIC_DIR/images/custom.filter.react.svg?url";
import AccessCommentReactSvgUrl from "PUBLIC_DIR/images/access.comment.react.svg?url";
import EyeReactSvgUrl from "PUBLIC_DIR/images/eye.react.svg?url";
// import EyeOffReactSvgUrl from "PUBLIC_DIR/images/eye.off.react.svg?url";
// import RemoveReactSvgUrl from "PUBLIC_DIR/images/remove.react.svg?url";

import { Link } from "../link";
import { toastr } from "../toast";
import { globalColors } from "../../themes";
import { ShareAccessRights } from "../../enums";
import { copyShareLink as copy } from "../../utils/copy";

import type { TTranslation } from "../../types";
import type {
  TAvailableExternalRights,
  TFile,
  TFileLink,
} from "../../api/files/types";
import type { TOption } from "../combobox";
import { Strong } from "./Share.styled";

export const getShareOptions = (
  t: TTranslation,
  available: TAvailableExternalRights | undefined,
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
    available?.None && {
      key: "separator",
      isSeparator: true,
    },
    available?.None && {
      key: "remove",
      internal: true,
      access: ShareAccessRights.None,
      label: t("Common:Remove"),
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

  const items: TOption[] = [];

  accessOptions.forEach((item) => {
    if (item) return items.push(item as TOption);
  });

  return items;
};

export const getRoomAccessOptions = (t: TTranslation) => {
  return [
    {
      access: ShareAccessRights.Editing,
      description: t("Translations:RoleEditorDescription"),
      key: "editing",
      label: t("Common:Editor"),
      icon: AccessEditReactSvgUrl,
    },
    {
      access: ShareAccessRights.Review,
      description: t("Translations:RoleReviewerDescription"),
      key: "review",
      label: t("Translations:RoleReviewer"),
      icon: AccessReviewReactSvgUrl,
    },
    {
      access: ShareAccessRights.Comment,
      description: t("Translations:RoleCommentatorDescription"),
      key: "commenting",
      label: t("Commentator"),
      icon: AccessCommentReactSvgUrl,
    },
    {
      access: ShareAccessRights.ReadOnly,
      description: t("Translations:RoleViewerDescription"),
      key: "viewing",
      label: t("JavascriptSdk:Viewer"),
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
) => {
  return [
    {
      key: "twelvehours",
      label: `12 ${t("Common:Hours")}`,
      onClick: () => setTwelveHours(),
    },
    {
      key: "oneday",
      label: `1 ${t("Common:Day")}`,
      onClick: () => setOneDay(),
    },
    {
      key: "sevendays",
      label: `7 ${t("Common:Days")}`,
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

export const getDate = (expirationDate: moment.Moment) => {
  if (!expirationDate) return "";

  const currentDare = moment(new Date());
  const expDate = moment(new Date(expirationDate as unknown as string));
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
    default:
      return "";
  }
};

export const getTranslationDate = (
  expirationDate: TFileLink["sharedTo"]["expirationDate"],
  t: TTranslation,
) => {
  if (expirationDate) {
    const date = getDate(expirationDate);

    return (
      <Trans
        t={t}
        i18nKey="LinkExpireAfter"
        ns="Common"
        values={{ date }}
        components={{ 1: <strong /> }}
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
      components={{ 1: <strong /> }}
    />
  );
};

export const canShowManageLink = (
  item: TFile,
  buffer: TFile,
  infoPanelVisible: boolean,
  infoPanelView: string,
) => {
  const isEqual = equal(item, buffer);

  return !isEqual || infoPanelView !== "info_share" || !infoPanelVisible;
};

export const copyDocumentShareLink = (
  link: TFileLink,
  t: TTranslation,
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
      components={{ 1: <Strong /> }}
    />
  ) : (
    <Trans
      t={t}
      ns="Common"
      i18nKey="ShareLinkTitle"
      values={{ access }}
      components={{ 1: <Strong /> }}
    />
  );
  const date = getTranslationDate(expirationDate, t);

  toastr.success(
    <span>
      {head} {date}
      <Strong>.</Strong>
      {linkOptions?.canShowLink && linkOptions?.onClickLink && (
        <>
          &nbsp;
          <Link
            color={globalColors.lightBlueMain}
            isHovered
            onClick={linkOptions.onClickLink}
          >
            {t("Notifications:ManageNotifications")}
          </Link>
        </>
      )}
    </span>,
    t("Common:LinkCopiedToClipboard"),
  );
};