import AccessEditReactSvgUrl from "PUBLIC_DIR/images/access.edit.react.svg?url";
import CustomFilterReactSvgUrl from "PUBLIC_DIR/images/custom.filter.react.svg?url";
import AccessCommentReactSvgUrl from "PUBLIC_DIR/images/access.comment.react.svg?url";
import EyeReactSvgUrl from "PUBLIC_DIR/images/eye.react.svg?url";
import EyeOffReactSvgUrl from "PUBLIC_DIR/images/eye.off.react.svg?url";
import RemoveReactSvgUrl from "PUBLIC_DIR/images/remove.react.svg?url";
import { ShareAccessRights } from "@docspace/common/constants";

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

export const getAccessOptions = (t) => {
  return [
    {
      access: ShareAccessRights.Editing,
      key: "editing",
      label: t("Editing"),
      icon: AccessEditReactSvgUrl,
    },
    {
      access: ShareAccessRights.CustomFilter,
      key: "custom-filter",
      label: t("CustomFilter"),
      icon: CustomFilterReactSvgUrl,
    },
    {
      access: ShareAccessRights.Comment,
      key: "commenting",
      label: t("Comment"),
      icon: AccessCommentReactSvgUrl,
    },
    {
      access: ShareAccessRights.ReadOnly,
      key: "viewing",
      label: t("ReadOnly"),
      icon: EyeReactSvgUrl,
    },
    {
      access: ShareAccessRights.DenyAccess,
      key: "deny-access",
      label: t("DenyAccess"),
      icon: EyeOffReactSvgUrl,
    },
    {
      key: "separator",
      isSeparator: true,
    },
    {
      access: ShareAccessRights.None,
      key: "remove",
      label: t("Translations:Remove"),
      icon: RemoveReactSvgUrl,
    },
  ];
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
