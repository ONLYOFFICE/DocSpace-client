import AccessEditReactSvgUrl from "PUBLIC_DIR/images/access.edit.react.svg?url";
import AccessReviewReactSvgUrl from "PUBLIC_DIR/images/access.review.react.svg?url";
import CustomFilterReactSvgUrl from "PUBLIC_DIR/images/custom.filter.react.svg?url";
import AccessCommentReactSvgUrl from "PUBLIC_DIR/images/access.comment.react.svg?url";
import EyeReactSvgUrl from "PUBLIC_DIR/images/eye.react.svg?url";
import EyeOffReactSvgUrl from "PUBLIC_DIR/images/eye.off.react.svg?url";
import RemoveReactSvgUrl from "PUBLIC_DIR/images/remove.react.svg?url";

import { ShareAccessRights } from "../../enums";
import { TTranslation } from "../../types";
import { TAvailableExternalRights } from "../../api/files/types";
import { TOption } from "../combobox";

export const getShareOptions = (t: TTranslation) => {
  return [
    {
      internal: false,
      key: "anyone",
      label: t("Common:AnyoneWithLink"),
    },
    {
      internal: true,
      key: "users",
      label: t("Common:SpaceUsersOnly"),
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
    available.Restrict && {
      access: ShareAccessRights.DenyAccess,
      key: "deny-access",
      label: t("Common:DenyAccess"),
      icon: EyeOffReactSvgUrl,
    },
    {
      key: "separator",
      isSeparator: true,
    },
    available.None && {
      access: ShareAccessRights.None,
      key: "remove",
      label: t("Common:Remove"),
      icon: RemoveReactSvgUrl,
    },
  ];

  const items: TOption[] = [];

  accessOptions.forEach((item) => {
    if (item) return items.push(item as TOption);
  });

  return items;
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
