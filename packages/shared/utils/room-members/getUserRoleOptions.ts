import { ShareAccessRights } from "../../enums";
import { TTranslation } from "../../types";

export const getUserRoleOptions = (t: TTranslation) => ({
  docSpaceAdmin: {
    key: "owner",
    label: t("Common:Owner"),
    access: ShareAccessRights.FullAccess,
    type: "admin",
  },
  roomAdmin: {
    key: "roomAdmin",
    label: t("Common:RoomAdmin"),
    access: ShareAccessRights.RoomManager,
    type: "manager",
  },
  collaborator: {
    key: "collaborator",
    label: t("Common:PowerUser"),
    access: ShareAccessRights.Collaborator,
    type: "collaborator",
  },
  viewer: {
    key: "viewer",
    label: t("Translations:RoleViewer"),
    access: ShareAccessRights.ReadOnly,
    type: "user",
  },
  editor: {
    key: "editor",
    label: t("Translations:RoleEditor"),
    access: ShareAccessRights.Editing,
    type: "user",
  },
  formFiller: {
    key: "formFiller",
    label: t("Translations:RoleFormFiller"),
    access: ShareAccessRights.FormFilling,
    type: "user",
  },
  reviewer: {
    key: "reviewer",
    label: t("Translations:RoleReviewer"),
    access: ShareAccessRights.Review,
    type: "user",
  },
  commentator: {
    key: "commentator",
    label: t("Translations:RoleCommentator"),
    access: ShareAccessRights.Comment,
    type: "user",
  },
});
