import AccessEditReactSvgUrl from "PUBLIC_DIR/images/access.edit.react.svg?url";
import AccessReviewReactSvgUrl from "PUBLIC_DIR/images/access.review.react.svg?url";
import CustomFilterReactSvgUrl from "PUBLIC_DIR/images/custom.filter.react.svg?url";
import AccessCommentReactSvgUrl from "PUBLIC_DIR/images/access.comment.react.svg?url";
import EyeReactSvgUrl from "PUBLIC_DIR/images/eye.react.svg?url";
import EyeOffReactSvgUrl from "PUBLIC_DIR/images/eye.off.react.svg?url";
import RemoveReactSvgUrl from "PUBLIC_DIR/images/remove.react.svg?url";
import { ShareAccessRights } from "@docspace/shared/enums";

export const getShareOptions = (t) => {
  return [
    {
      internal: false,
      key: "anyone",
      label: t("AnyoneWithLink"),
    },
    {
      internal: true,
      key: "users",
      label: t("DoсSpaceUsersOnly"),
    },
  ];
};

export const getAccessOptions = (t, available) => {
  const accessOptions = [
    available.Editing && {
      access: ShareAccessRights.Editing,
      key: "editing",
      label: t("Editing"),
      icon: AccessEditReactSvgUrl,
    },
    available.CustomFilter && {
      access: ShareAccessRights.CustomFilter,
      key: "custom-filter",
      label: t("CustomFilter"),
      icon: CustomFilterReactSvgUrl,
    },
    available.Comment && {
      access: ShareAccessRights.Comment,
      key: "commenting",
      label: t("Comment"),
      icon: AccessCommentReactSvgUrl,
    },
    available.Read && {
      access: ShareAccessRights.ReadOnly,
      key: "viewing",
      label: t("ReadOnly"),
      icon: EyeReactSvgUrl,
    },
    available.Restrict && {
      access: ShareAccessRights.DenyAccess,
      key: "deny-access",
      label: t("DenyAccess"),
      icon: EyeOffReactSvgUrl,
    },
    available.Review && {
      access: ShareAccessRights.Review,
      key: "review",
      label: t("Common:Review"),
      icon: AccessReviewReactSvgUrl,
    },
    {
      key: "separator",
      isSeparator: true,
    },
    available.None && {
      access: ShareAccessRights.None,
      key: "remove",
      label: t("Translations:Remove"),
      icon: RemoveReactSvgUrl,
    },
  ];

  return accessOptions.filter((item) => item.key);
};

export const getExpiredOptions = (
  t,
  setTwelveHours,
  setOneDay,
  setSevenDays,
  setUnlimited,
  onCalendarOpen
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
      label: t("Settings:Custom"),
      onClick: () => onCalendarOpen(),
    },
  ];
};
