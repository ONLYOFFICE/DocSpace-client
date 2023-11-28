import AccessEditReactSvgUrl from "PUBLIC_DIR/images/access.edit.react.svg?url";
import CustomFilterReactSvgUrl from "PUBLIC_DIR/images/custom.filter.react.svg?url";
import AccessCommentReactSvgUrl from "PUBLIC_DIR/images/access.comment.react.svg?url";
import EyeReactSvgUrl from "PUBLIC_DIR/images/eye.react.svg?url";
import EyeOffReactSvgUrl from "PUBLIC_DIR/images/eye.off.react.svg?url";
import RemoveReactSvgUrl from "PUBLIC_DIR/images/remove.react.svg?url";

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
      access: 10,
      key: "editing",
      label: "Editing",
      icon: AccessEditReactSvgUrl,
    },
    {
      access: 8,
      key: "custom-filter",
      label: "Custom filter",
      icon: CustomFilterReactSvgUrl,
    },
    {
      access: 6,
      key: "commenting",
      label: "Commenting",
      icon: AccessCommentReactSvgUrl,
    },
    {
      access: 2,
      key: "viewing",
      label: "Viewing",
      icon: EyeReactSvgUrl,
    },
    {
      access: 3,
      key: "deny-access",
      label: "Deny access",
      icon: EyeOffReactSvgUrl,
    },
    {
      key: "separator",
      isSeparator: true,
    },
    {
      access: 0,
      key: "remove",
      label: "Remove",
      icon: RemoveReactSvgUrl,
    },
  ];
};

export const getExpiredOptions = (t) => {
  return [
    { key: "halfday", label: t("Common:TwelveHours") },
    { key: "oneday", label: t("Common:OneDay") },
    { key: "sevendays", label: t("Common:SevenDays") },
    { key: "unlimited", label: t("Common:Unlimited") },
    { key: "custom", label: t("Settings:Custom") },
  ];
};
